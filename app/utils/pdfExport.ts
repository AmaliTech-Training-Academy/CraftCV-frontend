import type { TDocumentDefinitions } from 'pdfmake/build/pdfmake'
import { toExportData } from './pdf/exportData'
import { getRenderer } from './pdf/registry'
import { sanitizeExportData, isRealText } from './pdf/sanitizeExportData'

export { sanitizeExportData, isRealText }

export interface ExportPdfOptions {
  cvData: unknown
  filename: string
  paperSize: 'a4' | 'letter'
  includeLinks?: boolean
  templateId?: string
  templateSlug?: string
  accentColor?: string
}

type PdfMake = typeof import('pdfmake/build/pdfmake')

let pdfMakePromise: Promise<PdfMake> | undefined

async function getPdfMake(): Promise<PdfMake> {
  if (!pdfMakePromise) {
    pdfMakePromise = (import('pdfmake/build/pdfmake') as Promise<unknown>).then(async (module) => {
      const pdfMake = (module as { default?: unknown }).default ?? module
      const typedPdfMake = pdfMake as {
        addVirtualFileSystem?: (vfs: unknown) => void
        vfs?: Record<string, string>
        createPdf: (docDefinition: TDocumentDefinitions) => {
          download: (filename: string) => void
          print: () => void
        }
      }
      const vfsFonts = await import('pdfmake/build/vfs_fonts')
      const vfs = (vfsFonts.default ?? vfsFonts) as { pdfMake?: { vfs: Record<string, string> } }
      if (typedPdfMake.addVirtualFileSystem && vfs.pdfMake?.vfs) {
        typedPdfMake.addVirtualFileSystem(vfs.pdfMake.vfs)
      }
      else if (vfs.pdfMake?.vfs) {
        typedPdfMake.vfs = vfs.pdfMake.vfs
      }
      return typedPdfMake as unknown as PdfMake
    })
  }
  return pdfMakePromise
}

export async function preloadPdfMake(): Promise<void> {
  if (typeof window === 'undefined') return
  await getPdfMake()
}

export function buildDocumentDefinition(options: ExportPdfOptions): TDocumentDefinitions {
  const data = toExportData(options.cvData)
  const slug = options.templateSlug || options.templateId
  const renderer = getRenderer(slug)

  return renderer(data, {
    paperSize: options.paperSize,
    includeLinks: options.includeLinks !== false,
    accentColor: options.accentColor,
  })
}

export async function generatePDF(options: ExportPdfOptions): Promise<void> {
  if (typeof window === 'undefined') return

  const pdfMake = await getPdfMake()
  const documentDefinition = buildDocumentDefinition(options)
  pdfMake.createPdf(documentDefinition).download(options.filename)
}

