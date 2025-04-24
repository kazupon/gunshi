import { MessageFormat } from 'messageformat'
import { describe, expect, test, vi } from 'vitest'
import {
  createTranslationAdapterForIntlifyMessageFormat,
  createTranslationAdapterForMessageFormat2,
  hasPrototype
} from '../test/utils.ts'
import { DEFAULT_LOCALE } from './constants.ts'
import { createCommandContext } from './context.ts'
import DefaultLocale from './locales/en-US.json' with { type: 'json' }
import jaLocale from './locales/ja-JP.json' with { type: 'json' }
import { resolveBuiltInKey, resolveOptionKey } from './utils.ts'

import type { ArgOptions } from 'args-tokens'
import type { Command, CommandResource, CommandResourceFetcher, LazyCommand } from './types.ts'

test.only('basic', async () => {
  const options = {
    foo: {
      type: 'string',
      short: 'f',
      description: 'this is foo option'
    },
    bar: {
      type: 'boolean',
      description: 'this is bar option'
    },
    baz: {
      type: 'number',
      short: 'b',
      default: 42,
      description: 'this is baz option'
    }
  } satisfies ArgOptions

  const command = {
    name: 'cmd1',
    description: 'this is cmd1',
    options,
    examples: 'examples',
    run: vi.fn()
  } satisfies Command<typeof options>

  const subCommands = new Map<string, Command<ArgOptions> | LazyCommand<ArgOptions>>()
  subCommands.set('cmd2', { name: 'cmd2', run: vi.fn() })

  const mockRenderUsage = vi.fn()
  const mockRenderValidationErrors = vi.fn()

  const ctx = await createCommandContext({
    options,
    values: { foo: 'foo', bar: true, baz: 42 },
    positionals: ['bar'],
    rest: [],
    args: ['bar'],
    tokens: [], // dummy, due to test
    omitted: true,
    command,
    commandOptions: {
      cwd: '/path/to/cmd1',
      description: 'this is command line',
      version: '0.0.0',
      name: 'gunshi',
      leftMargin: 4,
      middleMargin: 2,
      usageOptionType: true,
      renderHeader: null,
      renderUsage: mockRenderUsage,
      renderValidationErrors: mockRenderValidationErrors,
      subCommands
    }
  })

  /**
   * check values
   */

  expect(ctx).toMatchObject({
    name: 'cmd1',
    description: 'this is cmd1',
    options: { foo: { type: 'string' } },
    values: { foo: 'foo' },
    positionals: ['bar'],
    omitted: true
  })
  expect(ctx.env).toMatchObject({
    name: 'gunshi',
    description: 'this is command line',
    version: '0.0.0',
    cwd: '/path/to/cmd1',
    leftMargin: 4,
    middleMargin: 2,
    usageOptionType: true,
    renderHeader: null,
    renderUsage: mockRenderUsage,
    renderValidationErrors: mockRenderValidationErrors
  })

  expect(ctx.translate(resolveOptionKey<typeof options>('foo'))).toEqual('this is foo option')
  expect(ctx.translate(resolveOptionKey<typeof options>('bar'))).toEqual('this is bar option')
  expect(ctx.translate(resolveOptionKey<typeof options>('no-bar'))).toEqual('')
  expect(ctx.translate(resolveOptionKey<typeof options>('baz'))).toEqual('this is baz option')
  expect(ctx.translate(resolveBuiltInKey('help'))).toEqual('Display this help message')
  expect(ctx.translate(resolveBuiltInKey('version'))).toEqual('Display this version')
  expect(ctx.translate('examples')).toEqual('examples')

  expect(ctx.env.subCommands).toEqual(subCommands)

  /**
   * check no prototype chains
   */

  expect(hasPrototype(ctx)).toEqual(false)
  expect(hasPrototype(ctx.env)).toEqual(false)
  // expect(hasPrototype(ctx.options)).toEqual(false)
  for (const value of Object.values(ctx.options)) {
    expect(hasPrototype(value)).toEqual(false)
  }
  // expect(hasPrototype(ctx.values)).toEqual(false)

  /**
   * check frozen
   */

  expect(Object.isFrozen(ctx)).toEqual(true)
  expect(Object.isFrozen(ctx.env)).toEqual(true)
  expect(Object.isFrozen(ctx.env.subCommands)).toEqual(true)
  expect(Object.isFrozen(ctx.options)).toEqual(true)
  for (const value of Object.values(ctx.options)) {
    expect(Object.isFrozen(value)).toEqual(true)
  }
  expect(Object.isFrozen(ctx.values)).toEqual(true)
})

