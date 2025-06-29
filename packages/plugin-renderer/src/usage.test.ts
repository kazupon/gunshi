import i18n from '@gunshi/plugin-i18n'
import { afterEach, expect, test, vi } from 'vitest'
import { createCommandContext } from '../../gunshi/src/context.ts'
import renderer from './index.ts'
import { renderUsage } from './usage.ts'

import type { Args, Command, DefaultGunshiParams, GunshiParams, LazyCommand } from '@gunshi/plugin'
import type { I18nCommandContext } from '@gunshi/plugin-i18n'
import type { UsageRendererCommandContext } from './types.ts'

afterEach(() => {
  vi.resetAllMocks()
})

/**
 * type aliases for renderUsage
 */

type WithI18nAndRenderer = GunshiParams<{
  args: Args
  extensions: {
    i18n: I18nCommandContext<DefaultGunshiParams> | Promise<I18nCommandContext<DefaultGunshiParams>>
    renderer: UsageRendererCommandContext<DefaultGunshiParams>
  }
}>

type WithRendererOnly = GunshiParams<{
  args: Args
  extensions: {
    renderer: UsageRendererCommandContext<DefaultGunshiParams>
  }
}>

/**
 * setup the plugins
 */

const i18nPlugin = i18n()
const rendererPlugin = renderer()

/**
 * mocks for tests
 */

const NOOP = async () => {}

const SHOW = {
  args: {
    foo: {
      type: 'string',
      short: 'f',
      description: 'The foo option'
    },
    bar: {
      type: 'boolean',
      negatable: true,
      description: 'The bar option'
    },
    baz: {
      type: 'number',
      short: 'b',
      default: 42,
      description: 'The baz option'
    },
    qux: {
      type: 'string',
      short: 'q',
      required: true,
      description: 'The qux option'
    },
    log: {
      type: 'enum',
      short: 'l',
      description: 'The log option',
      choices: ['debug', 'info', 'warn', 'error'],
      default: 'info'
    },
    positional1: {
      type: 'positional',
      description: 'The positional argument 1'
    }
  },
  name: 'show',
  description: 'A show command',
  examples: `# Example 1\n$ test --foo bar --bar --baz 42 --qux quux\n# Example 2\n$ test -f bar -b 42 -q quux`,
  run: NOOP
} as Command<GunshiParams<{ args: Args }>>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const COMMANDS = new Map<string, Command<any> | LazyCommand<any>>()
COMMANDS.set('show', SHOW)
COMMANDS.set('command1', {
  name: 'command1',
  args: {
    foo: {
      type: 'string',
      short: 'f',
      description: 'The foo option'
    }
  },
  description: 'this is command1',
  run: NOOP
})
COMMANDS.set('command2', () =>
  Promise.resolve({
    name: 'command2',
    options: {
      bar: {
        type: 'boolean',
        short: 'b',
        description: 'The bar option'
      }
    },
    description: 'this is command2',
    run: NOOP
  })
)

/**
 * tests for renderUsage
 */

test('basic', async () => {
  const command = {
    args: {
      foo: {
        type: 'string',
        short: 'f',
        description: 'The foo option'
      },
      bar: {
        type: 'boolean',
        description: 'The bar option'
      },
      baz: {
        type: 'number',
        short: 'b',
        default: 42,
        description: 'The baz option'
      },
      qux: {
        type: 'string',
        short: 'q',
        required: true,
        description: 'The qux option'
      }
    },
    name: 'test',
    description: 'A test command',
    examples: `# Example 1\n$ test --foo bar --bar --baz 42 --qux quux\n# Example 2\n$ test -f bar -b 42 -q quux`,
    run: NOOP
  } as Command<GunshiParams<{ args: Args }>>
  const ctx = await createCommandContext({
    args: command.args!,
    values: {},
    positionals: [],
    rest: [],
    argv: [],
    tokens: [], // dummy, due to test
    omitted: false,
    callMode: 'entry',
    command,
    extensions: {
      i18n: i18nPlugin.extension,
      renderer: rendererPlugin.extension
    },
    cliOptions: {
      cwd: '/path/to/cmd1',
      name: 'cmd1',
      description: 'this is command line'
    }
  })

  expect(await renderUsage<WithI18nAndRenderer>(ctx)).toMatchSnapshot()
})

test('no arguments', async () => {
  const command = {
    name: 'test',
    description: 'A test command',
    examples: `# Example 1\n$test\n# Example 2\n$ test`,
    run: async () => {
      // something here
    }
  } as Command<GunshiParams<{ args: Args }>>
  const ctx = await createCommandContext({
    args: {},
    values: {},
    positionals: [],
    rest: [],
    argv: [],
    tokens: [], // dummy, due to test
    omitted: false,
    callMode: 'entry',
    command,
    extensions: {
      i18n: i18nPlugin.extension,
      renderer: rendererPlugin.extension
    },
    cliOptions: {
      cwd: '/path/to/cmd1',
      version: '0.0.0',
      name: 'cmd1'
    }
  })

  expect(await renderUsage<WithI18nAndRenderer>(ctx)).toMatchSnapshot()
})

