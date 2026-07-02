// ─────────────────────────────────────────────────────────────
//  Litory · backend API client (social-yaho Spring Boot)
//
//  Base URL resolution:
//  · dev  → '' + Vite proxy ('/api' → http://localhost:8080)
//  · prod → VITE_API_BASE_URL env (unset on GitHub Pages, so every
//    call fails fast and the UI falls back to the bundled demo data)
// ─────────────────────────────────────────────────────────────

import type { Book } from './types'

const API_BASE: string = import.meta.env.VITE_API_BASE_URL ?? ''
const USER_ID_STORAGE_KEY = 'Litory.userId'

/** Common success envelope (spec §1-2) */
interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

export interface ApiGenre {
  id: number
  code: string
  name: string
  description: string
}

export interface ApiBookListItem {
  id: number
  title: string
  authorName: string | null
  coverImageUrl: string | null
  publishedYear: number | null
  genres: ApiGenre[]
}

export interface ApiBookDetail extends ApiBookListItem {
  description: string | null
  /** Preferred user-facing description (AI summary when metadata-only) */
  displayDescription: string | null
  aiSummary: string | null
  descriptionSource:
    | 'AI_GENERATED_SUMMARY'
    | 'IMPORTED_METADATA_DESCRIPTION'
    | 'CONTENT_BASED_DESCRIPTION'
    | null
  originalTitle: string | null
  translatedLanguage: string | null
  translator: string | null
  publisher: string | null
  isbn: string | null
  contentAvailable: boolean
  sourceType: 'MANUAL' | 'MD_FULLTEXT' | 'XLSX_METADATA'
  active: boolean
}

export interface ApiRecommendationReason {
  userId: number
  bookId: number
  bookTitle: string
  personalizedReasonText: string
  aiReasonText: string | null
  keywordTags: string[]
  matchedGenres: { code: string; name: string }[]
  recentReadBooks: {
    bookId: number
    title: string
    authorName: string | null
    matchedGenreCodes: string[]
  }[]
  reasonType: string
  generatedAt: string
}

export interface ApiRecommendationItem {
  rank: number
  bookId: number
  title: string
  authorName: string | null
  coverImageUrl: string | null
  genres: string[]
  reasonText: string
  keywordTags: string[]
  score: number
}

interface ApiRecommendationFeed {
  userId: number
  cached: boolean
  generatedAt: string
  limit: number
  items: ApiRecommendationItem[]
}

export type InteractionType =
  | 'VIEW'
  | 'READ_START'
  | 'READ_COMPLETE'
  | 'LIKE'
  | 'UNLIKE'
  | 'BOOKMARK'
  | 'UNBOOKMARK'

// ─────────────────────────────────────────────────────────────
//  Low-level fetch helper
// ─────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit & { userId?: number; timeoutMs?: number } = {},
): Promise<T> {
  const { userId, timeoutMs = 8000, ...init } = options
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${API_BASE}/api/v1${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(userId !== undefined ? { 'X-USER-ID': String(userId) } : {}),
        ...init.headers,
      },
    })
    const envelope = (await res.json()) as ApiEnvelope<T>
    if (!res.ok || !envelope.success) {
      throw new Error(envelope.message || `API error ${res.status}`)
    }
    return envelope.data
  } finally {
    clearTimeout(timer)
  }
}

// ─────────────────────────────────────────────────────────────
//  Endpoints
// ─────────────────────────────────────────────────────────────

/** Quick availability probe — true when the backend answers in time */
export async function checkBackend(): Promise<boolean> {
  try {
    await request<ApiGenre[]>('/genres', { timeoutMs: 3000 })
    return true
  } catch {
    return false
  }
}

export interface UserProfile {
  id: number
  email: string
  nickname: string
}

export interface UserSignUpData {
  email: string
  password: string
  nickname: string
  preferredGenreCodes?: string[]
  storyPreferenceAnswer?: string
  recentFavoriteContentAnswer?: string
}

export function fetchGenres() {
  return request<ApiGenre[]>('/genres')
}

