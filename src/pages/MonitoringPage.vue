<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, shallowRef } from 'vue'
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
  GraduationCapIcon,
  TrendingUpIcon,
  UsersIcon,
  WalletIcon,
} from 'lucide-vue-next'

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

// ---------- Mock faculty-level data ----------
const FACULTY_NAME = 'Pedagogika fakulteti'

const TOTAL_TEACHERS = 142
const LATE_TEACHERS = [
  { name: 'Karimov A.',  subject: 'Bolalar pedagogikasi',          lateBy: 12 },
  { name: 'Rahimov B.',  subject: 'Tasviriy faoliyat metodikasi',  lateBy: 8  },
  { name: 'Yusupova D.', subject: 'Falsafa',                        lateBy: 15 },
  { name: 'Nafasov A.',  subject: 'Pedagogik psixologiya',          lateBy: 5  },
  { name: 'Jurayev H.',  subject: 'Axborot madaniyati',             lateBy: 22 },
  { name: 'Imamova U.',  subject: 'Mediasavodxonlik',               lateBy: 4  },
  { name: 'Kadirova X.', subject: 'Maktabgacha ta\'lim metodikasi', lateBy: 9  },
]
const lateCount = LATE_TEACHERS.length
const punctualityPct = Math.round(((TOTAL_TEACHERS - lateCount) / TOTAL_TEACHERS) * 100)

const TOTAL_STUDENTS = 2847
const STUDENTS_PAID = 2613
const STUDENTS_DEBT = TOTAL_STUDENTS - STUDENTS_PAID

const WEEK_LABELS = ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha']
const WEEK_ATTENDANCE = [89, 91, 88, 93, 90, 92]
const TODAY_ATTENDANCE = WEEK_ATTENDANCE[WEEK_ATTENDANCE.length - 1]
const YESTERDAY_ATTENDANCE = WEEK_ATTENDANCE[WEEK_ATTENDANCE.length - 2]
const ATTENDANCE_DELTA = TODAY_ATTENDANCE - YESTERDAY_ATTENDANCE

const GRADES = [
  { label: "A'lo (5)",    count: 612, color: '#10b981' },
  { label: "Yaxshi (4)",  count: 1184, color: '#3b82f6' },
  { label: "Qoniq. (3)",  count: 821, color: '#f59e0b' },
  { label: "Yiqilgan (2)", count: 230, color: '#ef4444' },
]
const GRADE_WEIGHTS = [5, 4, 3, 2]
const totalGraded = GRADES.reduce((s, g) => s + g.count, 0)
const gpa = (
  GRADES.reduce((s, g, i) => s + g.count * GRADE_WEIGHTS[i], 0) / totalGraded
).toFixed(2)

// ---------- Clock ----------
const now = ref(new Date())
let clockTimer: number | null = null
onMounted(() => {
  clockTimer = window.setInterval(() => (now.value = new Date()), 1000)
})
onUnmounted(() => {
  if (clockTimer !== null) clearInterval(clockTimer)
})
const clockText = computed(() =>
  now.value.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
)
const dateText = computed(() =>
  now.value.toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
)

// ---------- Chart options ----------
const AXIS = '#475569'
const LABEL = '#cbd5e1'
const MUTED = '#64748b'

const punctualityOption = shallowRef({
  series: [
    {
      type: 'gauge',
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      radius: '110%',
      center: ['50%', '70%'],
      progress: {
        show: true,
        width: 22,
        roundCap: true,
        itemStyle: { color: '#10b981' },
      },
      axisLine: {
        lineStyle: { width: 22, color: [[1, 'rgba(148,163,184,0.15)']] },
      },
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
        color: '#f1f5f9',
      },
      data: [{ value: punctualityPct }],
    },
  ],
})

