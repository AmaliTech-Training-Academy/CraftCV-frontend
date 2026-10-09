/**
 * The colour each template is designed around.
 *
 * This is what a CV shows until its owner picks a colour, and what the PDF
 * renderers fall back to when no colour is chosen — so a template that has
 * never been customised still exports in the colour it was drawn in rather
 * than in whatever the last CV happened to use.
 *
 * Shared on purpose: the live preview reads the accent through `useCVState`,
 * the PDF through `PdfTemplateOptions`, and both have to agree on the default
 * or the exported file would not match what the editor showed.
 */
export const TEMPLATE_ACCENT_DEFAULTS = {
  classic: '#C54A22',
  // The two neutral templates keep the colour they were drawn in: near-black
  // for modern's rules and headings, the slate sidebar for professional. They
  // only look different once someone picks a colour of their own.
  modern: '#1F2937',
  professional: '#2C3E50',
  inkwell: '#D97706',
  prism: '#E11D48',
  campus: '#7F1D1D',
  sprout: '#6D28D9',
  northstar: '#0F766E',
  meridian: '#1F3A5F',
} as const

/**
 * The brand orange. Used for a template we have no colour for and for a CV
 * whose template is not known yet.
 */
export const FALLBACK_ACCENT = '#F26438'

export function templateAccent(slug?: string | null): string {
  const normalized = (slug || '').trim().toLowerCase()
  return (TEMPLATE_ACCENT_DEFAULTS as Record<string, string | undefined>)[normalized] ?? FALLBACK_ACCENT
}

/**
 * `hex` mixed into white, for the pale tints the templates put behind chips and
 * sidebars.
 *
 * pdfmake has no `color-mix`, so a template that hardcodes its tint would keep
 * a purple chip on an orange CV the moment someone changes the accent. Deriving
 * the tint instead is what keeps the whole page one colour.
 */
export function accentTint(hex: string, weight = 0.12): string {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((hex || '').trim())
  if (!match) return '#F3F4F6'

  const digits = match[1].length === 3
    ? match[1].split('').map(d => d + d).join('')
    : match[1]

  const channels = [0, 2, 4].map((offset) => {
    const channel = Number.parseInt(digits.slice(offset, offset + 2), 16)
    // Toward white, so a pale accent stays pale rather than washing out.
    const mixed = Math.round(channel * weight + 255 * (1 - weight))
    return Math.min(255, Math.max(0, mixed)).toString(16).padStart(2, '0')
  })

  return `#${channels.join('')}`
}
