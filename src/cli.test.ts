import { afterEach, describe, expect, test, vi } from 'vitest'
import { defineMockLog } from '../test/utils.ts'
import { cli } from './cli.ts'
import { define } from './definition.ts'
import { renderValidationErrors } from './renderer.ts'

import type { ArgOptions } from 'args-tokens'
import type { Command, CommandOptions } from './types.ts'

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

  test('entry command with name', async () => {
    const mockFn = vi.fn()
    await cli(['dist/'], {
      name: 'publish',
      run: mockFn
    })
    expect(mockFn).toBeCalled()
  })

  test('entry command with options', async () => {
    const mockFn = vi.fn()
    await cli(['--outDir', 'dist/', 'foo', 'bar'], {
      options: {
        outDir: {
          type: 'string',
          short: 'f'
        }
      },
      run: mockFn
    })
    expect(mockFn.mock.calls[0][0].values).toEqual({ outDir: 'dist/' })
    expect(mockFn.mock.calls[0][0].positionals).toEqual(['foo', 'bar'])
  })

  test('entry command without options', async () => {
    const mockFn = vi.fn()
    await cli(['dist/', 'test/'], {
      run: mockFn
    })
    expect(mockFn.mock.calls[0][0].values).toEqual({})
    expect(mockFn.mock.calls[0][0].positionals).toEqual(['dist/', 'test/'])
  })

  test('entry strictly command + sub commands', async () => {
    const mockShow = vi.fn()
    const mockCommand1 = vi.fn()
    const mockCommand2 = vi.fn()
    const show = {
      name: 'show',
      run: mockShow
    }
    const subCommands = new Map()
    subCommands.set('command1', {
      name: 'command1',
      options: {
        foo: {
          type: 'string',
          short: 'f'
        }
      },
      run: mockCommand1
    })
    subCommands.set('command2', {
      name: 'command2',
      options: {
        bar: {
          type: 'number',
          short: 'b'
        }
      },
      run: mockCommand2
    })
    const options = {
      subCommands
    }

    await cli([''], show, options) // omit
    await cli(['show'], show, options)
    await cli(['command1', '--foo', 'foo', 'position1'], show, options)
    await cli(['command2', '--bar=1', 'position2'], show, options)

    expect(mockShow).toBeCalledTimes(2)
    expect(mockCommand1).toBeCalledTimes(1)
    expect(mockCommand1.mock.calls[0][0].values).toEqual({ foo: 'foo' })
    expect(mockCommand1.mock.calls[0][0].positionals).toEqual(['command1', 'position1'])
    expect(mockCommand2).toBeCalledTimes(1)
    expect(mockCommand2.mock.calls[0][0].values).toEqual({ bar: 1 })
    expect(mockCommand2.mock.calls[0][0].positionals).toEqual(['command2', 'position2'])
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
    const subCommands = new Map()
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
    const subCommands = new Map()
    subCommands.set('foo', {
      run: vi.fn()
    })
    await expect(async () => {
      await cli(['show'], { run: vi.fn() }, { subCommands })
    }).rejects.toThrowError('Command not found: show')
  })

  test('not registered entry in sub commands', async () => {
    const mockEntry = vi.fn()
    const mockCommand1 = vi.fn()

    const entry = {
      name: 'main',
      run: mockEntry
    }
    const subCommands = new Map()
    subCommands.set('command1', {
      name: 'command1',
      run: mockCommand1
    })
    const options = {
      subCommands
    }

    await cli([''], entry, options)
    await cli(['main'], entry, options)
    await cli(['command1'], entry, options)

    expect(mockEntry).toBeCalledTimes(2)
    expect(mockCommand1).toBeCalledTimes(1)
  })
})

