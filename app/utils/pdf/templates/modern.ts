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

const sectionHeader = (text: string, lineWidth: number, lineColor: string): Content => ({
  stack: [
    { text: text.toUpperCase(), style: 'sectionTitle' },
    {
      canvas: [{
        type: 'line',
        x1: 0,
        y1: 1,
        x2: lineWidth,
        y2: 1,
        lineWidth: 0.75,
        lineColor,
      }],
      margin: [0, 2, 0, 0],
    },
  ],
  margin: [0, 14, 0, 8],
})

export function buildModernPdf(
  data: CvExportData,
  options: PdfTemplateOptions,
): TDocumentDefinitions {
  const { personal } = data
  const contentWidth = options.paperSize === 'a4' ? 535 : 552
  // The headings sit in the accent; the rule beneath it is washed out, which
  // is what keeps the default — near-black — drawing the pale divider the
  // template ships with. Mirrors SingleColumnTemplate.vue.
  const accent = options.accentColor || TEMPLATE_ACCENT_DEFAULTS.modern
  const ruleColor = accentTint(accent, 0.2)
  const header = (text: string) => sectionHeader(text, contentWidth, ruleColor)

  const rawContactParts = [
    personal.email ? { text: personal.email, link: options.includeLinks ? `mailto:${personal.email}` : undefined } : null,
    personal.phone ? { text: personal.phone } : null,
    personal.location ? { text: personal.location } : null,

    personal.linkedinUrl ? { text: personal.linkedinUrl.replace(/^https?:\/\//, ''), link: personal.linkedinUrl } : null,
    personal.githubUrl ? { text: personal.githubUrl.replace(/^https?:\/\//, ''), link: personal.githubUrl } : null,
    personal.twitterUrl ? { text: personal.twitterUrl.replace(/^https?:\/\//, ''), link: personal.twitterUrl } : null,
    personal.website ? { text: personal.website.replace(/^https?:\/\//, ''), link: options.includeLinks ? toUrl(personal.website) : undefined } : null,
    personal.linkedin ? { text: personal.linkedin.replace(/^https?:\/\//, ''), link: options.includeLinks ? toUrl(personal.linkedin) : undefined } : null,
    personal.github ? { text: personal.github.replace(/^https?:\/\//, ''), link: options.includeLinks ? toUrl(personal.github) : undefined } : null,
                  ].filter((p): p is { text: string, link?: string } => p !== null && Boolean(p.text))

  const fullName = `${personal.firstName} ${personal.lastName}`.trim()
  const content: Content[] = []

  if (fullName) {
    content.push({
      text: fullName,
      style: 'name',
    })
  }

  const jobTitle = (personal.title || data.title || '').trim()
  if (jobTitle) {
    content.push({
      text: jobTitle,
      style: 'jobTitle',
    })
  }

  if (rawContactParts.length > 0) {
    const inlineContactText: Content[] = []
    rawContactParts.forEach((item, index) => {
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
      margin: [0, 4, 0, 10],
    })
  }

  const summaryText = (data.summary || data.professional_summary || '').trim()
  if (summaryText) {
    content.push(header('Professional Summary'))
    content.push({ text: summaryText, style: 'body' })
  }

  const experiences = data.experiences || data.experience || []
  if (experiences.length > 0) {
    content.push(header('Professional Experience'))
    experiences.forEach((exp) => {
      const companyLocation = [exp.company, exp.location].filter(Boolean).join(' • ')
      const dateText = formatDateRange(exp.start_date || exp.startDate, exp.end_date || exp.endDate)
      const bullets = normalizeBullets(exp.description)

      const entryContent: Content = {
        stack: [
          {
            columns: [
              {
                width: '*',
                stack: [
                  { text: exp.role || exp.title || '', bold: true, fontSize: 10.5, color: '#111827' },
                  ...(companyLocation ? [{ text: companyLocation, fontSize: 9.5, color: '#4B5563', margin: [0, 1, 0, 4] as [number, number, number, number] }] : []),
                ],
              },
              {
                width: 'auto',
                alignment: 'right',
                text: dateText,
                fontSize: 9,
                color: '#6B7280',
              },
            ],
            margin: [0, 4, 0, 4],
          },
          ...(bullets.length > 0
            ? [{
                ul: bullets.map(text => ({ text, fontSize: 9.5, lineHeight: 1.25, color: '#374151' })),
                margin: [0, 2, 0, 8] as [number, number, number, number],
              }]
            : []),
        ],
        margin: [0, 0, 0, 4],
        unbreakable: true,
      }

      content.push(entryContent)
    })
  }

  const educations = data.educations || data.education || []
  if (educations.length > 0) {
    content.push(header('Education'))
    educations.forEach((edu) => {
      const degreeText = [edu.degree, edu.fieldOfStudy || edu.field_of_study].filter(Boolean).join(', ')
      const institutionLocation = [edu.school || edu.institution, edu.location].filter(Boolean).join(' • ')
      const dateText = formatDateRange(edu.start_date || edu.startDate, edu.end_date || edu.endDate)
      const bullets = normalizeBullets(edu.description)

      const entryContent: Content = {
        stack: [
          {
            columns: [
              {
                width: '*',
                stack: [
                  { text: degreeText || edu.degree || '', bold: true, fontSize: 10.5, color: '#111827' },
                  ...(institutionLocation ? [{ text: institutionLocation, fontSize: 9.5, color: '#4B5563', margin: [0, 1, 0, 4] as [number, number, number, number] }] : []),
                ],
              },
              {
                width: 'auto',
                alignment: 'right',
                text: dateText,
                fontSize: 9,
                color: '#6B7280',
              },
            ],
            margin: [0, 4, 0, 4],
          },
          ...(bullets.length > 0
            ? [{
                ul: bullets.map(text => ({ text, fontSize: 9.5, lineHeight: 1.25, color: '#374151' })),
                margin: [0, 2, 0, 8] as [number, number, number, number],
              }]
            : []),
        ],
        margin: [0, 0, 0, 4],
        unbreakable: true,
      }

      content.push(entryContent)
    })
  }

  if (data.skills && data.skills.length > 0) {
    content.push(header('Skills'))
    const skillItems = data.skills.map(s => s.level ? `${s.name} (${s.level})` : s.name).filter(Boolean)
    content.push({
      text: skillItems.join('   •   '),
      style: 'skillsList',
      margin: [0, 2, 0, 8],
    })
  }

  if (data.certifications && data.certifications.length > 0) {
    content.push(header('Certifications'))
    data.certifications.forEach((cert) => {
      const certStack: Content[] = [
        {
          columns: [
            { text: cert.name, style: 'itemTitle', width: '*' },
            ...(cert.date || cert.issue_date ? [{ text: cert.date || cert.issue_date, style: 'date', width: 'auto' }] : []),
          ],
        },
        { text: cert.issuer, style: 'meta', margin: [0, 1, 0, 2] },
      ]
      if (cert.credentialUrl) {
        certStack.push({
          text: 'View credential',
          ...(options.includeLinks ? { link: toUrl(cert.credentialUrl) } : {}),
          color: options.includeLinks ? '#2563EB' : '#4B5563',
          fontSize: 9,
        })
      }
      content.push({ stack: certStack, margin: [0, 0, 0, 6], unbreakable: true })
    })
  }

  if (data.languages && data.languages.length > 0) {
    content.push(header('Languages'))
    content.push({
      columns: [
        {
          text: data.languages.map(l => l.proficiency ? `${l.name} (${l.proficiency})` : l.name).join('   •   '),
          style: 'body',
        },
      ],
      margin: [0, 0, 0, 4],
    })
  }

  if (data.awards && data.awards.length > 0) {
    content.push(header('Awards'))
    data.awards.forEach((award) => {
      const awardStack: Content[] = [
        {
          columns: [
            { text: award.name, style: 'itemTitle', width: '*' },
            ...(award.date ? [{ text: award.date, style: 'date', width: 'auto' }] : []),
          ],
        },
        ...(award.issuer ? [{ text: award.issuer, style: 'meta', margin: [0, 1, 0, 2] as [number, number, number, number] }] : []),
        ...(award.description ? [{ text: award.description, style: 'body', margin: [0, 2, 0, 0] as [number, number, number, number] }] : []),
      ]
      content.push({ stack: awardStack, margin: [0, 0, 0, 6], unbreakable: true })
    })
  }

  if (data.additional_information && data.additional_information.length > 0) {
    content.push(header('Additional Information'))
    data.additional_information.forEach((info) => {
      content.push({
        stack: [
          { text: info.title, style: 'itemTitle' },
          { text: info.content, style: 'body', margin: [0, 1, 0, 0] },
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
      keywords: 'CV, resume, ATS, single-column',
    },
    pageSize: options.paperSize === 'a4' ? 'A4' : 'LETTER',
    pageOrientation: 'portrait',
    pageMargins: [34, 36, 34, 36],
    content,
    defaultStyle: {
      font: 'Roboto',
      color: '#1F2937',
    },
    styles: {
      name: {
        fontSize: 24,
        bold: true,
        color: '#111827',
        margin: [0, 0, 0, 2],
      },
      jobTitle: {
        fontSize: 12,
        color: '#4B5563',
        margin: [0, 0, 0, 6],
      },
      sectionTitle: {
        fontSize: 9.5,
        bold: true,
        color: accent,
        characterSpacing: 1.5,
      },
      itemTitle: {
        fontSize: 10.5,
        bold: true,
        color: '#111827',
      },
      meta: {
        fontSize: 9.5,
        color: '#6B7280',
      },
      date: {
        fontSize: 9,
        italics: true,
        color: '#6B7280',
        alignment: 'right',
      },
      body: {
        fontSize: 9.5,
        lineHeight: 1.35,
        color: '#374151',
      },
      description: {
        fontSize: 9.5,
        lineHeight: 1.35,
        color: '#374151',
      },
      contact: {
        fontSize: 9,
        color: '#4B5563',
      },
      skillsList: {
        fontSize: 9.5,
        lineHeight: 1.4,
        color: '#374151',
      },
    },
  }
}
