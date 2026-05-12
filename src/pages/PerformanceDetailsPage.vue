<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  ArrowLeftIcon,
  AlertTriangleIcon,
  BookOpenIcon,
  TrendingDownIcon,
  UsersIcon,
  XCircleIcon,
} from 'lucide-vue-next'
import ThemeToggle from '@/components/ThemeToggle.vue'

type FacultyId = 'ped' | 'it' | 'fil' | 'mat' | 'tar'

interface Faculty { id: FacultyId; name: string }

interface Subject {
  id: string
  name: string
  facultyId: FacultyId
  fails: number
}

interface Student {
  id: number
  name: string
  group: string
  facultyId: FacultyId
  failedSubject: string
  grade: '2' | 'F'
  gpa: number
}

const FACULTIES: Faculty[] = [
  { id: 'ped', name: 'Pedagogika' },
  { id: 'it',  name: 'Axborot texnologiyalari' },
  { id: 'fil', name: 'Filologiya' },
  { id: 'mat', name: 'Matematika' },
  { id: 'tar', name: 'Tarix' },
]

const facultyName = (id: FacultyId) => FACULTIES.find(f => f.id === id)?.name ?? id

const SUBJECTS = ref<Subject[]>([
  { id: 's1',  name: 'Oliy matematika',         facultyId: 'mat', fails: 45 },
  { id: 's2',  name: 'Algoritmlar va ma\'lumotlar tuzilmasi', facultyId: 'it',  fails: 38 },
  { id: 's3',  name: 'Diskret matematika',      facultyId: 'mat', fails: 32 },
  { id: 's4',  name: 'Fizika',                  facultyId: 'mat', fails: 29 },
  { id: 's5',  name: 'Operatsion tizimlar',     facultyId: 'it',  fails: 27 },
  { id: 's6',  name: 'Pedagogika nazariyasi',   facultyId: 'ped', fails: 24 },
  { id: 's7',  name: 'Ma\'lumotlar bazasi',     facultyId: 'it',  fails: 22 },
  { id: 's8',  name: 'Ona tili va adabiyot',    facultyId: 'fil', fails: 19 },
  { id: 's9',  name: 'Jahon tarixi',            facultyId: 'tar', fails: 17 },
  { id: 's10', name: 'Psixologiya',             facultyId: 'ped', fails: 16 },
  { id: 's11', name: 'Tilshunoslik',            facultyId: 'fil', fails: 14 },
  { id: 's12', name: 'O\'zbekiston tarixi',     facultyId: 'tar', fails: 12 },
])

const STUDENTS = ref<Student[]>([
  { id: 1,  name: 'Azizov Jasur',        group: 'MAT 24/3', facultyId: 'mat', failedSubject: 'Oliy matematika',       grade: '2', gpa: 2.1 },
  { id: 2,  name: 'Karimova Dilnoza',    group: 'IT 23/2',  facultyId: 'it',  failedSubject: 'Algoritmlar va ma\'lumotlar tuzilmasi', grade: 'F', gpa: 1.9 },
  { id: 3,  name: 'Rahmonov Sherzod',    group: 'IT 22/1',  facultyId: 'it',  failedSubject: 'Operatsion tizimlar',  grade: '2', gpa: 2.3 },
  { id: 4,  name: 'Yusupova Madina',     group: 'FIL 24/2', facultyId: 'fil', failedSubject: 'Ona tili va adabiyot', grade: '2', gpa: 2.4 },
  { id: 5,  name: "To'rayev Bekzod",     group: 'MAT 24/3', facultyId: 'mat', failedSubject: 'Fizika',                grade: 'F', gpa: 1.7 },
  { id: 6,  name: 'Ismoilov Doniyor',    group: 'PED 22/1', facultyId: 'ped', failedSubject: 'Pedagogika nazariyasi', grade: '2', gpa: 2.2 },
  { id: 7,  name: 'Saidova Nilufar',     group: 'TAR 23/1', facultyId: 'tar', failedSubject: 'Jahon tarixi',          grade: '2', gpa: 2.5 },
  { id: 8,  name: 'Olimov Sardor',       group: 'IT 23/2',  facultyId: 'it',  failedSubject: 'Ma\'lumotlar bazasi',  grade: 'F', gpa: 1.8 },
  { id: 9,  name: 'Hamidova Gulchehra',  group: 'FIL 23/1', facultyId: 'fil', failedSubject: 'Tilshunoslik',          grade: '2', gpa: 2.3 },
  { id: 10, name: 'Nazarov Akmal',       group: 'MAT 23/2', facultyId: 'mat', failedSubject: 'Diskret matematika',    grade: '2', gpa: 2.4 },
  { id: 11, name: 'Mirzayeva Zarina',    group: 'PED 24/2', facultyId: 'ped', failedSubject: 'Psixologiya',           grade: 'F', gpa: 1.95 },
  { id: 12, name: 'Qodirov Otabek',      group: 'IT 24/1',  facultyId: 'it',  failedSubject: 'Algoritmlar va ma\'lumotlar tuzilmasi', grade: '2', gpa: 2.2 },
  { id: 13, name: 'Salimova Mohira',     group: 'TAR 24/1', facultyId: 'tar', failedSubject: 'O\'zbekiston tarixi',  grade: '2', gpa: 2.6 },
  { id: 14, name: "Eshmatov O'tkir",     group: 'MAT 24/3', facultyId: 'mat', failedSubject: 'Oliy matematika',       grade: 'F', gpa: 1.6 },
  { id: 15, name: 'Abdullayeva Sevara',  group: 'PED 22/1', facultyId: 'ped', failedSubject: 'Pedagogika nazariyasi', grade: '2', gpa: 2.4 },
  { id: 16, name: 'Tursunov Jahongir',   group: 'FIL 24/2', facultyId: 'fil', failedSubject: 'Ona tili va adabiyot', grade: '2', gpa: 2.5 },
  { id: 17, name: 'Ergashev Rustam',     group: 'IT 23/2',  facultyId: 'it',  failedSubject: 'Operatsion tizimlar',  grade: 'F', gpa: 1.85 },
  { id: 18, name: 'Zokirova Shahnoza',   group: 'MAT 23/2', facultyId: 'mat', failedSubject: 'Diskret matematika',    grade: '2', gpa: 2.3 },
])

