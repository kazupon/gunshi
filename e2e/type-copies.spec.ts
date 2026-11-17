/**
 * The types of the built packages, across their copies.
 *
 * `gunshi`, `@gunshi/bone`, `@gunshi/definition`, `@gunshi/plugin` and `@gunshi/plugin-i18n` each bundle their
 * own copy of the types of gunshi, so a command defined with one package is passed to an API of another. The type
 * tests of the repository read the sources, which are one copy, and cannot see a type that differs between the
 * copies, such as a `unique symbol`. These tests write small programs into a temporary directory, with the
 * packages linked into `node_modules`, and type-check them against the built declarations, with
 * `skipLibCheck: false`. Run `pnpm build` first.
 *
 * The programs are written here, as the guide for coding agents writes its CLIs, so that the type check and the
 * linters of the repository, which read the sources, leave them alone. A statement that must not type-check is
 * on one line, under `@ts-expect-error`.
 */

import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, expect, test } from 'vite-plus/test'

const ROOT = path.resolve(import.meta.dirname, '..')

const PACKAGES: Record<string, string> = {
  gunshi: 'gunshi',
  '@gunshi/bone': 'bone',
  '@gunshi/definition': 'definition',
  '@gunshi/plugin': 'plugin',
  '@gunshi/plugin-i18n': 'plugin-i18n'
}

