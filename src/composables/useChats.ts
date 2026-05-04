import type { Chat, ChatMessage } from '@/types/chat'
import { useLocalStorage } from '@vueuse/core'
import { nanoid } from 'nanoid'
import { computed } from 'vue'

const MOCK_RESPONSES = [
  "Men sizga yordam berishga tayyorman! Iltimos, savolingizni batafsilroq yozing.",
  "Bu juda qiziqarli savol! Keling, birga ko'rib chiqamiz...",
  "Tushundim. Mana mening fikrim bu haqida...",
  "Rahmat savolingiz uchun! Mana javobim...",
  "Yaxshi savol! Bu mavzu bo'yicha quyidagilarni aytishim mumkin...",
  "Albatta, bu haqida batafsil tushuntiraman...",
  "Qiziqarli! Keling, bu masalani birga hal qilaylik.",
  "Bu juda muhim mavzu. Mana mening tahlilim...",
]

function getRandomResponse(): string {
  return MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)]
}

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

  async function sendMessage(content: string) {
    let chatId = activeChatId.value
    if (!chatId) {
      const chat = createChat()
      chatId = chat.id
    }

    addMessage(chatId, { role: 'user', content, type: 'text' })

    // Simulate AI thinking delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

    addMessage(chatId, { role: 'assistant', content: getRandomResponse(), type: 'text' })
  }

  return {
    chats: sortedChats,
    activeChat,
    activeChatId,
    createChat,
    deleteChat,
    setActiveChat,
    addMessage,
    sendMessage,
  }
}
