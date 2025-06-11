import { describe, expect, test, vi } from 'vitest'
import { createMockCommandContext } from '../test/utils.ts'
import { createCommandContext } from './context.ts'
import { Decorators } from './decorators.ts'
import { define } from './definition.ts'
import { PluginContext, plugin } from './plugin.ts'

import type { Plugin } from './plugin.ts'
import type { CommandContextExtension } from './types.ts'

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

describe('CommandContextExtension type', () => {
  test('extension key is unique symbol', () => {
    const extension1: CommandContextExtension = {
      key: Symbol('test1'),
      factory: () => ({ value: 1 })
    }

    const extension2: CommandContextExtension = {
      key: Symbol('test2'),
      factory: () => ({ value: 2 })
    }

    expect(extension1.key).not.toBe(extension2.key)
  })

  test('extension factory can return complex objects', () => {
    const dbExtension: CommandContextExtension<{
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

describe('Plugin Extensions Integration', () => {
  test('plugin with extension provides functionality to commands', async () => {
    // Create a plugin with extension
    const testPlugin = plugin({
      name: 'test',
      setup(ctx) {
        ctx.addGlobalOption('test-opt', {
          type: 'string',
          default: 'default-value'
        })
      },
      extension(core) {
        return {
          getValue: () => core.values['test-opt'] || 'default-value',
          doubled: (n: number) => n * 2,
          async asyncOp() {
            return 'async-result'
          }
        }
      }
    })

    // Create a command that uses the extension
    const testCommand = define({
      name: 'test-cmd',
      args: {
        num: { type: 'number', default: 5 }
      },
      extensions: {
        test: testPlugin.extension!
      },
      // TODO: resolve type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async run(ctx: any) {
        const value = ctx.ext.test.getValue()
        const doubled = ctx.ext.test.doubled(ctx.values.num!)
        const asyncResult = await ctx.ext.test.asyncOp()

        return `${value}:${doubled}:${asyncResult}`
      }
    })

    // Create command context directly
    const ctx = await createCommandContext({
      args: { num: { type: 'number', default: 5 } },
      values: { 'test-opt': 'custom', num: 5 },
      positionals: [],
      rest: [],
      argv: [],
      tokens: [],
      // @ts-expect-error // TODO(kazupon): resolve type
      command: testCommand,
      omitted: false,
      callMode: 'entry',
      cliOptions: {}
    })

    // execute command
    // TODO(kazupon): resolve type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await testCommand.run!(ctx as any)
    expect(result).toBe('custom:10:async-result')
  })

  test('multiple plugins with extensions work together', async () => {
    // Auth plugin
    const authPlugin = plugin({
      name: 'auth',
      setup(ctx) {
        ctx.addGlobalOption('user', { type: 'string', default: 'guest' })
      },
      extension(core) {
        return {
          getUser: () => core.values.user || 'guest',
          isAdmin: () => core.values.user === 'admin'
        }
      }
    })

    // Logger plugin
    const loggerPlugin = plugin({
      name: 'logger',
      setup(ctx) {
        ctx.addGlobalOption('log-level', { type: 'string', default: 'info' })
      },
      extension(core) {
        const logs: string[] = []
        return {
          log: (msg: string) => logs.push(`[${core.values['log-level'] || 'info'}] ${msg}`),
          getLogs: () => logs
        }
      }
    })

    // Command using both extensions
    const multiCommand = define({
      name: 'multi',
      extensions: {
        auth: authPlugin.extension!,
        logger: loggerPlugin.extension!
      },
      // TODO(kazupon): resolve type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      run(ctx: any) {
        ctx.ext.logger.log(`User ${ctx.ext.auth.getUser()} executed command`)
        if (ctx.ext.auth.isAdmin()) {
          ctx.ext.logger.log('Admin access granted')
        }
        return ctx.ext.logger.getLogs().join('; ')
      }
    })

    // Create command context directly
    const ctx = await createCommandContext({
      args: {},
      values: { user: 'admin', 'log-level': 'debug' },
      positionals: [],
      rest: [],
      argv: [],
      tokens: [],
      // @ts-expect-error // TODO(kazupon): resolve type
      command: multiCommand,
      omitted: false,
      callMode: 'entry',
      cliOptions: {}
    })

    // TODO(kazupon): resolve type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await multiCommand.run!(ctx as any)
    expect(result).toBe('[debug] User admin executed command; [debug] Admin access granted')
  })

  test('commands without extensions work normally', async () => {
    // Regular command without extensions
    const regularCommand = define({
      name: 'regular',
      args: {
        msg: { type: 'string', default: 'hello' },
        upper: { type: 'boolean', default: false }
      },
      // TODO(kazupon): resolve type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      run(ctx: any) {
        return ctx.values.upper ? ctx.values.msg!.toUpperCase() : ctx.values.msg!
      }
    })

    // Create command context directly
    const ctx = await createCommandContext({
      args: {
        msg: { type: 'string', default: 'hello' },
        upper: { type: 'boolean', default: false }
      },
      values: { msg: 'hello', upper: true },
      positionals: [],
      rest: [],
      argv: [],
      tokens: [],
      command: regularCommand,
      omitted: false,
      callMode: 'entry',
      cliOptions: {}
    })

    const result = await regularCommand.run!(ctx)
    expect(result).toBe('HELLO')
  })

  test('extension can access all context properties', async () => {
    const capturedContext = vi.fn()

    const contextPlugin = plugin({
      name: 'context',
      setup() {},
      extension(core) {
        capturedContext({
          name: core.name,
          locale: core.locale.toString(),
          hasValues: !!core.values,
          hasTranslate: typeof core.translate === 'function'
        })
        return { captured: true }
      }
    })

    const contextCommand = define({
      name: 'ctx-test',
      extensions: {
        ctx: contextPlugin.extension!
      },
      // TODO(kazupon): resolve type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      run(ctx: any) {
        return String(ctx.ext.ctx.captured)
      }
    })

    const ctx = await createCommandContext({
      args: {},
      values: {},
      positionals: [],
      rest: [],
      argv: [],
      tokens: [],
      // @ts-expect-error // TODO(kazupon): resolve type
      command: contextCommand,
      omitted: false,
      callMode: 'entry',
      cliOptions: {}
    })

    // TODO(kazupon): resolve type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await contextCommand.run!(ctx as any)

    expect(capturedContext).toHaveBeenCalledWith({
      name: 'ctx-test',
      locale: 'en-US',
      hasValues: true,
      hasTranslate: true
    })
  })
})
