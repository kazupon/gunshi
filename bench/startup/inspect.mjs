// Run each case once in each place with inspect-hook.mjs, and summarize what it loads (the files of
// the packages of gunshi, the files of the other dependencies, the built-in modules) and which ICU
// services it uses. These do not depend on the machine, so they compare exactly.
//
//   node bench/startup/inspect.mjs [--out inspect.json] [--tmp <dir>] base=<place> head=<place>
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { CASES } from './cases.mjs'

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { out: { type: 'string' }, tmp: { type: 'string' } }
})
const variants = Object.fromEntries(
  positionals.map(p => [p.slice(0, p.indexOf('=')), path.resolve(p.slice(p.indexOf('=') + 1))])
)
if (positionals.length !== 2 || !variants.base || !variants.head) {
  throw new Error('give the two places, as base=<place> head=<place>')
}
const tmp = values.tmp
  ? (mkdirSync(values.tmp, { recursive: true }), values.tmp)
  : mkdtempSync(path.join(os.tmpdir(), 'startup-bench-'))
const hook = path.join(import.meta.dirname, 'inspect-hook.mjs')

function summarize(data, fixture) {
  const packages = {}
  const deps = { files: 0, bytes: 0 }
  const builtins = new Set()
  for (const { url, bytes } of data.loads) {
    if (url.startsWith('node:')) {
      builtins.add(url)
      continue
    }
    if (!url.startsWith('file:')) continue
    const file = fileURLToPath(url)
    if (path.basename(file) === fixture) continue
    const m = file.match(/[/\\]packages[/\\]([^/\\]+)[/\\]/)
    if (m && !file.includes(`${path.sep}node_modules${path.sep}`)) {
      const p = (packages[m[1]] ??= { files: 0, bytes: 0 })
      p.files++
      p.bytes += bytes
    } else {
      deps.files++
      deps.bytes += bytes
    }
  }
  return { packages, deps, builtins: [...builtins].sort(), icu: data.icu }
}

const result = { variants, cases: [] }
for (const c of CASES) {
  const row = { id: c.id, label: c.label }
  for (const name of ['base', 'head']) {
    const place = variants[name]
    const file = path.join(tmp, `${name}-${c.id}.json`)
    const r = spawnSync(process.execPath, ['--import', hook, c.fixture, ...c.args], {
      cwd: place,
      stdio: ['ignore', 'ignore', 'pipe'],
      encoding: 'utf8',
      env: { ...process.env, NO_COLOR: '1', STARTUP_BENCH_INSPECT: file }
    })
    if (r.status !== 0) {
      throw new Error(
        `${c.fixture} ${c.args.join(' ')} in ${place} exited with ${r.status}\n${r.stderr}`
      )
    }
    row[name] = summarize(JSON.parse(readFileSync(file, 'utf8')), c.fixture)
  }
  result.cases.push(row)
}
const json = JSON.stringify(result, null, 2)
if (values.out) writeFileSync(values.out, json)
else console.log(json)
