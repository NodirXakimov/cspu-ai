import type { Chat, ChatAttachment, ChatMessage, ServerMessage, Session } from '@/types/chat'
import type { FileUIPart } from 'ai'
import { useLocalStorage } from '@vueuse/core'
import { nanoid } from 'nanoid'
import { computed, ref } from 'vue'
import { askVoice, createSession, deleteSession, getSession, listSessions, streamAsk } from '@/lib/api'

function sessionToChat(s: Session, messages: ChatMessage[] = []): Chat {
  return {
    id: s.id,
    title: s.title,
    messages,
    createdAt: new Date(s.created_at).getTime(),
    updatedAt: new Date(s.updated_at).getTime(),
  }
}

function serverMessageToChatMessage(m: ServerMessage): ChatMessage {
  return {
    id: m.id,
    role: m.role,
    content: m.content,
    type: 'text',
    timestamp: new Date(m.created_at).getTime(),
  }
}

function deriveTitle(content: string): string {
  const trimmed = content.trim()
  if (!trimmed) return 'Yangi suhbat'
  return trimmed.length > 40 ? `${trimmed.slice(0, 40)}...` : trimmed
}

// Module-level singleton state — keeps composable instances in sync.
const chats = ref<Chat[]>([])
const activeChatId = useLocalStorage<string | null>('cspu-ai-active-chat', null)
const isStreaming = ref(false)
const isLoadingChats = ref(false)
const isLoadingMessages = ref(false)
const loadedSessionIds = new Set<string>()

let initialized = false

async function fetchSessions() {
  isLoadingChats.value = true
  try {
    const sessions = await listSessions()
    const existingById = new Map(chats.value.map(c => [c.id, c]))
    chats.value = sessions.map(s =>
      sessionToChat(s, existingById.get(s.id)?.messages ?? []),
    )
  } catch (err) {
    console.error('Failed to load sessions', err)
  } finally {
    isLoadingChats.value = false
  }
}

async function fetchMessages(sessionId: string) {
  if (loadedSessionIds.has(sessionId)) return
  isLoadingMessages.value = true
  try {
    const data = await getSession(sessionId)
    const chat = chats.value.find(c => c.id === sessionId)
    if (chat) {
      chat.messages = (data.messages ?? []).map(serverMessageToChatMessage)
      chat.title = data.session.title
      chat.updatedAt = new Date(data.session.updated_at).getTime()
      chats.value = [...chats.value]
    }
    loadedSessionIds.add(sessionId)
  } catch (err) {
    console.error('Failed to load messages', err)
  } finally {
    isLoadingMessages.value = false
  }
}

