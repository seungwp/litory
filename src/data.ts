import type {
  Book,
  CommunityPost,
  Curation,
  LiveSession,
  Plan,
  QuickRead,
  Taste,
} from './types'

// ─────────────────────────────────────────────────────────────
//  Demo catalog data (frontend-only, no backend required)
//  · Varied genres / translation languages / print status
// ─────────────────────────────────────────────────────────────

/** Genre categories shown in the library sidebar */
export const GENRES = [
  'All',
  'Feminist Voices',
  'Sci-Fi & Fantasy',
  'Historical',
  'Romance',
  'Thriller',
  'Essay & Healing',
] as const

/** Language code → display name (used for badge tooltips) */
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

const SAMPLE_EXCERPT =
  'Before my wife turned vegetarian, I had never once thought of her as remarkable. To be honest, it would be hard to say I was ever drawn to her in the first place. Neither tall nor short, hair neither long nor cropped, she dressed in the muted colors of someone afraid of standing out.\n\nAnd then, one winter morning, I found her standing in front of the open refrigerator in the dark — utterly still, as if she were listening to something the rest of us could not hear.'

export const BOOKS: Book[] = [
  {
    id: 1,
    originalTitle: '채식주의자',
    translatedTitle: 'The Vegetarian',
    author: 'Han Kang',
    genre: 'Feminist Voices',
    translatedLanguages: ['EN', 'FR', 'ES', 'DE', 'JA'],
    isOutOfPrint: false,
    year: 2007,
    coverColor: '#6f8f6b',
    episodeMinutes: 8,
    kContentTags: ['k-drama', 'arthouse', 'dark', 'award'],
    description:
      'Three gazes circle a woman who suddenly refuses to eat meat. A Booker-winning meditation on violence, dignity, and the body.',
    excerpt: SAMPLE_EXCERPT,
  },
  {
    id: 2,
    originalTitle: '82년생 김지영',
    translatedTitle: 'Kim Jiyoung, Born 1982',
    author: 'Cho Nam-joo',
    genre: 'Feminist Voices',
    translatedLanguages: ['EN', 'FR', 'ES', 'JA', 'ZH', 'VI'],
    isOutOfPrint: false,
    year: 2016,
    coverColor: '#c9452f',
    episodeMinutes: 7,
    kContentTags: ['k-drama', 'social', 'award'],
    description:
      'One ordinary woman’s life becomes testimony against an entire social structure. A global phenomenon translated into 27 languages.',
  },
  {
    id: 3,
    originalTitle: '딸에 대하여',
    translatedTitle: 'Concerning My Daughter',
    author: 'Kim Hye-jin',
    genre: 'Feminist Voices',
    translatedLanguages: ['EN', 'JA'],
    isOutOfPrint: true,
    year: 2017,
    coverColor: '#8b5a3c',
    episodeMinutes: 9,
    kContentTags: ['social', 'family', 'queer'],
    description:
      'A mother, her daughter, and her daughter’s partner — three ways of living under one roof. A rare translation now out of print overseas.',
  },
  {
    id: 4,
    originalTitle: '우리가 빛의 속도로 갈 수 없다면',
    translatedTitle: "If We Can't Go at the Speed of Light",
    author: 'Kim Cho-yeop',
    genre: 'Sci-Fi & Fantasy',
    translatedLanguages: ['EN', 'FR', 'JA', 'ZH'],
    isOutOfPrint: false,
    year: 2019,
    coverColor: '#2f4b7c',
    episodeMinutes: 10,
    kContentTags: ['sci-fi', 'webtoon', 'heartwarming'],
    description:
      'Loss and love rendered in the language of deep space. The story collection that launched the K-SF boom.',
  },
  {
    id: 5,
    originalTitle: '저주토끼',
    translatedTitle: 'Cursed Bunny',
    author: 'Bora Chung',
    genre: 'Sci-Fi & Fantasy',
    translatedLanguages: ['EN', 'ES', 'DE'],
    isOutOfPrint: false,
    year: 2017,
    coverColor: '#4a3b6b',
    episodeMinutes: 6,
    kContentTags: ['horror', 'dark', 'award', 'sci-fi'],
    description:
      'Horror, fantasy, and SF fused past the point of genre. An International Booker finalist unlike anything else on your shelf.',
  },
  {
    id: 6,
    originalTitle: '지구 끝의 온실',
    translatedTitle: 'Greenhouse at the End of the Earth',
    author: 'Kim Cho-yeop',
    genre: 'Sci-Fi & Fantasy',
    translatedLanguages: ['EN'],
    isOutOfPrint: true,
    year: 2021,
    coverColor: '#1f6f5c',
    episodeMinutes: 9,
    kContentTags: ['sci-fi', 'heartwarming', 'nature'],
    description:
      'A world ended by dust storms — and life blooming again. Only the first English edition survives; preserved in the tory archive.',
  },
  {
    id: 7,
    originalTitle: '칼의 노래',
    translatedTitle: 'Song of the Sword',
    author: 'Kim Hoon',
    genre: 'Historical',
    translatedLanguages: ['EN', 'JA', 'FR'],
    isOutOfPrint: false,
    year: 2001,
    coverColor: '#5a3a2a',
    episodeMinutes: 10,
    kContentTags: ['history', 'war', 'arthouse'],
    description:
      'Admiral Yi Sun-sin’s inner voice, carved in razor-sharp prose. The loneliness of the battlefield, distilled into Korean classic.',
  },
  {
    id: 8,
    originalTitle: '남한산성',
    translatedTitle: 'The Fortress',
    author: 'Kim Hoon',
    genre: 'Historical',
    translatedLanguages: ['EN', 'JA'],
    isOutOfPrint: true,
    year: 2007,
    coverColor: '#3a2a1a',
    episodeMinutes: 9,
    kContentTags: ['history', 'war'],
    description:
      '47 days under siege, a war fought with words inside the walls. A historical epic now hard to find in translation.',
  },
  {
    id: 9,
    originalTitle: '소년이 온다',
    translatedTitle: 'Human Acts',
    author: 'Han Kang',
    genre: 'Historical',
    translatedLanguages: ['EN', 'FR', 'DE', 'ES', 'JA'],
    isOutOfPrint: false,
    year: 2014,
    coverColor: '#7a2f2f',
    episodeMinutes: 8,
    kContentTags: ['history', 'award', 'arthouse', 'dark'],
    description:
      'Gwangju, May 1980 — voices radiating outward from one boy’s death. A defining work by the Nobel laureate.',
  },
  {
    id: 10,
    originalTitle: '토지',
    translatedTitle: 'Land',
    author: 'Park Kyong-ni',
    genre: 'Historical',
    translatedLanguages: ['EN', 'FR'],
    isOutOfPrint: true,
    year: 1969,
    coverColor: '#6b4a2a',
    episodeMinutes: 10,
    kContentTags: ['history', 'family', 'saga'],
    description:
      'One family, one nation, from the last empire to liberation. A heritage-grade saga whose full translation is nearly impossible to buy.',
  },
  {
    id: 11,
    originalTitle: '사랑 후에 오는 것들',
    translatedTitle: 'What Comes After Love',
    author: 'Gong Ji-young',
    genre: 'Romance',
    translatedLanguages: ['EN', 'JA'],
    isOutOfPrint: false,
    year: 2005,
    coverColor: '#b5546f',
    episodeMinutes: 7,
    kContentTags: ['romance', 'k-drama', 'heartwarming'],
    description:
      'Tokyo and Seoul, two languages, one love that misses and finds itself again. A Korea–Japan crossover romance.',
  },
  {
    id: 12,
    originalTitle: '경애의 마음',
    translatedTitle: "Kyung-ae's Heart",
    author: 'Kim Keum-hee',
    genre: 'Romance',
    translatedLanguages: ['EN'],
    isOutOfPrint: false,
    year: 2018,
    coverColor: '#c96f8f',
    episodeMinutes: 8,
    kContentTags: ['romance', 'heartwarming', 'social'],
    description:
      'Two people who survived loss slowly reaching each other. A tender, slow-burn story of growth and love.',
  },
  {
    id: 13,
    originalTitle: '살인자의 기억법',
    translatedTitle: 'Diary of a Murderer',
    author: 'Kim Young-ha',
    genre: 'Thriller',
    translatedLanguages: ['EN', 'FR', 'ES', 'DE'],
    isOutOfPrint: false,
    year: 2013,
    coverColor: '#2a2a2e',
    episodeMinutes: 6,
    kContentTags: ['thriller', 'dark', 'k-movie'],
    description:
      'A retired serial killer losing his memory begins one last hunt. A chilling psychological thriller with a knife-twist ending.',
  },
  {
    id: 14,
    originalTitle: '7년의 밤',
    translatedTitle: 'Seven Years of Darkness',
    author: 'Jeong You-jeong',
    genre: 'Thriller',
    translatedLanguages: ['EN', 'JA'],
    isOutOfPrint: true,
    year: 2011,
    coverColor: '#1a2a3a',
    episodeMinutes: 9,
    kContentTags: ['thriller', 'dark', 'k-movie'],
    description:
      'A single accident, seven years of nightmare. Out of print in translation — urgently preserved in the tory archive.',
  },
  {
    id: 15,
    originalTitle: '나는 나로 살기로 했다',
    translatedTitle: 'I Decided to Live as Myself',
    author: 'Kim Suhyun',
    genre: 'Essay & Healing',
    translatedLanguages: ['EN', 'JA', 'ZH', 'ES', 'VI'],
    isOutOfPrint: false,
    year: 2016,
    coverColor: '#d99a3a',
    episodeMinutes: 5,
    kContentTags: ['healing', 'k-pop', 'heartwarming'],
    description:
      'Short sentences for living free of other people’s eyes. The comfort essay beloved across Asia — and by BTS fans worldwide.',
  },
  {
    id: 16,
    originalTitle: '죽고 싶지만 떡볶이는 먹고 싶어',
    translatedTitle: 'I Want to Die but I Want to Eat Tteokbokki',
    author: 'Baek Sehee',
    genre: 'Essay & Healing',
    translatedLanguages: ['EN', 'JA', 'FR', 'ES', 'ZH', 'DE'],
    isOutOfPrint: false,
    year: 2018,
    coverColor: '#d9673a',
    episodeMinutes: 5,
    kContentTags: ['healing', 'k-pop', 'social'],
    description:
      'Therapy transcripts drifting between depression and everyday life. A global bestseller translated into nearly 30 languages.',
  },
]

