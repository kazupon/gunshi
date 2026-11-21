// Make a place to run the fixtures against a built checkout of gunshi: node_modules links to its
// packages, and a copy of fixtures/. The packages resolve their own dependencies from the checkout.
// A place that this script made before is made again; any other place must be new or empty.
//
//   node bench/startup/setup.mjs <checkout, built> <place>
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync
} from 'node:fs'
import path from 'node:path'

const [checkout, place] = process.argv.slice(2).map(p => path.resolve(p))
if (!checkout || !place) throw new Error('give a built checkout of gunshi and a place')
const PACKAGES = {
  gunshi: 'gunshi',
  '@gunshi/bone': 'bone',
  '@gunshi/plugin-completion': 'plugin-completion',
  '@gunshi/plugin-i18n': 'plugin-i18n',
  '@gunshi/resources': 'resources'
}
const MARK = '.startup-bench'
if (existsSync(place) && readdirSync(place).length > 0 && !existsSync(path.join(place, MARK))) {
  throw new Error(`${place} is not empty, and was not made by setup.mjs`)
}
rmSync(place, { recursive: true, force: true })
mkdirSync(path.join(place, 'node_modules', '@gunshi'), { recursive: true })
writeFileSync(path.join(place, MARK), '')
for (const [name, dir] of Object.entries(PACKAGES)) {
  symlinkSync(path.join(checkout, 'packages', dir), path.join(place, 'node_modules', name), 'dir')
}
cpSync(path.join(import.meta.dirname, 'fixtures'), place, { recursive: true })
console.log(`${place} -> ${checkout}`)