export function useChats() {
  const sortedChats = computed(() =>
    [...chats.value].sort((a, b) => b.updatedAt - a.updatedAt),
  )

  const activeChat = computed(() =>
    chats.value.find(c => c.id === activeChatId.value) ?? null,
  )

  function newChat() {
    // Defer actual session creation until the user sends the first message,
    // so we can use that message as the title.
    activeChatId.value = null
  }

  async function deleteChat(id: string): Promise<boolean> {
    // Optimistic UI: drop locally first, then call the server.
    const previous = chats.value
    const previousActive = activeChatId.value
    chats.value = chats.value.filter(c => c.id !== id)
    loadedSessionIds.delete(id)
    if (activeChatId.value === id) {
      activeChatId.value = chats.value[0]?.id ?? null
    }
    try {
      await deleteSession(id)
      return true
    } catch (err) {
      console.error('Failed to delete session', err)
      // Roll back the optimistic removal so the user can retry.
      chats.value = previous
      activeChatId.value = previousActive
      return false
    }
  }

  async function setActiveChat(id: string) {
    activeChatId.value = id
    await fetchMessages(id)
  }

  function appendMessage(chatId: string, message: ChatMessage) {
    const chat = chats.value.find(c => c.id === chatId)
    if (!chat) return
    chat.messages.push(message)
    chat.updatedAt = Date.now()
    chats.value = [...chats.value]
  }

  function updateMessageContent(chatId: string, messageId: string, content: string) {
    const chat = chats.value.find(c => c.id === chatId)
    if (!chat) return
    const msg = chat.messages.find(m => m.id === messageId)
    if (!msg) return
    msg.content = content
    chats.value = [...chats.value]
  }

  async function sendMessage(content: string, files: FileUIPart[] = []) {
    const attachments: ChatAttachment[] = files.map(f => ({
      url: f.url ?? '',
      filename: f.filename ?? 'fayl',
      mediaType: f.mediaType ?? 'application/octet-stream',
    }))

    const hasImages = attachments.some(a => a.mediaType.startsWith('image/'))
    const messageType: ChatMessage['type'] = hasImages
      ? 'image'
      : attachments.length > 0
        ? 'file'
        : 'text'

    const userContent =
      content || (attachments.length > 0 ? `${attachments.length} ta fayl yuborildi` : '')

    if (!userContent) return

    // Create a server session on demand (first message of a new chat).
    let chatId = activeChatId.value
    if (!chatId) {
      try {
        const session = await createSession(deriveTitle(userContent))
        const chat = sessionToChat(session, [])
        chats.value = [chat, ...chats.value]
        chatId = session.id
        activeChatId.value = chatId
        loadedSessionIds.add(chatId)
      } catch (err) {
        console.error('Failed to create session', err)
        return
      }
    }

    appendMessage(chatId, {
      id: nanoid(),
      role: 'user',
      content: userContent,
      type: messageType,
      timestamp: Date.now(),
      attachments: attachments.length > 0 ? attachments : undefined,
    })

    const assistantId = nanoid()
    appendMessage(chatId, {
      id: assistantId,
      role: 'assistant',
      content: '',
      type: 'text',
      timestamp: Date.now(),
    })

    isStreaming.value = true
    let streamedContent = ''
    let finished = false

    const processLine = (line: string): boolean => {
      const trimmed = line.trim()
      if (!trimmed) return false
      const payload = trimmed.startsWith('data:') ? trimmed.slice(5).trim() : trimmed
      if (!payload) return false

      // Common end-of-stream sentinel ("[DONE]", "DONE", etc.)
      if (payload === '[DONE]' || payload.toUpperCase() === 'DONE') return true

      if (!payload.startsWith('{')) return false
      try {
        const chunk = JSON.parse(payload)
        if (typeof chunk.content === 'string') {
          streamedContent += chunk.content
          updateMessageContent(chatId!, assistantId, streamedContent)
        }
        // Honor any explicit completion flag from the server.
        if (chunk.done === true || chunk.finished === true || chunk.event === 'done') {
          return true
        }
      } catch {
        // skip unparseable lines
      }
      return false
    }

    try {
      const response = await streamAsk(chatId, userContent)
      if (!response.ok || !response.body) {
        updateMessageContent(
          chatId,
          assistantId,
          "Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.",
        )
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (!finished) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (processLine(line)) {
            finished = true
            break
          }
        }
      }
      if (!finished && buffer.trim()) processLine(buffer)

      // Close the reader so the underlying connection releases even if the
      // server keeps the stream open after sending its final chunk.
      try {
        await reader.cancel()
      } catch {
        /* ignore */
      }
    } catch (err) {
      console.error('Stream failed', err)
      updateMessageContent(
        chatId,
        assistantId,
        streamedContent || "Tarmoq xatoligi. Iltimos, internet aloqangizni tekshiring.",
      )
    } finally {
      isStreaming.value = false
    }
  }

  async function sendVoiceMessage(blob: Blob, filename = 'recording.webm') {
    isStreaming.value = true
    try {
      const { question, answer } = await askVoice(blob, filename)

      let chatId = activeChatId.value
      if (!chatId) {
        try {
          const session = await createSession(deriveTitle(question))
          const chat = sessionToChat(session, [])
          chats.value = [chat, ...chats.value]
          chatId = session.id
          activeChatId.value = chatId
          loadedSessionIds.add(chatId)
        } catch (err) {
          console.error('Failed to create session for voice', err)
          return
        }
      }

      appendMessage(chatId, {
        id: nanoid(),
        role: 'user',
        content: question,
        type: 'audio',
        timestamp: Date.now(),
      })

      appendMessage(chatId, {
        id: nanoid(),
        role: 'assistant',
        content: answer,
        type: 'text',
        timestamp: Date.now(),
      })
    } catch (err) {
      console.error('Voice ask failed', err)
      // Surface error in current chat if there is one.
      const chatId = activeChatId.value
      if (chatId) {
        appendMessage(chatId, {
          id: nanoid(),
          role: 'assistant',
          content: "Ovozli savolni qayta ishlashda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.",
          type: 'text',
          timestamp: Date.now(),
        })
      }
    } finally {
      isStreaming.value = false
    }
  }

  if (!initialized) {
    initialized = true
    fetchSessions().then(() => {
      // If active chat was persisted, hydrate its messages.
      if (activeChatId.value && chats.value.some(c => c.id === activeChatId.value)) {
        fetchMessages(activeChatId.value)
      } else if (activeChatId.value) {
        // Stale id from a chat that no longer exists on the server.
        activeChatId.value = null
      }
    })
  }

  return {
    chats: sortedChats,
    activeChat,
    activeChatId,
    isStreaming,
    isLoadingChats,
    isLoadingMessages,
    createChat: newChat,
    deleteChat,
    setActiveChat,
    sendMessage,
    sendVoiceMessage,
    refreshSessions: fetchSessions,
  }
}
