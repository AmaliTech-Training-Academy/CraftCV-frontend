import type { Content, TDocumentDefinitions, StyleDictionary } from 'pdfmake/build/pdfmake'
import type { CvExportData } from '../exportData'
import type { PdfTemplateOptions } from './classic'
import { formatDateRange, normalizeBullets } from '../formatters'

function toUrl(value: string): string {
  return value.startsWith('http://') || value.startsWith('https://')
    ? value
    : `https://${value}`
}

const PRIMARY_COLOR = '#7f1d1d' // dark red
const CHIP_BG = '#fae8e8' // light red tint

const sectionRow = (label: string, contentStack: Content[], isLast: boolean): Content[] => {
  const row: Content[] = [
    {
      columns: [
        {
          width: '23%',
          text: label.toUpperCase(),
          style: 'sectionLabel'
        },
        {
          width: '77%',
          stack: contentStack
        }
      ],
      margin: [0, 16, 0, 16]
    }
  ]
  
  if (!isLast) {
    row.push({
      canvas: [{
        type: 'line',
        x1: 0,
        y1: 0,
        x2: 515, // Approx A4 content width (595 - 80)
        y2: 0,
        lineWidth: 0.5,
        lineColor: '#e5e7eb'
      }]
    })
  }
  
  return row
}

