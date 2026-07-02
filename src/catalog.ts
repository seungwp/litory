import type { Book, CommunityPost, Curation, LiveSession, Plan, QuickRead, Taste } from './types'
import { BOOKS as RAW_BOOKS } from './mdBooks.generated'

export const LANGUAGE_LABEL: Record<string, string> = {
  EN: 'English',
  FR: 'Français',
  ES: 'Español',
  DE: 'Deutsch',
  JA: '日本語',
  ZH: '中文',
  RU: 'Русский',
  VI: 'Tiếng Việt',
}

export const BOOKS: Book[] = [...RAW_BOOKS].sort((a, b) => a.id - b.id)

export const BESTSELLER_IDS = [2045, 2176, 2047, 1983, 1984, 1985, 1987, 1990]

export const MODERN_BESTSELLERS: Book[] = [
  // #1 bestseller — array order defines the ranking
  {
    id: 9004,
    originalTitle: '82년생 김지영',
    translatedTitle: 'Kim Jiyoung, Born 1982',
    author: 'Cho Nam-joo',
    genre: 'Feminist Realism',
    translatedLanguages: ['EN', 'FR', 'ES', 'JA', 'ZH', 'VI'],
    isOutOfPrint: false,
    year: 2016,
    coverColor: '#c9452f',
    episodeMinutes: 7,
    kContentTags: ['social', 'award', 'k-drama'],
    description:
      'A modern cornerstone of Korean feminist fiction, tracking one ordinary life through a whole social structure.',
  },
  {
    id: 9001,
    originalTitle: '채식주의자',
    translatedTitle: 'The Vegetarian',
    author: 'Han Kang',
    genre: 'Feminist Realism',
    translatedLanguages: ['EN', 'FR', 'ES', 'DE', 'JA'],
    isOutOfPrint: false,
    year: 2007,
    coverColor: '#6f8f6b',
    episodeMinutes: 8,
    kContentTags: ['award', 'dark', 'art-house', 'social'],
    description:
      'A quietly devastating novel about refusal, control, and the body, and one of the best-known Korean books worldwide.',
  },
  {
    id: 9002,
    originalTitle: '소년이 온다',
    translatedTitle: 'Human Acts',
    author: 'Han Kang',
    genre: 'Historical Fiction',
    translatedLanguages: ['EN', 'FR', 'DE', 'ES', 'JA'],
    isOutOfPrint: false,
    year: 2014,
    coverColor: '#7a2f2f',
    episodeMinutes: 8,
    kContentTags: ['award', 'dark', 'history', 'social'],
    description:
      'A landmark novel on memory and violence, centered on the Gwangju uprising and its enduring echoes.',
  },
  {
    id: 9003,
    originalTitle: '작별하지 않는다',
    translatedTitle: 'We Do Not Part',
    author: 'Han Kang',
    genre: 'Historical Fiction',
    translatedLanguages: ['EN', 'FR', 'DE'],
    isOutOfPrint: false,
    year: 2021,
    coverColor: '#4b5563',
    episodeMinutes: 8,
    kContentTags: ['history', 'award', 'literary'],
    description:
      'A haunting novel that follows grief, memory, and the shape of historical loss across generations.',
  },
  {
    id: 9005,
    originalTitle: '저주토끼',
    translatedTitle: 'Cursed Bunny',
    author: 'Bora Chung',
    genre: 'Fantasy',
    translatedLanguages: ['EN', 'ES', 'DE'],
    isOutOfPrint: false,
    year: 2017,
    coverColor: '#4a3b6b',
    episodeMinutes: 6,
    kContentTags: ['award', 'horror', 'dark', 'fantasy'],
    description:
      'A genre-bending collection that mixes horror, satire, and speculative fiction into something unmistakably Korean.',
  },
  {
    id: 9006,
    originalTitle: '죽고 싶지만 떡볶이는 먹고 싶어',
    translatedTitle: 'I Want to Die but I Want to Eat Tteokbokki',
    author: 'Baek Sehee',
    genre: 'Essay & Healing',
    translatedLanguages: ['EN', 'JA', 'FR', 'ES', 'ZH', 'DE'],
    isOutOfPrint: false,
    year: 2018,
    coverColor: '#d9673a',
    episodeMinutes: 5,
    kContentTags: ['healing', 'social', 'essay'],
    description:
      'A candid, widely read counseling memoir that became a global comfort book for a younger generation.',
  },
  {
    id: 9007,
    originalTitle: '살인자의 기억법',
    translatedTitle: 'Diary of a Murderer',
    author: 'Kim Young-ha',
    genre: 'Psychological Fiction',
    translatedLanguages: ['EN', 'FR', 'ES', 'DE'],
    isOutOfPrint: false,
    year: 2013,
    coverColor: '#2a2a2e',
    episodeMinutes: 6,
    kContentTags: ['thriller', 'dark', 'k-movie'],
    description:
      'A sharp psychological thriller about memory, violence, and the disorientation of a fading mind.',
  },
  {
    id: 9008,
    originalTitle: '7년의 밤',
    translatedTitle: 'Seven Years of Darkness',
    author: 'Jeong You-jeong',
    genre: 'Thriller',
    translatedLanguages: ['EN', 'JA'],
    isOutOfPrint: false,
    year: 2011,
    coverColor: '#1a2a3a',
    episodeMinutes: 9,
    kContentTags: ['thriller', 'dark', 'k-movie'],
    description:
      'A high-stakes suspense novel built around one accident and the long shadow it casts across a family.',
  },
]

