<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  ArrowLeftIcon,
  BuildingIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ClockIcon,
  AlertTriangleIcon,
  SearchIcon,
  XCircleIcon,
} from 'lucide-vue-next'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { LANGS, useI18n } from '@/composables/useI18n'
import { TEACHERS, SUBJECTS, statusFor, type Status } from '@/data/teachers'

const { lang, t } = useI18n()

const FACULTY_IDS = [
  'ped', 'mtm', 'bot', 'tsv', 'jis', 'spe',
  'mus', 'fil', 'tar', 'tab', 'mat', 'tur',
]

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const TODAY = todayKey()

const search = ref('')
const facultyFilter = ref<string>('') // '' = all
const subjectFilter = ref<string>('')
const dateFilter = ref<string>(TODAY)
const statusFilter = ref<'all' | Status>('all')

interface Row {
  id: string
  name: string
  facultyId: string
  subject: string
  group: string
  scheduledAt: string
  status: Status
  lateBy?: number
}

const rows = computed<Row[]>(() => {
  return TEACHERS.map(teacher => {
    const s = statusFor(teacher.id, dateFilter.value)
    return { ...teacher, status: s.status, lateBy: s.lateBy }
  })
})

const filtered = computed<Row[]>(() => {
  const q = search.value.trim().toLowerCase()
  return rows.value.filter(r => {
    if (facultyFilter.value && r.facultyId !== facultyFilter.value) return false
    if (subjectFilter.value && r.subject !== subjectFilter.value) return false
    if (statusFilter.value !== 'all' && r.status !== statusFilter.value) return false
    if (q && !r.name.toLowerCase().includes(q)) return false
    return true
  })
})

const counts = computed(() => ({
  total:   rows.value.length,
  present: rows.value.filter(r => r.status === 'present').length,
  late:    rows.value.filter(r => r.status === 'late').length,
  absent:  rows.value.filter(r => r.status === 'absent').length,
}))

function clearFilters() {
  search.value = ''
  facultyFilter.value = ''
  subjectFilter.value = ''
  statusFilter.value = 'all'
  dateFilter.value = TODAY
}

void lang // keep template reactive to language switches
</script>

