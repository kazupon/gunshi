import { describe, expect, expectTypeOf, test, vi } from 'vitest'
import { cli } from './cli.ts'
import { define, lazy } from './definition.ts'

import type { Args } from 'args-tokens'
import type { CommandContextExtension, CommandRunner, ExtendedCommand } from './types.ts'

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

    const command = define<{ env: { type: 'string'; required: true } }, ExtendedContext>({
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
        expectTypeOf(ctx.extensions).toEqualTypeOf<undefined>()
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

    const command = define<Args, AuthExt>({
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
      resource: async () => {
        return {
          description: 'Complex command resource',
          examples: 'complex --flag\ncomplex --value 42',
          'arg:flag': 'A boolean flag for the complex command',
          'arg:value': 'A numeric value for the complex command'
        }
      },
      toKebab: false,
      run: async _ctx => 'done'
    })

    expect(command.name).toBe('complex')
    expect(command.description).toBe('Complex command')
    expect(command.args).toBeDefined()
    expect(command.examples).toEqual('complex --flag\ncomplex --value 42')
    expect(command.resource).toBeDefined()
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
      const runner: CommandRunner<Args, AuthExt> = async ctx => {
        expectTypeOf(ctx.extensions.auth.authenticated).toEqualTypeOf<boolean>()
        return 'deployed'
      }
      return runner
    })

    const lazyCmd = lazy<Args, AuthExt>(loader, {
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
      resource: () => {
        return {
          description: 'This is a lazy command',
          examples: 'lazy-test',
          'arg:opt': 'An optional string argument for the lazy command'
        }
      },
      toKebab: true
    })

    expect(lazyCmd.commandName).toBe('lazy-test')
    expect(lazyCmd.description).toBe('Test lazy command')
    expect(lazyCmd.args).toEqual({ opt: { type: 'string' } })
    expect(lazyCmd.examples).toEqual('lazy-test --opt value')
    expect(lazyCmd.resource).toBeDefined()
    expect(lazyCmd.toKebab).toBe(true)
  })

  test('handles type parameters from loaded command', () => {
    const loader = vi.fn(async () => {
      type TestExt = {
        existing: { existing: boolean }
      }
      const runner: CommandRunner<Args, TestExt> = async () => {
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
      extensions: { ext1, ext2 },
      run: async ctx => {
        // properly type ctx.extensions
        const v1: string = ctx.extensions.ext1.value1
        const v2: number = ctx.extensions.ext2.value2
        return `${v1} - ${v2}`
      }
    }

    expect(command.extensions).toBeDefined()
    expect(command.extensions.ext1).toBe(ext1)
    expect(command.extensions.ext2).toBe(ext2)
  })
})