export const BESTSELLER_GENRES = [
  'All',
  ...Array.from(new Set(MODERN_BESTSELLERS.map((book) => book.genre))).sort((a, b) =>
    a.localeCompare(b),
  ),
]

export const GENRES = ['All', ...Array.from(new Set(BOOKS.map((book) => book.genre))).sort(
  (a, b) => a.localeCompare(b),
)]

function makeShelf(title: string, subtitle: string, start: number, count: number): Curation {
  return {
    id: `${start}-${count}`,
    title,
    subtitle,
    bookIds: BOOKS.slice(start, start + count).map((book) => book.id),
  }
}

export const CURATIONS: Curation[] = [
  makeShelf('Start with These', 'A gentle entry into the archive', 0, 6),
  makeShelf('Explore More', 'More translated classics from the same library', 6, 6),
]

export const TASTES: Taste[] = [
  { id: 'poetry', label: 'Poetry', emoji: '✦', tags: ['poetry'] },
  { id: 'history', label: 'History', emoji: '⌁', tags: ['history', 'spiritual'] },
  { id: 'folklore', label: 'Folklore', emoji: '◈', tags: ['folklore', 'fantasy'] },
  { id: 'fiction', label: 'Fiction', emoji: '◌', tags: ['fiction'] },
  { id: 'romance', label: 'Romance', emoji: '♡', tags: ['romance'] },
  { id: 'essay', label: 'Essays', emoji: '✎', tags: ['essay'] },
]

export const LIVE_SESSIONS: LiveSession[] = BOOKS.slice(0, 3).map((book, index) => ({
  id: `live-${book.id}`,
  host: book.author,
  role: 'Author',
  bookId: book.id,
  date: ['Jul 12', 'Jul 19', 'Jul 26'][index] ?? 'Jul 31',
  time: ['20:00 KST', '21:00 KST', '19:00 KST'][index] ?? '20:00 KST',
  attendees: [1284, 967, 2101][index] ?? 512,
}))

const QUICK_READ_FORMATS: QuickRead['format'][] = ['Episode', 'Audio', 'Recap', 'Visual']

export const QUICK_READS: QuickRead[] = BOOKS.slice(0, 9).map((book, index) => {
  const format = QUICK_READ_FORMATS[index % QUICK_READ_FORMATS.length]
  const baseTitle = book.translatedTitle

  return {
    id: index + 1,
    bookId: book.id,
    format,
    title:
      format === 'Episode'
        ? `Ep. ${index + 1} — ${baseTitle}`
        : format === 'Audio'
          ? `Read aloud excerpt — ${baseTitle}`
          : format === 'Recap'
            ? `5-minute guide — ${baseTitle}`
            : `Visual notes — ${baseTitle}`,
    minutes: book.episodeMinutes,
    ...(index % 2 === 0 ? { progress: 16 + index * 7 } : {}),
  }
})

const COUNTRIES = ['🇰🇷', '🇺🇸', '🇫🇷', '🇩🇪', '🇯🇵', '🇻🇳', '🌏']
const POST_TAGS: CommunityPost['tag'][] = ['Discussion', 'Book Club', 'Question']

export const COMMUNITY_POSTS: CommunityPost[] = BOOKS.slice(0, 5).map((book, index) => ({
  id: index + 1,
  title:
    index === 0
      ? `First reactions to ${book.translatedTitle} — spoilers in thread`
      : index === 1
        ? `Reading ${book.translatedTitle} together this week`
        : `What stays with you after ${book.translatedTitle}?`,
  bookId: book.id,
  author: ['Emily R.', 'Litory book club', 'Camille D.', 'Jonas K.', 'Thanh N.'][index] ?? 'Reader',
  country: COUNTRIES[index] ?? '🌏',
  tag: POST_TAGS[index] ?? 'Discussion',
  replies: [128, 96, 74, 41, 63][index] ?? 20,
  likes: [342, 210, 188, 155, 97][index] ?? 40,
  timeAgo: ['2h ago', '5h ago', '8h ago', '12h ago', '1d ago'][index] ?? '1d ago',
}))

export const PLANS: Plan[] = [
  {
    id: 'trial',
    name: 'Free Trial',
    price: '$0',
    period: 'first 30 days',
    tagline: 'Read the archive first. Decide later.',
    features: [
      'Unlimited access to the full library',
      'Taste-based recommendations',
      '5–10 min bite-sized reading sessions',
      'Cancel anytime, no card lock-in',
    ],
    highlighted: false,
    cta: 'Start Free Trial',
  },
  {
    id: 'monthly',
    name: 'Litory unlimited',
    price: '$9.9',
    period: 'per month',
    tagline: 'Every translation. Every shelf. One account.',
    features: [
      'Everything in Free Trial',
      `All ${BOOKS.length}+ books in the archive`,
      'Quick Reads: episodes, recaps, audio & visual notes',
      'Live sessions with authors & translators',
    ],
    highlighted: true,
    cta: 'Go Unlimited',
  },
]