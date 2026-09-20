import i18n from '@gunshi/plugin-i18n'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { createCommandContext } from '../../gunshi/src/context.ts'
import { lazy } from '../../gunshi/src/definition.ts'
import renderer from './index.ts'
import { renderUsage } from './usage.ts'
import { displayWidth } from './width.ts'

import type {
  ArgSchema,
  Args,
  Command,
  DefaultGunshiParams,
  GunshiParams,
  LazyCommand
} from '@gunshi/plugin'
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
    running?: TestCommand,
    overrides: { name?: string } = { name: 'my-cli' }
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
        ...overrides,
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

  test('an anonymous entry command of a cli with no name falls back to the command word', async () => {
    const anonymous = { description: 'The default command', entry: true, run: NOOP } as TestCommand
    const rows = await renderCommandsSection(
      new Map([
        ['(anonymous)', anonymous],
        ['status', STATUS]
      ]),
      anonymous,
      {} // no `name` in the cli options
    )

    expect(symbolsOf(rows)).toEqual(['[COMMAND]', 'status'])
  })
})

describe('#732 - an argument whose name starts with `no-` is described by itself', () => {
  async function render(args: Args, usageOptionType = false, withI18n = true) {
    const command = { args, name: 'main', description: 'Main', run: NOOP } as Command<
      GunshiParams<{ args: Args }>
    >
    const ctx = await createCommandContext({
      args,
      callMode: 'subCommand',
      command,
      extensions: withI18n
        ? {
            [i18nPlugin.id]: i18nPlugin.extension,
            [rendererPlugin.id]: rendererPlugin.extension
          }
        : { [rendererPlugin.id]: rendererPlugin.extension },
      cliOptions: { name: 'my-cli', version: '0.0.0', usageOptionType }
    })
    return withI18n
      ? await renderUsage<WithI18nAndRenderer>(ctx)
      : await renderUsage<WithRendererOnly>(ctx)
  }

  test('carries its own description, not the one of the argument the prefix reaches', async () => {
    const usage = await render(
      {
        emoji: { type: 'string', description: 'Emoji style' },
        'no-emoji': { type: 'boolean', description: 'Disable emoji' }
      },
      false,
      false
    )

    expect(usage).toContain('--no-emoji')
    expect(usage).toContain('Disable emoji')
    // the description of `--emoji` used to be repeated on the row of `--no-emoji`
    expect(usage).not.toMatch(/--no-emoji\s+Emoji style/)
  })

  test('is not announced as the negated form of an option that is not negatable', async () => {
    const usage = await render(
      { widgets: { type: 'boolean' }, 'no-widgets': { type: 'boolean' } },
      false,
      false
    )

    expect(usage).toContain('--no-widgets')
    expect(usage).not.toContain('Negatable of')
  })

  test('is typed by its own schema', async () => {
    const usage = await render(
      {
        emoji: { type: 'string', description: 'Emoji style' },
        'no-emoji': { type: 'boolean', description: 'Disable emoji' }
      },
      true,
      false
    )

    expect(usage).toMatch(/--no-emoji\s+\[boolean\]/)
  })

  test('does not throw when the prefix reaches nothing and the type is shown', async () => {
    await expect(
      render(
        { 'no-widgets': { type: 'boolean', description: 'Build without widgets' } },
        true,
        false
      )
    ).resolves.toContain('Build without widgets')
  })

  test('does not throw when the prefix reaches nothing and there is no description', async () => {
    // the i18n plugin answers with an empty string, which used to reach the composition below it
    await expect(render({ 'no-widgets': { type: 'boolean' } })).resolves.toContain('--no-widgets')
  })

  test('does not throw for the negated form of an option that is itself called `no-...`', async () => {
    const usage = await render({
      'no-cache': { type: 'boolean', negatable: true, description: 'Skip the cache' }
    })

    expect(usage).toContain('Skip the cache')
    expect(usage).toMatch(/--no-no-cache\s+Negatable of --no-cache/)
  })

  test('the negated form of a negatable option is unchanged', async () => {
    const usage = await render(
      { force: { type: 'boolean', short: 'f', negatable: true, description: 'Force' } },
      false,
      false
    )

    expect(usage).toMatch(/--no-force\s+Negatable of -f, --force/)
  })
})

