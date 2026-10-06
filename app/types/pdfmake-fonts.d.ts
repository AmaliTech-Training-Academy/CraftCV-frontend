declare module 'pdfmake/build/vfs_fonts' {
  const pdfMake: {
    vfs: Record<string, string>
  }
  export default pdfMake
}

declare module 'pdfmake/build/pdfmake' {
  export * from 'pdfmake'
  export type TDocumentDefinitions = Parameters<typeof import('pdfmake').createPdf>[0]
}