/** Curated shelves (horizontal scroll sections) */
export const CURATIONS: Curation[] = [
  {
    id: 'start-here',
    title: 'Where to Start?',
    subtitle: 'First-timer favorites — zero barrier to entry',
    bookIds: [1, 2, 16, 4, 15, 5],
  },
  {
    id: 'global-buzz',
    title: 'Acclaimed Worldwide',
    subtitle: 'Chosen by the Booker, the Nobel, and readers everywhere',
    bookIds: [9, 5, 1, 2, 13, 4],
  },
]

// ─────────────────────────────────────────────────────────────
//  For-You feed · K-content taste chips → book tag mapping
// ─────────────────────────────────────────────────────────────

export const TASTES: Taste[] = [
  { id: 'squid-game', label: 'Squid Game', emoji: '🦑', tags: ['thriller', 'dark', 'social'] },
  { id: 'k-drama', label: 'K-Drama Romance', emoji: '💜', tags: ['romance', 'k-drama', 'heartwarming'] },
  { id: 'k-pop', label: 'BTS & K-pop', emoji: '🎤', tags: ['k-pop', 'healing', 'heartwarming'] },
  { id: 'parasite', label: 'Parasite & K-Cinema', emoji: '🎬', tags: ['k-movie', 'dark', 'social', 'award'] },
  { id: 'history', label: 'Historical Sageuk', emoji: '🏯', tags: ['history', 'war', 'saga'] },
  { id: 'webtoon', label: 'Webtoons & SF', emoji: '🚀', tags: ['sci-fi', 'webtoon', 'horror'] },
]

