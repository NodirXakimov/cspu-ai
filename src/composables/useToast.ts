import { ref } from 'vue'
import { nanoid } from 'nanoid'

export type ToastVariant = 'default' | 'success' | 'error'

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
  durationMs: number
}

const toasts = ref<Toast[]>([])

function push(message: string, variant: ToastVariant, durationMs = 3000) {
  const id = nanoid()
  toasts.value = [...toasts.value, { id, message, variant, durationMs }]
  if (durationMs > 0) {
    window.setTimeout(() => dismiss(id), durationMs)
  }
}

function dismiss(id: string) {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

export function useToast() {
  return {
    toasts,
    dismiss,
    toast: (message: string, durationMs?: number) => push(message, 'default', durationMs),
    success: (message: string, durationMs?: number) => push(message, 'success', durationMs),
    error: (message: string, durationMs?: number) => push(message, 'error', durationMs),
  }
}
