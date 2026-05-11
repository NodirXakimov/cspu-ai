<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart, GaugeChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
} from 'echarts/components'
import {
  AlertTriangleIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  BuildingIcon,
  CalendarIcon,
  GraduationCapIcon,
  TrendingUpIcon,
  UsersIcon,
  WalletIcon,
} from 'lucide-vue-next'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { useTheme } from '@/composables/useTheme'
import { LANGS, useI18n } from '@/composables/useI18n'

use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  GaugeChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
])

const { isDark } = useTheme()
const { lang, locale, t } = useI18n()

// ---------- Faculties (Chirchiq State Pedagogical University) ----------
interface Faculty {
  id: string
  scale: number
}

const FACULTIES: Faculty[] = [
  { id: 'ped', scale: 1.00 },
  { id: 'mtm', scale: 0.78 },
  { id: 'bot', scale: 0.92 },
  { id: 'tsv', scale: 0.55 },
  { id: 'jis', scale: 0.84 },
  { id: 'spe', scale: 0.46 },
  { id: 'mus', scale: 0.40 },
  { id: 'fil', scale: 1.05 },
  { id: 'tar', scale: 0.62 },
  { id: 'tab', scale: 0.71 },
  { id: 'mat', scale: 0.88 },
  { id: 'tur', scale: 0.50 },
]

const selectedFacultyId = ref<string>(FACULTIES[0].id)
const selectedFaculty = computed<Faculty>(
  () => FACULTIES.find(f => f.id === selectedFacultyId.value) ?? FACULTIES[0],
)
const scale = computed(() => selectedFaculty.value.scale)

function hash01(seed: string): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  return (h >>> 0) / 0xffffffff
}

// ---------- Q1: Teachers' Discipline ----------
type LessonKey = 'lecture' | 'practical' | 'laboratory' | 'seminar'

interface LateTeacher {
  name: string
  group: string
  subject: string
  lessonKey: LessonKey
  lateBy: number
}

// Subject names stay in Uzbek-Latin (proper academic course names);
// teacher names + group codes are universal across languages.
const ALL_LATE_TEACHERS: LateTeacher[] = [
  { name: 'Karimov A.',   group: 'MAT 24/1', subject: 'Bolalar pedagogikasi',          lessonKey: 'lecture',    lateBy: 12 },
  { name: 'Rahimov B.',   group: 'TSV 23/2', subject: 'Tasviriy faoliyat metodikasi',  lessonKey: 'practical',  lateBy: 8  },
  { name: 'Yusupova D.',  group: 'FIL 24/3', subject: 'Falsafa',                       lessonKey: 'lecture',    lateBy: 15 },
  { name: 'Nafasov A.',   group: 'PSI 23/1', subject: 'Pedagogik psixologiya',         lessonKey: 'seminar',    lateBy: 5  },
  { name: 'Jurayev H.',   group: 'INF 24/2', subject: 'Axborot madaniyati',            lessonKey: 'practical',  lateBy: 22 },
  { name: 'Imamova U.',   group: 'MED 23/1', subject: 'Mediasavodxonlik',              lessonKey: 'lecture',    lateBy: 4  },
  { name: 'Kadirova X.',  group: 'MTM 24/4', subject: "Maktabgacha ta'lim metodikasi", lessonKey: 'practical',  lateBy: 9  },
  { name: 'Sunnatov T.',  group: 'BOT 23/1', subject: 'Tabiat bilan tanishtirish',     lessonKey: 'laboratory', lateBy: 18 },
  { name: 'Madalimov T.', group: 'JIS 24/2', subject: 'Jismoniy tarbiya nazariyasi',   lessonKey: 'practical',  lateBy: 7  },
]

const TOTAL_TEACHERS_BASE = 142

