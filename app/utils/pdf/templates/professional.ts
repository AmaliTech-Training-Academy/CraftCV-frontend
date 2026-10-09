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

const mainSectionHeader = (text: string): Content => ({
  stack: [
    { text: text.toUpperCase(), style: 'mainSectionTitle' },
    {
      canvas: [{
        type: 'line',
        x1: 0,
        y1: 1,
        x2: 365,
        y2: 1,
        lineWidth: 0.75,
        lineColor: '#E2E8F0',
      }],
      margin: [0, 2, 0, 0],
    },
  ],
  margin: [0, 12, 0, 7],
})

const sidebarSectionHeader = (text: string): Content => ({
  text: text.toUpperCase(),
  style: 'sidebarSectionTitle',
  margin: [0, 12, 0, 5],
})

function descriptionContent(description?: string | null): Content[] {
  const bullets = normalizeBullets(description)
  if (!bullets.length) return []
  return [{
    ul: bullets.map(text => ({ text, fontSize: 9, lineHeight: 1.25, color: '#334155' })),
    margin: [0, 2, 0, 6],
  }]
}

export function buildProfessionalPdf(
  data: CvExportData,
  options: PdfTemplateOptions,
): TDocumentDefinitions {
  const { personal } = data
  const sidebarWidth = options.paperSize === 'a4' ? 180 : 185
  // Sidebar panel and main-column headings both follow the accent; the default
  // is the slate this template was drawn in. Mirrors TwoColumnTemplate.vue.
  const accent = options.accentColor || TEMPLATE_ACCENT_DEFAULTS.professional

  const sidebarStack: Content[] = []

  const fullName = `${personal.firstName} ${personal.lastName}`.trim()
  if (fullName) {
    sidebarStack.push({
      text: fullName.toUpperCase(),
      style: 'sidebarName',
    })
  }

  const jobTitle = (personal.title || data.title || '').trim()
  if (jobTitle) {
    sidebarStack.push({
      text: jobTitle.toUpperCase(),
      style: 'sidebarTitle',
    })
  }

  if (fullName || jobTitle) {
    sidebarStack.push({
      canvas: [{
        type: 'line',
        x1: 0,
        y1: 1,
        x2: sidebarWidth - 36,
        y2: 1,
        lineWidth: 0.5,
        lineColor: '#4A5568',
      }],
      margin: [0, 8, 0, 4],
    })
  }

  const contactLines: Content[] = []
  if (personal.email) {
    contactLines.push({
      text: personal.email,
      ...(options.includeLinks ? { link: `mailto:${personal.email}` } : {}),
      color: options.includeLinks ? '#93C5FD' : '#E2E8F0',
      fontSize: 8.5,
      margin: [0, 0, 0, 3],
    })
  }
  if (personal.phone) {
    contactLines.push({ text: personal.phone, color: '#E2E8F0', fontSize: 8.5, margin: [0, 0, 0, 3] })
  }
  if (personal.location) {
    contactLines.push({ text: personal.location, color: '#CBD5E1', fontSize: 8.5, margin: [0, 0, 0, 3] })
  }

  if (personal.linkedinUrl) {
    contactLines.push({ text: personal.linkedinUrl.replace(/^https?:\/\//, ''), color: '#E2E8F0', fontSize: 8.5, margin: [0, 0, 0, 3], link: personal.linkedinUrl })
  }
  if (personal.githubUrl) {
    contactLines.push({ text: personal.githubUrl.replace(/^https?:\/\//, ''), color: '#E2E8F0', fontSize: 8.5, margin: [0, 0, 0, 3], link: personal.githubUrl })
  }
  if (personal.twitterUrl) {
    contactLines.push({ text: personal.twitterUrl.replace(/^https?:\/\//, ''), color: '#E2E8F0', fontSize: 8.5, margin: [0, 0, 0, 3], link: personal.twitterUrl })
  }
  if (personal.website) {
    contactLines.push({
      text: personal.website.replace(/^https?:\/\//, ''),
      ...(options.includeLinks ? { link: toUrl(personal.website) } : {}),
      color: options.includeLinks ? '#93C5FD' : '#E2E8F0',
      fontSize: 8.5,
      margin: [0, 0, 0, 3],
    })
  }
  if (personal.linkedin) {
    contactLines.push({
      text: personal.linkedin.replace(/^https?:\/\//, ''),
      ...(options.includeLinks ? { link: toUrl(personal.linkedin) } : {}),
      color: options.includeLinks ? '#93C5FD' : '#E2E8F0',
      fontSize: 8.5,
      margin: [0, 0, 0, 3],
    })
  }
  if (personal.github) {
    contactLines.push({
      text: personal.github.replace(/^https?:\/\//, ''),
      ...(options.includeLinks ? { link: toUrl(personal.github) } : {}),
      color: options.includeLinks ? '#93C5FD' : '#E2E8F0',
      fontSize: 8.5,
      margin: [0, 0, 0, 3],
    })
  }
        
  if (contactLines.length > 0) {
    sidebarStack.push(sidebarSectionHeader('Contact'))
    sidebarStack.push(...contactLines)
  }

  if (data.skills && data.skills.length > 0) {
    sidebarStack.push(sidebarSectionHeader('Skills'))
    data.skills.forEach((skill) => {
      sidebarStack.push({
        text: skill.level ? `${skill.name} (${skill.level})` : skill.name,
        style: 'sidebarSkill',
      })
    })
  }

  const educations = data.educations || data.education || []
  if (educations.length > 0) {
    sidebarStack.push(sidebarSectionHeader('Education'))
    educations.forEach((edu) => {
      const dates = formatDateRange(edu.startDate || edu.start_date, edu.endDate || edu.end_date)
      sidebarStack.push({
        stack: [
          { text: edu.school || edu.institution, style: 'sidebarEduSchool' },
          { text: [edu.degree, edu.fieldOfStudy || edu.field_of_study].filter(Boolean).join(', '), style: 'sidebarEduDegree' },
          ...(dates ? [{ text: dates, style: 'sidebarEduDate' }] : []),
        ],
        margin: [0, 0, 0, 6],
        unbreakable: true,
      })
    })
  }

  if (data.languages && data.languages.length > 0) {
    sidebarStack.push(sidebarSectionHeader('Languages'))
    data.languages.forEach((lang) => {
      sidebarStack.push({
        columns: [
          { text: lang.name, style: 'sidebarLangName', width: '*' },
          ...(lang.proficiency ? [{ text: lang.proficiency, style: 'sidebarLangProf', width: 'auto' }] : []),
        ],
        margin: [0, 0, 0, 2],
      })
    })
  }

  const mainStack: Content[] = []

  const summaryText = (data.summary || data.professional_summary || '').trim()
  if (summaryText) {
    mainStack.push(mainSectionHeader('Professional Summary'))
    mainStack.push({ text: summaryText, style: 'mainBody' })
  }

  const experiences = data.experiences || data.experience || []
  if (experiences.length > 0) {
    mainStack.push(mainSectionHeader('Professional Experience'))
    experiences.forEach((exp) => {
      const dates = formatDateRange(exp.startDate || exp.start_date, exp.endDate || exp.end_date)
      const companyLine = [exp.company, exp.location].filter(Boolean).join(' · ')

      const entryStack: Content[] = [
        {
          columns: [
            { text: exp.role || exp.title, style: 'mainItemTitle', width: '*' },
            { text: dates, style: 'mainDate', width: 'auto' },
          ],
        },
        ...(companyLine ? [{ text: companyLine, style: 'mainMeta', margin: [0, 1, 0, 3] as [number, number, number, number] }] : []),
        ...descriptionContent(exp.description),
      ]

      mainStack.push({ stack: entryStack, margin: [0, 0, 0, 7], unbreakable: true })
    })
  }

  if (data.certifications && data.certifications.length > 0) {
    mainStack.push(mainSectionHeader('Certifications'))
    data.certifications.forEach((cert) => {
      const certStack: Content[] = [
        {
          columns: [
            { text: cert.name, style: 'mainItemTitle', width: '*' },
            ...(cert.date || cert.issue_date ? [{ text: cert.date || cert.issue_date, style: 'mainDate', width: 'auto' }] : []),
          ],
        },
        { text: cert.issuer, style: 'mainMeta', margin: [0, 1, 0, 2] },
      ]
      if (cert.credentialUrl) {
        certStack.push({
          text: 'View credential',
          ...(options.includeLinks ? { link: toUrl(cert.credentialUrl) } : {}),
          color: options.includeLinks ? '#2563EB' : '#4B5563',
          fontSize: 8.5,
        })
      }
      mainStack.push({ stack: certStack, margin: [0, 0, 0, 6], unbreakable: true })
    })
  }

  if (data.awards && data.awards.length > 0) {
    mainStack.push(mainSectionHeader('Awards'))
    data.awards.forEach((award) => {
      const awardStack: Content[] = [
        {
          columns: [
            { text: award.name, style: 'mainItemTitle', width: '*' },
            ...(award.date ? [{ text: award.date, style: 'mainDate', width: 'auto' }] : []),
          ],
        },
        ...(award.issuer ? [{ text: award.issuer, style: 'mainMeta', margin: [0, 1, 0, 2] as [number, number, number, number] }] : []),
        ...(award.description ? [{ text: award.description, style: 'mainBody', margin: [0, 2, 0, 0] as [number, number, number, number] }] : []),
      ]
      mainStack.push({ stack: awardStack, margin: [0, 0, 0, 6], unbreakable: true })
    })
  }

  if (data.additional_information && data.additional_information.length > 0) {
    mainStack.push(mainSectionHeader('Additional Information'))
    data.additional_information.forEach((info) => {
      mainStack.push({
        stack: [
          { text: info.title, style: 'mainItemTitle' },
          { text: info.content, style: 'mainBody', margin: [0, 1, 0, 0] },
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
      keywords: 'CV, resume, ATS, two-column',
    },
    pageSize: options.paperSize === 'a4' ? 'A4' : 'LETTER',
    pageOrientation: 'portrait',
    pageMargins: [0, 20, 20, 20],
    background: (_currentPage: number, pageSize: { width: number, height: number }) => ({
      canvas: [
        {
          type: 'rect',
          x: 0,
          y: 0,
          w: sidebarWidth,
          h: pageSize.height,
          color: accent,
        },
      ],
    }),
    content: [
      {
        columns: [
          {
            width: sidebarWidth,
            stack: sidebarStack,
            margin: [16, 4, 16, 12],
          },
          {
            width: '*',
            stack: mainStack,
            margin: [16, 4, 6, 12],
          },
        ],
        columnGap: 0,
      },
    ],
    defaultStyle: {
      font: 'Roboto',
      color: '#1F2937',
    },
    styles: {
      sidebarName: {
        fontSize: 16,
        bold: true,
        color: '#FFFFFF',
        characterSpacing: 0.8,
        margin: [0, 4, 0, 2],
      },
      sidebarTitle: {
        fontSize: 8.5,
        bold: true,
        color: '#A0AEC0',
        characterSpacing: 1.2,
        margin: [0, 0, 0, 4],
      },
      sidebarSectionTitle: {
        fontSize: 8,
        bold: true,
        color: '#A0AEC0',
        characterSpacing: 1.5,
      },
      sidebarSkill: {
        fontSize: 8.5,
        color: '#E2E8F0',
        margin: [0, 0, 0, 2.5],
      },
      sidebarEduSchool: {
        fontSize: 9,
        bold: true,
        color: '#FFFFFF',
      },
      sidebarEduDegree: {
        fontSize: 8,
        color: '#CBD5E1',
      },
      sidebarEduDate: {
        fontSize: 7.5,
        color: '#94A3B8',
      },
      sidebarLangName: {
        fontSize: 8.5,
        color: '#E2E8F0',
      },
      sidebarLangProf: {
        fontSize: 7.5,
        color: '#94A3B8',
        alignment: 'right',
      },
      mainSectionTitle: {
        fontSize: 9,
        bold: true,
        color: accent,
        characterSpacing: 1.4,
      },
      mainItemTitle: {
        fontSize: 10,
        bold: true,
        color: '#111827',
      },
      mainMeta: {
        fontSize: 8.5,
        italics: true,
        color: '#64748B',
      },
      mainDate: {
        fontSize: 8.5,
        color: '#64748B',
        alignment: 'right',
      },
      mainBody: {
        fontSize: 9,
        lineHeight: 1.35,
        color: '#334155',
      },
      mainDescription: {
        fontSize: 8.5,
        lineHeight: 1.35,
        color: '#334155',
      },
    },
  }
}
