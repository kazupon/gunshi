import { describe, expect, expectTypeOf, test, vi } from 'vitest'
import { cli } from './cli.ts'
import { define, lazy } from './definition.ts'

import type { Args, CommandRunner, GunshiParams } from './types.ts'

test('define', async () => {
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
      // Runtime check to satisfy test requirements
      expect(typeof ctx.values.foo).toBe('string')
      // Use the value to avoid unused variable error
      expect(ctx.values.foo).toBe('bar')
    }
  })

  await cli(['test', '--foo', 'bar'], command)
})

test('lazy', async () => {
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

describe('define with type parameters', () => {
  test('basic - command with type parameter extension', () => {
    type ExtendedContext = {
      auth: {
        user: { id: number; name: string }
        isAuthenticated: boolean
      }
      db: {
        query: (sql: string) => Promise<{ rows: string[] }>
      }
    }
    const command = define<
      GunshiParams<{
        args: { env: { type: 'string'; required: true } }
        extensions: ExtendedContext
      }>
    >({
      name: 'deploy',
      description: 'Deploy application',
      args: {
        env: { type: 'string', required: true }
      },
      run: async ctx => {
        return `Deploying as ${ctx.extensions.auth.user.name}`
      }
    })

    // check that command is created properly
    expect(command.name).toBe('deploy')
    expect(command.description).toBe('Deploy application')
    expect(command.args).toEqual({ env: { type: 'string', required: true } })
  })

  test('backward compatibility - command without type parameter', () => {
    const command = define({
      name: 'hello',
      description: 'Say hello',
      args: {
        name: { type: 'string' }
      },
      run: async ctx => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- default is any
        expectTypeOf(ctx.extensions).toEqualTypeOf<any>()
        return `Hello, ${ctx.values.name || 'World'}!`
      }
    })

    // all standard properties should be preserved
    expect(command.name).toBe('hello')
    expect(command.description).toBe('Say hello')
    expect(command.args).toEqual({ name: { type: 'string' } })
    expect(typeof command.run).toBe('function')
  })

  test('type inference - extension is typed correctly', () => {
    type AuthExt = {
      auth: {
        user: { id: number; name: string }
        logout: () => Promise<void>
      }
    }
    const command = define<AuthExt>({
      name: 'profile',
      run: async ctx => {
        const userName: string = ctx.extensions.auth.user.name
        await ctx.extensions.auth.logout()
        return `User: ${userName}`
      }
    })

    expect(command.name).toBe('profile')
  })

  test('preserves all command properties', () => {
    const command = define({
      name: 'complex',
      description: 'Complex command',
      args: {
        flag: { type: 'boolean' },
        value: { type: 'number' }
      },
      examples: 'complex --flag\ncomplex --value 42',
      toKebab: false,
      run: async _ctx => 'done'
    })

    expect(command.name).toBe('complex')
    expect(command.description).toBe('Complex command')
    expect(command.args).toBeDefined()
    expect(command.examples).toEqual('complex --flag\ncomplex --value 42')
    expect(command.toKebab).toBe(false)
  })
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
