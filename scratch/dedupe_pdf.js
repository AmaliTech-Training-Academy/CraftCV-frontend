import fs from 'fs'

const files = [
  'app/utils/pdf/templates/classic.ts',
  'app/utils/pdf/templates/modern.ts',
  'app/utils/pdf/templates/professional.ts',
]

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8')
  
  if (file.includes('classic.ts')) {
    content = content.replace(/if\s*\(personal\.linkedin\)\s*contactItems\.push\(\{\s*text:\s*personal\.linkedin\.replace.*\}\)\n/g, '')
    content = content.replace(/if\s*\(personal\.github\)\s*contactItems\.push\(\{\s*text:\s*personal\.github\.replace.*\}\)\n/g, '')
    content = content.replace(/if\s*\(personal\.twitter\)\s*contactItems\.push\(\{\s*text:\s*personal\.twitter\.replace.*\}\)\n/g, '')
    content = content.replace(/if\s*\(personal\.website\)\s*contactItems\.push\(\{\s*text:\s*personal\.website\.replace.*\}\)\n/g, '')
  } else {
    // modern and professional have `contactLines.push({ text: ... })`
    // but the develop version looks like:
    // if (personal.linkedin) {
    //   contactLines.push({
    //     text: personal.linkedin.replace(/^https?:\/\//, ''),
    //     ...(options.includeLinks ? { link: toUrl(personal.linkedin) } : {}),
    // ...
    // So the crf-98 version was a single-line push:
    content = content.replace(/if\s*\(personal\.linkedin\)\s*\{\n\s*contactLines\.push\(\{ text: personal\.linkedin\.replace[^}]*\}\)\n\s*\}\n/g, '')
    content = content.replace(/if\s*\(personal\.github\)\s*\{\n\s*contactLines\.push\(\{ text: personal\.github\.replace[^}]*\}\)\n\s*\}\n/g, '')
    content = content.replace(/if\s*\(personal\.twitter\)\s*\{\n\s*contactLines\.push\(\{ text: personal\.twitter\.replace[^}]*\}\)\n\s*\}\n/g, '')
    content = content.replace(/if\s*\(personal\.website\)\s*\{\n\s*contactLines\.push\(\{ text: personal\.website\.replace[^}]*\}\)\n\s*\}\n/g, '')
  }
  
  fs.writeFileSync(file, content)
}
console.log("PDF deduped!")
