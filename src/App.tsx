import { useMemo, useState, useEffect, useCallback } from 'react'
import {
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Archive,
  Type,
  Sun,
  User,
  Bell,
  Library,
  Star,
  Timer,
  Radio,
  Play,
  Headphones,
  Zap,
  Image as ImageIcon,
  Users,
  Check,
  ChevronDown,
  Menu,
  MessageCircle,
  ThumbsUp,
  PenSquare,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import type { Book } from './types'
import {
  apiDetailToBook,
  apiListItemToBook,
  apiRecItemToBook,
  checkBackend,
  ensureUser,
  fetchBookDetail,
  fetchBooks,
  fetchRecommendationFeed,
  fetchRecommendationReason,
  logInteraction,
  reasonToSentence,
  refreshRecommendationFeed,
} from './api'
import {
  BOOKS,
  BESTSELLER_GENRES,
  COMMUNITY_POSTS,
  CURATIONS,
  MODERN_BESTSELLERS,
  GENRES,
  LANGUAGE_LABEL,
  LIVE_SESSIONS,
  QUICK_READS,
  TASTES,
} from './catalog'

// ═══════════════════════════════════════════════════════════════
//  Demo helpers — deterministic pseudo ratings / reader counts
// ═══════════════════════════════════════════════════════════════

const ratingOf = (b: Book) => (4 + ((b.id * 13) % 10) / 10).toFixed(1)
const readersOf = (b: Book) => {
  const n = ((b.id * 137) % 90) / 10 + 1.2
  return `${n.toFixed(1)}k`
}

// ═══════════════════════════════════════════════════════════════
//  Shared presentational components
// ═══════════════════════════════════════════════════════════════

/** Placeholder cover: coverColor gradient + typography */
function BookCover({ book, className = '' }: { book: Book; className?: string }) {
  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden rounded-[1rem] p-2.5 text-white shadow-[0_10px_30px_rgba(0,0,0,0.12)] ring-1 ring-black/5 ${className}`}
      style={{
        background: `linear-gradient(150deg, ${book.coverColor} 0%, ${book.coverColor}cc 55%, rgba(0,0,0,0.5) 100%)`,
      }}
    >
      <BookOpen className="h-3.5 w-3.5 opacity-70" strokeWidth={1.6} />
      <div className="pl-0.5">
        <p className="font-serif text-[12px] font-bold leading-snug drop-shadow-sm line-clamp-3">
          {book.translatedTitle}
        </p>
        <p className="mt-0.5 text-[9px] font-medium text-white/70">
          {book.originalTitle ?? book.genre}
        </p>
      </div>
    </div>
  )
}

/** Small meta tags under a book item (Kyobo-style) */
function BookTags({ book }: { book: Book }) {
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      <span className="rounded-full bg-black/5 px-1.5 py-0.5 text-[10px] text-black/55">
        {book.translatedLanguages.length} languages
      </span>
      {book.isOutOfPrint && (
        <span className="rounded-full bg-black/5 px-1.5 py-0.5 text-[10px] font-medium text-black/55">
          Archive only
        </span>
      )}
    </div>
  )
}

/** Star rating + reader count row */
function RatingRow({ book }: { book: Book }) {
  return (
    <p className="mt-1 flex items-center gap-1 text-[11px] text-gray-500">
      <Star className="h-3 w-3 fill-black/35 text-black/35" />
      <span className="font-medium text-[#1d1d1f]">{ratingOf(book)}</span>
      <span className="text-gray-400">({readersOf(book)} readers)</span>
    </p>
  )
}

/** Compact storefront book card (vertical) */
function BookItem({
  book,
  onOpen,
  matchScore,
  className = '',
}: {
  book: Book
  onOpen: (b: Book) => void
  matchScore?: number
  className?: string
}) {
  return (
    <button
      onClick={() => onOpen(book)}
      className={`group relative flex w-32 shrink-0 flex-col text-left sm:w-36 ${className}`}
    >
      {matchScore !== undefined && (
        <span className="absolute left-1.5 top-1.5 z-10 rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-[#1d1d1f] shadow-sm backdrop-blur">
          {matchScore}% match
        </span>
      )}
      <BookCover
        book={book}
        className="aspect-[3/4] w-full transition duration-300 group-hover:scale-[1.01]"
      />
      <h3 className="mt-2 text-[13px] font-medium leading-snug text-[#1d1d1f] line-clamp-2 group-hover:underline">
        {book.translatedTitle}
      </h3>
      <p className="mt-0.5 text-[11px] text-gray-500 line-clamp-1">{book.author}</p>
      <RatingRow book={book} />
      <BookTags book={book} />
    </button>
  )
}

/** Horizontal ranked list row (bestseller section) */
function RankedItem({
  book,
  rank,
  onOpen,
}: {
  book: Book
  rank: number
  onOpen: (b: Book) => void
}) {
  return (
    <button
      onClick={() => onOpen(book)}
      className="group flex w-full items-center gap-3 rounded-[1.25rem] px-3 py-3 text-left transition hover:bg-black/[0.03]"
    >
      <span
        className={`w-7 shrink-0 text-center text-xl font-extrabold italic ${
          rank <= 3 ? 'text-[#1d1d1f]' : 'text-gray-300'
        }`}
      >
        {rank}
      </span>
      <BookCover book={book} className="h-24 w-[72px] shrink-0" />
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-medium text-[#1d1d1f] line-clamp-1 group-hover:underline">
          {book.translatedTitle}
        </h3>
        <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">
          {book.author} · {book.genre}
        </p>
        <RatingRow book={book} />
        <BookTags book={book} />
      </div>
    </button>
  )
}

/** Section header with title + optional "view all" link */
function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: string
}) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-[#1d1d1f] sm:text-[1.7rem]">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-[13px] text-gray-500">{subtitle}</p>}
      </div>
      {action && (
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="flex shrink-0 items-center gap-0.5 text-xs font-medium text-gray-500 hover:text-[#1d1d1f]"
        >
          {action} <ChevronRight className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  e-Book viewer preview modal
// ═══════════════════════════════════════════════════════════════

/** One rendered block of reader text */
interface ReaderPara {
  text: string
  heading: boolean
}

/** Strip md metadata/markup and split the raw file into paragraphs */
function mdToParagraphs(raw: string): ReaderPara[] {
  const paras: ReaderPara[] = []
  let buf: string[] = []
  const flush = () => {
    if (buf.length) {
      paras.push({ text: buf.join(' '), heading: false })
      buf = []
    }
  }
  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || /^-{3,}$/.test(line)) {
      flush()
      continue
    }
    // metadata lines like "**저자:** …" from the md header
    if (/^\*\*(저자|출처|책\s*ID|장르|책 장르)\s*:?\*\*/.test(line)) continue
    if (/^#{1,6}\s/.test(line)) {
      flush()
      paras.push({ text: line.replace(/^#{1,6}\s+/, ''), heading: true })
      continue
    }
    buf.push(line.replace(/\*\*/g, ''))
  }
  flush()
  return paras
}

/** Pack paragraphs into pages under a character budget */
function paginate(paras: ReaderPara[], charsPerPage: number): ReaderPara[][] {
  const pages: ReaderPara[][] = []
  let current: ReaderPara[] = []
  let used = 0
  const push = (p: ReaderPara) => {
    if (used > 0 && used + p.text.length > charsPerPage) {
      pages.push(current)
      current = []
      used = 0
    }
    current.push(p)
    used += p.text.length
  }
  for (const p of paras) {
    if (p.text.length <= charsPerPage || p.heading) {
      push(p)
      continue
    }
    // oversized paragraph: split on sentence boundaries
    let chunk = ''
    for (const sentence of p.text.match(/[^.!?]+[.!?]*\s*/g) ?? [p.text]) {
      if (chunk && chunk.length + sentence.length > charsPerPage) {
        push({ text: chunk.trim(), heading: false })
        chunk = ''
      }
      chunk += sentence
    }
    if (chunk.trim()) push({ text: chunk.trim(), heading: false })
  }
  if (current.length) pages.push(current)
  return pages.length ? pages : [[{ text: '', heading: false }]]
}

function ViewerModal({ book, onClose }: { book: Book; onClose: () => void }) {
  const [serif, setSerif] = useState(true)
  const [large, setLarge] = useState(false)
  const [fullText, setFullText] = useState<string | null>(null)
  const [loadingText, setLoadingText] = useState(false)
  const [page, setPage] = useState(0)

  // load the full md text for archive books that ship one
  useEffect(() => {
    setFullText(null)
    setPage(0)
    if (!book.bookId) return
    let cancelled = false
    setLoadingText(true)
    fetch(`${import.meta.env.BASE_URL}books/${book.bookId}.md`)
      .then((res) => (res.ok ? res.text() : null))
      .then((text) => {
        if (!cancelled && text) setFullText(text)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingText(false)
      })
    return () => {
      cancelled = true
    }
  }, [book.id, book.bookId])

  const fallback =
    book.excerpt ??
    `${book.description}\n\n— This preview is demo text reconstructed from the opening of “${book.translatedTitle}”. In the full service, the complete translation streams from the Litory cloud library.`

  const pages = useMemo(
    () => paginate(mdToParagraphs(fullText ?? fallback), large ? 1100 : 1600),
    [fullText, fallback, large],
  )
  const lastPage = pages.length - 1
  const clampedPage = Math.min(page, lastPage)
  const goPrev = useCallback(() => setPage((p) => Math.max(0, p - 1)), [])
  const goNext = useCallback(
    () => setPage((p) => Math.min(lastPage, p + 1)),
    [lastPage],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, goPrev, goNext])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${book.translatedTitle} preview`}
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="animate-scale-in relative flex h-[86vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl md:flex-row">
        {/* ── left: bibliographic panel ── */}
        <aside className="flex shrink-0 flex-col gap-4 border-b border-gray-200 bg-gray-50 p-5 md:w-64 md:border-b-0 md:border-r">
          <BookCover book={book} className="hidden aspect-[3/4] w-full md:flex" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-dancheong">
              {book.genre}
            </span>
            <h2 className="mt-1 text-lg font-bold leading-tight text-gray-900">
              {book.translatedTitle}
            </h2>
            <p className="text-sm text-gray-500">{book.originalTitle ?? book.genre}</p>
            <p className="mt-1 text-xs text-gray-500">
              {book.author}
              {book.year ? ` · ${book.year}` : ''}
            </p>
            <RatingRow book={book} />
          </div>
          <div className="flex flex-wrap gap-1">
            {book.translatedLanguages.map((code) => (
              <span
                key={code}
                title={LANGUAGE_LABEL[code] ?? code}
                className="rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-gray-600"
              >
                {code}
              </span>
            ))}
          </div>
          {book.isOutOfPrint && (
            <p className="rounded bg-[#e8fbf6] p-2 text-[11px] leading-relaxed text-dancheong">
              <Archive className="mr-1 inline h-3 w-3" />
              Out of print in stores — permanently readable only through the
              Litory cloud archive.
            </p>
          )}
          {book.whyRecommended && (
            <div className="rounded border border-gray-200 bg-white p-3">
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-gray-900">
                <Zap className="h-3.5 w-3.5 text-dancheong" /> Why this pick?
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-gray-500">
                {book.whyRecommended}
              </p>
            </div>
          )}
          <div className="mt-auto rounded border border-gray-200 bg-white p-3">
            <p className="flex items-center gap-1.5 text-[11px] font-bold text-gray-900">
              <Timer className="h-3.5 w-3.5 text-dancheong" /> Bite-sized episodes
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-gray-500">
              Re-edited into {book.episodeMinutes}-minute reads. One episode a
              day keeps your streak alive.
            </p>
          </div>
          <button className="w-full rounded bg-dancheong py-2.5 text-sm font-bold text-white transition hover:bg-dancheong/90">
            Read with Free Trial
          </button>
        </aside>

        {/* ── right: reader body ── */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
              <BookOpen className="h-4 w-4" />
              Litory reader · preview
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSerif((v) => !v)}
                title="Toggle font"
                className="rounded p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              >
                <Type className="h-4 w-4" />
              </button>
              <button
                onClick={() => setLarge((v) => !v)}
                title="Font size"
                className="rounded p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              >
                <Sun className="h-4 w-4" />
              </button>
              <div className="mx-1 h-4 w-px bg-gray-200" />
              <button
                onClick={onClose}
                title="Close (Esc)"
                className="rounded p-1.5 text-gray-500 transition hover:bg-[#e8fbf6] hover:text-dancheong"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            key={clampedPage}
            className="viewer-scroll flex-1 overflow-y-auto bg-[#fbfaf7] px-6 py-8 sm:px-14 sm:py-12"
          >
            <div className="mx-auto max-w-prose">
              {clampedPage === 0 && (
                <>
                  <p className="mb-6 text-center text-xs uppercase tracking-[0.3em] text-gray-400">
                    {book.author} — {book.translatedTitle}
                  </p>
                  <h3
                    className={`mb-6 text-center font-serif font-bold text-gray-900 ${
                      large ? 'text-3xl' : 'text-2xl'
                    }`}
                  >
                    {book.translatedTitle}
                  </h3>
                </>
              )}
              {loadingText ? (
                <p className="flex items-center justify-center gap-2 py-16 text-sm text-gray-400">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading the full
                  text…
                </p>
              ) : (
                <div
                  className={`space-y-5 leading-loose text-gray-800 ${
                    serif ? 'font-serif' : 'font-sans'
                  } ${large ? 'text-[19px]' : 'text-[16px]'}`}
                >
                  {pages[clampedPage].map((para, i) =>
                    para.heading ? (
                      <h4
                        key={i}
                        className={`pt-2 text-center font-serif font-bold text-gray-900 ${
                          large ? 'text-2xl' : 'text-xl'
                        }`}
                      >
                        {para.text}
                      </h4>
                    ) : (
                      <p key={i}>{para.text}</p>
                    ),
                  )}
                </div>
              )}

              {/* end-of-book upsell */}
              {!loadingText && clampedPage === lastPage && (
                <div className="mt-10 rounded-xl border border-gray-200 bg-white p-5 text-center">
                  <p className="text-sm font-bold text-gray-900">
                    You reached the end of this preview
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Keep reading {book.translatedTitle} — and{' '}
                    {BOOKS.length}+ more translated works — with Litory.
                  </p>
                  <a
                    href="#membership"
                    onClick={onClose}
                    className="mt-3 inline-block rounded-full bg-dancheong px-5 py-2 text-xs font-bold text-white transition hover:bg-dancheong/90"
                  >
                    Start 30 Days Free
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-2.5 text-xs text-gray-400">
            <button
              onClick={goPrev}
              disabled={clampedPage === 0}
              className="flex items-center gap-1 rounded px-2 py-1 transition hover:bg-gray-100 disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>
            <span>
              Page {clampedPage + 1} / {pages.length}
              {fullText ? ' · Full text' : ' · Preview'}
              <span className="ml-2 hidden text-gray-300 sm:inline">
                ← → keys work too
              </span>
            </span>
            <button
              onClick={goNext}
              disabled={clampedPage === lastPage}
              className="flex items-center gap-1 rounded px-2 py-1 transition hover:bg-gray-100 disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Header: utility bar + logo/search + category nav
// ═══════════════════════════════════════════════════════════════

function UtilityBar({ apiOnline }: { apiOnline: boolean | null }) {
  return (
    <div className="border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1.5 text-[11px] text-gray-400">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-500">Litory</span>
          <span className="hidden sm:inline">For Publishers</span>
          <span className="hidden sm:inline">For Translators</span>
          {apiOnline !== null && (
            <span
              className={`hidden items-center gap-1 sm:flex ${
                apiOnline ? 'text-emerald-500' : 'text-gray-300'
              }`}
              title={
                apiOnline
                  ? 'Connected to the Litory backend'
                  : 'Backend unreachable — showing bundled demo data'
              }
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  apiOnline ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
              />
              {apiOnline ? 'Live API' : 'Demo data'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <a href="#membership" className="hover:text-gray-700">
            Membership
          </a>
          <span className="text-gray-200">|</span>
          <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-gray-700">
            Sign In
          </a>
          <span className="text-gray-200">|</span>
          <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-gray-700">
            Help
          </a>
          <span className="text-gray-200">|</span>
          <button className="flex items-center gap-0.5 hover:text-gray-700">
            English <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

function MainHeader({
  apiOnline,
  onOpenBook,
  onSearched,
}: {
  apiOnline: boolean
  onOpenBook: (b: Book) => void
  onSearched: (keyword: string) => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Book[] | null>(null)
  const [searching, setSearching] = useState(false)

  const runSearch = async () => {
    const keyword = query.trim()
    if (!keyword) return
    setSearching(true)
    onSearched(keyword)
    try {
      if (apiOnline) {
        const list = await fetchBooks(keyword)
        setResults(list.slice(0, 10).map(apiListItemToBook))
      } else {
        // offline fallback: filter the bundled demo catalog
        const q = keyword.toLowerCase()
        setResults(
          BOOKS.filter(
            (b) =>
              b.translatedTitle.toLowerCase().includes(q) ||
              b.author.toLowerCase().includes(q) ||
              (b.originalTitle ?? '').includes(keyword),
          ).slice(0, 10),
        )
      }
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  const closeResults = () => setResults(null)

  return (
    <div className="bg-white">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3.5 sm:gap-8">
        <a href="#top" title="Litory" className="group flex shrink-0 items-center gap-1.5">
          <img
            src={`${import.meta.env.BASE_URL}tori.png`}
            alt="Tori the mascot"
            className="h-10 w-10 animate-tori-bob group-hover:animate-tori-jump"
          />
          <span className="text-2xl font-extrabold tracking-tight text-gray-900">
            Litory
          </span>
        </a>

        {/* search bar */}
        <div className="relative min-w-0 flex-1">
          <div className="flex h-10 items-center overflow-hidden rounded-full border-2 border-dancheong bg-white pl-4 pr-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runSearch()}
              className="min-w-0 flex-1 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
              placeholder="Search titles, authors, or the K-drama you just binged"
            />
            <button
              onClick={runSearch}
              aria-label="Search"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-dancheong transition hover:bg-[#e8fbf6]"
            >
              {searching ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.4} />
              ) : (
                <Search className="h-4 w-4" strokeWidth={2.4} />
              )}
            </button>
          </div>

          {/* results dropdown */}
          {results !== null && (
            <>
              <div className="fixed inset-0 z-40" onClick={closeResults} />
              <div className="absolute left-0 right-0 top-11 z-50 max-h-96 overflow-y-auto rounded-2xl border border-gray-200 bg-white py-1.5 shadow-xl">
                {results.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-gray-400">
                    No books found for “{query.trim()}”.
                  </p>
                ) : (
                  results.map((book) => (
                    <button
                      key={book.id}
                      onClick={() => {
                        closeResults()
                        onOpenBook(book)
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2 text-left transition hover:bg-gray-50"
                    >
                      <BookCover book={book} className="h-14 w-10 shrink-0 !rounded-md" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-[#1d1d1f]">
                          {book.translatedTitle}
                        </span>
                        <span className="block truncate text-[11px] text-gray-500">
                          {book.author} · {book.genre}
                        </span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-gray-300" />
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* utility icons */}
        <div className="hidden shrink-0 items-center gap-1 sm:flex">
          {[
            { icon: Library, label: 'My Books' },
            { icon: Bell, label: 'Alerts' },
            { icon: User, label: 'Account' },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="flex flex-col items-center gap-0.5 rounded px-2.5 py-1 text-gray-500 transition hover:text-gray-900"
            >
              <Icon className="h-5 w-5" strokeWidth={1.7} />
              <span className="text-[10px]">{label}</span>
            </button>
          ))}
        </div>
        <button className="rounded p-2 text-gray-500 sm:hidden">
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

const NAV_ITEMS = [
  { label: 'Bestsellers', href: '#bestsellers' },
  { label: 'For You', href: '#foryou', hot: true },
  { label: 'Library', href: '#library' },
  { label: 'Curations', href: '#curation' },
  { label: 'Live', href: '#live' },
  { label: 'Quick Reads', href: '#quickreads', hot: true },
  { label: 'Community', href: '#community' },
]

function CategoryNav() {
  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white">
      <div className="no-scrollbar mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4">
        <button className="mr-2 flex shrink-0 items-center gap-1.5 py-2.5 text-sm font-bold text-gray-900">
          <Menu className="h-4 w-4" /> Categories
        </button>
        <span className="mr-1 h-4 w-px shrink-0 bg-gray-200" />
        {NAV_ITEMS.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="relative shrink-0 px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            {item.label}
            {item.hot && (
              <span className="absolute right-0.5 top-1.5 h-1.5 w-1.5 rounded-full bg-dancheong" />
            )}
          </a>
        ))}
      </div>
    </nav>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Banner carousel (Kyobo-style promotional slides)
// ═══════════════════════════════════════════════════════════════

const BANNERS = [
  {
    id: 'banner-modern-bestseller',
    eyebrow: 'FEATURED BESTSELLER',
    title: MODERN_BESTSELLERS[0]?.translatedTitle ?? 'Bestseller',
    sub: [MODERN_BESTSELLERS[0]?.author, MODERN_BESTSELLERS[0]?.genre].filter(Boolean).join(' · '),
    cta: 'Open Preview',
    href: '#bestsellers',
    bg: 'bg-white',
    accent: 'text-black/45',
  },
  ...BOOKS.slice(0, 2).map((book, index) => ({
    id: `banner-${book.id}`,
    eyebrow: index === 0 ? 'ARCHIVE HIGHLIGHT' : 'READ NOW',
    title: book.translatedTitle,
    sub: `${book.author} · ${book.genre}`,
    cta: 'Open Preview',
    href: '#library',
    bg: 'bg-white',
    accent: 'text-black/45',
  })),
]

function BannerCarousel() {
  const [index, setIndex] = useState(0)
  const next = useCallback(() => setIndex((i) => (i + 1) % BANNERS.length), [])
  const prev = () => setIndex((i) => (i - 1 + BANNERS.length) % BANNERS.length)

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  const banner = BANNERS[index]

  return (
    <section id="top" className="mx-auto max-w-6xl px-4 pt-6">
      <div
        className={`relative overflow-hidden rounded-[2rem] border border-black/5 bg-white text-[#1d1d1f] shadow-[0_20px_60px_rgba(0,0,0,0.06)] transition-colors duration-500`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.04),transparent_32%),radial-gradient(circle_at_left,rgba(0,0,0,0.03),transparent_28%)]" />
        <div className="relative flex items-center justify-between px-6 py-8 sm:px-10 sm:py-10">
          <div className="max-w-xl">
            <p className={`text-[11px] font-semibold tracking-[0.22em] text-black/45`}>
              {banner.eyebrow}
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight leading-tight sm:text-4xl">
              {banner.title}
            </h2>
            <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-black/60 sm:text-base">
              {banner.sub}
            </p>
            <a
              href={banner.href}
              className="mt-5 inline-flex rounded-full bg-[#1d1d1f] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-black"
            >
              {banner.cta}
            </a>
          </div>
          {/* decorative book stack */}
          <div className="hidden shrink-0 -rotate-3 gap-2 pr-2 md:flex">
            {BANNER_SHOWCASE.map((b) => (
              <BookCover
                key={b.id}
                book={b}
                className="h-36 w-24 shadow-[0_14px_40px_rgba(0,0,0,0.12)]"
              />
            ))}
          </div>
        </div>

        {/* controls */}
        <div className="absolute bottom-4 right-5 flex items-center gap-2">
          <div className="flex gap-1.5">
            {BANNERS.map((b, i) => (
              <button
                key={b.id}
                onClick={() => setIndex(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? 'w-5 bg-black/70' : 'w-1.5 bg-black/20'
                }`}
              />
            ))}
          </div>
          <span className="ml-1 flex overflow-hidden rounded-full border border-black/10 bg-white/80 shadow-sm backdrop-blur">
            <button onClick={prev} className="p-1 text-black/60 hover:bg-black/5" aria-label="Previous">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button onClick={next} className="p-1 text-black/60 hover:bg-black/5" aria-label="Next">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </span>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Section: Bestseller ranking (genre tabs + numbered list)
// ═══════════════════════════════════════════════════════════════

function BestsellerSection({ onOpen }: { onOpen: (b: Book) => void }) {
  const [genre, setGenre] = useState<string>('All')

  const ranked = useMemo(() => {
    const pool = genre === 'All' ? MODERN_BESTSELLERS : MODERN_BESTSELLERS.filter((b) => b.genre === genre)
    return [...pool].slice(0, 8)
  }, [genre])

  return (
    <section id="bestsellers" className="mx-auto max-w-6xl px-4 pt-10">
      <SectionHeader
        title="Bestsellers"
        subtitle="Han Kang, Cho Nam-joo, Bora Chung, and other contemporary standouts"
        action="View full ranking"
      />

      {/* genre tabs */}
      <div className="no-scrollbar mb-3 flex gap-1.5 overflow-x-auto border-b border-gray-100 pb-3">
        {BESTSELLER_GENRES.map((g) => (
          <button
            key={g}
            onClick={() => setGenre(g)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
              genre === g
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="grid gap-x-6 md:grid-cols-2">
        {ranked.map((book, i) => (
          <RankedItem key={book.id} book={book} rank={i + 1} onOpen={onOpen} />
        ))}
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Section: For You — reading moods → book feed
// ═══════════════════════════════════════════════════════════════

/** Score a book against the selected taste tags (demo heuristic) */
function scoreBook(book: Book, activeTags: Set<string>): number {
  const overlap = book.kContentTags.filter((t) => activeTags.has(t)).length
  if (overlap === 0) return 0
  return Math.min(99, 68 + overlap * 11 + ((book.id * 7) % 6))
}

function ForYouSection({
  onOpen,
  apiOnline,
  userId,
}: {
  onOpen: (b: Book) => void
  apiOnline: boolean
  userId: number | null
}) {
  const [selected, setSelected] = useState<string[]>(['squid-game'])
  const [feed, setFeed] = useState<{ book: Book; score: number }[] | null>(null)
  const [loading, setLoading] = useState(false)

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    )

  // live recommendation feed from the backend (when reachable)
  const loadFeed = useCallback(
    async (refresh = false) => {
      if (!userId) return
      setLoading(true)
      try {
        const data = refresh
          ? await refreshRecommendationFeed(userId, 12)
          : await fetchRecommendationFeed(userId, 12)
        setFeed(
          data.items.map((item) => ({
            book: apiRecItemToBook(item),
            score: Math.min(99, Math.max(1, Math.round(item.score))),
          })),
        )
      } catch {
        setFeed(null)
      } finally {
        setLoading(false)
      }
    },
    [userId],
  )

  useEffect(() => {
    if (apiOnline && userId) loadFeed()
  }, [apiOnline, userId, loadFeed])

  // offline fallback: taste-chip demo scoring over the bundled catalog
  const recommended = useMemo(() => {
    const activeTags = new Set(
      TASTES.filter((t) => selected.includes(t.id)).flatMap((t) => t.tags),
    )
    return BOOKS.map((book) => ({ book, score: scoreBook(book, activeTags) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
  }, [selected])

  const liveMode = apiOnline && feed !== null
  const items = liveMode ? feed : recommended

  return (
    <section id="foryou" className="mt-10 bg-gray-50 py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-start justify-between">
          <SectionHeader
            title="Picked For You"
            subtitle={
              liveMode
                ? 'Ranked live by the Litory recommendation engine — reading anything reshapes this feed'
                : 'Choose a reading mood and the archive reshapes itself around it'
            }
          />
          {apiOnline && userId && (
            <button
              onClick={() => loadFeed(true)}
              disabled={loading}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-gray-300 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          )}
        </div>

        {!liveMode && (
          <div className="mb-5 flex flex-wrap gap-1.5">
            {TASTES.map((taste) => {
              const active = selected.includes(taste.id)
              return (
                <button
                  key={taste.id}
                  onClick={() => toggle(taste.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition ${
                    active
                      ? 'border-dancheong bg-[#e8fbf6] text-dancheong'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {active && <Check className="h-3 w-3" />}
                  {taste.label}
                </button>
              )
            })}
          </div>
        )}

        {items.length > 0 ? (
          <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-1">
            {items.map(({ book, score }) => (
              <BookItem key={book.id} book={book} onOpen={onOpen} matchScore={score} />
            ))}
          </div>
        ) : loading ? (
          <p className="flex items-center justify-center gap-2 rounded border border-dashed border-gray-200 bg-white py-12 text-center text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Building your feed…
          </p>
        ) : (
          <p className="rounded border border-dashed border-gray-200 bg-white py-12 text-center text-sm text-gray-400">
            {liveMode
              ? 'Open a few books and your personal feed will appear here.'
              : "Pick at least one taste above and we'll build your feed."}
          </p>
        )}
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Section: Curated shelves
// ═══════════════════════════════════════════════════════════════

function CurationSection({ onOpen }: { onOpen: (b: Book) => void }) {
  const byId = useMemo(() => new Map(BOOKS.map((b) => [b.id, b])), [])

  return (
    <section id="curation" className="mx-auto max-w-6xl px-4 pt-10">
      {CURATIONS.map((cur, i) => {
        const books = cur.bookIds
          .map((id) => byId.get(id))
          .filter((b): b is Book => Boolean(b))
        return (
          <div key={cur.id} className={i > 0 ? 'mt-10' : ''}>
            <SectionHeader title={cur.title} subtitle={cur.subtitle} action="View all" />
            <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-1">
              {books.map((book) => (
                <BookItem key={book.id} book={book} onOpen={onOpen} />
              ))}
            </div>
          </div>
        )
      })}
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Section: Quick Reads — re-processed excerpts
// ═══════════════════════════════════════════════════════════════

const FORMAT_META = {
  Episode: { icon: Play, label: 'Episode', chip: 'bg-blue-50 text-blue-600' },
  Audio: { icon: Headphones, label: 'Audio', chip: 'bg-purple-50 text-purple-600' },
  Recap: { icon: Zap, label: 'Recap', chip: 'bg-amber-50 text-amber-700' },
  Visual: { icon: ImageIcon, label: 'Visual Story', chip: 'bg-emerald-50 text-emerald-600' },
} as const

const FORMAT_FILTERS = ['All', 'Episode', 'Audio', 'Recap', 'Visual'] as const

function QuickReadsSection({ onOpen }: { onOpen: (b: Book) => void }) {
  const [format, setFormat] = useState<(typeof FORMAT_FILTERS)[number]>('All')
  const byId = useMemo(() => new Map(BOOKS.map((b) => [b.id, b])), [])

  const items = useMemo(
    () =>
      format === 'All'
        ? QUICK_READS
        : QUICK_READS.filter((q) => q.format === format),
    [format],
  )

  return (
    <section id="quickreads" className="mt-10 bg-gray-50 py-10">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          title="Quick Reads"
          subtitle="Selected books presented as short excerpts, audio notes, and visual summaries"
          action="Browse all"
        />

        {/* format filter chips */}
        <div className="mb-5 flex flex-wrap gap-1.5">
          {FORMAT_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
                format === f
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {f === 'All' ? 'All formats' : FORMAT_META[f].label}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((q) => {
            const book = byId.get(q.bookId)
            if (!book) return null
            const meta = FORMAT_META[q.format]
            const Icon = meta.icon
            return (
              <button
                key={q.id}
                onClick={() => onOpen(book)}
                className="group flex items-center gap-3.5 rounded-lg border border-gray-200 bg-white px-4 py-3.5 text-left transition hover:border-gray-300 hover:shadow-sm"
              >
                <div className="relative shrink-0">
                  <BookCover book={book} className="h-20 w-14" />
                  <span className="absolute -bottom-1.5 -right-1.5 grid h-6 w-6 place-items-center rounded-full bg-gray-900 text-white shadow">
                    <Icon className="h-3 w-3" />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`rounded px-1.5 py-px text-[10px] font-bold ${meta.chip}`}>
                      {meta.label}
                    </span>
                    <span className="flex items-center gap-0.5 text-[11px] text-gray-400">
                      <Timer className="h-3 w-3" /> {q.minutes} min
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] font-semibold leading-snug text-gray-900 line-clamp-2 group-hover:underline">
                    {q.title}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-gray-500">
                    {book.translatedTitle} · {book.author}
                  </p>
                  {q.progress !== undefined && (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-dancheong"
                          style={{ width: `${q.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-dancheong">
                        {q.progress}%
                      </span>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Section: Genre library grid
// ═══════════════════════════════════════════════════════════════

function LibrarySection({ onOpen }: { onOpen: (b: Book) => void }) {
  const [genre, setGenre] = useState<string>('All')

  const filtered = useMemo(
    () => (genre === 'All' ? BOOKS : BOOKS.filter((b) => b.genre === genre)),
    [genre],
  )

  return (
    <section id="library" className="mx-auto max-w-6xl px-4 pt-10">
      <SectionHeader
        title="Browse the Library"
        subtitle="Genres global readers already know — nothing here ever goes out of stock"
      />

      <div className="no-scrollbar mb-5 flex gap-1.5 overflow-x-auto pb-1">
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => setGenre(g)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
              genre === g
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {g}
            <span className={genre === g ? 'ml-1 text-white/60' : 'ml-1 text-gray-400'}>
              {g === 'All' ? BOOKS.length : BOOKS.filter((b) => b.genre === g).length}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-x-4 gap-y-7 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {filtered.map((book) => (
          <BookItem key={book.id} book={book} onOpen={onOpen} className="!w-full" />
        ))}
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Section: Live sessions
// ═══════════════════════════════════════════════════════════════

function LiveSection() {
  const byId = useMemo(() => new Map(BOOKS.map((b) => [b.id, b])), [])

  return (
    <section id="live" className="mx-auto max-w-6xl px-4 pt-10">
      <SectionHeader
        title="Author & Translator Live"
        subtitle="Meet the people behind the archive titles"
        action="All sessions"
      />
      <div className="grid gap-3 md:grid-cols-3">
        {LIVE_SESSIONS.map((session) => {
          const book = byId.get(session.bookId)
          return (
            <div
              key={session.id}
              className="flex items-center gap-3.5 rounded-lg border border-gray-200 bg-white px-4 py-4 transition hover:border-gray-300 hover:shadow-sm"
            >
              {book && <BookCover book={book} className="h-20 w-14 shrink-0" />}
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 text-[10px] font-bold text-dancheong">
                  <Radio className="h-3 w-3" /> {session.date} · {session.time}
                </p>
                <h3 className="mt-0.5 truncate text-sm font-bold text-gray-900">
                  {session.host}
                </h3>
                <p className="truncate text-xs text-gray-500">
                  {session.role}
                  {book ? ` · ${book.translatedTitle}` : ''}
                </p>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-gray-400">
                  <Users className="h-3 w-3" />
                  {session.attendees.toLocaleString()} reserved
                </p>
              </div>
              <button className="shrink-0 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-bold text-gray-700 transition hover:border-gray-900 hover:bg-gray-900 hover:text-white">
                Reserve
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Section: Community (book discussion board)
// ═══════════════════════════════════════════════════════════════

const TAG_STYLE: Record<string, string> = {
  Discussion: 'bg-blue-50 text-blue-600',
  'Book Club': 'bg-purple-50 text-purple-600',
  Question: 'bg-emerald-50 text-emerald-600',
}

function CommunitySection({ onOpen }: { onOpen: (b: Book) => void }) {
  const byId = useMemo(() => new Map(BOOKS.map((b) => [b.id, b])), [])

  return (
    <section id="community" className="mx-auto max-w-6xl px-4 pt-10">
      <SectionHeader
        title="Community"
        subtitle="Readers from around the world discussing the same titles"
        action="All discussions"
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        {/* discussion thread list */}
        <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
          {COMMUNITY_POSTS.map((post) => {
            const book = byId.get(post.bookId)
            return (
              <div
                key={post.id}
                className="flex items-center gap-3 px-4 py-3 transition hover:bg-gray-50"
              >
                <span
                  className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    TAG_STYLE[post.tag]
                  }`}
                >
                  {post.tag}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-gray-900 hover:underline">
                    {post.title}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-gray-400">
                    <span>
                      {post.country} {post.author}
                    </span>
                    <span>·</span>
                    {book && (
                      <>
                        <button
                          onClick={() => onOpen(book)}
                          className="truncate text-gray-500 hover:text-dancheong hover:underline"
                        >
                          {book.translatedTitle}
                        </button>
                        <span>·</span>
                      </>
                    )}
                    <span>{post.timeAgo}</span>
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-1 text-[11px] text-gray-400">
                  <MessageCircle className="h-3.5 w-3.5" /> {post.replies}
                </span>
                <span className="flex shrink-0 items-center gap-1 text-[11px] text-gray-400">
                  <ThumbsUp className="h-3.5 w-3.5" /> {post.likes}
                </span>
              </div>
            )
          })}
        </div>

        {/* side: book club + write CTA */}
        <div className="flex flex-col gap-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-dancheong">
              July Book Club
            </p>
            <h3 className="mt-1 text-sm font-bold text-gray-900">
              Human Acts — read together, week by week
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">
              One chapter a week, one discussion thread, readers from 20+
              countries. Finish together on Jul 31.
            </p>
            <p className="mt-2 flex items-center gap-1 text-[11px] text-gray-400">
              <Users className="h-3 w-3" /> 3,842 members reading now
            </p>
            <button className="mt-3 w-full rounded-lg bg-gray-900 py-2 text-xs font-bold text-white transition hover:bg-gray-700">
              Join Book Club
            </button>
          </div>
          <button className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 py-3 text-xs font-semibold text-gray-500 transition hover:border-gray-400 hover:text-gray-700">
            <PenSquare className="h-3.5 w-3.5" /> Start a new discussion
          </button>
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Side ad banners (restored fixed wings)
// ═══════════════════════════════════════════════════════════════

const SIDE_ADS = [
  {
    id: 'left',
    position: { left: '1rem', top: '10rem' },
    eyebrow: 'PARTNER',
    lines: ['2026 Korean', 'Literature', 'Translation', 'Awards'],
    sub: 'Hosted by LTI Korea — submissions open now',
    cta: 'Learn More',
    href: '#curation',
  },
  {
    id: 'left-netflix',
    position: { left: '1rem', top: '29.5rem' },
    eyebrow: 'NETFLIX',
    lines: ['82년생 김지영', 'Now Streaming', 'Tonight'],
    sub: 'Watch Kim Jiyoung, Born 1982 on your next screen.',
    cta: 'Stream Now',
    href: '#bestsellers',
  },
  {
    id: 'right',
    position: { right: '1rem', top: '10rem' },
    eyebrow: 'PUBLISHER PARTNER',
    lines: ['문학동네', 'Munhakdongne', "Korea's #1", 'Literary Publisher'],
    sub: 'Home of Korea’s most-loved novels — now streaming on Litory.',
    cta: 'Explore Titles',
    href: '#bestsellers',
  },
]

const BANNER_SHOWCASE = [MODERN_BESTSELLERS[0], BOOKS[0], BOOKS[1]].filter(
  (book): book is Book => Boolean(book),
)

function SideAds() {
  const [closed, setClosed] = useState<string[]>([])

  return (
    <>
      {SIDE_ADS.filter((ad) => !closed.includes(ad.id)).map((ad) => (
        <aside key={ad.id} style={ad.position} className="fixed z-30 w-40">
          <div
            className={`relative overflow-hidden rounded-[1.5rem] border shadow-[0_12px_35px_rgba(0,0,0,0.08)] ${
              ad.id === 'left-netflix'
                ? 'border-[#2a0000] bg-[#0a0a0a] text-white'
                : 'border-black/5 bg-white text-[#1d1d1f]'
            }`}
          >
            <div className="flex items-center justify-between px-3 pt-2.5">
              <span
                className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium tracking-wider ${
                  ad.id === 'left-netflix'
                    ? 'bg-[#e50914] text-white'
                    : 'bg-black/5 text-black/45'
                }`}
              >
                AD
              </span>
              <button
                onClick={() => setClosed((c) => [...c, ad.id])}
                aria-label="Close ad"
                className={`rounded p-0.5 ${
                  ad.id === 'left-netflix'
                    ? 'text-white/45 hover:bg-white/10 hover:text-white'
                    : 'text-black/35 hover:bg-black/5 hover:text-black/55'
                }`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="px-3.5 pb-4 pt-3">
              <p
                className={`text-[9px] font-semibold tracking-[0.2em] ${
                  ad.id === 'left-netflix' ? 'text-[#e50914]' : 'text-black/38'
                }`}
              >
                {ad.eyebrow}
              </p>
              <p
                className={`mt-1.5 text-lg font-semibold leading-tight tracking-tight ${
                  ad.id === 'left-netflix' ? 'text-white' : 'text-[#1d1d1f]'
                }`}
              >
                {ad.lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
              <p
                className={`mt-2.5 text-[11px] leading-relaxed ${
                  ad.id === 'left-netflix' ? 'text-white/65' : 'text-black/45'
                }`}
              >
                {ad.sub}
              </p>
              <a
                href={ad.href}
                className={`mt-3 block rounded-full py-1.5 text-center text-[10px] font-medium transition ${
                  ad.id === 'left-netflix'
                    ? 'bg-[#e50914] text-white hover:bg-[#f40612]'
                    : 'bg-[#1d1d1f] text-white hover:bg-black'
                }`}
              >
                {ad.cta}
              </a>
            </div>
            {ad.id === 'right' && (
              <img
                src={`${import.meta.env.BASE_URL}tori.png`}
                alt="Litory character"
                className="pointer-events-none absolute right-2 top-2 h-14 w-14 rotate-12 rounded-full bg-white p-0.5 shadow-[0_8px_22px_rgba(0,0,0,0.12)]"
              />
            )}
          </div>
        </aside>
      ))}
    </>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Live recommendation banner — reacts to what you view/search
// ═══════════════════════════════════════════════════════════════

/** One thing the user just did (view or search), fueling the banner */
export interface Engagement {
  type: 'view' | 'search'
  label: string
  bookId?: number
  genre?: string
  tags?: string[]
}

/** "You read “A” and searched “B” — how about these?" */
function engagementSentence(engagements: Engagement[]): string {
  const parts = engagements
    .slice(-2)
    .map((e) =>
      e.type === 'view' ? `read “${e.label}”` : `searched for “${e.label}”`,
    )
  return `You ${parts.join(' and ')} — how about these?`
}

function RecommendationBanner({
  engagements,
  apiOnline,
  userId,
  onOpen,
  onDismiss,
}: {
  engagements: Engagement[]
  apiOnline: boolean
  userId: number | null
  onOpen: (b: Book) => void
  onDismiss: () => void
}) {
  const [items, setItems] = useState<{ book: Book; score: number }[]>([])

  useEffect(() => {
    const seen = new Set(
      engagements.filter((e) => e.bookId !== undefined).map((e) => e.bookId),
    )
    if (apiOnline && userId) {
      // fresh feed so the just-logged interactions are reflected
      refreshRecommendationFeed(userId, 10)
        .then((data) =>
          setItems(
            data.items
              .filter((item) => !seen.has(item.bookId))
              .slice(0, 6)
              .map((item) => ({
                book: apiRecItemToBook(item),
                score: Math.min(99, Math.max(1, Math.round(item.score))),
              })),
          ),
        )
        .catch(() => setItems([]))
    } else {
      // offline: match the bundled catalog by genre/tag overlap
      const genres = new Set(
        engagements.map((e) => e.genre).filter((g): g is string => Boolean(g)),
      )
      const tags = new Set(engagements.flatMap((e) => e.tags ?? []))
      setItems(
        BOOKS.filter((b) => !seen.has(b.id))
          .map((b) => {
            const overlap =
              (genres.has(b.genre) ? 2 : 0) +
              b.kContentTags.filter((t) => tags.has(t)).length
            return {
              book: b,
              score: Math.min(99, 60 + overlap * 12 + ((b.id * 7) % 6)),
              overlap,
            }
          })
          .filter((r) => r.overlap > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 6),
      )
    }
  }, [engagements, apiOnline, userId])

  if (items.length === 0) return null

  return (
    <section className="mx-auto max-w-6xl px-4 pt-4">
      <div className="relative rounded-2xl border border-dancheong/30 bg-[#e8fbf6]/70 p-4">
        <button
          onClick={onDismiss}
          aria-label="Dismiss recommendations"
          className="absolute right-3 top-3 rounded p-1 text-gray-400 transition hover:bg-black/5 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-3 flex items-center gap-2.5 pr-8">
          <img
            src={`${import.meta.env.BASE_URL}tori.png`}
            alt="Tori the mascot"
            className="h-9 w-9 shrink-0 animate-tori-bob"
          />
          <div>
            <p className="text-sm font-bold text-[#1d1d1f]">
              {engagementSentence(engagements)}
            </p>
            <p className="text-[11px] text-gray-500">
              {apiOnline
                ? 'Freshly ranked by the Litory recommendation engine, just for you'
                : 'Picked from the archive based on your recent reading'}
            </p>
          </div>
        </div>

        <div className="no-scrollbar -mx-1 flex gap-4 overflow-x-auto px-1 pb-1">
          {items.map(({ book, score }) => (
            <BookItem key={book.id} book={book} onOpen={onOpen} matchScore={score} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Footer (corporate storefront style)
// ═══════════════════════════════════════════════════════════════

const FOOTER_LINKS = [
  'About Litory',
  'Terms of Service',
  'Privacy Policy',
  'Youth Protection',
  'For Publishers',
  'For Translators',
  'Partnerships',
  'Help Center',
]

function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">
          {FOOTER_LINKS.map((link, i) => (
            <a
              key={link}
              href="#"
              onClick={(e) => e.preventDefault()}
              className={`hover:text-gray-900 hover:underline ${
                i === 2 ? 'font-bold text-gray-700' : ''
              }`}
            >
              {link}
            </a>
          ))}
        </div>

        <div className="mt-5 space-y-1 text-[11px] leading-relaxed text-gray-400">
          <p>
            Litory Inc. · CEO Team Yaho · 123 Teheran-ro, Gangnam-gu, Seoul, Korea ·
            Business License 123-45-67890
          </p>
          <p>
            Customer Center support@Litory.io (09:00–18:00 KST, weekdays) · Catalog
            data adapted from LTI Korea translation grant statistics (late 2024)
          </p>
          <p className="pt-1 text-gray-300">
            © 2026 Litory. Hackathon demo — all titles shown for demonstration
            purposes.
          </p>
        </div>
      </div>
    </footer>
  )
}

// ═══════════════════════════════════════════════════════════════
//  App Root
// ═══════════════════════════════════════════════════════════════

export default function App() {
  const [selected, setSelected] = useState<Book | null>(null)
  const [apiOnline, setApiOnline] = useState<boolean | null>(null)
  const [userId, setUserId] = useState<number | null>(null)
  // recent views/searches this session — fuels the top recommendation banner
  const [engagements, setEngagements] = useState<Engagement[]>([])
  const [dismissedAt, setDismissedAt] = useState(0)

  const onSearched = useCallback((keyword: string) => {
    setEngagements((prev) =>
      prev[prev.length - 1]?.type === 'search' &&
      prev[prev.length - 1]?.label === keyword
        ? prev
        : [...prev, { type: 'search', label: keyword }],
    )
  }, [])

  // Probe the backend once on mount; register/restore the demo user if up.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const online = await checkBackend()
      if (cancelled) return
      setApiOnline(online)
      if (online) {
        try {
          const id = await ensureUser()
          if (!cancelled) setUserId(id)
        } catch {
          if (!cancelled) setUserId(null)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  /** Open a book; API books get detail hydration + a VIEW interaction log */
  const openBook = useCallback(
    (book: Book) => {
      setSelected(book)
      setEngagements((prev) =>
        prev.some((e) => e.bookId === book.id)
          ? prev
          : [
              ...prev,
              {
                type: 'view',
                label: book.translatedTitle,
                bookId: book.id,
                genre: book.genre,
                tags: book.kContentTags,
              },
            ],
      )
      if (book.fromApi && userId) {
        logInteraction(userId, {
          bookId: book.id,
          interactionType: 'VIEW',
          viewDurationSeconds: 5,
          sourceScreen: 'book-preview',
        })
        fetchBookDetail(book.id)
          .then((detail) =>
            setSelected((cur) =>
              cur && cur.id === book.id && cur.fromApi
                ? {
                    ...apiDetailToBook(detail),
                    kContentTags: cur.kContentTags,
                    whyRecommended: cur.whyRecommended,
                  }
                : cur,
            ),
          )
          .catch(() => {})
        fetchRecommendationReason(userId, book.id)
          .then((reason) =>
            setSelected((cur) =>
              cur && cur.id === book.id && cur.fromApi
                ? { ...cur, whyRecommended: reasonToSentence(reason) }
                : cur,
            ),
          )
          .catch(() => {})
      }
    },
    [userId],
  )

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans text-[#1d1d1f]">
      <UtilityBar apiOnline={apiOnline} />
      <MainHeader
        apiOnline={apiOnline === true}
        onOpenBook={openBook}
        onSearched={onSearched}
      />
      <CategoryNav />
      <main className="pb-14">
        {engagements.length >= 2 && engagements.length > dismissedAt && (
          <RecommendationBanner
            engagements={engagements}
            apiOnline={apiOnline === true}
            userId={userId}
            onOpen={openBook}
            onDismiss={() => setDismissedAt(engagements.length)}
          />
        )}
        <BannerCarousel />
        <BestsellerSection onOpen={openBook} />
        <ForYouSection
          onOpen={openBook}
          apiOnline={apiOnline === true}
          userId={userId}
        />
        <CurationSection onOpen={openBook} />
        <QuickReadsSection onOpen={openBook} />
        <LibrarySection onOpen={openBook} />
        <LiveSection />
        <CommunitySection onOpen={openBook} />
      </main>
      <Footer />
      <SideAds />

      {selected && (
        <ViewerModal book={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
