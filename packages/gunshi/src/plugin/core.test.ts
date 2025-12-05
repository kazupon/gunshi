import { describe, expect, expectTypeOf, test, vi } from 'vitest'
import { createCommandContext } from '../context.ts'
import { createDecorators } from '../decorators.ts'
import { define, defineWithTypes } from '../definition.ts'
import { createPluginContext } from './context.ts'
import { plugin } from './core.ts'

import type { Args } from 'args-tokens'
import type { Command, CommandContextCore, GunshiParams } from '../types.ts'
import type { PluginContext } from './context.ts'
import type { Plugin } from './core.ts'

describe('PluginContext#addGlobalOpttion', () => {
  test('basic', () => {
    const decorators = createDecorators()
    const ctx = createPluginContext(decorators)
    ctx.addGlobalOption('foo', { type: 'string', description: 'foo option' })

    expect(ctx.globalOptions.size).toBe(1)
    expect(ctx.globalOptions.get('foo')).toEqual({
      type: 'string',
      description: 'foo option'
    })
  })

  test('name empty', () => {
    const decorators = createDecorators()
    const ctx = createPluginContext(decorators)

    expect(() => ctx.addGlobalOption('', { type: 'string' })).toThrow(
      'Option name must be a non-empty string'
    )
  })

  test('duplicate name', () => {
    const decorators = createDecorators()
    const ctx = createPluginContext(decorators)
    ctx.addGlobalOption('foo', { type: 'string', description: 'foo option' })

    expect(() => ctx.addGlobalOption('foo', { type: 'string' })).toThrow(
      `Global option 'foo' is already registered`
    )
  })
})

type Auth = {
  auth: {
    token: string
    login: () => string
  }
}
type Logger = {
  loggler: {
    log: (msg: string) => void
    level: string
  }
}

test('PluginContext#decorateHeaderRenderer', async () => {
  const decorators = createDecorators<GunshiParams<{ args: Args; extensions: Auth }>>()
  const ctx = createPluginContext<GunshiParams<{ args: Args; extensions: Auth }>>(decorators)

  ctx.decorateHeaderRenderer<Logger>(async (baseRenderer, cmdCtx) => {
    const result = await baseRenderer(cmdCtx)

    expectTypeOf(cmdCtx.extensions).toEqualTypeOf<Auth & Logger>()
    return `[DECORATED] ${result}`
  })

  const renderer = decorators.getHeaderRenderer()
  const mockCtx = await createCommandContext<GunshiParams<{ args: Args; extensions: Auth }>>({})
  const result = await renderer(mockCtx)

  expect(result).toBe('[DECORATED] ')
})

test('PluginContext#decorateUsageRenderer', async () => {
  const decorators = createDecorators<GunshiParams<{ args: Args; extensions: Auth }>>()
  const ctx = createPluginContext<GunshiParams<{ args: Args; extensions: Auth }>>(decorators)

  ctx.decorateUsageRenderer<Logger>(async (baseRenderer, cmdCtx) => {
    const result = await baseRenderer(cmdCtx)

    expectTypeOf(cmdCtx.extensions).toEqualTypeOf<Auth & Logger>()

    return `[USAGE] ${result}`
  })

  const renderer = decorators.getUsageRenderer()
  const mockCtx = await createCommandContext<GunshiParams<{ args: Args; extensions: Auth }>>({})
  const result = await renderer(mockCtx)

  expect(result).toBe('[USAGE] ')
})

test('PluginContext#decorateValidationErrorsRenderer', async () => {
  const decorators = createDecorators<GunshiParams<{ args: Args; extensions: Auth }>>()
  const ctx = createPluginContext<GunshiParams<{ args: Args; extensions: Auth }>>(decorators)

  ctx.decorateValidationErrorsRenderer<Logger>(async (baseRenderer, cmdCtx, error) => {
    const result = await baseRenderer(cmdCtx, error)

    expectTypeOf(cmdCtx.extensions).toEqualTypeOf<Auth & Logger>()

    return `[ERROR] ${result}`
  })

  const renderer = decorators.getValidationErrorsRenderer()
  const mockCtx = await createCommandContext<GunshiParams<{ args: Args; extensions: Auth }>>({})
  const error = new AggregateError([new Error('Test')], 'Validation failed')
  const result = await renderer(mockCtx, error)

  expect(result).toBe('[ERROR] ')
})

