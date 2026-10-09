import type { Content, TDocumentDefinitions } from 'pdfmake/build/pdfmake'
import type { CvExportData } from '../exportData'
import type { PdfTemplateOptions } from './classic'
import { formatDateRange, normalizeBullets } from '../formatters'
import { accentTint, TEMPLATE_ACCENT_DEFAULTS } from '../../templateAccents'

function toUrl(value: string): string {
  return value.startsWith('http://') || value.startsWith('https://')
    ? value
    : `https://${value}`
}

const TRACK_BG = '#cbd5e1' // gray progress bar track
// How far the panel and chip tints sit from the page, as the same pale washes
// the template was drawn with.
const PANEL_TINT_WEIGHT = 0.07
const CHIP_TINT_WEIGHT = 0.16

const getMeterWidthNum = (level?: string): number => {
  if (!level) return 1.0
  const l = level.toLowerCase()
  if (l === 'beginner' || l === 'basic') return 0.33
  if (l === 'intermediate') return 0.66
  if (l === 'advanced' || l === 'fluent' || l === 'native') return 1.0
  return 0.8
}

const sectionTitle = (title: string): Content => {
  return {
    text: title.toUpperCase(),
    style: 'sectionLabel',
    margin: [0, 0, 0, 10],
  }
}

export function buildNorthstarPdf(
  data: CvExportData,
  options: PdfTemplateOptions,
): TDocumentDefinitions {
  const { personal } = data
  const PRIMARY_COLOR = options.accentColor || TEMPLATE_ACCENT_DEFAULTS.northstar
  // Derived rather than fixed, so a recoloured CV does not keep teal panels
  // behind orange headings.
  const BG_COLOR = accentTint(PRIMARY_COLOR, PANEL_TINT_WEIGHT)
  const CHIP_BG = accentTint(PRIMARY_COLOR, CHIP_TINT_WEIGHT)
  const PAGE_WIDTH = options.paperSize === 'a4' ? 595.28 : 612
  const PAGE_HEIGHT = options.paperSize === 'a4' ? 841.89 : 792

  const SIDEBAR_PCT = 0.31
  const SIDEBAR_W = PAGE_WIDTH * SIDEBAR_PCT

  const fullName = `${personal.firstName} ${personal.lastName}`.trim()
  const jobTitle = (personal.title || data.title || '').trim()

  const rawContactParts = [
    jobTitle ? { text: jobTitle } : null,
    personal.location ? { text: personal.location } : null,
    personal.email ? { text: personal.email, link: options.includeLinks ? `mailto:${personal.email}` : undefined } : null,
    personal.phone ? { text: personal.phone } : null,
    personal.website ? { text: personal.website.replace(/^https?:\/\//, ''), link: options.includeLinks ? toUrl(personal.website) : undefined } : null,
    personal.linkedin ? { text: personal.linkedin.replace(/^https?:\/\//, ''), link: options.includeLinks ? toUrl(personal.linkedin) : undefined } : null,
    personal.github ? { text: personal.github.replace(/^https?:\/\//, ''), link: options.includeLinks ? toUrl(personal.github) : undefined } : null,
  ].filter((p): p is { text: string, link?: string } => p !== null && Boolean(p.text))

  const contactLine: any[] = []
  rawContactParts.forEach((part, i) => {
    if (i > 0) {
      contactLine.push({ text: '  •  ', style: 'contactBullet' })
    }
    const node: any = { text: part.text, style: 'contactText' }
    if (part.link) node.link = part.link
    contactLine.push(node)
  })

  // LEFT COLUMN
  const leftStack: Content[] = []

  // Header
  if (fullName) {
    leftStack.push({ text: fullName, style: 'headerName' })
  }
  if (contactLine.length > 0) {
    leftStack.push({ text: contactLine, margin: [0, 4, 0, 16] })
  }

  // Profile
  if (data.summary?.trim()) {
    leftStack.push(sectionTitle('Profile'))
    leftStack.push({ text: data.summary.trim(), style: 'bodyText', margin: [0, 0, 0, 16] })
  }

  // Experience
  if (data.experiences && data.experiences.length > 0) {
    leftStack.push(sectionTitle('Experience'))
    data.experiences.forEach((exp, idx) => {
      const isLast = idx === data.experiences!.length - 1
      leftStack.push({ text: exp.role || '', style: 'itemTitle' })
      leftStack.push({ text: `${exp.company || ''} • ${formatDateRange(exp.startDate, exp.endDate)}`, style: 'itemMeta' })

      const bullets = normalizeBullets(exp.description)
      if (bullets.length > 0) {
        leftStack.push({ ul: bullets, style: 'list' })
      }
      if (!isLast) leftStack.push({ text: '', margin: [0, 0, 0, 12] })
    })
    leftStack.push({ text: '', margin: [0, 0, 0, 16] })
  }

  // Projects
  if (data.additional_information && data.additional_information.length > 0) {
    leftStack.push(sectionTitle('Selected Projects'))
    data.additional_information.forEach((info, idx) => {
      const isLast = idx === data.additional_information!.length - 1
      leftStack.push({ text: info.title || '', style: 'itemTitle' })
      if (info.description) {
        leftStack.push({ text: info.description, style: 'bodyText', margin: [0, 2, 0, 0] })
      }
      if (!isLast) leftStack.push({ text: '', margin: [0, 0, 0, 12] })
    })
    leftStack.push({ text: '', margin: [0, 0, 0, 16] })
  }

  // Awards/Certifications (Left)
  if (data.certifications && data.certifications.length > 0) {
    leftStack.push(sectionTitle('Awards'))
    data.certifications.forEach((cert, idx) => {
      const isLast = idx === data.certifications!.length - 1
      leftStack.push({ text: cert.name || '', style: 'itemTitle' })
      leftStack.push({ text: `${cert.issuer || ''} • ${cert.date || ''}`, style: 'itemMeta' })
      if (!isLast) leftStack.push({ text: '', margin: [0, 0, 0, 10] })
    })
  }

  // RIGHT COLUMN
  const rightStack: Content[] = []

  // Padding at top to align loosely below header (or just start directly)
  rightStack.push({ text: '', margin: [0, 16, 0, 0] }) // 16pt top padding

  // Skills
  if (data.skills && data.skills.length > 0) {
    rightStack.push(sectionTitle('Skills'))
    const skillChips: any[] = data.skills.map((s) => {
      return {
        table: {
          widths: ['auto'],
          body: [[{ text: s.name, style: 'chipText', border: [false, false, false, false], fillColor: CHIP_BG, margin: [6, 2, 6, 2] }]],
        },
        layout: {
          hLineColor: () => CHIP_BG,
          vLineColor: () => CHIP_BG,
          paddingLeft: () => 0,
          paddingRight: () => 0,
          paddingTop: () => 0,
          paddingBottom: () => 0,
          defaultBorder: false,
        },
        margin: [0, 0, 4, 4],
      }
    })
    rightStack.push({ columns: skillChips.map(c => ({ width: 'auto', ...c })), margin: [0, 0, 0, 16] })
  }

  // Education (Right)
  if (data.educations && data.educations.length > 0) {
    rightStack.push(sectionTitle('Education'))
    data.educations.forEach((edu, idx) => {
      const isLast = idx === data.educations!.length - 1
      const degreeText = edu.degree + (edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : '')

      rightStack.push({ text: degreeText, style: 'itemTitle' })
      rightStack.push({ text: edu.institution || '', style: 'itemMetaRight' })
      rightStack.push({ text: formatDateRange(edu.startDate, edu.endDate), style: 'itemMetaRight' })

      if (!isLast) rightStack.push({ text: '', margin: [0, 0, 0, 10] })
    })
    rightStack.push({ text: '', margin: [0, 0, 0, 16] })
  }

  // Languages (Meters)
  if (data.languages && data.languages.length > 0) {
    rightStack.push(sectionTitle('Languages'))

    // Sidebar usable width is SIDEBAR_W - padding(20L + 20R) roughly
    // The margin on right stack is set by column spacing.
    const meterTotalW = 100 // fixed width for meter in pdf

    data.languages.forEach((lang, idx) => {
      rightStack.push({ text: lang.name || '', style: 'itemTitle' })

      const fillW = meterTotalW * getMeterWidthNum(lang.proficiency)
      rightStack.push({
        canvas: [
          // Track
          {
            type: 'rect',
            x: 0,
            y: 0,
            w: meterTotalW,
            h: 4,
            r: 2,
            color: TRACK_BG,
          },
          // Fill
          {
            type: 'rect',
            x: 0,
            y: 0,
            w: fillW,
            h: 4,
            r: 2,
            color: PRIMARY_COLOR,
          },
        ],
        margin: [0, 4, 0, 10],
      })
    })
  }

  const content: Content[] = [
    {
      columns: [
        {
          width: '69%',
          stack: leftStack,
          margin: [0, 0, 20, 0], // padding right
        },
        {
          width: '31%',
          stack: rightStack,
          margin: [20, 0, 0, 0], // padding left
        },
      ],
    },
  ]

  const styles: any = {
    headerName: {
      font: 'Roboto',
      fontSize: 32,
      bold: true,
      color: '#111827',
    },
    contactText: {
      font: 'Roboto',
      fontSize: 10,
      color: '#6B7280',
    },
    contactBullet: {
      font: 'Roboto',
      fontSize: 10,
      color: '#9CA3AF',
    },
    sectionLabel: {
      font: 'Roboto',
      fontSize: 9,
      bold: true,
      color: PRIMARY_COLOR,
      letterSpacing: 1.5,
    },
    itemTitle: {
      font: 'Roboto',
      fontSize: 11,
      bold: true,
      color: '#111827',
    },
    itemMeta: {
      font: 'Roboto',
      fontSize: 10,
      color: '#6B7280',
      margin: [0, 2, 0, 4],
    },
    itemMetaRight: {
      font: 'Roboto',
      fontSize: 9.5,
      color: '#4B5563',
      margin: [0, 1, 0, 0],
    },
    bodyText: {
      font: 'Roboto',
      fontSize: 10,
      color: '#374151',
      lineHeight: 1.4,
    },
    list: {
      font: 'Roboto',
      fontSize: 10,
      color: '#374151',
      lineHeight: 1.4,
      markerColor: PRIMARY_COLOR,
    },
    chipText: {
      font: 'Roboto',
      fontSize: 9,
      bold: true,
      color: PRIMARY_COLOR,
    },
  }

  return {
    background: function (currentPage) {
      return {
        canvas: [
          {
            type: 'rect',
            x: PAGE_WIDTH - SIDEBAR_W,
            y: 0,
            w: SIDEBAR_W,
            h: PAGE_HEIGHT,
            color: BG_COLOR,
          },
        ],
      }
    },
    content,
    styles,
    defaultStyle: {
      font: 'Roboto',
    },
    pageMargins: [40, 40, 40, 40],
    pageSize: options.paperSize.toUpperCase() as 'A4' | 'LETTER',
  }
}
