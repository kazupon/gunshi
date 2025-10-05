import { describe, expect, expectTypeOf, test, vi } from 'vitest'
import { cli } from './cli.ts'
import { define, defineWithTypes, lazy, lazyWithTypes } from './definition.ts'

import type { DeepWriteable } from '@gunshi/shared'
import type { Args, Command, CommandRunner, GunshiParams } from './types.ts'

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
        expectTypeOf(ctx.values).toEqualTypeOf<{ foo?: string | undefined }>()
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
        flag: { type: 'boolean' },
        value: { type: 'number' }
      },
      examples: 'complex --flag\ncomplex --value 42',
      toKebab: false,
      run: (_ctx): string | void | Promise<string | void> => 'done'
    })

    /**
     * Check that all specified properties and types are preserved
     */

    expect(command.name).toBe('complex')
    expectTypeOf<typeof command.name>().toEqualTypeOf<string>()

    expect(command.description).toBe('Complex command')
    expectTypeOf<typeof command.description>().toEqualTypeOf<string>()

    const expectArgs = {
      flag: { type: 'boolean' },
      value: { type: 'number' }
    } as const
    type ExpectArgs = DeepWriteable<typeof expectArgs>
    expect(command.args).toEqual(expectArgs)
    expectTypeOf<typeof command.args>().toEqualTypeOf<ExpectArgs>()

    expect(command.examples).toEqual('complex --flag\ncomplex --value 42')
    expectTypeOf<typeof command.examples>().toEqualTypeOf<string>()

    expect(command.toKebab).toBe(false)
    expectTypeOf<typeof command.toKebab>().toEqualTypeOf<false>()

    expect(typeof command.run).toBe('function')
    expectTypeOf<typeof command.run>().toEqualTypeOf<
      CommandRunner<{
        args: ExpectArgs
        extensions: {}
      }>
    >()

    /**
     * Check that all not specified optional properties are `undefined`
     */

    expect(command.internal).toBeUndefined()
    expectTypeOf<typeof command.internal>().toEqualTypeOf<boolean | undefined>()

    expect(command.entry).toBeUndefined()
    expectTypeOf<typeof command.entry>().toEqualTypeOf<boolean | undefined>()

    expect(command.rendering).toBeUndefined()
    expectTypeOf<typeof command.rendering>().toEqualTypeOf<Command['rendering'] | undefined>()
  })

  test('pass parameters', () => {
    const args = {
      env: { type: 'string', required: true }
    } satisfies Args

    const options: Command<GunshiParams<{ args: typeof args }>> = {
      name: 'deploy',
      description: 'Deploy application',
      args,
      run: _ctx => {}
    } satisfies Command<GunshiParams<{ args: typeof args }>>

    const command = define(options)

    /**
     * Check that specified properties and types are not inferred fully (it is not meant to be strictly typed, include `undefined`)
     */

    expect(command.name).toBe('deploy')
    expectTypeOf<typeof command.name>().toEqualTypeOf<string | undefined>()

    expect(command.description).toBe('Deploy application')
    expectTypeOf<typeof command.description>().toEqualTypeOf<string | undefined>()

    expect(command.args).toEqual({ env: { type: 'string', required: true } })
    expectTypeOf<typeof command.args>().toEqualTypeOf<typeof args | undefined>()

    /**
     * Check that not specified optional properties are `undefined`
     */
    expectTypeOf<typeof command.examples>().toBeNullable()
  })
})

