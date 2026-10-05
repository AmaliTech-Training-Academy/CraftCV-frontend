const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH_NAMES_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function decodeHtmlEntities(text: string): string {
  if (!text) return ''
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, '\'')
    .replace(/&apos;/g, '\'')
    .replace(/&nbsp;/g, ' ')
}

export function normalizeBullets(rawDescription?: string | null): string[] {
  if (!rawDescription) return []

  const text = decodeHtmlEntities(
    rawDescription
      .replace(/<li[^>]*>/gi, '\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, ''),
  )

  return text
    .split('\n')
    .map(line => line.replace(/^[\s•\-*]+/, '').trim())
    .filter(line => line.length > 0)
}

export function formatSingleDate(dateStr?: string | null): string {
  if (!dateStr) return ''
  const trimmed = dateStr.trim()
  if (!trimmed) return ''

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})(?:-\d{2})?/)
  if (isoMatch && isoMatch[1] && isoMatch[2]) {
    const monthIdx = parseInt(isoMatch[2], 10) - 1
    if (monthIdx >= 0 && monthIdx <= 11) {
      return `${MONTH_NAMES_SHORT[monthIdx]} ${isoMatch[1]}`
    }
  }

  const monthYearMatch = trimmed.match(/^([A-Za-z]+)\s+(\d{4})$/)
  if (monthYearMatch && monthYearMatch[1] && monthYearMatch[2]) {
    const monthName = monthYearMatch[1].toLowerCase()
    const foundIdx = MONTH_NAMES_FULL.findIndex(m => m.toLowerCase() === monthName)
    if (foundIdx >= 0) {
      return `${MONTH_NAMES_SHORT[foundIdx]} ${monthYearMatch[2]}`
    }
  }

  return trimmed
}

export function formatDateRange(start?: string | null, end?: string | null): string {
  if (!start && !end) return ''
  const formattedStart = formatSingleDate(start)
  const isPresent = !end || end.toLowerCase() === 'present'
  const formattedEnd = isPresent ? 'Present' : formatSingleDate(end)

  if (!formattedStart) return formattedEnd
  return `${formattedStart} – ${formattedEnd}`
}