describe('#743 - `toKebab` brings two keys under one name', () => {
  async function render(args: Args, toKebab = true): Promise<string> {
    const command = { args, name: 'main', description: 'Main', toKebab, run: NOOP } as Command<
      GunshiParams<{ args: Args }>
    >
    const ctx = await createCommandContext({
      args,
      callMode: 'subCommand',
      command,
      extensions: { [rendererPlugin.id]: rendererPlugin.extension },
      cliOptions: { name: 'my-cli', version: '0.0.0' }
    })
    return await renderUsage<WithRendererOnly>(ctx)
  }

  // the rows of `--no-dry-run`, whatever their description
  function negatedRows(usage: string): string[] {
    return usage.split('\n').filter(line => /^\s*--no-dry-run\s/.test(line))
  }

  const negatable = {
    type: 'boolean',
    short: 'd',
    negatable: true,
    description: 'Dry run'
  } satisfies ArgSchema

  test.each([
    ['a camelCase key', 'noDryRun'],
    ['a key that is already kebab-case', 'no-dry-run'],
    ['a key that is the negated form as written', 'no-dryRun']
  ])('is listed once, described by the argument that owns it (%s)', async (_, own) => {
    const usage = await render({
      [own]: { type: 'boolean', description: 'Never run for real' },
      dryRun: negatable
    })

    expect(negatedRows(usage)).toHaveLength(1)
    expect(negatedRows(usage)[0]).toContain('Never run for real')
    expect(usage).not.toContain('Negatable of')
  })

  test('the order in which the two are declared makes no difference', async () => {
    const usage = await render({
      dryRun: negatable,
      noDryRun: { type: 'boolean', description: 'Never run for real' }
    })

    expect(negatedRows(usage)).toHaveLength(1)
    expect(negatedRows(usage)[0]).toContain('Never run for real')
  })

  test('`toKebab` of the schema is read the same way', async () => {
    const usage = await render(
      {
        noDryRun: { type: 'boolean', toKebab: true, description: 'Never run for real' },
        dryRun: { ...negatable, toKebab: true }
      },
      false
    )

    expect(negatedRows(usage)).toHaveLength(1)
    expect(negatedRows(usage)[0]).toContain('Never run for real')
  })

  test('a hidden argument owns the name too, so neither of them is listed', async () => {
    const usage = await render({
      noDryRun: { type: 'boolean', hidden: true, description: 'Never run for real' },
      dryRun: negatable
    })

    expect(negatedRows(usage)).toHaveLength(0)
    expect(usage).not.toContain('Never run for real')
    expect(usage).toMatch(/-d, --dry-run\s+Dry run/)
  })

  test('a positional argument of that name does not take it', async () => {
    // a positional is never spelled as an option, so it cannot claim `--no-dry-run`
    const usage = await render({
      noDryRun: { type: 'positional', description: 'What not to run' },
      dryRun: negatable
    })

    expect(negatedRows(usage)).toHaveLength(1)
    expect(negatedRows(usage)[0]).toContain('Negatable of -d, --dry-run')
  })

  test('without `toKebab` the two are different names, and both are listed', async () => {
    const usage = await render(
      {
        noDryRun: { type: 'boolean', description: 'Never run for real' },
        dryRun: negatable
      },
      false
    )

    expect(usage).toMatch(/--noDryRun\s+Never run for real/)
    expect(usage).toMatch(/--no-dryRun\s+Negatable of -d, --dryRun/)
  })
})

