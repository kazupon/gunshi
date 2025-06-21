import { describe, expect, expectTypeOf, test, vi } from 'vitest'
import { createMockCommandContext } from '../test/utils.ts'
import { createCommandContext } from './context.ts'
import { Decorators } from './decorators.ts'
import { define } from './definition.ts'
import { PluginContext, plugin, resolveDependencies } from './plugin.ts'

import type { Args } from 'args-tokens'
import type { Plugin } from './plugin.ts'
import type { Command, CommandContextCore, GunshiParams } from './types.ts'

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

type Auth = { token: string; login: () => string }
type Logger = { log: (msg: string) => void; level: string }

test('PluginContext#decorateHeaderRenderer', async () => {
  const decorators = new Decorators<GunshiParams<{ args: Args; extensions: Auth }>>()
  const ctx = new PluginContext<GunshiParams<{ args: Args; extensions: Auth }>>(decorators)

  ctx.decorateHeaderRenderer<Logger>(async (baseRenderer, cmdCtx) => {
    const result = await baseRenderer(cmdCtx)
    expectTypeOf(cmdCtx.extensions).toEqualTypeOf<Auth & Logger>()
    return `[DECORATED] ${result}`
  })

  const renderer = decorators.getHeaderRenderer()
  const mockCtx =
    createMockCommandContext<GunshiParams<{ args: Args; extensions: Auth }>['extensions']>()
  const result = await renderer(mockCtx)

  expect(result).toBe('[DECORATED] ')
})

test('PluginContext#decorateUsageRenderer', async () => {
  const decorators = new Decorators<GunshiParams<{ args: Args; extensions: Auth }>>()
  const ctx = new PluginContext<GunshiParams<{ args: Args; extensions: Auth }>>(decorators)

  ctx.decorateUsageRenderer<Logger>(async (baseRenderer, cmdCtx) => {
    const result = await baseRenderer(cmdCtx)
    expectTypeOf(cmdCtx.extensions).toEqualTypeOf<Auth & Logger>()
    return `[USAGE] ${result}`
  })

  const renderer = decorators.getUsageRenderer()
  const mockCtx = createMockCommandContext<Auth>()
  const result = await renderer(mockCtx)

  expect(result).toBe('[USAGE] ')
})

test('PluginContext#decorateValidationErrorsRenderer', async () => {
  const decorators = new Decorators<GunshiParams<{ args: Args; extensions: Auth }>>()
  const ctx = new PluginContext<GunshiParams<{ args: Args; extensions: Auth }>>(decorators)

  ctx.decorateValidationErrorsRenderer<Logger>(async (baseRenderer, cmdCtx, error) => {
    const result = await baseRenderer(cmdCtx, error)
    expectTypeOf(cmdCtx.extensions).toEqualTypeOf<Auth & Logger>()
    return `[ERROR] ${result}`
  })

  const renderer = decorators.getValidationErrorsRenderer()
  const mockCtx =
    createMockCommandContext<GunshiParams<{ args: Args; extensions: Auth }>['extensions']>()
  const error = new AggregateError([new Error('Test')], 'Validation failed')
  const result = await renderer(mockCtx, error)

  expect(result).toBe('[ERROR] ')
})

test('PluginContext#decorateCommand', async () => {
  const decorators = new Decorators<GunshiParams<{ args: Args; extensions: Auth }>>()
  const ctx = new PluginContext<GunshiParams<{ args: Args; extensions: Auth }>>(decorators)

  ctx.decorateCommand<Logger>(baseRunner => async ctx => {
    const result = await baseRunner(ctx)
    expectTypeOf(ctx.extensions).toEqualTypeOf<Auth & Logger>()
    return `[USAGE] ${result}`
  })

  const runner = decorators.commandDecorators[0]
  const mockCtx =
    createMockCommandContext<GunshiParams<{ args: Args; extensions: Auth }>['extensions']>()
  const result = await runner(_ctx => '[TEST]')(mockCtx)

  expect(result).toBe('[USAGE] [TEST]')
})

