import { COMMON_ARGS, resolveCommandArgs } from '@gunshi/shared'
import { expect, onTestFinished, test, vi } from 'vitest'
import { createCommandContext } from '../../gunshi/src/context.ts'
import decorator from './decorator.ts'
import extension from './extension.ts'
import { pluginId } from './types.ts'

import type { ArgValues, Args } from '@gunshi/plugin'
import type { CliOptions } from '../../gunshi/src/types.ts'

test('enable version option', async () => {
  const version = '1.0.0'
  const ctx = await createCommandContext({
    cliOptions: {
      version,
      usageSilent: true,
      globalOptions: new Map(Object.entries(COMMON_ARGS))
    } as CliOptions,
    values: { version: true },
    extensions: {
      [pluginId]: {
        key: Symbol(pluginId),
        factory: extension
      }
    }
  })
  const baseRunner = vi.fn<() => string>(() => 'command executed')
  const result = await decorator(baseRunner)(ctx)

  expect(result).toBe(version)
  expect(baseRunner).not.toHaveBeenCalled()
})

test('enable help option', async () => {
  const usage = 'Usage: test [options]'
  const ctx = await createCommandContext({
    cliOptions: {
      renderUsage: () => Promise.resolve(usage),
      usageSilent: true,
      globalOptions: new Map(Object.entries(COMMON_ARGS))
    } as CliOptions,
    values: { help: true },
    extensions: {
      [pluginId]: {
        key: Symbol(pluginId),
        factory: extension
      }
    }
  })
  const baseRunner = vi.fn<() => string>(() => 'command executed')
  const result = await decorator(baseRunner)(ctx)

  expect(result).toBe(usage)
  expect(baseRunner).not.toHaveBeenCalled()
})

test('header rendering', async () => {
  const header = 'Welcome to the Test Application'
  const usage = 'Usage: test [options]'
  const ctx = await createCommandContext({
    cliOptions: {
      usageSilent: true,
      renderHeader: () => Promise.resolve(header),
      renderUsage: () => Promise.resolve(usage),
      globalOptions: new Map(Object.entries(COMMON_ARGS))
    } as CliOptions,
    values: { help: true },
    extensions: {
      [pluginId]: {
        key: Symbol(pluginId),
        factory: extension
      }
    }
  })
  const baseRunner = vi.fn<() => string>(() => 'command executed')
  const result = await decorator(baseRunner)(ctx)

  expect(result).toBe([header, usage].join('\n'))
  expect(baseRunner).not.toHaveBeenCalled()
})

test('base runner execution', async () => {
  const ctx = await createCommandContext({
    values: {},
    extensions: {
      [pluginId]: {
        key: Symbol(pluginId),
        factory: extension
      }
    }
  })
  const baseRunner = vi.fn<() => string>(() => 'command executed')
  const result = await decorator(baseRunner)(ctx)

  expect(result).toBe('command executed')
})

test('does not show the header before running a command', async () => {
  const renderHeader = vi.fn<() => Promise<string>>(() =>
    Promise.resolve('Test App (test-app v1.0.0)')
  )
  const ctx = await createCommandContext({
    values: {},
    cliOptions: { renderHeader, usageSilent: true } as CliOptions,
    extensions: {
      [pluginId]: {
        key: Symbol(pluginId),
        factory: extension
      }
    }
  })
  const baseRunner = vi.fn<() => string>(() => 'command executed')
  const result = await decorator(baseRunner)(ctx)

  expect(result).toBe('command executed')
  expect(renderHeader).not.toHaveBeenCalled()
})

/**
 * Prepare the set of reported errors for the run of a context, as the core does in `cli()`.
 *
 * @param ctx - The command context of the run
 * @returns The set of the errors that the plugin reports during the run
 */
function trackReported(ctx: object): WeakSet<object> {
  const registry = globalThis as unknown as Record<
    symbol,
    WeakMap<object, WeakSet<object>> | undefined
  >
  const reported = new WeakSet<object>()
  ;(registry[Symbol.for('gunshi.reported')] ??= new WeakMap()).set(ctx, reported)
  return reported
}

