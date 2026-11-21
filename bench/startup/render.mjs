// Render the results of bench.mjs and inspect.mjs as the Markdown of the comment on the pull
// request. It reads only numbers, and ids and names that it knows, from the JSON, so the comment is
// built here, not taken from the JSON.
//
//   node bench/startup/render.mjs --timing timing.json [--inspect inspect.json] [--base <sha>]
//     [--head <sha>] [--run-url <url>]
import { readFileSync } from 'node:fs'
import { parseArgs } from 'node:util'
import { CASES } from './cases.mjs'

const { values } = parseArgs({
  options: {
    timing: { type: 'string' },
    inspect: { type: 'string' },
    base: { type: 'string', default: '' },
    head: { type: 'string', default: '' },
    'run-url': { type: 'string', default: '' }
  }
})
const MARKER = '<!-- gunshi-startup-benchmark -->'
const timing = JSON.parse(readFileSync(values.timing, 'utf8'))
const inspect = values.inspect ? JSON.parse(readFileSync(values.inspect, 'utf8')) : undefined
const num = x => (typeof x === 'number' && Number.isFinite(x) ? x : NaN)
const ms = x => num(x).toFixed(1)
// rounded first, so that a change that rounds to 0 shows as +0.0, not −0.0
const signed = x => {
  const v = Math.round(num(x) * 10) / 10
  return `${v < 0 ? '−' : '+'}${Math.abs(v).toFixed(1)}`
}
const sha = s =>
  typeof s === 'string' && /^[0-9a-f]{7,40}$/.test(s) ? ` \`${s.slice(0, 8)}\`` : ''
const label = id => CASES.find(c => c.id === id)?.label ?? 'unknown'
const tableRow = cells => `| ${cells.join(' | ')} |`
const m = timing.meta
const threshold = num(m.threshold)

function verdict(row) {
  if (!row.confirmed) return ''
  return row.cpu.delta > 0 ? '🔴 slower' : '🟢 faster'
}

const lines = [MARKER, '## Startup benchmark', '']
const version = String(m.version).replace(/[^\w.-]/g, '')
const runtime = `${m.runtime === 'bun' ? 'Bun' : 'Node.js'} ${version}`
const shas = `base${sha(values.base || m.sha?.base)} → head${sha(values.head || m.sha?.head)}`
lines.push(`${shas} · ${runtime} · ${num(m.cpus)} CPUs`, '')
const rows = timing.cases.map(r => ({ ...r, v: verdict(r) }))
const changed = rows.filter(r => r.v)
const changes = changed.map(r => `${label(r.id)} ${signed(r.cpu.delta)} ms`).join(', ')
lines.push(
  changed.length === 0
    ? `**No case changed by ${threshold} ms or more.**`
    : `**${changed.length} case(s) changed by ${threshold} ms or more:** ${changes}.`,
  ''
)
lines.push('| Case | base | head | Change (99% interval) | |', '| --- | ---: | ---: | ---: | --- |')
for (const r of rows) {
  const [lo, hi] = r.cpu.interval
  const bold = r.v ? '**' : ''
  const change = `${bold}${signed(r.cpu.delta)}${bold} (${signed(lo)} to ${signed(hi)})`
  lines.push(tableRow([label(r.id), ms(r.cpu.base.over), ms(r.cpu.head.over), change, r.v]))
}
const rerun = rows.some(r => r.first)
lines.push(
  '',
  'The CPU time of the process, in milliseconds over Node.js alone (an empty script, ' +
    `${ms(m.baseline.cpu)} ms), the median of ${num(m.runs)} runs of each case, base and head in ` +
    'turns. The change is the median of the differences head − base within a round. A case is ' +
    `marked when it changed by ${threshold} ms or more with an interval that leaves out 0, ` +
    `and did so again in ${num(m.confirmRuns)} more runs.` +
    (rerun ? ' The rows of the cases that were run again show those runs.' : ''),
  ''
)
const unconfirmed = rows.filter(r => r.first && !r.confirmed)
if (unconfirmed.length > 0) {
  const firsts = unconfirmed
    .map(r => `${label(r.id)} (${signed(r.first.cpu.delta)} ms at first)`)
    .join(', ')
  lines.push(`Not confirmed in the second runs: ${firsts}.`, '')
}

