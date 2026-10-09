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

const SIDEBAR_TINT_WEIGHT = 0.07
const HEADER_HEIGHT = 140
const SIDEBAR_WIDTH_PERCENT = 0.31

const getMeterWidthStr = (level?: string) => {
  if (!level) return '100%'
  const l = level.toLowerCase()
  if (l === 'beginner' || l === 'basic') return '33%'
  if (l === 'intermediate') return '66%'
  if (l === 'advanced' || l === 'fluent' || l === 'native') return '100%'
  return '80%'
}

export function buildPrismPdf(
  data: CvExportData,
  options: PdfTemplateOptions,
): TDocumentDefinitions {
  const { personal } = data
  const PRIMARY_COLOR = options.accentColor || TEMPLATE_ACCENT_DEFAULTS.prism
  // Derived rather than fixed, so the sidebar wash follows the accent.
  const SIDEBAR_BG = accentTint(PRIMARY_COLOR, SIDEBAR_TINT_WEIGHT)
  const PAGE_WIDTH = options.paperSize === 'a4' ? 595.28 : 612
  const PAGE_HEIGHT = options.paperSize === 'a4' ? 841.89 : 792

  const SIDEBAR_W = PAGE_WIDTH * SIDEBAR_WIDTH_PERCENT
  const MAIN_W = PAGE_WIDTH - SIDEBAR_W

  const fullName = `${personal.firstName} ${personal.lastName}`.trim()
  const jobTitle = (personal.title || data.title || '').trim()

  const rawContactParts = [
    personal.email ? { text: personal.email, link: options.includeLinks ? `mailto:${personal.email}` : undefined } : null,
    personal.phone ? { text: personal.phone } : null,
    personal.location ? { text: personal.location } : null,
    personal.website ? { text: personal.website.replace(/^https?:\/\//, ''), link: options.includeLinks ? toUrl(personal.website) : undefined } : null,
    personal.linkedin ? { text: personal.linkedin.replace(/^https?:\/\//, ''), link: options.includeLinks ? toUrl(personal.linkedin) : undefined } : null,
    personal.github ? { text: personal.github.replace(/^https?:\/\//, ''), link: options.includeLinks ? toUrl(personal.github) : undefined } : null,
  ].filter((p): p is { text: string, link?: string } => p !== null && Boolean(p.text))

  // Left Sidebar Content
  const sidebarContent: Content[] = []

  if (rawContactParts.length > 0) {
    sidebarContent.push({ text: 'CONTACT', style: 'sidebarHeader' })
    rawContactParts.forEach((part) => {
      const node: Record<string, any> = { text: part.text, style: 'contactText' } as any
      if (part.link) node.link = part.link
      sidebarContent.push(node)
      sidebarContent.push({ text: '', margin: [0, 0, 0, 4] }) // spacing
    })
    sidebarContent.push({ text: '', margin: [0, 0, 0, 16] })
  }

  if (data.skills && data.skills.length > 0) {
    sidebarContent.push({ text: 'SKILLS', style: 'sidebarHeader' })
    data.skills.forEach((skill) => {
      sidebarContent.push({ text: skill.name, style: 'sidebarItemTitle' })
      const widthPct = parseInt(getMeterWidthStr(skill.level)) / 100
      sidebarContent.push({
        canvas: [
          { type: 'rect', x: 0, y: 0, w: SIDEBAR_W - 60, h: 4, color: '#e5e7eb', r: 2 },
          { type: 'rect', x: 0, y: 0, w: (SIDEBAR_W - 60) * widthPct, h: 4, color: PRIMARY_COLOR, r: 2 },
        ],
        margin: [0, 4, 0, 8],
      })
    })
    sidebarContent.push({ text: '', margin: [0, 0, 0, 12] })
  }

  if (data.educations && data.educations.length > 0) {
    sidebarContent.push({ text: 'EDUCATION', style: 'sidebarHeader' })
    data.educations.forEach((edu) => {
      const degreeText = edu.degree + (edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : '')
      sidebarContent.push({ text: degreeText, style: 'sidebarItemTitle' })
      sidebarContent.push({ text: edu.institution || '', style: 'sidebarItemSub' })
      sidebarContent.push({ text: formatDateRange(edu.startDate, edu.endDate).toUpperCase(), style: 'sidebarDate' })
      sidebarContent.push({ text: '', margin: [0, 0, 0, 10] })
    })
    sidebarContent.push({ text: '', margin: [0, 0, 0, 6] })
  }

  if (data.languages && data.languages.length > 0) {
    sidebarContent.push({ text: 'LANGUAGES', style: 'sidebarHeader' })
    data.languages.forEach((lang) => {
      sidebarContent.push({ text: lang.name, style: 'sidebarItemTitle' })
      const widthPct = parseInt(getMeterWidthStr(lang.proficiency)) / 100
      sidebarContent.push({
        canvas: [
          { type: 'rect', x: 0, y: 0, w: SIDEBAR_W - 60, h: 4, color: '#e5e7eb', r: 2 },
          { type: 'rect', x: 0, y: 0, w: (SIDEBAR_W - 60) * widthPct, h: 4, color: PRIMARY_COLOR, r: 2 },
        ],
        margin: [0, 4, 0, 8],
      })
    })
    sidebarContent.push({ text: '', margin: [0, 0, 0, 12] })
  }

  if (data.certifications && data.certifications.length > 0) {
    sidebarContent.push({ text: 'AWARDS & CERTS', style: 'sidebarHeader' })
    data.certifications.forEach((cert) => {
      sidebarContent.push({ text: cert.name, style: 'sidebarItemTitle' })
      if (cert.issuer) sidebarContent.push({ text: cert.issuer, style: 'sidebarItemSub' })
      sidebarContent.push({ text: '', margin: [0, 0, 0, 8] })
    })
  }

  // Right Main Content
  const mainContent: Content[] = []

  if (data.summary?.trim()) {
    mainContent.push({ text: 'PROFILE', style: 'mainHeader' })
    mainContent.push({ text: data.summary.trim(), style: 'bodyText', margin: [0, 0, 0, 20] })
  }

  if (data.experiences && data.experiences.length > 0) {
    mainContent.push({ text: 'EXPERIENCE', style: 'mainHeader' })

    data.experiences.forEach((exp, idx) => {
      const isLast = idx === data.experiences!.length - 1
      const bullets = normalizeBullets(exp.description)

      const jobBlock: Content[] = [
        { text: exp.role || '', style: 'jobTitle' },
        { text: `${exp.company || ''}  |  ${formatDateRange(exp.startDate, exp.endDate)}`, style: 'jobMeta' },
      ]

      if (bullets.length > 0) {
        jobBlock.push({ ul: bullets, style: 'list' })
      }

      // Render timeline by placing the job block in a table with a colored left border
      mainContent.push({
        table: {
          widths: ['*'],
          body: [[{ stack: jobBlock, border: [true, false, false, false], borderColor: [PRIMARY_COLOR, '', '', ''], paddingLeft: 12 }]],
        },
        layout: {
          defaultBorder: false,
          hLineWidth: () => 0,
          vLineWidth: i => (i === 0 ? 2 : 0), // left border only
          paddingLeft: () => 12,
          paddingRight: () => 0,
          paddingTop: () => 0,
          paddingBottom: () => 0,
        },
        margin: [0, 0, 0, isLast ? 20 : 16],
      })
    })
  }

  if (data.additional_information && data.additional_information.length > 0) {
    mainContent.push({ text: 'SELECTED WORK', style: 'mainHeader' })
    const chips = data.additional_information.map(info => info.title).filter(Boolean).join('   •   ')
    mainContent.push({ text: chips, style: 'chipsText' })
  }

  return {
    pageMargins: [0, 0, 0, 0], // manual control
    background: [
      {
        canvas: [
          // Sidebar BG
          { type: 'rect', x: 0, y: HEADER_HEIGHT, w: SIDEBAR_W, h: PAGE_HEIGHT - HEADER_HEIGHT, color: SIDEBAR_BG },
          // Header BG
          { type: 'rect', x: 0, y: 0, w: PAGE_WIDTH, h: HEADER_HEIGHT, color: PRIMARY_COLOR },
        ],
      },
    ],
    content: [
      // Header Text
      {
        text: fullName,
        style: 'headerName',
        absolutePosition: { x: 40, y: 40 },
      },
      {
        text: jobTitle,
        style: 'headerTitle',
        absolutePosition: { x: 40, y: 90 },
      },
      // Columns (Start below header)
      {
        absolutePosition: { x: 0, y: HEADER_HEIGHT },
        columns: [
          {
            width: SIDEBAR_W,
            stack: sidebarContent,
            margin: [30, 30, 30, 30], // internal padding for sidebar
          },
          {
            width: MAIN_W,
            stack: mainContent,
            margin: [40, 30, 40, 30], // internal padding for main col
          },
        ],
      },
    ],
    styles: {
      headerName: {
        fontSize: 36,
        bold: true,
        color: '#ffffff',
        lineHeight: 1,
      },
      headerTitle: {
        fontSize: 14,
        color: '#ffffff',
        opacity: 0.9,
        letterSpacing: 1,
      },
      sidebarHeader: {
        fontSize: 10,
        bold: true,
        color: PRIMARY_COLOR,
        letterSpacing: 1.5,
        margin: [0, 0, 0, 8],
      },
      sidebarItemTitle: {
        fontSize: 10,
        bold: true,
        color: '#111827',
        margin: [0, 0, 0, 2],
      },
      sidebarItemSub: {
        fontSize: 9,
        color: '#4B5563',
        margin: [0, 0, 0, 2],
      },
      sidebarDate: {
        fontSize: 8,
        color: '#9CA3AF',
        bold: true,
      },
      contactText: {
        fontSize: 9,
        color: '#374151',
        lineHeight: 1.2,
      },
      mainHeader: {
        fontSize: 11,
        bold: true,
        color: PRIMARY_COLOR,
        letterSpacing: 2,
        margin: [0, 0, 0, 12],
      },
      bodyText: {
        fontSize: 10,
        color: '#374151',
        lineHeight: 1.5,
      },
      jobTitle: {
        fontSize: 11,
        bold: true,
        color: '#111827',
        margin: [0, 0, 0, 2],
      },
      jobMeta: {
        fontSize: 9.5,
        color: '#6B7280',
        margin: [0, 0, 0, 6],
      },
      list: {
        fontSize: 10,
        color: '#374151',
        lineHeight: 1.4,
        markerColor: PRIMARY_COLOR,
      },
      chipsText: {
        fontSize: 10,
        bold: true,
        color: PRIMARY_COLOR,
      },
    },
    defaultStyle: {
      font: 'Helvetica',
    },
  }
}
