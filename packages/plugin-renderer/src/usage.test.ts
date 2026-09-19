import i18n from '@gunshi/plugin-i18n'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { createCommandContext } from '../../gunshi/src/context.ts'
import renderer from './index.ts'
import { renderUsage } from './usage.ts'

import type { Args, Command, DefaultGunshiParams, GunshiParams, LazyCommand } from '@gunshi/plugin'
import type { I18nExtension } from '@gunshi/plugin-i18n'
import type { UsageRendererExtension } from './types.ts'

afterEach(() => {
  vi.resetAllMocks()
})

/**
 * type aliases for renderUsage
 */

type WithI18nAndRenderer = GunshiParams<{
  args: Args
  extensions: {
    'g:i18n': I18nExtension<DefaultGunshiParams> | Promise<I18nExtension<DefaultGunshiParams>>
    'g:renderer': UsageRendererExtension<DefaultGunshiParams>
  }
}>

type WithRendererOnly = GunshiParams<{
  args: Args
  extensions: {
    'g:renderer': UsageRendererExtension<DefaultGunshiParams>
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
      short: 'B',
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
    args: command.args,
    callMode: 'subCommand',
    command,
    extensions: {
      [i18nPlugin.id]: i18nPlugin.extension,
      [rendererPlugin.id]: rendererPlugin.extension
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
    callMode: 'subCommand',
    command,
    extensions: {
      [i18nPlugin.id]: i18nPlugin.extension,
      [rendererPlugin.id]: rendererPlugin.extension
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
    args: command.args,
    callMode: 'subCommand',
    command,
    extensions: {
      [i18nPlugin.id]: i18nPlugin.extension,
      [rendererPlugin.id]: rendererPlugin.extension
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
    explicit: {},
    values: {},
    positionals: [],
    rest: [],
    argv: [],
    tokens: [], // dummy, due to test
    omitted: false,
    callMode: 'subCommand',
    command,
    extensions: {
      [i18nPlugin.id]: i18nPlugin.extension,
      [rendererPlugin.id]: rendererPlugin.extension
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
    args: command.args,
    callMode: 'subCommand',
    command,
    extensions: {
      [i18nPlugin.id]: i18nPlugin.extension,
      [rendererPlugin.id]: rendererPlugin.extension
    },
    cliOptions: {
      cwd: '/path/to/cmd1',
      version: '0.0.0',
      name: 'cmd1'
    }
  })

  expect(await renderUsage<WithI18nAndRenderer>(ctx)).toMatchSnapshot()
})

test('hidden optional args are omitted from usage and options', async () => {
  const command = {
    args: {
      visible: {
        type: 'string',
        short: 'v',
        description: 'The visible option'
      },
      hidden: {
        type: 'string',
        short: 'h',
        hidden: true,
        description: 'The hidden option'
      }
    },
    name: 'test',
    description: 'A command with hidden optional args',
    run: NOOP
  } satisfies Command<GunshiParams<{ args: Args }>>

  const ctx = await createCommandContext({
    args: command.args,
    callMode: 'subCommand',
    command,
    extensions: {
      [i18nPlugin.id]: i18nPlugin.extension,
      [rendererPlugin.id]: rendererPlugin.extension
    },
    cliOptions: {
      cwd: '/path/to/cmd1',
      version: '0.0.0',
      name: 'cmd1'
    }
  })

  const usage = await renderUsage<WithI18nAndRenderer>(ctx)

  expect(usage).toContain('USAGE:\n  cmd1 test <OPTIONS>')
  expect(usage).toContain('The visible option')
  expect(usage).not.toContain('--hidden')
  expect(usage).not.toContain('The hidden option')
})

test('hidden boolean negatable options do not generate negated entry', async () => {
  const command = {
    args: {
      visible: {
        type: 'boolean',
        short: 'v',
        description: 'Visible boolean'
      },
      hidden: {
        type: 'boolean',
        short: 'h',
        negatable: true,
        hidden: true,
        description: 'Hidden boolean'
      }
    },
    name: 'test',
    description: 'A command with hidden negatable option',
    run: NOOP
  } satisfies Command<GunshiParams<{ args: Args }>>

  const ctx = await createCommandContext({
    args: command.args,
    callMode: 'subCommand',
    command,
    extensions: {
      [i18nPlugin.id]: i18nPlugin.extension,
      [rendererPlugin.id]: rendererPlugin.extension
    },
    cliOptions: {
      cwd: '/path/to/cmd1',
      version: '0.0.0',
      name: 'cmd1'
    }
  })

  const usage = await renderUsage<WithI18nAndRenderer>(ctx)

  expect(usage).toContain('--visible')
  expect(usage).not.toContain('--hidden')
  expect(usage).not.toContain('--no-hidden')
})

test('hidden positional args are omitted from usage and arguments', async () => {
  const command = {
    args: {
      visible: {
        type: 'positional',
        description: 'The visible positional argument'
      },
      hidden: {
        type: 'positional',
        hidden: true,
        description: 'The hidden positional argument'
      }
    },
    name: 'test',
    description: 'A command with positional args',
    run: NOOP
  } satisfies Command<GunshiParams<{ args: Args }>>

  const ctx = await createCommandContext({
    args: command.args,
    callMode: 'subCommand',
    command,
    extensions: {
      [i18nPlugin.id]: i18nPlugin.extension,
      [rendererPlugin.id]: rendererPlugin.extension
    },
    cliOptions: {
      cwd: '/path/to/cmd1',
      version: '0.0.0',
      name: 'cmd1'
    }
  })

  const usage = await renderUsage<WithI18nAndRenderer>(ctx)

  expect(usage).toContain('ARGUMENTS:')
  expect(usage).toContain('visible           The visible positional argument')
  expect(usage).not.toContain('hidden')
})

test('hidden-only args do not show options or arguments sections', async () => {
  const command = {
    args: {
      hiddenOptional: {
        type: 'string',
        hidden: true,
        description: 'The hidden optional argument'
      },
      hiddenPositional: {
        type: 'positional',
        hidden: true,
        description: 'The hidden positional argument'
      }
    },
    name: 'test',
    description: 'A command with hidden args only',
    run: NOOP
  } satisfies Command<GunshiParams<{ args: Args }>>

  const ctx = await createCommandContext({
    args: command.args,
    callMode: 'subCommand',
    command,
    explicit: {},
    values: {},
    positionals: [],
    rest: [],
    argv: [],
    tokens: [],
    omitted: false,
    extensions: {
      [i18nPlugin.id]: i18nPlugin.extension,
      [rendererPlugin.id]: rendererPlugin.extension
    },
    cliOptions: {
      cwd: '/path/to/cmd1',
      version: '0.0.0',
      name: 'cmd1'
    }
  })

  const usage = await renderUsage<WithI18nAndRenderer>(ctx)

  expect(usage).toContain('USAGE:\n  cmd1 test')
  expect(usage).not.toContain('[OPTIONS]')
  expect(usage).not.toContain('ARGUMENTS:')
  expect(usage).not.toContain('The hidden optional argument')
  expect(usage).not.toContain('The hidden positional argument')
})

test('multiple positional arguments', async () => {
  const command = {
    args: {
      foo: {
        type: 'positional',
        description: 'The foo argument'
      },
      bar: {
        type: 'positional',
        description: 'The bar argument',
        multiple: true
      }
    },
    name: 'test',
    description: 'A test command',
    run: NOOP
  } as Command<GunshiParams<{ args: Args }>>

  const ctx = await createCommandContext({
    args: command.args!,
    explicit: {},
    values: {},
    positionals: [],
    rest: [],
    argv: [],
    tokens: [], // dummy, due to test
    omitted: false,
    callMode: 'subCommand',
    command,
    extensions: {
      [i18nPlugin.id]: i18nPlugin.extension,
      [rendererPlugin.id]: rendererPlugin.extension
    },
    cliOptions: {
      cwd: '/path/to/cmd1',
      version: '0.0.0',
      name: 'cmd1'
    }
  })

  expect(await renderUsage<WithI18nAndRenderer>(ctx)).toMatchSnapshot()
})

test('optional positional arguments', async () => {
  const command = {
    args: {
      query: {
        type: 'positional',
        required: false,
        description: 'SQL query to execute'
      },
      file: {
        type: 'positional',
        description: 'Input file'
      },
      fallback: {
        type: 'positional',
        default: 'stdin',
        description: 'Fallback source'
      }
    },
    name: 'test',
    description: 'A test command',
    run: NOOP
  } as Command<GunshiParams<{ args: Args }>>

  const ctx = await createCommandContext({
    args: command.args!,
    explicit: {},
    values: {},
    positionals: [],
    rest: [],
    argv: [],
    tokens: [], // dummy, due to test
    omitted: false,
    callMode: 'subCommand',
    command,
    extensions: {
      [i18nPlugin.id]: i18nPlugin.extension,
      [rendererPlugin.id]: rendererPlugin.extension
    },
    cliOptions: {
      cwd: '/path/to/cmd1',
      version: '0.0.0',
      name: 'cmd1'
    }
  })

  expect(await renderUsage<WithI18nAndRenderer>(ctx)).toMatchSnapshot()
})

test('multiple positional arguments with required', async () => {
  const command = {
    args: {
      foo: {
        type: 'positional',
        description: 'The foo argument'
      },
      bar: {
        type: 'positional',
        description: 'The bar argument',
        multiple: true,
        required: true
      }
    },
    name: 'test',
    description: 'A test command',
    run: NOOP
  } as Command<GunshiParams<{ args: Args }>>

  const ctx = await createCommandContext({
    args: command.args!,
    explicit: {},
    values: {},
    positionals: [],
    rest: [],
    argv: [],
    tokens: [], // dummy, due to test
    omitted: false,
    callMode: 'subCommand',
    command,
    extensions: {
      [i18nPlugin.id]: i18nPlugin.extension,
      [rendererPlugin.id]: rendererPlugin.extension
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
    args: command.args,
    callMode: 'subCommand',
    command,
    extensions: {
      [i18nPlugin.id]: i18nPlugin.extension,
      [rendererPlugin.id]: rendererPlugin.extension
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
    args: command.args,
    callMode: 'subCommand',
    command,
    extensions: {
      [i18nPlugin.id]: i18nPlugin.extension,
      [rendererPlugin.id]: rendererPlugin.extension
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
    args: SHOW.args,
    omitted: true,
    command: SHOW,
    extensions: {
      [i18nPlugin.id]: i18nPlugin.extension,
      [rendererPlugin.id]: rendererPlugin.extension
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
    args: command.args,
    callMode: 'subCommand',
    command,
    extensions: {
      [i18nPlugin.id]: i18nPlugin.extension,
      [rendererPlugin.id]: rendererPlugin.extension
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
    args: command.args,
    callMode: 'subCommand',
    command,
    extensions: {
      [i18nPlugin.id]: i18nPlugin.extension,
      [rendererPlugin.id]: rendererPlugin.extension
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
    args: SHOW.args,
    callMode: 'subCommand',
    command: SHOW,
    extensions: {
      [rendererPlugin.id]: rendererPlugin.extension
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

test('internal commands are filtered out', async () => {
  const COMMANDS_WITH_INTERNAL = new Map<string, Command<WithRendererOnly>>([
    [
      'public',
      {
        name: 'public',
        description: 'Public command',
        run: NOOP
      }
    ],
    [
      'internal',
      {
        name: 'internal',
        description: 'Internal command',
        internal: true,
        run: NOOP
      }
    ],
    [
      'another',
      {
        name: 'another',
        description: 'Another public command',
        run: NOOP
      }
    ]
  ])

  const ctx = await createCommandContext({
    omitted: true,
    callMode: 'subCommand',
    extensions: {
      [rendererPlugin.id]: rendererPlugin.extension
    },
    cliOptions: {
      cwd: '/path/to/cmd',
      version: '1.0.0',
      name: 'test-cli',
      subCommands: COMMANDS_WITH_INTERNAL
    }
  })

  const usage = await renderUsage<WithRendererOnly>(ctx)

  // internal command should not appear in usage
  expect(usage).toContain('public')
  expect(usage).toContain('another')
  expect(usage).not.toContain('internal')
  expect(usage).not.toContain('Internal command')
})

describe('#727 - the commands section describes each listed command', () => {
  type TestCommand = Command<GunshiParams<{ args: Args }>>
  type TestLazyCommand = LazyCommand<GunshiParams<{ args: Args }>>

  async function renderCommandsSection(
    subCommands: Map<string, TestCommand | TestLazyCommand>,
    running?: TestCommand
  ): Promise<string[]> {
    const ctx = await createCommandContext({
      args: running?.args || {},
      omitted: true,
      command: running,
      extensions: {
        [rendererPlugin.id]: rendererPlugin.extension
      },
      cliOptions: {
        cwd: '/path/to/cmd',
        version: '0.0.0',
        name: 'my-cli',
        subCommands
      }
    })
    const lines = (await renderUsage<WithRendererOnly>(ctx)).split('\n')
    const start = lines.indexOf('COMMANDS:')
    const end = lines.indexOf('', start)
    return lines.slice(start + 1, end)
  }

  /**
   * Take the symbol of each row, that is everything before the description column.
   *
   * @param rows - The rows of the commands section
   * @returns The symbol of each row
   */
  function symbolsOf(rows: string[]): string[] {
    return rows.map(row => row.trim().split(/\s{2,}/)[0])
  }

  const ENTRY = {
    name: 'greet',
    description: 'Greet someone',
    entry: true,
    args: {
      name: { type: 'positional', description: 'Name to greet' },
      loud: { type: 'boolean', description: 'Shout' }
    },
    run: NOOP
  } as TestCommand

  const PUSH = {
    name: 'push',
    description: 'Push things',
    args: { remote: { type: 'positional', description: 'Remote name' } },
    run: NOOP
  } as TestCommand

  const STATUS = {
    name: 'status',
    description: 'Show status',
    run: NOOP
  } as TestCommand

  const TIDY = {
    name: 'tidy',
    description: 'Tidy up',
    args: { level: { type: 'string', default: 'low', description: 'Level' } },
    run: NOOP
  } as TestCommand

  test('each row shows the arguments that its own command declares', async () => {
    const rows = await renderCommandsSection(
      new Map([
        ['greet', ENTRY],
        ['push', PUSH],
        ['status', STATUS],
        ['tidy', TIDY]
      ]),
      ENTRY
    )

    expect(symbolsOf(rows)).toEqual([
      '[greet] <OPTIONS> <name>',
      'push <remote>',
      'status',
      'tidy [OPTIONS]'
    ])
  })

  test('the arguments of the running command do not leak into the other rows', async () => {
    const rows = await renderCommandsSection(
      new Map([
        ['greet', ENTRY],
        ['status', STATUS]
      ]),
      ENTRY
    )

    expect(rows.filter(row => row.includes('<name>'))).toHaveLength(1)
    expect(rows.find(row => row.includes('status'))).not.toContain('<')
  })

  test('a hidden argument is not shown in the row of its command', async () => {
    const secret = {
      name: 'secret',
      description: 'Secret command',
      args: {
        token: { type: 'string', description: 'Token', hidden: true },
        target: { type: 'positional', description: 'Target', hidden: true }
      },
      run: NOOP
    } as TestCommand

    const rows = await renderCommandsSection(
      new Map([
        ['greet', ENTRY],
        ['secret', secret],
        ['status', STATUS]
      ]),
      ENTRY
    )

    expect(symbolsOf(rows)).toEqual(['[greet] <OPTIONS> <name>', 'secret', 'status'])
  })

  test('a lazy command is described by the definition, without running its loader', async () => {
    const loader = vi.fn<() => Promise<TestCommand>>(async () => ({
      name: 'build',
      args: { watch: { type: 'boolean', description: 'Watch' } },
      run: NOOP
    }))
    const build = Object.assign(loader, {
      commandName: 'build',
      description: 'Build the project',
      args: { target: { type: 'positional', description: 'Target' } }
    }) as unknown as TestLazyCommand

    const bare = Object.assign(
      vi.fn<() => Promise<TestCommand>>(async () => ({
        name: 'test',
        args: { watch: { type: 'boolean' } },
        run: NOOP
      })),
      { commandName: 'test', description: 'Test the project' }
    ) as unknown as TestLazyCommand

    const rows = await renderCommandsSection(
      new Map([
        ['build', build],
        ['test', bare]
      ])
    )

    expect(symbolsOf(rows)).toEqual(['build <target>', 'test'])
    expect(loader).not.toHaveBeenCalled()
  })

  test('the descriptions are aligned, and a row without one has no trailing space', async () => {
    const quiet = { name: 'quiet', run: NOOP } as TestCommand
    const rows = await renderCommandsSection(
      new Map([
        ['greet', ENTRY],
        ['push', PUSH],
        ['quiet', quiet]
      ]),
      ENTRY
    )

    /**
     * A row is `<left margin><symbol><gap><description>`, and a symbol never contains
     * two spaces in a row, so the first gap is where the description starts.
     */
    const describedColumns = rows
      .map(row => /\s{2,}(?=\S)/.exec(row.slice(2)))
      .filter(matched => matched !== null)
      .map(matched => matched.index + matched[0].length)

    expect(describedColumns).toHaveLength(2)
    expect(new Set(describedColumns).size).toBe(1)
    expect(rows.find(row => row.includes('quiet'))).toBe('  quiet')
  })

  test('an anonymous entry command is shown with the name of the cli', async () => {
    const anonymous = { description: 'The default command', entry: true, run: NOOP } as TestCommand
    const rows = await renderCommandsSection(
      new Map([
        ['(anonymous)', anonymous],
        ['status', STATUS]
      ]),
      anonymous
    )

    expect(symbolsOf(rows)).toEqual(['[my-cli]', 'status'])
  })
})
