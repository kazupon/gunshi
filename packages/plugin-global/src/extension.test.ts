import { describe, expect, test } from 'vitest'
import { createMockCommandContext } from '../../gunshi/test/utils.ts'
import extension from './extension.ts'
import { pluginId } from './types.ts'

import type { GlobalExtension } from './extension.ts'
import type { PluginId } from './types.ts'

describe('showVersion', () => {
  test('basic', async () => {
    const version = '1.0.0'
    const {
      log,
      extensions: { [pluginId]: global }
    } = await createMockCommandContext<{
      [K in PluginId]: GlobalExtension
    }>({
      version,
      extensions: {
        [pluginId]: {
          key: Symbol(pluginId),
          factory: extension
        }
      }
    })
    const rendered = global.showVersion()

    expect(rendered).toEqual(version)
    expect(log).toHaveBeenCalledWith(version)
  })

  test('no version', async () => {
    const {
      log,
      extensions: { [pluginId]: global }
    } = await createMockCommandContext<{
      [K in PluginId]: GlobalExtension
    }>({
      version: null,
      extensions: {
        [pluginId]: {
          key: Symbol(pluginId),
          factory: extension
        }
      }
    })
    const rendered = await global.showVersion()

    expect(rendered).toBe('unknown')
    expect(log).toHaveBeenCalledWith('unknown')
  })

  test('usageSilent', async () => {
    const version = '1.0.0'
    const {
      log,
      extensions: { [pluginId]: global }
    } = await createMockCommandContext<{
      [K in PluginId]: GlobalExtension
    }>({
      version,
      usageSilent: true,
      extensions: {
        [pluginId]: {
          key: Symbol(pluginId),
          factory: extension
        }
      }
    })
    const rendered = await global.showVersion()

    expect(rendered).toEqual(version)
    expect(log).not.toHaveBeenCalled()
  })
})

describe('showHeader', () => {
  test('basic', async () => {
    const header = 'Welcome to the Test Application'
    const {
      log,
      extensions: { [pluginId]: global }
    } = await createMockCommandContext<{
      [K in PluginId]: GlobalExtension
    }>({
      renderHeader: async () => header,
      extensions: {
        [pluginId]: {
          key: Symbol(pluginId),
          factory: extension
        }
      }
    })
    const rendered = await global.showHeader()

    expect(rendered).toEqual(header)
    expect(log).toHaveBeenCalledWith(header)
    expect(log).toHaveBeenCalledWith()
  })

  test('no header', async () => {
    const {
      extensions: { [pluginId]: global }
    } = await createMockCommandContext<{
      [K in PluginId]: GlobalExtension
    }>({
      renderHeader: null,
      extensions: {
        [pluginId]: {
          key: Symbol(pluginId),
          factory: extension
        }
      }
    })
    const rendered = await global.showHeader()

    expect(rendered).toBeUndefined()
  })
})

describe('showUsage', () => {
  test('basic', async () => {
    const usage = 'Usage: test-app [options]'
    const {
      log,
      extensions: { [pluginId]: global }
    } = await createMockCommandContext<{
      [K in PluginId]: GlobalExtension
    }>({
      renderUsage: async () => usage,
      extensions: {
        [pluginId]: {
          key: Symbol(pluginId),
          factory: extension
        }
      }
    })
    const rendered = await global.showUsage()

    expect(rendered).toEqual(usage)
    expect(log).toHaveBeenCalledWith(usage)
  })

  test('no usage', async () => {
    const {
      extensions: { [pluginId]: global }
    } = await createMockCommandContext<{
      [K in PluginId]: GlobalExtension
    }>({
      renderUsage: null,
      extensions: {
        [pluginId]: {
          key: Symbol(pluginId),
          factory: extension
        }
      }
    })
    const rendered = await global.showUsage()

    expect(rendered).toBeUndefined()
  })
})
