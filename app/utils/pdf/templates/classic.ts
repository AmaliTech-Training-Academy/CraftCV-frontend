import type { Content, TDocumentDefinitions } from 'pdfmake/build/pdfmake'
import type { CvExportData } from '../exportData'
import { formatDateRange, normalizeBullets } from '../formatters'

export interface PdfTemplateOptions {
  paperSize: 'a4' | 'letter'
  includeLinks: boolean
}

const sectionTitle = (text: string, lineWidth: number): Content => ({
  stack: [
    { text: text.toUpperCase(), style: 'sectionTitle' },
    {
      canvas: [{
        type: 'line',
        x1: 0,
        y1: 1,
        x2: lineWidth,
        y2: 1,
        lineWidth: 0.5,
        lineColor: '#E5E7EB',
      }],
      margin: [0, 2, 0, 0],
    },
  ],
  margin: [0, 16, 0, 7],
})

interface ContactItem {
  text: string
  link?: string
  color: string
}

const contactLink = (text: string, link: string | undefined, includeLinks: boolean): ContactItem => ({
  text,
  ...(includeLinks && link ? { link } : {}),
  color: includeLinks && link ? '#2563EB' : '#4B5563',
})

const dateRange = (start?: string | null, end?: string | null): Content => ({
  text: formatDateRange(start, end),
  style: 'date',
  alignment: 'right',
})

function descriptionContent(description?: string | null): Content[] {
  const bullets = normalizeBullets(description)
  if (!bullets.length) return []
  return [{
    ul: bullets.map(text => ({ text, fontSize: 9.5, lineHeight: 1.25, color: '#374151' })),
    margin: [0, 2, 0, 6],
  }]
}

function toUrl(value: string): string {
  return value.startsWith('http://') || value.startsWith('https://')
    ? value
    : `https://${value}`
}

