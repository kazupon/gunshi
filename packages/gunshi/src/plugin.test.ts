import { describe, expect, test, vi } from 'vitest'
import { createMockCommandContext } from '../test/utils.ts'
import { Decorators } from './decorators.ts'
import { PluginContext, plugin } from './plugin.ts'

import type { Plugin } from './plugin.ts'
import type { ContextExtension } from './types.ts'

describe('PluginContext#addGlobalOpttion', () => {
  test('basic', () => {
    const decorators = new Decorators()
    const ctx = new PluginContext(decorators)
    ctx.addGlobalOption('foo', { type: 'string', description: 'foo option' })
    expect(ctx.globalOptions.size).toBe(1)
    expect(ctx.globalOptions.get('foo')).toEqual({
      type: 'string',
      description: 'foo option'
    })
  })

  test('name empty', () => {
    const decorators = new Decorators()
    const ctx = new PluginContext(decorators)
    expect(() => ctx.addGlobalOption('', { type: 'string' })).toThrow(
      'Option name must be a non-empty string'
    )
  })

  test('duplicate name', () => {
    const decorators = new Decorators()
    const ctx = new PluginContext(decorators)
    ctx.addGlobalOption('foo', { type: 'string', description: 'foo option' })
    expect(() => ctx.addGlobalOption('foo', { type: 'string' })).toThrow(
      `Global option 'foo' is already registered`
    )
  })
})

describe('PluginContext#decorateHeaderRenderer', () => {
  test('basic', async () => {
    const decorators = new Decorators()
    const ctx = new PluginContext(decorators)

    ctx.decorateHeaderRenderer(async (baseRenderer, cmdCtx) => {
      const result = await baseRenderer(cmdCtx)
      return `[DECORATED] ${result}`
    })

    const renderer = decorators.getHeaderRenderer()
    const mockCtx = createMockCommandContext()
    const result = await renderer(mockCtx)

    expect(result).toBe('[DECORATED] ')
  })
})

describe('PluginContext#decorateUsageRenderer', () => {
  test('basic', async () => {
    const decorators = new Decorators()
    const ctx = new PluginContext(decorators)

    ctx.decorateUsageRenderer(async (baseRenderer, cmdCtx) => {
      const result = await baseRenderer(cmdCtx)
      return `[USAGE] ${result}`
    })

    const renderer = decorators.getUsageRenderer()
    const mockCtx = createMockCommandContext()
    const result = await renderer(mockCtx)

    expect(result).toBe('[USAGE] ')
  })
})

describe('PluginContext#decorateValidationErrorsRenderer', () => {
  test('basic', async () => {
    const decorators = new Decorators()
    const ctx = new PluginContext(decorators)

    ctx.decorateValidationErrorsRenderer(async (baseRenderer, cmdCtx, error) => {
      const result = await baseRenderer(cmdCtx, error)
      return `[ERROR] ${result}`
    })

    const renderer = decorators.getValidationErrorsRenderer()
    const mockCtx = createMockCommandContext()
    const error = new AggregateError([new Error('Test')], 'Validation failed')
    const result = await renderer(mockCtx, error)

    expect(result).toBe('[ERROR] ')
  })
})

