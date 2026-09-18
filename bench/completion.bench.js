// Benchmark for https://github.com/kazupon/gunshi/issues/708
//
// Run `pnpm build` first: like the other benchmarks, this one measures the built packages.
//
//   pnpm exec vitest bench --run --reporter=verbose bench/completion.bench.js
//
// The assertions describe the intended behavior, so this file fails before the fix:
// - running a normal command must not get slower because `@gunshi/plugin-completion` is installed
// - a completion request must not get slower as the total number of commands grows
//
// BENCH_COMMANDS   number of sub-commands (default: 1000)
// BENCH_SNAPSHOT   label to store this run as, e.g. `before` (written to `.vitest/bench/`)
// BENCH_BASELINE   label of a stored run to show next to this run and to assert against

import { existsSync } from 'node:fs'
import { expect, test } from 'vitest'
import { cli } from '../packages/gunshi/lib/index.js'
import completion from '../packages/plugin-completion/lib/index.js'
import i18n from '../packages/plugin-i18n/lib/index.js'
import resources from '../packages/resources/lib/index.js'

// the size of the tree the large one is compared against
const SMALL_COMMANDS = 100
const COMMANDS = Number(process.env.BENCH_COMMANDS || 1000)
if (!Number.isInteger(COMMANDS) || COMMANDS <= SMALL_COMMANDS) {
  // the two trees are compared by name, so they have to differ
  throw new Error(`BENCH_COMMANDS has to be an integer greater than ${SMALL_COMMANDS}`)
}
const SNAPSHOT = process.env.BENCH_SNAPSHOT
const BASELINE = process.env.BENCH_BASELINE

// A run takes hundreds of milliseconds before the fix, so keep the minimum number of iterations small.
// Fast cases still run for `time` milliseconds and collect many more samples.
// `warmupTime` matters: the tasks share code paths, and without it the task that runs first pays for
// warming them up, which is the task the others are compared against.
const RUN_OPTIONS = { time: 100, iterations: 8, warmupTime: 50, warmupIterations: 2 }

const NOOP = () => {}

const args = {
  verbose: { type: 'boolean', short: 'v', description: 'Enable verbose output' },
  output: { type: 'string', short: 'o', description: 'Output file path' }
}

function createCommand(name) {
  return {
    name,
    description: `command ${name}`,
    args,
    resource: () =>
      Promise.resolve({
        description: `コマンド ${name}`,
        'arg:verbose': '詳細を出力する',
        'arg:output': '出力先のファイル'
      }),
    run: NOOP
  }
}

/**
 * `groups` top-level commands, `total / groups` commands under each of them.
 * Command names are unique, as they are in a real CLI: resource keys are built from the command name.
 */
function createSubCommands(total, groups) {
  const subCommands = new Map()
  const perGroup = Math.floor(total / groups)
  for (let g = 0; g < groups; g++) {
    const children = {}
    for (let c = 0; c < perGroup; c++) {
      children[`g${g}c${c}`] = createCommand(`g${g}c${c}`)
    }
    subCommands.set(`group${g}`, { ...createCommand(`group${g}`), subCommands: children })
  }
  return subCommands
}

const entry = { name: 'root', description: 'root command', args, run: NOOP }

async function run(argv, subCommands, plugins) {
  const log = console.log
  const warn = console.warn
  console.log = NOOP
  console.warn = NOOP
  try {
    await cli(argv, entry, {
      name: 'mycli',
      version: '1.0.0',
      subCommands,
      usageSilent: true,
      plugins: plugins()
    })
  } finally {
    console.log = log
    console.warn = warn
  }
}

const withI18n = () => i18n({ locale: 'ja-JP', builtinResources: resources })

function snapshotPath(name) {
  return `.vitest/bench/completion-${COMMANDS}-${name}`
}

/** options of `bench()`: store the result when BENCH_SNAPSHOT is given */
function store(name) {
  return SNAPSHOT ? { writeResult: `${snapshotPath(name)}.${SNAPSHOT}.json` } : {}
}