// ─────────────────────────────────────────────────────────────
//  Live sessions with authors & translators
// ─────────────────────────────────────────────────────────────

export const LIVE_SESSIONS: LiveSession[] = [
  {
    id: 'live-1',
    host: 'Kim Cho-yeop',
    role: 'Author',
    bookId: 4,
    date: 'Jul 12',
    time: '20:00 KST',
    attendees: 1284,
  },
  {
    id: 'live-2',
    host: 'Anton Hur',
    role: 'Translator',
    bookId: 5,
    date: 'Jul 19',
    time: '21:00 KST',
    attendees: 967,
  },
  {
    id: 'live-3',
    host: 'Baek Sehee',
    role: 'Author',
    bookId: 16,
    date: 'Jul 26',
    time: '19:00 KST',
    attendees: 2101,
  },
]

// ─────────────────────────────────────────────────────────────
//  Quick Reads · books re-processed into 5–10 min content
// ─────────────────────────────────────────────────────────────

export const QUICK_READS: QuickRead[] = [
  { id: 1, bookId: 1, format: 'Episode', title: 'Ep.1 — The Dream', minutes: 8, progress: 62 },
  { id: 2, bookId: 16, format: 'Audio', title: 'Session 1 — “I feel empty”, narrated', minutes: 6 },
  { id: 3, bookId: 9, format: 'Recap', title: 'Human Acts in 10 minutes — context before you dive in', minutes: 10 },
  { id: 4, bookId: 5, format: 'Visual', title: '“The Head” — illustrated short story', minutes: 5 },
  { id: 5, bookId: 2, format: 'Episode', title: 'Ep.3 — 1999, the first job', minutes: 7, progress: 21 },
  { id: 6, bookId: 4, format: 'Audio', title: 'Title story, read aloud with ambient score', minutes: 9 },
  { id: 7, bookId: 13, format: 'Episode', title: 'Ep.1 — The last hunt begins', minutes: 6 },
  { id: 8, bookId: 7, format: 'Recap', title: 'Who was Admiral Yi Sun-sin? A 5-minute primer', minutes: 5 },
  { id: 9, bookId: 15, format: 'Visual', title: '10 sentences to live as yourself — quote cards', minutes: 5 },
]

