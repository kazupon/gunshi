import { afterEach, describe, expect, test, vi } from 'vitest'
import { defineMockLog } from '../test/utils'
import { cli } from './cli'
import { renderValidationErrors } from './renderer/index.js'

import type { ArgOptions } from 'args-tokens'
import type { Command, CommandOptions, LazyCommand } from './types'

afterEach(() => {
  vi.resetAllMocks()
})

describe('execute command', () => {
  test('entry iniline function', async () => {
    const mockFn = vi.fn()
    await cli([], mockFn)
    expect(mockFn).toBeCalled()
  })

  test('entry command', async () => {
    const mockFn = vi.fn()
    await cli([], {
      run: mockFn
    })
    expect(mockFn).toBeCalled()
  })

  test('entry strictly command + sub commands', async () => {
    const mockShow = vi.fn()
    const mockCommand1 = vi.fn()
    const mockCommand2 = vi.fn()
    const show = {
      name: 'show',
      run: mockShow
    }
    const subCommands = new Map<string, Command<ArgOptions> | LazyCommand<ArgOptions>>()
    subCommands.set('command1', {
      name: 'command1',
      run: mockCommand1
    })
    subCommands.set('command2', {
      name: 'command2',
      run: mockCommand2
    })
    const options = {
      subCommands
    }

    await cli([''], show, options) // omit
    await cli(['show'], show, options)
    await cli(['command1'], show, options)
    await cli(['command2'], show, options)

    expect(mockShow).toBeCalledTimes(2)
    expect(mockCommand1).toBeCalledTimes(1)
    expect(mockCommand2).toBeCalledTimes(1)
  })

  test('entry loose command + sub commands', async () => {
    const mockAnonymous = vi.fn()
    const mockShow = vi.fn()
    const mockCommand1 = vi.fn()
    const mockCommand2 = vi.fn()
    // no name command
    const anonymous = {
      run: mockAnonymous
    }
    const subCommands = new Map<string, Command<ArgOptions> | LazyCommand<ArgOptions>>()
    subCommands.set('show', {
      run: mockShow
    })
    subCommands.set('command1', {
      name: 'command1',
      run: mockCommand1
    })
    subCommands.set('command2', {
      name: 'command2',
      run: mockCommand2
    })
    const options = {
      subCommands
    }

    await cli([''], anonymous, options) // omit
    await cli(['show'], anonymous, options)
    await cli(['command1'], anonymous, options)
    await cli(['command2'], anonymous, options)

    expect(mockAnonymous).toBeCalledTimes(1)
    expect(mockShow).toBeCalledTimes(1)
    expect(mockCommand1).toBeCalledTimes(1)
    expect(mockCommand2).toBeCalledTimes(1)
  })

  test('command not found', async () => {
    await expect(async () => {
      await cli(['show'], { run: vi.fn() }, {})
    }).rejects.toThrowError('Command not found: show')
  })
})

