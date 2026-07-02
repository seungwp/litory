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
} from 'lucide-react'
import type { Book } from './types'
import {
  BOOKS,
  COMMUNITY_POSTS,
  CURATIONS,
  GENRES,
  LANGUAGE_LABEL,
  LIVE_SESSIONS,
  PLANS,
  QUICK_READS,
  TASTES,
} from './data'

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
      className={`relative flex flex-col justify-between overflow-hidden rounded p-2.5 text-white ${className}`}
      style={{
        background: `linear-gradient(150deg, ${book.coverColor} 0%, ${book.coverColor}cc 55%, rgba(0,0,0,0.5) 100%)`,
      }}
    >
      <span className="absolute inset-y-0 left-0 w-[5px] bg-black/25" />
      <span className="absolute inset-y-0 left-[5px] w-px bg-white/25" />
      <BookOpen className="h-3.5 w-3.5 opacity-70" strokeWidth={1.6} />
      <div className="pl-0.5">
        <p className="font-serif text-[12px] font-bold leading-snug drop-shadow-sm line-clamp-3">
          {book.translatedTitle}
        </p>
        <p className="mt-0.5 text-[9px] font-medium text-white/70">
          {book.originalTitle}
        </p>
      </div>
    </div>
  )
}

/** Small meta tags under a book item (Kyobo-style) */
function BookTags({ book }: { book: Book }) {
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      <span className="rounded-sm bg-gray-100 px-1 py-px text-[10px] text-gray-500">
        {book.translatedLanguages.length} languages
      </span>
      {book.isOutOfPrint && (
        <span className="rounded-sm bg-red-50 px-1 py-px text-[10px] font-medium text-dancheong">
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
      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
      <span className="font-semibold text-gray-700">{ratingOf(book)}</span>
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
        <span className="absolute left-1.5 top-1.5 z-10 rounded-sm bg-dancheong px-1.5 py-0.5 text-[10px] font-bold text-white">
          {matchScore}% match
        </span>
      )}
      <BookCover
        book={book}
        className="aspect-[3/4] w-full shadow-sm transition group-hover:shadow-md"
      />
      <h3 className="mt-2 text-[13px] font-semibold leading-snug text-gray-900 line-clamp-2 group-hover:underline">
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
      className="group flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition hover:bg-gray-50"
    >
      <span
        className={`w-7 shrink-0 text-center text-xl font-extrabold italic ${
          rank <= 3 ? 'text-dancheong' : 'text-gray-300'
        }`}
      >
        {rank}
      </span>
      <BookCover book={book} className="h-24 w-[72px] shrink-0" />
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:underline">
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
        <h2 className="text-lg font-bold text-gray-900 sm:text-xl">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[13px] text-gray-500">{subtitle}</p>}
      </div>
      {action && (
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="flex shrink-0 items-center gap-0.5 text-xs font-medium text-gray-500 hover:text-gray-900"
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

function ViewerModal({ book, onClose }: { book: Book; onClose: () => void }) {
  const [serif, setSerif] = useState(true)
  const [large, setLarge] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const body =
    book.excerpt ??
    `${book.description}\n\n— This preview is demo text reconstructed from the opening of “${book.translatedTitle}”. In the full service, the complete translation streams from the Tory cloud library.`

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
            <p className="text-sm text-gray-500">{book.originalTitle}</p>
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
            <p className="rounded bg-red-50 p-2 text-[11px] leading-relaxed text-dancheong">
              <Archive className="mr-1 inline h-3 w-3" />
              Out of print in stores — permanently readable only through the
              Tory cloud archive.
            </p>
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
              Tory Reader · Preview
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
                className="rounded p-1.5 text-gray-500 transition hover:bg-red-50 hover:text-dancheong"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="viewer-scroll flex-1 overflow-y-auto bg-[#fbfaf7] px-6 py-8 sm:px-14 sm:py-12">
            <div className="mx-auto max-w-prose">
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
              <div
                className={`space-y-5 leading-loose text-gray-800 ${
                  serif ? 'font-serif' : 'font-sans'
                } ${large ? 'text-[19px]' : 'text-[16px]'}`}
              >
                {body.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-2.5 text-xs text-gray-400">
            <button className="flex items-center gap-1 rounded px-2 py-1 transition hover:bg-gray-100">
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>
            <span>Episode 1 / 32 · Preview</span>
            <button className="flex items-center gap-1 rounded px-2 py-1 transition hover:bg-gray-100">
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

function UtilityBar() {
  return (
    <div className="border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1.5 text-[11px] text-gray-400">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-500">Tory</span>
          <span className="hidden sm:inline">For Publishers</span>
          <span className="hidden sm:inline">For Translators</span>
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

function MainHeader() {
  return (
    <div className="bg-white">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3.5 sm:gap-8">
        <a href="#top" title="Tory" className="group flex shrink-0 items-center gap-1.5">
          <img
            src={`${import.meta.env.BASE_URL}tori.png`}
            alt="Tori the mascot"
            className="h-10 w-10 animate-tori-bob group-hover:animate-tori-jump"
          />
          <span className="text-2xl font-extrabold tracking-tight text-gray-900">
            Tory
          </span>
        </a>

        {/* search bar */}
        <div className="flex h-10 flex-1 items-center overflow-hidden rounded-full border-2 border-dancheong bg-white pl-4 pr-1">
          <input
            className="min-w-0 flex-1 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
            placeholder="Search titles, authors, or the K-drama you just binged"
          />
          <button className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-dancheong transition hover:bg-red-50">
            <Search className="h-4 w-4" strokeWidth={2.4} />
          </button>
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
  { label: 'Membership', href: '#membership' },
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
    id: 'trial',
    eyebrow: 'MEMBERSHIP',
    title: 'Your first 30 days are on us',
    sub: '2,210+ Korean works in 44 languages. Unlimited. Cancel anytime.',
    cta: 'Start Free Trial',
    href: '#membership',
    bg: 'bg-[#173f35]',
    accent: 'text-emerald-200',
  },
  {
    id: 'hankang',
    eyebrow: 'COLLECTION',
    title: 'Han Kang: the Nobel laureate, complete',
    sub: 'The Vegetarian, Human Acts, and every translated edition in one shelf.',
    cta: 'View Collection',
    href: '#curation',
    bg: 'bg-[#3b2e4a]',
    accent: 'text-purple-200',
  },
  {
    id: 'live',
    eyebrow: 'LIVE · JUL 19',
    title: 'Anton Hur on translating Cursed Bunny',
    sub: 'Ask the International Booker–shortlisted translator anything.',
    cta: 'Reserve a Seat',
    href: '#live',
    bg: 'bg-[#5a2e2a]',
    accent: 'text-orange-200',
  },
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
    <section id="top" className="mx-auto max-w-6xl px-4 pt-4">
      <div
        className={`relative overflow-hidden rounded-xl ${banner.bg} text-white transition-colors duration-500`}
      >
        <div className="flex items-center justify-between px-6 py-8 sm:px-10 sm:py-10">
          <div className="max-w-xl">
            <p className={`text-[11px] font-bold tracking-[0.2em] ${banner.accent}`}>
              {banner.eyebrow}
            </p>
            <h2 className="mt-2 text-xl font-bold leading-snug sm:text-2xl">
              {banner.title}
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-white/70 sm:text-sm">
              {banner.sub}
            </p>
            <a
              href={banner.href}
              className="mt-4 inline-block rounded-full bg-white px-4 py-2 text-xs font-bold text-gray-900 transition hover:bg-white/90"
            >
              {banner.cta}
            </a>
          </div>
          {/* decorative book stack */}
          <div className="hidden shrink-0 -rotate-3 gap-2 pr-2 md:flex">
            {BOOKS.slice(index * 3, index * 3 + 3).map((b) => (
              <BookCover key={b.id} book={b} className="h-36 w-24 shadow-lg" />
            ))}
          </div>
        </div>

        {/* controls */}
        <div className="absolute bottom-3 right-4 flex items-center gap-2">
          <div className="flex gap-1.5">
            {BANNERS.map((b, i) => (
              <button
                key={b.id}
                onClick={() => setIndex(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>
          <span className="ml-1 flex overflow-hidden rounded-full bg-black/25">
            <button onClick={prev} className="p-1 hover:bg-black/20" aria-label="Previous">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button onClick={next} className="p-1 hover:bg-black/20" aria-label="Next">
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
    const pool = genre === 'All' ? BOOKS : BOOKS.filter((b) => b.genre === genre)
    // deterministic demo ordering standing in for weekly sales rank
    return [...pool].sort((a, b) => ((a.id * 31) % 17) - ((b.id * 31) % 17)).slice(0, 8)
  }, [genre])

  return (
    <section id="bestsellers" className="mx-auto max-w-6xl px-4 pt-10">
      <SectionHeader
        title="This Week's Bestsellers"
        subtitle="Most-read translations this week, updated daily"
        action="View full ranking"
      />

      {/* genre tabs */}
      <div className="no-scrollbar mb-3 flex gap-1.5 overflow-x-auto border-b border-gray-100 pb-3">
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
//  Section: For You — K-content taste → book feed
// ═══════════════════════════════════════════════════════════════

/** Score a book against the selected taste tags (demo heuristic) */
function scoreBook(book: Book, activeTags: Set<string>): number {
  const overlap = book.kContentTags.filter((t) => activeTags.has(t)).length
  if (overlap === 0) return 0
  return Math.min(99, 68 + overlap * 11 + ((book.id * 7) % 6))
}

function ForYouSection({ onOpen }: { onOpen: (b: Book) => void }) {
  const [selected, setSelected] = useState<string[]>(['squid-game'])

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    )

  const recommended = useMemo(() => {
    const activeTags = new Set(
      TASTES.filter((t) => selected.includes(t.id)).flatMap((t) => t.tags),
    )
    return BOOKS.map((book) => ({ book, score: scoreBook(book, activeTags) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
  }, [selected])

  return (
    <section id="foryou" className="mt-10 bg-gray-50 py-10">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader
          title="Picked For You"
          subtitle="Tap the K-content you already love — we map it to the books behind it"
        />

        <div className="mb-5 flex flex-wrap gap-1.5">
          {TASTES.map((taste) => {
            const active = selected.includes(taste.id)
            return (
              <button
                key={taste.id}
                onClick={() => toggle(taste.id)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition ${
                  active
                    ? 'border-dancheong bg-red-50 text-dancheong'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                {active && <Check className="h-3 w-3" />}
                {taste.label}
              </button>
            )
          })}
        </div>

        {recommended.length > 0 ? (
          <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-1">
            {recommended.map(({ book, score }) => (
              <BookItem key={book.id} book={book} onOpen={onOpen} matchScore={score} />
            ))}
          </div>
        ) : (
          <p className="rounded border border-dashed border-gray-200 bg-white py-12 text-center text-sm text-gray-400">
            Pick at least one taste above and we'll build your feed.
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
//  Section: Quick Reads — re-processed 5–10 min content
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
          subtitle="Every book re-processed into 5–10 minute pieces — episodes, recaps, audio, and visual stories"
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
        subtitle="Finished the book? Ask the person who wrote it — or translated it"
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
        subtitle="Readers from 44 language regions, arguing about the same ending"
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
//  Side ad banners (fixed wings, wide screens only)
// ═══════════════════════════════════════════════════════════════

const SIDE_ADS = [
  {
    id: 'left',
    position: { left: 'calc(50% - 768px)' },
    bg: 'bg-[#173f35]',
    eyebrow: 'PARTNER',
    lines: ['2026 Korean', 'Literature', 'Translation', 'Awards'],
    sub: 'Hosted by LTI Korea — submissions open now',
    cta: 'Learn More',
    href: '#curation',
  },
  {
    id: 'right',
    position: { right: 'calc(50% - 768px)' },
    bg: 'bg-dancheong',
    eyebrow: 'MEMBERSHIP',
    lines: ['First', '30 Days', '$0'],
    sub: 'Unlimited access to 2,210+ translated works',
    cta: 'Start Free Trial',
    href: '#membership',
  },
]

function SideAds() {
  const [closed, setClosed] = useState<string[]>([])

  return (
    <>
      {SIDE_ADS.filter((ad) => !closed.includes(ad.id)).map((ad) => (
        <aside
          key={ad.id}
          style={ad.position}
          className="fixed top-36 z-30 hidden w-40 min-[1580px]:block"
        >
          <div className={`relative overflow-hidden rounded-lg ${ad.bg} text-white shadow-md`}>
            <div className="flex items-center justify-between px-3 pt-2.5">
              <span className="rounded-sm bg-black/25 px-1 py-px text-[9px] font-bold tracking-wider text-white/70">
                AD
              </span>
              <button
                onClick={() => setClosed((c) => [...c, ad.id])}
                aria-label="Close ad"
                className="rounded p-0.5 text-white/50 hover:bg-black/20 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="px-3.5 pb-4 pt-3">
              <p className="text-[9px] font-bold tracking-[0.2em] text-white/60">
                {ad.eyebrow}
              </p>
              <p className="mt-1.5 text-lg font-extrabold leading-tight">
                {ad.lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
              <p className="mt-2.5 text-[10px] leading-relaxed text-white/70">
                {ad.sub}
              </p>
              <a
                href={ad.href}
                className="mt-3 block rounded-full bg-white py-1.5 text-center text-[10px] font-bold text-gray-900 transition hover:bg-white/90"
              >
                {ad.cta}
              </a>
            </div>
          </div>
        </aside>
      ))}
    </>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Section: Membership (subscription plans)
// ═══════════════════════════════════════════════════════════════

function MembershipSection() {
  return (
    <section id="membership" className="mt-12 border-t border-gray-100 bg-gray-50 py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Tory Membership
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            One subscription, every translation. First month free.
          </p>
        </div>

        <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-2">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-xl border bg-white p-6 ${
                plan.highlighted ? 'border-dancheong shadow-sm' : 'border-gray-200'
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-2.5 left-6 rounded-full bg-dancheong px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  Most Popular
                </span>
              )}
              <h3 className="text-base font-bold text-gray-900">{plan.name}</h3>
              <p className="mt-0.5 text-xs text-gray-500">{plan.tagline}</p>
              <p className="mt-4">
                <span className="text-3xl font-extrabold text-gray-900">
                  {plan.price}
                </span>
                <span className="ml-1.5 text-xs text-gray-400">{plan.period}</span>
              </p>
              <ul className="mt-4 flex-1 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-[13px] text-gray-600">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-dancheong" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`mt-6 rounded-lg py-2.5 text-sm font-bold transition ${
                  plan.highlighted
                    ? 'bg-dancheong text-white hover:bg-dancheong/90'
                    : 'border border-gray-300 text-gray-700 hover:border-gray-900'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <p className="mt-5 text-center text-[11px] text-gray-400">
          Cancel anytime. Your reading history, Quick Reads progress, and For-You feed stay with
          your account.
        </p>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Footer (corporate storefront style)
// ═══════════════════════════════════════════════════════════════

const FOOTER_LINKS = [
  'About Tory',
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
            Tory Inc. · CEO Team Yaho · 123 Teheran-ro, Gangnam-gu, Seoul, Korea ·
            Business License 123-45-67890
          </p>
          <p>
            Customer Center support@tory.io (09:00–18:00 KST, weekdays) · Catalog
            data adapted from LTI Korea translation grant statistics (late 2024)
          </p>
          <p className="pt-1 text-gray-300">
            © 2026 Tory. Hackathon demo — all titles shown for demonstration
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

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <UtilityBar />
      <MainHeader />
      <CategoryNav />
      <main className="pb-14">
        <BannerCarousel />
        <BestsellerSection onOpen={setSelected} />
        <ForYouSection onOpen={setSelected} />
        <CurationSection onOpen={setSelected} />
        <QuickReadsSection onOpen={setSelected} />
        <LibrarySection onOpen={setSelected} />
        <LiveSection />
        <CommunitySection onOpen={setSelected} />
        <MembershipSection />
      </main>
      <Footer />
      <SideAds />

      {selected && (
        <ViewerModal book={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
