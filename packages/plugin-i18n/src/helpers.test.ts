import { DeepWriteable } from '@gunshi/shared'
import { cli, define } from 'gunshi'
import { describe, expect, expectTypeOf, test, vi } from 'vitest'
import { defineI18n, defineI18nWithTypes, withI18nResource } from './helpers.ts'
import i18n from './index.ts'

import type { Args, CommandRunner } from '@gunshi/plugin'
import type { CommandResourceFetcher, I18nCommand } from './types.ts'

describe('defineI18n', () => {
  test('basic', async () => {
    const command = defineI18n({
      name: 'test',
      description: 'Test command',
      args: {
        input: { type: 'string' }
      },
      run: ctx => {
        expectTypeOf(ctx.values).toEqualTypeOf<{ input?: string }>()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- default is any
        expectTypeOf(ctx.extensions).toEqualTypeOf<any>()

        expect(typeof ctx.values.input).toBe('string')
        expect(ctx.values.input).toBe('bar')
      }
    })
    await cli(['test', '--input', 'bar'], command)
  })

  test('preserves all specified command properties', () => {
    const command = defineI18n({
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

    expect(command.resource).toBeUndefined()
    expectTypeOf<typeof command.resource>().toEqualTypeOf<
      | CommandResourceFetcher<{
          args: ExpectArgs
          extensions: {}
        }>
      | undefined
    >()
  })

  test('pass through resource', async () => {
    const command = defineI18n({
      name: 'test',
      args: {
        flag: { type: 'boolean' },
        value: { type: 'number' }
      },
      resource: () => ({
        description: 'Test',
        examples: 'Example usage'
      })
    })

    const expectArgs = {
      flag: { type: 'boolean' },
      value: { type: 'number' }
    } as const
    type ExpectArgs = DeepWriteable<typeof expectArgs>
    expect(command.args).toEqual(expectArgs)
    expectTypeOf<typeof command.resource>().toEqualTypeOf<
      CommandResourceFetcher<{
        args: ExpectArgs
        extensions: {}
      }>
    >()
  })

  test('pass parameters', () => {
    const args = {
      env: { type: 'string', required: true }
    } satisfies Args

    const options: I18nCommand<{ args: typeof args }> = {
      name: 'deploy',
      description: 'Deploy application',
      args,
      resource: () => ({
        description: 'Deploy application',
        examples: 'Example usage'
      })
    }

    const command = defineI18n(options)

    /**
     * Check that specified properties and types are not inferred fully (it is not meant to be strictly typed, include `undefined`)
     */

    expect(command.name).toBe('deploy')
    expectTypeOf<typeof command.name>().toEqualTypeOf<string | undefined>()

    expect(command.description).toBe('Deploy application')
    expectTypeOf<typeof command.description>().toEqualTypeOf<string | undefined>()

    expect(command.args).toEqual({ env: { type: 'string', required: true } })
    expectTypeOf<typeof command.args>().toEqualTypeOf<typeof args | undefined>()

    type ExpectArgs = DeepWriteable<typeof args>
    expect(command.args).toEqual(args)

    expect(typeof command.resource).toBe('function')
    expectTypeOf<typeof command.resource>().toEqualTypeOf<
      CommandResourceFetcher<{
        args: ExpectArgs
        extensions: {}
      }>
    >()
  })
})

describe('defineI18nWithTypes', () => {
  test('args only', async () => {
    const args = {
      count: { type: 'number', required: true }
    } satisfies Args
    const command = defineI18nWithTypes<{ args: typeof args }>()({
      name: 'count',
      args,
      resource: locale => {
        expectTypeOf(locale).toEqualTypeOf<Intl.Locale>()
        return {
          description: 'Count items',
          examples: 'count --count 5'
        }
      },
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

    expect(typeof command.resource).toBe('function')
    expectTypeOf<typeof command.resource>().toEqualTypeOf<
      CommandResourceFetcher<{
        args: typeof args
        extensions: {}
      }>
    >()

    /**
     * Check that not specified optional properties are `undefined`
     */

    expectTypeOf<typeof command.description>().toBeNullable()
  })

  test('extensions only', async () => {
    type MyExtensions = { logger: { log: (message: string) => void } }
    const command = defineI18nWithTypes<{ extensions: MyExtensions }>()({
      name: 'count',
      args: {
        count: { type: 'number', required: true }
      },
      resource: locale => {
        expectTypeOf(locale).toEqualTypeOf<Intl.Locale>()
        return {
          description: 'Count items',
          examples: 'count --count 5'
        }
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

    expect(typeof command.resource).toBe('function')
    expectTypeOf<typeof command.resource>().toEqualTypeOf<
      CommandResourceFetcher<{
        args: ExpectArgs
        extensions: MyExtensions
      }>
    >()

    /**
     * Check that not specified optional properties are `undefined`
     */

    expectTypeOf<typeof command.description>().toBeNullable()
  })

  test('args and extensions', async () => {
    type MyExtensions = { logger: { log: (message: string) => void } }
    const args = {
      count: { type: 'number', required: true }
    } satisfies Args
    const resource = () => ({
      description: 'Count items',
      examples: 'count --count 5'
    })
    const command = defineI18nWithTypes<{ args: typeof args; extensions: MyExtensions }>()({
      name: 'count',
      args,
      resource,
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

    expect(typeof command.resource).toBe('function')
    expectTypeOf<typeof command.resource>().toEqualTypeOf<
      CommandResourceFetcher<{
        args: typeof args
        extensions: MyExtensions
      }>
    >()

    /**
     * Check that not specified optional properties are `undefined`
     */

    expectTypeOf<typeof command.description>().toBeNullable()
  })
})

describe('withI18nResource', () => {
  test('basic', async () => {
    const command = define({
      name: 'test',
      description: 'Test command',
      args: {
        input: { type: 'string' }
      },
      run: () => {}
    })

    const mock = vi.fn()
    const localizedCommand = withI18nResource(command, () => {
      mock()
      return {
        description: 'テストコマンド',
        'arg:input': '入力値'
      }
    })

    expect(localizedCommand.name).toBe(command.name)
    expectTypeOf<typeof localizedCommand.name>().toEqualTypeOf<string>()

    expect(localizedCommand.description).toBe(command.description)
    expectTypeOf<typeof localizedCommand.description>().toEqualTypeOf<string>()

    expect(localizedCommand.args).toEqual(command.args)
    expectTypeOf(localizedCommand.args).toEqualTypeOf<typeof command.args>()

    expect(typeof localizedCommand.resource).toBe('function')
    expectTypeOf<typeof localizedCommand.resource>().toEqualTypeOf<
      CommandResourceFetcher<{
        args: typeof localizedCommand.args
        extensions: {}
      }>
    >()

    expectTypeOf<typeof localizedCommand.examples>().toBeNullable()

    await cli(
      ['test', '--input', 'foo.test.ts'],
      {
        run: _ctx => {}
      },
      {
        subCommands: { test: localizedCommand },
        plugins: [i18n({ locale: 'ja-JP' })]
      }
    )

    expect(mock).toHaveBeenCalled()
  })

  test('preserves all properties', () => {
    const resource: CommandResourceFetcher = () => ({
      description: 'テストコマンド',
      'arg:input': '入力値'
    })

    const localizedCommand = withI18nResource(
      {
        name: 'test',
        description: 'Test command',
        args: {
          input: { type: 'string' }
        },
        run: () => {}
      },
      resource
    )

    expect(localizedCommand.name).toBe('test')
    expectTypeOf<typeof localizedCommand.name>().toEqualTypeOf<string>()

    expect(localizedCommand.description).toBe('Test command')
    expectTypeOf<typeof localizedCommand.description>().toEqualTypeOf<string>()

    const expectArgs = {
      input: { type: 'string' }
    } as const
    type ExpectArgs = DeepWriteable<typeof expectArgs>
    expect(localizedCommand.args).toEqual(expectArgs)
    expectTypeOf(localizedCommand.args).toEqualTypeOf<ExpectArgs>()

    expect(typeof localizedCommand.resource).toBe('function')
    expectTypeOf<typeof localizedCommand.resource>().toEqualTypeOf<
      CommandResourceFetcher<{
        args: ExpectArgs
        extensions: {}
      }>
    >()

    expectTypeOf<typeof localizedCommand.examples>().toBeNullable()
  })
})
