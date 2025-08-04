import { expect, test, vi } from 'vitest'
import { createMockCommandContext } from '../../gunshi/test/utils.ts'
import decorator from './decorator.ts'
import extension from './extension.ts'
import { pluginId } from './types.ts'

import type { GlobalExtension } from './extension.ts'
import type { PluginId } from './types.ts'

test('enable version option', async () => {
  const version = '1.0.0'
  const ctx = await createMockCommandContext<{
    [K in PluginId]: GlobalExtension
  }>({
    version,
    values: { version: true },
    extensions: {
      [pluginId]: {
        key: Symbol(pluginId),
        factory: extension
      }
    }
  })
  const baseRunner = vi.fn(() => 'command executed')
  const result = await decorator(baseRunner)(ctx)

  expect(result).toBe(version)
  expect(baseRunner).not.toHaveBeenCalled()
})

test('enable help option', async () => {
  const usage = 'Usage: test [options]'
  const ctx = await createMockCommandContext<{
    [K in PluginId]: GlobalExtension
  }>({
    renderUsage: async () => usage,
    values: { help: true },
    extensions: {
      [pluginId]: {
        key: Symbol(pluginId),
        factory: extension
      }
    }
  })
  const baseRunner = vi.fn(() => 'command executed')
  const result = await decorator(baseRunner)(ctx)

  expect(result).toBe(usage)
  expect(baseRunner).not.toHaveBeenCalled()
})

test('header rendering', async () => {
  const header = 'Welcome to the Test Application'
  const usage = 'Usage: test [options]'
  const ctx = await createMockCommandContext<{
    [K in PluginId]: GlobalExtension
  }>({
    renderHeader: async () => header,
    renderUsage: async () => usage,
    values: { help: true },
    extensions: {
      [pluginId]: {
        key: Symbol(pluginId),
        factory: extension
      }
    }
  })
  const baseRunner = vi.fn(() => 'command executed')
  const result = await decorator(baseRunner)(ctx)

  expect(result).toBe([header, usage].join('\n'))
  expect(baseRunner).not.toHaveBeenCalled()
})

test('base runner execution', async () => {
  const ctx = await createMockCommandContext<{
    [K in PluginId]: GlobalExtension
  }>({
    values: {},
    extensions: {
      [pluginId]: {
        key: Symbol(pluginId),
        factory: extension
      }
    }
  })
  const baseRunner = vi.fn(() => 'command executed')
  const result = await decorator(baseRunner)(ctx)

  expect(result).toBe('command executed')
})
