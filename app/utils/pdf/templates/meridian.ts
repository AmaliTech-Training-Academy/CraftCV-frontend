import type { Content, TDocumentDefinitions, StyleDictionary } from 'pdfmake/build/pdfmake'
import type { CvExportData } from '../exportData'
import type { PdfTemplateOptions } from './classic'
import { formatDateRange, normalizeBullets } from '../formatters'

function toUrl(value: string): string {
  return value.startsWith('http://') || value.startsWith('https://')
    ? value
    : `https://${value}`
}

const PRIMARY_COLOR = '#1f3a5f' // Navy
const BORDER_COLOR = '#d1d5db' // Slate-300 / Gray-300
const BORDER_WIDTH = 12

const sectionTitle = (title: string): Content => {
  return [
    {
      text: title.toUpperCase(),
      style: 'sectionLabel',
      margin: [0, 16, 0, 4]
    },
    {
      canvas: [
        {
          type: 'line',
          x1: 0,
          y1: 0,
          x2: 595 - 80 - (BORDER_WIDTH * 2), // Rough page width - margins - borders. Handled dynamically below.
          y2: 0,
          lineWidth: 1,
          lineColor: '#e5e7eb'
        }
      ],
      margin: [0, 0, 0, 8]
    }
  ]
}

export function buildMeridianPdf(
  data: CvExportData,
  options: PdfTemplateOptions,
): TDocumentDefinitions {
  const { personal } = data
  const PAGE_WIDTH = options.paperSize === 'a4' ? 595.28 : 612
  const PAGE_HEIGHT = options.paperSize === 'a4' ? 841.89 : 792

  // We need to calculate the actual width of the canvas line for the dividers
  // margins are set to 40 + BORDER_WIDTH = 52. Left and Right margins = 104.
  const contentWidth = PAGE_WIDTH - ((40 + BORDER_WIDTH) * 2)

  const makeDivider = (): Content => ({
    canvas: [
      {
        type: 'line',
        x1: 0,
        y1: 0,
        x2: contentWidth,
        y2: 0,
        lineWidth: 1,
        lineColor: '#e5e7eb'
      }
    ],
    margin: [0, 0, 0, 12]
  })

  const makeSectionTitle = (title: string): Content => {
    return [
      {
        text: title.toUpperCase(),
        style: 'sectionLabel',
        margin: [0, 16, 0, 4]
      },
      makeDivider()
    ]
  }

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

  const content: Content[] = []

  // Header
  if (fullName) {
    content.push({ text: fullName, style: 'headerName', alignment: 'center' })
  }
  if (contactLine.length > 0) {
    content.push({ text: contactLine, margin: [0, 6, 0, 12], alignment: 'center' })
  }
  
  // Thick Navy Line
  content.push({
    canvas: [{
      type: 'rect',
      x: 0,
      y: 0,
      w: contentWidth,
      h: 2,
      color: PRIMARY_COLOR
    }],
    margin: [0, 0, 0, 16]
  })

  // Executive Summary
  if (data.summary?.trim()) {
    content.push(makeSectionTitle('Executive Summary'))
    content.push({ text: data.summary.trim(), style: 'bodyText' })
  }

  // Key Achievements
  if (data.additionalInfo && data.additionalInfo.length > 0) {
    content.push(makeSectionTitle('Key Achievements'))
    data.additionalInfo.forEach((info, idx) => {
      const isLast = idx === data.additionalInfo!.length - 1
      content.push({
        text: [
          { text: '•  ', style: 'bulletPoint' },
          { text: `${info.title}: `, bold: true, color: '#374151' },
          { text: info.content || '', style: 'bodyText' }
        ],
        margin: [0, 0, 0, isLast ? 0 : 8]
      })
    })
  }

  // Experience
  if (data.experiences && data.experiences.length > 0) {
    content.push(makeSectionTitle('Experience'))
    data.experiences.forEach((exp, idx) => {
      const isLast = idx === data.experiences!.length - 1
      content.push({ text: exp.role || '', style: 'itemTitle' })
      content.push({ text: `${exp.company || ''} • ${formatDateRange(exp.startDate, exp.endDate, exp.isCurrent)}`, style: 'itemMeta' })

      const bullets = normalizeBullets(exp.description)
      if (bullets.length > 0) {
        content.push({ ul: bullets, style: 'list' })
      }
      if (!isLast) content.push({ text: '', margin: [0, 0, 0, 16] })
    })
  }

  // Awards
  // Ensure we fall back to empty array if awards doesn't exist
  const awards = (data as any).awards || []
  if (awards.length > 0) {
    content.push(makeSectionTitle('Awards'))
    awards.forEach((award: any, idx: number) => {
      const isLast = idx === awards.length - 1
      
      const meta = [award.issuer, award.date].filter(Boolean).join(' • ')
      const headerText = [
        { text: '•  ', style: 'bulletPoint' },
        { text: award.name || '', bold: true, color: '#111827' }
      ]
      
      if (meta) {
        headerText.push({ text: ` • ${meta}`, bold: false, color: '#6B7280' })
      }

      content.push({
        text: headerText,
        margin: [0, 0, 0, award.description ? 4 : (isLast ? 0 : 10)]
      })

      if (award.description) {
        content.push({ text: award.description, style: 'bodyText', margin: [14, 0, 0, isLast ? 0 : 10] })
      }
    })
  }

  // Education
  if (data.educations && data.educations.length > 0) {
    content.push(makeSectionTitle('Education'))
    data.educations.forEach((edu, idx) => {
      const isLast = idx === data.educations!.length - 1
      const degreeText = edu.degree + (edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : '')
      
      content.push({ text: degreeText, style: 'itemTitle' })
      content.push({ text: `${edu.institution || ''} • ${formatDateRange(edu.startDate, edu.endDate, edu.isCurrent)}`, style: 'itemMeta' })

      if (!isLast) content.push({ text: '', margin: [0, 0, 0, 12] })
    })
  }

  const styles: StyleDictionary = {
    headerName: {
      font: 'Times',
      fontSize: 34,
      bold: true,
      color: PRIMARY_COLOR
    },
    contactText: {
      font: 'Times',
      fontSize: 11,
      color: '#6B7280'
    },
    contactBullet: {
      font: 'Times',
      fontSize: 11,
      color: '#9CA3AF'
    },
    sectionLabel: {
      font: 'Times',
      fontSize: 10,
      bold: true,
      color: PRIMARY_COLOR,
      letterSpacing: 1.5
    },
    itemTitle: {
      font: 'Times',
      fontSize: 13,
      bold: true,
      color: PRIMARY_COLOR
    },
    itemMeta: {
      font: 'Times',
      fontSize: 11,
      color: '#6B7280',
      margin: [0, 2, 0, 6]
    },
    bodyText: {
      font: 'Times',
      fontSize: 11,
      color: '#374151',
      lineHeight: 1.4
    },
    list: {
      font: 'Times',
      fontSize: 11,
      color: '#374151',
      lineHeight: 1.4,
      markerColor: PRIMARY_COLOR
    },
    bulletPoint: {
      font: 'Times',
      fontSize: 12,
      color: PRIMARY_COLOR
    }
  }

  return {
    background: function (currentPage, pageCount) {
      return {
        canvas: [
          // Left Border
          {
            type: 'rect',
            x: 0,
            y: 0,
            w: BORDER_WIDTH,
            h: PAGE_HEIGHT,
            color: BORDER_COLOR
          },
          // Right Border
          {
            type: 'rect',
            x: PAGE_WIDTH - BORDER_WIDTH,
            y: 0,
            w: BORDER_WIDTH,
            h: PAGE_HEIGHT,
            color: BORDER_COLOR
          },
          // Top Border
          {
            type: 'rect',
            x: 0,
            y: 0,
            w: PAGE_WIDTH,
            h: BORDER_WIDTH,
            color: BORDER_COLOR
          },
          // Bottom Border
          {
            type: 'rect',
            x: 0,
            y: PAGE_HEIGHT - BORDER_WIDTH,
            w: PAGE_WIDTH,
            h: BORDER_WIDTH,
            color: BORDER_COLOR
          }
        ]
      }
    },
    content,
    styles,
    defaultStyle: {
      font: 'Times'
    },
    pageMargins: [40 + BORDER_WIDTH, 40 + BORDER_WIDTH, 40 + BORDER_WIDTH, 40 + BORDER_WIDTH],
    pageSize: options.paperSize.toUpperCase() as 'A4' | 'LETTER',
  }
}