describe('plugin function', () => {
  test('basic - creates plugin with extension', async () => {
    const extensionFactory = vi.fn((_core: CommandContextCore<GunshiParams>) => ({
      getValue: () => 'test-value' as const,
      isEnabled: true
    }))

    const setupFn = vi.fn(async (ctx: PluginContext) => {
      ctx.addGlobalOption('test', { type: 'string' })
    })

    const testPlugin = plugin({
      name: 'test',
      setup: setupFn,
      extension: extensionFactory
    })

    // check plugin properties
    expect(testPlugin.name).toBe('test')
    expect(testPlugin.extension).toBeDefined()
    expect(testPlugin.extension.key).toBeDefined()
    expect(typeof testPlugin.extension.key).toBe('symbol')
    expect(testPlugin.extension.key.description).toBe('test')
    expect(testPlugin.extension.factory).toBe(extensionFactory)

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

  test('receives correct context via extension', async () => {
    const mockCore = createMockCommandContext()
    const extensionFactory = vi.fn(core => ({
      user: { id: 1, name: 'Test User' },
      getToken: () => core.values.token as string
    }))

    const testPlugin = plugin({
      name: 'auth',
      extension: extensionFactory,
      async setup(ctx) {
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
          return `[AUTH] ${result}`
        })
      }
    })

    // test extension factory
    const extension = testPlugin.extension
    const result = extension.factory(mockCore)

    expect(extensionFactory).toHaveBeenCalledWith(mockCore)
    expect(result.user).toEqual({ id: 1, name: 'Test User' })
    expect(typeof result.getToken).toBe('function')
  })

  test('not receives correct context via extension', async () => {
    const testPlugin = plugin({
      name: 'auth',
      setup: async ctx => {
        ctx.addGlobalOption('token', { type: 'string' })
        ctx.decorateUsageRenderer(async (baseRenderer, cmdCtx) => {
          expectTypeOf(cmdCtx.extensions).toEqualTypeOf<undefined>()
          return await baseRenderer(cmdCtx)
        })
        ctx.decorateValidationErrorsRenderer(async (baseRenderer, cmdCtx, error) => {
          expectTypeOf(cmdCtx.extensions).toEqualTypeOf<undefined>()
          return await baseRenderer(cmdCtx, error)
        })
      }
    })
    expect(testPlugin.extension).toBeUndefined()
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
    type Extension = { extended: boolean }
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

    const pluginWithExtension = pluginFn as Plugin<Extension>

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
      name: 'test',
      setup(ctx) {
        ctx.addGlobalOption('test-opt', {
          type: 'string',
          default: 'default-value'
        })
      },
      extension: (
        core: CommandContextCore<GunshiParams>
      ): {
        getValue: () => string
        doubled: (n: number) => number
        asyncOp: () => Promise<string>
      } => {
        return {
          getValue: () => (core.values['test-opt'] as string) || 'default-value',
          doubled: (n: number) => n * 2,
          async asyncOp() {
            return 'async-result'
          }
        }
      }
    })

    const args = {
      num: { type: 'number', default: 5 },
      'test-opt': { type: 'string', default: 'custom' }
    } satisfies Args

    type TestExtension = ReturnType<typeof testPlugin.extension.factory>

    // create a command that uses the extension
    const testCommand = define<
      GunshiParams<{ args: typeof args; extensions: { test: TestExtension } }>
    >({
      name: 'test-cmd',
      args,
      async run(ctx) {
        const value = ctx.extensions.test.getValue()
        const doubled = ctx.extensions.test.doubled(ctx.values.num!)
        const asyncResult = await ctx.extensions.test.asyncOp()
        return `${value}:${doubled}:${asyncResult}`
      }
    })

    // create command context directly
    const ctx = await createCommandContext<
      GunshiParams<{ args: typeof args; extensions: { test: TestExtension } }>
    >({
      args,
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
    const result = await testCommand.run!(ctx)
    expect(result).toBe('custom:10:async-result')
  })

  test('multiple plugins with extensions work together', async () => {
    // auth plugin
    const authExtension = vi.fn((core: CommandContextCore<GunshiParams>) => ({
      getUser: () => core.values.user || 'guest',
      isAdmin: () => core.values.user === 'admin'
    }))
    const authPlugin = plugin({
      name: 'auth',
      setup(ctx) {
        ctx.addGlobalOption('user', { type: 'string', default: 'guest' })
      },
      extension: authExtension
    })

    // logger plugin
    const logs = [] as string[]
    const loggerExtension = vi.fn((core: CommandContextCore<GunshiParams>) => ({
      log: (msg: string) => logs.push(`[${core.values['log-level'] || 'info'}] ${msg}`),
      getLogs: (): string[] => logs
    }))
    const loggerPlugin = plugin({
      name: 'logger',
      setup(ctx) {
        ctx.addGlobalOption('log-level', { type: 'string', default: 'info' })
      },
      extension: loggerExtension
    })

    type ExtendContext = {
      auth: ReturnType<typeof authPlugin.extension.factory>
      logger: ReturnType<typeof loggerPlugin.extension.factory>
    }

    // command using both extensions
    const multiCommand = define<GunshiParams<{ args: Args; extensions: ExtendContext }>>({
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
      args: {} as Args,
      values: { user: 'admin', 'log-level': 'debug' },
      positionals: [],
      rest: [],
      argv: [],
      tokens: [],
      command: multiCommand as Command<GunshiParams<{ args: Args }>>,
      extensions: { auth: authPlugin.extension, logger: loggerPlugin.extension },
      omitted: false,
      callMode: 'entry',
      cliOptions: {}
    })

    const result = await multiCommand.run!(ctx)
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
      setup: () => {},
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

    const contextCommand = define<
      GunshiParams<{
        args: Args
        extensions: { ctx: ReturnType<typeof contextPlugin.extension.factory> }
      }>
    >({
      name: 'ctx-test',
      run(ctx) {
        return String(ctx.extensions.ctx.captured)
      }
    })

    const ctx = await createCommandContext({
      args: {} as Args,
      values: {},
      positionals: [],
      rest: [],
      argv: [],
      tokens: [],
      command: contextCommand as Command<GunshiParams<Args>>,
      extensions: {
        ctx: contextPlugin.extension
      },
      omitted: false,
      callMode: 'entry',
      cliOptions: {}
    })

    await contextCommand.run!(ctx)

    expect(capturedContext).toHaveBeenCalledWith({
      name: 'ctx-test',
      locale: 'en-US',
      hasValues: true,
      hasTranslate: true
    })
  })
})

