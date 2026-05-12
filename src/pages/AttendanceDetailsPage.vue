<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  ArrowLeftIcon,
  AlertTriangleIcon,
  UserXIcon,
  UsersIcon,
  TrendingDownIcon,
  CalendarXIcon,
} from 'lucide-vue-next'
import ThemeToggle from '@/components/ThemeToggle.vue'

type FacultyId = 'ped' | 'it' | 'fil' | 'mat' | 'tar'

interface Faculty {
  id: FacultyId
  name: string
}

interface Group {
  id: string
  name: string
  facultyId: FacultyId
  total: number
  presentToday: number
}

interface Absentee {
  id: number
  name: string
  group: string
  facultyId: FacultyId
  missed: number // missed classes this week
}

const FACULTIES: Faculty[] = [
  { id: 'ped', name: 'Pedagogika' },
  { id: 'it',  name: 'Axborot texnologiyalari' },
  { id: 'fil', name: 'Filologiya' },
  { id: 'mat', name: 'Matematika' },
  { id: 'tar', name: 'Tarix' },
]

const facultyName = (id: FacultyId) => FACULTIES.find(f => f.id === id)?.name ?? id

const GROUPS = ref<Group[]>([
  { id: 'g1',  name: 'MAT 24/3',  facultyId: 'mat', total: 26, presentToday: 17 }, // 65%
  { id: 'g2',  name: 'IT 23/2',   facultyId: 'it',  total: 28, presentToday: 19 }, // 68%
  { id: 'g3',  name: 'PED 22/1',  facultyId: 'ped', total: 25, presentToday: 18 }, // 72%
  { id: 'g4',  name: 'FIL 24/2',  facultyId: 'fil', total: 24, presentToday: 18 }, // 75%
  { id: 'g5',  name: 'TAR 23/1',  facultyId: 'tar', total: 22, presentToday: 17 }, // 77%
  { id: 'g6',  name: 'IT 22/1',   facultyId: 'it',  total: 27, presentToday: 22 }, // 81%
  { id: 'g7',  name: 'MAT 23/2',  facultyId: 'mat', total: 25, presentToday: 21 }, // 84%
  { id: 'g8',  name: 'PED 24/2',  facultyId: 'ped', total: 26, presentToday: 23 }, // 88%
  { id: 'g9',  name: 'FIL 23/1',  facultyId: 'fil', total: 23, presentToday: 21 }, // 91%
  { id: 'g10', name: 'TAR 24/1',  facultyId: 'tar', total: 24, presentToday: 22 }, // 92%
  { id: 'g11', name: 'IT 24/1',   facultyId: 'it',  total: 28, presentToday: 26 }, // 93%
  { id: 'g12', name: 'MAT 22/1',  facultyId: 'mat', total: 22, presentToday: 21 }, // 95%
])

const ABSENTEES = ref<Absentee[]>([
  { id: 1,  name: 'Azizov Jasur',         group: 'MAT 24/3', facultyId: 'mat', missed: 8 },
  { id: 2,  name: 'Karimova Dilnoza',     group: 'IT 23/2',  facultyId: 'it',  missed: 7 },
  { id: 3,  name: 'Rahmonov Sherzod',     group: 'IT 22/1',  facultyId: 'it',  missed: 6 },
  { id: 4,  name: 'Yusupova Madina',      group: 'FIL 24/2', facultyId: 'fil', missed: 5 },
  { id: 5,  name: "To'rayev Bekzod",      group: 'MAT 24/3', facultyId: 'mat', missed: 9 },
  { id: 6,  name: 'Ismoilov Doniyor',     group: 'PED 22/1', facultyId: 'ped', missed: 6 },
  { id: 7,  name: 'Saidova Nilufar',      group: 'TAR 23/1', facultyId: 'tar', missed: 4 },
  { id: 8,  name: 'Olimov Sardor',        group: 'IT 23/2',  facultyId: 'it',  missed: 5 },
  { id: 9,  name: 'Hamidova Gulchehra',   group: 'FIL 23/1', facultyId: 'fil', missed: 4 },
  { id: 10, name: 'Nazarov Akmal',        group: 'MAT 23/2', facultyId: 'mat', missed: 5 },
  { id: 11, name: 'Mirzayeva Zarina',     group: 'PED 24/2', facultyId: 'ped', missed: 4 },
  { id: 12, name: 'Qodirov Otabek',       group: 'IT 24/1',  facultyId: 'it',  missed: 4 },
  { id: 13, name: 'Salimova Mohira',      group: 'TAR 24/1', facultyId: 'tar', missed: 5 },
  { id: 14, name: "Eshmatov O'tkir",      group: 'MAT 24/3', facultyId: 'mat', missed: 7 },
  { id: 15, name: 'Abdullayeva Sevara',   group: 'PED 22/1', facultyId: 'ped', missed: 6 },
  { id: 16, name: 'Tursunov Jahongir',    group: 'FIL 24/2', facultyId: 'fil', missed: 4 },
  { id: 17, name: 'Ergashev Rustam',      group: 'IT 23/2',  facultyId: 'it',  missed: 8 },
  { id: 18, name: 'Zokirova Shahnoza',    group: 'MAT 23/2', facultyId: 'mat', missed: 4 },
])