describe('auto generate usage', () => {
  test('inline function', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)
    const renderedUsage = await cli(['-h'], vi.fn())

    const message = log()
    expect(message).toMatchSnapshot()
    expect(message).toMatchSnapshot(renderedUsage)
  })

  test('loosely entry command', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)
    const renderedUsage = await cli(['-h'], {
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
    expect(message).toMatchSnapshot(renderedUsage)
  })

  test('strictly entry command', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)
    const renderedUsage = await cli(
      ['-h'],
      {
        options: {
          foo: {
            type: 'string',
            short: 'f',
            description: 'The foo option'
          }
        },
        name: 'command1',
        examples: '# Example 1\n$ gunshi --foo bar\n# Example 2\n$ gunshi -f bar',
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
    expect(message).toMatchSnapshot(renderedUsage)
  })

  test('loosely sub commands', async () => {
    const utils = await import('./utils.ts')
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

    const subCommands = new Map()
    subCommands.set('command2', command2)

    expect(await cli(['-h'], entry, { subCommands })).toMatchSnapshot('main')
    expect(await cli(['command2', '-h'], entry, { subCommands })).toMatchSnapshot('command2')

    const message = log()
    expect(message).toMatchSnapshot()
  })

  test('strictly sub commands', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)

    const entryOptions = {
      foo: {
        type: 'string',
        short: 'f',
        description: 'The foo option'
      }
    } satisfies ArgOptions
    const entry = {
      options: entryOptions,
      name: 'command1',
      examples: '# Example 1\n$ gunshi --foo bar\n# Example 2\n$ gunshi -f bar',
      run: vi.fn()
    } satisfies Command<typeof entryOptions>

    const command2Options = {
      bar: {
        type: 'number',
        short: 'b',
        default: 42,
        description: 'The bar option'
      }
    } satisfies ArgOptions
    const command2 = {
      options: command2Options,
      name: 'command2',
      examples: '# Example 1\n$ gunshi command2 --bar 42\n# Example 2\n$ gunshi command2 -b 42',
      // run: vi.fn()
      run: ctx => {
        console.log(ctx.values)
      }
    } satisfies Command<typeof command2Options>

    const subCommands = new Map()
    subCommands.set('command2', command2)

    const mainUsageRendered = await cli(['-h'], entry, {
      subCommands,
      name: 'gunshi',
      description: 'Modern CLI tool',
      version: '0.0.0',
      leftMargin: 4,
      locale: 'ja-JP',
      middleMargin: 15
    })
    expect(mainUsageRendered).toMatchSnapshot('main')

    const command2UsageRendered = await cli(['command2', '-h'], entry, {
      subCommands,
      name: 'gunshi',
      description: 'Modern CLI tool',
      version: '0.0.0'
    })
    expect(command2UsageRendered).toMatchSnapshot('command2')

    const message = log()
    expect(message).toMatchSnapshot()
  })

  test('locale resource not found', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)
    const mockResource = vi.fn().mockRejectedValue(new Error('Resource not found'))
    await cli(
      ['-h'],
      {
        options: {
          foo: {
            type: 'string',
            short: 'f',
            description: 'The foo option'
          }
        },
        name: 'command1',
        examples: '# Example 1\n$ gunshi --foo bar\n# Example 2\n$ gunshi -f bar',
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
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)

    const entryOptions = {
      foo: {
        type: 'string',
        short: 'f',
        description: 'this is foo option'
      },
      bar: {
        type: 'boolean',
        required: true,
        description: 'this is bar option'
      },
      baz: {
        type: 'number',
        short: 'b',
        default: 42,
        description: 'this is baz option'
      }
    } satisfies ArgOptions

    const entry = {
      options: entryOptions,
      name: 'command1',
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
        for (const [key, value] of Object.entries(ctx.options)) {
          const description = value.description || ''
          messages.push(
            `  --${key.padEnd(10)} ${`[${value.type}]`.padEnd(12)}`.padEnd(20) + description
          )
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
    } catch {}

    const message = log()
    expect(message).toMatchSnapshot()
  })
})