const selectedFaculty = ref<'all' | FacultyId>('all')

const filteredSubjects = computed(() => {
  const list = selectedFaculty.value === 'all'
    ? SUBJECTS.value
    : SUBJECTS.value.filter(s => s.facultyId === selectedFaculty.value)
  return [...list].sort((a, b) => b.fails - a.fails)
})

const topBottlenecks = computed(() => filteredSubjects.value.slice(0, 7))

const filteredStudents = computed(() => {
  const list = selectedFaculty.value === 'all'
    ? STUDENTS.value
    : STUDENTS.value.filter(s => s.facultyId === selectedFaculty.value)
  return [...list].sort((a, b) => a.gpa - b.gpa)
})

const maxFails = computed(() =>
  topBottlenecks.value.reduce((m, s) => Math.max(m, s.fails), 0) || 1,
)

const totals = computed(() => {
  const fails = filteredSubjects.value.reduce((s, x) => s + x.fails, 0)
  const studs = filteredStudents.value
  const avgGpa = studs.length
    ? studs.reduce((s, x) => s + x.gpa, 0) / studs.length
    : 0
  const critical = studs.filter(s => s.gpa < 2.0).length
  return {
    subjects: filteredSubjects.value.length,
    fails,
    atRisk: studs.length,
    avgGpa: Math.round(avgGpa * 100) / 100,
    critical,
  }
})

function barColor(fails: number) {
  if (fails >= 35) return 'from-rose-500 to-red-600'
  if (fails >= 20) return 'from-orange-400 to-orange-600'
  return 'from-amber-300 to-amber-500'
}

function gpaCls(gpa: number) {
  if (gpa < 2.0) return 'text-rose-700 dark:text-rose-300'
  if (gpa < 2.5) return 'text-orange-700 dark:text-orange-300'
  return 'text-amber-700 dark:text-amber-300'
}

