// Measure the startup of the fixtures in two places, base and head, each run a process of its own,
// in turns: every round runs each case in both places, base first on even rounds and head first on
// odd ones.
//
// Each run gives its wall time and the CPU time that the process reports when it exits
// (cpu-hook.mjs). The change of a case is the median of the differences head − base within a round
// (pairs cancel the drift of the machine), with a 99% interval by bootstrap (seeded). Two stages:
// every case is run `--runs` times; a case whose CPU time changed by `--threshold` ms or more, with
// an interval that leaves out 0, is run `--confirm` times more, and the change is taken from those
// runs only. Writes the samples and the statistics as JSON.
//
//   node bench/startup/bench.mjs [--runtime node|bun] [--runs 40] [--confirm 100] [--warmup 3]
//     [--threshold 0.5] [--only <id,...>] [--base-sha <sha>] [--head-sha <sha>] [--out timing.json]
//     base=<place> head=<place>
import { spawnSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { BASELINE, CASES } from './cases.mjs'

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    runtime: { type: 'string', default: 'node' },
    runs: { type: 'string', default: '40' },
    confirm: { type: 'string', default: '100' },
    warmup: { type: 'string', default: '3' },
    threshold: { type: 'string', default: '0.5' },
    only: { type: 'string' },
    'base-sha': { type: 'string', default: '' },
    'head-sha': { type: 'string', default: '' },
    out: { type: 'string' }
  }
})
const runtime = values.runtime === 'node' ? process.execPath : values.runtime
const [runs, confirmRuns, warmup, threshold] = [
  values.runs,
  values.confirm,
  values.warmup,
  values.threshold
].map(Number)
const variants = Object.fromEntries(
  positionals.map(p => [p.slice(0, p.indexOf('=')), path.resolve(p.slice(p.indexOf('=') + 1))])
)
// the change is head − base, so the places must be named
const names = ['base', 'head']
if (positionals.length !== 2 || names.some(name => !variants[name])) {
  throw new Error('give the two places, as base=<place> head=<place>')
}
const cases = values.only ? CASES.filter(c => values.only.split(',').includes(c.id)) : CASES
const cpuHook = path.join(import.meta.dirname, 'cpu-hook.mjs')
const preload = values.runtime === 'bun' ? '--preload' : '--import'

function run(place, c) {
  const t0 = process.hrtime.bigint()
  const r = spawnSync(runtime, [preload, cpuHook, c.fixture, ...c.args], {
    cwd: place,
    stdio: ['ignore', 'ignore', 'pipe'],
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1' }
  })
  const wall = Number(process.hrtime.bigint() - t0) / 1e6
  const what = `${c.fixture} ${c.args.join(' ')} in ${place}`
  if (r.status !== 0) {
    throw new Error(`${what} exited with ${r.status}\n${r.stderr}`)
  }
  const cpu = Number(r.stderr.match(/startup-bench-cpu (\d+)/)?.[1]) / 1000
  if (!Number.isFinite(cpu)) {
    throw new Error(`${what} did not report its CPU time\n${r.stderr}`)
  }
  return { wall, cpu }
}

// run the cases in turns for `n` rounds (after `warmup` rounds), with the baseline once a round
function measure(list, n) {
  const baseline = []
  const samples = Object.fromEntries(
    list.map(c => [c.id, Object.fromEntries(names.map(v => [v, []]))])
  )
  for (let round = 0; round < warmup + n; round++) {
    const b = run(variants[names[0]], BASELINE)
    if (round >= warmup) baseline.push(b)
    const order = round % 2 === 0 ? names : [...names].reverse()
    for (const c of list) {
      for (const v of order) {
        const s = run(variants[v], c)
        if (round >= warmup) samples[c.id][v].push(s)
      }
    }
  }
  return { baseline, samples }
}

const median = xs => {
  const s = [...xs].sort((a, b) => a - b)
  return (s[(s.length - 1) >> 1] + s[s.length >> 1]) / 2
}
let seed = 0x9e3779b9
const random = () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
// the median of the paired differences, and its 99% interval by bootstrap
function change(a, b, iterations = 4000) {
  const diffs = a.map((x, i) => b[i] - x)
  const ms = []
  for (let i = 0; i < iterations; i++)
    ms.push(median(diffs.map(() => diffs[Math.floor(random() * diffs.length)])))
  ms.sort((x, y) => x - y)
  return {
    delta: median(diffs),
    interval: [ms[Math.floor(iterations * 0.005)], ms[Math.ceil(iterations * 0.995) - 1]]
  }
}
function stats(samples, baseline, metric) {
  const [a, b] = names.map(v => samples[v].map(s => s[metric]))
  const base = median(baseline.map(s => s[metric]))
  return {
    [names[0]]: { median: median(a), over: median(a) - base },
    [names[1]]: { median: median(b), over: median(b) - base },
    ...change(a, b)
  }
}
const flagged = s => Math.abs(s.delta) >= threshold && (s.interval[0] > 0 || s.interval[1] < 0)

const loadStart = os.loadavg()
const started = Date.now()
seed = 0x9e3779b9
const first = measure(cases, runs)
const rows = cases.map(c => ({
  id: c.id,
  label: c.label,
  cpu: stats(first.samples[c.id], first.baseline, 'cpu'),
  wall: stats(first.samples[c.id], first.baseline, 'wall'),
  samples: first.samples[c.id]
}))
const toConfirm = cases.filter(c => flagged(rows.find(r => r.id === c.id).cpu))
const second = toConfirm.length > 0 ? measure(toConfirm, confirmRuns) : undefined
for (const c of toConfirm) {
  const row = rows.find(r => r.id === c.id)
  row.first = { cpu: row.cpu, wall: row.wall }
  row.cpu = stats(second.samples[c.id], second.baseline, 'cpu')
  row.wall = stats(second.samples[c.id], second.baseline, 'wall')
  // the second runs confirm the change only in the direction that the first runs showed
  row.confirmed = flagged(row.cpu) && Math.sign(row.cpu.delta) === Math.sign(row.first.cpu.delta)
  row.samples = second.samples[c.id]
}

const result = {
  meta: {
    runtime: values.runtime,
    sha: { base: values['base-sha'], head: values['head-sha'] },
    version: spawnSync(runtime, ['--version'], { encoding: 'utf8' }).stdout.trim(),
    runs,
    confirmRuns,
    warmup,
    threshold,
    platform: `${os.type()} ${os.release()} ${os.arch()}`,
    cpu: os.cpus()[0]?.model,
    cpus: os.cpus().length,
    load: [loadStart, os.loadavg()],
    seconds: Math.round((Date.now() - started) / 1000),
    variants: Object.fromEntries(names.map(n => [n, variants[n]])),
    baseline: {
      cpu: median(first.baseline.map(s => s.cpu)),
      wall: median(first.baseline.map(s => s.wall))
    }
  },
  cases: rows
}
const json = JSON.stringify(result, null, 2)
if (values.out) writeFileSync(values.out, json)
else console.log(json)
const marked = rows
  .filter(r => r.confirmed)
  .map(r => `${r.id} ${r.cpu.delta >= 0 ? '+' : ''}${r.cpu.delta.toFixed(2)}`)
console.error(
  [
    `${cases.length} cases, ${runs} runs each in turns`,
    `${toConfirm.length} run ${confirmRuns} times more`,
    `${marked.length} changed (${marked.join(', ') || 'none'})`,
    `${result.meta.seconds} s`,
    `load ${loadStart.map(x => x.toFixed(2)).join(' ')}`
  ].join(', ')
)
