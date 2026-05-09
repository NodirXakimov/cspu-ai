<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Button } from '@/components/ui/button'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { useToast } from '@/composables/useToast'
import { cn } from '@/lib/utils'
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  BellIcon,
  BellOffIcon,
  CheckCircle2Icon,
  ClockIcon,
  PlayIcon,
  PauseIcon,
  RefreshCwIcon,
  ShieldAlertIcon,
  UsersIcon,
  Volume2Icon,
  VolumeXIcon,
  XCircleIcon,
} from 'lucide-vue-next'

type Status = 'present' | 'late' | 'absent'

interface Teacher {
  id: string
  name: string
  department: string
  subject: string
  status: Status
  lastUpdated: number
  lateBy?: number
  scheduledAt?: string
}

const FACULTIES = [
  'Pedagogika',
  'Mediasavodxonlik',
  'Falsafa',
  "Tasviriy san'at",
  'Bolalar adabiyoti',
]

const initialTeachers: Teacher[] = [
  { id: '1',  name: 'Imamova U.',   department: FACULTIES[1], subject: 'Mediasavodxonlik',                       status: 'present', lastUpdated: Date.now(), scheduledAt: '08:00' },
  { id: '2',  name: 'Karimov A.',   department: FACULTIES[0], subject: 'Bolalar pedagogikasi',                   status: 'late',    lastUpdated: Date.now() - 1000 * 60 * 5,  lateBy: 5,  scheduledAt: '08:00' },
  { id: '3',  name: 'Yusupova D.',  department: FACULTIES[2], subject: 'Falsafa',                                status: 'present', lastUpdated: Date.now(), scheduledAt: '09:30' },
  { id: '4',  name: 'Rahimov B.',   department: FACULTIES[3], subject: 'Tasviriy faoliyat metodikasi',           status: 'absent',  lastUpdated: Date.now() - 1000 * 60 * 30, scheduledAt: '08:00' },
  { id: '5',  name: 'Sharipova M.', department: FACULTIES[4], subject: 'Bolalar adabiyoti',                      status: 'present', lastUpdated: Date.now(), scheduledAt: '09:30' },
  { id: '6',  name: 'Tojiboyev N.', department: FACULTIES[0], subject: 'Tarbiyachining ish hujjatlari',          status: 'late',    lastUpdated: Date.now() - 1000 * 60 * 12, lateBy: 12, scheduledAt: '08:00' },
  { id: '7',  name: 'Ergashev S.',  department: FACULTIES[1], subject: 'Axborot madaniyati',                     status: 'present', lastUpdated: Date.now(), scheduledAt: '10:50' },
  { id: '8',  name: 'Mirzayeva F.', department: FACULTIES[0], subject: 'Rivojlantiruvchi markazlar texnologiyasi', status: 'present', lastUpdated: Date.now(), scheduledAt: '11:00' },
  { id: '9',  name: 'Nazarov O.',   department: FACULTIES[2], subject: 'Falsafa',                                status: 'present', lastUpdated: Date.now(), scheduledAt: '12:20' },
  { id: '10', name: 'Qodirova L.',  department: FACULTIES[3], subject: 'Tabiat bilan tanishtirish',              status: 'present', lastUpdated: Date.now(), scheduledAt: '13:30' },
  { id: '11', name: 'Saidova Z.',   department: FACULTIES[4], subject: 'Mediasavodxonlik',                       status: 'present', lastUpdated: Date.now(), scheduledAt: '14:00' },
  { id: '12', name: 'Olimov H.',    department: FACULTIES[0], subject: 'Bolalar pedagogikasi (kurs ishi)',       status: 'present', lastUpdated: Date.now(), scheduledAt: '14:50' },
]

const teachers = ref<Teacher[]>(initialTeachers)
const filter = ref<'all' | Status>('all')
const newlyMarkedId = ref<string | null>(null)
const soundEnabled = ref(true)
const autoSimulate = ref(false)
const dangerFlash = ref(false)
const { error: toastError } = useToast()

const stats = computed(() => ({
  total: teachers.value.length,
  present: teachers.value.filter(t => t.status === 'present').length,
  late: teachers.value.filter(t => t.status === 'late').length,
  absent: teachers.value.filter(t => t.status === 'absent').length,
}))

const visibleTeachers = computed(() => {
  if (filter.value === 'all') return teachers.value
  return teachers.value.filter(t => t.status === filter.value)
})

function statusLabel(s: Status): string {
  return s === 'present' ? 'Darsda' : s === 'late' ? 'Kech kelgan' : 'Kelmagan'
}