lines.push(
  '<details>',
  '<summary>Wall time</summary>',
  '',
  '| Case | base | head | Change (99% interval) |',
  '| --- | ---: | ---: | ---: |'
)
for (const r of rows) {
  const [lo, hi] = r.wall.interval
  const change = `${signed(r.wall.delta)} (${signed(lo)} to ${signed(hi)})`
  lines.push(tableRow([label(r.id), ms(r.wall.base.over), ms(r.wall.head.over), change]))
}
lines.push(
  '',
  `Milliseconds over Node.js alone (${ms(m.baseline.wall)} ms). The wall time also counts the ` +
    'waits for a CPU, so it moves more than the CPU time on a busy machine.',
  '',
  '</details>',
  ''
)

if (inspect) {
  const kib = b => `${(num(b) / 1024).toFixed(1)} KiB`
  const pkgNames = s => Object.keys(s.packages).filter(name => /^[a-z0-9-]+$/.test(name))
  const bytes = s =>
    pkgNames(s).reduce((n, name) => n + num(s.packages[name].bytes), 0) + num(s.deps.bytes)
  // what a case loads and uses, without the sizes: a change here is a change of the structure
  const shape = s => {
    const parts = [
      pkgNames(s)
        .map(name => `${name} ${num(s.packages[name].files)}`)
        .join(', ')
    ]
    if (s.deps.files > 0) parts.push(`dependencies ${num(s.deps.files)}`)
    const builtins = s.builtins.filter(b => /^node:[a-z_/]+$/.test(b))
    if (builtins.length > 0) parts.push(builtins.map(b => `\`${b}\``).join(' '))
    const icu = Object.keys(s.icu).filter(k => /^[A-Za-z.#]+$/.test(k))
    parts.push(icu.length > 0 ? `ICU: ${icu.map(k => `\`${k}\``).join(' ')}` : 'no ICU')
    return parts.join('; ')
  }
  // the bytes of a case, and how much they changed from the other place
  const sized = (s, other) => {
    const d = other ? bytes(s) - bytes(other) : 0
    return `${kib(bytes(s))}${Math.abs(d) >= 1 ? ` (${d < 0 ? '−' : '+'}${kib(Math.abs(d))})` : ''}`
  }
  const differs = inspect.cases.filter(r => shape(r.base) !== shape(r.head))
  const grown = inspect.cases.filter(r => Math.abs(bytes(r.head) - bytes(r.base)) >= 1024)
  const summary = [
    differs.length === 0
      ? 'the same files and ICU in base and head'
      : `${differs.length} case(s) load other files or use ICU differently`,
    grown.length === 0 ? '' : `${grown.length} case(s) load 1 KiB or more in a different size`
  ].filter(Boolean)
  lines.push(
    '<details>',
    `<summary>What each case loads: ${summary.join('; ')}</summary>`,
    '',
    '| Case | base | head |',
    '| --- | --- | --- |'
  )
  for (const r of inspect.cases) {
    const [b, h] = [shape(r.base), shape(r.head)]
    const head = `${b === h ? 'the same files' : `**${h}**`}, ${sized(r.head, r.base)}`
    lines.push(tableRow([label(r.id), `${b}, ${sized(r.base)}`, head]))
  }
  lines.push(
    '',
    'The number of the files of each package of gunshi and of the other dependencies, the ' +
      'built-in modules that it imports, the ICU services that it uses, and the bytes of the ' +
      'files. These do not depend on the machine.',
    '',
    '</details>',
    ''
  )
}
const runUrlPattern = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/actions\/runs\/\d+$/
const runUrl = runUrlPattern.test(values['run-url']) ? values['run-url'] : ''
const cpu = m.cpu ? `${String(m.cpu).replace(/[^\w .()@-]/g, '')} · ` : ''
lines.push(`<sub>${cpu}${num(m.seconds)} s${runUrl ? ` · [the run](${runUrl})` : ''}</sub>`)
console.log(lines.join('\n'))