test('no required on optional arguments', async () => {
  const command = {
    args: {
      foo: {
        type: 'string',
        short: 'f',
        description: 'The foo option'
      },
      bar: {
        type: 'boolean',
        description: 'The bar option'
      },
      baz: {
        type: 'number',
        short: 'b',
        default: 42,
        description: 'The baz option'
      }
    },
    name: 'test',
    description: 'A test command',
    run: NOOP
  } as Command<GunshiParams<{ args: Args }>>
  const ctx = await createCommandContext({
    args: command.args!,
    values: {},
    positionals: [],
    rest: [],
    argv: [],
    tokens: [], // dummy, due to test
    omitted: false,
    callMode: 'entry',
    command,
    extensions: {
      i18n: i18nPlugin.extension,
      renderer: rendererPlugin.extension
    },
    cliOptions: {
      cwd: '/path/to/cmd1',
      version: '0.0.0',
      name: 'cmd1'
    }
  })

  expect(await renderUsage<WithI18nAndRenderer>(ctx)).toMatchSnapshot()
})

test('positional arguments', async () => {
  const command = {
    args: {
      foo: {
        type: 'positional',
        description: 'The foo argument'
      },
      bar: {
        type: 'positional',
        description: 'The bar argument'
      }
    },
    name: 'test',
    description: 'A test command',
    run: NOOP
  } as Command<GunshiParams<{ args: Args }>>

  const ctx = await createCommandContext({
    args: command.args!,
    values: {},
    positionals: [],
    rest: [],
    argv: [],
    tokens: [], // dummy, due to test
    omitted: false,
    callMode: 'entry',
    command,
    extensions: {
      i18n: i18nPlugin.extension,
      renderer: rendererPlugin.extension
    },
    cliOptions: {
      cwd: '/path/to/cmd1',
      version: '0.0.0',
      name: 'cmd1'
    }
  })

  expect(await renderUsage<WithI18nAndRenderer>(ctx)).toMatchSnapshot()
})

test('mixed positionals and optionals', async () => {
  const command = {
    args: {
      foo: {
        type: 'positional',
        description: 'The foo argument'
      },
      bar: {
        type: 'string',
        short: 'b',
        description: 'The bar option'
      },
      baz: {
        type: 'positional',
        description: 'The bar argument'
      },
      qux: {
        type: 'enum',
        description: 'The qux option',
        choices: ['a', 'b', 'c']
      }
    },
    name: 'test',
    description: 'A test command',
    run: NOOP
  } as Command<GunshiParams<{ args: Args }>>

  const ctx = await createCommandContext({
    args: command.args!,
    values: {},
    positionals: [],
    rest: [],
    argv: [],
    tokens: [], // dummy, due to test
    omitted: false,
    callMode: 'entry',
    command,
    extensions: {
      i18n: i18nPlugin.extension,
      renderer: rendererPlugin.extension
    },
    cliOptions: {
      cwd: '/path/to/cmd1',
      version: '0.0.0',
      name: 'cmd1'
    }
  })

  expect(await renderUsage<WithI18nAndRenderer>(ctx)).toMatchSnapshot()
})

test('no examples', async () => {
  const command = {
    args: {
      foo: {
        type: 'string',
        short: 'f',
        description: 'The foo option'
      },
      bar: {
        type: 'boolean',
        description: 'The bar option'
      },
      baz: {
        type: 'number',
        short: 'b',
        default: 42,
        description: 'The baz option'
      },
      qux: {
        type: 'string',
        short: 'q',
        required: true,
        description: 'The qux option'
      }
    },
    name: 'test',
    description: 'A test command',
    run: NOOP
  } as Command<GunshiParams<{ args: Args }>>
  const ctx = await createCommandContext({
    args: command.args!,
    values: {},
    positionals: [],
    rest: [],
    argv: [],
    tokens: [], // dummy, due to test
    omitted: false,
    callMode: 'entry',
    command,
    extensions: {
      i18n: i18nPlugin.extension,
      renderer: rendererPlugin.extension
    },
    cliOptions: {
      cwd: '/path/to/cmd1',
      version: '0.0.0',
      name: 'cmd1'
    }
  })

  expect(await renderUsage<WithI18nAndRenderer>(ctx)).toMatchSnapshot()
})

test('enable usageOptionType', async () => {
  const command = {
    args: {
      foo: {
        type: 'string',
        short: 'f',
        description: 'The foo option'
      },
      bar: {
        type: 'boolean',
        description: 'The bar option'
      },
      baz: {
        type: 'number',
        short: 'b',
        default: 42,
        description: 'The baz option'
      },
      qux: {
        type: 'string',
        short: 'q',
        required: true,
        description: 'The qux option'
      }
    },
    name: 'test',
    description: 'A test command',
    examples: `# Example 1\n$ test --foo bar --bar --baz 42 --qux quux\n# Example 2\n$ test -f bar -b 42 -q quux`,
    run: NOOP
  } as Command<GunshiParams<{ args: Args }>>
  const ctx = await createCommandContext({
    args: command.args!,
    values: {},
    positionals: [],
    rest: [],
    argv: [],
    tokens: [], // dummy, due to test
    omitted: false,
    callMode: 'entry',
    command,
    extensions: {
      i18n: i18nPlugin.extension,
      renderer: rendererPlugin.extension
    },
    cliOptions: {
      usageOptionType: true,
      leftMargin: 4,
      middleMargin: 12,
      cwd: '/path/to/cmd1',
      version: '0.0.0',
      name: 'cmd1'
    }
  })

  expect(await renderUsage<WithI18nAndRenderer>(ctx)).toMatchSnapshot()
})