const PROGRAMS: Record<string, string> = {
  // define from @gunshi/definition, and jsonArgs from gunshi: the mark is declared in two copies
  'mixed.ts': `import { define } from '@gunshi/definition'
import { jsonArgs } from 'gunshi'

export const list = define({ name: 'list', args: { ...jsonArgs }, run: async () => ({ projects: [] as string[] }) })
`,

  'mixed-more.ts': `import { define, lazy } from '@gunshi/definition'
import type { Command as PluginCommand } from '@gunshi/plugin'
import { cli, jsonArgs } from 'gunshi'
import type { Command } from 'gunshi'

interface Project {
  name: string
}

export const list = define({
  name: 'list',
  args: { ...jsonArgs, limit: { type: 'number', default: 20 } },
  run: async ctx => {
    const json: boolean | undefined = ctx.values.json
    void json
    return { projects: [] as Project[] }
  }
})
// @ts-expect-error a command that supports --json returns its result
define({ name: 'a', args: { ...jsonArgs }, run: async () => {} })
// @ts-expect-error a command that supports --json does not return a string
define({ name: 'b', args: { ...jsonArgs }, run: () => 'text' })
// @ts-expect-error a json of its own has no mark: the command returns a string or nothing
define({ name: 'c', args: { json: { type: 'boolean' } }, run: () => ({ a: 1 }) })
define({ name: 'd', args: { json: { type: 'boolean' } }, run: () => 'its own json, as before' })
lazy(() => async () => ({ projects: [] as Project[] }), { name: 'e', args: { ...jsonArgs } })
// @ts-expect-error a command that supports --json returns its result
lazy(() => async () => {}, { name: 'f', args: { ...jsonArgs } })

export const typed: PluginCommand<{ args: typeof jsonArgs }> = { name: 'g', args: jsonArgs, run: () => ({ ok: true }) }
// @ts-expect-error a command that supports --json does not return a string
export const broken: PluginCommand<{ args: typeof jsonArgs }> = { name: 'h', args: jsonArgs, run: () => 'text' }

// a short name for --json keeps the mark
export const short = define({ name: 'i', args: { json: { ...jsonArgs.json, short: 'j' } }, run: () => ({ ok: true }) })
const shortArgs = { json: { ...jsonArgs.json, short: 'j' } } as const
export const annotated: Command<{ args: typeof shortArgs }> = { name: 'k', args: shortArgs, run: () => ({ ok: true }) }

await cli([], list)
await cli([], short)
`,

  'plugin-add.ts': `import { define, jsonArgs } from 'gunshi'
import { plugin } from '@gunshi/plugin'

const status = define({ name: 'status', args: { ...jsonArgs }, run: () => ({ status: 'ok' }) })

export const db = define({ name: 'db', subCommands: { status } })

export const statusPlugin = plugin({
  id: 'x:status',
  setup(ctx) {
    ctx.addCommand('status', status)
  }
})
`,

  'plugin-add-plain.ts': `import { define as defineFromGunshi } from 'gunshi'
import { define as defineFromDefinition } from '@gunshi/definition'
import { plugin } from '@gunshi/plugin'

const a = defineFromGunshi({ name: 'a', run: () => 'a' })
const b = defineFromDefinition({ name: 'b', run: () => 'b' })

export const p = plugin({
  id: 'x:plain',
  setup(ctx) {
    ctx.addCommand('a', a)
    ctx.addCommand('b', b)
  }
})
`,

  'apis.ts': `import { createCommandContext, define, jsonArgs } from 'gunshi'
import { generate } from 'gunshi/generator'

const list = define({ name: 'list', args: { ...jsonArgs }, run: () => ({ projects: [] as string[] }) })

export const ctx = await createCommandContext({ args: list.args, values: { json: true }, command: list })
export const usage: string = await generate(null, list)
`,

  'apis-plain.ts': `import { createCommandContext, define } from 'gunshi'
import { define as defineFromDefinition } from '@gunshi/definition'
import { generate } from 'gunshi/generator'

const a = define({ name: 'a', args: { n: { type: 'number' } }, run: () => 'a' })
const b = defineFromDefinition({ name: 'b', args: { n: { type: 'number' } }, run: () => 'b' })

export const ca = await createCommandContext({ args: a.args, values: { n: 1 }, command: a })
export const cb = await createCommandContext({ args: b.args, values: { n: 1 }, command: b })
export const ga = await generate(null, a)
export const gb = await generate(null, b)
`,

  'i18n.ts': `import { define, jsonArgs } from 'gunshi'
import { defineI18n, defineI18nWithTypes, withI18nResource } from '@gunshi/plugin-i18n'

const resource = async () => ({ description: 'List the projects' })

export const a = defineI18n({ name: 'a', args: { ...jsonArgs }, resource, run: () => ({ projects: [] as string[] }) })
// @ts-expect-error a command that supports --json returns its result
defineI18n({ name: 'a2', args: { ...jsonArgs }, resource, run: () => {} })

export const b = defineI18nWithTypes<{ args: typeof jsonArgs }>()({ name: 'b', args: { ...jsonArgs }, resource, run: () => ({ ok: true }) })

const c = define({ name: 'c', args: { ...jsonArgs }, run: () => ({ ok: true }) })
export const withResource = withI18nResource(c, resource)
`,

  'i18n-more.ts': `import { cli, define, jsonArgs, lazy } from 'gunshi'
import { define as defineFromDefinition } from '@gunshi/definition'
import { withI18nResource } from '@gunshi/plugin-i18n'

const resource = async () => ({ description: 'A command' })

const a = define({ name: 'a', args: { n: { type: 'number' } }, run: ctx => \`a \${ctx.values.n}\` })
const b = defineFromDefinition({ name: 'b', args: { n: { type: 'number' } }, run: ctx => \`b \${ctx.values.n}\` })
const c = define({ name: 'c', args: { ...jsonArgs }, run: () => ({ ok: true }) })
const d = lazy(async () => define({ name: 'd', run: () => 'd' }), { name: 'd', args: { n: { type: 'number' } } })

export const ia = withI18nResource(a, resource)
export const ib = withI18nResource(b, resource)
export const ic = withI18nResource(c, resource)
// a lazy command stays a lazy command, which the CLI calls to load the command (#877)
export const id = withI18nResource(d, resource)
export const loading = id()

const name: string | undefined = ia.name
const args: { n: { type: 'number' } } = ib.args
const commandName: string = id.commandName
void name
void args
void commandName

await cli([], ia, { subCommands: { b: ib, c: ic, d: id } })
await cli([], ic, { subCommands: { a: ia } })
await cli([], id)
`,

  'definition-collect.ts': `import { define, jsonArgs } from 'gunshi'
import { define as defineFromDefinition, type SubCommandable } from '@gunshi/definition'

const list = define({ name: 'list', args: { ...jsonArgs }, run: () => ({ projects: [] as string[] }) })
const show = defineFromDefinition({ name: 'show', args: { id: { type: 'string' } }, run: ctx => \`\${ctx.values.id}\` })

export const commands: Record<string, SubCommandable> = { list, show }
export const map = new Map<string, SubCommandable>([
  ['list', list],
  ['show', show]
])
`,

  'collections-guided.ts': `import { cli, define, jsonArgs, lazy } from 'gunshi'
import type { Command, SubCommandable } from 'gunshi'

const listArgs = { ...jsonArgs }
const list = define({ name: 'list', args: listArgs, run: () => ({ projects: [] as string[] }) })
const deploy = define({ name: 'deploy', args: { prod: { type: 'boolean' } }, run: () => 'deployed' })
const show = lazy(() => async () => ({ project: 'acme' }), { name: 'show', args: { ...jsonArgs } })

export const record: Record<string, SubCommandable> = { list, deploy, show }
export const map = new Map<string, SubCommandable>([['list', list], ['deploy', deploy], ['show', show]])
export const array: SubCommandable[] = [list, deploy, show]
export const typed: Command<{ args: typeof listArgs }> = { name: 'typed', args: listArgs, run: () => ({ ok: true }) }
// @ts-expect-error Command without type arguments does not take a command that spreads jsonArgs
export const plain: Command[] = [list, deploy]

await cli([], define({ name: 'demo', run: () => {} }), { subCommands: record })
await cli([], define({ name: 'demo', run: () => {} }), { subCommands: map })
`,

  // a key that a command does not have is a type error with the helpers of each package and with cli() (#871)
  'unknown-keys.ts': `import { cli, define, defineWithTypes, lazy, lazyWithTypes } from 'gunshi'
import type { SubCommandable } from 'gunshi'
import { define as defineFromDefinition, lazy as lazyFromDefinition } from '@gunshi/definition'
import { defineI18n, defineI18nWithTypes, withI18nResource } from '@gunshi/plugin-i18n'

const run = () => {}
const resource = async () => ({ description: 'A command' })

// @ts-expect-error \`desc\` is not a key of a command
define({ name: 'a', desc: 'A', run })
// @ts-expect-error \`desc\` is not a key of a command
defineWithTypes<{ extensions: {} }>()({ name: 'a', desc: 'A', run })
// @ts-expect-error \`desc\` is not a key of a command
lazy(() => run, { name: 'a', desc: 'A' })
// @ts-expect-error \`desc\` is not a key of a command
lazyWithTypes<{ extensions: {} }>()(() => run, { name: 'a', desc: 'A' })
// @ts-expect-error \`desc\` is not a key of a command
defineFromDefinition({ name: 'a', desc: 'A', run })
// @ts-expect-error \`desc\` is not a key of a command
lazyFromDefinition(() => run, { name: 'a', desc: 'A' })
// @ts-expect-error \`desc\` is not a key of a command
defineI18n({ name: 'a', desc: 'A', resource, run })
// @ts-expect-error \`desc\` is not a key of a command
defineI18nWithTypes<{ extensions: {} }>()({ name: 'a', desc: 'A', resource, run })
// @ts-expect-error \`desc\` is not a key of a command
withI18nResource({ name: 'a', desc: 'A', run }, resource)
// @ts-expect-error \`desc\` is not a key of a command
await cli([], { name: 'a', desc: 'A', run })
// @ts-expect-error \`desc\`, in a sub-command
await cli([], define({ name: 'a', run }), { subCommands: { b: { name: 'b', desc: 'B', run } } })
// @ts-expect-error an array keys its commands by their names, and a loader has none
await cli([], define({ name: 'a', run }), { subCommands: [() => define({ name: 'b', run })] })

const typed = defineWithTypes<{ extensions: { logger: { log: (message: string) => void } } }>()({
  name: 'typed',
  run: ctx => ctx.extensions.logger.log('typed')
})
const show = lazy(() => run, { name: 'show', args: {}, resource })
const fromDefinition = defineFromDefinition({ name: 'definition', run })
const translated = defineI18n({ name: 'translated', resource, run })
const entry: SubCommandable = { name: 'entry', run }
export const wrapped = withI18nResource(entry, resource)
await cli([], define({ name: 'app', description: 'An app', run }), {
  subCommands: { typed, show, fromDefinition, translated, load: () => define({ name: 'load', run }) }
})
`,

  // a run in the definition of a lazy command is a type error with the helpers of each package: the loader returns it (#881)
  'lazy-run.ts': `import { define, lazy, lazyWithTypes } from 'gunshi'
import type { Command } from 'gunshi'
import { define as defineFromDefinition, lazy as lazyFromDefinition } from '@gunshi/definition'
import { defineI18n } from '@gunshi/plugin-i18n'

const run = () => {}
const resource = async () => ({ description: 'A command' })

// @ts-expect-error \`run\` comes from the loader
lazy(() => run, { name: 'a', run })
// @ts-expect-error \`run\` comes from the loader
lazyWithTypes<{ extensions: {} }>()(() => run, { name: 'a', run })
// @ts-expect-error \`run\` comes from the loader
lazyFromDefinition(() => run, { name: 'a', run })
// @ts-expect-error \`run\` of the command that \`define\` returns
lazy(() => run, define({ name: 'a', run }))
// @ts-expect-error \`run\` of the command that \`defineI18n\` returns
lazy(() => run, defineI18n({ name: 'a', resource, run }))

// a definition without run, also when its type has an optional run
export const a = lazy(() => run, define({ name: 'a' }))
export const b = lazyFromDefinition(() => run, defineFromDefinition({ name: 'b' }))
export const c = lazy(() => run, defineI18n({ name: 'c', resource }))
const typed: Command = { name: 'd', run }
export const d = lazy(() => run, typed)
`,

  // a key that an argument does not have is a type error with the helpers of each package (#930)
  'unknown-arg-keys.ts': `import { define, defineWithTypes, jsonArgs, lazy, lazyWithTypes } from 'gunshi'
import { integer, withDefault } from 'gunshi/combinators'
import { define as defineFromDefinition, lazy as lazyFromDefinition } from '@gunshi/definition'
import { defineI18n, defineI18nWithTypes } from '@gunshi/plugin-i18n'

const run = () => {}
const resource = async () => ({ description: 'A command' })
const parse = (value: string) => Number(value)

// @ts-expect-error \`positional\` is not a key of an argument
define({ name: 'a', args: { n: { type: 'custom', positional: true, parse } }, run })
// @ts-expect-error \`alias\` is not a key of an argument
defineWithTypes<{ extensions: {} }>()({ name: 'a', args: { s: { type: 'string', alias: 's' } }, run })
// @ts-expect-error \`array\` is not a key of an argument
lazy(() => run, { name: 'a', args: { s: { type: 'string', array: true } } })
// @ts-expect-error \`desc\` is not a key of an argument
lazyWithTypes<{ extensions: {} }>()(() => run, { name: 'a', args: { s: { type: 'string', desc: 'S' } } })
// @ts-expect-error \`require\` is not a key of an argument
defineFromDefinition({ name: 'a', args: { s: { type: 'string', require: true } }, run })
// @ts-expect-error \`desc\` is not a key of an argument
lazyFromDefinition(() => run, { name: 'a', args: { s: { type: 'string', desc: 'S' } } })
// @ts-expect-error \`alias\` is not a key of an argument
defineI18n({ name: 'a', args: { s: { type: 'string', alias: 's' } }, resource, run })
// @ts-expect-error \`alias\` is not a key of an argument
defineI18nWithTypes<{ extensions: {} }>()({ name: 'a', args: { s: { type: 'string', alias: 's' } }, run })

// the keys of an argument, jsonArgs and the parser combinators
export const all = define({
  name: 'all',
  args: {
    ...jsonArgs,
    verbose: { type: 'boolean', short: 'v', negatable: true },
    wait: { type: 'custom', metavar: 'seconds', default: 60, parse },
    count: integer({ min: 1 }),
    limit: withDefault(integer(), 20)
  },
  run: ctx => ({ wait: ctx.values.wait, count: ctx.values.count, limit: ctx.values.limit })
})
export const short = defineFromDefinition({ name: 'short', args: { json: { ...jsonArgs.json, short: 'j' } }, run: () => ({ ok: true }) })
export const translated = defineI18n({ name: 'translated', args: { s: { type: 'string', description: 'S' } }, resource, run })
`,

  // an object given to cli() or generate() as the command is typed by its arguments (#931)
  'cli-entry.ts': `import { cli } from 'gunshi'
import { cli as cliOfBone } from 'gunshi/bone'
import { generate } from 'gunshi/generator'

const run = () => {}

await cli([], {
  name: 'deploy',
  args: { replicas: { type: 'number', default: 1 }, tag: { type: 'string' } },
  run: ctx => {
    const replicas: number = ctx.values.replicas
    const tag: string | undefined = ctx.values.tag
    return [replicas, tag].join(' ')
  }
})
await cliOfBone([], {
  name: 'deploy',
  args: { replicas: { type: 'number', default: 1 } },
  run: ctx => {
    const replicas: number = ctx.values.replicas
    return String(replicas)
  }
})
// @ts-expect-error 'numbr' is not a type of an argument
await cli([], { name: 'a', args: { n: { type: 'numbr' } }, run })
// @ts-expect-error \`desc\` is not a key of an argument
await cli([], { name: 'a', args: { s: { type: 'string', desc: 'S' } }, run })
// @ts-expect-error a runner returns a string or nothing
await cli([], { name: 'a', args: { n: { type: 'number', default: 1 } }, run: ctx => ctx.values.n })
// @ts-expect-error 'numbr' is not a type of an argument
await cliOfBone([], { name: 'a', args: { n: { type: 'numbr' } }, run })
// @ts-expect-error 'numbr' is not a type of an argument
await generate(null, { name: 'a', args: { n: { type: 'numbr' } }, run })
`,

  // the commands of another copy of the types, given to cli() and generate() as the command
  'entry-another-copy.ts': `import { define, jsonArgs, lazy } from '@gunshi/definition'
import { cli } from 'gunshi'
import { generate } from 'gunshi/generator'

const run = () => {}
const show = define({ name: 'show', args: { limit: { type: 'number', default: 20 } }, run: ctx => String(ctx.values.limit) })
const list = define({ name: 'list', args: { ...jsonArgs }, run: async () => ({ items: [] as string[] }) })

await cli([], show)
await cli([], list)
export const usages = [
  await generate(null, show),
  await generate(null, list),
  await generate(null, lazy(() => run, { name: 'lazily', args: { limit: { type: 'number' } } }))
]
`,

  // @gunshi/bone exports no define: a CLI on it defines its commands with another package (#933)
  'bone-another-copy.ts': `import { cli as cliOfBone } from '@gunshi/bone'
import { define, jsonArgs } from '@gunshi/definition'
import { cli as cliOfGunshiBone } from 'gunshi/bone'
import { define as defineFromGunshi } from 'gunshi/definition'

const show = define({ name: 'show', args: { limit: { type: 'number', default: 20 } }, run: ctx => String(ctx.values.limit) })
const list = define({ name: 'list', args: { ...jsonArgs }, run: async () => ({ items: [] as string[] }) })
const add = defineFromGunshi({ name: 'add', args: { file: { type: 'positional' } }, run: ctx => ctx.values.file })

await cliOfBone([], show)
await cliOfBone([], list)
await cliOfBone([], add)
await cliOfGunshiBone([], show)
// @ts-expect-error 'numbr' is not a type of an argument
await cliOfBone([], { name: 'a', args: { n: { type: 'numbr' } }, run: () => {} })
`
}

