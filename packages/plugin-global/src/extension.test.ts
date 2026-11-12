import { describe, expect, test } from 'vite-plus/test'
import { createCommandContext } from '../../gunshi/src/context.ts'
import { defineMockErrorLog, defineMockLog } from '../../gunshi/test/utils.ts'
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

  test('with the header as its title', async () => {
    const header = 'Test App (test-app v1.0.0)'
    const usage = 'Usage: test-app [options]'
    const ctx = await createCommandContext({
      cliOptions: {
        renderHeader: () => Promise.resolve(header),
        renderUsage: () => Promise.resolve(usage),
        usageSilent: true
      },
      extensions: {
        [pluginId]: {
          key: Symbol(pluginId),
          factory: extension
        }
      }
    })
    const global = ctx.extensions[pluginId]
    const rendered = await global.showUsage()

    expect(rendered).toEqual([header, usage].join('\n'))
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

describe('showValidationErrors', () => {
  const error = new AggregateError([new Error('missing id')])

  test('prints the rendered message to stderr, not to stdout', async () => {
    const utils = await import('../../gunshi/src/utils.ts')
    const stdout = defineMockLog(utils)
    const stderr = defineMockErrorLog()
    const message = "Option '--id' is required"
    const ctx = await createCommandContext({
      cliOptions: { renderValidationErrors: () => Promise.resolve(message) },
      extensions: {
        [pluginId]: {
          key: Symbol(pluginId),
          factory: extension
        }
      }
    })
    const rendered = await ctx.extensions[pluginId].showValidationErrors(error)

    expect(rendered).toBe(message)
    expect(stderr()).toBe(message)
    expect(stdout()).toBe('')
  })

  test.each([
    ['an empty message', { renderValidationErrors: () => Promise.resolve('') }, ''],
    [
      '`usageSilent`',
      { renderValidationErrors: () => Promise.resolve('missing id'), usageSilent: true },
      'missing id'
    ],
    ['`renderValidationErrors: null`', { renderValidationErrors: null }, undefined]
  ] as const)('prints nothing for %s', async (_, cliOptions, expected) => {
    const stderr = defineMockErrorLog()
    const ctx = await createCommandContext({
      cliOptions,
      extensions: {
        [pluginId]: {
          key: Symbol(pluginId),
          factory: extension
        }
      }
    })
    const rendered = await ctx.extensions[pluginId].showValidationErrors(error)

    expect(rendered).toBe(expected)
    expect(stderr()).toBe('')
  })
})