// ─────────────────────────────────────────────────────────────
//  Community discussion board (global readers talking books)
// ─────────────────────────────────────────────────────────────

export const COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 1,
    title: 'That ending of The Vegetarian — did Yeong-hye win or lose? (spoilers)',
    bookId: 1,
    author: 'Emily R.',
    country: '🇺🇸',
    tag: 'Discussion',
    replies: 128,
    likes: 342,
    timeAgo: '2h ago',
  },
  {
    id: 2,
    title: 'July Book Club · Human Acts — Week 2 reading thread',
    bookId: 9,
    author: 'tory book club',
    country: '🌏',
    tag: 'Book Club',
    replies: 96,
    likes: 210,
    timeAgo: '5h ago',
  },
  {
    id: 3,
    title: 'Reading Kim Jiyoung with my mom — she says it could be set in France',
    bookId: 2,
    author: 'Camille D.',
    country: '🇫🇷',
    tag: 'Discussion',
    replies: 74,
    likes: 188,
    timeAgo: '8h ago',
  },
  {
    id: 4,
    title: 'Just finished “The Embodiment” — can someone explain that ending?',
    bookId: 5,
    author: 'Jonas K.',
    country: '🇩🇪',
    tag: 'Question',
    replies: 41,
    likes: 155,
    timeAgo: '12h ago',
  },
  {
    id: 5,
    title: 'New to Korean sci-fi — start with Kim Cho-yeop or Cursed Bunny?',
    bookId: 4,
    author: 'Thanh N.',
    country: '🇻🇳',
    tag: 'Question',
    replies: 63,
    likes: 97,
    timeAgo: '1d ago',
  },
]

// ─────────────────────────────────────────────────────────────
//  Subscription plans (Netflix-style D2C model)
// ─────────────────────────────────────────────────────────────

export const PLANS: Plan[] = [
  {
    id: 'trial',
    name: 'Free Trial',
    price: '$0',
    period: 'first 30 days',
    tagline: 'Fall in love first. Pay later.',
    features: [
      'Unlimited access to the full library',
      'AI For-You feed & taste onboarding',
      '5–10 min bite-sized episodes',
      'Cancel anytime, no card lock-in',
    ],
    highlighted: false,
    cta: 'Start Free Trial',
  },
  {
    id: 'monthly',
    name: 'tory unlimited',
    price: '$9.9',
    period: 'per month',
    tagline: 'Every translation. Every language. One click.',
    features: [
      'Everything in Free Trial',
      '2,210+ editions across 44 languages',
      'Out-of-print archive exclusives',
      'Quick Reads: episodes, recaps, audio & visual stories',
      'Live sessions with authors & translators',
    ],
    highlighted: true,
    cta: 'Go Unlimited',
  },
]
