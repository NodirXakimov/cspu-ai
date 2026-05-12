<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components'
import {
  ArrowLeftIcon,
  WalletIcon,
  UsersIcon,
  AlertTriangleIcon,
  TrendingDownIcon,
} from 'lucide-vue-next'
import ThemeToggle from '@/components/ThemeToggle.vue'
import LangSwitcher from '@/components/LangSwitcher.vue'
import { useTheme } from '@/composables/useTheme'
import { useI18n } from '@/composables/useI18n'

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent, LegendComponent])

type FacultyId = 'ped' | 'it' | 'fil' | 'mat' | 'tar'

interface Debtor {
  id: number
  name: string
  group: string
  facultyId: FacultyId
  course: 1 | 2 | 3 | 4
  debt: number
}

const FACULTY_IDS: FacultyId[] = ['ped', 'it', 'fil', 'mat', 'tar']

const DEBTORS = ref<Debtor[]>([
  { id: 1,  name: 'Azizov Jasur',         group: 'PED-21-A', facultyId: 'ped', course: 1, debt: 8_400_000 },
  { id: 2,  name: 'Karimova Dilnoza',     group: 'IT-22-B',  facultyId: 'it',  course: 2, debt: 12_500_000 },
  { id: 3,  name: 'Rahmonov Sherzod',     group: 'IT-20-A',  facultyId: 'it',  course: 4, debt: 15_200_000 },
  { id: 4,  name: 'Yusupova Madina',      group: 'FIL-22-A', facultyId: 'fil', course: 2, debt: 6_700_000 },
  { id: 5,  name: "To'rayev Bekzod",      group: 'MAT-21-B', facultyId: 'mat', course: 3, debt: 9_100_000 },
  { id: 6,  name: 'Ismoilov Doniyor',     group: 'PED-20-B', facultyId: 'ped', course: 4, debt: 11_800_000 },
  { id: 7,  name: 'Saidova Nilufar',      group: 'TAR-23-A', facultyId: 'tar', course: 1, debt: 5_300_000 },
  { id: 8,  name: 'Olimov Sardor',        group: 'IT-21-C',  facultyId: 'it',  course: 3, debt: 13_900_000 },
  { id: 9,  name: 'Hamidova Gulchehra',   group: 'FIL-20-A', facultyId: 'fil', course: 4, debt: 10_400_000 },
  { id: 10, name: 'Nazarov Akmal',        group: 'MAT-22-A', facultyId: 'mat', course: 2, debt: 7_600_000 },
  { id: 11, name: 'Mirzayeva Zarina',     group: 'PED-23-A', facultyId: 'ped', course: 1, debt: 4_900_000 },
  { id: 12, name: 'Qodirov Otabek',       group: 'IT-23-A',  facultyId: 'it',  course: 1, debt: 9_800_000 },
  { id: 13, name: 'Salimova Mohira',      group: 'TAR-21-A', facultyId: 'tar', course: 3, debt: 8_200_000 },
  { id: 14, name: "Eshmatov O'tkir",      group: 'MAT-20-A', facultyId: 'mat', course: 4, debt: 14_100_000 },
  { id: 15, name: 'Abdullayeva Sevara',   group: 'PED-22-A', facultyId: 'ped', course: 2, debt: 7_300_000 },
  { id: 16, name: 'Tursunov Jahongir',    group: 'FIL-21-B', facultyId: 'fil', course: 3, debt: 6_100_000 },
])

const selectedFaculty = ref<'all' | FacultyId>('all')
const { isDark } = useTheme()
const { t, locale } = useI18n()

const facultyName = (id: FacultyId) => t(`fac.${id}`)

const filtered = computed(() =>
  selectedFaculty.value === 'all'
    ? DEBTORS.value
    : DEBTORS.value.filter(d => d.facultyId === selectedFaculty.value),
)

const topDebtors = computed(() =>
  [...filtered.value].sort((a, b) => b.debt - a.debt).slice(0, 10),
)

const totals = computed(() => {
  const list = filtered.value
  const total = list.reduce((sum, d) => sum + d.debt, 0)
  const max = list.reduce((m, d) => Math.max(m, d.debt), 0)
  return {
    count: list.length,
    total,
    avg: list.length ? Math.round(total / list.length) : 0,
    max,
  }
})

const debtByCourse = computed(() => {
  const buckets = [0, 0, 0, 0]
  for (const d of filtered.value) buckets[d.course - 1] += d.debt
  return buckets
})

const currency = (v: number) =>
  new Intl.NumberFormat(locale.value).format(v) + ' ' + t('fd.currency')

