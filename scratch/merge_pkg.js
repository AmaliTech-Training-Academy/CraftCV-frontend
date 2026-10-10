import fs from 'fs'

let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
pkg.dependencies["@vueuse/integrations"] = "^15.0.0"
pkg.dependencies["sortablejs"] = "^1.15.7"
pkg.devDependencies["@types/sortablejs"] = "^1.15.9"

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2))
console.log("Merged package.json")