function relativeTime(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000)
  if (diff < 60) return `${diff}s oldin`
  const m = Math.floor(diff / 60)
  if (m < 60) return `${m} daqiqa oldin`
  const h = Math.floor(m / 60)
  return `${h} soat oldin`
}

let audioCtx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    if (!audioCtx) {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext
      audioCtx = new Ctx()
    }
    return audioCtx
  } catch {
    return null
  }
}

// Deep bell strike — additive synthesis with inharmonic partials (bell-like
// ratios), a short noise transient for the "hammer hit", and a long
// exponential decay. Sounds like a heavy metal gong / clock-tower bell.
function bellStrike(ctx: AudioContext, startAt: number, fundamental = 196, gain = 0.55) {
  const t0 = ctx.currentTime + startAt
  const out = ctx.createGain()
  out.gain.value = gain
  out.connect(ctx.destination)

  // 1) Hammer transient — a short burst of bandpassed noise for the strike attack.
  const noiseLen = 0.08
  const noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * noiseLen), ctx.sampleRate)
  const data = noiseBuf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1)
  const noise = ctx.createBufferSource()
  noise.buffer = noiseBuf
  const noiseFilter = ctx.createBiquadFilter()
  noiseFilter.type = 'bandpass'
  noiseFilter.frequency.value = fundamental * 4
  noiseFilter.Q.value = 1.5
  const noiseGain = ctx.createGain()
  noiseGain.gain.setValueAtTime(0.4, t0)
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.08)
  noise.connect(noiseFilter)
  noiseFilter.connect(noiseGain)
  noiseGain.connect(out)
  noise.start(t0)
  noise.stop(t0 + noiseLen + 0.02)

  // 2) Sub-thump — a short sine sweep way below the fundamental for that
  // gut-punching low end you feel in a big bell.
  const sub = ctx.createOscillator()
  const subGain = ctx.createGain()
  sub.type = 'sine'
  sub.frequency.setValueAtTime(fundamental * 0.5, t0)
  sub.frequency.exponentialRampToValueAtTime(fundamental * 0.35, t0 + 0.18)
  subGain.gain.setValueAtTime(0.0001, t0)
  subGain.gain.linearRampToValueAtTime(0.45, t0 + 0.005)
  subGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.45)
  sub.connect(subGain)
  subGain.connect(out)
  sub.start(t0)
  sub.stop(t0 + 0.5)

  // 3) Bell partials — classic inharmonic ratios for tubular-bell character.
  // Each partial has its own decay; high partials die fast, low partials ring on.
  const partials: Array<[ratio: number, level: number, decay: number]> = [
    [1.00, 0.45, 2.6],   // fundamental — slow decay
    [2.00, 0.32, 2.0],   // octave
    [2.76, 0.22, 1.6],   // bell minor-third-ish
    [3.50, 0.16, 1.2],
    [5.40, 0.10, 0.9],
    [6.80, 0.06, 0.6],   // shimmer
  ]
  for (const [ratio, level, decay] of partials) {
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = fundamental * ratio
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.linearRampToValueAtTime(level, t0 + 0.004)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + decay)
    osc.connect(g)
    g.connect(out)
    osc.start(t0)
    osc.stop(t0 + decay + 0.05)
  }
}

function playAlert() {
  if (!soundEnabled.value) return
  const ctx = getCtx()
  if (!ctx) return
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})

  // Two solemn bell strikes — like a tower bell tolling. Low fundamental for gravity.
  bellStrike(ctx, 0.00, 174, 0.6) // F3 — deep, serious
  bellStrike(ctx, 0.95, 138, 0.7) // C#3 — deeper second strike for finality

  dangerFlash.value = true
  setTimeout(() => (dangerFlash.value = false), 900)
}

function simulateLateTeacher() {
  const candidates = teachers.value.filter(t => t.status !== 'late')
  if (candidates.length === 0) {
    toastError("Barcha o'qituvchilar allaqachon kech kelgan deb belgilangan")
    return
  }
  const pick = candidates[Math.floor(Math.random() * candidates.length)]
  const lateBy = 1 + Math.floor(Math.random() * 20)

  teachers.value = teachers.value.map(t =>
    t.id === pick.id
      ? { ...t, status: 'late', lateBy, lastUpdated: Date.now() }
      : t,
  )

  newlyMarkedId.value = pick.id
  playAlert()

  setTimeout(() => {
    if (newlyMarkedId.value === pick.id) newlyMarkedId.value = null
  }, 4000)
}

