#!/usr/bin/env node
//
// bench-docs-hyperfine.sh が出力した raw JSON を集計し、build:typedoc を
// 基準(1.00×)とした markdown レポートを .bench/docs-typedoc-vs-ox.md に書き出す。
//
// 単なる比較表ではなく、計測条件(環境 / ツールバージョン / warmup・runs)・
// 結果表・要約を含むレポートとして残す(参考: ox-jsdoc の jsdoc-linter-report.mjs)。
//
// hyperfine 自身の --export-markdown は Relative 列を「最速コマンド基準」に
// 正規化してしまい --reference でも変えられないため、ここで基準を付け替える。
//
// Usage: [WARMUP=n RUNS=n] node packages/docs/scripts/bench-docs-report.mjs

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const docsRoot = path.resolve(scriptDir, '..')
const jsonPath = path.join(docsRoot, '.bench/docs-typedoc-vs-ox.json')
const mdPath = path.join(docsRoot, '.bench/docs-typedoc-vs-ox.md')

const BASELINE = 'build:typedoc'

const { results } = JSON.parse(readFileSync(jsonPath, 'utf8'))
const base = results.find(r => r.command === BASELINE) ?? results[0]

// --- helpers ---------------------------------------------------------------
const sec = n => (n == null ? 'n/a' : `${n.toFixed(3)} s`)

/** node_modules に解決された実バージョンを読む(catalog: 指定でも実体が取れる)。 */
const pkgVersion = spec => {
  try {
    const p = path.join(docsRoot, 'node_modules', spec, 'package.json')
    return JSON.parse(readFileSync(p, 'utf8')).version ?? 'unknown'
  } catch {
    return 'unknown'
  }
}

const hyperfineVersion = () => {
  try {
    const out = spawnSync('hyperfine', ['--version'], { encoding: 'utf8' })
    return (out.stdout || '').trim().replace(/^hyperfine\s*/, '') || 'unknown'
  } catch {
    return 'unknown'
  }
}

const percentile = (values, p) => {
  if (!values || values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const idx = (sorted.length - 1) * p
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  return lo === hi ? sorted[lo] : sorted[lo] * (hi - idx) + sorted[hi] * (idx - lo)
}

const relative = r => {
  if (r.command === base.command) return '1.00× (baseline)'
  const speedup = base.mean / r.mean // >1: faster than baseline, <1: slower
  return speedup >= 1 ? `${speedup.toFixed(2)}× faster` : `${(1 / speedup).toFixed(2)}× slower`
}

// --- metadata --------------------------------------------------------------
const now = new Date()
const runs = base.times?.length ?? process.env.RUNS ?? 'n/a'
const warmup = process.env.WARMUP ?? 'n/a'
const cpu = os.cpus()?.[0]?.model ?? 'unknown'
const cores = os.cpus()?.length ?? '?'

// --- build report ----------------------------------------------------------
const lines = []
lines.push(
  `# ${now.toISOString().slice(0, 10)} — docs API generators benchmark (typedoc vs ox-content)`
)
lines.push('')
lines.push(
  'Benchmark of the two API reference generators in `packages/docs`, measured with [hyperfine](https://github.com/sharkdp/hyperfine). Binaries are invoked directly (no pnpm wrapper) to capture pure tool execution time. `build:typedoc` emits Markdown via TypeDoc combined with the `typedoc-plugin-markdown` and `typedoc-vitepress-theme` plugins; `build:ox-content` uses ox-content.'
)
lines.push('')

lines.push('## Environment')
lines.push('')
lines.push('| Item | Value |')
lines.push('|---|---|')
lines.push(`| Date | ${now.toISOString()} |`)
lines.push(`| OS | ${process.platform} ${os.release()} (${process.arch}) |`)
lines.push(`| CPU | ${cpu} × ${cores} |`)
lines.push(`| Node.js | ${process.version} |`)
lines.push(`| hyperfine | ${hyperfineVersion()} |`)
lines.push(`| warmup / runs | ${warmup} / ${runs} |`)
lines.push('')

lines.push('## Targets')
lines.push('')
lines.push('| Command | Actual command | Key versions | Output |')
lines.push('|---|---|---|---|')
lines.push(
  `| \`build:typedoc\` (baseline) | \`typedoc --excludeInternal\` | typedoc ${pkgVersion('typedoc')}, typedoc-plugin-markdown ${pkgVersion('typedoc-plugin-markdown')}, typedoc-vitepress-theme ${pkgVersion('typedoc-vitepress-theme')} | \`src/api\` |`
)
lines.push(
  `| \`build:ox-content\` | \`tsx generate-api-with-ox-content.ts\` | @ox-content/napi ${pkgVersion('@ox-content/napi')}, tsx ${pkgVersion('tsx')} | \`src/api-ox\` |`
)
lines.push('')

lines.push('## Results (baseline: build:typedoc)')
lines.push('')
lines.push('| Command | Mean | Median | p95 | Stddev | Min | Max | vs build:typedoc |')
lines.push('|---|---:|---:|---:|---:|---:|---:|---:|')
for (const r of results) {
  const p95 = percentile(r.times, 0.95)
  lines.push(
    `| \`${r.command}\` | ${sec(r.mean)} | ${sec(r.median ?? r.mean)} | ${sec(p95)} | ${sec(r.stddev ?? 0)} | ${sec(r.min)} | ${sec(r.max)} | ${relative(r)} |`
  )
}
lines.push('')

lines.push('## Summary')
lines.push('')
for (const r of results.filter(r => r.command !== base.command)) {
  const speedup = base.mean / r.mean
  const verb =
    speedup >= 1 ? `**${speedup.toFixed(2)}× faster**` : `**${(1 / speedup).toFixed(2)}× slower**`
  lines.push(
    `- \`${r.command}\` is ${verb} than \`${base.command}\` (mean ${sec(r.mean)} vs ${sec(base.mean)}).`
  )
}
lines.push('')

const report = lines.join('\n')
writeFileSync(mdPath, `${report}\n`, 'utf8')
console.log(report)
