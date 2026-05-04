export type MessageType = 'text' | 'image' | 'audio' | 'video' | 'file'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  type: MessageType
  timestamp: number
  metadata?: Record<string, unknown>
}

export interface Chat {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}