function resetAll() {
  teachers.value = initialTeachers.map(t => ({ ...t, lastUpdated: Date.now() }))
  newlyMarkedId.value = null
}

let autoTimer: number | null = null
function startAuto() {
  stopAuto()
  autoTimer = window.setInterval(() => {
    if (stats.value.late >= teachers.value.length) {
      autoSimulate.value = false
      stopAuto()
      return
    }
    simulateLateTeacher()
  }, 8000)
}
function stopAuto() {
  if (autoTimer !== null) clearInterval(autoTimer)
  autoTimer = null
}
function toggleAuto() {
  autoSimulate.value = !autoSimulate.value
  if (autoSimulate.value) startAuto()
  else stopAuto()
}

let clockTimer: number | null = null
const now = ref(Date.now())
onMounted(() => {
  clockTimer = window.setInterval(() => (now.value = Date.now()), 30_000)
})
onUnmounted(() => {
  if (clockTimer !== null) clearInterval(clockTimer)
  stopAuto()
  if (audioCtx && audioCtx.state !== 'closed') audioCtx.close().catch(() => {})
})
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <!-- Danger flash overlay -->
    <div
      aria-hidden="true"
      :class="cn(
        'pointer-events-none fixed inset-0 z-[60] border-4 border-destructive transition-opacity duration-500',
        dangerFlash ? 'opacity-100' : 'opacity-0',
      )"
    />

    <!-- Header -->
    <header class="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
      <div class="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4 lg:px-12">
        <RouterLink to="/" class="shrink-0">
          <Button variant="ghost" size="icon" title="Suhbatga qaytish">
            <ArrowLeftIcon class="size-5" />
          </Button>
        </RouterLink>

        <div class="flex flex-1 items-center gap-3 min-w-0">
          <div class="flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            <ShieldAlertIcon class="size-5" />
          </div>
          <div class="min-w-0">
            <h1 class="truncate text-base font-semibold leading-tight md:text-lg">
              O'qituvchilar nazorati
            </h1>
            <p class="truncate text-xs text-muted-foreground">
              Real vaqt rejimida kuzatish
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          :title="soundEnabled ? 'Ovozni o\'chirish' : 'Ovozni yoqish'"
          @click="soundEnabled = !soundEnabled"
        >
          <Volume2Icon v-if="soundEnabled" class="size-5" />
          <VolumeXIcon v-else class="size-5" />
        </Button>

        <ThemeToggle />
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-6 py-8 lg:px-12">
      <!-- Stat row: always horizontal, scrollable on small screens -->
      <div class="-mx-6 flex gap-4 overflow-x-auto px-6 pb-1 lg:-mx-12 lg:px-12">
        <article class="flex min-w-[200px] flex-1 flex-col rounded-2xl border border-border bg-card p-5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Jami</span>
            <UsersIcon class="size-4 text-muted-foreground" />
          </div>
          <span class="mt-3 text-3xl font-semibold tabular-nums tracking-tight">{{ stats.total }}</span>
          <span class="mt-1 text-xs text-muted-foreground">o'qituvchi</span>
        </article>

        <article class="flex min-w-[200px] flex-1 flex-col rounded-2xl border border-border bg-card p-5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Darsda</span>
            <CheckCircle2Icon class="size-4 text-emerald-500" />
          </div>
          <span class="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-emerald-600 dark:text-emerald-400">
            {{ stats.present }}
          </span>
          <span class="mt-1 text-xs text-muted-foreground">o'z vaqtida</span>
        </article>

        <article
          :class="cn(
            'flex min-w-[200px] flex-1 flex-col rounded-2xl border p-5 transition-colors',
            stats.late > 0
              ? 'border-destructive/40 bg-destructive/5'
              : 'border-border bg-card',
          )"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Kech kelgan</span>
            <AlertTriangleIcon
              :class="cn(
                'size-4',
                stats.late > 0 ? 'text-destructive animate-pulse' : 'text-muted-foreground',
              )"
            />
          </div>
          <span
            :class="cn(
              'mt-3 text-3xl font-semibold tabular-nums tracking-tight',
              stats.late > 0 ? 'text-destructive' : 'text-foreground',
            )"
          >
            {{ stats.late }}
          </span>
          <span class="mt-1 text-xs text-muted-foreground">e'tibor talab qiladi</span>
        </article>

        <article class="flex min-w-[200px] flex-1 flex-col rounded-2xl border border-border bg-card p-5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Kelmagan</span>
            <XCircleIcon class="size-4 text-muted-foreground" />
          </div>
          <span class="mt-3 text-3xl font-semibold tabular-nums tracking-tight">{{ stats.absent }}</span>
          <span class="mt-1 text-xs text-muted-foreground">darsga kelmadi</span>
        </article>
      </div>

      <!-- Toolbar -->
      <div class="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div class="inline-flex items-center gap-1 rounded-xl border border-border bg-card p-1">
          <button
            v-for="opt in (['all', 'late', 'present', 'absent'] as const)"
            :key="opt"
            :class="cn(
              'rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors',
              filter === opt
                ? opt === 'late'
                  ? 'bg-destructive text-white'
                  : 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )"
            @click="filter = opt"
          >
            {{ opt === 'all' ? "Barchasi" : statusLabel(opt) }}
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" @click="resetAll">
            <RefreshCwIcon class="size-4" />
            Tiklash
          </Button>
          <Button variant="outline" size="sm" @click="toggleAuto">
            <PauseIcon v-if="autoSimulate" class="size-4" />
            <PlayIcon v-else class="size-4" />
            {{ autoSimulate ? "To'xtatish" : 'Avto-simulyatsiya' }}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            @click="simulateLateTeacher"
          >
            <BellIcon class="size-4" />
            Kech keldi (simulyatsiya)
          </Button>
        </div>
      </div>

      <!-- Teacher grid -->
      <ul class="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        <li
          v-for="t in visibleTeachers"
          :key="t.id"
          :class="cn(
            'relative flex items-center gap-4 overflow-hidden rounded-2xl border bg-card p-4 transition-colors',
            t.status === 'late' && 'border-destructive/40 bg-destructive/5',
            t.status === 'absent' && 'border-border',
            t.status === 'present' && 'border-border',
            newlyMarkedId === t.id && 'ring-2 ring-destructive ring-offset-2 ring-offset-background',
          )"
        >
          <span
            :class="cn(
              'absolute inset-y-0 left-0 w-1',
              t.status === 'late' && 'bg-destructive',
              t.status === 'absent' && 'bg-muted-foreground/40',
              t.status === 'present' && 'bg-emerald-500',
            )"
          />

          <div
            :class="cn(
              'flex size-11 shrink-0 items-center justify-center rounded-xl',
              t.status === 'present' && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
              t.status === 'late' && 'bg-destructive/10 text-destructive',
              t.status === 'absent' && 'bg-muted text-muted-foreground',
            )"
          >
            <CheckCircle2Icon v-if="t.status === 'present'" class="size-5" />
            <AlertTriangleIcon
              v-else-if="t.status === 'late'"
              :class="cn('size-5', newlyMarkedId === t.id && 'animate-bounce')"
            />
            <XCircleIcon v-else class="size-5" />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p class="truncate font-semibold">{{ t.name }}</p>
              <span
                v-if="newlyMarkedId === t.id"
                class="rounded-full bg-destructive px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
              >
                Yangi
              </span>
            </div>
            <p class="mt-0.5 truncate text-xs text-muted-foreground">
              {{ t.subject }} · {{ t.department }}
            </p>
            <div class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              <span v-if="t.scheduledAt" class="inline-flex items-center gap-1 text-muted-foreground">
                <ClockIcon class="size-3" />{{ t.scheduledAt }}
              </span>
              <span class="text-muted-foreground/60">·</span>
              <span
                :class="cn(
                  t.status === 'present' && 'text-emerald-600 dark:text-emerald-400 font-medium',
                  t.status === 'late' && 'text-destructive font-semibold',
                  t.status === 'absent' && 'text-muted-foreground font-medium',
                )"
              >
                {{ statusLabel(t.status) }}<span v-if="t.status === 'late' && t.lateBy"> · {{ t.lateBy }} daqiqa</span>
              </span>
              <span class="text-muted-foreground/60">·</span>
              <span class="text-muted-foreground">{{ relativeTime(t.lastUpdated) }}</span>
              <span class="hidden">{{ now }}</span>
            </div>
          </div>
        </li>
      </ul>

      <p v-if="visibleTeachers.length === 0" class="mt-10 text-center text-sm text-muted-foreground">
        Hech narsa topilmadi
      </p>

      <div
        v-if="!soundEnabled"
        class="mt-8 flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground"
      >
        <BellOffIcon class="size-4 shrink-0" />
        Ovoz o'chirilgan — yangi kech kelgan o'qituvchilar uchun signal eshitilmaydi.
      </div>
    </main>
  </div>
</template>
