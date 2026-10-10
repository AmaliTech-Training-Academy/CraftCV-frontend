const fs = require('fs')
const file = 'app/composables/useCVState.ts'
let content = fs.readFileSync(file, 'utf8')

const regex = /<<<<<<< HEAD\n[\s\S]*?=======\n([\s\S]*?)>>>>>>> develop\n?/g
content = content.replace(regex, (match, developContent) => {
  return developContent
})

fs.writeFileSync(file, content)