export function buildClassicPdf(
  data: CvExportData,
  options: PdfTemplateOptions,
): TDocumentDefinitions {
  const { personal } = data
  const contentWidth = options.paperSize === 'a4' ? 535 : 552
  const contactItems: ContactItem[] = []

  if (personal.email) contactItems.push(contactLink(personal.email, `mailto:${personal.email}`, options.includeLinks))
  if (personal.phone) contactItems.push({ text: personal.phone, color: '#4B5563' })
  if (personal.location) contactItems.push({ text: personal.location, color: '#4B5563' })
  if (personal.website) contactItems.push(contactLink(personal.website, toUrl(personal.website), options.includeLinks))
  if (personal.linkedin) contactItems.push(contactLink(personal.linkedin, toUrl(personal.linkedin), options.includeLinks))
  if (personal.github) contactItems.push(contactLink(personal.github, toUrl(personal.github), options.includeLinks))
  if (personal.nationality) contactItems.push({ text: personal.nationality, color: '#4B5563' })
  if (personal.dateOfBirth) contactItems.push({ text: `DOB: ${personal.dateOfBirth}`, color: '#4B5563' })
  if (personal.passport) contactItems.push({ text: `ID: ${personal.passport}`, color: '#4B5563' })
  if (personal.availability) contactItems.push({ text: personal.availability, color: '#4B5563' })

  const fullName = `${personal.firstName} ${personal.lastName}`.trim()
  const content: Content[] = []

  if (fullName) {
    content.push({
      text: fullName.toUpperCase(),
      style: 'name',
    })
  }

  const jobTitle = (personal.title || data.title || '').trim()
  if (jobTitle) {
    content.push({ text: jobTitle.toUpperCase(), style: 'jobTitle' })
  }

  if (contactItems.length > 0) {
    const inlineContactText: Content[] = []
    contactItems.forEach((item, index) => {
      if (index > 0) {
        inlineContactText.push({ text: '  •  ', color: '#9CA3AF' })
      }
      inlineContactText.push({
        text: item.text,
        ...(item.link ? { link: item.link, color: options.includeLinks ? '#2563EB' : '#4B5563' } : { color: '#4B5563' }),
      })
    })

    content.push({
      text: inlineContactText,
      fontSize: 9,
      color: '#4B5563',
      margin: [0, 4, 0, 0],
    })
  }

  if (fullName || jobTitle || contactItems.length > 0) {
    content.push({
      canvas: [{
        type: 'line',
        x1: 0,
        y1: 1,
        x2: contentWidth,
        y2: 1,
        lineWidth: 0.75,
        lineColor: '#D1D5DB',
      }],
      margin: [0, 12, 0, 0],
    })
  }

  const summaryText = (data.summary || data.professional_summary || '').trim()
  if (summaryText) {
    content.push(sectionTitle('Professional Summary', contentWidth))
    content.push({ text: summaryText, style: 'body' })
  }

  if (data.experience.length > 0) {
    content.push(sectionTitle('Experience', contentWidth))
    data.experience.forEach((item) => {
      const entryStack: Content[] = [
        {
          columns: [
            {
              width: '*',
              stack: [
                { text: item.title, style: 'itemTitle' },
                { text: [item.company, item.location].filter(Boolean).join(' | '), style: 'meta' },
              ],
            },
            { width: 'auto', stack: [dateRange(item.startDate || item.start_date, item.endDate || item.end_date)] },
          ],
          margin: [0, 0, 0, 3],
        },
        ...descriptionContent(item.description),
      ]
      content.push({ stack: entryStack, unbreakable: true })
    })
  }

  if (data.education.length > 0) {
    content.push(sectionTitle('Education', contentWidth))
    data.education.forEach((item) => {
      const entryStack: Content[] = [
        {
          columns: [
            {
              width: '*',
              stack: [
                { text: [item.degree, item.fieldOfStudy || item.field_of_study].filter(Boolean).join(', '), style: 'itemTitle' },
                { text: [item.school, item.location].filter(Boolean).join(' | '), style: 'meta' },
              ],
            },
            { width: 'auto', stack: [dateRange(item.startDate || item.start_date, item.endDate || item.end_date)] },
          ],
          margin: [0, 0, 0, 3],
        },
        ...descriptionContent(item.description),
      ]
      content.push({ stack: entryStack, unbreakable: true })
    })
  }

  if (data.skills.length > 0) {
    content.push(sectionTitle('Skills', contentWidth))
    content.push({
      ul: data.skills.map(skill => skill.level ? `${skill.name} (${skill.level})` : skill.name),
      style: 'body',
    })
  }

  if (data.certifications.length > 0) {
    content.push(sectionTitle('Certifications', contentWidth))
    data.certifications.forEach((item) => {
      const certificationStack: Content[] = [
        { text: item.name, style: 'itemTitle' },
        { text: [item.issuer, item.date].filter(Boolean).join(' | '), style: 'accent' },
      ]
      if (item.credentialUrl) {
        certificationStack.push({
          text: 'View credential',
          ...(options.includeLinks ? { link: toUrl(item.credentialUrl) } : {}),
          color: options.includeLinks ? '#2563EB' : '#4B5563',
          fontSize: 9,
        })
      }
      content.push({ stack: certificationStack, margin: [0, 0, 0, 7], unbreakable: true })
    })
  }

  if (data.languages && data.languages.length > 0) {
    content.push(sectionTitle('Languages', contentWidth))
    content.push({
      ul: data.languages.map(lang => lang.proficiency ? `${lang.name} (${lang.proficiency})` : lang.name),
      style: 'body',
    })
  }

  if (data.awards && data.awards.length > 0) {
    content.push(sectionTitle('Awards', contentWidth))
    data.awards.forEach((award) => {
      const awardStack: Content[] = [
        { text: award.name, style: 'itemTitle' },
        { text: [award.issuer, award.date].filter(Boolean).join(' | '), style: 'meta' },
      ]
      if (award.description) {
        awardStack.push({ text: award.description, style: 'body' })
      }
      content.push({ stack: awardStack, margin: [0, 0, 0, 6], unbreakable: true })
    })
  }

  if (data.additional_information && data.additional_information.length > 0) {
    content.push(sectionTitle('Additional Information', contentWidth))
    data.additional_information.forEach((info) => {
      content.push({
        stack: [
          { text: info.title, style: 'itemTitle' },
          { text: info.content, style: 'body' },
        ],
        margin: [0, 0, 0, 6],
        unbreakable: true,
      })
    })
  }

  return {
    info: {
      title: data.title || `${personal.firstName} ${personal.lastName}`.trim() || 'CraftCV Resume',
      author: 'CraftCV',
      subject: 'Curriculum Vitae',
      keywords: 'CV, resume, ATS',
    },
    pageSize: options.paperSize === 'a4' ? 'A4' : 'LETTER',
    pageOrientation: 'portrait',
    pageMargins: [30, 36, 30, 36],
    content,
    defaultStyle: {
      font: 'Roboto',
      color: '#1F2937',
    },
    styles: {
      name: {
        fontSize: 26,
        bold: true,
        color: '#111827',
        characterSpacing: 1.5,
        margin: [0, 0, 0, 3],
      },
      jobTitle: {
        fontSize: 10.5,
        bold: true,
        color: '#6B7280',
        characterSpacing: 1.5,
        margin: [0, 0, 0, 6],
      },
      sectionTitle: {
        fontSize: 9.5,
        bold: true,
        color: '#6B7280',
        characterSpacing: 1.35,
      },
      itemTitle: {
        font: 'Roboto',
        fontSize: 10.5,
        bold: true,
        color: '#111827',
      },
      accent: {
        font: 'Roboto',
        fontSize: 9.75,
        color: '#C54A22',
      },
      meta: {
        font: 'Roboto',
        fontSize: 9.75,
        italics: true,
        color: '#57504A',
      },
      date: {
        font: 'Roboto',
        fontSize: 8.5,
        color: '#6B7280',
      },
      body: {
        font: 'Roboto',
        fontSize: 9.75,
        lineHeight: 1.35,
        color: '#374151',
      },
      description: {
        font: 'Roboto',
        fontSize: 9.75,
        lineHeight: 1.35,
        color: '#374151',
      },
      contact: {
        font: 'Roboto',
        fontSize: 9,
        color: '#4B5563',
      },
    },
  }
}
