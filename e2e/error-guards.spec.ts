/**
 * Error guards across built package copies.
 *
 * `gunshi`, `@gunshi/plugin` and `@gunshi/bone` each bundle their own copy of the error classes
 * and of `args-tokens`, so `instanceof` cannot match an error thrown by another package.
 * These tests import the built packages under `packages/<name>/lib`, so run `pnpm build` first.
 */

import { existsSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { beforeAll, describe, expect, test } from 'vitest'

import type { Args, CliOptions, Command } from '../packages/gunshi/src/index.ts'

type GunshiModule = typeof import('../packages/gunshi/src/index.ts')
type BoneModule = typeof import('../packages/bone/src/index.ts')
type PluginModule = typeof import('../packages/plugin/src/index.ts')
type GlobalPluginModule = typeof import('../packages/plugin-global/src/index.ts')
type RendererPluginModule = typeof import('../packages/plugin-renderer/src/index.ts')
type I18nPluginModule = typeof import('../packages/plugin-i18n/src/index.ts')
type SuggestionPluginModule = typeof import('../packages/plugin-suggestion/src/index.ts')
type ResourcesModule = typeof import('../packages/resources/src/index.ts')

type RunCli = (argv: string[], command: Command, options?: CliOptions) => Promise<unknown>

const ROOT = path.resolve(import.meta.dirname, '..')

/**
 * Import the built entry of a workspace package.
 *
 * @param pkg - The directory name under `packages`
 * @returns The module namespace of `lib/index.js`
 */
async function importBuilt<T>(pkg: string): Promise<T> {
  const file = path.join(ROOT, 'packages', pkg, 'lib', 'index.js')
  if (!existsSync(file)) {
    throw new Error(`${path.relative(ROOT, file)} is not found. Run \`pnpm build\` first.`)
  }
  return (await import(/* @vite-ignore */ pathToFileURL(file).href)) as T
}

/**
 * Run a CLI and return the aggregate validation error it rejects with.
 *
 * @param run - A function that runs the CLI
 * @returns The rejected aggregate error
 */
async function captureAggregateError(run: () => Promise<unknown>): Promise<AggregateError> {
  try {
    await run()
  } catch (error) {
    if (error instanceof AggregateError) {
      return error
    }
    throw error
  }
  throw new Error('expected the CLI to reject with an AggregateError')
}

let gunshi: GunshiModule
let bone: BoneModule
let plugin: PluginModule
let global: GlobalPluginModule
let renderer: RendererPluginModule
let i18n: I18nPluginModule
let suggestion: SuggestionPluginModule
let resources: ResourcesModule

beforeAll(async () => {
  gunshi = await importBuilt<GunshiModule>('gunshi')
  bone = await importBuilt<BoneModule>('bone')
  plugin = await importBuilt<PluginModule>('plugin')
  global = await importBuilt<GlobalPluginModule>('plugin-global')
  renderer = await importBuilt<RendererPluginModule>('plugin-renderer')
  i18n = await importBuilt<I18nPluginModule>('plugin-i18n')
  suggestion = await importBuilt<SuggestionPluginModule>('plugin-suggestion')
  resources = await importBuilt<ResourcesModule>('resources')
})

/**
 * Create a plugin that records the rendered validation errors.
 *
 * It must be installed after the plugins whose rendering it should observe, because renderer
 * decorators registered later wrap the ones registered earlier.
 *
 * @returns The plugin and the recorded messages
 */
function captureValidationErrors() {
  const rendered: string[] = []
  const capture = plugin.plugin({
    id: 'e2e:capture-validation-errors',
    setup(ctx) {
      ctx.decorateValidationErrorsRenderer(async (baseRenderer, cmdCtx, error) => {
        const message = await baseRenderer(cmdCtx, error)
        rendered.push(message)
        return message
      })
    }
  })
  return { capture, rendered }
}

test('the packages ship separate copies of the error classes', () => {
  // guard the premise: otherwise every test below would pass trivially
  expect(gunshi.CommandNotFoundError).not.toBe(plugin.CommandNotFoundError)
  expect(gunshi.ArgsValidationError).not.toBe(plugin.ArgsValidationError)
})

const argsValidationCases: {
  title: string
  args: Args
  argv: string[]
  code: string | undefined
}[] = [
  {
    title: 'required option',
    args: { foo: { type: 'string', required: true } },
    argv: [],
    code: 'err:arg:required-option'
  },
  {
    title: 'required positional',
    args: { file: { type: 'positional' } },
    argv: [],
    code: 'err:arg:required-positional'
  },
  {
    title: 'invalid type',
    args: { port: { type: 'number' } },
    argv: ['--port', 'abc'],
    code: 'err:arg:invalid-type'
  },
  {
    title: 'invalid choice',
    args: { level: { type: 'enum', choices: ['debug', 'info'] } },
    argv: ['--level', 'warn'],
    code: 'err:arg:invalid-choice'
  },
  {
    title: 'conflict',
    args: { summer: { type: 'boolean', conflicts: 'autumn' }, autumn: { type: 'boolean' } },
    argv: ['--summer', '--autumn'],
    code: undefined
  }
]

describe.each<{ thrower: string; runCli: () => RunCli }>([
  {
    thrower: 'gunshi',
    runCli: () => (argv, command, options) =>
      gunshi.cli(argv, command, { usageSilent: true, ...options })
  },
  {
    thrower: '@gunshi/bone',
    // without the global options plugin, non-priority validation errors do not reject
    runCli: () => (argv, command, options) =>
      bone.cli(argv, command, { usageSilent: true, plugins: [global.default()], ...options })
  }
])('errors thrown by $thrower', ({ runCli }) => {
  test.each(argsValidationCases)(
    '@gunshi/plugin recognizes $title errors',
    async ({ args, argv, code }) => {
      const error = await captureAggregateError(() =>
        runCli()(argv, { name: 'app', args, run: () => {} })
      )
      expect(error.errors).toHaveLength(1)
      const [validationError] = error.errors as Error[]

      expect(validationError).not.toBeInstanceOf(plugin.ArgsValidationError)
      // `ArgResolveError` overrides `name` with the argument name (#687)
      expect(validationError.name).not.toBe('ArgsValidationError')
      expect(plugin.isArgsValidationError(validationError)).toBe(true)
      expect((validationError as InstanceType<PluginModule['ArgsValidationError']>).code).toBe(code)
      expect(plugin.hasPriorityValidationError(error)).toBe(false)
    }
  )

  test('@gunshi/plugin recognizes unknown option errors as priority errors', async () => {
    const error = await captureAggregateError(() =>
      runCli()(
        ['--alow-reload'],
        { name: 'app', toKebab: true, args: { allowReload: { type: 'boolean' } }, run: () => {} },
        { strict: true }
      )
    )
    const [validationError] = error.errors

    expect(validationError).not.toBeInstanceOf(plugin.ArgsValidationError)
    expect(plugin.isArgsValidationError(validationError)).toBe(true)
    expect(plugin.hasPriorityValidationError(error)).toBe(true)
  })

  test('@gunshi/plugin recognizes command not found errors as priority errors', async () => {
    const error = await captureAggregateError(() =>
      runCli()(
        ['lod'],
        { name: 'app', run: () => {} },
        { subCommands: { load: { name: 'load', run: () => {} } } }
      )
    )
    const [notFound] = error.errors

    expect(notFound).not.toBeInstanceOf(plugin.CommandNotFoundError)
    expect(plugin.isCommandNotFoundError(notFound)).toBe(true)
    expect((notFound as InstanceType<PluginModule['CommandNotFoundError']>).candidates).toContain(
      'load'
    )
    expect(plugin.hasPriorityValidationError(error)).toBe(true)
  })
})

describe('@gunshi/bone with plugins built separately', () => {
  test('@gunshi/plugin-renderer localizes a required option error with @gunshi/plugin-i18n', async () => {
    const { capture, rendered } = captureValidationErrors()

    await captureAggregateError(() =>
      bone.cli(
        [],
        { name: 'app', args: { foo: { type: 'string', required: true } }, run: () => {} },
        {
          usageSilent: true,
          plugins: [
            global.default(),
            i18n.default({ locale: 'ja-JP', builtinResources: resources.default }),
            renderer.default(),
            capture
          ]
        }
      )
    )

    // without a cross-copy guard, the renderer falls back to the English message
    expect(rendered).toEqual(["オプション '--foo' は必須です"])
  })

  test('@gunshi/plugin-suggestion suggests a known long option', async () => {
    const { capture, rendered } = captureValidationErrors()

    await captureAggregateError(() =>
      bone.cli(
        ['--alow-reload'],
        { name: 'app', toKebab: true, args: { allowReload: { type: 'boolean' } }, run: () => {} },
        {
          usageSilent: true,
          strict: true,
          plugins: [global.default(), renderer.default(), suggestion.suggestion(), capture]
        }
      )
    )

    expect(rendered).toEqual(['Unknown option: --alow-reload\nDid you mean --allow-reload?'])
  })

  test('@gunshi/plugin-suggestion suggests a known command', async () => {
    const { capture, rendered } = captureValidationErrors()

    await captureAggregateError(() =>
      bone.cli(
        ['lod'],
        { name: 'app', run: () => {} },
        {
          usageSilent: true,
          subCommands: { load: { name: 'load', run: () => {} } },
          plugins: [global.default(), renderer.default(), suggestion.suggestion(), capture]
        }
      )
    )

    expect(rendered).toEqual(['Command not found: lod\nDid you mean load?'])
  })
})
