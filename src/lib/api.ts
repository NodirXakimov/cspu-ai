import type { Session, ServerMessage } from '@/types/chat'

const PROD_API = 'https://e0f0-84-54-115-138.ngrok-free.app/api'

export const API_BASE = import.meta.env.DEV ? '/api' : PROD_API

interface SessionDetailResponse {
  session: Session
  messages: ServerMessage[]
}

const COMMON_HEADERS = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...COMMON_HEADERS,
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

export async function deleteSession(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/sessions/${id}`, {
    method: 'DELETE',
    headers: COMMON_HEADERS,
  })
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`)
}

export function streamAsk(sessionId: string, prompt: string): Promise<Response> {
  return fetch(`${API_BASE}/ask/stream`, {
    method: 'POST',
    headers: COMMON_HEADERS,
    body: JSON.stringify({ session_id: sessionId, prompt }),
  })
}

export interface VoiceAskResponse {
  question: string
  answer: string
}

export async function askVoice(
  blob: Blob,
  filename = 'recording.webm',
): Promise<VoiceAskResponse> {
  const form = new FormData()
  form.append('audio', blob, filename)

  const res = await fetch(`${API_BASE}/ask-voice`, {
    method: 'POST',
    // Don't set Content-Type — the browser sets multipart boundary automatically.
    headers: { 'ngrok-skip-browser-warning': 'true' },
    body: form,
  })
  if (!res.ok) throw new Error(`Voice request failed: ${res.status}`)
  return res.json() as Promise<VoiceAskResponse>
}
