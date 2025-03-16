import { describe, expect, test, vi } from 'vitest'
import DefaultLocale from '../locales/en-US.json'
import jaLocale from '../locales/ja-JP.json'
import { hasPrototype } from '../test/utils.js'
import { DEFAULT_LOCALE } from './constants.js'
import { createCommandContext } from './context.js'
import { resolveBuiltInKey } from './utils.js'

import type { ArgOptions } from 'args-tokens'
import type { Command, CommandResource, CommandResourceFetcher, LazyCommand } from './types'

test('basic', async () => {
  const command = {
    name: 'cmd1',
    description: 'this is cmd1',
    usage: {
      options: {
        foo: 'this is foo option',
        bar: 'this is bar option',
        baz: 'this is baz option'
      },
      examples: 'examples'
    },
    run: vi.fn()
  }
  const subCommands = new Map<string, Command<ArgOptions> | LazyCommand<ArgOptions>>()
  subCommands.set('cmd2', { name: 'cmd2', run: vi.fn() })

  const mockRenderUsage = vi.fn()
  const mockRenderValidationErrors = vi.fn()

  const ctx = await createCommandContext({
    options: {
      foo: {
        type: 'string',
        short: 'f'
      },
      bar: {
        type: 'boolean'
      },
      baz: {
        type: 'number',
        short: 'b',
        default: 42
      }
    },
    values: { foo: 'foo', bar: true, baz: 42 },
    positionals: ['bar'],
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
  expect(ctx.usage).toMatchObject({
    options: {
      foo: 'this is foo option',
      bar: 'this is bar option',
      baz: 'this is baz option',
      help: 'Display this help message',
      version: 'Display this version'
    },
    examples: 'examples'
  })

  expect(ctx.env.subCommands).toEqual(subCommands) // TODO: use Map

  /**
   * check no prototype chains
   */

  expect(hasPrototype(ctx)).toEqual(false)
  expect(hasPrototype(ctx.env)).toEqual(false)
  expect(hasPrototype(ctx.options)).toEqual(false)
  for (const value of Object.values(ctx.options!)) {
    expect(hasPrototype(value)).toEqual(false)
  }
  expect(hasPrototype(ctx.values)).toEqual(false)

  /**
   * check frozen
   */

  expect(Object.isFrozen(ctx)).toEqual(true)
  expect(Object.isFrozen(ctx.env)).toEqual(true)
  expect(Object.isFrozen(ctx.env.subCommands)).toEqual(true)
  expect(Object.isFrozen(ctx.options)).toEqual(true)
  for (const value of Object.values(ctx.options!)) {
    expect(Object.isFrozen(value)).toEqual(true)
  }
  expect(Object.isFrozen(ctx.values)).toEqual(true)
})

test('default', async () => {
  const command = {
    run: vi.fn()
  }
  const ctx = await createCommandContext({
    options: undefined,
    values: { foo: 'foo', bar: true, baz: 42 },
    positionals: ['bar'],
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
    options: undefined,
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
  expect(ctx.usage).toMatchObject({
    options: {
      help: 'Display this help message',
      version: 'Display this version'
    }
  })
})

describe('translation', () => {
  test('default', async () => {
    const command = {
      run: vi.fn()
    }
    const ctx = await createCommandContext({
      options: undefined,
      values: { foo: 'foo', bar: true, baz: 42 },
      positionals: ['bar'],
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
    const command = {
      name: 'cmd1',
      description: 'this is cmd1',
      usage: {
        options: {
          foo: 'this is foo option',
          bar: 'this is bar option',
          baz: 'this is baz option'
        },
        examples: 'this is an cmd1 example'
      },
      run: vi.fn()
    } satisfies Command<ArgOptions>
    const ctx = await createCommandContext({
      options: undefined,
      values: { foo: 'foo', bar: true, baz: 42 },
      positionals: ['bar'],
      command,
      omitted: false,
      commandOptions: {}
    })

    type OptionsKeys = keyof typeof command.usage.options

    // description, options, and examples
    expect(ctx.translate(resolveBuiltInKey('help'))).toEqual(DefaultLocale.help)
    expect(ctx.translate(resolveBuiltInKey('version'))).toEqual(DefaultLocale.version)
    expect(ctx.translate('description')).toEqual('this is cmd1')
    expect(ctx.translate<OptionsKeys>('foo')).toEqual('this is foo option')
    expect(ctx.translate<OptionsKeys>('bar')).toEqual('this is bar option')
    expect(ctx.translate<OptionsKeys>('baz')).toEqual('this is baz option')
    expect(ctx.translate('examples')).toEqual('this is an cmd1 example')
  })

  test('load another locale resource', async () => {
    const options = {
      foo: {
        type: 'string',
        short: 'f'
      },
      bar: {
        type: 'boolean'
      },
      baz: {
        type: 'number',
        short: 'b',
        default: 42
      }
    } satisfies ArgOptions

    const jaJPResource = {
      description: 'これはコマンド1です',
      options: {
        foo: 'これは foo オプションです',
        bar: 'これは bar オプションです',
        baz: 'これは baz オプションです'
      },
      examples: 'これはコマンド1の例です'
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
      usage: {
        options: {
          foo: 'this is foo option',
          bar: 'this is bar option',
          baz: 'this is baz option'
        },
        examples: 'this is an cmd1 example'
      },
      run: vi.fn(),
      resource: mockResource
    } satisfies Command<typeof options>

    const ctx = await createCommandContext({
      options,
      values: { foo: 'foo', bar: true, baz: 42 },
      positionals: ['bar'],
      command,
      omitted: false,
      commandOptions: {
        description: 'this is cmd1',
        locale: new Intl.Locale(loadLocale)
      }
    })

    expect(ctx.locale.toString()).toEqual(loadLocale)

    type OptionsKeys = keyof typeof command.usage.options

    // built-in command resources
    expect(ctx.translate(resolveBuiltInKey('help'))).toEqual(jaLocale.help)
    expect(ctx.translate(resolveBuiltInKey('version'))).toEqual(jaLocale.version)
    expect(ctx.translate(resolveBuiltInKey('FORMORE'))).toEqual(jaLocale.FORMORE)

    // description, options, and examples
    expect(ctx.translate('description')).toEqual(jaJPResource.description)
    expect(ctx.translate<OptionsKeys>('foo')).toEqual(jaJPResource.options.foo)
    expect(ctx.translate<OptionsKeys>('bar')).toEqual(jaJPResource.options.bar)
    expect(ctx.translate<OptionsKeys>('baz')).toEqual(jaJPResource.options.baz)
    expect(ctx.translate('examples')).toEqual(jaJPResource.examples)
  })
})
