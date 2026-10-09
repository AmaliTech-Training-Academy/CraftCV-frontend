import fs from 'fs'
import path from 'path'

const filesToWire = [
  'app/components/templates/SingleColumnTemplate.vue',
  'app/components/templates/TwoColumnTemplate.vue',
]

for (const file of filesToWire) {
  const filePath = path.resolve(file)
  let content = fs.readFileSync(filePath, 'utf8')

  // 1. Inject useCVState import
  if (!content.includes('useCVState')) {
    content = content.replace(
      'import { parseDescription } from \'~/utils/cvText\'',
      'import { parseDescription } from \'~/utils/cvText\'\nimport { useCVState } from \'~/composables/useCVState\'',
    )
  }

  // 2. Inject const { accentColor } = useCVState()
  if (!content.includes('const { accentColor } = useCVState()')) {
    content = content.replace(
      'const props = defineProps<{',
      'const { accentColor } = useCVState()\n\nconst props = defineProps<{',
    )
  }

  // 3. Replace static header colors with accentColor bindings
  // e.g. <h2 class="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-800 border-b border-gray-300 pb-1 mb-3">
  content = content.replace(
    /<h2 class="([^"]*) text-gray-800 border-b border-gray-300 ([^"]*)">/g,
    '<h2 class="$1 border-b $2" :style="{ color: accentColor, borderBottomColor: accentColor }">',
  )

  content = content.replace(
    /<h2 class="([^"]*) text-gray-800 border-b border-gray-300 pb-1 mb-4">/g,
    '<h2 class="$1 border-b pb-1 mb-4" :style="{ color: accentColor, borderBottomColor: accentColor }">',
  )

  fs.writeFileSync(filePath, content, 'utf8')
  console.log('Wired ' + file)
}