describe('#747 - the CLI is named the same way in the "for more info" block', () => {
  type TestCommand = Command<GunshiParams<{ args: Args }>>

  const ENTRY = { name: 'entry', description: 'Entry', entry: true, run: NOOP } as TestCommand
  const CMD1 = { name: 'cmd1', description: 'C1', run: NOOP } as TestCommand
  const CMD2 = { name: 'cmd2', description: 'C2', run: NOOP } as TestCommand
  const REMOTE = { name: 'remote', description: 'Remote', entry: true, run: NOOP } as TestCommand
  const ADD = { name: 'add', description: 'Add', run: NOOP } as TestCommand
  const REMOVE = { name: 'remove', description: 'Remove', run: NOOP } as TestCommand

  const jaPlugin = i18n({
    locale: 'ja-JP',
    builtinResources: {
      'ja-JP': {
        COMMAND: 'コマンド',
        FORMORE: '詳細は、コマンドと`--help`フラグを実行してください'
      }
    }
  })

  async function renderPage(
    options: {
      name?: string
      commandPath?: string[]
      subCommands?: Map<string, TestCommand>
      locale?: boolean
    } = {}
  ): Promise<string> {
    const subCommands =
      options.subCommands ??
      new Map<string, TestCommand>([
        ['entry', ENTRY],
        ['cmd1', CMD1],
        ['cmd2', CMD2]
      ])
    const ctx = await createCommandContext({
      args: {},
      omitted: true,
      commandPath: options.commandPath ?? [],
      command: options.commandPath?.length ? REMOTE : ENTRY,
      extensions: options.locale
        ? { [jaPlugin.id]: jaPlugin.extension, [rendererPlugin.id]: rendererPlugin.extension }
        : { [rendererPlugin.id]: rendererPlugin.extension },
      cliOptions: { version: '0.0.0', ...(options.name ? { name: options.name } : {}), subCommands }
    })
    return options.locale
      ? await renderUsage<WithI18nAndRenderer>(ctx)
      : await renderUsage<WithRendererOnly>(ctx)
  }

  /**
   * Take the lines of the block that follows the `for more info` heading.
   *
   * @param usage - A rendered usage
   * @returns The lines of the block, trimmed
   */
  function forMoreLines(usage: string): string[] {
    const lines = usage.split('\n')
    const start = lines.findIndex(line => line.trim().endsWith(':') && line.includes('--help'))
    expect(start).toBeGreaterThan(-1)
    const rest = lines.slice(start + 1)
    const end = rest.findIndex(line => line.trim() === '')
    return (end === -1 ? rest : rest.slice(0, end)).map(line => line.trim())
  }

  const NESTED = new Map<string, TestCommand>([
    ['remote', REMOTE],
    ['add', ADD],
    ['remove', REMOVE]
  ])

  test('a CLI with no name uses the placeholder the rest of the page uses', async () => {
    const lines = forMoreLines(await renderPage())

    expect(lines).toEqual(['COMMAND --help', 'COMMAND cmd1 --help', 'COMMAND cmd2 --help'])
  })

  test('a CLI with no name never says `undefined`', async () => {
    expect(await renderPage()).not.toContain('undefined')
  })

  test('a CLI with a name is unchanged', async () => {
    const lines = forMoreLines(await renderPage({ name: 'my-cli' }))

    expect(lines).toEqual(['my-cli --help', 'my-cli cmd1 --help', 'my-cli cmd2 --help'])
  })

  test('the placeholder is localized', async () => {
    const lines = forMoreLines(await renderPage({ locale: true }))

    expect(lines).toEqual(['コマンド --help', 'コマンド cmd1 --help', 'コマンド cmd2 --help'])
  })

  test('a nested command keeps the path behind the placeholder', async () => {
    const lines = forMoreLines(await renderPage({ commandPath: ['remote'], subCommands: NESTED }))

    expect(lines).toEqual([
      'COMMAND remote --help',
      'COMMAND remote add --help',
      'COMMAND remote remove --help'
    ])
  })

  test('a nested command of a named CLI is unchanged', async () => {
    const lines = forMoreLines(
      await renderPage({ name: 'my-cli', commandPath: ['remote'], subCommands: NESTED })
    )

    expect(lines).toEqual([
      'my-cli remote --help',
      'my-cli remote add --help',
      'my-cli remote remove --help'
    ])
  })

  test('the block and the usage line name the CLI with the same word', async () => {
    // whatever `resolveEntry()` falls back to, the page has to say it in both places
    const usage = await renderPage()
    const usageLine = usage.split('\n')[1].trim()

    expect(forMoreLines(usage)[0].split(' ')[0]).toBe(usageLine.split(' ')[0])
  })
})