/** path of a stored run, which has to exist once BENCH_BASELINE asks for it */
function baselineFile(name) {
  const file = `${snapshotPath(name)}.${BASELINE}.json`
  if (!existsSync(file)) {
    throw new Error(
      `no stored run at ${file}. Store one first with BENCH_COMMANDS=${COMMANDS} BENCH_SNAPSHOT=${BASELINE}`
    )
  }
  return file
}

/**
 * Assert the improvement over the stored run, when BENCH_BASELINE is given.
 * `ratio` is how many times faster this run has to be.
 */
function expectFasterThanBaseline(result, name, baselineName, ratio) {
  if (!BASELINE) {
    return
  }
  expect(result.get(name)).toBeFasterThan(result.get(`${baselineName} (${BASELINE})`), {
    delta: 1 - 1 / ratio
  })
}

/** registrations of the stored run, when BENCH_BASELINE is given */
function baseline(bench, names) {
  if (!BASELINE) {
    return []
  }
  return names.map(name => bench.from(`${name} (${BASELINE})`, baselineFile(name)))
}

const large = createSubCommands(COMMANDS, Math.max(2, Math.floor(COMMANDS / 50)))
const small = createSubCommands(SMALL_COMMANDS, 2)

test(`normal command run with ${COMMANDS} sub-commands`, async ({ bench }) => {
  const argv = ['group0', 'g0c0']
  const result = await bench.compare(
    bench('no plugins', () => run(argv, large, () => [])),
    bench('completion', store('run-completion'), () => run(argv, large, () => [completion()])),
    bench('i18n', () => run(argv, large, () => [withI18n()])),
    bench('i18n + completion', store('run-i18n-completion'), () =>
      run(argv, large, () => [withI18n(), completion()])
    ),
    ...baseline(bench, ['run-completion', 'run-i18n-completion']),
    RUN_OPTIONS
  )

  // installing the completion plugin must not make other commands slower (5x is noise margin)
  expect(result.get('completion')).not.toBeSlowerThan(result.get('no plugins'), { delta: 4 })
  expect(result.get('i18n + completion')).not.toBeSlowerThan(result.get('i18n'), { delta: 4 })

  // targets from the investigation of the issue
  expectFasterThanBaseline(result, 'completion', 'run-completion', 10)
  expectFasterThanBaseline(result, 'i18n + completion', 'run-i18n-completion', 100)
})

test(`completion request: ${COMMANDS} vs ${SMALL_COMMANDS} sub-commands`, async ({ bench }) => {
  // `mycli group0 g0c<TAB>`: the same 50 siblings in both trees
  const argv = ['complete', '--', 'group0', 'g0c']
  const result = await bench.compare(
    bench(`${SMALL_COMMANDS} commands`, () => run(argv, small, () => [completion()])),
    bench(`${COMMANDS} commands`, store('complete'), () => run(argv, large, () => [completion()])),
    bench(`${SMALL_COMMANDS} commands, i18n`, () =>
      run(argv, small, () => [withI18n(), completion()])),
    bench(`${COMMANDS} commands, i18n`, store('complete-i18n'), () =>
      run(argv, large, () => [withI18n(), completion()])
    ),
    ...baseline(bench, ['complete', 'complete-i18n']),
    RUN_OPTIONS
  )

  // the cost depends on the active path and its siblings, not on the size of the tree
  expect(result.get(`${COMMANDS} commands`)).not.toBeSlowerThan(
    result.get(`${SMALL_COMMANDS} commands`),
    { delta: 4 }
  )
  expect(result.get(`${COMMANDS} commands, i18n`)).not.toBeSlowerThan(
    result.get(`${SMALL_COMMANDS} commands, i18n`),
    { delta: 4 }
  )

  // targets from the investigation of the issue
  expectFasterThanBaseline(result, `${COMMANDS} commands`, 'complete', 5)
  expectFasterThanBaseline(result, `${COMMANDS} commands, i18n`, 'complete-i18n', 100)
})