export function generatePlainText(cvData: unknown, filename: string): void {
  if (typeof window === 'undefined') return

  const data = toExportData(cvData)
  const lines: string[] = []

  const personal = data.personal
  const firstName = personal.firstName
  const lastName = personal.lastName
  const title = personal.title || data.title

  if (firstName || lastName) {
    lines.push(`${firstName} ${lastName}`.toUpperCase())
  }
  if (title) {
    lines.push(title)
  }

  const contactParts = [
    personal.email,
    personal.phone,
    personal.location,
    personal.website,
    personal.linkedin,
    personal.github,
  ].filter(Boolean)

  if (contactParts.length > 0) {
    lines.push(contactParts.join(' | '))
  }

  if (firstName || lastName || title || contactParts.length > 0) {
    lines.push('\n' + '='.repeat(40) + '\n')
  }

  const summaryText = data.summary
  if (summaryText) {
    lines.push('PROFESSIONAL SUMMARY')
    lines.push('-'.repeat(20))
    lines.push(summaryText + '\n')
  }

  if (data.experience.length > 0) {
    lines.push('WORK EXPERIENCE')
    lines.push('-'.repeat(20))
    data.experience.forEach((exp) => {
      const roleTitle = exp.title
      const company = exp.company
      const dates = [exp.startDate, exp.endDate].filter(Boolean).join(' - ')
      const loc = exp.location
      const desc = exp.description

      if (roleTitle || company) {
        lines.push(`${roleTitle}${company ? ` at ${company}` : ''}`)
      }
      if (dates || loc) {
        lines.push([dates, loc].filter(Boolean).join(' | '))
      }
      if (desc) {
        lines.push(desc)
      }
      lines.push('')
    })
  }

  if (data.education.length > 0) {
    lines.push('EDUCATION')
    lines.push('-'.repeat(20))
    data.education.forEach((edu) => {
      const degree = edu.degree
      const school = edu.school
      const dates = [edu.startDate, edu.endDate].filter(Boolean).join(' - ')
      const desc = edu.description

      if (degree || school) {
        lines.push(`${degree}${school ? `, ${school}` : ''}`)
      }
      if (dates) {
        lines.push(dates)
      }
      if (desc) {
        lines.push(desc)
      }
      lines.push('')
    })
  }

  if (data.skills.length > 0) {
    lines.push('SKILLS')
    lines.push('-'.repeat(20))
    const skillNames = data.skills.map(skill => skill.level ? `${skill.name} (${skill.level})` : skill.name).filter(Boolean)
    lines.push(skillNames.join(', ') + '\n')
  }

  if (data.certifications.length > 0) {
    lines.push('CERTIFICATIONS')
    lines.push('-'.repeat(20))
    data.certifications.forEach((certification) => {
      lines.push([certification.name, certification.issuer, certification.date].filter(Boolean).join(' | '))
      if (certification.credentialUrl) lines.push(certification.credentialUrl)
    })
  }

  if (data.languages && data.languages.length > 0) {
    lines.push('LANGUAGES')
    lines.push('-'.repeat(20))
    data.languages.forEach((lang) => {
      lines.push([lang.name, lang.proficiency].filter(Boolean).join(' - '))
    })
    lines.push('')
  }

  if (data.awards && data.awards.length > 0) {
    lines.push('AWARDS')
    lines.push('-'.repeat(20))
    data.awards.forEach((award) => {
      lines.push([award.name, award.issuer, award.date].filter(Boolean).join(' | '))
      if (award.description) lines.push(award.description)
    })
    lines.push('')
  }

  if (data.additional_information && data.additional_information.length > 0) {
    lines.push('ADDITIONAL INFORMATION')
    lines.push('-'.repeat(20))
    data.additional_information.forEach((info) => {
      lines.push(info.title)
      lines.push(info.content)
    })
    lines.push('')
  }

  const content = lines.join('\n')
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.txt') ? filename : `${filename}.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function printPdf(options: ExportPdfOptions): Promise<void> {
  if (typeof window === 'undefined') return

  const pdfMake = await getPdfMake()
  const documentDefinition = buildDocumentDefinition(options)
  pdfMake.createPdf(documentDefinition).print()
}

export async function printDocument(target: HTMLElement | ExportPdfOptions): Promise<void> {
  if (typeof window === 'undefined' || !target) return

  if ('cvData' in target) {
    await printPdf(target)
    return
  }

  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'

  document.body.appendChild(iframe)

  const doc = iframe.contentWindow?.document
  if (!doc) return

  doc.open()
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print CV</title>
        <style>
          @page { margin: 0; size: auto; }
          body { margin: 0; font-family: system-ui, sans-serif; }
          img { max-width: 100%; }
        </style>
        ${Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
          .map(el => el.outerHTML)
          .join('\n')}
      </head>
      <body>
        ${target.outerHTML}
      </body>
    </html>
  `)
  doc.close()

  iframe.contentWindow?.focus()
  setTimeout(() => {
    iframe.contentWindow?.print()
    setTimeout(() => {
      document.body.removeChild(iframe)
    }, 1000)
  }, 500)
}