export function signUp(data: UserSignUpData) {
  return request<{ id: number }>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function fetchUserProfile(userId: number) {
  return request<UserProfile>('/users/me', { userId })
}

/**
 * Returns a persistent user id from localStorage if validated against the backend,
 * otherwise returns null.
 */
export async function ensureUser(): Promise<number | null> {
  const stored = localStorage.getItem(USER_ID_STORAGE_KEY)
  if (stored) {
    const id = Number(stored)
    try {
      await request(`/users/me`, { userId: id })
      return id
    } catch {
      localStorage.removeItem(USER_ID_STORAGE_KEY) // stale id
    }
  }
  return null
}

export function fetchBooks(keyword?: string, genreCode?: string) {
  const params = new URLSearchParams()
  if (keyword) params.set('keyword', keyword)
  if (genreCode) params.set('genreCode', genreCode)
  const qs = params.toString()
  return request<ApiBookListItem[]>(`/books${qs ? `?${qs}` : ''}`)
}

export function fetchBookDetail(bookId: number) {
  return request<ApiBookDetail>(`/books/${bookId}`)
}

export function fetchRecommendationFeed(userId: number, limit = 10) {
  return request<ApiRecommendationFeed>(`/recommendations/feed?limit=${limit}`, {
    userId,
  })
}

export function fetchRecommendationReason(userId: number, bookId: number) {
  return request<ApiRecommendationReason>(
    `/recommendations/books/${bookId}/reason`,
    { userId },
  )
}

export function refreshRecommendationFeed(userId: number, limit = 10) {
  return request<ApiRecommendationFeed>('/recommendations/refresh', {
    method: 'POST',
    userId,
    body: JSON.stringify({ limit }),
  })
}

/** Fire-and-forget interaction logging — never blocks or breaks the UI */
export function logInteraction(
  userId: number,
  event: {
    bookId: number
    interactionType: InteractionType
    viewDurationSeconds?: number
    progressPercent?: number
    sourceScreen?: string
  },
): void {
  request('/interactions', {
    method: 'POST',
    userId,
    body: JSON.stringify(event),
  }).catch(() => {
    /* analytics only — ignore failures */
  })
}

// ─────────────────────────────────────────────────────────────
//  Mapping: backend DTO → frontend Book
// ─────────────────────────────────────────────────────────────

const COVER_PALETTE = [
  '#6f8f6b', '#2f4b7c', '#4a3b6b', '#7a2f2f', '#5a3a2a',
  '#1f6f5c', '#b5546f', '#2a2a2e', '#6b4a2a', '#d9673a',
]

/** e.g. "German(Deutsch)" → 'DE', "English" → 'EN' */
function languageToCode(raw: string | null): string[] {
  if (!raw) return ['EN']
  const table: Record<string, string> = {
    english: 'EN', french: 'FR', spanish: 'ES', german: 'DE',
    japanese: 'JA', chinese: 'ZH', russian: 'RU', vietnamese: 'VI',
    persian: 'FA', arabic: 'AR', italian: 'IT', portuguese: 'PT',
    turkish: 'TR', polish: 'PL', dutch: 'NL', swedish: 'SV',
  }
  const key = raw.split('(')[0].trim().toLowerCase()
  return [table[key] ?? raw.slice(0, 2).toUpperCase()]
}

/** "KDC > literature > Korean Literature > Korean Fiction > Joseon Dynasty" → "Joseon Dynasty" */
function genreLabel(genres: ApiGenre[] | string[]): string {
  const first = genres[0]
  if (!first) return 'Korean Literature'
  const name = typeof first === 'string' ? first.replace(/_/g, ' ') : first.name
  const leaf = name.split('>').pop()?.trim() ?? name
  return leaf
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/^Kdc\s*/i, '')
}

export function apiListItemToBook(item: ApiBookListItem): Book {
  return {
    id: item.id,
    translatedTitle: item.title,
    author: item.authorName ?? 'Unknown author',
    genre: genreLabel(item.genres),
    translatedLanguages: ['EN'],
    isOutOfPrint: false,
    description: item.genres[0]?.name ?? 'Imported from the Litory cloud library.',
    coverColor: COVER_PALETTE[item.id % COVER_PALETTE.length],
    kContentTags: [],
    episodeMinutes: 5 + (item.id % 6),
    year: item.publishedYear ?? undefined,
    fromApi: true,
  }
}

export function apiDetailToBook(detail: ApiBookDetail): Book {
  return {
    ...apiListItemToBook(detail),
    originalTitle: detail.originalTitle ?? undefined,
    translatedLanguages: languageToCode(detail.translatedLanguage),
    isOutOfPrint: !detail.contentAvailable,
    // prefer the AI-enriched description the backend now serves
    description:
      detail.displayDescription ??
      detail.aiSummary ??
      detail.description ??
      `${detail.title} — imported from the Litory cloud library.`,
  }
}

/**
 * The backend's reason strings are Korean; compose an English sentence
 * from the structured fields instead (titles stay as-is).
 */
export function reasonToSentence(reason: ApiRecommendationReason): string {
  const parts: string[] = []
  if (reason.recentReadBooks.length > 0) {
    const titles = reason.recentReadBooks
      .slice(0, 2)
      .map((b) => `“${b.title}”`)
      .join(' and ')
    parts.push(`Because you recently read ${titles}`)
  }
  if (reason.matchedGenres.length > 0) {
    const genres = reason.matchedGenres
      .slice(0, 2)
      .map((g) => genreLabel([g.code]))
      .join(', ')
    parts.push(
      parts.length
        ? `— a close match for your ${genres} taste.`
        : `This matches your ${genres} taste.`,
    )
  }
  if (parts.length === 0) {
    return 'Picked for your reading history by the Litory recommendation engine.'
  }
  return parts.join(' ')
}

/** Backend reason strings arrive in Korean — map the known ones to English */
function reasonToEnglish(reason: string): string {
  if (reason.includes('관심 장르')) {
    return 'Matches the genres you have been reading lately.'
  }
  if (reason.includes('인기')) {
    return 'Popular right now with readers like you.'
  }
  return reason
}

export function apiRecItemToBook(item: ApiRecommendationItem): Book {
  return {
    id: item.bookId,
    translatedTitle: item.title,
    author: item.authorName ?? 'Unknown author',
    genre: genreLabel(item.genres),
    translatedLanguages: ['EN'],
    isOutOfPrint: false,
    description: reasonToEnglish(item.reasonText),
    coverColor: COVER_PALETTE[item.bookId % COVER_PALETTE.length],
    kContentTags: item.keywordTags,
    episodeMinutes: 5 + (item.bookId % 6),
    fromApi: true,
  }
}
