import { promises as fs } from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()
const sourceDir = path.join(rootDir, 'md_books')
const outputFile = path.join(rootDir, 'src', 'mdBooks.generated.ts')

const coverPalette = [
  '#0f766e',
  '#155e75',
  '#475569',
  '#4d7c0f',
  '#7c3aed',
  '#b45309',
  '#b91c1c',
  '#0f172a',
  '#1d4ed8',
  '#0f766e',
  '#52525b',
  '#9a3412',
]

function hashString(value) {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

function cleanText(value) {
  return value
    .replace(/\u200b/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim()
}

function extractFirstMatch(text, pattern, fallback = '') {
  const match = text.match(pattern)
  return match ? cleanText(match[1]) : fallback
}

function extractYear(text) {
  const years = [...text.matchAll(/\b(18|19|20)\d{2}\b/g)].map((match) => Number(match[0]))
  return years.find((year) => year >= 1800 && year <= 2100)
}

function stripFrontMatter(text) {
  const parts = text.split(/\n---\n/)
  return parts.length > 1 ? parts.slice(1).join('\n---\n').trim() : text.trim()
}

function paragraphBlocks(text) {
  return text
    .split(/\n\s*\n/)
    .map((block) => cleanText(block))
    .filter((block) => block.length > 0)
    .filter((block) => !block.startsWith('#'))
    .filter((block) => !/^[-—]+$/.test(block))
}

function excerptFromBody(text) {
  const paragraphs = paragraphBlocks(text)
  const useful = paragraphs.filter(
    (block) =>
      !/^##\s+(About|CONTENTS|Contents|Preface|Introduction)/i.test(block) &&
      !/^The Digital Library of Korean Classics/i.test(block) &&
      !/^This e-book was made by scanning/i.test(block) &&
      !/^LTI Korea/i.test(block),
  )

  const selected = (useful.length > 0 ? useful : paragraphs).slice(0, 3)
  return selected.join('\n\n')
}

function descriptionFromExcerpt(excerpt, fallbackTitle) {
  const plain = cleanText(excerpt.replace(/\[(.*?)\]\((.*?)\)/g, '$1'))
  const lengthLimit = 170
  if (!plain) return `An excerpt from ${fallbackTitle}.`
  return plain.length > lengthLimit ? `${plain.slice(0, lengthLimit - 1)}…` : plain
}

function tagsForGenre(genre) {
  const normalized = genre.toLowerCase()
  const tags = []

  if (normalized.includes('poetry')) tags.push('poetry')
  if (normalized.includes('history') || normalized.includes('biography')) tags.push('history')
  if (normalized.includes('folk') || normalized.includes('fairy') || normalized.includes('legend')) {
    tags.push('folklore')
  }
  if (normalized.includes('fantasy') || normalized.includes('supernatural')) tags.push('fantasy')
  if (normalized.includes('romance') || normalized.includes('love')) tags.push('romance')
  if (normalized.includes('essay') || normalized.includes('travel')) tags.push('essay')
  if (
    normalized.includes('fiction') ||
    normalized.includes('drama') ||
    normalized.includes('satire') ||
    normalized.includes('tragedy') ||
    normalized.includes('realism') ||
    normalized.includes('psychological') ||
    normalized.includes('existential') ||
    normalized.includes('identity') ||
    normalized.includes('domestic') ||
    normalized.includes('coming-of-age') ||
    normalized.includes('poverty') ||
    normalized.includes('prison') ||
    normalized.includes('allegorical') ||
    normalized.includes('modernist') ||
    normalized.includes('intellectual')
  ) {
    tags.push('fiction')
  }
  if (normalized.includes('buddhist')) tags.push('spiritual')

  return tags.length > 0 ? [...new Set(tags)] : ['literary']
}

function chooseCoverColor(key) {
  return coverPalette[hashString(key) % coverPalette.length]
}

async function main() {
  const files = (await fs.readdir(sourceDir)).filter((file) => file.toLowerCase().endsWith('.md'))
  const books = []

  for (const file of files) {
    const filePath = path.join(sourceDir, file)
    const content = await fs.readFile(filePath, 'utf8')

    const bookId = extractFirstMatch(content, /^\*\*책 ID:\*\*\s*(.+)$/m, file.replace(/\.md$/i, ''))
    const numericId = Number(bookId.replace(/[^0-9]/g, '')) || books.length + 1
    const translatedTitle = extractFirstMatch(content, /^#\s+(.+)$/m, bookId)
    const author = extractFirstMatch(content, /^\*\*저자:\*\*\s*(.+)$/m, 'Unknown Author')
    const genre = extractFirstMatch(content, /^\*\*장르:\*\*\s*(.+)$/m, 'Literary')
    const year = extractYear(content)
    const body = stripFrontMatter(content)
    const excerpt = excerptFromBody(body)

    books.push({
      id: numericId,
      translatedTitle,
      author,
      genre,
      translatedLanguages: ['EN'],
      isOutOfPrint: false,
      description: descriptionFromExcerpt(excerpt, translatedTitle),
      coverColor: chooseCoverColor(`${bookId}:${translatedTitle}:${author}`),
      kContentTags: tagsForGenre(genre),
      episodeMinutes: Math.max(4, Math.min(10, Math.round(cleanText(excerpt).length / 260) + 4)),
      ...(year ? { year } : {}),
      ...(excerpt ? { excerpt } : {}),
      sourceUrl: extractFirstMatch(content, /^\*\*출처:\*\*\s*(.+)$/m, ''),
      bookId,
    })
  }

  books.sort((a, b) => a.id - b.id)

  const fileOutput = `import type { Book } from './types'\n\nexport const BOOKS: Book[] = ${JSON.stringify(
    books,
    null,
    2,
  )} as Book[]\n`

  await fs.writeFile(outputFile, fileOutput, 'utf8')
  console.log(`Wrote ${books.length} books to ${path.relative(rootDir, outputFile)}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})