test('sub commands', async () => {
  const ctx = await createCommandContext({
    args: SHOW.args!,
    values: {},
    omitted: true,
    callMode: 'entry',
    positionals: [],
    rest: [],
    argv: [],
    tokens: [], // dummy, due to test
    command: SHOW,
    extensions: {
      i18n: i18nPlugin.extension,
      renderer: rendererPlugin.extension
    },
    cliOptions: {
      cwd: '/path/to/cmd1',
      version: '0.0.0',
      name: 'cmd1',
      subCommands: COMMANDS
    }
  })

  expect(await renderUsage<WithI18nAndRenderer>(ctx)).toMatchSnapshot()
})

test('kebab-case arguments with toKebab option', async () => {
  const command = {
    args: {
      fooBar: {
        type: 'string',
        short: 'f',
        description: 'The fooBar option',
        toKebab: true
      },
      bazQux: {
        type: 'boolean',
        description: 'The bazQux option',
        toKebab: true,
        negatable: true
      },
      camelCase: {
        type: 'number',
        short: 'c',
        default: 42,
        description: 'The camelCase option',
        toKebab: true
      },
      kebabCaseRequired: {
        type: 'string',
        short: 'k',
        required: true,
        description: 'The kebabCaseRequired option',
        toKebab: true
      }
    },
    name: 'test',
    description: 'A test command with kebab-case arguments',
    examples: `# Example with kebab-case\n$ test --foo-bar value --baz-qux --camel-case 42 --kebab-case-required value\n# Example with negated option\n$ test --no-baz-qux --foo-bar value --kebab-case-required value`,
    run: NOOP
  } as Command<GunshiParams<{ args: Args }>>
  const ctx = await createCommandContext({
    args: command.args!,
    values: {},
    positionals: [],
    rest: [],
    argv: [],
    tokens: [], // dummy, due to test
    omitted: false,
    callMode: 'entry',
    command,
    extensions: {
      i18n: i18nPlugin.extension,
      renderer: rendererPlugin.extension
    },
    cliOptions: {
      cwd: '/path/to/cmd1',
      name: 'cmd1',
      description: 'this is command line'
    }
  })

  expect(await renderUsage<WithI18nAndRenderer>(ctx)).toMatchSnapshot()
})

test('kebab-case arguments with Command.toKebab option', async () => {
  const command = {
    args: {
      fooBar: {
        type: 'string',
        short: 'f',
        description: 'The fooBar option'
      },
      bazQux: {
        type: 'boolean',
        description: 'The bazQux option',
        toKebab: true
      },
      camelCase: {
        type: 'number',
        short: 'c',
        default: 42,
        description: 'The camelCase option'
      },
      kebabCaseRequired: {
        type: 'string',
        short: 'k',
        required: true,
        description: 'The kebabCaseRequired option'
      }
    },
    name: 'test',
    description: 'A test command with kebab-case arguments',
    examples: `# Example with kebab-case\n$ test --foo-bar value --baz-qux --camel-case 42 --kebab-case-required value\n# Example with negated option\n$ test --no-baz-qux --foo-bar value --kebab-case-required value`,
    toKebab: true,
    run: NOOP
  } as Command<GunshiParams<{ args: Args }>>
  const ctx = await createCommandContext({
    args: command.args!,
    values: {},
    positionals: [],
    rest: [],
    argv: [],
    tokens: [], // dummy, due to test
    omitted: false,
    callMode: 'entry',
    command,
    extensions: {
      i18n: i18nPlugin.extension,
      renderer: rendererPlugin.extension
    },
    cliOptions: {
      cwd: '/path/to/cmd1',
      name: 'cmd1',
      description: 'this is command line'
    }
  })

  expect(await renderUsage<WithI18nAndRenderer>(ctx)).toMatchSnapshot()
})

test('not install i18n plugin', async () => {
  const ctx = await createCommandContext({
    args: SHOW.args!,
    values: {},
    omitted: false,
    callMode: 'subCommand',
    positionals: [],
    rest: [],
    argv: [],
    tokens: [], // dummy, due to test
    command: SHOW,
    extensions: {
      renderer: rendererPlugin.extension
    },
    cliOptions: {
      cwd: '/path/to/cmd1',
      version: '0.0.0',
      name: 'cmd1',
      subCommands: COMMANDS
    }
  })

  expect(await renderUsage<WithRendererOnly>(ctx)).toMatchSnapshot()
})