describe('plugin function', () => {
  test('basic - creates plugin with extension', async () => {
    const extensionFactory = vi.fn(_core => ({
      getValue: () => 'test-value',
      isEnabled: true
    }))

    const setupFn = vi.fn(async (ctx: PluginContext) => {
      ctx.addGlobalOption('test', { type: 'string' })
    })

    const testPlugin = plugin({
      name: 'test-plugin',
      setup: setupFn,
      extension: extensionFactory
    })

    // check plugin properties
    expect(testPlugin.name).toBe('test-plugin')
    expect(testPlugin.extension).toBeDefined()
    expect(testPlugin.extension?.key).toBeDefined()
    expect(typeof testPlugin.extension?.key).toBe('symbol')
    expect(testPlugin.extension?.key.description).toBe('test-plugin')
    expect(testPlugin.extension?.factory).toBe(extensionFactory)

    // check that setup function is callable
    const decorators = new Decorators()
    const ctx = new PluginContext(decorators)
    await testPlugin(ctx)
    expect(setupFn).toHaveBeenCalledWith(ctx)
  })

  test('without extension', async () => {
    const setupFn = vi.fn(async (ctx: PluginContext) => {
      ctx.addGlobalOption('simple', { type: 'boolean' })
    })

    const simplePlugin = plugin({
      name: 'simple-plugin',
      setup: setupFn
    })

    expect(simplePlugin.name).toBe('simple-plugin')
    expect(simplePlugin.extension).toBeUndefined()

    // check that setup function is callable
    const decorators = new Decorators()
    const ctx = new PluginContext(decorators)
    await simplePlugin(ctx)
    expect(setupFn).toHaveBeenCalledWith(ctx)
  })

  test('extension factory receives correct context', async () => {
    const mockCore = createMockCommandContext()
    const extensionFactory = vi.fn(core => ({
      user: { id: 1, name: 'Test User' },
      getToken: () => core.values.token
    }))

    const testPlugin = plugin({
      name: 'auth-plugin',
      setup: async ctx => {
        ctx.addGlobalOption('token', { type: 'string' })
      },
      extension: extensionFactory
    })

    // test extension factory
    const extension = testPlugin.extension!
    const result = extension.factory(mockCore)

    expect(extensionFactory).toHaveBeenCalledWith(mockCore)
    expect(result.user).toEqual({ id: 1, name: 'Test User' })
    expect(typeof result.getToken).toBe('function')
  })
})

describe('Plugin type with optional properties', () => {
  test('backward compatibility - simple function plugin', async () => {
    const simplePlugin: Plugin = async ctx => {
      ctx.addGlobalOption('simple', { type: 'string' })
    }

    const decorators = new Decorators()
    const ctx = new PluginContext(decorators)

    // should work without name or extension
    await simplePlugin(ctx)
    expect(ctx.globalOptions.has('simple')).toBe(true)
  })

  test('plugin with name and extension properties', async () => {
    const pluginFn = async (ctx: PluginContext) => {
      ctx.addGlobalOption('extended', { type: 'string' })
    }

    // use Object.defineProperty to add properties
    Object.defineProperty(pluginFn, 'name', {
      value: 'extended-plugin',
      writable: false,
      enumerable: true,
      configurable: true
    })

    Object.defineProperty(pluginFn, 'extension', {
      value: {
        key: Symbol('extended-plugin'),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        factory: (_core: any) => ({ extended: true })
      },
      writable: false,
      enumerable: true,
      configurable: true
    })

    const pluginWithExtension = pluginFn as Plugin

    expect(pluginWithExtension.name).toBe('extended-plugin')
    expect(pluginWithExtension.extension).toBeDefined()
    expect(typeof pluginWithExtension.extension?.key).toBe('symbol')
  })
})

describe('ContextExtension type', () => {
  test('extension key is unique symbol', () => {
    const extension1: ContextExtension = {
      key: Symbol('test1'),
      factory: () => ({ value: 1 })
    }

    const extension2: ContextExtension = {
      key: Symbol('test2'),
      factory: () => ({ value: 2 })
    }

    expect(extension1.key).not.toBe(extension2.key)
  })

  test('extension factory can return complex objects', () => {
    const dbExtension: ContextExtension<{
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query: (sql: string) => Promise<any>
      transaction: (fn: () => Promise<void>) => Promise<void>
    }> = {
      key: Symbol('db'),
      factory: _core => ({
        query: async (_sql: string) => {
          return { rows: [], count: 0 }
        },
        transaction: async (fn: () => Promise<void>) => {
          await fn()
        }
      })
    }

    const mockCore = createMockCommandContext()
    const db = dbExtension.factory(mockCore)

    expect(typeof db.query).toBe('function')
    expect(typeof db.transaction).toBe('function')
  })
})