export function buildCampusPdf(
  data: CvExportData,
  options: PdfTemplateOptions,
): TDocumentDefinitions {
  const { personal } = data
  const contentWidth = options.paperSize === 'a4' ? 515 : 532
  const PAGE_WIDTH = options.paperSize === 'a4' ? 595.28 : 612

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
    content.push({ text: fullName, style: 'headerName' })
  }
  if (contactLine.length > 0) {
    content.push({ text: contactLine, margin: [0, 4, 0, 10] })
  }
  
  // Thick red horizontal line
  content.push({
    canvas: [{
      type: 'rect',
      x: 0,
      y: 0,
      w: contentWidth,
      h: 1.5,
      color: PRIMARY_COLOR
    }],
    margin: [0, 0, 0, 8]
  })

  // Body Sections
  const sections: { label: string, stack: Content[] }[] = []

  // Profile
  if (data.summary?.trim()) {
    sections.push({
      label: 'Profile',
      stack: [{ text: data.summary.trim(), style: 'bodyText' }]
    })
  }

  // Education
  if (data.educations && data.educations.length > 0) {
    const eduStack: Content[] = []
    data.educations.forEach((edu, idx) => {
      const isLast = idx === data.educations!.length - 1
      const degreeText = edu.degree + (edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : '')
      
      eduStack.push({ text: degreeText, style: 'itemTitle' })
      eduStack.push({ text: `${edu.institution || ''} • ${formatDateRange(edu.startDate, edu.endDate, edu.isCurrent)}`, style: 'itemMeta' })

      const bullets = normalizeBullets(edu.description)
      if (bullets.length > 0) {
        eduStack.push({ ul: bullets, style: 'list' })
      }
      if (!isLast) eduStack.push({ text: '', margin: [0, 0, 0, 12] })
    })
    sections.push({ label: 'Education', stack: eduStack })
  }

  // Experience
  if (data.experiences && data.experiences.length > 0) {
    const expStack: Content[] = []
    data.experiences.forEach((exp, idx) => {
      const isLast = idx === data.experiences!.length - 1
      expStack.push({ text: exp.role || '', style: 'itemTitle' })
      expStack.push({ text: `${exp.company || ''} • ${formatDateRange(exp.startDate, exp.endDate, exp.isCurrent)}`, style: 'itemMeta' })

      const bullets = normalizeBullets(exp.description)
      if (bullets.length > 0) {
        expStack.push({ ul: bullets, style: 'list' })
      }
      if (!isLast) expStack.push({ text: '', margin: [0, 0, 0, 12] })
    })
    sections.push({ label: 'Experience', stack: expStack })
  }

  // Awards/Certs
  if (data.certifications && data.certifications.length > 0) {
    const certStack: Content[] = []
    data.certifications.forEach((cert, idx) => {
      const isLast = idx === data.certifications!.length - 1
      certStack.push({ text: cert.name || '', style: 'itemTitle' })
      certStack.push({ text: `${cert.issuer || ''} • ${cert.date || ''}`, style: 'itemMeta' })
      if (!isLast) certStack.push({ text: '', margin: [0, 0, 0, 10] })
    })
    sections.push({ label: 'Awards', stack: certStack })
  }

  // Projects / Additional Info
  if (data.additionalInfo && data.additionalInfo.length > 0) {
    const projStack: Content[] = []
    data.additionalInfo.forEach((info, idx) => {
      const isLast = idx === data.additionalInfo!.length - 1
      projStack.push({ text: info.title || '', style: 'itemTitle' })
      if (info.description) {
        projStack.push({ text: info.description, style: 'bodyText', margin: [0, 2, 0, 0] })
      }
      if (!isLast) projStack.push({ text: '', margin: [0, 0, 0, 10] })
    })
    sections.push({ label: 'Projects', stack: projStack })
  }

  // Skills
  if (data.skills && data.skills.length > 0) {
    const skillChips: any[] = data.skills.map(s => {
      return {
        table: {
          widths: ['auto'],
          body: [[{ text: s.name, style: 'chipText', border: [false, false, false, false], fillColor: CHIP_BG, margin: [6, 2, 6, 2] }]]
        },
        layout: {
          hLineColor: () => CHIP_BG,
          vLineColor: () => CHIP_BG,
          paddingLeft: () => 0,
          paddingRight: () => 0,
          paddingTop: () => 0,
          paddingBottom: () => 0,
        },
        margin: [0, 0, 4, 4]
      }
    })
    
    sections.push({
      label: 'Skills',
      stack: [{ columns: skillChips.map(c => ({ width: 'auto', ...c })) }]
    })
  }

  // Languages
  if (data.languages && data.languages.length > 0) {
    const langChips: any[] = data.languages.map(l => {
      return {
        table: {
          widths: ['auto'],
          body: [[{ text: l.name, style: 'chipText', border: [false, false, false, false], fillColor: CHIP_BG, margin: [6, 2, 6, 2] }]]
        },
        layout: {
          hLineColor: () => CHIP_BG,
          vLineColor: () => CHIP_BG,
          paddingLeft: () => 0,
          paddingRight: () => 0,
          paddingTop: () => 0,
          paddingBottom: () => 0,
        },
        margin: [0, 0, 4, 4]
      }
    })
    
    sections.push({
      label: 'Languages',
      stack: [{ columns: langChips.map(c => ({ width: 'auto', ...c })) }]
    })
  }

  // Render sections
  sections.forEach((sec, idx) => {
    const isLast = idx === sections.length - 1
    content.push(...sectionRow(sec.label, sec.stack, isLast))
  })


  const styles: StyleDictionary = {
    headerName: {
      font: 'Times',
      fontSize: 32,
      bold: true,
      color: '#111827'
    },
    contactText: {
      font: 'Times',
      fontSize: 10,
      color: '#6B7280'
    },
    contactBullet: {
      font: 'Times',
      fontSize: 10,
      color: '#9CA3AF'
    },
    sectionLabel: {
      font: 'Times',
      fontSize: 9,
      bold: true,
      color: PRIMARY_COLOR,
      letterSpacing: 2
    },
    itemTitle: {
      font: 'Times',
      fontSize: 11,
      bold: true,
      color: '#111827'
    },
    itemMeta: {
      font: 'Times',
      fontSize: 10,
      color: '#6B7280',
      margin: [0, 2, 0, 4]
    },
    bodyText: {
      font: 'Times',
      fontSize: 10,
      color: '#374151',
      lineHeight: 1.4
    },
    list: {
      font: 'Times',
      fontSize: 10,
      color: '#374151',
      lineHeight: 1.4,
      markerColor: PRIMARY_COLOR
    },
    chipText: {
      font: 'Times',
      fontSize: 9,
      bold: true,
      color: PRIMARY_COLOR
    }
  }

  return {
    content,
    styles,
    defaultStyle: {
      font: 'Times'
    },
    pageMargins: [40, 40, 40, 40],
    pageSize: options.paperSize.toUpperCase() as 'A4' | 'LETTER',
  }
}
