import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const tsDir = path.join(__dirname, 'app/utils/pdf/templates')

function fix() {
  const files = fs.readdirSync(tsDir).filter(f => f.endsWith('.ts'))
  for (const file of files) {
    const filePath = path.join(tsDir, file)
    let content = fs.readFileSync(filePath, 'utf8')
    let original = content

    // Fix any
    content = content.replace(/: any/g, ': Record<string, unknown>')
    content = content.replace(/as any/g, 'as Record<string, unknown>')

    // Fix inkwell unused 'i'
    content = content.replace(/\(\(_, i\)/g, '((_')

    // Fix meridian unused sectionTitle
    content = content.replace(/const sectionTitle = \(text: string\) => \(\{\n\s*text,\n\s*style: 'sectionTitle',\n\s*margin: \[0, 16, 0, 8\]\n\s*\}\)\n\s*/g, '')
    // Meridian unused currentPage
    content = content.replace(/\(currentPage: number, pageCount: number\) =>/g, '() =>')

    // northstar unused idx
    content = content.replace(/data\.languages!\.forEach\(\(lang, idx\) =>/g, 'data.languages!.forEach((lang) =>')
    // northstar unused currentPage
    content = content.replace(/\(currentPage: number, pageCount: number\) =>/g, '() =>')
    content = content.replace(/\(currentPage: number\) =>/g, '() =>')

    // campus unused PAGE_WIDTH
    content = content.replace(/const PAGE_WIDTH = options\.paperSize === 'a4' \? 595\.28 : 612\n\s*/g, '')

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8')
    }
  }
}
fix()