describe('#750 - a falsy default is a default', () => {
  type TestCommand = Command<GunshiParams<{ args: Args }>>

  async function render(args: Args, subCommands?: Map<string, TestCommand>): Promise<string> {
    const command = { args, name: 'app', description: 'App', run: NOOP } as TestCommand
    const ctx = await createCommandContext({
      args,
      omitted: subCommands !== undefined,
      command,
      extensions: { [rendererPlugin.id]: rendererPlugin.extension },
      cliOptions: { cwd: '/path/to/app', name: 'app', version: '0.0.0', subCommands }
    })
    return await renderUsage<WithRendererOnly>(ctx)
  }

  test.each([
    ['a number default of `0`', { retries: { type: 'number', default: 0 } }, 'retries'],
    ['an empty string default', { tag: { type: 'string', default: '' } }, 'tag'],
    ['a custom default of `0`', { size: { type: 'custom', default: 0 } }, 'size']
  ])('is shown with square brackets (%s)', async (_, args, name) => {
    const usage = await render(args as Args)

    expect(usage).toContain(`--${name} [${name}]`)
    expect(usage).not.toContain(`--${name} <${name}>`)
  })

  test('an argument with no default keeps its angle brackets', async () => {
    const usage = await render({ name: { type: 'string', description: 'Name' } })

    expect(usage).toContain('--name <name>')
  })

  test('the usage line is `[OPTIONS]` when every option has a default, falsy or not', async () => {
    const usage = await render({
      retries: { type: 'number', default: 0 },
      tag: { type: 'string', default: '' },
      quiet: { type: 'boolean', default: false }
    })

    expect(usage).toContain('app [OPTIONS]')
  })

  test('the usage line stays `<OPTIONS>` while one option has no default', async () => {
    const usage = await render({
      retries: { type: 'number', default: 0 },
      name: { type: 'string' }
    })

    expect(usage).toContain('app <OPTIONS>')
  })

  test('the row no longer contradicts the default it prints', async () => {
    const usage = await render({ retries: { type: 'number', default: 0, description: 'Retries' } })
    const row = usage.split('\n').find(line => line.includes('--retries'))!

    expect(row).toContain('[retries]')
    expect(row).toContain('(default: 0)')
  })

  test('a command in the commands section is listed the same way', async () => {
    const alpha = {
      name: 'alpha',
      description: 'Alpha',
      args: { verbose: { type: 'boolean', default: false } },
      run: NOOP
    } as TestCommand
    const beta = {
      name: 'beta',
      description: 'Beta',
      args: { level: { type: 'string', default: 'low' } },
      run: NOOP
    } as TestCommand

    const usage = await render(
      {},
      new Map([
        ['alpha', alpha],
        ['beta', beta]
      ])
    )
    const rows = usage.split('\n')

    expect(rows.find(row => row.includes('alpha'))).toContain('alpha [OPTIONS]')
    expect(rows.find(row => row.includes('beta'))).toContain('beta [OPTIONS]')
  })
})