test('usageSilent', async () => {
  const utils = await import('./utils.ts')
  const log = defineMockLog(utils)

  const entryOptions = {
    foo: {
      type: 'string',
      short: 'f',
      description: 'this is foo option'
    },
    bar: {
      type: 'boolean',
      required: true,
      description: 'this is bar option'
    },
    baz: {
      type: 'number',
      short: 'b',
      default: 42,
      description: 'this is baz option'
    }
  } satisfies ArgOptions

  const entry = {
    options: entryOptions,
    name: 'command1',
    run: vi.fn()
  } satisfies Command<typeof entryOptions>

  const options = {
    name: 'gunshi',
    description: 'Modern CLI tool',
    version: '0.0.0',
    usageSilent: true
  } satisfies CommandOptions<typeof entryOptions>

  // usage with silent
  const usage = await cli(['-h'], entry, options)
  expect(usage).toMatchSnapshot()

  const stdout = log()
  expect(stdout).toBe('')
})

test('_ (rawArgs)', async () => {
  const args = ['--foo', 'bar', '--baz', 'qux']
  const fn = vi.fn()
  await cli(args, fn)
  expect(fn.mock.calls[0][0]._).toEqual(args)
})

test('tokens', async () => {
  const args = ['--foo', 'bar']
  const fn = vi.fn()
  await cli(args, fn)
  expect(fn.mock.calls[0][0].tokens).toEqual([
    {
      index: 0,
      kind: 'option',
      name: 'foo',
      rawName: '--foo',
      value: undefined,
      inlineValue: undefined
    },
    {
      index: 1,
      kind: 'positional',
      value: 'bar'
    }
  ])
})

test('option grouping', async () => {
  const args = ['-sV']
  const mockFn = vi.fn()
  await cli(args, {
    options: {
      silent: {
        type: 'boolean',
        short: 's'
      },
      verbose: {
        type: 'boolean',
        short: 'V'
      }
    },
    run: mockFn
  })

  expect(mockFn.mock.calls[0][0].values).toEqual({ silent: true, verbose: true })
})

test('rest arguments', async () => {
  const args = ['--foo', 'bar', '--', '--baz', 'qux']
  const mockFn = vi.fn()
  await cli(args, {
    options: {
      foo: {
        type: 'string',
        short: 'f'
      }
    },
    run: mockFn
  })

  expect(mockFn.mock.calls[0][0].rest).toEqual(['--baz', 'qux'])
})

test('negatable options', async () => {
  const args = ['dev', '--bar', '--no-foo']
  await cli(args, {
    options: {
      foo: {
        type: 'boolean',
        negatable: true
      },
      bar: {
        type: 'boolean',
        short: 'b'
      },
      baz: {
        type: 'boolean'
      }
    },
    run: ctx => {
      expect(ctx.positionals).toEqual(['dev'])
      expect(ctx.values).toEqual({ foo: false, bar: true })
    }
  })
})

test('enum options', async () => {
  const utils = await import('./utils.ts')
  const log = defineMockLog(utils)

  // success case
  const options = {
    foo: {
      type: 'enum',
      choices: ['a', 'b', 'c']
    }
  } satisfies ArgOptions
  const mockFn1 = vi.fn()
  await cli(['--foo', 'a'], {
    options,
    run: mockFn1
  })
  expect(mockFn1.mock.calls[0][0].values).toEqual({ foo: 'a' })

  // failure case
  await cli(['--foo', 'z'], {
    options,
    run: vi.fn()
  })
  const stdout = log()
  expect(stdout).toEqual(`Option '--foo' should be chosen from 'enum' ["a", "b", "c"] values`)
})

describe('edge cases', () => {
  test(`'description' option`, async () => {
    const command = define({
      name: 'test',
      description: 'This is a test command',
      options: {
        description: {
          type: 'string',
          short: 'd',
          description: 'This is a description of description option'
        }
      },
      run: vi.fn()
    })

    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)

    await cli(['-h'], command, {
      name: 'gunshi',
      description: 'Modern CLI tool',
      version: '0.0.0'
    })

    const stdout = log()
    expect(stdout).toMatchSnapshot()
  })
})