function riskBadge(gpa: number) {
  if (gpa < 2.0) return { label: 'Kritik xavf', cls: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30' }
  if (gpa < 2.5) return { label: 'Yuqori xavf', cls: 'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/30' }
  return { label: 'Xavf ostida', cls: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30' }
}
</script>

<template>
  <div class="min-h-screen w-full bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
    <header class="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800 sm:px-6">
      <RouterLink
        to="/monitoring"
        class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      >
        <ArrowLeftIcon class="size-4" />
        Orqaga
      </RouterLink>
      <div class="flex items-center gap-3">
        <h1 class="hidden text-base font-semibold text-slate-800 dark:text-slate-100 sm:block">
          O'zlashtirish tafsilotlari
        </h1>
        <ThemeToggle />
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Akademik o'zlashtirish
          </h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Qiyin fanlar va xavf ostidagi talabalar tahlili
          </p>
        </div>
        <label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <span class="font-medium">Fakultet:</span>
          <select
            v-model="selectedFaculty"
            class="min-w-[200px] cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:border-slate-300 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-500 dark:focus:ring-sky-900/40"
          >
            <option value="all">Barcha fakultetlar</option>
            <option v-for="f in FACULTIES" :key="f.id" :value="f.id">{{ f.name }}</option>
          </select>
        </label>
      </div>

      <div class="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Fanlar</span>
            <BookOpenIcon class="size-4 text-slate-400" />
          </div>
          <p class="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{{ totals.subjects }}</p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Yiqilganlar</span>
            <XCircleIcon class="size-4 text-rose-500" />
          </div>
          <p class="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">{{ totals.fails }}</p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">O'rtacha GPA</span>
            <TrendingDownIcon class="size-4 text-orange-500" />
          </div>
          <p class="mt-2 text-2xl font-bold text-orange-600 dark:text-orange-400">{{ totals.avgGpa.toFixed(2) }}</p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Kritik xavf</span>
            <UsersIcon class="size-4 text-rose-500" />
          </div>
          <p class="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">{{ totals.critical }}</p>
        </div>
      </div>

      <section class="mt-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <header class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <AlertTriangleIcon class="size-5 text-orange-500" />
            <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">
              "Bottleneck" fanlar — eng ko'p yiqilgan
            </h3>
          </div>
          <span class="text-xs text-slate-500 dark:text-slate-400">
            {{ selectedFaculty === 'all' ? 'Barcha fakultetlar' : facultyName(selectedFaculty) }}
          </span>
        </header>

        <div class="mt-5 space-y-3">
          <div v-for="s in topBottlenecks" :key="s.id" class="group">
            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0">
                <p class="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{{ s.name }}</p>
                <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{{ facultyName(s.facultyId) }}</p>
              </div>
              <span class="shrink-0 rounded-md bg-rose-50 px-2 py-0.5 text-sm font-bold tabular-nums text-rose-700 ring-1 ring-inset ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30">
                {{ s.fails }}
              </span>
            </div>
            <div class="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700/60">
              <div
                class="h-full rounded-full bg-gradient-to-r transition-all duration-500"
                :class="barColor(s.fails)"
                :style="{ width: (s.fails / maxFails * 100) + '%' }"
              ></div>
            </div>
          </div>
          <div v-if="!topBottlenecks.length" class="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            Ushbu fakultet bo'yicha fanlar topilmadi
          </div>
        </div>
      </section>

      <section class="mt-6 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <header class="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <div>
            <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">
              Xavf ostidagi talabalar
            </h3>
            <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Yaqinda "2" yoki "F" baho olgan talabalar
            </p>
          </div>
          <span class="text-xs text-slate-500 dark:text-slate-400">
            {{ filteredStudents.length }} ta talaba
          </span>
        </header>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-900/40 dark:text-slate-400">
              <tr>
                <th class="px-5 py-3">#</th>
                <th class="px-5 py-3">Talaba</th>
                <th class="px-5 py-3">Guruh</th>
                <th class="px-5 py-3">Fakultet</th>
                <th class="px-5 py-3">Yiqilgan fan</th>
                <th class="px-5 py-3 text-center">Baho</th>
                <th class="px-5 py-3 text-center">GPA</th>
                <th class="px-5 py-3 text-center">Holat</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(s, i) in filteredStudents"
                :key="s.id"
                class="border-t border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-700/60 dark:hover:bg-slate-700/30"
              >
                <td class="px-5 py-3 text-slate-400">{{ i + 1 }}</td>
                <td class="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">{{ s.name }}</td>
                <td class="px-5 py-3 text-slate-600 dark:text-slate-300">{{ s.group }}</td>
                <td class="px-5 py-3 text-slate-600 dark:text-slate-300">{{ facultyName(s.facultyId) }}</td>
                <td class="px-5 py-3 text-slate-700 dark:text-slate-200">{{ s.failedSubject }}</td>
                <td class="px-5 py-3 text-center">
                  <span class="inline-flex min-w-[2rem] items-center justify-center rounded-md bg-rose-50 px-2 py-1 text-sm font-bold text-rose-700 ring-1 ring-inset ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30">
                    {{ s.grade }}
                  </span>
                </td>
                <td class="px-5 py-3 text-center">
                  <span class="font-bold tabular-nums" :class="gpaCls(s.gpa)">{{ s.gpa.toFixed(2) }}</span>
                </td>
                <td class="px-5 py-3 text-center">
                  <span
                    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
                    :class="riskBadge(s.gpa).cls"
                  >
                    <AlertTriangleIcon class="size-3" />
                    {{ riskBadge(s.gpa).label }}
                  </span>
                </td>
              </tr>
              <tr v-if="!filteredStudents.length">
                <td colspan="8" class="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                  Ushbu fakultet bo'yicha xavf ostidagi talabalar topilmadi
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>
</template>
