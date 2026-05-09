import type { Session, ServerMessage } from '@/types/chat'

const PROD_API = 'https://e0f0-84-54-115-138.ngrok-free.app/api'

export const API_BASE = import.meta.env.DEV ? '/api' : PROD_API

interface SessionDetailResponse {
  session: Session
  messages: ServerMessage[]
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

export function listSessions(): Promise<Session[]> {
  return request<Session[]>('/sessions')
}

export function getSession(id: string): Promise<SessionDetailResponse> {
  return request<SessionDetailResponse>(`/sessions/${id}`)
}

export function createSession(title: string): Promise<Session> {
  return request<Session>('/sessions', {
    method: 'POST',
    body: JSON.stringify({ title }),
  })
}

export function streamAsk(sessionId: string, prompt: string): Promise<Response> {
  return fetch(`${API_BASE}/ask/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, prompt }),
  })
}