test('PluginContext#decorateCommand', async () => {
  const decorators = createDecorators<GunshiParams<{ args: Args; extensions: Auth }>>()
  const ctx = createPluginContext<GunshiParams<{ args: Args; extensions: Auth }>>(decorators)

  ctx.decorateCommand<Logger>(baseRunner => async ctx => {
    const result = await baseRunner(ctx)

    expectTypeOf(ctx.extensions).toEqualTypeOf<Auth & Logger>()

    return `[USAGE] ${result as string}`
  })

  const runner = decorators.commandDecorators[0]
  const mockCtx = await createCommandContext<GunshiParams<{ args: Args; extensions: Auth }>>({})
  const result = await runner(_ctx => '[TEST]')(mockCtx)

  expect(result).toBe('[USAGE] [TEST]')
})

describe('plugin function', () => {
  test('basic - creates plugin with extension', async () => {
    const extensionFactory = vi.fn((_core: CommandContextCore<GunshiParams>) => ({
      getValue: () => 'test-value' as const,
      isEnabled: true
    }))

    const setupFn = vi.fn((ctx: PluginContext) => {
      ctx.addGlobalOption('test', { type: 'string' })
    })

    const testPlugin = plugin({
      id: 'test',
      name: 'test',
      setup: setupFn,
      extension: extensionFactory,
      onExtension: ctx => {
        expectTypeOf(ctx.extensions.test).toEqualTypeOf<ReturnType<typeof extensionFactory>>()
      }
    })

    // check plugin properties
    expect(testPlugin.id).toBe('test')
    expect(testPlugin.name).toBe('test')
    expect(testPlugin.extension).toBeDefined()
    expect(testPlugin.extension.key).toBeDefined()
    expect(typeof testPlugin.extension.key).toBe('symbol')
    expect(testPlugin.extension.key.description).toBe('test')
    expect(testPlugin.extension.factory).toBe(extensionFactory)

    // check that setup function is callable
    const decorators = createDecorators()
    const ctx = createPluginContext(decorators)
    await testPlugin(ctx)
    expect(setupFn).toHaveBeenCalledWith(ctx)
  })

  test('without extension', async () => {
    const setupFn = vi.fn((ctx: PluginContext) => {
      ctx.addGlobalOption('simple', { type: 'boolean' })
    })

    const simplePlugin = plugin({
      id: 'simple-plugin',
      name: 'simple-plugin',
      setup: setupFn
    })

    expect(simplePlugin.id).toBe('simple-plugin')
    expect(simplePlugin.name).toBe('simple-plugin')
    expect(simplePlugin.extension).toBeDefined()

    // check that setup function is callable
    const decorators = createDecorators()
    const ctx = createPluginContext(decorators)
    await simplePlugin(ctx)
    expect(setupFn).toHaveBeenCalledWith(ctx)
  })

  test('receives correct context via extension', async () => {
    const mockCore = await createCommandContext({})
    const extensionFactory = vi.fn((core: CommandContextCore<GunshiParams>) => ({
      user: { id: 1, name: 'Test User' },
      getToken: () => core.values.token as string
    }))

    const testPlugin = plugin({
      id: 'auth',
      name: 'auth',
      extension: extensionFactory,
      setup(ctx) {
        ctx.addGlobalOption('token', { type: 'string' })
        ctx.decorateHeaderRenderer(async (baseRenderer, cmdCtx) => {
          const user = cmdCtx.extensions.auth.user

          expectTypeOf(cmdCtx.extensions).toEqualTypeOf<{
            auth: ReturnType<typeof extensionFactory>
          }>()

          console.log(`User: ${user.name} (${user.id})`)
          return await baseRenderer(cmdCtx)
        })
        ctx.decorateCommand(baseRunner => async ctx => {
          expectTypeOf(ctx.extensions).toEqualTypeOf<{
            auth: ReturnType<typeof extensionFactory>
          }>()

          const result = await baseRunner(ctx)
          return `[AUTH] ${result as string}`
        })
      }
    })

    // test extension factory
    const extension = testPlugin.extension
    const command = {} as Command
    const result = await extension.factory(mockCore, command)

    expect(extensionFactory).toHaveBeenCalledWith(mockCore, command)
    expect(result.user).toEqual({ id: 1, name: 'Test User' })
    expect(typeof result.getToken).toBe('function')
  })

  test('not receives correct context via extension', () => {
    const testPlugin = plugin({
      id: 'auth',
      name: 'auth',
      setup: ctx => {
        ctx.addGlobalOption('token', { type: 'string' })
        ctx.decorateUsageRenderer(async (baseRenderer, cmdCtx) => {
          expectTypeOf(cmdCtx.extensions).toEqualTypeOf<{ auth: {} }>()

          return await baseRenderer(cmdCtx)
        })
        ctx.decorateValidationErrorsRenderer(async (baseRenderer, cmdCtx, error) => {
          expectTypeOf(cmdCtx.extensions).toEqualTypeOf<{ auth: {} }>()

          return await baseRenderer(cmdCtx, error)
        })
      }
    })
    expect(testPlugin.extension).toBeDefined()
  })
})

