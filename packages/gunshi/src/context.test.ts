import { MessageFormat } from 'messageformat'
import { describe, expect, test, vi } from 'vitest'
import {
  createMockCommandContext,
  createTranslationAdapterForIntlifyMessageFormat,
  createTranslationAdapterForMessageFormat2,
  hasPrototype
} from '../test/utils.ts'
import { ANONYMOUS_COMMAND_NAME, DEFAULT_LOCALE } from './constants.ts'
import { createCommandContext } from './context.ts'
import DefaultLocale from './locales/en-US.json' with { type: 'json' }
import jaLocale from './locales/ja-JP.json' with { type: 'json' }
import { resolveArgKey, resolveBuiltInKey } from './utils.ts'

import type { Args } from 'args-tokens'
import type {
  Command,
  CommandContextCore,
  CommandContextExtension,
  CommandResource,
  CommandResourceFetcher,
  DefaultGunshiParams,
  GunshiParams,
  LazyCommand
} from './types.ts'

test('basic', async () => {
  const args = {
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
    },
    qux: {
      type: 'boolean',
      short: 'q',
      negatable: true,
      description: 'this is qux option'
    }
  } satisfies Args

  const command = {
    name: 'cmd1',
    description: 'this is cmd1',
    args,
    examples: 'examples',
    run: vi.fn()
  } satisfies Command<GunshiParams<{ args: typeof args }>>

  const subCommands = new Map<
    string,
    Command<GunshiParams<Args>> | LazyCommand<GunshiParams<Args>>
  >()
  subCommands.set('cmd2', { name: 'cmd2', run: vi.fn() })

  const mockRenderUsage = vi.fn()
  const mockRenderValidationErrors = vi.fn()

  const ctx = await createCommandContext({
    args,
    values: { foo: 'foo', bar: true, baz: 42 },
    positionals: ['bar'],
    rest: [],
    argv: ['bar'],
    tokens: [], // dummy, due to test
    omitted: true,
    callMode: 'entry',
    command,
    extensions: {},
    cliOptions: {
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
      // @ts-ignore -- TODO(kazupon): resolve type
      subCommands
    }
  })

  /**
   * check values
   */

  expect(ctx).toMatchObject({
    name: 'cmd1',
    description: 'this is cmd1',
    args: { foo: { type: 'string' } },
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

  expect(ctx.translate(resolveArgKey<typeof args>('foo'))).toEqual('this is foo option')
  expect(ctx.translate(resolveArgKey<typeof args>('bar'))).toEqual('this is bar option')
  expect(ctx.translate(resolveArgKey<typeof args>('baz'))).toEqual('this is baz option')
  expect(ctx.translate(resolveArgKey<typeof args>('qux'))).toEqual('this is qux option')
  expect(ctx.translate(resolveArgKey<typeof args>('no-qux'))).toEqual('')
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
  for (const value of Object.values(ctx.args)) {
    expect(hasPrototype(value)).toEqual(false)
  }
  // expect(hasPrototype(ctx.values)).toEqual(false)

  /**
   * check frozen
   */

  expect(Object.isFrozen(ctx)).toEqual(true)
  expect(Object.isFrozen(ctx.env)).toEqual(true)
  expect(Object.isFrozen(ctx.env.subCommands)).toEqual(true)
  expect(Object.isFrozen(ctx.args)).toEqual(true)
  for (const value of Object.values(ctx.args)) {
    expect(Object.isFrozen(value)).toEqual(true)
  }
  expect(Object.isFrozen(ctx.values)).toEqual(true)
})

test('default', async () => {
  const command = {
    run: vi.fn()
  }
  const ctx = await createCommandContext({
    args: {},
    values: { foo: 'foo', bar: true, baz: 42 },
    positionals: ['bar'],
    rest: [],
    argv: ['bar'],
    tokens: [], // dummy, due to test
    command,
    extensions: {},
    omitted: false,
    callMode: 'entry',
    cliOptions: {}
  })

  /**
   * check values
   */

  expect(ctx).toMatchObject({
    name: ANONYMOUS_COMMAND_NAME,
    description: undefined,
    args: {},
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
      args: {},
      values: { foo: 'foo', bar: true, baz: 42 },
      positionals: ['bar'],
      rest: [],
      argv: ['bar'],
      tokens: [], // dummy, due to test
      command,
      extensions: {},
      omitted: false,
      callMode: 'entry',
      cliOptions: {}
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
    const args = {
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
    } satisfies Args

    const command = {
      args,
      name: 'cmd1',
      description: 'this is cmd1',
      examples: 'this is an cmd1 example',
      run: vi.fn()
    } satisfies Command<GunshiParams<Args>>

    const ctx = await createCommandContext({
      args,
      values: { foo: 'foo', bar: true, baz: 42 },
      positionals: ['bar'],
      rest: [],
      argv: ['bar'],
      tokens: [], // dummy, due to test
      command,
      extensions: {},
      omitted: false,
      callMode: 'entry',
      cliOptions: {}
    })

    // description, options, and examples
    expect(ctx.translate(resolveBuiltInKey('help'))).toEqual(DefaultLocale.help)
    expect(ctx.translate(resolveBuiltInKey('version'))).toEqual(DefaultLocale.version)
    expect(ctx.translate(resolveArgKey<typeof args>('foo'))).toEqual('this is foo option')
    expect(ctx.translate(resolveArgKey<typeof args>('bar'))).toEqual('this is bar option')
    expect(ctx.translate(resolveArgKey<typeof args>('baz'))).toEqual('this is baz option')
    expect(ctx.translate('description')).toEqual('this is cmd1')
    expect(ctx.translate('examples')).toEqual('this is an cmd1 example')
  })

  test('load another locale resource', async () => {
    const args = {
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
      },
      qux: {
        type: 'boolean',
        negatable: true
      }
    } satisfies Args

    const jaJPResource = {
      description: 'これはコマンド1です',
      'arg:foo': 'これは foo オプションです',
      'arg:bar': 'これは bar オプションです',
      'arg:baz': 'これは baz オプションです',
      'arg:qux': 'これは qux オプションです',
      'arg:no-qux': 'これは qux オプションの否定形です',
      examples: 'これはコマンド1の例です',
      test: 'これはテストです'
    } satisfies CommandResource<GunshiParams<{ args: typeof args }>>

    const loadLocale = 'ja-JP'

    using mockResource = vi
      .fn<CommandResourceFetcher<GunshiParams<{ args: typeof args }>>>()
      .mockImplementation(ctx => {
        if (ctx.locale.toString() === loadLocale) {
          return Promise.resolve(jaJPResource)
        } else {
          throw new Error('not found')
        }
      })

    const command = {
      name: 'cmd1',
      args,
      examples: 'this is an cmd1 example',
      run: vi.fn(),
      resource: mockResource
    } satisfies Command<GunshiParams<{ args: typeof args }>>

    const ctx = await createCommandContext<GunshiParams<{ args: typeof args }>>({
      args,
      values: { foo: 'foo', bar: true, baz: 42 },
      positionals: ['bar'],
      rest: [],
      argv: ['bar'],
      tokens: [], // dummy, due to test
      command,
      extensions: {},
      omitted: false,
      callMode: 'entry',
      cliOptions: {
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
    expect(ctx.translate(resolveArgKey<typeof args>('foo'))).toEqual(jaJPResource['arg:foo'])
    expect(ctx.translate(resolveArgKey<typeof args>('bar'))).toEqual(jaJPResource['arg:bar'])
    expect(ctx.translate(resolveArgKey<typeof args>('baz'))).toEqual(jaJPResource['arg:baz'])
    expect(ctx.translate(resolveArgKey<typeof args>('qux'))).toEqual(jaJPResource['arg:qux'])
    expect(ctx.translate(resolveArgKey<typeof args>('no-qux'))).toEqual(jaJPResource['arg:no-qux'])
    expect(ctx.translate('examples')).toEqual(jaJPResource.examples)

    // user defined resource
    expect(ctx.translate<keyof typeof jaJPResource>('test')).toEqual(jaJPResource.test)
  })
})

describe('translation adapter', () => {
  test('Intl.MessageFormat (MF2)', async () => {
    const args = {
      foo: {
        type: 'string',
        short: 'f',
        description: 'this is foo option'
      }
    } satisfies Args

    const jaJPResource = {
      description: 'これはコマンド1です',
      'arg:foo': 'これは foo オプションです',
      examples: 'これはコマンド1の例です',
      user: 'こんにちは、{$user}'
    } satisfies CommandResource<GunshiParams<{ args: typeof args }>>

    const loadLocale = 'ja-JP'

    using mockResource = vi
      .fn<CommandResourceFetcher<GunshiParams<{ args: typeof args }>>>()
      .mockImplementation(ctx => {
        if (ctx.locale.toString() === loadLocale) {
          return Promise.resolve(jaJPResource)
        } else {
          throw new Error('not found')
        }
      })

    const command = {
      name: 'cmd1',
      args,
      examples: 'this is an cmd1 example',
      run: vi.fn(),
      resource: mockResource
    } satisfies Command<GunshiParams<{ args: typeof args }>>

    const ctx = await createCommandContext<GunshiParams<{ args: typeof args }>>({
      args,
      values: { foo: 'foo' },
      positionals: ['bar'],
      rest: [],
      argv: ['bar'],
      tokens: [], // dummy, due to test
      command,
      extensions: {},
      omitted: false,
      callMode: 'entry',
      cliOptions: {
        description: 'this is cmd1',
        locale: new Intl.Locale(loadLocale),
        translationAdapterFactory: createTranslationAdapterForMessageFormat2
      }
    })

    const mf1 = new MessageFormat('ja-JP', jaJPResource['arg:foo'])
    expect(ctx.translate('arg:foo')).toEqual(mf1.format())
    const mf2 = new MessageFormat('ja-JP', jaJPResource.user)
    expect(ctx.translate('user', { user: 'kazupon' })).toEqual(mf2.format({ user: 'kazupon' }))
  })

  test('Intlify Message Format', async () => {
    const args = {
      foo: {
        type: 'string',
        short: 'f',
        description: 'this is foo option'
      }
    } satisfies Args

    const jaJPResource = {
      description: 'これはコマンド1です',
      'arg:foo': 'これは foo オプションです',
      examples: 'これはコマンド1の例です',
      user: 'こんにちは、{user}'
    } satisfies CommandResource<GunshiParams<{ args: typeof args }>>

    const loadLocale = 'ja-JP'

    using mockResource = vi
      .fn<CommandResourceFetcher<GunshiParams<{ args: typeof args }>>>()
      .mockImplementation(ctx => {
        if (ctx.locale.toString() === loadLocale) {
          return Promise.resolve(jaJPResource)
        } else {
          throw new Error('not found')
        }
      })

    const command = {
      name: 'cmd1',
      args,
      examples: 'this is an cmd1 example',
      run: vi.fn(),
      resource: mockResource
    } satisfies Command<GunshiParams<{ args: typeof args }>>

    const ctx = await createCommandContext<GunshiParams<{ args: typeof args }>>({
      args,
      values: { foo: 'foo' },
      positionals: ['bar'],
      rest: [],
      argv: ['bar'],
      tokens: [], // dummy, due to test
      command,
      extensions: {},
      omitted: false,
      callMode: 'entry',
      cliOptions: {
        description: 'this is cmd1',
        locale: new Intl.Locale(loadLocale),
        translationAdapterFactory: createTranslationAdapterForIntlifyMessageFormat
      }
    })

    expect(ctx.translate('arg:foo')).toEqual(jaJPResource['arg:foo'])
    expect(ctx.translate('user', { user: 'kazupon' })).toEqual(`こんにちは、kazupon`)
  })
})

describe('plugin extensions', () => {
  test('applies extensions to context', async () => {
    type AuthExtension = {
      user: { id: number; name: string }
      isAuthenticated: boolean
      getCommandName: () => string
    }
    const authExtension: CommandContextExtension<AuthExtension> = {
      key: Symbol('auth'),
      factory: vi.fn((_core: CommandContextCore) => ({
        user: { id: 1, name: 'Test User' },
        isAuthenticated: true,
        getCommandName: () => _core.name!
      }))
    }

    type DbExtension = {
      query: (sql: string) => Promise<{ rows: string[]; sql: string }>
      connected: boolean
    }
    const dbExtension: CommandContextExtension<DbExtension> = {
      key: Symbol('db'),
      factory: vi.fn((_core: CommandContextCore) => ({
        query: async (sql: string) => ({ rows: [], sql }),
        connected: true
      }))
    }

    const args = { token: { type: 'string' as const } }
    const command: Command<
      GunshiParams<{ args: typeof args; extensions: { auth: AuthExtension; db: DbExtension } }>
    > = {
      name: 'test-cmd',
      args,
      run: async ctx => {
        // access extensions
        return `${ctx.extensions.auth.user.name} - ${ctx.extensions.db.connected}`
      }
    }

    const ctx = await createCommandContext<
      GunshiParams<{ args: typeof args; extensions: { auth: AuthExtension; db: DbExtension } }>
    >({
      args,
      values: { token: 'test-token' },
      positionals: [],
      rest: [],
      argv: [],
      tokens: [],
      command,
      extensions: {
        auth: authExtension,
        db: dbExtension
      },
      omitted: false,
      callMode: 'entry',
      cliOptions: {}
    })

    // check that extensions are applied
    expect(ctx.extensions).toBeDefined()
    expect(ctx.extensions.auth).toBeDefined()
    expect(ctx.extensions.auth.user).toEqual({ id: 1, name: 'Test User' })
    expect(ctx.extensions.auth.isAuthenticated).toBe(true)
    expect(ctx.extensions.auth.getCommandName()).toBe('test-cmd')

    expect(ctx.extensions.db).toBeDefined()
    expect(ctx.extensions.db.connected).toBe(true)
    expect(typeof ctx.extensions.db.query).toBe('function')

    // check that factories were called with core context
    expect(authExtension.factory).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'test-cmd',
        values: { token: 'test-token' }
      })
    )
    expect(dbExtension.factory).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'test-cmd',
        values: { token: 'test-token' }
      })
    )
  })

  test('multiple plugin extensions', async () => {
    const extensions = {
      ext1: {
        key: Symbol('ext1'),
        factory: () => ({ value1: 'test1' })
      },
      ext2: {
        key: Symbol('ext2'),
        factory: () => ({ value2: 'test2' })
      },
      ext3: {
        key: Symbol('ext3'),
        factory: () => ({ value3: 'test3' })
      }
    }

    const command: Command<DefaultGunshiParams> = {
      name: 'multi-ext',
      run: async _ctx => 'done'
    }

    const ctx = await createCommandContext({
      args: {},
      values: {},
      positionals: [],
      rest: [],
      argv: [],
      tokens: [],
      command,
      extensions,
      omitted: false,
      callMode: 'entry',
      cliOptions: {}
    })

    expect(ctx.extensions).toBeDefined()
    expect(ctx.extensions.ext1.value1).toBe('test1')
    expect(ctx.extensions.ext2.value2).toBe('test2')
    expect(ctx.extensions.ext3.value3).toBe('test3')
  })

  test('extension factory execution order', async () => {
    const executionOrder: string[] = []

    const ext1: CommandContextExtension = {
      key: Symbol('ext1'),
      factory: _core => {
        executionOrder.push('ext1')
        return { order: 1 }
      }
    }

    const ext2: CommandContextExtension = {
      key: Symbol('ext2'),
      factory: _core => {
        executionOrder.push('ext2')
        return { order: 2 }
      }
    }

    const ext3: CommandContextExtension = {
      key: Symbol('ext3'),
      factory: _core => {
        executionOrder.push('ext3')
        return { order: 3 }
      }
    }

    const command: Command<DefaultGunshiParams> = {
      name: 'order-test',
      run: async _ctx => 'done'
    }

    await createCommandContext({
      args: {},
      values: {},
      positionals: [],
      rest: [],
      argv: [],
      tokens: [],
      command,
      extensions: {
        ext1,
        ext2,
        ext3
      },
      omitted: false,
      callMode: 'entry',
      cliOptions: {}
    })

    // extensions should be processed in the order they appear in the object
    expect(executionOrder).toEqual(['ext1', 'ext2', 'ext3'])
  })

  test('without extensions - backward compatibility', async () => {
    const args = { name: { type: 'string' as const } }
    const command: Command<GunshiParams<{ args: typeof args }>> = {
      name: 'simple',
      args,
      run: async ctx => `Hello, ${ctx.values.name}!`
    }

    const ctx = await createCommandContext<GunshiParams<{ args: typeof args }>>({
      args,
      values: { name: 'World' },
      positionals: [],
      rest: [],
      argv: [],
      tokens: [],
      command,
      extensions: {},
      omitted: false,
      callMode: 'entry',
      cliOptions: {}
    })

    // should not have ext property
    expect(ctx.extensions).toBeUndefined()

    // all standard properties should work
    expect(ctx.name).toBe('simple')
    expect(ctx.values.name).toBe('World')
    expect(ctx.args).toEqual(args)
  })

  test('extension can access all context properties', async () => {
    let capturedCore: CommandContextCore | null = null

    type TestExtension = {
      getName: () => string
      getValues: () => Record<string, unknown>
      getPositionals: () => string[]
      translate: (key: string) => string
    }

    const testExtension: CommandContextExtension<TestExtension> = {
      key: Symbol('test'),
      factory: core => {
        capturedCore = core
        return {
          // return methods that use the core context
          getName: () => core.name!,
          getValues: () => core.values,
          getPositionals: () => core.positionals,
          translate: (key: string) => core.translate(key)
        }
      }
    }

    const args = { opt: { type: 'string' as const } }
    const command: Command<
      GunshiParams<{ args: typeof args; extensions: { test: TestExtension } }>
    > = {
      name: 'context-test',
      description: 'Test command',
      args,
      run: async _ctx => 'done'
    }

    await createCommandContext<
      GunshiParams<{ args: typeof args; extensions: { test: TestExtension } }>
    >({
      args,
      values: { opt: 'value' },
      positionals: ['pos1', 'pos2'],
      rest: ['rest1'],
      argv: ['test', 'pos1', 'pos2', '--opt', 'value', '--', 'rest1'],
      tokens: [],
      command,
      extensions: {
        test: testExtension
      },
      omitted: false,
      callMode: 'entry',
      cliOptions: { name: 'test-cli' }
    })

    expect(capturedCore).not.toBeNull()
    expect(capturedCore!.name).toBe('context-test')
    expect(capturedCore!.values).toEqual({ opt: 'value' })
    expect(capturedCore!.positionals).toEqual(['pos1', 'pos2'])
    expect(capturedCore!.rest).toEqual(['rest1'])
    expect(capturedCore!._).toEqual(['test', 'pos1', 'pos2', '--opt', 'value', '--', 'rest1'])
    expect(capturedCore!.callMode).toBe('entry')
    expect(typeof capturedCore!.log).toBe('function')
    expect(typeof capturedCore!.translate).toBe('function')
  })
})