describe('#748 - the commands section is localized', () => {
  type TestCommand = Command<GunshiParams<{ args: Args }>>

  async function commandsSection(
    subCommands: Map<string, TestCommand | LazyCommand<GunshiParams<{ args: Args }>>>,
    running: TestCommand,
    withI18n = true
  ): Promise<string[]> {
    const ctx = await createCommandContext({
      args: running.args || {},
      omitted: true,
      command: running,
      extensions: withI18n
        ? {
            [i18nPlugin.id]: i18nPlugin.extension,
            [rendererPlugin.id]: rendererPlugin.extension
          }
        : { [rendererPlugin.id]: rendererPlugin.extension },
      cliOptions: { cwd: '/path/to/cmd', name: 'my-cli', version: '0.0.0', subCommands }
    })
    const usage = withI18n
      ? await renderUsage<WithI18nAndRenderer>(ctx)
      : await renderUsage<WithRendererOnly>(ctx)
    const lines = usage.split('\n')
    const start = lines.indexOf('COMMANDS:')
    return lines.slice(start + 1, lines.indexOf('', start))
  }

  // the description lives only in the resource
  const CREATE = {
    name: 'create',
    resource: () => Promise.resolve({ description: 'Create a resource' }),
    run: NOOP
  } as unknown as TestCommand

  // both a plain description and a resource
  const REMOVE = {
    name: 'remove',
    description: 'plain remove',
    resource: () => Promise.resolve({ description: 'Remove a resource' }),
    run: NOOP
  } as unknown as TestCommand

  // neither
  const BARE = { name: 'bare', run: NOOP } as TestCommand

  const ENTRY = {
    name: 'manage',
    description: 'plain manage',
    entry: true,
    resource: () => Promise.resolve({ description: 'Manage resources' }),
    run: NOOP
  } as unknown as TestCommand

  const TREE = new Map<string, TestCommand | LazyCommand<GunshiParams<{ args: Args }>>>([
    ['manage', ENTRY],
    ['create', CREATE],
    ['remove', REMOVE],
    ['bare', BARE]
  ])

  test('a description that lives only in the resource is shown', async () => {
    const rows = await commandsSection(TREE, ENTRY)

    expect(rows.find(row => row.includes('create'))).toContain('Create a resource')
  })

  test('the resource wins over the plain description', async () => {
    const rows = await commandsSection(TREE, ENTRY)

    expect(rows.find(row => row.includes('remove'))).toContain('Remove a resource')
    expect(rows.join('\n')).not.toContain('plain remove')
  })

  test('the entry command is localized too', async () => {
    const rows = await commandsSection(TREE, ENTRY)

    expect(rows.find(row => row.includes('manage'))).toContain('Manage resources')
    expect(rows.join('\n')).not.toContain('plain manage')
  })

  test('a command with neither is left without a description', async () => {
    const rows = await commandsSection(TREE, ENTRY)
    const bare = rows.find(row => row.includes('bare'))!

    expect(bare.trim()).toEqual('bare')
  })

  test('without the i18n plugin, the plain description is what is shown', async () => {
    const rows = await commandsSection(TREE, ENTRY, false)

    expect(rows.find(row => row.includes('remove'))).toContain('plain remove')
    expect(rows.find(row => row.includes('manage'))).toContain('plain manage')
    // a command whose description lives only in its resource has none to show
    expect(rows.find(row => row.includes('create'))!.trim()).toEqual('create')
  })

  test('a lazy command is described by its definition, without running the loader', async () => {
    const loader = vi.fn(() => Promise.resolve(NOOP))
    const deploy = lazy(loader, {
      name: 'deploy',
      description: 'plain deploy',
      resource: () => Promise.resolve({ description: 'Deploy the app' })
    } as never) as unknown as LazyCommand<GunshiParams<{ args: Args }>>
    const tree = new Map<string, TestCommand | LazyCommand<GunshiParams<{ args: Args }>>>([
      ['manage', ENTRY],
      ['deploy', deploy]
    ])

    const rows = await commandsSection(tree, ENTRY)

    expect(rows.find(row => row.includes('deploy'))).toContain('Deploy the app')
    expect(loader).not.toHaveBeenCalled()
  })
})

