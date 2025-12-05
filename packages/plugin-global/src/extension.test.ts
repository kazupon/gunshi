import { describe, expect, test } from 'vitest'
import { createCommandContext } from '../../gunshi/src/context.ts'
import extension from './extension.ts'
import { pluginId } from './types.ts'

describe('showVersion', () => {
  test('basic', async () => {
    const version = '1.0.0'
    const ctx = await createCommandContext({
      cliOptions: { version, usageSilent: true },
      extensions: {
        [pluginId]: {
          key: Symbol(pluginId),
          factory: extension
        }
      }
    })
    const global = ctx.extensions[pluginId]
    const rendered = global.showVersion()

    expect(rendered).toEqual(version)
  })

  test('no version', async () => {
    const ctx = await createCommandContext({
      cliOptions: { version: undefined, usageSilent: true },
      extensions: {
        [pluginId]: {
          key: Symbol(pluginId),
          factory: extension
        }
      }
    })
    const global = ctx.extensions[pluginId]
    const rendered = global.showVersion()

    expect(rendered).toBe('unknown')
  })

  test('usageSilent', async () => {
    const version = '1.0.0'
    const ctx = await createCommandContext({
      cliOptions: { version, usageSilent: true },
      extensions: {
        [pluginId]: {
          key: Symbol(pluginId),
          factory: extension
        }
      }
    })
    const global = ctx.extensions[pluginId]
    const rendered = global.showVersion()

    expect(rendered).toEqual(version)
  })
})

describe('showHeader', () => {
  test('basic', async () => {
    const header = 'Welcome to the Test Application'
    const ctx = await createCommandContext({
      cliOptions: { renderHeader: () => Promise.resolve(header), usageSilent: true },
      extensions: {
        [pluginId]: {
          key: Symbol(pluginId),
          factory: extension
        }
      }
    })
    const global = ctx.extensions[pluginId]
    const rendered = await global.showHeader()

    expect(rendered).toEqual(header)
  })

  test('no header', async () => {
    const ctx = await createCommandContext({
      cliOptions: { renderHeader: null },
      extensions: {
        [pluginId]: {
          key: Symbol(pluginId),
          factory: extension
        }
      }
    })
    const global = ctx.extensions[pluginId]
    const rendered = await global.showHeader()

    expect(rendered).toBeUndefined()
  })
})

describe('showUsage', () => {
  test('basic', async () => {
    const usage = 'Usage: test-app [options]'
    const ctx = await createCommandContext({
      cliOptions: { renderUsage: () => Promise.resolve(usage), usageSilent: true },
      extensions: {
        [pluginId]: {
          key: Symbol(pluginId),
          factory: extension
        }
      }
    })
    const global = ctx.extensions[pluginId]
    const rendered = await global.showUsage()

    expect(rendered).toEqual(usage)
  })

  test('no usage', async () => {
    const ctx = await createCommandContext({
      cliOptions: { renderUsage: null },
      extensions: {
        [pluginId]: {
          key: Symbol(pluginId),
          factory: extension
        }
      }
    })
    const global = ctx.extensions[pluginId]
    const rendered = await global.showUsage()

    expect(rendered).toBeUndefined()
  })
})