describe('CommandContextCore type', () => {
  test('is readonly version of CommandContext', async () => {
    const args = { flag: { type: 'boolean' as const } }
    const command: Command<GunshiParams<{ args: typeof args }>> = {
      name: 'readonly-test',
      args,
      run: async _ctx => 'done'
    }

    const ctx = await createCommandContext<GunshiParams<{ args: typeof args }>>({
      args,
      values: { flag: true },
      positionals: [],
      rest: [],
      argv: [],
      tokens: [],
      command,
      extensions: {},
      omitted: false,
      callMode: 'entry',
      cliOptions: {}
    })

    const core: CommandContextCore<GunshiParams<{ args: typeof args }>> = ctx

    expect(core.name).toBe('readonly-test')
    expect(core.values.flag).toBe(true)
    expect(core.args).toEqual(args)
    expect(typeof core.log).toBe('function')
    expect(typeof core.translate).toBe('function')
  })
})

describe('CommandContextExtension type', () => {
  test('extension key is unique symbol', () => {
    const extension1: CommandContextExtension = {
      key: Symbol('test1'),
      factory: () => ({ value: 1 })
    }

    const extension2: CommandContextExtension = {
      key: Symbol('test2'),
      factory: () => ({ value: 2 })
    }

    expect(extension1.key).not.toBe(extension2.key)
  })

  test('extension factory can return complex objects', () => {
    const dbExtension: CommandContextExtension<{
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query: (sql: string) => Promise<any>
      transaction: (fn: () => Promise<void>) => Promise<void>
    }> = {
      key: Symbol('db'),
      factory: _core => ({
        query: async (_sql: string) => {
          return { rows: [], count: 0 }
        },
        transaction: async (fn: () => Promise<void>) => {
          await fn()
        }
      })
    }

    const mockCore = createMockCommandContext()
    const db = dbExtension.factory(mockCore)

    expect(typeof db.query).toBe('function')
    expect(typeof db.transaction).toBe('function')
  })
})
