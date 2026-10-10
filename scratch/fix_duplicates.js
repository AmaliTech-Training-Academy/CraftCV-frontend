import fs from 'fs'
const files = [
  'app/composables/useCVState.ts',
  'app/components/templates/SingleColumnTemplate.vue',
  'app/components/templates/TwoColumnTemplate.vue',
]
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8')
  
  if (file.includes('useCVState.ts')) {
    // Remove duplicate `website` lines in interface and object literals
    // e.g. "website: string\n  website: string"
    content = content.replace(/website: string\n\s*website: string/g, 'website: string')
    content = content.replace(/website: '',\n\s*website: '',/g, "website: '',")
    content = content.replace(/website: p\.website\?\.trim\(\) \|\| p\.website\?\.trim\(\) \|\| 'www\.yourwebsite\.com',\n/g, "")
  }
  
  if (file.includes('Template.vue')) {
    // In Vue templates, there might be duplicate pushes:
    // if (p.value.website) items.push(...)
    // if (p.value.website) items.push(...)
    content = content.replace(/if\s*\(p\.value\.website\)\s*items\.push\(\{[\s\S]*?\}\)\n\s*if\s*\(p\.value\.website\)\s*items\.push\(\{[\s\S]*?\}\)\n/g, "  if (p.value.website) items.push({ icon: 'web', value: p.value.website.replace(/^https?:\\/\\//, ''), link: p.value.website })\n")
    
    // Also deduplicate linkedin, github, twitter if they got duplicated when I removed the Url suffix
    content = content.replace(/if\s*\(p\.value\.linkedin\)\s*items\.push\(\{[\s\S]*?\}\)\n\s*if\s*\(p\.value\.linkedin\)\s*items\.push\(\{[\s\S]*?\}\)\n/g, "  if (p.value.linkedin) items.push({ icon: 'linkedin', value: p.value.linkedin.replace(/^https?:\\/\\//, ''), link: p.value.linkedin })\n")
    
  }

  fs.writeFileSync(file, content)
}
console.log("Fixed duplicates!")
