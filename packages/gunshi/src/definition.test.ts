import { describe, expect, expectTypeOf, test, vi } from 'vitest'
import { cli } from './cli.ts'
import { define, lazy } from './definition.ts'
import { plugin } from './plugin.ts'

import type { Args } from 'args-tokens'
import type { CommandContextExtension, ExtendedCommand } from './types.ts'

// eslint-disable-next-line vitest/expect-expect
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
      expectTypeOf(ctx.values.foo).toEqualTypeOf<string | undefined>()
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

describe('define with extensions', () => {
  test('basic - command with extensions', () => {
    type Auth = {
      user: { id: number; name: string }
      isAuthenticated: boolean
    }

    const authExtension: CommandContextExtension<Auth> = {
      key: Symbol('auth'),
      factory: _core => ({
        user: { id: 1, name: 'Test' },
        isAuthenticated: true
      })
    }

    type Database = {
      query: (sql: string) => Promise<{ rows: string[] }>
    }

    const dbExtension: CommandContextExtension<Database> = {
      key: Symbol('db'),
      factory: _core => ({
        query: async (_sql: string) => ({ rows: [] })
      })
    }

    const command = define({
      name: 'deploy',
      description: 'Deploy application',
      args: {
        env: { type: 'string', required: true }
      },
      extensions: {
        auth: authExtension,
        db: dbExtension
      },
      run: async ctx => {
        return `Deploying as ${ctx.ext.auth.user.name}`
      }
    })

    // check that extensions are converted to _extensions
    expect(command._extensions).toBeDefined()
    expect(command._extensions.auth).toBe(authExtension)
    expect(command._extensions.db).toBe(dbExtension)
  })

  test('backward compatibility - command without extensions', () => {
    const command = define({
      name: 'hello',
      description: 'Say hello',
      args: {
        name: { type: 'string' }
      },
      run: async ctx => {
        return `Hello, ${ctx.values.name || 'World'}!`
      }
    })

    // should not have _extensions property
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((command as any)._extensions).toBeUndefined()

    // all standard properties should be preserved
    expect(command.name).toBe('hello')
    expect(command.description).toBe('Say hello')
    expect(command.args).toEqual({ name: { type: 'string' } })
    expect(typeof command.run).toBe('function')
  })

  test('type inference - ext property is typed correctly', () => {
    type Auth = {
      user: { id: number; name: string }
      logout: () => Promise<void>
    }

    const authPlugin = plugin<Auth>({
      name: 'auth',
      setup: async _ctx => {},
      extension: _core => ({
        user: { id: 1, name: 'Test' },
        logout: async () => {}
      })
    })

    const command = define({
      name: 'profile',
      extensions: {
        auth: authPlugin.extension
      },
      run: async ctx => {
        const userName: string = ctx.ext.auth.user.name
        await ctx.ext.auth.logout()
        return `User: ${userName}`
      }
    })

    expect(command._extensions.auth).toBeDefined()
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
      resource: async () => {
        return {
          description: 'Complex command resource',
          examples: 'complex --flag\ncomplex --value 42',
          'arg:flag': 'A boolean flag for the complex command',
          'arg:value': 'A numeric value for the complex command'
        }
      },
      toKebab: false,
      extensions: {
        test: { key: Symbol('test'), factory: () => ({ test: true }) }
      },
      run: async _ctx => 'done'
    })

    expect(command.name).toBe('complex')
    expect(command.description).toBe('Complex command')
    expect(command.args).toBeDefined()
    expect(command.examples).toEqual('complex --flag\ncomplex --value 42')
    expect(command.resource).toBeDefined()
    expect(command.toKebab).toBe(false)
    expect(command._extensions).toBeDefined()
  })
})

describe('lazy with extensions', () => {
  test('basic - lazy command with extensions', () => {
    const loader = vi.fn(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const runner = async (_ctx: any) => 'deployed'
      return runner
    })

    type Auth = {
      authenticated: boolean
    }

    const authExtension: CommandContextExtension<Auth> = {
      key: Symbol('auth'),
      factory: _core => ({ authenticated: true })
    }

    const lazyCmd = lazy(loader, {
      name: 'lazy-deploy',
      description: 'Lazy deploy command',
      extensions: {
        auth: authExtension
      }
    })

    // check that extensions are preserved
    expect(lazyCmd._extensions).toBeDefined()
    expect(lazyCmd._extensions.auth).toBe(authExtension)

    // check that other properties are preserved
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
      resource: () => {
        return {
          description: 'This is a lazy command',
          examples: 'lazy-test',
          'arg:opt': 'An optional string argument for the lazy command'
        }
      },
      toKebab: true,
      extensions: {
        ext1: { key: Symbol('ext1'), factory: () => ({ ext1: true }) }
      }
    })

    expect(lazyCmd.commandName).toBe('lazy-test')
    expect(lazyCmd.description).toBe('Test lazy command')
    expect(lazyCmd.args).toEqual({ opt: { type: 'string' } })
    expect(lazyCmd.examples).toEqual('lazy-test --opt value')
    expect(lazyCmd.resource).toBeDefined()
    expect(lazyCmd.toKebab).toBe(true)
    expect(lazyCmd._extensions).toBeDefined()
  })

  test('handles _extensions from loaded command', () => {
    const loader = vi.fn(async () => {
      return async () => 'done'
    })

    // simulate a command that already has _extensions
    const definitionWithExtensions = {
      name: 'test',
      _extensions: {
        existing: { key: Symbol('existing'), factory: () => ({ existing: true }) }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lazyCmd = lazy(loader, definitionWithExtensions as any)

    // should preserve _extensions from definition
    expect(lazyCmd._extensions).toBeDefined()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((lazyCmd._extensions as any).existing).toBeDefined()
  })

  test('backward compatibility - lazy command without extensions', () => {
    const loader = vi.fn(async () => ({
      name: 'simple',
      run: async () => 'done'
    }))

    const lazyCmd = lazy(loader, {
      name: 'simple',
      description: 'Simple lazy command'
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((lazyCmd as any)._extensions).toBeUndefined()
    expect(lazyCmd.commandName).toBe('simple')
    expect(lazyCmd.description).toBe('Simple lazy command')
  })

  test('lazy without definition', () => {
    const loader = vi.fn(async () => ({
      name: 'minimal',
      run: async () => 'done'
    }))

    const lazyCmd = lazy(loader)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((lazyCmd as any)._extensions).toBeUndefined()
    expect(typeof lazyCmd).toBe('function')
  })
})

describe('ExtendedCommand type', () => {
  test('type safety with multiple extensions', () => {
    const ext1: CommandContextExtension<{ value1: string }> = {
      key: Symbol('ext1'),
      factory: () => ({ value1: 'test1' })
    }

    const ext2: CommandContextExtension<{ value2: number }> = {
      key: Symbol('ext2'),
      factory: () => ({ value2: 42 })
    }

    const command: ExtendedCommand<Args, { ext1: typeof ext1; ext2: typeof ext2 }> = {
      name: 'multi-ext',
      _extensions: { ext1, ext2 },
      run: async ctx => {
        // typeScript should properly type ctx.ext
        const v1: string = ctx.ext.ext1.value1
        const v2: number = ctx.ext.ext2.value2
        return `${v1} - ${v2}`
      }
    }

    expect(command._extensions).toBeDefined()
    expect(command._extensions!.ext1).toBe(ext1)
    expect(command._extensions!.ext2).toBe(ext2)
  })
})