function ymdLocal(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const today = new Date()
const TODAY_KEY = ymdLocal(today)
const selectedDate = ref<string>(TODAY_KEY)
const isToday = computed(() => selectedDate.value === TODAY_KEY)

// Bumps every 10s so all derived data re-rolls.
const tick = ref(0)

const totalTeachers = computed(() => {
  const base = TOTAL_TEACHERS_BASE * scale.value
  const drift = (hash01(`${selectedFacultyId.value}:tt:${tick.value}`) - 0.5) * 4
  return Math.max(20, Math.round(base + drift))
})

const lateTeachers = computed<LateTeacher[]>(() => {
  const seed = `${selectedFacultyId.value}:${selectedDate.value}:${tick.value}`
  const r = hash01(seed)
  const count = Math.max(2, Math.round(ALL_LATE_TEACHERS.length * (0.45 + r * 0.45)))
  const start = Math.floor(hash01(`${seed}:start`) * ALL_LATE_TEACHERS.length)
  const rotated = [
    ...ALL_LATE_TEACHERS.slice(start),
    ...ALL_LATE_TEACHERS.slice(0, start),
  ]
  return rotated.slice(0, count).map((t, i) => ({
    ...t,
    lateBy: Math.max(1, t.lateBy + ((hash01(`${seed}:${i}`) * 14) | 0) - 7),
  }))
})

const lateCount = computed(() => lateTeachers.value.length)
const punctualityPct = computed(() =>
  Math.round(((totalTeachers.value - lateCount.value) / totalTeachers.value) * 100),
)

const selectedDateLabel = computed(() => {
  if (isToday.value) return t('common.today')
  const d = new Date(selectedDate.value + 'T00:00:00')
  return d.toLocaleDateString(locale.value, { day: 'numeric', month: 'long', year: 'numeric' })
})

// ---------- Q2: Financial ----------
const TOTAL_STUDENTS_BASE = 2847
const PAID_RATE_BASE = 0.918

const totalStudents = computed(() => {
  const base = TOTAL_STUDENTS_BASE * scale.value
  const drift = (hash01(`${selectedFacultyId.value}:ts:${tick.value}`) - 0.5) * 20
  return Math.round(base + drift)
})
const paidRate = computed(() => {
  const drift = (hash01(`${selectedFacultyId.value}:pay:${tick.value}`) - 0.5) * 0.08
  return Math.min(0.985, Math.max(0.78, PAID_RATE_BASE + drift))
})
const studentsPaid = computed(() => Math.round(totalStudents.value * paidRate.value))
const studentsDebt = computed(() => totalStudents.value - studentsPaid.value)
const paidPct = computed(() => Math.round((studentsPaid.value / totalStudents.value) * 100))
const debtPct = computed(() => 100 - paidPct.value)

// ---------- Q3: Attendance ----------
type Period = 'week' | 'month' | 'semester'
const period = ref<Period>('week')

const periodLabel = (p: Period) => t(`q3.period.${p}`)

const PERIOD_DATA: Record<Period, { labelKeys: string[]; values: number[] }> = {
  week: {
    labelKeys: ['wd.mon', 'wd.tue', 'wd.wed', 'wd.thu', 'wd.fri', 'wd.sat'],
    values: [89, 91, 88, 93, 90, 92],
  },
  month: {
    labelKeys: ['week.1', 'week.2', 'week.3', 'week.4'],
    values: [88, 90, 91, 92],
  },
  semester: {
    labelKeys: ['mo.sep', 'mo.oct', 'mo.nov', 'mo.dec', 'mo.jan'],
    values: [86, 89, 90, 87, 91],
  },
}

function resolveLabel(key: string): string {
  // "week.1" → use the {n}-templated string
  const m = /^week\.(\d+)$/.exec(key)
  if (m) return t('week.n', { n: m[1] })
  return t(key)
}

const attendanceSeries = computed(() => {
  // lang dependency so labels re-translate
  void lang.value
  const base = PERIOD_DATA[period.value]
  const facultyDrift = Math.round((hash01(`${selectedFacultyId.value}:att`) - 0.5) * 6)
  const seed = `${selectedFacultyId.value}:${period.value}:${tick.value}`
  return {
    labels: base.labelKeys.map(resolveLabel),
    values: base.values.map((v, i) => {
      const liveDrift = Math.round((hash01(`${seed}:${i}`) - 0.5) * 6)
      return Math.min(99, Math.max(60, v + facultyDrift + liveDrift))
    }),
  }
})
const todayAttendance = computed(() => {
  const arr = attendanceSeries.value.values
  return arr[arr.length - 1]
})
const previousAttendance = computed(() => {
  const arr = attendanceSeries.value.values
  return arr[arr.length - 2] ?? arr[arr.length - 1]
})
const attendanceDelta = computed(() => todayAttendance.value - previousAttendance.value)
const previousPeriodLabel = computed(() => t(`q3.vs.${period.value}`))

// ---------- Q4: Academic Performance ----------
const ACADEMIC_YEARS = ['2025–2026', '2024–2025', '2023–2024'] as const
type AcademicYear = typeof ACADEMIC_YEARS[number]
const SEMESTERS = ['sem.1', 'sem.2'] as const
type Semester = typeof SEMESTERS[number]

const selectedYear = ref<AcademicYear>(ACADEMIC_YEARS[0])
const selectedSemester = ref<Semester>(SEMESTERS[0])

const GRADE_META = [
  { key: 'grade.5', weight: 5, color: '#10b981' },
  { key: 'grade.4', weight: 4, color: '#3b82f6' },
  { key: 'grade.3', weight: 3, color: '#f59e0b' },
  { key: 'grade.2', weight: 2, color: '#ef4444' },
]

const grades = computed(() => {
  void lang.value
  const seed = `${selectedFacultyId.value}:${selectedYear.value}:${selectedSemester.value}:${tick.value}`
  const r1 = hash01(`${seed}:a`)
  const r2 = hash01(`${seed}:b`)
  const total = Math.round(totalStudents.value)
  const aShare = 0.18 + r1 * 0.10
  const bShare = 0.38 + r2 * 0.08
  const fShare = 0.05 + hash01(`${seed}:f`) * 0.08
  const cShare = Math.max(0.10, 1 - aShare - bShare - fShare)
  const counts = [aShare, bShare, cShare, fShare].map(s => Math.round(total * s))
  return GRADE_META.map((g, i) => ({ ...g, label: t(g.key), count: counts[i] }))
})

const totalGraded = computed(() => grades.value.reduce((s, g) => s + g.count, 0))
const gpa = computed(() => {
  const sum = grades.value.reduce((s, g) => s + g.count * g.weight, 0)
  return (sum / totalGraded.value).toFixed(2)
})

// ---------- Clock + 10s live refresh ----------
const now = ref(new Date())
let clockTimer: number | null = null
let liveTimer: number | null = null
onMounted(() => {
  clockTimer = window.setInterval(() => (now.value = new Date()), 1000)
  liveTimer = window.setInterval(() => {
    tick.value++
  }, 10_000)
})
onUnmounted(() => {
  if (clockTimer !== null) clearInterval(clockTimer)
  if (liveTimer !== null) clearInterval(liveTimer)
})
const clockText = computed(() =>
  now.value.toLocaleTimeString(locale.value, { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
)
const dateText = computed(() =>
  now.value.toLocaleDateString(locale.value, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
)

// ---------- Chart palette (reactive to theme) ----------
const chartColors = computed(() =>
  isDark.value
    ? {
        axis: '#475569',
        label: '#cbd5e1',
        muted: '#64748b',
        tooltipBg: '#0f172a',
        tooltipBorder: '#334155',
        tooltipText: '#e2e8f0',
        splitLine: 'rgba(71,85,105,0.3)',
        pieBorder: '#334155',
        gaugeTrack: 'rgba(148,163,184,0.18)',
        gaugeValue: '#f1f5f9',
        barLabel: '#e2e8f0',
      }
    : {
        axis: '#cbd5e1',
        label: '#475569',
        muted: '#94a3b8',
        tooltipBg: '#ffffff',
        tooltipBorder: '#e2e8f0',
        tooltipText: '#0f172a',
        splitLine: 'rgba(148,163,184,0.35)',
        pieBorder: '#ffffff',
        gaugeTrack: 'rgba(148,163,184,0.25)',
        gaugeValue: '#0f172a',
        barLabel: '#334155',
      },
)

const punctualityOption = computed(() => {
  const c = chartColors.value
  return {
    series: [
      {
        type: 'gauge',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 100,
        radius: '110%',
        center: ['50%', '70%'],
        progress: { show: true, width: 22, roundCap: true, itemStyle: { color: '#10b981' } },
        axisLine: { lineStyle: { width: 22, color: [[1, c.gaugeTrack]] } },
        pointer: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        title: { show: false },
        detail: {
          valueAnimation: true,
          offsetCenter: [0, '-5%'],
          formatter: '{value}%',
          fontSize: 42,
          fontWeight: 700,
          color: c.gaugeValue,
        },
        data: [{ value: punctualityPct.value }],
      },
    ],
  }
})

const financialOption = computed(() => {
  const c = chartColors.value
  return {
    tooltip: { trigger: 'item', backgroundColor: c.tooltipBg, borderColor: c.tooltipBorder, textStyle: { color: c.tooltipText } },
    legend: { show: false },
    series: [
      {
        type: 'pie',
        radius: ['58%', '85%'],
        center: ['50%', '55%'],
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        itemStyle: { borderColor: c.pieBorder, borderWidth: 4 },
        data: [
          { value: studentsPaid.value, name: "To'lagan", itemStyle: { color: '#10b981' } },
          { value: studentsDebt.value, name: 'Qarzdor',  itemStyle: { color: '#f97316' } },
        ],
      },
    ],
  }
})

const attendanceOption = computed(() => {
  const c = chartColors.value
  return {
    grid: { left: 36, right: 18, top: 24, bottom: 28 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: c.tooltipBg,
      borderColor: c.tooltipBorder,
      textStyle: { color: c.tooltipText },
      valueFormatter: (v: number) => `${v}%`,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: attendanceSeries.value.labels,
      axisLine: { lineStyle: { color: c.axis } },
      axisLabel: { color: c.label, fontSize: 12 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      min: 70,
      max: 100,
      axisLabel: { color: c.muted, fontSize: 11, formatter: '{value}%' },
      splitLine: { lineStyle: { color: c.splitLine } },
    },
    series: [
      {
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        data: attendanceSeries.value.values,
        itemStyle: { color: '#0ea5e9' },
        lineStyle: { width: 3, color: '#0ea5e9' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(14,165,233,0.4)' },
              { offset: 1, color: 'rgba(14,165,233,0)' },
            ],
          },
        },
      },
    ],
  }
})

const performanceOption = computed(() => {
  const c = chartColors.value
  return {
    grid: { left: 40, right: 18, top: 24, bottom: 36 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: c.tooltipBg,
      borderColor: c.tooltipBorder,
      textStyle: { color: c.tooltipText },
      axisPointer: { type: 'shadow' },
    },
    xAxis: {
      type: 'category',
      data: grades.value.map(g => g.label),
      axisLine: { lineStyle: { color: c.axis } },
      axisLabel: { color: c.label, fontSize: 12 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: c.muted, fontSize: 11 },
      splitLine: { lineStyle: { color: c.splitLine } },
    },
    series: [
      {
        type: 'bar',
        barWidth: '55%',
        data: grades.value.map(g => ({
          value: g.count,
          itemStyle: { color: g.color, borderRadius: [6, 6, 0, 0] },
        })),
        label: {
          show: true,
          position: 'top',
          color: c.barLabel,
          fontWeight: 600,
          fontSize: 12,
        },
      },
    ],
  }
})

function fmt(n: number): string {
  return n.toLocaleString(locale.value).replace(/,/g, ' ')
}
</script>

<template>
  <div class="min-h-screen w-full bg-slate-50 text-slate-900 dark:bg-slate-800 dark:text-slate-100 lg:h-screen lg:overflow-hidden">
    <!-- Header bar -->
    <header class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-600 dark:bg-slate-700/40 sm:px-6 lg:h-14 lg:flex-nowrap lg:py-0">
      <div class="flex items-center gap-3 min-w-0">
        <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400">
          <TrendingUpIcon class="size-5" />
        </div>
        <div class="min-w-0">
          <h1 class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700 dark:text-slate-200 sm:text-sm">
            {{ t('app.title') }}
          </h1>
          <p class="truncate text-[11px] text-slate-500 dark:text-slate-400 sm:text-xs">
            {{ t('app.university') }}
          </p>
        </div>
      </div>

      <div class="flex w-full flex-wrap items-center justify-end gap-2 sm:gap-4 lg:w-auto">
        <!-- Faculty filter -->
        <label class="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs dark:border-slate-600 dark:bg-slate-800 sm:flex-initial">
          <BuildingIcon class="size-3.5 shrink-0 text-slate-500 dark:text-slate-400" />
          <span class="hidden text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:inline">{{ t('common.faculty') }}</span>
          <select
            v-model="selectedFacultyId"
            class="min-w-0 flex-1 cursor-pointer bg-transparent font-medium text-slate-800 focus:outline-none dark:text-slate-200 sm:max-w-[260px]"
          >
            <option
              v-for="f in FACULTIES"
              :key="f.id"
              :value="f.id"
              class="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100"
            >
              {{ t(`fac.${f.id}`) }}
            </option>
          </select>
        </label>

        <!-- Language selector -->
        <select
          v-model="lang"
          class="cursor-pointer rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
          :title="t('common.faculty')"
        >
          <option
            v-for="l in LANGS"
            :key="l.code"
            :value="l.code"
            class="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100"
          >
            {{ l.short }}
          </option>
        </select>

        <div
          class="hidden items-center gap-2 text-xs text-slate-500 dark:text-slate-400 lg:flex"
          :title="`${t('common.refreshed')}: #${tick}`"
        >
          <span class="size-1.5 animate-pulse rounded-full bg-emerald-500" />
          {{ t('common.live') }}
        </div>
        <div class="text-right">
          <div class="font-mono text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100 sm:text-lg">{{ clockText }}</div>
          <div class="hidden text-[11px] capitalize text-slate-500 dark:text-slate-400 sm:block">{{ dateText }}</div>
        </div>

        <ThemeToggle />
      </div>
    </header>

    <!-- Responsive grid -->
    <div class="grid grid-cols-1 gap-3 p-3 lg:h-[calc(100vh-3.5rem)] lg:grid-cols-2 lg:grid-rows-2">

      <!-- Q1: Teachers' Discipline -->
      <section class="flex min-h-[520px] flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-600 dark:bg-slate-700/40 dark:shadow-none sm:p-5 lg:min-h-0 lg:overflow-hidden">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <UsersIcon class="size-4 text-sky-600 dark:text-sky-400" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {{ t('q1.title') }}
            </h2>
          </div>
          <div class="flex items-center gap-2">
            <label class="flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs dark:border-slate-600 dark:bg-slate-800/60">
              <CalendarIcon class="size-3.5 text-slate-500 dark:text-slate-400" />
              <input
                type="date"
                :max="TODAY_KEY"
                :value="selectedDate"
                @input="(e) => (selectedDate = (e.target as HTMLInputElement).value)"
                class="bg-transparent font-medium tabular-nums text-slate-800 focus:outline-none dark:text-slate-200 dark:[color-scheme:dark]"
              />
            </label>
            <span class="hidden text-[11px] text-slate-500 sm:inline">{{ selectedDateLabel }}</span>
          </div>
        </div>

        <div class="mt-4 grid flex-1 grid-cols-1 gap-4 sm:grid-cols-5 lg:overflow-hidden">
          <div class="flex flex-col gap-4 sm:col-span-3 lg:overflow-hidden">
            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-600 dark:bg-slate-800/50">
                <div class="text-[11px] uppercase tracking-wider text-slate-500">{{ t('q1.total') }}</div>
                <div class="mt-1 text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-100">{{ totalTeachers }}</div>
              </div>
              <div class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-500/30 dark:bg-rose-500/10">
                <div class="text-[11px] uppercase tracking-wider text-rose-700 dark:text-rose-300">{{ t('q1.late') }}</div>
                <div class="mt-1 text-3xl font-bold tabular-nums text-rose-600 dark:text-rose-400">{{ lateCount }}</div>
              </div>
            </div>

            <div class="min-h-[220px] flex-1 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-800/50 lg:min-h-0">
              <div class="border-b border-slate-200 px-4 py-2 text-[11px] uppercase tracking-wider text-slate-500 dark:border-slate-600">
                {{ t('q1.late_list') }}
              </div>
              <ul class="max-h-[260px] overflow-y-auto pb-8 lg:max-h-none lg:h-full">
                <li
                  v-for="item in lateTeachers"
                  :key="item.name"
                  class="flex items-center gap-3 border-b border-slate-200/80 px-4 py-2.5 last:border-b-0 dark:border-slate-600/60"
                >
                  <span class="size-2 shrink-0 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]" />
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <span class="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{{ item.name }}</span>
                      <span class="shrink-0 rounded-md border border-sky-200 bg-sky-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300">
                        {{ item.group }}
                      </span>
                    </div>
                    <div class="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                      <span class="truncate">{{ item.subject }}</span>
                      <span class="text-slate-300 dark:text-slate-700">·</span>
                      <span
                        :class="[
                          'shrink-0 rounded px-1 py-px text-[10px] font-medium uppercase tracking-wider',
                          item.lessonKey === 'lecture'
                            ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300'
                            : item.lessonKey === 'practical'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                              : item.lessonKey === 'laboratory'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                                : 'bg-slate-200 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300',
                        ]"
                      >
                        {{ t(`lesson.${item.lessonKey}`) }}
                      </span>
                    </div>
                  </div>
                  <span class="shrink-0 rounded-md bg-rose-100 px-2 py-0.5 font-mono text-xs font-semibold tabular-nums text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                    +{{ item.lateBy }}m
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div class="flex min-h-[180px] flex-col items-center justify-center sm:col-span-2">
            <VChart :option="punctualityOption" autoresize class="h-full min-h-[160px] w-full" />
            <div class="-mt-6 text-center">
              <div class="text-[11px] uppercase tracking-wider text-slate-500">{{ t('q1.discipline_rate') }}</div>
              <div class="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400">{{ totalTeachers - lateCount }} / {{ totalTeachers }} {{ t('q1.on_time_suffix') }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Q2: Financial -->
      <section class="flex min-h-[480px] flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-600 dark:bg-slate-700/40 dark:shadow-none sm:p-5 lg:min-h-0 lg:overflow-hidden">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <WalletIcon class="size-4 text-amber-600 dark:text-amber-400" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">{{ t('q2.title') }}</h2>
          </div>
          <span class="text-[11px] text-slate-500">{{ t('common.current_semester') }}</span>
        </div>

        <div class="mt-4 grid flex-1 grid-cols-1 gap-4 sm:grid-cols-5">
          <div class="flex flex-col justify-center gap-3 sm:col-span-3">
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-600 dark:bg-slate-800/50">
              <div class="text-[11px] uppercase tracking-wider text-slate-500">{{ t('q2.total') }}</div>
              <div class="mt-1 text-4xl font-bold tabular-nums text-slate-900 dark:text-slate-100">{{ fmt(totalStudents) }}</div>
            </div>

            <div class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/25 dark:bg-emerald-500/10">
              <div class="flex items-center justify-between">
                <span class="text-[11px] uppercase tracking-wider text-emerald-700 dark:text-emerald-300">{{ t('q2.paid') }}</span>
                <span class="text-[11px] text-emerald-600/90 dark:text-emerald-400/80">{{ paidPct }}%</span>
              </div>
              <div class="mt-1 text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-300">{{ fmt(studentsPaid) }}</div>
            </div>

            <div class="rounded-xl border border-orange-300 bg-orange-50 px-4 py-3 ring-1 ring-orange-200 dark:border-orange-500/40 dark:bg-orange-500/10 dark:ring-orange-500/20">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                  <AlertTriangleIcon class="size-3.5 text-orange-600 dark:text-orange-400" />
                  <span class="text-[11px] uppercase tracking-wider text-orange-700 dark:text-orange-300">{{ t('q2.debt') }}</span>
                </div>
                <span class="text-[11px] text-orange-600/90 dark:text-orange-400/80">{{ debtPct }}%</span>
              </div>
              <div class="mt-1 text-2xl font-bold tabular-nums text-orange-700 dark:text-orange-400">{{ fmt(studentsDebt) }}</div>
            </div>
          </div>

          <div class="relative flex min-h-[180px] items-center justify-center sm:col-span-2">
            <VChart :option="financialOption" autoresize class="h-full min-h-[160px] w-full" />
            <div class="pointer-events-none absolute inset-0 flex -translate-y-2 flex-col items-center justify-center">
              <div class="text-[10px] uppercase tracking-wider text-slate-500">{{ t('q2.debt_short') }}</div>
              <div class="text-2xl font-bold tabular-nums text-orange-600 dark:text-orange-400">{{ debtPct }}%</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Q3: Attendance -->
      <section class="flex min-h-[480px] flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-600 dark:bg-slate-700/40 dark:shadow-none sm:p-5 lg:min-h-0 lg:overflow-hidden">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <UsersIcon class="size-4 text-sky-600 dark:text-sky-400" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">{{ t('q3.title') }}</h2>
          </div>
          <div class="inline-flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-600 dark:bg-slate-800/60">
            <button
              v-for="p in (['week', 'month', 'semester'] as const)"
              :key="p"
              :class="[
                'rounded-md px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider transition-colors',
                period === p
                  ? 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
              ]"
              @click="period = p"
            >
              {{ periodLabel(p) }}
            </button>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-600 dark:bg-slate-800/50">
            <div class="text-[10px] uppercase tracking-wider text-slate-500">{{ t('q3.active') }}</div>
            <div class="mt-1 text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">{{ fmt(totalStudents) }}</div>
          </div>
          <div class="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 dark:border-sky-500/30 dark:bg-sky-500/10">
            <div class="text-[10px] uppercase tracking-wider text-sky-700 dark:text-sky-300">{{ t('q3.today') }}</div>
            <div class="mt-1 text-2xl font-bold tabular-nums text-sky-700 dark:text-sky-300">{{ todayAttendance }}%</div>
          </div>
          <div
            :class="[
              'rounded-xl border px-4 py-3',
              attendanceDelta >= 0
                ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10'
                : 'border-rose-200 bg-rose-50 dark:border-rose-500/30 dark:bg-rose-500/10',
            ]"
          >
            <div class="text-[10px] uppercase tracking-wider text-slate-500">{{ previousPeriodLabel }}</div>
            <div
              :class="[
                'mt-1 flex items-center gap-1 text-2xl font-bold tabular-nums',
                attendanceDelta >= 0
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-rose-700 dark:text-rose-400',
              ]"
            >
              <ArrowUpIcon v-if="attendanceDelta >= 0" class="size-5" />
              <ArrowDownIcon v-else class="size-5" />
              {{ attendanceDelta >= 0 ? '+' : '' }}{{ attendanceDelta }}%
            </div>
          </div>
        </div>

        <div class="mt-4 min-h-[220px] flex-1">
          <VChart :option="attendanceOption" autoresize class="h-full min-h-[200px] w-full" />
        </div>
      </section>

      <!-- Q4: Academic Performance -->
      <section class="flex min-h-[480px] flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-600 dark:bg-slate-700/40 dark:shadow-none sm:p-5 lg:min-h-0 lg:overflow-hidden">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <GraduationCapIcon class="size-4 text-violet-600 dark:text-violet-400" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">{{ t('q4.title') }}</h2>
          </div>
          <div class="flex items-center gap-2">
            <select
              v-model="selectedYear"
              class="cursor-pointer rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-800 focus:outline-none dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-200"
            >
              <option
                v-for="y in ACADEMIC_YEARS"
                :key="y"
                :value="y"
                class="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100"
              >
                {{ y }}
              </option>
            </select>
            <select
              v-model="selectedSemester"
              class="cursor-pointer rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-800 focus:outline-none dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-200"
            >
              <option
                v-for="s in SEMESTERS"
                :key="s"
                :value="s"
                class="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100"
              >
                {{ t(s) }}
              </option>
            </select>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div class="col-span-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 dark:border-violet-500/30 dark:bg-violet-500/10">
            <div class="text-[10px] uppercase tracking-wider text-violet-700 dark:text-violet-300">{{ t('q4.gpa') }}</div>
            <div class="mt-1 flex items-baseline gap-2">
              <span class="text-3xl font-bold tabular-nums text-violet-700 dark:text-violet-300">{{ gpa }}</span>
              <span class="text-xs text-slate-500">/ 5.00</span>
            </div>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-600 dark:bg-slate-800/50">
            <div class="text-[10px] uppercase tracking-wider text-slate-500">{{ t('q4.graded') }}</div>
            <div class="mt-1 text-xl font-bold tabular-nums text-slate-900 dark:text-slate-100">{{ fmt(totalGraded) }}</div>
          </div>
          <div class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 dark:border-rose-500/30 dark:bg-rose-500/10">
            <div class="text-[10px] uppercase tracking-wider text-rose-700 dark:text-rose-300">{{ t('q4.failed') }}</div>
            <div class="mt-1 text-xl font-bold tabular-nums text-rose-600 dark:text-rose-400">{{ fmt(grades[3].count) }}</div>
          </div>
        </div>

        <div class="mt-4 min-h-[220px] flex-1">
          <VChart :option="performanceOption" autoresize class="h-full min-h-[200px] w-full" />
        </div>
      </section>
    </div>
  </div>
</template>