/**
 * The errors of the keys that an argument does not have (#930), in a directory of its own: the program is not a
 * program that type-checks, as the ones above
 */
const UNKNOWN_ARG_KEY_ERRORS = `import { define } from 'gunshi'
import { define as defineFromDefinition } from '@gunshi/definition'
import { defineI18n } from '@gunshi/plugin-i18n'

const run = () => {}
const resource = async () => ({ description: 'A command' })
const parse = (value: string) => Number(value)

define({ name: 'a', args: { n: { type: 'custom', positional: true, parse } }, run })
define({ name: 'a', args: { s: { type: 'string', alias: 's', array: true } }, run })
defineFromDefinition({ name: 'a', args: { s: { type: 'string', desc: 'S', require: true } }, run })
defineI18n({ name: 'a', args: { s: { type: 'string', alias: 's' } }, resource, run })
`

let dir = ''

beforeAll(() => {
  for (const name of Object.values(PACKAGES)) {
    if (!existsSync(path.join(ROOT, 'packages', name, 'lib', 'index.d.ts'))) {
      throw new Error(`packages/${name}/lib/index.d.ts is not found. Run \`pnpm build\` first.`)
    }
  }
  dir = mkdtempSync(path.join(os.tmpdir(), 'gunshi-type-copies-'))
  mkdirSync(path.join(dir, 'node_modules', '@gunshi'), { recursive: true })
  for (const [specifier, name] of Object.entries(PACKAGES)) {
    symlinkSync(path.join(ROOT, 'packages', name), path.join(dir, 'node_modules', specifier))
  }
  writeFileSync(path.join(dir, 'package.json'), '{ "type": "module" }\n')
  writeFileSync(
    path.join(dir, 'tsconfig.json'),
    `${JSON.stringify({
      compilerOptions: {
        strict: true,
        module: 'nodenext',
        moduleResolution: 'nodenext',
        target: 'es2022',
        noEmit: true,
        skipLibCheck: false,
        types: []
      },
      include: ['*.ts']
    })}\n`
  )
  for (const [file, source] of Object.entries(PROGRAMS)) {
    writeFileSync(path.join(dir, file), source)
  }
})

