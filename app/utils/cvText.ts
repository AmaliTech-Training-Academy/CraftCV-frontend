import type { JSONContent } from '@tiptap/vue-3'

/**
 * Parses the raw plain text description string into structured blocks for rendering.
 * Lines starting with `- ` are parsed as bullets, and consecutive bullets are grouped into a `ul` block.
 * Other lines are paragraphs.
 */
export function parseDescription(text?: string | null): Array<{ type: 'p' | 'ul', text?: string, items?: string[] }> {
  if (!text) return []

  const blocks: Array<{ type: 'p' | 'ul', text?: string, items?: string[] }> = []
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

  let currentList: string[] | null = null

  for (const line of lines) {
    if (line.startsWith('- ') || line.startsWith('-')) {
      const itemText = line.replace(/^-+\s*/, '').trim()
      if (itemText) {
        if (!currentList) {
          currentList = []
          blocks.push({ type: 'ul', items: currentList })
        }
        currentList.push(itemText)
      }
    }
    else {
      currentList = null
      blocks.push({ type: 'p', text: line })
    }
  }

  return blocks
}

/**
 * Converts the plain text description into HTML for initializing Tiptap.
 */
export function descriptionToHTML(text?: string | null): string {
  const blocks = parseDescription(text)
  return blocks.map((block) => {
    if (block.type === 'p') {
      return `<p>${block.text}</p>`
    }
    else if (block.type === 'ul') {
      const items = block.items?.map(item => `<li><p>${item}</p></li>`).join('') || ''
      return `<ul>${items}</ul>`
    }
    return ''
  }).join('')
}

/**
 * Converts Tiptap JSON content back to the plain text contract format.
 */
export function tiptapJSONToDescription(json: JSONContent): string {
  if (!json.content) return ''

  const lines: string[] = []

  for (const node of json.content) {
    if (node.type === 'paragraph') {
      const text = node.content?.map(c => c.text || '').join('') || ''
      if (text.trim()) {
        lines.push(text.trim())
      }
    }
    else if (node.type === 'bulletList') {
      for (const li of (node.content || [])) {
        if (li.type === 'listItem') {
          // A listItem usually contains a paragraph
          const p = li.content?.find(c => c.type === 'paragraph')
          const text = p?.content?.map(c => c.text || '').join('') || ''
          if (text.trim()) {
            lines.push(`- ${text.trim()}`)
          }
        }
      }
    }
  }

  return lines.join('\n')
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/**
 * Formats a YYYY-MM-01 date string into 'Month YYYY'.
 * If the string doesn't match the format, it returns it as is.
 */
function formatMonthYear(dateString?: string | null): string {
  if (!dateString) return ''

  const parts = dateString.split('-')
  if (parts.length === 3) {
    const year = parts[0]
    const month = parseInt(parts[1] || '1', 10) - 1
    if (year && month >= 0 && month <= 11) {
      return `${MONTH_NAMES[month]} ${year}`
    }
  }

  return dateString // Fallback
}

/**
 * Generates the human-readable date range string for previews and PDFs.
 */
export function dateRangeLabel(startDate?: string | null, endDate?: string | null, isCurrent?: boolean): string {
  const start = formatMonthYear(startDate)
  const end = isCurrent ? 'Present' : formatMonthYear(endDate)

  if (!start) return ''
  if (!end) return start
  return `${start} - ${end}`
}