describe('defineWithTypes', () => {
  test('args only', async () => {
    const args = {
      count: { type: 'number', required: true }
    } satisfies Args
    const command = defineWithTypes<{ args: typeof args }>()({
      name: 'count',
      args,
      run: (ctx): string | void | Promise<string | void> => {
        expectTypeOf(ctx.values).toEqualTypeOf<{ count: number }>()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- default is any
        expectTypeOf(ctx.extensions).toEqualTypeOf<any>()

        // Runtime check to satisfy test requirements
        expect(typeof ctx.values.count).toBe('number')
        expect(ctx.values.count).toBe(5)
      }
    })

    await cli(['count', '--count', '5'], command)

    /**
     * Check that specified properties and types are preserved
     */

    expect(command.name).toBe('count')
    expectTypeOf<typeof command.name>().toEqualTypeOf<string>()

    expect(command.args).toEqual(args)
    expectTypeOf<typeof command.args>().toEqualTypeOf<typeof args>()

    expect(typeof command.run).toBe('function')
    expectTypeOf<typeof command.run>().toEqualTypeOf<
      CommandRunner<{
        args: typeof args
        extensions: {}
      }>
    >()

    /**
     * Check that not specified optional properties are undefined
     */

    expectTypeOf<typeof command.description>().toBeNullable()
    expectTypeOf<typeof command.examples>().toBeNullable()
  })

  test('extensions only', async () => {
    type MyExtensions = { logger: { log: (message: string) => void } }
    const command = defineWithTypes<{ extensions: MyExtensions }>()({
      name: 'count',
      args: {
        count: { type: 'number', required: true }
      },
      run: (ctx): string | void | Promise<string | void> => {
        expectTypeOf(ctx.values).toEqualTypeOf<{ count: number }>()
        expectTypeOf(ctx.extensions).toEqualTypeOf<MyExtensions>()

        // Runtime check to satisfy test requirements
        expect(typeof ctx.values.count).toBe('number')
        expect(ctx.values.count).toBe(5)
      }
    })

    await cli(['count', '--count', '5'], command)

    /**
     * Check that specified properties and types are preserved
     */

    expect(command.name).toBe('count')
    expectTypeOf<typeof command.name>().toEqualTypeOf<string>()

    const expectArgs = { count: { type: 'number', required: true } } as const
    type ExpectArgs = DeepWriteable<typeof expectArgs>
    expect(command.args).toEqual(expectArgs)
    expectTypeOf<typeof command.args>().toEqualTypeOf<ExpectArgs>()

    expect(typeof command.run).toBe('function')
    expectTypeOf<typeof command.run>().toEqualTypeOf<
      CommandRunner<{
        args: ExpectArgs
        extensions: MyExtensions
      }>
    >()

    /**
     * Check that not specified optional properties are undefined
     */

    expectTypeOf<typeof command.description>().toBeNullable()
    expectTypeOf<typeof command.examples>().toBeNullable()
  })

  test('args and extensions', async () => {
    type MyExtensions = { logger: { log: (message: string) => void } }
    const args = {
      count: { type: 'number', required: true }
    } satisfies Args
    const command = defineWithTypes<{ args: typeof args; extensions: MyExtensions }>()({
      name: 'count',
      args,
      run: (ctx): string | void | Promise<string | void> => {
        expectTypeOf(ctx.values).toEqualTypeOf<{ count: number }>()
        expectTypeOf(ctx.extensions).toEqualTypeOf<MyExtensions>()

        // Runtime check to satisfy test requirements
        expect(typeof ctx.values.count).toBe('number')
        expect(ctx.values.count).toBe(5)
      }
    })

    await cli(['count', '--count', '5'], command)

    /**
     * Check that specified properties and types are preserved
     */

    expect(command.name).toBe('count')
    expectTypeOf<typeof command.name>().toEqualTypeOf<string>()

    expect(command.args).toEqual(args)
    expectTypeOf<typeof command.args>().toEqualTypeOf<typeof args>()

    expect(typeof command.run).toBe('function')
    expectTypeOf<typeof command.run>().toEqualTypeOf<
      CommandRunner<{
        args: typeof args
        extensions: MyExtensions
      }>
    >()

    /**
     * Check that not specified optional properties are undefined
     */

    expectTypeOf<typeof command.description>().toBeNullable()
    expectTypeOf<typeof command.examples>().toBeNullable()
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
    const testLazy = lazy((): CommandRunner<{ args: typeof test.args; extensions: {} }> => {
      return _ctx => {
        expectTypeOf(_ctx.values).toEqualTypeOf<{ foo?: string | undefined }>()
        mock()
      }
    }, test)
    subCommands.set('test', testLazy)

    expect(testLazy).toBeInstanceOf(Function)

    expect(testLazy.commandName).toBe(test.name)
    expectTypeOf<typeof testLazy.commandName>().toEqualTypeOf<string>()

    expect(testLazy.description).toBe(test.description)
    expectTypeOf<typeof testLazy.description>().toEqualTypeOf<string>()

    expect(testLazy.args).toEqual(test.args)
    expectTypeOf(testLazy.args).toEqualTypeOf<typeof test.args>()

    expect(testLazy.toKebab).toBe(test.toKebab)
    expectTypeOf<typeof testLazy.toKebab>().toEqualTypeOf<true>()

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
      args: { opt: { type: 'string' } },
      examples: 'lazy-test --opt value',
      toKebab: true,
      internal: true
    })

    expect(lazyCmd.commandName).toBe('lazy-test')
    expectTypeOf<typeof lazyCmd.commandName>().toEqualTypeOf<string>()

    expect(lazyCmd.description).toBe('Test lazy command')
    expectTypeOf<typeof lazyCmd.description>().toEqualTypeOf<string>()

    const expectArgs = { opt: { type: 'string' } } as const
    type ExpectArgs = DeepWriteable<typeof expectArgs>
    expect(lazyCmd.args).toEqual(expectArgs)
    expectTypeOf<typeof lazyCmd.args>().toEqualTypeOf<ExpectArgs>()

    expect(lazyCmd.examples).toEqual('lazy-test --opt value')
    expectTypeOf<typeof lazyCmd.examples>().toEqualTypeOf<string>()

    expect(lazyCmd.toKebab).toBe(true)
    expectTypeOf<typeof lazyCmd.toKebab>().toEqualTypeOf<true>()

    expect(lazyCmd.internal).toBe(true)
    expectTypeOf<typeof lazyCmd.internal>().toEqualTypeOf<true>()
  })
})