<template>
  <div class="min-h-screen w-full bg-slate-50 text-slate-900 dark:bg-slate-800 dark:text-slate-100">
    <!-- Header -->
    <header class="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-600 dark:bg-slate-700/70 sm:px-6">
      <div class="flex items-center gap-3 min-w-0">
        <RouterLink
          to="/monitoring"
          class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          :title="t('td.back')"
        >
          <ArrowLeftIcon class="size-4" />
        </RouterLink>
        <div class="min-w-0">
          <h1 class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-700 dark:text-slate-200">
            {{ t('td.title') }}
          </h1>
          <p class="truncate text-[11px] text-slate-500 dark:text-slate-400 sm:text-xs">
            {{ t('app.university') }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <select
          v-model="lang"
          class="cursor-pointer rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
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
        <ThemeToggle />
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <!-- Filter bar -->
      <div class="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-600 dark:bg-slate-700/40 dark:shadow-none sm:grid-cols-2 lg:grid-cols-4">
        <!-- Search -->
        <label class="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-600 dark:bg-slate-800/60">
          <SearchIcon class="size-4 shrink-0 text-slate-400" />
          <input
            v-model="search"
            type="text"
            :placeholder="t('td.search.ph')"
            class="min-w-0 flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-slate-200"
          />
        </label>

        <!-- Faculty -->
        <label class="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-600 dark:bg-slate-800/60">
          <BuildingIcon class="size-4 shrink-0 text-slate-400" />
          <select
            v-model="facultyFilter"
            class="min-w-0 flex-1 cursor-pointer bg-transparent text-sm font-medium text-slate-800 focus:outline-none dark:text-slate-200"
          >
            <option value="" class="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100">{{ t('td.all_faculties') }}</option>
            <option
              v-for="id in FACULTY_IDS"
              :key="id"
              :value="id"
              class="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100"
            >
              {{ t(`fac.${id}`) }}
            </option>
          </select>
        </label>

        <!-- Subject -->
        <label class="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-600 dark:bg-slate-800/60">
          <span class="text-[10px] uppercase tracking-wider text-slate-400">{{ t('td.subject') }}</span>
          <select
            v-model="subjectFilter"
            class="min-w-0 flex-1 cursor-pointer bg-transparent text-sm font-medium text-slate-800 focus:outline-none dark:text-slate-200"
          >
            <option value="" class="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100">{{ t('td.all_subjects') }}</option>
            <option
              v-for="s in SUBJECTS"
              :key="s"
              :value="s"
              class="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100"
            >
              {{ s }}
            </option>
          </select>
        </label>

        <!-- Date -->
        <label class="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-600 dark:bg-slate-800/60">
          <CalendarIcon class="size-4 shrink-0 text-slate-400" />
          <input
            v-model="dateFilter"
            type="date"
            :max="TODAY"
            class="min-w-0 flex-1 bg-transparent text-sm font-medium tabular-nums text-slate-800 focus:outline-none dark:text-slate-200 dark:[color-scheme:dark]"
          />
        </label>
      </div>

      <!-- Status pills + clear -->
      <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div class="inline-flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-600 dark:bg-slate-700/40">
          <button
            v-for="opt in (['all', 'late', 'present', 'absent'] as const)"
            :key="opt"
            :class="[
              'rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors',
              statusFilter === opt
                ? opt === 'late'
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                  : opt === 'absent'
                    ? 'bg-slate-200 text-slate-700 dark:bg-slate-600/40 dark:text-slate-200'
                    : opt === 'present'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                      : 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
            ]"
            @click="statusFilter = opt"
          >
            <template v-if="opt === 'all'">
              {{ t('q1.total') }} · {{ counts.total }}
            </template>
            <template v-else-if="opt === 'late'">
              {{ t('td.status.late') }} · {{ counts.late }}
            </template>
            <template v-else-if="opt === 'present'">
              {{ t('td.status.present') }} · {{ counts.present }}
            </template>
            <template v-else>
              {{ t('td.status.absent') }} · {{ counts.absent }}
            </template>
          </button>
        </div>

        <div class="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>{{ t('td.results', { n: filtered.length }) }}</span>
          <button
            type="button"
            class="rounded-md px-2 py-1 font-medium text-sky-600 hover:bg-sky-50 hover:text-sky-700 dark:text-sky-400 dark:hover:bg-sky-500/10"
            @click="clearFilters"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Teacher list -->
      <ul class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        <li
          v-for="r in filtered"
          :key="r.id"
          :class="[
            'relative flex items-center gap-3 overflow-hidden rounded-2xl border bg-white p-4 shadow-sm dark:bg-slate-700/40 dark:shadow-none',
            r.status === 'late'
              ? 'border-rose-200 dark:border-rose-500/30'
              : r.status === 'absent'
                ? 'border-slate-200 dark:border-slate-600'
                : 'border-slate-200 dark:border-slate-600',
          ]"
        >
          <span
            :class="[
              'absolute inset-y-0 left-0 w-1',
              r.status === 'late' ? 'bg-rose-500'
              : r.status === 'absent' ? 'bg-slate-400 dark:bg-slate-500'
              : 'bg-emerald-500',
            ]"
          />

          <div
            :class="[
              'flex size-11 shrink-0 items-center justify-center rounded-xl',
              r.status === 'present' && 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
              r.status === 'late'    && 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300',
              r.status === 'absent'  && 'bg-slate-100 text-slate-500 dark:bg-slate-600/40 dark:text-slate-300',
            ]"
          >
            <CheckCircle2Icon v-if="r.status === 'present'" class="size-5" />
            <AlertTriangleIcon v-else-if="r.status === 'late'" class="size-5" />
            <XCircleIcon v-else class="size-5" />
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <p class="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{{ r.name }}</p>
              <span class="shrink-0 rounded-md border border-sky-200 bg-sky-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300">
                {{ r.group }}
              </span>
            </div>
            <p class="mt-0.5 truncate text-xs text-slate-500">
              {{ r.subject }} · {{ t(`fac.${r.facultyId}`) }}
            </p>
            <div class="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
              <span class="inline-flex items-center gap-1 text-slate-500">
                <ClockIcon class="size-3" />{{ r.scheduledAt }}
              </span>
              <span class="text-slate-300 dark:text-slate-600">·</span>
              <span
                :class="[
                  'font-semibold',
                  r.status === 'present' && 'text-emerald-600 dark:text-emerald-400',
                  r.status === 'late'    && 'text-rose-600 dark:text-rose-400',
                  r.status === 'absent'  && 'text-slate-500',
                ]"
              >
                {{ t(`td.status.${r.status}`) }}<template v-if="r.status === 'late' && r.lateBy"> · {{ t('td.late_by', { m: r.lateBy }) }}</template>
              </span>
            </div>
          </div>
        </li>
      </ul>

      <p v-if="filtered.length === 0" class="mt-10 text-center text-sm text-slate-500 dark:text-slate-400">
        {{ t('td.no_results') }}
      </p>
    </main>
  </div>
</template>