const selectedFaculty = ref<'all' | FacultyId>('all')

const filteredGroups = computed(() =>
  selectedFaculty.value === 'all'
    ? GROUPS.value
    : GROUPS.value.filter(g => g.facultyId === selectedFaculty.value),
)

const filteredAbsentees = computed(() =>
  (selectedFaculty.value === 'all'
    ? ABSENTEES.value
    : ABSENTEES.value.filter(a => a.facultyId === selectedFaculty.value))
    .filter(a => a.missed > 3)
    .sort((a, b) => b.missed - a.missed),
)

const lowestGroups = computed(() =>
  [...filteredGroups.value]
    .map(g => ({
      ...g,
      attendance: g.total ? Math.round((g.presentToday / g.total) * 100) : 0,
      absent: g.total - g.presentToday,
    }))
    .sort((a, b) => a.attendance - b.attendance)
    .slice(0, 5),
)

const totals = computed(() => {
  const total = filteredGroups.value.reduce((s, g) => s + g.total, 0)
  const present = filteredGroups.value.reduce((s, g) => s + g.presentToday, 0)
  const absent = total - present
  return {
    groups: filteredGroups.value.length,
    avgAttendance: total ? Math.round((present / total) * 100) : 0,
    absentToday: absent,
    chronic: filteredAbsentees.value.length,
  }
})

function severityClasses(pct: number) {
  if (pct < 70) {
    return {
      bar: 'bg-gradient-to-r from-rose-500 to-red-600',
      text: 'text-rose-700 dark:text-rose-300',
      ring: 'ring-rose-200 dark:ring-rose-500/30',
      badge: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
      label: 'Kritik',
    }
  }
  if (pct < 80) {
    return {
      bar: 'bg-gradient-to-r from-orange-400 to-orange-600',
      text: 'text-orange-700 dark:text-orange-300',
      ring: 'ring-orange-200 dark:ring-orange-500/30',
      badge: 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300',
      label: 'Yuqori',
    }
  }
  return {
    bar: 'bg-gradient-to-r from-amber-300 to-amber-500',
    text: 'text-amber-700 dark:text-amber-300',
    ring: 'ring-amber-200 dark:ring-amber-500/30',
    badge: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    label: "O'rta",
  }
}

