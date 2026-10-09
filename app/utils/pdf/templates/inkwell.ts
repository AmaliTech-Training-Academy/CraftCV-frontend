import type { Content, TDocumentDefinitions } from 'pdfmake/build/pdfmake'
import type { CvExportData } from '../exportData'
import type { PdfTemplateOptions } from './classic'
import { formatDateRange, normalizeBullets } from '../formatters'
import { TEMPLATE_ACCENT_DEFAULTS } from '../../templateAccents'

function toUrl(value: string): string {
  return value.startsWith('http://') || value.startsWith('https://')
    ? value
    : `https://${value}`
}

const sectionHeader = (text: string, numberPrefix: string): Content => ({
  stack: [
    {
      text: [
        { text: numberPrefix + '  ', style: 'sectionNumber' },
        { text: text.toUpperCase(), style: 'sectionTitle' },
      ],
    },
  ],
  margin: [0, 16, 0, 8],
})

export function buildInkwellPdf(
  data: CvExportData,
  options: PdfTemplateOptions,
): TDocumentDefinitions {
  const { personal } = data
  const SECTION_COLOR = options.accentColor || TEMPLATE_ACCENT_DEFAULTS.inkwell
  const contentWidth = options.paperSize === 'a4' ? 515 : 532

  const rawContactParts = [
    personal.location ? { text: personal.location } : null,
    personal.phone ? { text: personal.phone } : null,
    personal.email ? { text: personal.email, link: options.includeLinks ? `mailto:${personal.email}` : undefined } : null,
    personal.website ? { text: personal.website.replace(/^https?:\/\//, ''), link: options.includeLinks ? toUrl(personal.website) : undefined } : null,
    personal.linkedin ? { text: personal.linkedin.replace(/^https?:\/\//, ''), link: options.includeLinks ? toUrl(personal.linkedin) : undefined } : null,
    personal.github ? { text: personal.github.replace(/^https?:\/\//, ''), link: options.includeLinks ? toUrl(personal.github) : undefined } : null,
    personal.twitter ? { text: personal.twitter.replace(/^https?:\/\//, ''), link: options.includeLinks ? toUrl(personal.twitter) : undefined } : null,
  ].filter((p): p is { text: string, link?: string } => p !== null && Boolean(p.text))

  const content: Content[] = []

  // Header: Name
  if (personal.firstName || personal.lastName) {
    content.push({
      text: [
        personal.firstName ? personal.firstName + '\n' : '',
        personal.lastName || '',
      ],
      style: 'name',
    })
  }

  // Thick Orange Line
  content.push({
    canvas: [{
      type: 'rect',
      x: 0,
      y: 0,
      w: contentWidth,
      h: 5,
      color: SECTION_COLOR,
    }],
    margin: [0, 8, 0, 8],
  })

  // Title and Contact
  const contactLine: any[] = []
  const jobTitle = (personal.title || data.title || '').trim()

  if (jobTitle) {
    contactLine.push({ text: jobTitle, style: 'contactTitle' })
  }

  rawContactParts.forEach((part, i) => {
    if (contactLine.length > 0) {
      contactLine.push({ text: '  •  ', style: 'contactBullet' })
    }
    const textNode: any = { text: part.text, style: 'contactText' }
    if (part.link) textNode.link = part.link
    contactLine.push(textNode)
  })

  if (contactLine.length > 0) {
    content.push({
      text: contactLine,
      margin: [0, 0, 0, 16],
    })
  }

  // Counter for sections
  let secIdx = 1
  const getNum = () => String(secIdx++).padStart(2, '0')

  // Summary
  if (data.summary?.trim()) {
    content.push(sectionHeader('Summary', getNum()))
    content.push({
      text: data.summary.trim(),
      style: 'summary',
    })
  }

  // Experience
  if (data.experiences && data.experiences.length > 0) {
    content.push(sectionHeader('Experience', getNum()))
    data.experiences.forEach((exp, idx) => {
      const isLast = idx === data.experiences!.length - 1

      content.push({
        text: exp.role || '',
        style: 'jobTitle',
      })
      content.push({
        text: `${exp.company || ''} • ${formatDateRange(exp.startDate, exp.endDate)}`,
        style: 'jobMeta',
      })

      const bullets = normalizeBullets(exp.description)
      if (bullets.length > 0) {
        content.push({
          ul: bullets,
          style: 'list',
        })
      }

      if (!isLast) {
        content.push({ text: '', margin: [0, 0, 0, 10] })
      }
    })
  }

  // Skills
  if (data.skills && data.skills.length > 0) {
    content.push(sectionHeader('Skills', getNum()))

    const skillList = data.skills.map(s => s.name).filter(Boolean).join('   •   ')
    content.push({
      text: skillList,
      style: 'skillsList',
    })
  }

  // Education
  if (data.educations && data.educations.length > 0) {
    content.push(sectionHeader('Education', getNum()))
    data.educations.forEach((edu, idx) => {
      const isLast = idx === data.educations!.length - 1
      const degreeText = edu.degree + (edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : '')

      content.push({
        text: degreeText,
        style: 'jobTitle',
      })
      content.push({
        text: `${edu.institution || ''} • ${formatDateRange(edu.startDate, edu.endDate)}`,
        style: 'jobMeta',
      })

      const bullets = normalizeBullets(edu.description)
      if (bullets.length > 0) {
        content.push({
          ul: bullets,
          style: 'list',
        })
      }

      if (!isLast) {
        content.push({ text: '', margin: [0, 0, 0, 10] })
      }
    })
  }

  // Certifications
  if (data.certifications && data.certifications.length > 0) {
    content.push(sectionHeader('Certifications', getNum()))
    data.certifications.forEach((cert, idx) => {
      const isLast = idx === data.certifications!.length - 1
      content.push({
        columns: [
          { text: cert.name || '', style: 'jobTitle' },
          { text: cert.date || '', style: 'certDate', alignment: 'right' },
        ],
      })
      if (cert.issuer) {
        content.push({ text: cert.issuer, style: 'jobMeta' })
      }
      if (!isLast) {
        content.push({ text: '', margin: [0, 0, 0, 8] })
      }
    })
  }

  const styles: any = {
    name: {
      fontSize: 32,
      bold: true,
      color: '#111827',
      lineHeight: 1,
    },
    contactTitle: {
      fontSize: 10,
      color: '#374151',
      bold: true,
    },
    contactText: {
      fontSize: 10,
      color: '#4B5563',
    },
    contactBullet: {
      fontSize: 10,
      color: '#9CA3AF',
    },
    sectionNumber: {
      fontSize: 11,
      bold: true,
      color: SECTION_COLOR,
      font: 'Courier',
    },
    sectionTitle: {
      fontSize: 11,
      bold: true,
      color: SECTION_COLOR,
      letterSpacing: 2,
    },
    summary: {
      fontSize: 10,
      color: '#374151',
      lineHeight: 1.5,
    },
    jobTitle: {
      fontSize: 11,
      bold: true,
      color: '#111827',
    },
    jobMeta: {
      fontSize: 9.5,
      color: '#6B7280',
      margin: [0, 2, 0, 4],
    },
    certDate: {
      fontSize: 9.5,
      color: '#6B7280',
    },
    list: {
      fontSize: 10,
      color: '#374151',
      lineHeight: 1.4,
      markerColor: SECTION_COLOR,
    },
    skillsList: {
      fontSize: 10,
      bold: true,
      color: SECTION_COLOR,
      lineHeight: 1.5,
    },
  }

  return {
    content,
    styles,
    background: [
      {
        canvas: [
          {
            type: 'rect',
            x: 0,
            y: 0,
            w: 595.28, // A4 width, pdfmake handles overflow naturally
            h: 841.89, // A4 height
            color: '#fffdf8',
          },
        ],
      },
    ],
    defaultStyle: {
      font: 'Helvetica',
      fontSize: 10,
      color: '#374151',
      lineHeight: 1.2,
    },
    pageMargins: [40, 40, 40, 40],
    pageSize: options.paperSize.toUpperCase() as 'A4' | 'LETTER',
  }
}
