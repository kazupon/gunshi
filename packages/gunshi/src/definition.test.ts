import { describe, expect, expectTypeOf, test, vi } from 'vitest'
import { cli } from './cli.ts'
import { define, lazy } from './definition.ts'

import type { Args, CommandRunner, GunshiParams } from './types.ts'

describe('define', async () => {
  test('basic', async () => {
    const command = define({
      name: 'test',
      description: 'A test command',
      args: {
        foo: {
          type: 'string',
          description: 'A string option'
        }
      },
      run: ctx => {
        // Type assertions
        // expectTypeOf(ctx.values).toEqualTypeOf<{ foo?: string | undefined }>()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- default is any
        expectTypeOf(ctx.extensions).toEqualTypeOf<any>()

        // Runtime check to satisfy test requirements
        expect(typeof ctx.values.foo).toBe('string')
        // Use the value to avoid unused variable error
        expect(ctx.values.foo).toBe('bar')
      }
    })

    await cli(['test', '--foo', 'bar'], command)
  })

  test('preserves all specified command properties', () => {
    const command = define({
      name: 'complex',
      description: 'Complex command',
      args: {
        flag: { type: 'boolean' as const },
        value: { type: 'number' }
      },
      examples: 'complex --flag\ncomplex --value 42',
      toKebab: false,
      run: async _ctx => 'done'
    })

    // Check that all specified properties and types are preserved
    expect(command.name).toBe('complex')
    // expectTypeOf<typeof command.name>().not.toBeNullable()
    expect(command.description).toBe('Complex command')
    // expectTypeOf<typeof command.description>().not.toBeNullable()
    expect(command.args).toBeDefined()
    // expectTypeOf<typeof command.args>().not.toBeNullable()
    expect(command.examples).toEqual('complex --flag\ncomplex --value 42')
    // expectTypeOf<typeof command.examples>().not.toBeNullable()
    expect(command.toKebab).toBe(false)
    // expectTypeOf<typeof command.toKebab>().not.toBeNullable()
    expect(typeof command.run).toBe('function')
    // expectTypeOf<typeof command.run>().not.toBeNullable()

    // Check that all not specified optional properties are undefined
    expect(command.internal).toBeUndefined()
    expectTypeOf<typeof command.internal>().toBeNullable()
    expect(command.entry).toBeUndefined()
    expectTypeOf<typeof command.entry>().toBeNullable()
    expect(command.rendering).toBeUndefined()
    expectTypeOf<typeof command.rendering>().toBeNullable()
  })

  describe('type parameters', () => {
    type ExtendedContext = {
      auth: {
        user: { id: number; name: string }
        isAuthenticated: boolean
      }
      db: {
        query: (sql: string) => Promise<{ rows: string[] }>
      }
    }

    test('type inference: command with type parameter extensions', () => {
      const args = {
        env: { type: 'string', required: true }
      } as const satisfies Args
      const command = define<GunshiParams<{ args: typeof args; extensions: ExtendedContext }>>({
        name: 'deploy',
        description: 'Deploy application',
        args,
        run: async ctx => {
          expectTypeOf(ctx.values).toEqualTypeOf<{ env: string }>()
          expectTypeOf(ctx.extensions).toEqualTypeOf<ExtendedContext>()

          return `Deploying as ${ctx.extensions.auth.user.name}`
        }
      })

      // Check that specified properties and types are preserved
      expect(command.name).toBe('deploy')
      // expectTypeOf<typeof command.name>().not.toBeNullable()
      expect(command.description).toBe('Deploy application')
      // expectTypeOf<typeof command.description>().not.toBeNullable()
      expect(command.args).toEqual({ env: { type: 'string', required: true } })
      // expectTypeOf<typeof command.args>().not.toBeNullable()

      // Check that not specified optional properties are undefined
      expectTypeOf<typeof command.examples>().toBeNullable()
    })

    test('type inference: no args', () => {
      const command = define<GunshiParams<{ extensions: ExtendedContext }>>({
        name: 'profile',
        run: async ctx => {
          expectTypeOf(ctx.values).toEqualTypeOf<{
            [x: string]: string | number | boolean | undefined
          }>()
          expectTypeOf(ctx.extensions).toEqualTypeOf<ExtendedContext>()

          return `User: ${ctx.extensions.auth.user.name}`
        }
      })

      // Check that specified properties and types are preserved
      expect(command.name).toBe('profile')
      // expectTypeOf<typeof command.name>().not.toBeNullable()

      // Check that not specified optional properties are undefined
      expectTypeOf<typeof command.examples>().toBeNullable()
    })
  })
})

