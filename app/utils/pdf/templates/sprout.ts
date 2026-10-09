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

const CHIP_TINT_WEIGHT = 0.12

const sectionTitle = (title: string): Content => {
  return {
    text: title.toUpperCase(),
    style: 'sectionLabel',
    margin: [0, 16, 0, 8],
  }
}

export function buildSproutPdf(
  data: CvExportData,
  options: PdfTemplateOptions,
): TDocumentDefinitions {
  const { personal } = data
  const PRIMARY_COLOR = options.accentColor || TEMPLATE_ACCENT_DEFAULTS.sprout
  // Derived rather than fixed, so the chips follow the accent instead of
  // staying purple on a CV that was recoloured.
  const CHIP_BG = accentTint(PRIMARY_COLOR, CHIP_TINT_WEIGHT)

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
    content.push({ text: contactLine, margin: [0, 4, 0, 12] })
  }

  // Thick purple horizontal bar
  content.push({
    canvas: [{
      type: 'rect',
      x: 0,
      y: 0,
      w: 64, // ~4rem
      h: 4,
      r: 2, // rounded corners
      color: PRIMARY_COLOR,
    }],
    margin: [0, 0, 0, 16],
  })

  // Body Sections

  // Profile
  if (data.summary?.trim()) {
    content.push(sectionTitle('Profile'))
    content.push({ text: data.summary.trim(), style: 'bodyText' })
  }

  // 1. Education
  if (data.educations && data.educations.length > 0) {
    content.push(sectionTitle('Education'))
    data.educations.forEach((edu, idx) => {
      const isLast = idx === data.educations!.length - 1
      const degreeText = edu.degree + (edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : '')

      content.push({ text: degreeText, style: 'itemTitle' })
      content.push({ text: `${edu.institution || ''} • ${formatDateRange(edu.startDate, edu.endDate)}`, style: 'itemMeta' })

      const bullets = normalizeBullets(edu.description)
      if (bullets.length > 0) {
        content.push({ ul: bullets, style: 'list' })
      }
      if (!isLast) content.push({ text: '', margin: [0, 0, 0, 12] })
    })
  }

  // 2. Projects / Additional Info
  if (data.additional_information && data.additional_information.length > 0) {
    content.push(sectionTitle('Projects'))
    data.additional_information.forEach((info, idx) => {
      const isLast = idx === data.additional_information!.length - 1
      content.push({ text: info.title || '', style: 'itemTitle' })
      if (info.description) {
        content.push({ text: info.description, style: 'bodyText', margin: [0, 2, 0, 0] })
      }
      if (!isLast) content.push({ text: '', margin: [0, 0, 0, 12] })
    })
  }

  // 3. Skills
  if (data.skills && data.skills.length > 0) {
    content.push(sectionTitle('Skills'))
    const skillChips: any[] = data.skills.map((s) => {
      return {
        table: {
          widths: ['auto'],
          body: [[{ text: s.name, style: 'chipText', border: [false, false, false, false], fillColor: CHIP_BG, margin: [8, 3, 8, 3] }]],
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
        margin: [0, 0, 6, 6],
      }
    })
    content.push({ columns: skillChips.map(c => ({ width: 'auto', ...c })) })
  }

  // 4. Experience
  if (data.experiences && data.experiences.length > 0) {
    content.push(sectionTitle('Experience'))
    data.experiences.forEach((exp, idx) => {
      const isLast = idx === data.experiences!.length - 1
      content.push({ text: exp.role || '', style: 'itemTitle' })
      content.push({ text: `${exp.company || ''} • ${formatDateRange(exp.startDate, exp.endDate)}`, style: 'itemMeta' })

      const bullets = normalizeBullets(exp.description)
      if (bullets.length > 0) {
        content.push({ ul: bullets, style: 'list' })
      }
      if (!isLast) content.push({ text: '', margin: [0, 0, 0, 12] })
    })
  }

  // 5. Awards/Certs
  if (data.certifications && data.certifications.length > 0) {
    content.push(sectionTitle('Certifications'))
    data.certifications.forEach((cert, idx) => {
      const isLast = idx === data.certifications!.length - 1
      content.push({ text: cert.name || '', style: 'itemTitle' })
      content.push({ text: `${cert.issuer || ''} • ${cert.date || ''}`, style: 'itemMeta' })
      if (!isLast) content.push({ text: '', margin: [0, 0, 0, 10] })
    })
  }

  // 6. Languages
  if (data.languages && data.languages.length > 0) {
    content.push(sectionTitle('Languages'))
    const langChips: any[] = data.languages.map((l) => {
      return {
        table: {
          widths: ['auto'],
          body: [[{ text: l.name, style: 'chipText', border: [false, false, false, false], fillColor: CHIP_BG, margin: [8, 3, 8, 3] }]],
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
        margin: [0, 0, 6, 6],
      }
    })
    content.push({ columns: langChips.map(c => ({ width: 'auto', ...c })) })
  }

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
      fontSize: 10,
      bold: true,
      color: PRIMARY_COLOR,
      letterSpacing: 2,
    },
    itemTitle: {
      font: 'Roboto',
      fontSize: 11.5,
      bold: true,
      color: '#111827',
    },
    itemMeta: {
      font: 'Roboto',
      fontSize: 10,
      color: '#6B7280',
      margin: [0, 2, 0, 4],
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
      fontSize: 9.5,
      bold: true,
      color: PRIMARY_COLOR,
    },
  }

  return {
    content,
    styles,
    defaultStyle: {
      font: 'Roboto',
    },
    pageMargins: [40, 40, 40, 40],
    pageSize: options.paperSize.toUpperCase() as 'A4' | 'LETTER',
  }
}