test('default', async () => {
  const command = {
    run: vi.fn()
  }
  const ctx = await createCommandContext({
    options: {},
    values: { foo: 'foo', bar: true, baz: 42 },
    positionals: ['bar'],
    rest: [],
    args: ['bar'],
    tokens: [], // dummy, due to test
    command,
    omitted: false,
    commandOptions: {}
  })

  /**
   * check values
   */

  expect(ctx).toMatchObject({
    name: undefined,
    description: undefined,
    options: {},
    values: { foo: 'foo', bar: true, baz: 42 },
    positionals: ['bar'],
    omitted: false
  })
  expect(ctx.env).toMatchObject({
    name: undefined,
    description: undefined,
    version: undefined,
    cwd: undefined,
    leftMargin: 2,
    middleMargin: 10,
    usageOptionType: false,
    renderHeader: undefined,
    renderUsage: undefined,
    renderValidationErrors: undefined
  })
  // The usage property has been removed, so we check the built-in options directly
  expect(ctx.translate(resolveBuiltInKey('help'))).toEqual('Display this help message')
  expect(ctx.translate(resolveBuiltInKey('version'))).toEqual('Display this version')
})

describe('translation', () => {
  test('default', async () => {
    const command = {
      run: vi.fn()
    }
    const ctx = await createCommandContext({
      options: {},
      values: { foo: 'foo', bar: true, baz: 42 },
      positionals: ['bar'],
      rest: [],
      args: ['bar'],
      tokens: [], // dummy, due to test
      command,
      omitted: false,
      commandOptions: {}
    })

    // locale en-US
    expect(ctx.locale.toString()).toEqual(DEFAULT_LOCALE)

    // built-in command resources
    expect(ctx.translate(resolveBuiltInKey('COMMAND'))).toEqual('COMMAND')
    expect(ctx.translate(resolveBuiltInKey('COMMANDS'))).toEqual('COMMANDS')
    expect(ctx.translate(resolveBuiltInKey('SUBCOMMAND'))).toEqual('SUBCOMMAND')
    expect(ctx.translate(resolveBuiltInKey('OPTIONS'))).toEqual('OPTIONS')
    expect(ctx.translate(resolveBuiltInKey('EXAMPLES'))).toEqual('EXAMPLES')
    expect(ctx.translate(resolveBuiltInKey('USAGE'))).toEqual('USAGE')
    expect(ctx.translate(resolveBuiltInKey('FORMORE'))).toEqual(
      'For more info, run any command with the `--help` flag:'
    )

    // description, options, and examples
    expect(ctx.translate(resolveBuiltInKey('help'))).toEqual(DefaultLocale.help)
    expect(ctx.translate(resolveBuiltInKey('version'))).toEqual(DefaultLocale.version)
    expect(ctx.translate('description')).toEqual('') // not defined in the command
    expect(ctx.translate('examples')).toEqual('') // not defined in the command
  })

  test('basic', async () => {
    const options = {
      foo: {
        type: 'string',
        short: 'f',
        description: 'this is foo option'
      },
      bar: {
        type: 'boolean',
        description: 'this is bar option'
      },
      baz: {
        type: 'number',
        short: 'b',
        default: 42,
        description: 'this is baz option'
      }
    } satisfies ArgOptions

    const command = {
      options,
      name: 'cmd1',
      description: 'this is cmd1',
      examples: 'this is an cmd1 example',
      run: vi.fn()
    } satisfies Command<ArgOptions>

    const ctx = await createCommandContext({
      options,
      values: { foo: 'foo', bar: true, baz: 42 },
      positionals: ['bar'],
      rest: [],
      args: ['bar'],
      tokens: [], // dummy, due to test
      command,
      omitted: false,
      commandOptions: {}
    })

    // description, options, and examples
    expect(ctx.translate(resolveBuiltInKey('help'))).toEqual(DefaultLocale.help)
    expect(ctx.translate(resolveBuiltInKey('version'))).toEqual(DefaultLocale.version)
    expect(ctx.translate(resolveOptionKey<typeof options>('foo'))).toEqual('this is foo option')
    expect(ctx.translate(resolveOptionKey<typeof options>('bar'))).toEqual('this is bar option')
    expect(ctx.translate(resolveOptionKey<typeof options>('baz'))).toEqual('this is baz option')
    expect(ctx.translate('description')).toEqual('this is cmd1')
    expect(ctx.translate('examples')).toEqual('this is an cmd1 example')
  })

  test('load another locale resource', async () => {
    const options = {
      foo: {
        type: 'string',
        short: 'f',
        description: 'this is foo option'
      },
      bar: {
        type: 'boolean',
        description: 'this is bar option'
      },
      baz: {
        type: 'number',
        short: 'b',
        default: 42,
        description: 'this is baz option'
      }
    } satisfies ArgOptions

    const jaJPResource = {
      description: 'これはコマンド1です',
      'Option:foo': 'これは foo オプションです',
      'Option:bar': 'これは bar オプションです',
      'Option:baz': 'これは baz オプションです',
      'Option:no-bar': 'これは bar オプションの否定形です',
      examples: 'これはコマンド1の例です',
      test: 'これはテストです'
    } satisfies CommandResource<typeof options>

    const loadLocale = 'ja-JP'

    const mockResource = vi.fn<CommandResourceFetcher<typeof options>>().mockImplementation(ctx => {
      if (ctx.locale.toString() === loadLocale) {
        return Promise.resolve(jaJPResource)
      } else {
        throw new Error('not found')
      }
    })

    const command = {
      name: 'cmd1',
      options,
      examples: 'this is an cmd1 example',
      run: vi.fn(),
      resource: mockResource
    } satisfies Command<typeof options>

    const ctx = await createCommandContext({
      options,
      values: { foo: 'foo', bar: true, baz: 42 },
      positionals: ['bar'],
      rest: [],
      args: ['bar'],
      tokens: [], // dummy, due to test
      command,
      omitted: false,
      commandOptions: {
        description: 'this is cmd1',
        locale: new Intl.Locale(loadLocale)
      }
    })

    expect(ctx.locale.toString()).toEqual(loadLocale)

    // built-in command resources
    expect(ctx.translate(resolveBuiltInKey('help'))).toEqual(jaLocale.help)
    expect(ctx.translate(resolveBuiltInKey('version'))).toEqual(jaLocale.version)
    expect(ctx.translate(resolveBuiltInKey('FORMORE'))).toEqual(jaLocale.FORMORE)

    // description, options, and examples
    expect(ctx.translate('description')).toEqual(jaJPResource.description)
    expect(ctx.translate(resolveOptionKey<typeof options>('foo'))).toEqual(
      jaJPResource['Option:foo']
    )
    expect(ctx.translate(resolveOptionKey<typeof options>('bar'))).toEqual(
      jaJPResource['Option:bar']
    )
    expect(ctx.translate(resolveOptionKey<typeof options>('no-bar'))).toEqual(
      jaJPResource['Option:no-bar']
    )
    expect(ctx.translate(resolveOptionKey<typeof options>('baz'))).toEqual(
      jaJPResource['Option:baz']
    )
    expect(ctx.translate('examples')).toEqual(jaJPResource.examples)

    // user defined resource
    expect(ctx.translate<keyof typeof jaJPResource>('test')).toEqual(jaJPResource.test)
  })
})