describe('lazyWithTypes', () => {
  test('args only', async () => {
    const args = {
      foo: { type: 'string' }
    } satisfies Args

    const lazyCmd = lazyWithTypes<{ args: typeof args }>()(
      () => {
        return ctx => {
          expectTypeOf(ctx.values).toEqualTypeOf<{ foo?: string | undefined }>()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- default is any
          expectTypeOf(ctx.extensions).toEqualTypeOf<any>()
        }
      },
      {
        name: 'lazy-test',
        description: 'Test lazy command',
        args
      }
    )

    /**
     * Check that specified properties and types are preserved
     */

    expect(lazyCmd.commandName).toBe('lazy-test')
    expectTypeOf<typeof lazyCmd.commandName>().toEqualTypeOf<string>()

    expect(lazyCmd.description).toBe('Test lazy command')
    expectTypeOf<typeof lazyCmd.description>().toEqualTypeOf<string>()

    expect(lazyCmd.args).toEqual(args)
    expectTypeOf<typeof lazyCmd.args>().toEqualTypeOf<typeof args>()

    /**
     * Check that not specified optional properties are `undefined`
     */

    expectTypeOf<typeof lazyCmd.examples>().toBeNullable()
  })

  test('extensions only', async () => {
    type MyExtensions = { logger: { log: (message: string) => void } }
    const args = {
      opt: { type: 'string' }
    } satisfies Args

    const lazyCmd = lazyWithTypes<{ extensions: MyExtensions }>()(
      () => {
        return ctx => {
          expectTypeOf(ctx.values).toEqualTypeOf<{
            [x: string]: string | number | boolean | undefined
          }>()
          expectTypeOf(ctx.extensions).toEqualTypeOf<MyExtensions>()
        }
      },
      {
        name: 'lazy-test',
        description: 'Test lazy command',
        args
      }
    )

    /**
     * Check that specified properties and types are preserved
     */

    expect(lazyCmd.commandName).toBe('lazy-test')
    expectTypeOf<typeof lazyCmd.commandName>().toEqualTypeOf<string>()

    expect(lazyCmd.description).toBe('Test lazy command')
    expectTypeOf<typeof lazyCmd.description>().toEqualTypeOf<string>()

    expect(lazyCmd.args).toEqual(args)
    expectTypeOf<typeof lazyCmd.args>().toEqualTypeOf<typeof args>()

    /**
     * Check that not specified optional properties are `undefined`
     */

    expectTypeOf<typeof lazyCmd.examples>().toBeNullable()
  })

  test('args and extensions', async () => {
    type MyExtensions = { logger: { log: (message: string) => void } }
    const args = {
      opt: { type: 'string' }
    } satisfies Args

    const lazyCmd = lazyWithTypes<{ args: typeof args; extensions: MyExtensions }>()(
      () => {
        return ctx => {
          expectTypeOf(ctx.values).toEqualTypeOf<{ opt?: string | undefined }>()
          expectTypeOf(ctx.extensions).toEqualTypeOf<MyExtensions>()
        }
      },
      {
        name: 'lazy-test',
        description: 'Test lazy command',
        args
      }
    )

    /**
     * Check that specified properties and types are preserved
     */

    expect(lazyCmd.commandName).toBe('lazy-test')
    expectTypeOf<typeof lazyCmd.commandName>().toEqualTypeOf<string>()

    expect(lazyCmd.description).toBe('Test lazy command')
    expectTypeOf<typeof lazyCmd.description>().toEqualTypeOf<string>()

    expect(lazyCmd.args).toEqual(args)
    expectTypeOf<typeof lazyCmd.args>().toEqualTypeOf<typeof args>()

    /**
     * Check that not specified optional properties are `undefined`
     */

    expectTypeOf<typeof lazyCmd.examples>().toBeNullable()
  })
})