describe('resolveDependencies', () => {
  test('return plugins in correct order with no dependencies', () => {
    const pluginA = plugin({ name: 'a' })
    const pluginB = plugin({ name: 'b' })
    const pluginC = plugin({ name: 'c' })

    const result = resolveDependencies([pluginA, pluginB, pluginC])

    expect(result).toEqual([pluginA, pluginB, pluginC])
  })

  test('resolve simple dependencies', () => {
    const pluginA = plugin({ name: 'a' })
    const pluginB = plugin({ name: 'b', dependencies: ['a'] })
    const pluginC = plugin({ name: 'c', dependencies: ['b'] })

    const result = resolveDependencies([pluginC, pluginB, pluginA])

    expect(result.map(p => p.name)).toEqual(['a', 'b', 'c'])
  })

  test('resolve complex dependencies', () => {
    const pluginA = plugin({ name: 'a' })
    const pluginB = plugin({ name: 'b', dependencies: ['a'] })
    const pluginC = plugin({ name: 'c', dependencies: ['a'] })
    const pluginD = plugin({ name: 'd', dependencies: ['b', 'c'] })

    const result = resolveDependencies([pluginD, pluginC, pluginB, pluginA])

    const names = result.map(p => p.name)
    expect(names[0]).toBe('a')
    expect(names.indexOf('b')).toBeGreaterThan(names.indexOf('a'))
    expect(names.indexOf('c')).toBeGreaterThan(names.indexOf('a'))
    expect(names.indexOf('d')).toBeGreaterThan(names.indexOf('b'))
    expect(names.indexOf('d')).toBeGreaterThan(names.indexOf('c'))
  })

  test('handle plugins with PluginDependency objects', () => {
    const pluginA = plugin({ name: 'a' })
    const pluginB = plugin({
      name: 'b',
      dependencies: [{ name: 'a', optional: false }]
    })

    const result = resolveDependencies([pluginB, pluginA])

    expect(result.map(p => p.name)).toEqual(['a', 'b'])
  })

  test('handle optional dependencies when plugin is missing', () => {
    const pluginA = plugin({ name: 'a' })
    const pluginB = plugin({
      name: 'b',
      dependencies: [{ name: 'missing', optional: true }]
    })

    const result = resolveDependencies([pluginB, pluginA])

    expect(result.map(p => p.name)).toEqual(['b', 'a'])
  })

  test('handle optional dependencies when plugin exists', () => {
    const pluginA = plugin({ name: 'a' })
    const pluginB = plugin({
      name: 'b',
      dependencies: [{ name: 'a', optional: true }]
    })

    const result = resolveDependencies([pluginB, pluginA])

    expect(result.map(p => p.name)).toEqual(['a', 'b'])
  })

  test('throw error for missing required dependency', () => {
    const pluginB = plugin({ name: 'b', dependencies: ['a'] })

    expect(() => resolveDependencies([pluginB])).toThrow('Missing required dependency: a')
  })

  test('throw error for circular dependency', () => {
    const pluginA = plugin({ name: 'a', dependencies: ['b'] })
    const pluginB = plugin({ name: 'b', dependencies: ['a'] })

    expect(() => resolveDependencies([pluginA, pluginB])).toThrow('Circular dependency detected: a')
  })

  test('throw error for self-dependency', () => {
    const pluginA = plugin({ name: 'a', dependencies: ['a'] })

    expect(() => resolveDependencies([pluginA])).toThrow('Circular dependency detected: a')
  })

  test('handle plugins without names', () => {
    const pluginA = plugin({ name: 'a' })
    const pluginB = {} as Plugin
    const pluginC = plugin({ name: 'c', dependencies: ['a'] })

    const result = resolveDependencies([pluginB, pluginC, pluginA])

    expect(result.filter(p => p.name).map(p => p.name)).toEqual(['a', 'c'])
  })

  test('handle PluginDependency objects array', () => {
    const pluginA = plugin({ name: 'a' })
    const pluginB = plugin({ name: 'b' })
    const pluginC = plugin({
      name: 'c',
      dependencies: ['a', { name: 'b', optional: false }, { name: 'missing', optional: true }]
    })

    const result = resolveDependencies([pluginC, pluginB, pluginA])

    expect(result.map(p => p.name)).toEqual(['a', 'b', 'c'])
  })

  test('handle duplicate plugins in the list', () => {
    const pluginA = plugin({ name: 'a' })
    const pluginB = plugin({ name: 'b', dependencies: ['a'] })

    const result = resolveDependencies([pluginA, pluginB, pluginA])

    expect(result.map(p => p.name)).toEqual(['a', 'b'])
  })

  test('resolve dependencies with version field (for future use)', () => {
    const pluginA = plugin({ name: 'a' })
    const pluginB = plugin({
      name: 'b',
      dependencies: [{ name: 'a', version: '1.0.0' }]
    })

    const result = resolveDependencies([pluginB, pluginA])

    expect(result.map(p => p.name)).toEqual(['a', 'b'])
  })

  test('handle empty plugin array', () => {
    const result = resolveDependencies([])

    expect(result).toEqual([])
  })

  test('resolve complex circular dependency correctly', () => {
    const pluginA = plugin({ name: 'a', dependencies: ['c'] })
    const pluginB = plugin({ name: 'b', dependencies: ['a'] })
    const pluginC = plugin({ name: 'c', dependencies: ['b'] })

    expect(() => resolveDependencies([pluginA, pluginB, pluginC])).toThrow(
      'Circular dependency detected'
    )
  })
})