const financialOption = shallowRef({
  tooltip: { trigger: 'item', backgroundColor: '#0f172a', borderColor: '#334155', textStyle: { color: '#e2e8f0' } },
  legend: { show: false },
  series: [
    {
      type: 'pie',
      radius: ['58%', '85%'],
      center: ['50%', '55%'],
      avoidLabelOverlap: false,
      label: { show: false },
      labelLine: { show: false },
      itemStyle: { borderColor: '#0f172a', borderWidth: 4 },
      data: [
        { value: STUDENTS_PAID, name: "To'lagan", itemStyle: { color: '#10b981' } },
        { value: STUDENTS_DEBT, name: 'Qarzdor',  itemStyle: { color: '#f97316' } },
      ],
    },
  ],
})

const attendanceOption = shallowRef({
  grid: { left: 36, right: 18, top: 24, bottom: 28 },
  tooltip: {
    trigger: 'axis',
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    textStyle: { color: '#e2e8f0' },
    valueFormatter: (v: number) => `${v}%`,
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: WEEK_LABELS,
    axisLine: { lineStyle: { color: AXIS } },
    axisLabel: { color: LABEL, fontSize: 12 },
    axisTick: { show: false },
  },
  yAxis: {
    type: 'value',
    min: 70,
    max: 100,
    axisLabel: { color: MUTED, fontSize: 11, formatter: '{value}%' },
    splitLine: { lineStyle: { color: 'rgba(71,85,105,0.3)' } },
  },
  series: [
    {
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      data: WEEK_ATTENDANCE,
      itemStyle: { color: '#38bdf8' },
      lineStyle: { width: 3, color: '#38bdf8' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(56,189,248,0.45)' },
            { offset: 1, color: 'rgba(56,189,248,0)' },
          ],
        },
      },
    },
  ],
})

const performanceOption = shallowRef({
  grid: { left: 40, right: 18, top: 24, bottom: 36 },
  tooltip: {
    trigger: 'axis',
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    textStyle: { color: '#e2e8f0' },
    axisPointer: { type: 'shadow' },
  },
  xAxis: {
    type: 'category',
    data: GRADES.map(g => g.label),
    axisLine: { lineStyle: { color: AXIS } },
    axisLabel: { color: LABEL, fontSize: 12 },
    axisTick: { show: false },
  },
  yAxis: {
    type: 'value',
    axisLabel: { color: MUTED, fontSize: 11 },
    splitLine: { lineStyle: { color: 'rgba(71,85,105,0.3)' } },
  },
  series: [
    {
      type: 'bar',
      barWidth: '55%',
      data: GRADES.map(g => ({
        value: g.count,
        itemStyle: { color: g.color, borderRadius: [6, 6, 0, 0] },
      })),
      label: {
        show: true,
        position: 'top',
        color: '#e2e8f0',
        fontWeight: 600,
        fontSize: 12,
      },
    },
  ],
})

function fmt(n: number): string {
  return n.toLocaleString('uz-UZ').replace(/,/g, ' ')
}
</script>

