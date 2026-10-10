import fs from 'fs'

const files = [
  'app/components/templates/SingleColumnTemplate.vue',
  'app/components/templates/TwoColumnTemplate.vue',
  'app/composables/useCVState.ts',
  'app/utils/pdf/templates/classic.ts',
  'app/utils/pdf/templates/modern.ts',
  'app/utils/pdf/templates/professional.ts',
]

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8')
  
  // Remove any remaining conflict markers just in case
  content = content.replace(/<<<<<<< HEAD[\s\S]*?=======\n/g, '')
  content = content.replace(/>>>>>>> develop\n?/g, '')

  // In the PDF templates, there's a duplicate block for github, linkedin, twitter, website
  // Let's first remove the block that uses *Url
  if (file.includes('pdf/templates')) {
    content = content.replace(/if\s*\(personal\.linkedinUrl\)[\s\S]*?(?=if\s*\(personal\.website\)|if\s*\(personal\.linkedin\))/g, '')
    // Also remove websiteUrl block if it exists
    content = content.replace(/if\s*\(personal\.websiteUrl\)[\s\S]*?(?=if\s*\(personal\.linkedin\))/g, '')
  }

  // Replace *Url with * in all files
  content = content.replace(/linkedinUrl/g, 'linkedin')
  content = content.replace(/githubUrl/g, 'github')
  content = content.replace(/twitterUrl/g, 'twitter')
  content = content.replace(/websiteUrl/g, 'website')
  
  // Dedup website and linkedin in Vue templates (if there are duplicate objects pushed to contactItems)
  // Actually, replacing *Url with * might result in duplicate pushes in useCVState or templates if they were spliced.
  
  fs.writeFileSync(file, content)
}
console.log("Fixed files!")