function missedSeverity(n: number) {
  if (n >= 7) return { label: 'Kritik', cls: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30' }
  if (n >= 5) return { label: 'Yuqori', cls: 'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/30' }
  return { label: 'Ogohlantirish', cls: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30' }
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
          Davomat tafsilotlari
        </h1>
        <ThemeToggle />
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Talabalar davomati
          </h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Bugungi past davomatga ega guruhlar va surunkali davomatsiz talabalar
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

      <!-- Stat cards -->
      <div class="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Guruhlar</span>
            <UsersIcon class="size-4 text-slate-400" />
          </div>
          <p class="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{{ totals.groups }}</p>
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">O'rtacha davomat</span>
            <TrendingDownIcon class="size-4 text-emerald-500" />
          </div>
          <p
            class="mt-2 text-2xl font-bold"
            :class="totals.avgAttendance < 80 ? 'text-orange-600 dark:text-orange-400' : 'text-emerald-600 dark:text-emerald-400'"
          >
            {{ totals.avgAttendance }}%
          </p>
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Bugun davomatsiz</span>
            <CalendarXIcon class="size-4 text-orange-500" />
          </div>
          <p class="mt-2 text-2xl font-bold text-orange-600 dark:text-orange-400">{{ totals.absentToday }}</p>
        </div>

        <div class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Surunkali</span>
            <UserXIcon class="size-4 text-rose-500" />
          </div>
          <p class="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">{{ totals.chronic }}</p>
        </div>
      </div>

      <!-- Lowest attendance groups -->
      <section class="mt-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <header class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <AlertTriangleIcon class="size-5 text-orange-500" />
            <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">
              Eng past davomatli 5 ta guruh (bugun)
            </h3>
          </div>
          <span class="text-xs text-slate-500 dark:text-slate-400">
            {{ selectedFaculty === 'all' ? 'Barcha fakultetlar' : facultyName(selectedFaculty) }}
          </span>
        </header>

        <div class="mt-5 space-y-3">
          <div
            v-for="g in lowestGroups"
            :key="g.id"
            class="rounded-lg border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-900/30"
          >
            <div class="flex items-center justify-between gap-4">
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-slate-900 dark:text-slate-100">{{ g.name }}</span>
                  <span
                    class="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ring-1 ring-inset"
                    :class="[severityClasses(g.attendance).badge, severityClasses(g.attendance).ring]"
                  >
                    {{ severityClasses(g.attendance).label }}
                  </span>
                </div>
                <p class="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                  {{ facultyName(g.facultyId) }} · {{ g.presentToday }}/{{ g.total }} qatnashdi · {{ g.absent }} kelmadi
                </p>
              </div>
              <div class="text-right">
                <p class="text-2xl font-bold tabular-nums" :class="severityClasses(g.attendance).text">
                  {{ g.attendance }}%
                </p>
              </div>
            </div>

            <div class="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="severityClasses(g.attendance).bar"
                :style="{ width: g.attendance + '%' }"
              ></div>
            </div>
          </div>

          <div v-if="!lowestGroups.length" class="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            Ushbu fakultet bo'yicha guruhlar topilmadi
          </div>
        </div>
      </section>

      <!-- Chronic absentees -->
      <section class="mt-6 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <header class="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <div>
            <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100">
              Surunkali davomatsizlar
            </h3>
            <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Shu hafta 3 tadan ko'p darsni qoldirgan talabalar
            </p>
          </div>
          <span class="text-xs text-slate-500 dark:text-slate-400">
            {{ filteredAbsentees.length }} ta talaba
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
                <th class="px-5 py-3 text-center">Qoldirilgan darslar</th>
                <th class="px-5 py-3 text-center">Ogohlantirish</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(a, i) in filteredAbsentees"
                :key="a.id"
                class="border-t border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-700/60 dark:hover:bg-slate-700/30"
              >
                <td class="px-5 py-3 text-slate-400">{{ i + 1 }}</td>
                <td class="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">{{ a.name }}</td>
                <td class="px-5 py-3 text-slate-600 dark:text-slate-300">{{ a.group }}</td>
                <td class="px-5 py-3 text-slate-600 dark:text-slate-300">{{ facultyName(a.facultyId) }}</td>
                <td class="px-5 py-3 text-center">
                  <span class="inline-flex min-w-[2rem] items-center justify-center rounded-md bg-rose-50 px-2 py-1 text-sm font-bold tabular-nums text-rose-700 ring-1 ring-inset ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30">
                    {{ a.missed }}
                  </span>
                </td>
                <td class="px-5 py-3 text-center">
                  <span
                    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
                    :class="missedSeverity(a.missed).cls"
                  >
                    <AlertTriangleIcon class="size-3" />
                    {{ missedSeverity(a.missed).label }}
                  </span>
                </td>
              </tr>
              <tr v-if="!filteredAbsentees.length">
                <td colspan="6" class="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                  Ushbu fakultet bo'yicha surunkali davomatsizlar topilmadi
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>
</template>
