import { expect, test, vi } from 'vitest'
import { createCommandContext } from '../../gunshi/src/context.ts'
import decorator from './decorator.ts'
import extension from './extension.ts'
import { pluginId } from './types.ts'

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
