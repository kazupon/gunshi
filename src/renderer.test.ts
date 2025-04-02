import { afterEach, describe, expect, test, vi } from 'vitest'
import { createCommandContext } from './context.ts'
import { renderHeader, renderUsage, renderValidationErrors } from './renderer/index.ts'

import type { ArgOptions } from 'args-tokens'
import type { Command, LazyCommand } from './types.ts'

const NOOP = async () => {}

afterEach(() => {
  vi.resetAllMocks()
})

const SHOW = {
  options: {
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
  name: 'show',
  description: 'A show command',
  examples: `# Example 1\n$ test --foo bar --bar --baz 42 --qux quux\n# Example 2\n$ test -f bar -b 42 -q quux`,
  run: NOOP
} as Command<ArgOptions>

const COMMANDS = new Map<string, Command<ArgOptions> | LazyCommand<ArgOptions>>()
COMMANDS.set('show', SHOW)
COMMANDS.set('command1', {
  name: 'command1',
  options: {
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
    name: 'command1',
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

describe('renderHeader', () => {
  const command = {
    name: 'test',
    description: 'A test command',
    run: NOOP
  } as Command<ArgOptions>

  test('basic', async () => {
    const ctx = await createCommandContext({
      options: {},
      values: {},
      positionals: [],
      args: [],
      omitted: true,
      command,
      commandOptions: {
        cwd: '/path/to/cmd1',
        description: 'this is command line',
        version: '0.0.0',
        name: 'cmd1'
      }
    })

    expect(await renderHeader(ctx)).toEqual('this is command line (cmd1 v0.0.0)')
  })

  test('no description', async () => {
    const ctx = await createCommandContext({
      options: {},
      values: {},
      positionals: [],
      args: [],
      omitted: true,
      command,
      commandOptions: {
        cwd: '/path/to/cmd1',
        version: '0.0.0',
        name: 'cmd1'
      }
    })

    expect(await renderHeader(ctx)).toEqual('cmd1 (cmd1 v0.0.0)')
  })

  test('no name & no description', async () => {
    const ctx = await createCommandContext({
      options: {},
      values: {},
      positionals: [],
      args: [],
      omitted: true,
      command,
      commandOptions: { cwd: '/path/to/cmd1' }
    })

    expect(await renderHeader(ctx)).toEqual('')
  })

  test('no version', async () => {
    const ctx = await createCommandContext({
      options: {},
      values: {},
      positionals: [],
      args: [],
      omitted: true,
      command,
      commandOptions: {
        cwd: '/path/to/cmd1',
        name: 'cmd1',
        description: 'this is command line'
      }
    })

    expect(await renderHeader(ctx)).toEqual('this is command line (cmd1)')
  })
})

describe('renderUsage', () => {
  test('basic', async () => {
    const command = {
      options: {
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
    } as Command<ArgOptions>
    const ctx = await createCommandContext({
      options: command.options!,
      values: {},
      positionals: [],
      args: [],
      omitted: false,
      command,
      commandOptions: {
        cwd: '/path/to/cmd1',
        name: 'cmd1',
        description: 'this is command line'
      }
    })

    expect(await renderUsage(ctx)).toMatchSnapshot()
  })

  test('no options', async () => {
    const command = {
      name: 'test',
      description: 'A test command',
      examples: `# Example 1\n$test\n# Example 2\n$ test`,
      run: async () => {
        // something here
      }
    } as Command<ArgOptions>
    const ctx = await createCommandContext({
      options: {},
      values: {},
      positionals: [],
      args: [],
      omitted: false,
      command,
      commandOptions: {
        cwd: '/path/to/cmd1',
        version: '0.0.0',
        name: 'cmd1'
      }
    })

    expect(await renderUsage(ctx)).toMatchSnapshot()
  })

  test('no required options', async () => {
    const command = {
      options: {
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
    } as Command<ArgOptions>
    const ctx = await createCommandContext({
      options: command.options!,
      values: {},
      positionals: [],
      args: [],
      omitted: false,
      command,
      commandOptions: {
        cwd: '/path/to/cmd1',
        version: '0.0.0',
        name: 'cmd1'
      }
    })

    expect(await renderUsage(ctx)).toMatchSnapshot()
  })

  test('no examples', async () => {
    const command = {
      options: {
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
    } as Command<ArgOptions>
    const ctx = await createCommandContext({
      options: command.options!,
      values: {},
      positionals: [],
      args: [],
      omitted: false,
      command,
      commandOptions: {
        cwd: '/path/to/cmd1',
        version: '0.0.0',
        name: 'cmd1'
      }
    })

    expect(await renderUsage(ctx)).toMatchSnapshot()
  })

  test('enable usageOptionType', async () => {
    const command = {
      options: {
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
    } as Command<ArgOptions>
    const ctx = await createCommandContext({
      options: command.options!,
      values: {},
      positionals: [],
      args: [],
      omitted: false,
      command,
      commandOptions: {
        usageOptionType: true,
        leftMargin: 4,
        middleMargin: 12,
        cwd: '/path/to/cmd1',
        version: '0.0.0',
        name: 'cmd1'
      }
    })

    expect(await renderUsage(ctx)).toMatchSnapshot()
  })

  test('sub commands', async () => {
    const ctx = await createCommandContext({
      options: SHOW.options!,
      values: {},
      omitted: true,
      positionals: [],
      args: [],
      command: SHOW,
      commandOptions: {
        cwd: '/path/to/cmd1',
        version: '0.0.0',
        name: 'cmd1',
        subCommands: COMMANDS
      }
    })

    expect(await renderUsage(ctx)).toMatchSnapshot()
  })
})

test('renderValidationErrors', async () => {
  const ctx = await createCommandContext({
    options: SHOW.options!,
    values: {},
    positionals: [],
    args: [],
    omitted: false,
    command: SHOW,
    commandOptions: {
      cwd: '/path/to/cmd1',
      version: '0.0.0',
      name: 'cmd1'
    }
  })

  // eslint-disable-next-line unicorn/error-message
  const error = new AggregateError([
    new Error(`Option '--dependency' or '-d' is required`),
    new Error(`Option '--alias' or '-a' is required`)
  ])
  await expect(renderValidationErrors(ctx, error)).resolves.toMatchSnapshot()
})