describe('lazy', () => {
  test('basic', async () => {
    const subCommands = new Map()
    const test = define({
      name: 'test',
      description: 'A test command',
      toKebab: true,
      args: {
        foo: {
          type: 'string',
          description: 'A string option'
        }
      }
    })
    const mock = vi.fn()
    const testLazy = lazy(() => {
      return Promise.resolve(mock)
    }, test)
    subCommands.set('test', testLazy)

    expect(testLazy).toBeInstanceOf(Function)
    expect(testLazy.commandName).toBe(test.name)
    expect(testLazy.description).toBe(test.description)
    expect(testLazy.args).toEqual(test.args)
    expect(testLazy.toKebab).toBe(test.toKebab)

    await cli(
      ['test', '--foo', 'bar'],
      {
        run: _ctx => {}
      },
      { subCommands }
    )

    expect(mock).toHaveBeenCalled()
  })

  test('preserves all properties', () => {
    const loader = vi.fn(async () => {
      return async () => 'done'
    })
    const lazyCmd = lazy(loader, {
      name: 'lazy-test',
      description: 'Test lazy command',
      args: { opt: { type: 'string' as const } },
      examples: 'lazy-test --opt value',
      toKebab: true,
      internal: true
    })

    expect(lazyCmd.commandName).toBe('lazy-test')
    expect(lazyCmd.description).toBe('Test lazy command')
    expect(lazyCmd.args).toEqual({ opt: { type: 'string' } })
    expect(lazyCmd.examples).toEqual('lazy-test --opt value')
    expect(lazyCmd.toKebab).toBe(true)
    expect(lazyCmd.internal).toBe(true)
  })

  describe('lazy with type parameters', () => {
    test('basic - lazy command with type parameter', () => {
      type AuthExt = {
        auth: {
          authenticated: boolean
        }
      }
      const loader = vi.fn(async () => {
        const runner: CommandRunner<{ args: Args; extensions: AuthExt }> = async ctx => {
          expectTypeOf(ctx.extensions.auth.authenticated).toEqualTypeOf<boolean>()
          return 'deployed'
        }
        return runner
      })
      const lazyCmd = lazy<AuthExt>(loader, {
        name: 'lazy-deploy',
        description: 'Lazy deploy command'
      })

      // check that properties are preserved
      expect(lazyCmd.commandName).toBe('lazy-deploy')
      expect(lazyCmd.description).toBe('Lazy deploy command')
    })

    test('handles type parameters from loaded command', () => {
      const loader = vi.fn(async () => {
        interface TestExt {
          existing: { test: boolean }
        }
        const runner: CommandRunner<{ extensions: { test: TestExt } }> = async ctx => {
          expectTypeOf(ctx.extensions.test.existing.test).toEqualTypeOf<boolean>()
          return 'done'
        }
        return runner
      })
      const lazyCmd = lazy(loader, {
        name: 'test'
      })

      // should work without errors
      expect(lazyCmd.commandName).toBe('test')
    })

    test('backward compatibility - lazy command without type parameter', () => {
      const loader = vi.fn(async () => ({
        name: 'simple',
        run: async () => 'done'
      }))
      const lazyCmd = lazy(loader, {
        name: 'simple',
        description: 'Simple lazy command'
      })

      expect(lazyCmd.commandName).toBe('simple')
      expect(lazyCmd.description).toBe('Simple lazy command')
    })

    test('lazy without definition', () => {
      const loader = vi.fn(async () => ({
        name: 'minimal',
        run: async () => 'done'
      }))
      const lazyCmd = lazy(loader)

      expect(typeof lazyCmd).toBe('function')
    })
  })
})
