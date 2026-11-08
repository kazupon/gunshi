/**
 * The keys of a command, against the built declarations (#871).
 *
 * The helpers that define a command, `cli()` and the table of the sub-commands reject a key that a command does not
 * have, and a key of its own is added to `Command` with module augmentation. `gunshi`, `@gunshi/definition` and
 * `@gunshi/plugin` each bundle their own copy of `Command`, and the helpers of `@gunshi/plugin-i18n` use the one of
 * `@gunshi/plugin`. The type tests of the repository read the sources, which are one copy, so they cannot tell which
 * copy a key is added to. These tests write small programs into a temporary directory, with the packages linked into
 * `node_modules`, and type-check each program by itself, so that the augmentation of one program does not reach the
 * others. Run `pnpm build` first.
 *
 * A statement that must not type-check is on one line, under `@ts-expect-error`.
 */

import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, expect, test } from 'vitest'

const ROOT = path.resolve(import.meta.dirname, '..')

const PACKAGES: Record<string, string> = {
  gunshi: 'gunshi',
  '@gunshi/definition': 'definition',
  '@gunshi/plugin': 'plugin',
  '@gunshi/plugin-i18n': 'plugin-i18n'
}

const PROGRAMS: Record<string, string> = {
  // a typo is a type error with each helper, and the keys of a command are not
  'typos.ts': `import { cli, define, defineWithTypes, lazy, lazyWithTypes } from 'gunshi'
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

  // a key of its own, added to the Command of gunshi
  'augment-gunshi.ts': `import { cli, define, lazy } from 'gunshi'
import type { DefaultGunshiParams, GunshiParamsConstraint, SubCommandable } from 'gunshi'

declare module 'gunshi' {
  interface Command<G extends GunshiParamsConstraint = DefaultGunshiParams> {
    owner?: string
  }
}

const run = () => {}
export const deploy = define({ name: 'deploy', owner: 'infra', run })
export const owner: string = deploy.owner
export const show = lazy(() => run, { name: 'show', owner: 'infra' })
await cli([], { name: 'app', owner: 'infra', run }, { subCommands: { deploy, show } })
await cli([], deploy, { subCommands: { status: { name: 'status', owner: 'infra', run } } })
export const status: SubCommandable = { name: 'status', owner: 'infra', run }
// @ts-expect-error \`desc\` is not a key of a command
define({ name: 'a', desc: 'A', run })
// @ts-expect-error \`desc\` is not a key of a command, in a sub-command too
await cli([], deploy, { subCommands: { status: { name: 'status', desc: 'A', run } } })
`,

  // a key of its own, added to the Command of @gunshi/definition
  'augment-definition.ts': `import { define } from '@gunshi/definition'
import type { DefaultGunshiParams, GunshiParamsConstraint } from '@gunshi/definition'

declare module '@gunshi/definition' {
  interface Command<G extends GunshiParamsConstraint = DefaultGunshiParams> {
    owner?: string
  }
}

const run = () => {}
export const deploy = define({ name: 'deploy', owner: 'infra', run })
// @ts-expect-error \`desc\` is not a key of a command
define({ name: 'a', desc: 'A', run })
`,

  // the define of @gunshi/definition does not see a key added to the Command of gunshi
  'augment-another-package.ts': `import { define } from '@gunshi/definition'
import type { DefaultGunshiParams, GunshiParamsConstraint } from 'gunshi'

declare module 'gunshi' {
  interface Command<G extends GunshiParamsConstraint = DefaultGunshiParams> {
    owner?: string
  }
}

const run = () => {}
// @ts-expect-error \`owner\` is added to the Command of gunshi, not to the one of @gunshi/definition
define({ name: 'deploy', owner: 'infra', run })
`,

  // the helpers of @gunshi/plugin-i18n see a key added to the Command of @gunshi/plugin
  'augment-plugin.ts': `import { define } from 'gunshi'
import type { DefaultGunshiParams, GunshiParamsConstraint } from '@gunshi/plugin'
import { defineI18n, withI18nResource } from '@gunshi/plugin-i18n'

declare module '@gunshi/plugin' {
  interface Command<G extends GunshiParamsConstraint = DefaultGunshiParams> {
    owner?: string
  }
}

const run = () => {}
const resource = async () => ({ description: 'Deploy the app' })
export const deploy = defineI18n({ name: 'deploy', owner: 'infra', resource, run })
export const show = withI18nResource({ name: 'show', owner: 'infra', run }, resource)
// @ts-expect-error \`desc\` is not a key of a command
defineI18n({ name: 'a', desc: 'A', resource, run })
// @ts-expect-error \`owner\` is added to the Command of @gunshi/plugin, not to the one of gunshi
define({ name: 'list', owner: 'infra', run })
`
}

let dir = ''

beforeAll(() => {
  for (const name of Object.values(PACKAGES)) {
    if (!existsSync(path.join(ROOT, 'packages', name, 'lib', 'index.d.ts'))) {
      throw new Error(`packages/${name}/lib/index.d.ts is not found. Run \`pnpm build\` first.`)
    }
  }
  dir = mkdtempSync(path.join(os.tmpdir(), 'gunshi-command-keys-'))
  mkdirSync(path.join(dir, 'node_modules', '@gunshi'), { recursive: true })
  for (const [specifier, name] of Object.entries(PACKAGES)) {
    symlinkSync(path.join(ROOT, 'packages', name), path.join(dir, 'node_modules', specifier))
  }
  writeFileSync(path.join(dir, 'package.json'), '{ "type": "module" }\n')
  const compilerOptions = {
    strict: true,
    module: 'nodenext',
    moduleResolution: 'nodenext',
    target: 'es2022',
    noEmit: true,
    skipLibCheck: false,
    types: []
  }
  for (const [file, source] of Object.entries(PROGRAMS)) {
    writeFileSync(path.join(dir, file), source)
    writeFileSync(
      path.join(dir, `tsconfig.${file}.json`),
      `${JSON.stringify({ compilerOptions, files: [file] })}\n`
    )
  }
})

afterAll(() => {
  if (dir) {
    rmSync(dir, { recursive: true, force: true })
  }
})

test.each(Object.keys(PROGRAMS))('%s type-checks by itself', file => {
  const tsc = path.join(ROOT, 'node_modules', '.bin', 'tsc')
  const result = spawnSync(tsc, ['-p', `tsconfig.${file}.json`], { cwd: dir, encoding: 'utf8' })
  expect(`${result.stdout}${result.stderr}`).toBe('')
  expect(result.status).toBe(0)
})
