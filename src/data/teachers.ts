// Mock teacher roster for the Teacher Discipline page.
// Real names + Uzbek course titles per CSPU faculties.

export interface Teacher {
  id: string
  name: string
  facultyId: string
  subject: string
  group: string
  scheduledAt: string // HH:MM
}

const FIRST_NAMES = [
  'Imamova U.', 'Karimov A.', 'Yusupova D.', 'Rahimov B.', 'Nafasov A.',
  'Jurayev H.', 'Kadirova X.', 'Sunnatov T.', 'Madalimov T.', 'Mutalova D.',
  'Urmanova T.', 'Tursunbayeva M.', 'Xudaynazarov A.', "Sa'dullayeva M.", 'Arzimova S.',
  'Ismanova M.', 'Maripova N.', 'Xurvaliyeva T.', 'Tojiyev S.', 'Qurbonov R.',
  'Eshmurodov B.', 'Saidova G.', 'Bekmurodova Z.', 'Hamidov F.', 'Olimova N.',
  'Akbarov J.', 'Yo\'ldoshev S.', 'Mirzayeva L.', "Norboyev O'.", 'Pardayeva R.',
  'Qodirov X.', 'Sharipov M.', 'Tojiboyeva K.', 'Umarov A.', 'Vohidova S.',
  'Xolmuradov B.', 'Yaqubova D.', 'Zikiryayeva F.', 'Abdullayev N.', 'Boboyev T.',
  'Davronova M.', 'Eshonqulov S.', 'Fayzullayev I.', 'G\'ofurova N.', 'Hakimov A.',
  'Iskandarova X.', 'Juraboyeva L.', 'Komilov R.', 'Latipova M.', 'Mirzaev B.',
  'Nazarova S.', 'Otaboyev F.', 'Po\'latov H.', 'Qurbonova D.', 'Rustamova K.',
  'Soliyev I.', 'Toirova M.', 'Usmonov B.', 'Validova N.', 'Xolboyev S.',
]

const SUBJECTS_BY_FACULTY: Record<string, string[]> = {
  ped: ['Pedagogika nazariyasi',     'Pedagogik psixologiya',  'Tarbiya metodikasi',          'Pedagogik mahorat'],
  mtm: ["Maktabgacha ta'lim metodikasi", "Bolalar pedagogikasi", 'Tabiat bilan tanishtirish', 'Bolalarni sahnalashtirish'],
  bot: ["Boshlang'ich ta'lim metodikasi", "Ona tili o'qitish", 'Matematika metodikasi',       "O'qish darslari"],
  tsv: ['Tasviriy faoliyat metodikasi', "Muhandislik grafikasi", 'Rasm va kompozitsiya',      'Dizayn asoslari'],
  jis: ['Jismoniy tarbiya nazariyasi', "Sport pedagogikasi",    'Gimnastika asoslari',         'Yengil atletika'],
  spe: ['Defektologiya asoslari',     'Logopediya',             'Maxsus pedagogika',           'Inklyuziv ta\'lim'],
  mus: ["Musiqa nazariyasi",          'Solfedjio',              "Cholg'u asboblari",           'Xor darslari'],
  fil: ['Falsafa',                    'Adabiyot nazariyasi',    "Tilshunoslik asoslari",       "O'zbek tili"],
  tar: ["O'zbekiston tarixi",         'Jahon tarixi',           'Arxeologiya',                  'Manbashunoslik'],
  tab: ['Biologiya',                  'Kimyo',                  'Geografiya',                   'Ekologiya asoslari'],
  mat: ['Algebra',                    'Matematik analiz',       'Axborot madaniyati',           'Dasturlash asoslari'],
  tur: ['Turizm asoslari',            "Mehmondo'stlik",         "Turizm geografiyasi",          "Marketing asoslari"],
}

const GROUP_PREFIXES: Record<string, string> = {
  ped: 'PED', mtm: 'MTM', bot: 'BOT', tsv: 'TSV',
  jis: 'JIS', spe: 'SPE', mus: 'MUS', fil: 'FIL',
  tar: 'TAR', tab: 'TAB', mat: 'MAT', tur: 'TUR',
}

const FACULTY_IDS = Object.keys(SUBJECTS_BY_FACULTY)
const TIMES = ['08:00', '09:30', '10:50', '12:20', '13:50']

function hash(seed: string): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  return h >>> 0
}

export const TEACHERS: Teacher[] = FIRST_NAMES.map((name, i) => {
  const facultyId = FACULTY_IDS[i % FACULTY_IDS.length]
  const subjectPool = SUBJECTS_BY_FACULTY[facultyId]
  const subject = subjectPool[i % subjectPool.length]
  const groupIdx = 1 + (hash(`${name}:g`) % 4)
  const groupYear = 23 + (hash(`${name}:y`) % 3)
  return {
    id: String(i + 1),
    name,
    facultyId,
    subject,
    group: `${GROUP_PREFIXES[facultyId]} ${groupYear}/${groupIdx}`,
    scheduledAt: TIMES[hash(`${name}:t`) % TIMES.length],
  }
})

export const SUBJECTS: string[] = Array.from(
  new Set(Object.values(SUBJECTS_BY_FACULTY).flat()),
).sort((a, b) => a.localeCompare(b))

export type Status = 'present' | 'late' | 'absent'

export interface TeacherStatus {
  status: Status
  lateBy?: number
}

// Deterministic status per (teacher, date) so the page is stable across reloads.
export function statusFor(teacherId: string, dateKey: string): TeacherStatus {
  const h = hash(`${dateKey}:${teacherId}`)
  const bucket = h % 100
  if (bucket < 78) return { status: 'present' }
  if (bucket < 94) return { status: 'late', lateBy: 1 + ((h >> 8) % 25) }
  return { status: 'absent' }
}