describe('#749 - the columns are aligned by the width a terminal draws', () => {
  type TestCommand = Command<GunshiParams<{ args: Args }>>

  async function usageOf(args: Args, subCommands?: Map<string, TestCommand>): Promise<string> {
    const command = { args, name: 'main', description: 'Main', run: NOOP } as TestCommand
    const ctx = await createCommandContext({
      args,
      omitted: subCommands !== undefined,
      command,
      extensions: { [rendererPlugin.id]: rendererPlugin.extension },
      cliOptions: { cwd: '/path/to/main', name: 'my-cli', version: '0.0.0', subCommands }
    })
    return await renderUsage<WithRendererOnly>(ctx)
  }

  /**
   * The column each description starts at, measured the way a terminal would.
   *
   * @param usage - The rendered usage
   * @param heading - The section to look at
   * @returns The column of every row of the section
   */
  function descriptionColumns(usage: string, heading: string): number[] {
    const lines = usage.split('\n')
    const start = lines.indexOf(`${heading}:`)
    const columns: number[] = []
    for (let i = start + 1; i < lines.length && lines[i].trim() !== ''; i++) {
      const row = lines[i]
      // the indent first, so that the run of spaces below is the one before the description
      const indent = row.length - row.trimStart().length
      const rest = row.slice(indent)
      const separator = /\s{2,}/.exec(rest)
      if (separator) {
        const prefix = rest.slice(0, separator.index + separator[0].length)
        columns.push(indent + displayWidth(prefix))
      }
    }
    return columns
  }

  test('the commands section lines up with a full-width command name', async () => {
    const deploy = {
      name: '配置',
      description: 'Deploy it',
      args: { target: { type: 'string', description: 'Target' } },
      run: NOOP
    } as TestCommand
    const build = { name: 'build', description: 'Build it', run: NOOP } as TestCommand

    const usage = await usageOf(
      {},
      new Map([
        ['配置', deploy],
        ['build', build]
      ])
    )

    expect(new Set(descriptionColumns(usage, 'COMMANDS')).size).toEqual(1)
  })

  test('the arguments section lines up with a full-width name', async () => {
    const usage = await usageOf({
      対象: { type: 'positional', description: 'Target' },
      rest: { type: 'positional', description: 'Rest' }
    })

    expect(new Set(descriptionColumns(usage, 'ARGUMENTS')).size).toEqual(1)
  })

  test('the options section lines up with a full-width name', async () => {
    const usage = await usageOf({
      出力: { type: 'string', description: 'Output' },
      quiet: { type: 'boolean', description: 'Quiet' }
    })

    expect(new Set(descriptionColumns(usage, 'OPTIONS')).size).toEqual(1)
  })

  test('a combining mark does not push the column the other way', async () => {
    // `créer` written as `e` + U+0301: five columns, six code units
    const usage = await usageOf({
      'cre\u0301er': { type: 'string', description: 'Create' },
      quiet: { type: 'boolean', description: 'Quiet' }
    })

    expect(new Set(descriptionColumns(usage, 'OPTIONS')).size).toEqual(1)
  })

  test('a cli with ascii names only renders exactly as before', async () => {
    const usage = await usageOf({
      output: { type: 'string', description: 'Output' },
      quiet: { type: 'boolean', description: 'Quiet' }
    })

    expect(usage).toContain('--output <output>')
    expect(new Set(descriptionColumns(usage, 'OPTIONS')).size).toEqual(1)
    // the padding is the one `padEnd` would have produced
    const row = usage.split('\n').find(line => line.includes('--quiet'))!
    expect(row).toEqual(row.trimEnd())
  })

  test('the padding is the number of columns a terminal draws, not a consistent guess', async () => {
    /**
     * NOTE(kazupon): the rows above are compared with `displayWidth`, so they stay aligned even if
     * `displayWidth` is wrong in a consistent way. These two lines pin the numbers themselves:
     * `対象` is four columns, so it is followed by eleven spaces, the same as `rest`.
     */
    const usage = await usageOf({
      対象: { type: 'positional', description: 'Target' },
      rest: { type: 'positional', description: 'Rest' }
    })
    const lines = usage.split('\n')
    const start = lines.indexOf('ARGUMENTS:')

    expect(lines.slice(start + 1, start + 3)).toEqual([
      '  対象           Target',
      '  rest           Rest'
    ])
  })

  test('the left margin is not measured in columns', async () => {
    // `padStart(leftMargin + x.length)` is an indent idiom; measuring it in columns would
    // indent a row with a full-width name further than the others
    const usage = await usageOf({
      対象: { type: 'positional', description: 'Target' },
      rest: { type: 'positional', description: 'Rest' }
    })
    const rows = usage
      .split('\n')
      .slice(usage.split('\n').indexOf('ARGUMENTS:') + 1)
      .filter(line => line.trim() !== '')
      .slice(0, 2)

    const indents = rows.map(row => /^ */.exec(row)![0].length)
    expect(new Set(indents).size).toEqual(1)
  })
})
