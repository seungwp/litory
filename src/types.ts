// ─────────────────────────────────────────────────────────────
//  Litory · Korean literature streaming platform — domain types
// ─────────────────────────────────────────────────────────────

/**
 * Book
 * One translated Korean work integrated into the Litory cloud library.
 * Every UI component consumes data strictly through this interface.
 */
export interface Book {
  /** Internal unique identifier */
  id: number
  /** Optional source identifier from the md_books filename/metadata */
  bookId?: string
  /** Original Korean title */
  originalTitle?: string
  /** Primary English (translated) title — shown first to global readers */
  translatedTitle: string
  /** Author name (romanized) */
  author: string
  /** Genre — must match a category in the library sidebar */
  genre: string
  /** Language codes with an existing translation (e.g. ['EN', 'FR']) */
  translatedLanguages: string[]
  /** true → out of print, preserved exclusively in the Litory archive */
  isOutOfPrint: boolean
  /** Short pitch shown on cards and in the viewer */
  description: string
  /** Placeholder cover color (HEX) */
  coverColor: string
  /** K-content taste tags used by the recommendation engine */
  kContentTags: string[]
  /** Bite-sized reading time per episode, in minutes */
  episodeMinutes: number

  // ── optional fields for demo immersion ──
  /** First publication year */
  year?: number
  /** Opening passage shown in the e-book viewer preview */
  excerpt?: string
  /** Source URL from the md_books metadata */
  sourceUrl?: string
  /** true → this book came from the backend API (id is a server id) */
  fromApi?: boolean
  /** Personalized recommendation reason (from the backend, per user) */
  whyRecommended?: string
}

/** One horizontally-scrolling curated shelf */
export interface Curation {
  id: string
  title: string
  subtitle: string
  bookIds: number[]
}

/** A K-content taste chip the reader can pick in the For-You feed */
export interface Taste {
  id: string
  label: string
  emoji: string
  /** Tags this taste boosts when scoring books */
  tags: string[]
}

/** Upcoming live session with an author or translator */
export interface LiveSession {
  id: string
  host: string
  role: 'Author' | 'Translator'
  bookId: number
  date: string
  time: string
  attendees: number
}

/** A community discussion thread about a book */
export interface CommunityPost {
  id: number
  title: string
  bookId: number
  author: string
  /** Flag emoji showing where the reader is from */
  country: string
  tag: 'Discussion' | 'Book Club' | 'Question'
  replies: number
  likes: number
  timeAgo: string
}

/** One piece of re-processed content derived from a book */
export interface QuickRead {
  id: number
  bookId: number
  format: 'Episode' | 'Audio' | 'Recap' | 'Visual'
  title: string
  minutes: number
  /** Reading progress % — present when the demo user has started it */
  progress?: number
}

/** Subscription plan card */
export interface Plan {
  id: string
  name: string
  price: string
  period: string
  tagline: string
  features: string[]
  highlighted: boolean
  cta: string
}