describe('Plugin type with optional properties', () => {
  test('backward compatibility - simple function plugin', async () => {
    const simplePlugin = Object.assign(
      (ctx: PluginContext) => {
        ctx.addGlobalOption('simple', { type: 'string' })
      },
      { id: 'simple' }
    ) as Plugin

    const decorators = createDecorators()
    const ctx = createPluginContext(decorators)

    // should work without name or extension
    await simplePlugin(ctx)
    expect(ctx.globalOptions.has('simple')).toBe(true)
  })

  test('plugin with name and extension properties', () => {
    type Extension = { extended: boolean }
    const pluginFn = (ctx: PluginContext) => {
      ctx.addGlobalOption('extended', { type: 'string' })
    }
    // use Object.defineProperty to add properties
    Object.defineProperty(pluginFn, 'id', {
      value: 'extended-plugin',
      writable: false,
      enumerable: true,
      configurable: true
    })
    Object.defineProperty(pluginFn, 'name', {
      value: 'extended-plugin',
      writable: false,
      enumerable: true,
      configurable: true
    })
    Object.defineProperty(pluginFn, 'extension', {
      value: {
        key: Symbol('extended-plugin'),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): for test codes
        factory: (_core: any) => ({ extended: true })
      },
      writable: false,
      enumerable: true,
      configurable: true
    })

    const pluginWithExtension = pluginFn as Plugin<Extension>

    expect(pluginWithExtension.id).toBe('extended-plugin')
    expect(pluginWithExtension.name).toBe('extended-plugin')
    expect(pluginWithExtension.extension).toBeDefined()
    expect(typeof pluginWithExtension.extension?.key).toBe('symbol')
    expect(typeof pluginWithExtension.extension?.factory).toBe('function')
  })
})

