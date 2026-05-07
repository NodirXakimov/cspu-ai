import type { Chat, ChatAttachment, ChatMessage } from '@/types/chat'
import type { FileUIPart } from 'ai'
import { useLocalStorage } from '@vueuse/core'
import { nanoid } from 'nanoid'
import { computed, ref } from 'vue'

const API_URL = import.meta.env.DEV
  ? '/api/ask/stream'
  : 'https://e0f0-84-54-115-138.ngrok-free.app/api/ask/stream'

export function useChats() {
  const chats = useLocalStorage<Chat[]>('cspu-ai-chats', [])
  const activeChatId = useLocalStorage<string | null>('cspu-ai-active-chat', null)

  const activeChat = computed(() =>
    chats.value.find(c => c.id === activeChatId.value) ?? null
  )

  const sortedChats = computed(() =>
    [...chats.value].sort((a, b) => b.updatedAt - a.updatedAt)
  )

  function createChat(): Chat {
    const chat: Chat = {
      id: nanoid(),
      title: 'Yangi suhbat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    chats.value = [chat, ...chats.value]
    activeChatId.value = chat.id
    return chat
  }

  function deleteChat(id: string) {
    chats.value = chats.value.filter(c => c.id !== id)
    if (activeChatId.value === id) {
      activeChatId.value = chats.value[0]?.id ?? null
    }
  }

  function setActiveChat(id: string) {
    activeChatId.value = id
  }

  function addMessage(chatId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) {
    const chat = chats.value.find(c => c.id === chatId)
    if (!chat) return

    const newMessage: ChatMessage = {
      ...message,
      id: nanoid(),
      timestamp: Date.now(),
    }
    chat.messages.push(newMessage)
    chat.updatedAt = Date.now()

    // Auto-generate title from first user message
    if (message.role === 'user' && chat.messages.filter(m => m.role === 'user').length === 1) {
      chat.title = message.content.slice(0, 40) + (message.content.length > 40 ? '...' : '')
    }

    // Trigger reactivity
    chats.value = [...chats.value]
  }

  const isStreaming = ref(false)

  async function sendMessage(content: string, files: FileUIPart[] = []) {
    let chatId = activeChatId.value
    if (!chatId) {
      const chat = createChat()
      chatId = chat.id
    }

    const attachments: ChatAttachment[] = files.map(f => ({
      url: f.url ?? '',
      filename: f.filename ?? 'fayl',
      mediaType: f.mediaType ?? 'application/octet-stream',
    }))

    const hasImages = attachments.some(a => a.mediaType.startsWith('image/'))
    const messageType = hasImages ? 'image' as const : attachments.length > 0 ? 'file' as const : 'text' as const

    const userContent = content || (attachments.length > 0 ? `${attachments.length} ta fayl yuborildi` : '')

    addMessage(chatId, {
      role: 'user',
      content: userContent,
      type: messageType,
      attachments: attachments.length > 0 ? attachments : undefined,
    })

    const assistantMsgId = nanoid()
    let streamedContent = ''

    const chat = chats.value.find(c => c.id === chatId)
    if (!chat) return

    chat.messages.push({
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      type: 'text',
      timestamp: Date.now(),
    })
    chat.updatedAt = Date.now()
    chats.value = [...chats.value]

    isStreaming.value = true

    function updateAssistantMessage(content: string) {
      const c = chats.value.find(c => c.id === chatId)
      if (!c) return
      const msg = c.messages.find(m => m.id === assistantMsgId)
      if (!msg) return
      msg.content = content
      chats.value = [...chats.value]
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userContent }),
      })

      if (!response.ok) {
        updateAssistantMessage('Xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.')
        return
      }

      const reader = response.body?.getReader()
      if (!reader) return

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed) continue

          // SSE format: extract JSON from "data: {...}" lines
          const dataPayload = trimmed.startsWith('data:')
            ? trimmed.slice(5).trim()
            : trimmed

          if (!dataPayload.startsWith('{')) continue

          try {
            const chunk = JSON.parse(dataPayload)
            if (chunk.content) {
              streamedContent += chunk.content
              updateAssistantMessage(streamedContent)
            }
          } catch {
            // Skip unparseable lines
          }
        }
      }

      // Process remaining buffer
      const remaining = buffer.trim()
      if (remaining) {
        const dataPayload = remaining.startsWith('data:')
          ? remaining.slice(5).trim()
          : remaining
        if (dataPayload.startsWith('{')) {
          try {
            const chunk = JSON.parse(dataPayload)
            if (chunk.content) {
              streamedContent += chunk.content
              updateAssistantMessage(streamedContent)
            }
          } catch {
            // Skip
          }
        }
      }
    } catch (error) {
      updateAssistantMessage(streamedContent || 'Tarmoq xatoligi. Iltimos, internet aloqangizni tekshiring.')
    } finally {
      isStreaming.value = false
    }
  }

  return {
    chats: sortedChats,
    activeChat,
    activeChatId,
    isStreaming,
    createChat,
    deleteChat,
    setActiveChat,
    addMessage,
    sendMessage,
  }
}