describe('translation adapter', () => {
  test('Intl.MessageFormat (MF2)', async () => {
    const options = {
      foo: {
        type: 'string',
        short: 'f',
        description: 'this is foo option'
      }
    } satisfies ArgOptions

    const jaJPResource = {
      description: 'これはコマンド1です',
      'Option:foo': 'これは foo オプションです',
      examples: 'これはコマンド1の例です',
      user: 'こんにちは、{$user}'
    } satisfies CommandResource<typeof options>

    const loadLocale = 'ja-JP'

    const mockResource = vi.fn<CommandResourceFetcher<typeof options>>().mockImplementation(ctx => {
      if (ctx.locale.toString() === loadLocale) {
        return Promise.resolve(jaJPResource)
      } else {
        throw new Error('not found')
      }
    })

    const command = {
      name: 'cmd1',
      options,
      examples: 'this is an cmd1 example',
      run: vi.fn(),
      resource: mockResource
    } satisfies Command<typeof options>

    const ctx = await createCommandContext({
      options,
      values: { foo: 'foo', bar: true, baz: 42 },
      positionals: ['bar'],
      rest: [],
      args: ['bar'],
      tokens: [], // dummy, due to test
      command,
      omitted: false,
      commandOptions: {
        description: 'this is cmd1',
        locale: new Intl.Locale(loadLocale),
        translationAdapterFactory: createTranslationAdapterForMessageFormat2
      }
    })

    const mf1 = new MessageFormat('ja-JP', jaJPResource['Option:foo'])
    expect(ctx.translate('Option:foo')).toEqual(mf1.format())
    const mf2 = new MessageFormat('ja-JP', jaJPResource.user)
    expect(ctx.translate('user', { user: 'kazupon' })).toEqual(mf2.format({ user: 'kazupon' }))
  })

  test('Intlify Message Format', async () => {
    const options = {
      foo: {
        type: 'string',
        short: 'f',
        description: 'this is foo option'
      }
    } satisfies ArgOptions

    const jaJPResource = {
      description: 'これはコマンド1です',
      'Option:foo': 'これは foo オプションです',
      examples: 'これはコマンド1の例です',
      user: 'こんにちは、{user}'
    } satisfies CommandResource<typeof options>

    const loadLocale = 'ja-JP'

    const mockResource = vi.fn<CommandResourceFetcher<typeof options>>().mockImplementation(ctx => {
      if (ctx.locale.toString() === loadLocale) {
        return Promise.resolve(jaJPResource)
      } else {
        throw new Error('not found')
      }
    })

    const command = {
      name: 'cmd1',
      options,
      examples: 'this is an cmd1 example',
      run: vi.fn(),
      resource: mockResource
    } satisfies Command<typeof options>

    const ctx = await createCommandContext({
      options,
      values: { foo: 'foo', bar: true, baz: 42 },
      positionals: ['bar'],
      rest: [],
      args: ['bar'],
      tokens: [], // dummy, due to test
      command,
      omitted: false,
      commandOptions: {
        description: 'this is cmd1',
        locale: new Intl.Locale(loadLocale),
        translationAdapterFactory: createTranslationAdapterForIntlifyMessageFormat
      }
    })

    expect(ctx.translate('Option:foo')).toEqual(jaJPResource['Option:foo'])
    expect(ctx.translate('user', { user: 'kazupon' })).toEqual(`こんにちは、kazupon`)
  })
})
