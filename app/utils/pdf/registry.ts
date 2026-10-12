import type { TDocumentDefinitions } from 'pdfmake/build/pdfmake'
import type { CvExportData } from './exportData'
import { buildClassicPdf, type PdfTemplateOptions } from './templates/classic'
import { buildModernPdf } from './templates/modern'
import { buildProfessionalPdf } from './templates/professional'
import { buildInkwellPdf } from './templates/inkwell'
import { buildPrismPdf } from './templates/prism'
import { buildCampusPdf } from './templates/campus'
import { buildSproutPdf } from './templates/sprout'
import { buildNorthstarPdf } from './templates/northstar'
import { buildMeridianPdf } from './templates/meridian'

export type PdfRenderer = (data: CvExportData, options: PdfTemplateOptions) => TDocumentDefinitions

export const PDF_RENDERERS: Record<string, PdfRenderer> = {
  classic: buildClassicPdf,
  modern: buildModernPdf,
  professional: buildProfessionalPdf,
  inkwell: buildInkwellPdf,
  prism: buildPrismPdf,
  campus: buildCampusPdf,
  sprout: buildSproutPdf,
  northstar: buildNorthstarPdf,
  meridian: buildMeridianPdf,
}

export function getRenderer(slug?: string | null): PdfRenderer {
  const normalized = (slug || '').trim().toLowerCase()
  return PDF_RENDERERS[normalized] ?? buildClassicPdf
}