<template>
  <div class="dark h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
    <!-- Header bar -->
    <header class="flex h-14 items-center justify-between border-b border-slate-800 bg-slate-900/60 px-6">
      <div class="flex items-center gap-3">
        <div class="flex size-9 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400">
          <TrendingUpIcon class="size-5" />
        </div>
        <div>
          <h1 class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-200">
            Vaziyat markazi · Smart Campus
          </h1>
          <p class="text-xs text-slate-400">{{ FACULTY_NAME }}</p>
        </div>
      </div>

      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2 text-xs text-slate-400">
          <span class="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Jonli ma'lumotlar
        </div>
        <div class="text-right">
          <div class="font-mono text-lg font-semibold tabular-nums text-slate-100">{{ clockText }}</div>
          <div class="text-[11px] capitalize text-slate-400">{{ dateText }}</div>
        </div>
      </div>
    </header>

    <!-- 2x2 grid -->
    <div class="grid h-[calc(100vh-3.5rem)] grid-cols-2 grid-rows-2 gap-3 p-3">

      <!-- Q1: Teachers' Discipline -->
      <section class="flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UsersIcon class="size-4 text-sky-400" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-300">
              O'qituvchilar intizomi
            </h2>
          </div>
          <span class="text-[11px] text-slate-500">Bugun</span>
        </div>

        <div class="mt-4 grid flex-1 grid-cols-5 gap-4 overflow-hidden">
          <!-- Numbers + list -->
          <div class="col-span-3 flex flex-col gap-4 overflow-hidden">
            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3">
                <div class="text-[11px] uppercase tracking-wider text-slate-500">Jami</div>
                <div class="mt-1 text-3xl font-bold tabular-nums text-slate-100">{{ TOTAL_TEACHERS }}</div>
              </div>
              <div class="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3">
                <div class="text-[11px] uppercase tracking-wider text-rose-300">Kech kelgan</div>
                <div class="mt-1 text-3xl font-bold tabular-nums text-rose-400">{{ lateCount }}</div>
              </div>
            </div>

            <div class="min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40">
              <div class="border-b border-slate-800 px-4 py-2 text-[11px] uppercase tracking-wider text-slate-500">
                Kech kelganlar
              </div>
              <ul class="h-full overflow-y-auto pb-8">
                <li
                  v-for="t in LATE_TEACHERS"
                  :key="t.name"
                  class="flex items-center gap-3 border-b border-slate-800/60 px-4 py-2 last:border-b-0"
                >
                  <span class="size-2 shrink-0 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]" />
                  <div class="min-w-0 flex-1">
                    <div class="truncate text-sm font-medium text-slate-200">{{ t.name }}</div>
                    <div class="truncate text-[11px] text-slate-500">{{ t.subject }}</div>
                  </div>
                  <span class="shrink-0 rounded-md bg-rose-500/15 px-2 py-0.5 font-mono text-xs font-semibold text-rose-300 tabular-nums">
                    +{{ t.lateBy }}m
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Gauge -->
          <div class="col-span-2 flex flex-col items-center justify-center">
            <VChart :option="punctualityOption" autoresize class="h-full w-full" />
            <div class="-mt-6 text-center">
              <div class="text-[11px] uppercase tracking-wider text-slate-500">Intizom darajasi</div>
              <div class="mt-0.5 text-xs text-emerald-400">{{ TOTAL_TEACHERS - lateCount }} / {{ TOTAL_TEACHERS }} o'z vaqtida</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Q2: Financial Status -->
      <section class="flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <WalletIcon class="size-4 text-amber-400" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-300">
              To'lov holati
            </h2>
          </div>
          <span class="text-[11px] text-slate-500">Joriy semestr</span>
        </div>

        <div class="mt-4 grid flex-1 grid-cols-5 gap-4">
          <div class="col-span-3 flex flex-col justify-center gap-3">
            <div class="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3">
              <div class="text-[11px] uppercase tracking-wider text-slate-500">Jami talabalar</div>
              <div class="mt-1 text-4xl font-bold tabular-nums text-slate-100">{{ fmt(TOTAL_STUDENTS) }}</div>
            </div>

            <div class="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3">
              <div class="flex items-center justify-between">
                <span class="text-[11px] uppercase tracking-wider text-emerald-300">To'lagan</span>
                <span class="text-[11px] text-emerald-400/80">{{ Math.round((STUDENTS_PAID / TOTAL_STUDENTS) * 100) }}%</span>
              </div>
              <div class="mt-1 text-2xl font-bold tabular-nums text-emerald-300">{{ fmt(STUDENTS_PAID) }}</div>
            </div>

            <div class="rounded-xl border border-orange-500/40 bg-orange-500/10 px-4 py-3 ring-1 ring-orange-500/20">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                  <AlertTriangleIcon class="size-3.5 text-orange-400" />
                  <span class="text-[11px] uppercase tracking-wider text-orange-300">Qarzdor</span>
                </div>
                <span class="text-[11px] text-orange-400/80">{{ Math.round((STUDENTS_DEBT / TOTAL_STUDENTS) * 100) }}%</span>
              </div>
              <div class="mt-1 text-2xl font-bold tabular-nums text-orange-400">{{ fmt(STUDENTS_DEBT) }}</div>
            </div>
          </div>

          <div class="col-span-2 relative flex items-center justify-center">
            <VChart :option="financialOption" autoresize class="h-full w-full" />
            <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center -translate-y-2">
              <div class="text-[10px] uppercase tracking-wider text-slate-500">Qarzdorlik</div>
              <div class="text-2xl font-bold tabular-nums text-orange-400">
                {{ Math.round((STUDENTS_DEBT / TOTAL_STUDENTS) * 100) }}%
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Q3: Attendance -->
      <section class="flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UsersIcon class="size-4 text-sky-400" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Talabalar davomati
            </h2>
          </div>
          <span class="text-[11px] text-slate-500">Haftalik tendentsiya</span>
        </div>

        <div class="mt-4 grid grid-cols-3 gap-3">
          <div class="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3">
            <div class="text-[10px] uppercase tracking-wider text-slate-500">Faol talabalar</div>
            <div class="mt-1 text-2xl font-bold tabular-nums text-slate-100">{{ fmt(TOTAL_STUDENTS) }}</div>
          </div>
          <div class="rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-3">
            <div class="text-[10px] uppercase tracking-wider text-sky-300">Bugun</div>
            <div class="mt-1 text-2xl font-bold tabular-nums text-sky-300">{{ TODAY_ATTENDANCE }}%</div>
          </div>
          <div
            :class="[
              'rounded-xl border px-4 py-3',
              ATTENDANCE_DELTA >= 0 ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-rose-500/30 bg-rose-500/10',
            ]"
          >
            <div class="text-[10px] uppercase tracking-wider text-slate-500">Kechagiga nisbatan</div>
            <div
              :class="[
                'mt-1 flex items-center gap-1 text-2xl font-bold tabular-nums',
                ATTENDANCE_DELTA >= 0 ? 'text-emerald-400' : 'text-rose-400',
              ]"
            >
              <ArrowUpIcon v-if="ATTENDANCE_DELTA >= 0" class="size-5" />
              <ArrowDownIcon v-else class="size-5" />
              {{ ATTENDANCE_DELTA >= 0 ? '+' : '' }}{{ ATTENDANCE_DELTA }}%
            </div>
          </div>
        </div>

        <div class="mt-4 min-h-0 flex-1">
          <VChart :option="attendanceOption" autoresize class="h-full w-full" />
        </div>
      </section>

      <!-- Q4: Academic Performance -->
      <section class="flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <GraduationCapIcon class="size-4 text-violet-400" />
            <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-300">
              O'zlashtirish ko'rsatkichi
            </h2>
          </div>
          <span class="text-[11px] text-slate-500">Joriy semestr</span>
        </div>

        <div class="mt-4 grid grid-cols-4 gap-3">
          <div class="col-span-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3">
            <div class="text-[10px] uppercase tracking-wider text-violet-300">O'rtacha GPA</div>
            <div class="mt-1 flex items-baseline gap-2">
              <span class="text-3xl font-bold tabular-nums text-violet-300">{{ gpa }}</span>
              <span class="text-xs text-slate-500">/ 5.00</span>
            </div>
          </div>
          <div class="rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-3">
            <div class="text-[10px] uppercase tracking-wider text-slate-500">Baholanganlar</div>
            <div class="mt-1 text-xl font-bold tabular-nums text-slate-100">{{ fmt(totalGraded) }}</div>
          </div>
          <div class="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-3">
            <div class="text-[10px] uppercase tracking-wider text-rose-300">Yiqilgan</div>
            <div class="mt-1 text-xl font-bold tabular-nums text-rose-400">{{ fmt(GRADES[3].count) }}</div>
          </div>
        </div>

        <div class="mt-4 min-h-0 flex-1">
          <VChart :option="performanceOption" autoresize class="h-full w-full" />
        </div>
      </section>
    </div>
  </div>
</template>
