import jsJPResource from '@gunshi/resources/ja-JP' with { type: 'json' }
import { afterEach, describe, expect, test, vi } from 'vitest'
import { z } from 'zod/v4-mini'
import i18n from '../../plugin-i18n/src/index.ts'
import { defineMockLog } from '../test/utils.ts'
import { cli } from './cli.ts'
import { define, lazy } from './definition.ts'
import { plugin } from './plugin/core.ts'
import { renderValidationErrors } from './renderer.ts'

import type { Args } from 'args-tokens'
import type { Mocked } from 'vitest'
import type { CliOptions, Command, CommandRunner, GunshiParams, LazyCommand } from './types.ts'

afterEach(() => {
  vi.resetAllMocks()
})

describe('execute command', () => {
  test('entry iniline function', async () => {
    const mockFn = vi.fn()
    await cli([], mockFn)

    expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({ callMode: 'entry' }))
  })

  test('entry command', async () => {
    const mockFn = vi.fn()
    await cli([], {
      run: mockFn
    })

    expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({ callMode: 'entry' }))
  })

  test('entry command with name', async () => {
    const mockFn = vi.fn()
    await cli(['dist/'], {
      name: 'publish',
      run: mockFn
    })

    expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({ callMode: 'entry' }))
  })

  test('entry command with arguments', async () => {
    const mockFn = vi.fn()
    await cli(['--outDir', 'dist/', 'foo', 'bar'], {
      args: {
        outDir: {
          type: 'string',
          short: 'f'
        }
      },
      run: mockFn
    })

    expect(mockFn).toHaveBeenCalledWith(
      expect.objectContaining({
        callMode: 'entry',
        values: { outDir: 'dist/' },
        positionals: ['foo', 'bar']
      })
    )
  })

  test('entry command without arguments', async () => {
    const mockFn = vi.fn()
    await cli(['dist/', 'test/'], {
      run: mockFn
    })

    expect(mockFn).toHaveBeenCalledWith(
      expect.objectContaining({
        callMode: 'entry',
        values: {},
        positionals: ['dist/', 'test/']
      })
    )
  })

  test('entry lazy command name omitted', async () => {
    const mockFn = vi.fn()
    await cli(
      [''],
      lazy(() => mockFn, { name: 'lazy' })
    )

    expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({ callMode: 'entry' }))
  })

  test('entry lazy command name as sub-command', async () => {
    const mockFn = vi.fn()
    await cli(
      ['laz'],
      lazy(() => mockFn, { name: 'lazy' })
    )

    expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({ callMode: 'entry' }))
  })

  test('entry lazy command on sub-command', async () => {
    const mockFn = vi.fn()
    const mockCommand1 = vi.fn()
    const subCommands = new Map()
    subCommands.set('command1', {
      name: 'command1',
      run: mockCommand1
    })
    const lazyCommand = lazy(() => mockFn, { name: 'lazy' })

    // check entry command
    await cli(['lazy'], lazyCommand, { subCommands })
    expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({ callMode: 'subCommand' }))

    // check registered sub-command
    await cli(['command1'], lazyCommand, { subCommands })
    expect(mockCommand1).toHaveBeenCalledWith(expect.objectContaining({ callMode: 'subCommand' }))

    // check unknown command
    await expect(async () => {
      await cli(['unknown'], lazyCommand, { subCommands })
    }).rejects.toThrowError('Command not found: unknown')
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
      args: {
        foo: {
          type: 'string',
          short: 'f'
        }
      },
      run: mockCommand1
    })
    subCommands.set('command2', {
      name: 'command2',
      args: {
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
    expect(mockShow).toHaveBeenCalledWith(expect.objectContaining({ callMode: 'entry' }))
    expect(mockCommand1).toBeCalledTimes(1)
    expect(mockCommand1).toHaveBeenCalledWith(
      expect.objectContaining({
        values: { foo: 'foo' },
        positionals: ['command1', 'position1'],
        callMode: 'subCommand'
      })
    )
    expect(mockCommand2).toBeCalledTimes(1)
    expect(mockCommand2).toHaveBeenCalledWith(
      expect.objectContaining({
        values: { bar: 1 },
        positionals: ['command2', 'position2'],
        callMode: 'subCommand'
      })
    )
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

test('lazy command', async () => {
  const mockEntry = vi.fn()
  const entry = {
    name: 'main',
    run: mockEntry
  }
  const subCommands = new Map()

  // lazy load function style command
  const mockCommand1: Mocked<CommandRunner> = vi.fn()
  const command1: LazyCommand = () => {
    return new Promise<CommandRunner>(resolve => {
      setTimeout(() => {
        resolve(mockCommand1)
      }, 5)
    })
  }
  command1.commandName = 'command1'
  command1.description = 'command1 description'
  command1.args = {
    foo: {
      type: 'string',
      short: 'f'
    }
  }
  subCommands.set(command1.commandName, command1)

  // lazy load object style command
  const mockCommand2: Mocked<CommandRunner> = vi.fn()
  const remoteCommand2: Command = {
    name: 'command2',
    description: 'command2 description',
    args: {
      bar: {
        type: 'string',
        short: 'b'
      }
    },
    run: mockCommand2
  }
  const command2 = lazy(() => {
    return new Promise<Command>(resolve => {
      setTimeout(() => {
        resolve(remoteCommand2)
      }, 5)
    })
  }, remoteCommand2)
  subCommands.set(command2.commandName, command2)

  // regularly load command
  const command3 = {
    name: 'command3',
    description: 'command3 description',
    options: {
      qux: {
        type: 'number',
        short: 'q'
      }
    },
    run: vi.fn()
  }
  subCommands.set(command3.name, command3)

  const options = {
    subCommands
  }

  await cli(['command1'], entry, options)
  await cli(['command2'], entry, options)
  await cli(['command3'], entry, options)

  expect(mockCommand1).toBeCalledTimes(1)
  expect(mockCommand2).toBeCalledTimes(1)
  expect(command3.run).toBeCalledTimes(1)
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
      args: {
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
        args: {
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

    const entryArgs = {
      foo: {
        type: 'string',
        short: 'f'
      }
    } satisfies Args
    const entry = {
      args: entryArgs,
      run: vi.fn()
    } satisfies Command<GunshiParams<{ args: typeof entryArgs }>>

    const command2Args = {
      bar: {
        type: 'number',
        short: 'b',
        default: 42
      }
    } satisfies Args
    const command2 = {
      args: command2Args,
      run: vi.fn()
    } satisfies Command<GunshiParams<{ args: typeof command2Args }>>

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

    const entryArgs = {
      foo: {
        type: 'string',
        short: 'f',
        description: 'The foo option'
      }
    } satisfies Args
    const entry = {
      args: entryArgs,
      name: 'command1',
      examples: '# Example 1\n$ gunshi --foo bar\n# Example 2\n$ gunshi -f bar',
      run: vi.fn()
    } satisfies Command<GunshiParams<{ args: typeof entryArgs }>>

    const command2Args = {
      bar: {
        type: 'number',
        short: 'b',
        default: 42,
        description: 'The bar option'
      }
    } satisfies Args
    const command2 = {
      args: command2Args,
      name: 'command2',
      examples: '# Example 1\n$ gunshi command2 --bar 42\n# Example 2\n$ gunshi command2 -b 42',
      // run: vi.fn()
      run: ctx => {
        console.log(ctx.values)
      }
    } satisfies Command<GunshiParams<{ args: typeof command2Args }>>

    const subCommands = new Map()
    subCommands.set('command2', command2)

    const mainUsageRendered = await cli(['-h'], entry, {
      subCommands,
      name: 'gunshi',
      description: 'Modern CLI tool',
      version: '0.0.0',
      leftMargin: 4,
      middleMargin: 15,
      plugins: [
        i18n({
          locale: 'ja-JP',
          resources: { 'ja-JP': jsJPResource }
        })
      ]
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
    } satisfies Args

    const entry = {
      args: entryOptions,
      name: 'command1',
      run: vi.fn()
    } satisfies Command<GunshiParams<{ args: typeof entryOptions }>>

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
        for (const [key, value] of Object.entries(ctx.args)) {
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
    } as CliOptions<GunshiParams>

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

  const entryArgs = {
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
  } satisfies Args

  const entry = {
    args: entryArgs,
    name: 'command1',
    run: vi.fn()
  } satisfies Command<GunshiParams<{ args: typeof entryArgs }>>

  const options = {
    name: 'gunshi',
    description: 'Modern CLI tool',
    version: '0.0.0',
    usageSilent: true
  } satisfies CliOptions<GunshiParams<{ args: typeof entryArgs }>>

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

  expect(fn).toHaveBeenCalledWith(expect.objectContaining({ _: args }))
})

test('tokens', async () => {
  const args = ['--foo', 'bar']
  const fn = vi.fn()
  await cli(args, fn)

  expect(fn).toHaveBeenCalledWith(
    expect.objectContaining({
      tokens: [
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
      ]
    })
  )
})

test('option grouping', async () => {
  const args = ['-sV']
  const mockFn = vi.fn()
  await cli(args, {
    args: {
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

  expect(mockFn).toHaveBeenCalledWith(
    expect.objectContaining({
      values: {
        silent: true,
        verbose: true
      }
    })
  )
})

test('rest arguments', async () => {
  const args = ['--foo', 'bar', '--', '--baz', 'qux']
  const mockFn = vi.fn()
  await cli(args, {
    args: {
      foo: {
        type: 'string',
        short: 'f'
      }
    },
    run: mockFn
  })

  expect(mockFn).toHaveBeenCalledWith(
    expect.objectContaining({
      rest: ['--baz', 'qux']
    })
  )
})

test('negatable options', async () => {
  const args = ['dev', '--bar', '--no-foo']
  await cli(args, {
    args: {
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

test('enum optional argument', async () => {
  const utils = await import('./utils.ts')
  const log = defineMockLog(utils)

  // success case
  const args = {
    foo: {
      type: 'enum',
      choices: ['a', 'b', 'c']
    }
  } satisfies Args
  const mockFn1 = vi.fn()
  await cli(['--foo', 'a'], {
    args,
    run: mockFn1
  })
  expect(mockFn1).toHaveBeenCalledWith(
    expect.objectContaining({
      values: { foo: 'a' }
    })
  )

  // failure case
  await cli(['--foo', 'z'], {
    args,
    run: vi.fn()
  })
  const stdout = log()
  expect(stdout).toEqual(
    `Optional argument '--foo' should be chosen from 'enum' ["a", "b", "c"] values`
  )
})

describe('positional arguments', async () => {
  test('basic', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)

    // success case
    const args = {
      foo: {
        type: 'positional'
      },
      bar: {
        type: 'positional'
      }
    } satisfies Args
    const mockFn1 = vi.fn()
    await cli(['value1', 'value2'], {
      args,
      run: mockFn1
    })
    expect(mockFn1).toHaveBeenCalledWith(
      expect.objectContaining({
        values: { foo: 'value1', bar: 'value2' }
      })
    )

    // failure case
    await cli(['value1'], {
      args,
      run: vi.fn()
    })
    const stdout = log()
    expect(stdout).toEqual(`Positional argument 'bar' is required`)
  })

  test('sub commands', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)
    const mockFn1 = vi.fn()
    const mockFn2 = vi.fn()

    const subCommands = new Map()
    const command1 = define({
      name: 'command1',
      args: {
        foo: {
          type: 'positional'
        },
        option1: {
          type: 'string',
          short: 'o'
        }
      },
      run: mockFn1
    })
    const command2 = define({
      name: 'command2',
      args: {
        bar: {
          type: 'positional'
        },
        option2: {
          type: 'number',
          short: 'o'
        }
      },
      run: mockFn2
    })
    subCommands.set(command1.name, command1)
    subCommands.set(command2.name, command2)

    // success case
    await cli(
      ['command1', '-o=option1', 'value1'],
      {
        run: vi.fn()
      },
      {
        subCommands
      }
    )
    expect(mockFn1).toHaveBeenCalledWith(
      expect.objectContaining({
        values: { foo: 'value1', option1: 'option1' }
      })
    )

    // failure case
    await cli(
      ['command2', '-o=1'],
      {
        run: vi.fn()
      },
      {
        subCommands
      }
    )
    const stdout = log()
    expect(stdout).toEqual(`Positional argument 'bar' is required`)
  })
})

test('multiple option values', async () => {
  const args = {
    fruits: {
      type: 'enum',
      multiple: true,
      short: 'f',
      choices: ['apple', 'banana', 'orange']
    }
  } satisfies Args
  const mockFn1 = vi.fn()
  await cli(['--fruits', 'banana', '-f=orange', 'foo', 'bar', '-f', 'apple'], {
    args,
    run: mockFn1
  })

  expect(mockFn1).toHaveBeenCalledWith(
    expect.objectContaining({
      values: { fruits: ['banana', 'orange', 'apple'] }
    })
  )
})

describe('argument name kebabnize', () => {
  test('per argument', async () => {
    const args = {
      fooBar: {
        type: 'string',
        toKebab: true
      },
      bazQux: {
        type: 'string'
      }
    } satisfies Args

    const mockFn1 = vi.fn()
    await cli(['--foo-bar', 'value1', '--bazQux', 'value2'], {
      args,
      run: mockFn1
    })

    expect(mockFn1).toHaveBeenCalledWith(
      expect.objectContaining({
        values: { fooBar: 'value1', bazQux: 'value2' }
      })
    )
  })

  test('globally', async () => {
    const args = {
      fooBar: {
        type: 'string'
      },
      bazQux: {
        type: 'string'
      }
    } satisfies Args

    const mockFn1 = vi.fn()
    await cli(['--foo-bar', 'value1', '--bazQux', 'value2'], {
      args,
      toKebab: true,
      run: mockFn1
    })

    expect(mockFn1).toHaveBeenCalledWith(
      expect.objectContaining({
        values: { fooBar: 'value1' }
      })
    )
  })
})

describe('custom type arguments', () => {
  test('csv parser', async () => {
    const args = {
      tags: {
        type: 'custom',
        short: 't',
        description: 'Comma-separated list of tags',
        parse: (value: string) => value.split(',').map(tag => tag.trim())
      }
    } satisfies Args

    const mockFn = vi.fn()
    await cli(['--tags', 'javascript,typescript,node.js'], {
      args,
      run: mockFn
    })

    expect(mockFn).toHaveBeenCalledWith(
      expect.objectContaining({
        values: { tags: ['javascript', 'typescript', 'node.js'] }
      })
    )
  })

  test('json parser', async () => {
    const config = z.object({
      debug: z.boolean(),
      port: z.number()
    })
    const args = {
      config: {
        type: 'custom',
        short: 'c',
        description: 'JSON configuration',
        parse: (value: string) => {
          return config.parse(JSON.parse(value))
        }
      }
    } satisfies Args

    const mockFn = vi.fn()
    await cli(['--config', '{"debug":true,"port":3000}'], {
      args,
      run: mockFn
    })

    expect(mockFn).toHaveBeenCalledWith(
      expect.objectContaining({
        values: { config: { debug: true, port: 3000 } }
      })
    )
  })

  test('custom type with default value', async () => {
    const args = {
      format: {
        type: 'custom',
        short: 'f',
        description: 'Output format',
        default: 'json',
        parse: (value: string) => {
          if (!['json', 'yaml', 'xml'].includes(value)) {
            throw new Error(`Invalid format: ${value}. Must be one of: json, yaml, xml`)
          }
          return value
        }
      }
    } satisfies Args

    const mockFn = vi.fn()
    await cli([], {
      args,
      run: mockFn
    })

    expect(mockFn).toHaveBeenCalledWith(
      expect.objectContaining({
        values: { format: 'json' }
      })
    )
  })

  test('custom type with validation error', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)

    const args = {
      port: {
        type: 'custom',
        short: 'p',
        description: 'Port number (1024-65535)',
        parse: (value: string) => {
          const port = Number(value)
          // eslint-disable-next-line unicorn/numeric-separators-style
          if (Number.isNaN(port) || port < 1024 || port > 65535) {
            throw new TypeError(`Invalid port: ${value}. Must be a number between 1024 and 65535`)
          }
          return port
        }
      }
    } satisfies Args

    await cli(['--port', '80'], {
      args,
      run: vi.fn()
    })

    const stdout = log()
    expect(stdout).toContain('Invalid port: 80. Must be a number between 1024 and 65535')
  })

  test('multiple custom type values', async () => {
    const args = {
      points: {
        type: 'custom',
        multiple: true,
        short: 'p',
        description: 'Points in x,y format',
        parse: (value: string) => {
          const [x, y] = value.split(',').map(Number)
          if (Number.isNaN(x) || Number.isNaN(y)) {
            throw new TypeError(`Invalid point format: ${value}. Expected format: x,y`)
          }
          return { x, y }
        }
      }
    } satisfies Args

    const mockFn = vi.fn()
    await cli(['--points', '1,2', '--points', '3,4', '-p=5,6'], {
      args,
      run: mockFn
    })
    expect(mockFn).toHaveBeenCalledWith(
      expect.objectContaining({
        values: {
          points: [
            { x: 1, y: 2 },
            { x: 3, y: 4 },
            { x: 5, y: 6 }
          ]
        }
      })
    )
  })
})

describe('command decorators', () => {
  test('command decorators in reverse order', async () => {
    const mockFn = vi.fn()
    const command = {
      name: 'test',
      run: mockFn
    }

    await cli(['test'], command)

    expect(mockFn).toHaveBeenCalled()
  })

  test('return string from command runner', async () => {
    const command = {
      name: 'test',
      run: () => {
        return 'Command output'
      }
    }

    const result = await cli(['test'], command)

    expect(result).toBe('Command output')
  })

  test('return string from decorator', async () => {
    const command = {
      name: 'test',
      run: () => {
        return 'Command output'
      }
    }

    const result = await cli(['--version'], command, {
      usageSilent: true,
      version: '1.2.3'
    })

    expect(result).toBe('1.2.3')
  })

  test('not call command runner', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)

    const mockFn = vi.fn()
    const command = {
      name: 'test',
      run: mockFn
    }

    await cli(['--help'], command)

    expect(mockFn).not.toHaveBeenCalled()
    expect(log()).toMatchSnapshot()
  })
})

test('plugins option', async () => {
  const msgs: string[] = []
  vi.spyOn(console, 'log').mockImplementation(msg => msgs.push(msg))

  function logger() {
    return plugin({
      id: 'logger',
      name: 'logger',
      setup: ctx => {
        ctx.decorateCommand(baseRunner => ctx => {
          console.log(`before command: ${ctx.name}`)
          const ret = baseRunner(ctx)
          if (typeof ret === 'string') {
            console.log(`command output: ${ret}`)
          }
          console.log(`after command: ${ctx.name}`)
          return ret
        })
      }
    })
  }

  const command = {
    name: 'test',
    run: ctx => {
      return `executed ${ctx.name}`
    }
  } satisfies Command<GunshiParams>

  await cli([], command, {
    plugins: [logger()]
  })

  expect(msgs).toEqual([
    'before command: test',
    'command output: executed test',
    'after command: test'
  ])
})

describe('edge cases', () => {
  test(`'description' option`, async () => {
    const command = define({
      name: 'test',
      description: 'This is a test command',
      args: {
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