describe('aute generate usage', () => {
  test('inline function', async () => {
    const utils = await import('./utils')
    const log = defineMockLog(utils)
    await cli(['-h'], vi.fn())

    const message = log()
    expect(message).toMatchSnapshot()
  })

  test('loosely entry command', async () => {
    const utils = await import('./utils')
    const log = defineMockLog(utils)
    await cli(['-h'], {
      options: {
        foo: {
          type: 'string',
          short: 'f'
        }
      },
      run: vi.fn()
    })

    const message = log()
    expect(message).toMatchSnapshot()
  })

  test('strictly entry command', async () => {
    const utils = await import('./utils')
    const log = defineMockLog(utils)
    await cli(
      ['-h'],
      {
        options: {
          foo: {
            type: 'string',
            short: 'f'
          }
        },
        name: 'command1',
        usage: {
          options: {
            foo: 'The foo option'
          },
          examples: '# Example 1\n$ gunshi --foo bar\n# Example 2\n$ gunshi -f bar'
        },
        run: vi.fn()
      },
      {
        name: 'gunshi',
        description: 'Modern CLI tool',
        version: '0.0.0',
        usageOptionType: true
      }
    )

    const message = log()
    expect(message).toMatchSnapshot()
  })

  test('loosely sub commands', async () => {
    const utils = await import('./utils')
    const log = defineMockLog(utils)

    const entryOptions = {
      foo: {
        type: 'string',
        short: 'f'
      }
    } satisfies ArgOptions
    const entry = {
      options: entryOptions,
      run: vi.fn()
    } satisfies Command<typeof entryOptions>

    const command2Options = {
      bar: {
        type: 'number',
        short: 'b',
        default: 42
      }
    } satisfies ArgOptions
    const command2 = {
      options: command2Options,
      run: vi.fn()
    } satisfies Command<typeof command2Options>

    type CommandArgs = typeof entryOptions | typeof command2Options
    const subCommands = new Map<string, Command<CommandArgs> | LazyCommand<CommandArgs>>()
    subCommands.set('command2', command2)

    await cli(['-h'], entry, { subCommands })
    await cli(['command2', '-h'], entry, { subCommands })

    const message = log()
    expect(message).toMatchSnapshot()
  })

  test('strictly sub commands', async () => {
    const utils = await import('./utils')
    const log = defineMockLog(utils)

    const entryOptions = {
      foo: {
        type: 'string',
        short: 'f'
      }
    } satisfies ArgOptions
    const entry = {
      options: entryOptions,
      name: 'command1',
      usage: {
        options: {
          foo: 'The foo option'
        },
        examples: '# Example 1\n$ gunshi --foo bar\n# Example 2\n$ gunshi -f bar'
      },
      run: vi.fn()
    } satisfies Command<typeof entryOptions>

    const command2Options = {
      bar: {
        type: 'number',
        short: 'b',
        default: 42
      }
    } satisfies ArgOptions
    const command2 = {
      options: command2Options,
      name: 'command2',
      usage: {
        options: {
          bar: 'The bar option'
        },
        examples: '# Example 1\n$ gunshi command2 --bar 42\n# Example 2\n$ gunshi command2 -b 42'
      },
      run: vi.fn()
    } satisfies Command<typeof command2Options>

    type CommandArgs = typeof entryOptions | typeof command2Options
    const subCommands = new Map<string, Command<CommandArgs> | LazyCommand<CommandArgs>>()
    subCommands.set('command2', command2)

    await cli(['-h'], entry, {
      subCommands,
      name: 'gunshi',
      description: 'Modern CLI tool',
      version: '0.0.0',
      leftMargin: 4,
      locale: 'ja-JP',
      middleMargin: 15
    })

    await cli(['command2', '-h'], entry, {
      subCommands,
      name: 'gunshi',
      description: 'Modern CLI tool',
      version: '0.0.0'
    })

    const message = log()
    expect(message).toMatchSnapshot()
  })

  test('locale resource not found', async () => {
    const utils = await import('./utils')
    const log = defineMockLog(utils)
    const mockResource = vi.fn().mockRejectedValue(new Error('Resource not found'))
    await cli(
      ['-h'],
      {
        options: {
          foo: {
            type: 'string',
            short: 'f'
          }
        },
        name: 'command1',
        usage: {
          options: {
            foo: 'The foo option'
          },
          examples: '# Example 1\n$ gunshi --foo bar\n# Example 2\n$ gunshi -f bar'
        },
        resource: mockResource,
        run: vi.fn()
      },
      {
        name: 'gunshi',
        description: 'Modern CLI tool',
        version: '0.0.0',
        locale: 'fr-FR',
        usageOptionType: true
      }
    )

    const message = log()
    expect(message).toMatchSnapshot()
  })
})

describe('custom generate usage', () => {
  test('basic', async () => {
    const utils = await import('./utils')
    const log = defineMockLog(utils)

    const entryOptions = {
      foo: {
        type: 'string',
        short: 'f'
      },
      bar: {
        type: 'boolean',
        required: true
      },
      baz: {
        type: 'number',
        short: 'b',
        default: 42
      }
    } satisfies ArgOptions

    const entry = {
      options: entryOptions,
      name: 'command1',
      usage: {
        options: {
          foo: 'this is foo option',
          bar: 'this is bar option',
          baz: 'this is baz option'
        }
      },
      run: vi.fn()
    } satisfies Command<typeof entryOptions>

    const options = {
      name: 'gunshi',
      description: 'Modern CLI tool',
      version: '0.0.0',
      renderHeader: null, // no header
      renderUsage: ctx => {
        const messages: string[] = []

        // render usage section
        messages.push('Usage:')
        messages.push(`  ${ctx.env.name} [options]`)
        messages.push('')

        // render options section
        messages.push('Options:')
        for (const [key, value] of Object.entries(ctx.options!)) {
          const usageOptions = (ctx.usage.options ?? Object.create(null)) as Record<string, string>
          const usage = usageOptions[key] || ''
          messages.push(`  --${key.padEnd(10)} ${`[${value.type}]`.padEnd(12)}`.padEnd(20) + usage)
        }
        messages.push('')

        return Promise.resolve(messages.join('\n'))
      },
      renderValidationErrors: async (ctx, error) => {
        // call built-in renderer, and decorate like picocolors
        // return pc.red(await renderValidationErrors(ctx, error))
        const msg = `* ${await renderValidationErrors(ctx, error)} *`
        return ['*'.repeat(msg.length), msg, '*'.repeat(msg.length)].join('\n')
      }
    } satisfies CommandOptions<typeof entryOptions>

    // usage
    await cli(['-h'], entry, options)

    // validation errors
    try {
      await cli([''], entry, options)
      // eslint-disable-next-line no-empty
    } catch {}

    const message = log()
    expect(message).toMatchSnapshot()
  })
})