afterAll(() => {
  if (dir) {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('the programs type-check against the built declarations of the packages', () => {
  const tsc = path.join(ROOT, 'node_modules', '.bin', 'tsc')
  const result = spawnSync(tsc, ['-p', 'tsconfig.json'], { cwd: dir, encoding: 'utf8' })
  expect(`${result.stdout}${result.stderr}`).toBe('')
  expect(result.status).toBe(0)
})

test('an error of a key that an argument does not have names the key, and the key to use instead', () => {
  const errors = path.join(dir, 'unknown-arg-key-errors')
  mkdirSync(errors)
  writeFileSync(path.join(errors, 'errors.ts'), UNKNOWN_ARG_KEY_ERRORS)
  writeFileSync(
    path.join(errors, 'tsconfig.json'),
    `${JSON.stringify({ extends: '../tsconfig.json', include: ['*.ts'] })}\n`
  )
  const tsc = path.join(ROOT, 'node_modules', '.bin', 'tsc')
  const result = spawnSync(tsc, ['-p', 'tsconfig.json'], { cwd: errors, encoding: 'utf8' })
  // the first line of each error: the file, the line and the column, and the message
  const reported = `${result.stdout}${result.stderr}`
    .split('\n')
    .filter(line => line.startsWith('errors.ts('))
  const expected: [number, string][] = [
    [9, `"'positional' is not a key of an argument"`],
    [10, `"'alias' is not a key of an argument: use 'short'"`],
    [10, `"'array' is not a key of an argument: use 'multiple'"`],
    [11, `"'desc' is not a key of an argument: use 'description'"`],
    [11, `"'require' is not a key of an argument: use 'required'"`],
    // the copy of the types of the i18n plugin
    [12, `"'alias' is not a key of an argument: use 'short'"`]
  ]
  for (const [line, message] of expected) {
    expect(
      reported.some(error => error.startsWith(`errors.ts(${line},`) && error.includes(message))
    ).toBe(true)
  }
  expect(reported).toHaveLength(expected.length)
  expect(result.status).not.toBe(0)
})
