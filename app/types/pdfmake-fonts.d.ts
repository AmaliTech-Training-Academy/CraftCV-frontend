declare module 'pdfmake/build/vfs_fonts' {
  const pdfMake: {
    vfs: Record<string, string>
  }
  export default pdfMake
}

declare module 'pdfmake/build/pdfmake' {
  export * from 'pdfmake'
  export type Column = import('pdfmake/interfaces').Column
  export type TDocumentDefinitions = Parameters<typeof import('pdfmake').createPdf>[0]
}

declare module 'pdfmake/build/standard-fonts/Times' {
  const font: unknown
  export default font
}

declare module 'pdfmake/build/standard-fonts/Helvetica' {
  const font: unknown
  export default font
}

declare module 'pdfmake/build/standard-fonts/Courier' {
  const font: unknown
  export default font
}

declare module 'pdfmake/build/standard-fonts/*' {
  const font: unknown
  export default font
}