describe('Plugin Extensions Integration', () => {
  test('plugin with extension provides functionality to commands', async () => {
    // create a plugin with extension
    const testPlugin = plugin({
      id: 'test',
      name: 'test',
      setup(ctx) {
        ctx.addGlobalOption('test-opt', {
          type: 'string',
          default: 'default-value'
        })
      },
      extension: (
        core: CommandContextCore
      ): {
        getValue: () => string
        doubled: (n: number) => number
        asyncOp: () => Promise<string>
      } => {
        return {
          getValue: () => (core.values['test-opt'] as string) || 'default-value',
          doubled: (n: number) => n * 2,
          asyncOp() {
            return Promise.resolve('async-result')
          }
        }
      }
    })

    const args = {
      num: { type: 'number', default: 5 },
      'test-opt': { type: 'string', default: 'custom' }
    } satisfies Args

    type TestExtension = Awaited<ReturnType<typeof testPlugin.extension.factory>>

    // create a command that uses the extension
    const testCommand = defineWithTypes<{ extensions: { test: TestExtension } }>()({
      name: 'test-cmd',
      args,
      async run(ctx) {
        const value = ctx.extensions.test.getValue()
        const doubled = ctx.extensions.test.doubled(ctx.values.num)
        const asyncResult = await ctx.extensions.test.asyncOp()
        return `${value}:${doubled}:${asyncResult}`
      }
    })

    // create command context directly
    const ctx = await createCommandContext<{
      args: typeof args
      extensions: { test: TestExtension }
    }>({
      args,
      explicit: { num: false, 'test-opt': false },
      values: { 'test-opt': 'custom', num: 5 },
      positionals: [],
      rest: [],
      argv: [],
      tokens: [],
      command: testCommand,
      extensions: { test: testPlugin.extension },
      omitted: false,
      callMode: 'entry',
      cliOptions: {}
    })

    // execute command
    const result = await testCommand.run(ctx)
    expect(result).toBe('custom:10:async-result')
  })

  test('multiple plugins with extensions work together', async () => {
    // auth plugin
    const authExtension = vi.fn((core: CommandContextCore) => ({
      getUser: () => core.values.user || 'guest',
      isAdmin: () => core.values.user === 'admin'
    }))
    const authPlugin = plugin({
      id: 'auth',
      name: 'auth',
      setup(ctx) {
        ctx.addGlobalOption('user', { type: 'string', default: 'guest' })
      },
      extension: authExtension
    })

    // logger plugin
    const logs = [] as string[]
    const loggerExtension = vi.fn((core: CommandContextCore) => ({
      log: (msg: string) => logs.push(`[${core.values['log-level'] || 'info'}] ${msg}`),
      getLogs: (): string[] => logs
    }))
    const loggerPlugin = plugin({
      id: 'logger',
      name: 'logger',
      setup(ctx) {
        ctx.addGlobalOption('log-level', { type: 'string', default: 'info' })
      },
      extension: loggerExtension
    })

    type ExtendContext = {
      auth: Awaited<ReturnType<typeof authPlugin.extension.factory>>
      logger: Awaited<ReturnType<typeof loggerPlugin.extension.factory>>
    }

    // command using both extensions
    const multiCommand = defineWithTypes<{ extensions: ExtendContext }>()({
      name: 'multi',
      run(ctx) {
        ctx.extensions.logger.log(`User ${ctx.extensions.auth.getUser()} executed command`)
        if (ctx.extensions.auth.isAdmin()) {
          ctx.extensions.logger.log('Admin access granted')
        }
        return ctx.extensions.logger.getLogs().join('; ')
      }
    })

    // create command context directly
    const ctx = await createCommandContext({
      values: { user: 'admin', 'log-level': 'debug' },
      command: multiCommand,
      extensions: { auth: authPlugin.extension, logger: loggerPlugin.extension }
    })

    const result = multiCommand.run(ctx)
    expect(result).toBe('[debug] User admin executed command; [debug] Admin access granted')
  })

  test('commands without extensions work normally', async () => {
    // regular command without extensions
    const regularCommand = define({
      name: 'regular',
      args: {
        msg: { type: 'string', default: 'hello' },
        upper: { type: 'boolean', default: false }
      },
      run(ctx) {
        return ctx.values.upper ? ctx.values.msg.toUpperCase() : ctx.values.msg
      }
    })

    // create command context directly
    const ctx = await createCommandContext({
      args: {
        msg: { type: 'string', default: 'hello' },
        upper: { type: 'boolean', default: false }
      },
      explicit: { msg: false, upper: true },
      values: { msg: 'hello', upper: true },
      command: regularCommand
    })

    const result = regularCommand.run(ctx)
    expect(result).toBe('HELLO')
  })

  test('extension can access all context properties', async () => {
    const capturedContext = vi.fn()
    const onExtension = vi.fn()

    const contextPlugin = plugin({
      id: 'context',
      name: 'context',
      setup: () => {},
      extension(core: CommandContextCore) {
        expect(core.extensions).toBeDefined()

        capturedContext({
          name: core.name,
          hasValues: !!core.values
        })
        return { captured: true }
      },
      onExtension
    })

    const contextCommand = defineWithTypes<{
      extensions: {
        ctx: Awaited<ReturnType<typeof contextPlugin.extension.factory>>
      }
    }>()({
      name: 'ctx-test',
      run(ctx) {
        return String(ctx.extensions.ctx.captured)
      }
    })

    const ctx = await createCommandContext({
      command: contextCommand,
      extensions: {
        ctx: contextPlugin.extension
      }
    })
    contextCommand.run(ctx)

    expect(capturedContext).toHaveBeenCalledWith({
      name: 'ctx-test',
      hasValues: true
    })
    expect(onExtension).toHaveBeenCalledWith(ctx, contextCommand)
  })
})
