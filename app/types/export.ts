export type ExportFormat = 'pdf' | 'txt'
export type PaperSize = 'a4' | 'letter'

export interface ExportPayload {
  format: ExportFormat
  paperSize: PaperSize
  filename: string
  includeLinks?: boolean
  includeHyperlinks?: boolean
  embedAtsTags?: boolean
}