async function createValidationErrorContext(
  message: string | undefined,
  cliOptions: Partial<CliOptions> = {}
) {
  const validationError = new AggregateError([new Error('missing id')], 'validation failed')
  const showValidationErrors = vi.fn<(error: AggregateError) => string | undefined>(() => message)
  const ctx = await createCommandContext({
    values: {},
    validationError,
    cliOptions: cliOptions as CliOptions,
    extensions: {
      [pluginId]: {
        key: Symbol(pluginId),
        factory: () => ({
          showVersion: vi.fn<() => string>(() => '1.0.0'),
          showHeader: vi.fn<() => string | undefined>(() => undefined),
          showUsage: vi.fn<() => string | undefined>(() => undefined),
          showValidationErrors
        })
      }
    }
  })
  return { ctx, validationError, showValidationErrors }
}

test('reports the validation errors it shows: exit code 1, marked, and thrown', async () => {
  onTestFinished(() => {
    process.exitCode = undefined
  })
  const { ctx, validationError, showValidationErrors } =
    await createValidationErrorContext('validation failed')
  const reported = trackReported(ctx)
  const baseRunner = vi.fn<() => string>(() => 'command executed')

  // thrown, so that `onErrorCommand` sees it. `cli()` ends without rejecting, since it is marked
  await expect(decorator(baseRunner)(ctx)).rejects.toBe(validationError)

  expect(showValidationErrors).toHaveBeenCalledWith(validationError)
  expect(baseRunner).not.toHaveBeenCalled()
  expect(process.exitCode).toBe(1)
  expect(reported.has(validationError)).toBe(true)
})

test.each([
  ['nothing is rendered (`renderValidationErrors: null`)', undefined, {}],
  ['the rendered message is empty', '', {}],
  ['the output is silenced (`usageSilent`)', 'validation failed', { usageSilent: true }]
] as const)(
  'does not report the validation errors when %s',
  async (_, message, cliOptions: Partial<CliOptions>) => {
    onTestFinished(() => {
      process.exitCode = undefined
    })
    const { ctx, validationError } = await createValidationErrorContext(message, cliOptions)
    const reported = trackReported(ctx)

    await expect(decorator(vi.fn<() => string>())(ctx)).rejects.toBe(validationError)

    expect(process.exitCode).toBeUndefined()
    expect(reported.has(validationError)).toBe(false)
  }
)

test('does not report the validation errors when the core keeps no set for the run', async () => {
  onTestFinished(() => {
    process.exitCode = undefined
  })
  // shown, but `cli()` would reject, so the exit code is left to the caller
  const { ctx, validationError, showValidationErrors } =
    await createValidationErrorContext('validation failed')

  await expect(decorator(vi.fn<() => string>())(ctx)).rejects.toBe(validationError)

  expect(showValidationErrors).toHaveBeenCalledWith(validationError)
  expect(process.exitCode).toBeUndefined()
})

/**
 * The global options are merged into the arguments of the command that runs, where an argument of
 * the command shadows the global option of the same name. The tests above leave `args` out, which is
 * how a command that declares neither name arrives here.
 */

function createContext(args: Args, values: ArgValues<Args>, commandArgs: Args = args) {
  const globalOptions = new Map(
    Object.entries(COMMON_ARGS).filter(([name]) => !Object.hasOwn(commandArgs, name))
  )
  return createCommandContext({
    args,
    values,
    cliOptions: {
      version: '1.0.0',
      renderUsage: () => Promise.resolve('Usage: test'),
      usageSilent: true,
      globalOptions
    } as CliOptions,
    extensions: {
      [pluginId]: {
        key: Symbol(pluginId),
        factory: extension
      }
    }
  })
}

test('an argument of the command shadows the global `version`', async () => {
  const ctx = await createContext(
    { version: { type: 'string', description: 'Version to release' } },
    { version: '1.2.3' }
  )
  const baseRunner = vi.fn<() => string>(() => 'command executed')

  expect(await decorator(baseRunner)(ctx)).toBe('command executed')
  expect(baseRunner).toHaveBeenCalled()
})

test('a shadowing `version` with a default does not make the command unreachable', async () => {
  const ctx = await createContext(
    { version: { type: 'boolean', default: true, description: 'Version to pin' } },
    { version: true }
  )
  const baseRunner = vi.fn<() => string>(() => 'command executed')

  expect(await decorator(baseRunner)(ctx)).toBe('command executed')
})

test('an argument of the command shadows the global `help`', async () => {
  const ctx = await createContext(
    { help: { type: 'string', description: 'Help topic' } },
    { help: 'topics' }
  )
  const baseRunner = vi.fn<() => string>(() => 'command executed')

  expect(await decorator(baseRunner)(ctx)).toBe('command executed')
})

