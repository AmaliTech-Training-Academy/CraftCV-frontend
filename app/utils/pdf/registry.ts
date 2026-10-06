import type { TDocumentDefinitions } from 'pdfmake/build/pdfmake'
import type { CvExportData } from './exportData'
import { buildClassicPdf, type PdfTemplateOptions } from './templates/classic'
import { buildModernPdf } from './templates/modern'
import { buildProfessionalPdf } from './templates/professional'

export type PdfRenderer = (data: CvExportData, options: PdfTemplateOptions) => TDocumentDefinitions

export const PDF_RENDERERS: Record<string, PdfRenderer> = {
  classic: buildClassicPdf,
  modern: buildModernPdf,
  professional: buildProfessionalPdf,
}

export function getRenderer(slug?: string | null): PdfRenderer {
  const normalized = (slug || '').trim().toLowerCase()
  return PDF_RENDERERS[normalized] ?? buildClassicPdf
}
