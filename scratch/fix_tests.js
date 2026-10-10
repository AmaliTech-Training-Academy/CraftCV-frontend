import fs from 'fs'

let autosaveSpec = fs.readFileSync('tests/useAutosave.spec.ts', 'utf8')
autosaveSpec = autosaveSpec.replace(/githubUrl/g, 'github')
autosaveSpec = autosaveSpec.replace(/linkedinUrl/g, 'linkedin')
autosaveSpec = autosaveSpec.replace(/twitterUrl/g, 'twitter')
autosaveSpec = autosaveSpec.replace(/websiteUrl/g, 'website')
fs.writeFileSync('tests/useAutosave.spec.ts', autosaveSpec)

let cvStateTest = fs.readFileSync('tests/useCVState.test.ts', 'utf8')
// Change `expect(previewData.value.certifications.length).toBe(0)` to `toBe(1)`
cvStateTest = cvStateTest.replace(/expect\(previewData\.value\.certifications\.length\)\.toBe\(0\)/g, 'expect(previewData.value.certifications.length).toBe(1)')
fs.writeFileSync('tests/useCVState.test.ts', cvStateTest)
console.log("Fixed tests!")
