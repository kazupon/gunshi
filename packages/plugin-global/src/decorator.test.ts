import { COMMON_ARGS } from '@gunshi/shared'
import { expect, test, vi } from 'vitest'
import { createCommandContext } from '../../gunshi/src/context.ts'
import decorator from './decorator.ts'
import extension from './extension.ts'
import { pluginId } from './types.ts'

import type { ArgValues, Args } from '@gunshi/plugin'

test('enable version option', async () => {
  const version = '1.0.0'
  const ctx = await createCommandContext({
    cliOptions: { version, usageSilent: true },
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
    cliOptions: { renderUsage: () => Promise.resolve(usage), usageSilent: true },
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
      renderUsage: () => Promise.resolve(usage)
    },
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

test('throws validation error after showing validation errors', async () => {
  const validationError = new AggregateError([new Error('missing id')], 'validation failed')
  const showValidationErrors = vi.fn<(error: AggregateError) => string>(() => 'validation failed')
  const ctx = await createCommandContext({
    values: {},
    validationError,
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
  const baseRunner = vi.fn<() => string>(() => 'command executed')

  await expect(decorator(baseRunner)(ctx)).rejects.toBe(validationError)

  expect(showValidationErrors).toHaveBeenCalledWith(validationError)
  expect(baseRunner).not.toHaveBeenCalled()
})

/**
 * The global options are merged into the arguments of the command that runs, where an argument of
 * the command shadows the global option of the same name. The tests above leave `args` out, which is
 * how a command that declares neither name arrives here.
 */

function createContext(args: Args, values: ArgValues<Args>) {
  return createCommandContext({
    args,
    values,
    cliOptions: {
      version: '1.0.0',
      renderUsage: () => Promise.resolve('Usage: test'),
      usageSilent: true
    },
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
  const ctx = await createContext({ ...COMMON_ARGS }, { version: true })
  const baseRunner = vi.fn<() => string>(() => 'command executed')

  expect(await decorator(baseRunner)(ctx)).toBe('1.0.0')
  expect(baseRunner).not.toHaveBeenCalled()
})

test('the global `help` still wins when the command declares nothing', async () => {
  const ctx = await createContext({ ...COMMON_ARGS }, { help: true })
  const baseRunner = vi.fn<() => string>(() => 'command executed')

  expect(await decorator(baseRunner)(ctx)).toBe('Usage: test')
  expect(baseRunner).not.toHaveBeenCalled()
})

test('a schema identical to the global one is left to the global option', async () => {
  // indistinguishable from the global option, and behaves the same way, so the global option keeps it
  const ctx = await createContext(
    { version: { type: 'boolean', short: 'v', description: 'Display this version' } },
    { version: true }
  )
  const baseRunner = vi.fn<() => string>(() => 'command executed')

  expect(await decorator(baseRunner)(ctx)).toBe('1.0.0')
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