test('the global `version` still wins when the command declares nothing', async () => {
  const ctx = await createContext({ ...COMMON_ARGS }, { version: true }, {})
  const baseRunner = vi.fn<() => string>(() => 'command executed')

  expect(await decorator(baseRunner)(ctx)).toBe('1.0.0')
  expect(baseRunner).not.toHaveBeenCalled()
})

test('the global `help` still wins when the command declares nothing', async () => {
  const ctx = await createContext({ ...COMMON_ARGS }, { help: true }, {})
  const baseRunner = vi.fn<() => string>(() => 'command executed')

  expect(await decorator(baseRunner)(ctx)).toBe('Usage: test')
  expect(baseRunner).not.toHaveBeenCalled()
})

test("a schema identical to the global one is still the command's", async () => {
  const ctx = await createContext(
    { version: { type: 'boolean', short: 'v', description: 'Display this version' } },
    { version: true }
  )
  const baseRunner = vi.fn<() => string>(() => 'command executed')

  expect(await decorator(baseRunner)(ctx)).toBe('command executed')
  expect(baseRunner).toHaveBeenCalled()
  expect(ctx.env.globalOptions?.has('version')).toBe(false)
})

test('a global option that only gave up its short name is still the global option', async () => {
  // the core takes `-v` away from `--version` when an argument of the command claims the letter
  // (#730), which leaves a schema that is the global option in every other respect
  const commandArgs = {
    verbose: { type: 'boolean', short: 'v', description: 'Verbose output' }
  } satisfies Args
  const ctx = await createContext(
    resolveCommandArgs(new Map(Object.entries(COMMON_ARGS)), commandArgs),
    { version: true },
    commandArgs
  )
  const baseRunner = vi.fn<() => string>(() => 'command executed')

  expect(await decorator(baseRunner)(ctx)).toBe('1.0.0')
  expect(baseRunner).not.toHaveBeenCalled()
  expect(ctx.env.globalOptions?.has('version')).toBe(true)
})

test("leaving `short` out is enough to make the argument the command's", async () => {
  // declares no short name at all, which is not the same as the core taking one away
  const ctx = await createContext(
    { version: { type: 'boolean', description: 'Display this version' } },
    { version: true }
  )
  const baseRunner = vi.fn<() => string>(() => 'command executed')

  expect(await decorator(baseRunner)(ctx)).toBe('command executed')
})

test('a property of its own is enough as well', async () => {
  // everything the global option declares, plus one more: still the command's argument
  const ctx = await createContext(
    { version: { type: 'boolean', short: 'v', description: 'Display this version', hidden: true } },
    { version: true }
  )
  const baseRunner = vi.fn<() => string>(() => 'command executed')

  expect(await decorator(baseRunner)(ctx)).toBe('command executed')
})

test("a type of its own is enough to make the argument the command's", async () => {
  // differs from the global option in `type` alone, so the comparison has to look at it
  const ctx = await createContext(
    { version: { type: 'string', short: 'v', description: 'Display this version' } },
    { version: '1.2.3' }
  )
  const baseRunner = vi.fn<() => string>(() => 'command executed')

  expect(await decorator(baseRunner)(ctx)).toBe('command executed')
})

test("a short name of its own is enough to make the argument the command's", async () => {
  // differs from the global option in `short` alone
  const ctx = await createContext(
    { version: { type: 'boolean', short: 'V', description: 'Display this version' } },
    { version: true }
  )
  const baseRunner = vi.fn<() => string>(() => 'command executed')

  expect(await decorator(baseRunner)(ctx)).toBe('command executed')
})

test("a description of its own is enough to make the argument the command's", async () => {
  const ctx = await createContext(
    { version: { type: 'boolean', short: 'v', description: 'Print the artifact version' } },
    { version: true }
  )
  const baseRunner = vi.fn<() => string>(() => 'command executed')

  expect(await decorator(baseRunner)(ctx)).toBe('command executed')
})

test('a shadowing argument with no value runs the command, as it did before', async () => {
  const ctx = await createContext({ version: { type: 'string' } }, {})
  const baseRunner = vi.fn<() => string>(() => 'command executed')

  expect(await decorator(baseRunner)(ctx)).toBe('command executed')
})
