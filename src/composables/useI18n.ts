import { useLocalStorage } from '@vueuse/core'
import { computed } from 'vue'

export type Lang = 'uz-latn' | 'uz-cyrl' | 'en'

export const LANGS: { code: Lang; label: string; short: string }[] = [
  { code: 'uz-latn', label: "O'zbekcha (Lotin)",   short: 'UZ' },
  { code: 'uz-cyrl', label: 'Ўзбекча (Кирилл)',    short: 'УЗ' },
  { code: 'en',      label: 'English',             short: 'EN' },
]

type Dict = Record<string, string>

const TRANSLATIONS: Record<Lang, Dict> = {
  'uz-latn': {
    'app.title':        'Vaziyat markazi · Smart Campus',
    'app.university':   'Chirchiq davlat pedagogika universiteti',
    'common.faculty':   'Fakultet',
    'common.live':      'Jonli · 10s',
    'common.refreshed': 'Yangilangan',
    'common.today':     'Bugun',
    'common.current_semester': 'Joriy semestr',

    'q1.title':           "O'qituvchilar intizomi",
    'q1.total':           'Jami',
    'q1.late':            'Kech kelgan',
    'q1.late_list':       'Kech kelganlar',
    'q1.discipline_rate': 'Intizom darajasi',
    'q1.on_time_suffix':  "o'z vaqtida",

    'q2.title':       "To'lov holati",
    'q2.total':       'Jami talabalar',
    'q2.paid':        "To'lagan",
    'q2.debt':        'Qarzdor',
    'q2.debt_short':  'Qarzdorlik',

    'q3.title':            'Talabalar davomati',
    'q3.period.week':      'Haftalik',
    'q3.period.month':     'Oylik',
    'q3.period.semester':  'Semester',
    'q3.active':           'Faol talabalar',
    'q3.today':            'Bugun',
    'q3.vs.week':          'kechagiga nisbatan',
    'q3.vs.month':         "o'tgan haftaga nisbatan",
    'q3.vs.semester':      "o'tgan oyga nisbatan",

    'q4.title':       "O'zlashtirish ko'rsatkichi",
    'q4.gpa':         "O'rtacha GPA",
    'q4.graded':      'Baholanganlar',
    'q4.failed':      'Yiqilgan',

    'grade.5': "A'lo (5)",
    'grade.4': 'Yaxshi (4)',
    'grade.3': 'Qoniq. (3)',
    'grade.2': 'Yiqilgan (2)',

    'lesson.lecture':    "Ma'ruza",
    'lesson.practical':  'Amaliy',
    'lesson.laboratory': 'Laboratoriya',
    'lesson.seminar':    'Seminar',

    'wd.mon': 'Du', 'wd.tue': 'Se', 'wd.wed': 'Cho', 'wd.thu': 'Pa', 'wd.fri': 'Ju', 'wd.sat': 'Sha',
    'mo.sep': 'Sen', 'mo.oct': 'Okt', 'mo.nov': 'Noy', 'mo.dec': 'Dek', 'mo.jan': 'Yan',
    'week.n': '{n}-hafta',

    'fac.ped': 'Pedagogika fakulteti',
    'fac.mtm': "Maktabgacha ta'lim fakulteti",
    'fac.bot': "Boshlang'ich ta'lim fakulteti",
    'fac.tsv': "Tasviriy san'at va muhandislik grafikasi",
    'fac.jis': 'Jismoniy madaniyat fakulteti',
    'fac.spe': 'Maxsus pedagogika fakulteti',
    'fac.mus': "Musiqa ta'limi fakulteti",
    'fac.fil': 'Filologiya fakulteti',
    'fac.tar': 'Tarix fakulteti',
    'fac.tab': 'Tabiiy fanlar fakulteti',
    'fac.mat': 'Matematika va informatika fakulteti',
    'fac.tur': 'Turizm fakulteti',

    'sem.1': '1-semestr',
    'sem.2': '2-semestr',

    'td.back':           'Boshqaruv paneli',
    'td.title':          "O'qituvchilar intizomi",
    'td.search':         'Ism bo\'yicha qidirish',
    'td.search.ph':      "F.I.Sh kiriting...",
    'td.all_faculties':  'Barcha fakultetlar',
    'td.all_subjects':   'Barcha fanlar',
    'td.subject':        'Fan',
    'td.date':           'Sana',
    'td.no_results':     'Hech narsa topilmadi',
    'td.scheduled':      'Dars vaqti',
    'td.status.present': 'Vaqtida',
    'td.status.late':    'Kech kelgan',
    'td.status.absent':  'Kelmagan',
    'td.late_by':        '{m} daqiqa',
    'td.results':        '{n} ta natija',

    'stub.title':    'Yaqinda',
    'stub.subtitle': 'Bu bo\'lim hozircha tayyorlanmoqda',
    'stub.back':     'Orqaga',
  },

  'uz-cyrl': {
    'app.title':        'Вазият маркази · Smart Campus',
    'app.university':   'Чирчиқ давлат педагогика университети',
    'common.faculty':   'Факультет',
    'common.live':      'Жонли · 10с',
    'common.refreshed': 'Янгиланган',
    'common.today':     'Бугун',
    'common.current_semester': 'Жорий семестр',

    'q1.title':           'Ўқитувчилар интизоми',
    'q1.total':           'Жами',
    'q1.late':            'Кеч келган',
    'q1.late_list':       'Кеч келганлар',
    'q1.discipline_rate': 'Интизом даражаси',
    'q1.on_time_suffix':  'ўз вақтида',

    'q2.title':       'Тўлов ҳолати',
    'q2.total':       'Жами талабалар',
    'q2.paid':        'Тўлаган',
    'q2.debt':        'Қарздор',
    'q2.debt_short':  'Қарздорлик',

    'q3.title':            'Талабалар давомати',
    'q3.period.week':      'Ҳафталик',
    'q3.period.month':     'Ойлик',
    'q3.period.semester':  'Семестр',
    'q3.active':           'Фаол талабалар',
    'q3.today':            'Бугун',
    'q3.vs.week':          'кечагига нисбатан',
    'q3.vs.month':         'ўтган ҳафтага нисбатан',
    'q3.vs.semester':      'ўтган ойга нисбатан',

    'q4.title':       'Ўзлаштириш кўрсаткичи',
    'q4.gpa':         'Ўртача GPA',
    'q4.graded':      'Баҳоланганлар',
    'q4.failed':      'Йиқилган',

    'grade.5': 'Аъло (5)',
    'grade.4': 'Яхши (4)',
    'grade.3': 'Қониқ. (3)',
    'grade.2': 'Йиқилган (2)',

    'lesson.lecture':    'Маъруза',
    'lesson.practical':  'Амалий',
    'lesson.laboratory': 'Лаборатория',
    'lesson.seminar':    'Семинар',

    'wd.mon': 'Ду', 'wd.tue': 'Се', 'wd.wed': 'Чо', 'wd.thu': 'Па', 'wd.fri': 'Жу', 'wd.sat': 'Ша',
    'mo.sep': 'Сен', 'mo.oct': 'Окт', 'mo.nov': 'Ноя', 'mo.dec': 'Дек', 'mo.jan': 'Янв',
    'week.n': '{n}-ҳафта',

    'fac.ped': 'Педагогика факультети',
    'fac.mtm': 'Мактабгача таълим факультети',
    'fac.bot': 'Бошланғич таълим факультети',
    'fac.tsv': 'Тасвирий санъат ва муҳандислик графикаси',
    'fac.jis': 'Жисмоний маданият факультети',
    'fac.spe': 'Махсус педагогика факультети',
    'fac.mus': 'Мусиқа таълими факультети',
    'fac.fil': 'Филология факультети',
    'fac.tar': 'Тарих факультети',
    'fac.tab': 'Табиий фанлар факультети',
    'fac.mat': 'Математика ва информатика факультети',
    'fac.tur': 'Туризм факультети',

    'sem.1': '1-семестр',
    'sem.2': '2-семестр',

    'td.back':           'Бошқарув панели',
    'td.title':          'Ўқитувчилар интизоми',
    'td.search':         'Исм бўйича қидириш',
    'td.search.ph':      'Ф.И.Ш киритинг...',
    'td.all_faculties':  'Барча факультетлар',
    'td.all_subjects':   'Барча фанлар',
    'td.subject':        'Фан',
    'td.date':           'Сана',
    'td.no_results':     'Ҳеч нарса топилмади',
    'td.scheduled':      'Дарс вақти',
    'td.status.present': 'Вақтида',
    'td.status.late':    'Кеч келган',
    'td.status.absent':  'Келмаган',
    'td.late_by':        '{m} дақиқа',
    'td.results':        '{n} та натижа',

    'stub.title':    'Яқинда',
    'stub.subtitle': 'Бу бўлим ҳозирча тайёрланмоқда',
    'stub.back':     'Орқага',
  },

  en: {
    'app.title':        'Situation Center · Smart Campus',
    'app.university':   'Chirchiq State Pedagogical University',
    'common.faculty':   'Faculty',
    'common.live':      'Live · 10s',
    'common.refreshed': 'Refreshed',
    'common.today':     'Today',
    'common.current_semester': 'Current semester',

    'q1.title':           'Teacher Discipline',
    'q1.total':           'Total',
    'q1.late':            'Late today',
    'q1.late_list':       'Late arrivals',
    'q1.discipline_rate': 'Discipline rate',
    'q1.on_time_suffix':  'on time',

    'q2.title':       'Financial Status',
    'q2.total':       'Total students',
    'q2.paid':        'Paid',
    'q2.debt':        'In debt',
    'q2.debt_short':  'Debt',

    'q3.title':            'Student Attendance',
    'q3.period.week':      'Weekly',
    'q3.period.month':     'Monthly',
    'q3.period.semester':  'Semester',
    'q3.active':           'Active students',
    'q3.today':            'Today',
    'q3.vs.week':          'vs. yesterday',
    'q3.vs.month':         'vs. last week',
    'q3.vs.semester':      'vs. last month',

    'q4.title':       'Academic Performance',
    'q4.gpa':         'Average GPA',
    'q4.graded':      'Graded',
    'q4.failed':      'Failed',

    'grade.5': 'Excellent (5)',
    'grade.4': 'Good (4)',
    'grade.3': 'Satisfactory (3)',
    'grade.2': 'Fail (2)',

    'lesson.lecture':    'Lecture',
    'lesson.practical':  'Practical',
    'lesson.laboratory': 'Laboratory',
    'lesson.seminar':    'Seminar',

    'wd.mon': 'Mon', 'wd.tue': 'Tue', 'wd.wed': 'Wed', 'wd.thu': 'Thu', 'wd.fri': 'Fri', 'wd.sat': 'Sat',
    'mo.sep': 'Sep', 'mo.oct': 'Oct', 'mo.nov': 'Nov', 'mo.dec': 'Dec', 'mo.jan': 'Jan',
    'week.n': 'Week {n}',

    'fac.ped': 'Faculty of Pedagogy',
    'fac.mtm': 'Faculty of Preschool Education',
    'fac.bot': 'Faculty of Primary Education',
    'fac.tsv': 'Faculty of Fine Arts and Engineering Graphics',
    'fac.jis': 'Faculty of Physical Culture',
    'fac.spe': 'Faculty of Special Pedagogy',
    'fac.mus': 'Faculty of Music Education',
    'fac.fil': 'Faculty of Philology',
    'fac.tar': 'Faculty of History',
    'fac.tab': 'Faculty of Natural Sciences',
    'fac.mat': 'Faculty of Mathematics and Informatics',
    'fac.tur': 'Faculty of Tourism',

    'sem.1': 'Semester 1',
    'sem.2': 'Semester 2',

    'td.back':           'Dashboard',
    'td.title':          'Teacher Discipline',
    'td.search':         'Search by name',
    'td.search.ph':      'Enter teacher name...',
    'td.all_faculties':  'All faculties',
    'td.all_subjects':   'All subjects',
    'td.subject':        'Subject',
    'td.date':           'Date',
    'td.no_results':     'No teachers found',
    'td.scheduled':      'Scheduled',
    'td.status.present': 'On time',
    'td.status.late':    'Late',
    'td.status.absent':  'Absent',
    'td.late_by':        '{m} min',
    'td.results':        '{n} results',

    'stub.title':    'Coming soon',
    'stub.subtitle': 'This section is under construction',
    'stub.back':     'Back',
  },
}

const LOCALE_TAGS: Record<Lang, string> = {
  'uz-latn': 'uz-Latn-UZ',
  'uz-cyrl': 'uz-Cyrl-UZ',
  en: 'en-US',
}

const lang = useLocalStorage<Lang>('cspu-ai-lang', 'uz-latn')

export function useI18n() {
  const dict = computed<Dict>(() => TRANSLATIONS[lang.value])
  const locale = computed(() => LOCALE_TAGS[lang.value])

  function t(key: string, vars?: Record<string, string | number>): string {
    let s = dict.value[key] ?? key
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        s = s.replace(`{${k}}`, String(v))
      }
    }
    return s
  }

  return { lang, locale, t }
}
