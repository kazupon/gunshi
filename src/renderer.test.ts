import { afterEach, describe, expect, test, vi } from 'vitest'
import { createCommandContext } from './context'
import { renderHeader, renderUsage, renderUsageDefault } from './renderer'

import type { ArgOptions } from 'args-tokens'
import type { Command, CommandOptions, LazyCommand } from './types'

const NOOP = async () => {}

afterEach(() => {
  vi.resetAllMocks()
})

describe('renderHeader', () => {
  const command = {
    name: 'test',
    description: 'A test command',
    run: NOOP
  } as Command<ArgOptions>

  test('basic', async () => {
    const ctx = createCommandContext(
      command.options,
      {},
      [],
      { cwd: '/path/to/cmd1', description: 'this is command line', version: '0.0.0', name: 'cmd1' },
      command
    )

    expect(await renderHeader(ctx)).toEqual('this is command line (cmd1 v0.0.0)')
  })

  test('no description', async () => {
    const ctx = createCommandContext(
      command.options,
      {},
      [],
      { cwd: '/path/to/cmd1', version: '0.0.0', name: 'cmd1' },
      command
    )

    expect(await renderHeader(ctx)).toEqual('cmd1 (cmd1 v0.0.0)')
  })

  test('no name & no description', async () => {
    const ctx = createCommandContext(command.options, {}, [], { cwd: '/path/to/cmd1' }, command)

    expect(await renderHeader(ctx)).toEqual('')
  })

  test('no version', async () => {
    const ctx = createCommandContext(
      command.options,
      {},
      [],
      { cwd: '/path/to/cmd1', name: 'cmd1', description: 'this is command line' },
      command
    )

    expect(await renderHeader(ctx)).toEqual('this is command line (cmd1)')
  })
})

describe('renderUsage', () => {
  test('basic', async () => {
    const command = {
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
        },
        qux: {
          type: 'string',
          short: 'q',
          required: true
        }
      },
      name: 'test',
      description: 'A test command',
      usage: {
        options: {
          foo: 'The foo option',
          bar: 'The bar option',
          baz: 'The baz option',
          qux: 'The qux option'
        },
        examples: `# Example 1\n$ test --foo bar --bar --baz 42 --qux quux\n# Example 2\n$ test -f bar -b 42 -q quux`
      },
      run: NOOP
    } as Command<ArgOptions>
    const ctx = createCommandContext(
      command.options,
      {}, // argument values
      [],
      { cwd: '/path/to/cmd1', version: '0.0.0', name: 'cmd1' },
      command
    )

    expect(await renderUsage(ctx)).toMatchSnapshot()
  })

  test('no options', async () => {
    const command = {
      name: 'test',
      description: 'A test command',
      usage: {
        examples: `# Example 1\n $test\n# Example 2\n$ test`
      },
      run: async () => {
        // something here
      }
    } as Command<ArgOptions>
    const ctx = createCommandContext(
      command.options,
      {}, // argument values
      [],
      { cwd: '/path/to/cmd1', version: '0.0.0', name: 'cmd1' },
      command
    )

    expect(await renderUsage(ctx)).toMatchSnapshot()
  })

  test('no required options', async () => {
    const command = {
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
      name: 'test',
      description: 'A test command',
      usage: {
        options: {
          foo: 'The foo option',
          bar: 'The bar option',
          baz: 'The baz option'
        }
      },
      run: NOOP
    } as Command<ArgOptions>
    const ctx = createCommandContext(
      command.options,
      {}, // argument values
      [],
      { cwd: '/path/to/cmd1', version: '0.0.0', name: 'cmd1' },
      command
    )

    expect(await renderUsage(ctx)).toMatchSnapshot()
  })

  test('no examples', async () => {
    const command = {
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
        },
        qux: {
          type: 'string',
          short: 'q',
          required: true
        }
      },
      name: 'test',
      description: 'A test command',
      usage: {
        options: {
          foo: 'The foo option',
          bar: 'The bar option',
          baz: 'The baz option',
          qux: 'The qux option'
        }
      },
      run: NOOP
    } as Command<ArgOptions>
    const ctx = createCommandContext(
      command.options,
      {}, // argument values
      [],
      { cwd: '/path/to/cmd1', version: '0.0.0', name: 'cmd1' },
      command
    )

    expect(await renderUsage(ctx)).toMatchSnapshot()
  })

  test('enable usageOptionType', async () => {
    const command = {
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
        },
        qux: {
          type: 'string',
          short: 'q',
          required: true
        }
      },
      name: 'test',
      description: 'A test command',
      usage: {
        options: {
          foo: 'The foo option',
          bar: 'The bar option',
          baz: 'The baz option',
          qux: 'The qux option'
        },
        examples: `# Example 1\n$ test --foo bar --bar --baz 42 --qux quux\n# Example 2\n$ test -f bar -b 42 -q quux`
      },
      run: NOOP
    } as Command<ArgOptions>
    const ctx = createCommandContext(
      command.options,
      {}, // argument values
      [],
      { cwd: '/path/to/cmd1', version: '0.0.0', name: 'cmd1' },
      command,
      { usageOptionType: true, leftMargin: 4, middleMargin: 12 } as Required<
        CommandOptions<ArgOptions>
      >
    )

    expect(await renderUsage(ctx)).toMatchSnapshot()
  })
})

const SHOW = {
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
    },
    qux: {
      type: 'string',
      short: 'q',
      required: true
    }
  },
  name: 'show',
  description: 'A show command',
  usage: {
    options: {
      foo: 'The foo option',
      bar: 'The bar option',
      baz: 'The baz option',
      qux: 'The qux option'
    },
    examples: `# Example 1\n$ test --foo bar --bar --baz 42 --qux quux\n# Example 2\n$ test -f bar -b 42 -q quux`
  },
  run: NOOP
} as Command<ArgOptions>

const COMMANDS = {
  show: SHOW,
  command1: {
    name: 'command1',
    options: {
      foo: {
        type: 'string',
        short: 'f'
      }
    },
    default: true,
    description: 'this is command1',
    usage: {
      options: {
        foo: 'The foo option'
      }
    },
    run: NOOP
  },
  command2: () =>
    Promise.resolve({
      name: 'command1',
      options: {
        bar: {
          type: 'boolean',
          short: 'b'
        }
      },
      description: 'this is command2',
      usage: {
        options: {
          bar: 'The bar option'
        }
      },
      run: NOOP
    })
} as Record<string, Command<ArgOptions> | LazyCommand<ArgOptions>>

describe('renderUsageDefault', () => {
  test('basic', async () => {
    const ctx = createCommandContext(
      SHOW.options,
      {},
      [],
      { cwd: '/path/to/cmd1', version: '0.0.0', name: 'cmd1', entry: SHOW, subCommands: COMMANDS },
      SHOW
    )

    expect(await renderUsageDefault(ctx)).toMatchSnapshot()
  })

  test('no subCommands', async () => {
    const ctx = createCommandContext(
      SHOW.options,
      {},
      [],
      { cwd: '/path/to/cmd1', version: '0.0.0', name: 'cmd1', entry: SHOW },
      SHOW
    )

    expect(await renderUsageDefault(ctx)).toMatchSnapshot()
  })
})