const chartOption = computed(() => {
  const dark = isDark.value
  const axisColor = dark ? '#cbd5e1' : '#475569'
  const gridColor = dark ? 'rgba(148,163,184,0.18)' : 'rgba(100,116,139,0.18)'
  return {
    grid: { left: 70, right: 24, top: 30, bottom: 36 },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: (v: number) => currency(v),
    },
    xAxis: {
      type: 'category',
      data: [1, 2, 3, 4].map(n => t('fd.year', { n })),
      axisLine: { lineStyle: { color: gridColor } },
      axisLabel: { color: axisColor, fontWeight: 600 },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: gridColor } },
      axisLabel: {
        color: axisColor,
        formatter: (v: number) =>
          v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${v / 1_000}K`,
      },
    },
    series: [
      {
        name: t('fd.chart.series'),
        type: 'bar',
        data: debtByCourse.value,
        barWidth: '46%',
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#f87171' },
              { offset: 1, color: '#dc2626' },
            ],
          },
        },
      },
    ],
  }
})
</script>

<template>
  <div class="min-h-screen w-full bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
    <header class="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800 sm:px-6">
      <RouterLink
        to="/monitoring"
        class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        <ArrowLeftIcon class="size-4" />
        {{ t('dd.back') }}
      </RouterLink>

      <div class="flex items-center gap-3">
        <h1 class="hidden text-base font-semibold text-slate-800 dark:text-slate-100 sm:block">
          {{ t('fd.header') }}
        </h1>
        <LangSwitcher />
        <ThemeToggle />
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {{ t('fd.title') }}
          </h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {{ t('fd.subtitle') }}
          </p>
        </div>

        <label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <span class="font-medium">{{ t('dd.faculty_label') }}</span>
          <select
            v-model="selectedFaculty"
            class="min-w-[200px] cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:border-slate-300 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-500 dark:focus:ring-sky-900/40"
          >
            <option value="all">{{ t('dd.all_faculties') }}</option>
            <option v-for="id in FACULTY_IDS" :key="id" :value="id">{{ facultyName(id) }}</option>
          </select>
        </label>
      </div>

      <div class="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {{ t('fd.stat.debtors') }}
            </span>
            <UsersIcon class="size-4 text-slate-400" />
          </div>
          <p class="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{{ totals.count }}</p>
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {{ t('fd.stat.total') }}
            </span>
            <WalletIcon class="size-4 text-rose-500" />
          </div>
          <p class="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">{{ currency(totals.total) }}</p>
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {{ t('fd.stat.avg') }}
            </span>
            <TrendingDownIcon class="size-4 text-amber-500" />
          </div>
          <p class="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{{ currency(totals.avg) }}</p>
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {{ t('fd.stat.max') }}
            </span>
            <AlertTriangleIcon class="size-4 text-rose-500" />
          </div>
          <p class="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{{ currency(totals.max) }}</p>
        </div>
      </div>

      <section class="mt-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <header class="flex items-center justify-between">
          <div>
            <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">
              {{ t('fd.chart.title') }}
            </h3>
            <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {{ selectedFaculty === 'all' ? t('dd.all_label') : facultyName(selectedFaculty) }}
            </p>
          </div>
        </header>
        <VChart :option="chartOption" autoresize class="mt-4 h-[320px] w-full" />
      </section>

      <section class="mt-6 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <header class="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">
            {{ t('fd.table.title') }}
          </h3>
          <span class="text-xs text-slate-500 dark:text-slate-400">
            {{ t('dd.students_count', { n: topDebtors.length }) }}
          </span>
        </header>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-900/40 dark:text-slate-400">
              <tr>
                <th class="px-5 py-3">#</th>
                <th class="px-5 py-3">{{ t('dd.col.student') }}</th>
                <th class="px-5 py-3">{{ t('dd.col.group') }}</th>
                <th class="px-5 py-3">{{ t('dd.col.faculty') }}</th>
                <th class="px-5 py-3 text-right">{{ t('fd.col.debt') }}</th>
                <th class="px-5 py-3 text-center">{{ t('dd.col.status') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(d, i) in topDebtors"
                :key="d.id"
                class="border-t border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-700/60 dark:hover:bg-slate-700/30"
              >
                <td class="px-5 py-3 text-slate-400">{{ i + 1 }}</td>
                <td class="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">{{ d.name }}</td>
                <td class="px-5 py-3 text-slate-600 dark:text-slate-300">{{ d.group }}</td>
                <td class="px-5 py-3 text-slate-600 dark:text-slate-300">{{ facultyName(d.facultyId) }}</td>
                <td class="px-5 py-3 text-right font-semibold tabular-nums text-rose-600 dark:text-rose-400">
                  {{ currency(d.debt) }}
                </td>
                <td class="px-5 py-3 text-center">
                  <span class="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30">
                    <span class="size-1.5 rounded-full bg-rose-500"></span>
                    {{ t('fd.badge.unpaid') }}
                  </span>
                </td>
              </tr>
              <tr v-if="!topDebtors.length">
                <td colspan="6" class="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                  {{ t('fd.empty') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>
</template>
