import { onUnmounted, ref } from 'vue'

const PREFERRED_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',
  'audio/ogg;codecs=opus',
  'audio/ogg',
]

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined
  for (const type of PREFERRED_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(type)) return type
  }
  return undefined
}

function extensionFor(mimeType: string | undefined): string {
  if (!mimeType) return 'webm'
  if (mimeType.includes('mp4')) return 'm4a'
  if (mimeType.includes('ogg')) return 'ogg'
  return 'webm'
}

export interface RecordingResult {
  blob: Blob
  mimeType: string
  extension: string
  durationMs: number
}

export function useAudioRecorder(options: { maxDurationMs?: number } = {}) {
  const maxDurationMs = options.maxDurationMs ?? 120_000 // 2 min cap

  const isRecording = ref(false)
  const elapsedMs = ref(0)
  const audioLevel = ref(0) // 0..1, useful for waveform / pulse animation
  const error = ref<string | null>(null)

  let mediaRecorder: MediaRecorder | null = null
  let stream: MediaStream | null = null
  let audioCtx: AudioContext | null = null
  let analyser: AnalyserNode | null = null
  let levelRaf: number | null = null
  let timerInterval: number | null = null
  let chunks: Blob[] = []
  let startedAt = 0
  let resolveStop: ((value: RecordingResult | null) => void) | null = null
  let canceled = false

  function cleanup() {
    if (levelRaf !== null) cancelAnimationFrame(levelRaf)
    if (timerInterval !== null) clearInterval(timerInterval)
    levelRaf = null
    timerInterval = null
    audioLevel.value = 0
    stream?.getTracks().forEach(t => t.stop())
    stream = null
    if (audioCtx && audioCtx.state !== 'closed') {
      audioCtx.close().catch(() => {})
    }
    audioCtx = null
    analyser = null
    mediaRecorder = null
  }

  function tickLevel() {
    if (!analyser) return
    const data = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteTimeDomainData(data)
    let sum = 0
    for (let i = 0; i < data.length; i++) {
      const v = (data[i] - 128) / 128
      sum += v * v
    }
    const rms = Math.sqrt(sum / data.length)
    audioLevel.value = Math.min(1, rms * 2.5)
    levelRaf = requestAnimationFrame(tickLevel)
  }

  async function start(): Promise<boolean> {
    if (isRecording.value) return false
    error.value = null
    canceled = false
    chunks = []

    if (!navigator.mediaDevices?.getUserMedia) {
      error.value = "Brauzer mikrofon yozishni qo'llab-quvvatlamaydi."
      return false
    }
    if (typeof MediaRecorder === 'undefined') {
      error.value = "Brauzer audio yozishni qo'llab-quvvatlamaydi."
      return false
    }

    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (err) {
      console.error(err)
      error.value = "Mikrofonga kirish rad etildi."
      return false
    }

    const mimeType = pickMimeType()
    try {
      mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)
    } catch (err) {
      console.error(err)
      error.value = "Yozishni boshlab bo'lmadi."
      cleanup()
      return false
    }

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data)
    }

    mediaRecorder.onstop = () => {
      const recorder = mediaRecorder
      const recordedDuration = Date.now() - startedAt
      const wasCanceled = canceled
      const usedMime = recorder?.mimeType || mimeType || 'audio/webm'
      cleanup()
      isRecording.value = false

      if (wasCanceled || chunks.length === 0) {
        resolveStop?.(null)
      } else {
        const blob = new Blob(chunks, { type: usedMime })
        resolveStop?.({
          blob,
          mimeType: usedMime,
          extension: extensionFor(usedMime),
          durationMs: recordedDuration,
        })
      }
      resolveStop = null
      chunks = []
    }

    // Audio level analysis for the waveform / pulse UI
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext
      audioCtx = new Ctx()
      const source = audioCtx.createMediaStreamSource(stream)
      analyser = audioCtx.createAnalyser()
      analyser.fftSize = 1024
      source.connect(analyser)
      tickLevel()
    } catch {
      // non-fatal; UI just won't animate the level
    }

    startedAt = Date.now()
    elapsedMs.value = 0
    timerInterval = window.setInterval(() => {
      elapsedMs.value = Date.now() - startedAt
      if (elapsedMs.value >= maxDurationMs) stop()
    }, 100)

    mediaRecorder.start()
    isRecording.value = true
    return true
  }

  function stop(): Promise<RecordingResult | null> {
    return new Promise((resolve) => {
      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        resolve(null)
        return
      }
      resolveStop = resolve
      mediaRecorder.stop()
    })
  }

  function cancel(): Promise<null> {
    canceled = true
    return stop().then(() => null)
  }

  onUnmounted(() => {
    if (isRecording.value) cancel()
    else cleanup()
  })

  return { isRecording, elapsedMs, audioLevel, error, start, stop, cancel }
}
