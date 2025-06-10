import { describe, expect, test, vi } from 'vitest'
import { createCommandContext } from './context.ts'
import { define } from './definition.ts'
import { plugin } from './plugin.ts'

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
