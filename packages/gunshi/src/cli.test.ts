import global from '@gunshi/plugin-global'
import renderer from '@gunshi/plugin-renderer'
import jsJPResource from '@gunshi/resources/ja-JP' with { type: 'json' }
import { afterEach, beforeEach, describe, expect, onTestFinished, test, vi } from 'vitest'
import { z } from 'zod/v4-mini'
import i18n from '../../plugin-i18n/src/index.ts'
import { defineMockErrorLog, defineMockLog, helpHint } from '../test/utils.ts'
import { cli } from './cli.ts'
import { cli as boneCli } from './cli/bone.ts'
import { define, lazy } from './definition.ts'
import {
  CommandError,
  CommandNotFoundError,
  CommandNotFoundErrorKeys,
  isCommandNotFoundError
} from './error.ts'
import { generate } from './generator.ts'
import { jsonArgs } from './json.ts'
import { plugin } from './plugin/core.ts'
import { renderValidationErrors } from './renderer.ts'
import { hidden, string } from './combinators.ts'

import type { ArgSchema, Args } from 'args-tokens'
import type { Mocked } from 'vitest'
import type { Plugin } from './plugin/core.ts'
import type {
  CliOptions,
  Command,
  CommandEnvironment,
  CommandRunner,
  GunshiParams,
  LazyCommand
} from './types.ts'

afterEach(() => {
  vi.resetAllMocks()
})

describe('execute command', () => {
  test('entry iniline function', async () => {
    const mockFn = vi.fn<() => void>()
    await cli([], mockFn)

    expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({ callMode: 'entry' }))
  })

  test('entry command', async () => {
    const mockFn = vi.fn<() => void>()
    await cli([], {
      run: mockFn
    })

    expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({ callMode: 'entry' }))
  })

  test('entry command with name', async () => {
    const mockFn = vi.fn<() => void>()
    await cli(['dist/'], {
      name: 'publish',
      run: mockFn
    })

    expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({ callMode: 'entry' }))
  })

  test('entry command with arguments', async () => {
    const mockFn = vi.fn<() => void>()
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
    const mockFn = vi.fn<() => void>()
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

  test('entry lazy argv command name omitted', async () => {
    const mockFn = vi.fn<() => void>()
    await cli(
      [''],
      lazy(() => mockFn, { name: 'lazy' })
    )

    expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({ callMode: 'entry' }))
  })

  test('entry lazy command name as sub-command', async () => {
    const mockFn = vi.fn<() => void>()
    await cli(
      ['laz'],
      lazy(() => mockFn, { name: 'lazy' })
    )

    expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({ callMode: 'entry' }))
  })

  test('entry lazy command on sub-command', async () => {
    const mockFn = vi.fn<() => void>()
    const mockCommand1 = vi.fn<() => void>()
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

    // check unknown command: reported to stderr with exit code 1, without rejecting
    const stderr = defineMockErrorLog()
    await expect(cli(['unknown'], lazyCommand, { subCommands })).resolves.toBeUndefined()
    expect(stderr()).toContain('Command not found: unknown')
    expect(process.exitCode).toBe(1)
  })

  test('entry strictly command + sub commands', async () => {
    const mockShow = vi.fn<() => void>()
    const mockCommand1 = vi.fn<() => void>()
    const mockCommand2 = vi.fn<() => void>()
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
    expect(mockShow).toHaveBeenCalledWith(
      expect.objectContaining({ callMode: 'entry', positionals: [''] })
    )
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

  test('fallback to entry command', async () => {
    const mockShow = vi.fn<() => void>()
    const mockCommand1 = vi.fn<() => void>()
    const mockCommand2 = vi.fn<() => void>()
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

    const stderr = defineMockErrorLog()
    await expect(
      cli(['position1'], show, {
        subCommands
      })
    ).resolves.toBeUndefined()
    await expect(
      cli(['position2'], show, {
        subCommands,
        fallbackToEntry: false
      })
    ).resolves.toBeUndefined()
    expect(stderr()).toContain('Command not found: position1')
    expect(stderr()).toContain('Command not found: position2')
    await expect(
      cli(['position3'], show, {
        subCommands,
        fallbackToEntry: true
      })
    ).resolves.toBeUndefined()
    await expect(
      cli(['command1'], show, {
        subCommands,
        fallbackToEntry: true
      })
    ).resolves.toBeUndefined()

    expect(mockShow).toBeCalledTimes(1)
    expect(mockShow).toHaveBeenCalledWith(
      expect.objectContaining({ callMode: 'entry', positionals: ['position3'] })
    )
    expect(mockCommand1).toBeCalledTimes(1)
    expect(mockCommand2).toBeCalledTimes(0)
  })

  test('entry loose command + sub commands', async () => {
    const mockAnonymous = vi.fn<() => void>()
    const mockShow = vi.fn<() => void>()
    const mockCommand1 = vi.fn<() => void>()
    const mockCommand2 = vi.fn<() => void>()
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
    const stderr = defineMockErrorLog()
    const subCommands = new Map()
    subCommands.set('foo', {
      run: vi.fn<() => void>()
    })
    await expect(
      cli(['show'], { run: vi.fn<() => void>() }, { subCommands })
    ).resolves.toBeUndefined()
    expect(stderr()).toContain('Command not found: show')
    expect(process.exitCode).toBe(1)
  })

  test('command not found exposes structured metadata', async () => {
    const mockEntry = vi.fn<() => void>()
    const entry = define({
      name: 'main',
      run: mockEntry
    })
    const subCommands = new Map([
      ['deploy', define({ name: 'deploy', run: vi.fn<() => void>() })],
      ['init', define({ name: 'init', run: vi.fn<() => void>() })]
    ])

    const stderr = defineMockErrorLog()
    let capturedError: AggregateError | undefined
    await expect(
      cli(['missing'], entry, {
        subCommands,
        onErrorCommand: (ctx, error) => {
          capturedError = error as AggregateError
          expect(ctx.name).toBe('main')
          expect(ctx.commandPath).toEqual([])
          expect(ctx.validationError).toBe(error)
        }
      })
    ).resolves.toBeUndefined()
    expect(stderr()).toContain('Command not found: missing')

    const commandError = findCommandNotFoundError(capturedError)
    expect(commandError).toBeInstanceOf(CommandNotFoundError)
    expect(commandError.code).toBe(CommandNotFoundErrorKeys.notFound)
    expect(commandError.values).toEqual({ commandName: 'missing' })
    expect(commandError.commandName).toBe('missing')
    expect(commandError.commandPath).toEqual([])
    expect(commandError.candidates).toEqual(['deploy', 'init', 'main'])
    expect(mockEntry).not.toHaveBeenCalled()
  })

  test('command not found throws aggregate error without global plugin', async () => {
    const entry = define({
      name: 'main',
      run: vi.fn<() => void>()
    })
    const subCommands = new Map([['deploy', define({ name: 'deploy', run: vi.fn<() => void>() })]])

    await expect(boneCli(['missing'], entry, { subCommands })).rejects.toBeInstanceOf(
      AggregateError
    )
  })

  test('not registered entry in sub commands', async () => {
    const mockEntry = vi.fn<() => void>()
    const mockCommand1 = vi.fn<() => void>()

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

describe('lazy command', () => {
  test('basic', async () => {
    const mockEntry = vi.fn<() => void>()
    const entry = {
      name: 'main',
      run: mockEntry
    }
    const subCommands = new Map()

    // lazy load function style command
    const mockCommand1: Mocked<CommandRunner> = vi.fn<() => void>()
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
    const mockCommand2: Mocked<CommandRunner> = vi.fn<() => void>()
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
      run: vi.fn<() => void>()
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

  test('command loading', async () => {
    const utils = await import('./utils.ts')
    defineMockLog(utils)

    const configLoader = () => {
      return define({
        description: 'Loaded configured command',
        args: {
          verbose: {
            type: 'boolean',
            description: 'Enable verbose output',
            default: false
          }
        },
        run(ctx) {
          console.log('Run configured command:', ctx.values.verbose)
        }
      })
    }
    const lazyConfig = lazy(configLoader, {
      name: 'config',
      description: 'Load command configuration'
    })
    const subCommands = { [lazyConfig.commandName]: lazyConfig }
    const entry = define({
      description: 'CLI with dynamic commands',
      run: () => {}
    })
    const options = { name: 'lazy-command-loading', version: '1.0.0', subCommands }
    const renderedDefaultUsage = await cli(['-h'], entry, options)
    const renderedConfigUsage = await cli(['config', '-h'], entry, options)

    expect(renderedDefaultUsage).toMatchSnapshot('default-command')
    expect(renderedConfigUsage).toMatchSnapshot('config-command')
  })
})

describe('auto generate usage', () => {
  test('loosely inline command', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)
    const renderedUsage = await cli(['-h'], vi.fn<() => void>())

    const message = log()
    expect(message).toMatchSnapshot('console')
    expect(renderedUsage).toMatchSnapshot('rendered')
  })

  test('named entry command', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)
    function entry() {} // `name` property is already required
    const renderedUsage = await cli(['-h'], entry)

    const message = log()
    expect(message).toMatchSnapshot('console')
    expect(renderedUsage).toMatchSnapshot('rendered')
  })

  test('loosely entry command', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)
    const renderedUsage = await cli(['-h'], {
      // `name` property is not defined
      description: 'This is a loosely entry command',
      args: {
        foo: {
          type: 'string',
          short: 'f'
        }
      },
      run: vi.fn<() => void>()
    })

    const message = log()
    expect(message).toMatchSnapshot('console')
    expect(renderedUsage).toMatchSnapshot('rendered')
  })

  test('strictly entry command', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)
    const renderedUsage = await cli(
      ['-h'],
      {
        // `name` property is defined
        name: 'command1',
        description: 'This is command1',
        args: {
          foo: {
            type: 'string',
            short: 'f',
            description: 'The foo option'
          }
        },
        examples: '# Example 1\n$ gunshi --foo bar\n# Example 2\n$ gunshi -f bar',
        run: vi.fn<() => void>()
      },
      {
        name: 'gunshi',
        description: 'Modern CLI tool',
        version: '0.0.0',
        usageOptionType: true
      }
    )

    const message = log()
    expect(message).toMatchSnapshot('console')
    expect(renderedUsage).toMatchSnapshot('rendered')
  })

  test('hidden object literal option is parseable and excluded from help', async () => {
    const entry = {
      name: 'command1',
      description: 'This command has a hidden option',
      args: {
        visible: {
          type: 'string',
          short: 'v',
          description: 'visible option'
        },
        legacy: {
          type: 'string',
          hidden: true,
          description: 'legacy option'
        }
      },
      run: vi.fn<() => void>()
    } satisfies Command<GunshiParams>

    const runSpy = entry.run
    await cli(['--visible', 'public', '--legacy', 'hidden'], entry, {
      name: 'legacy-cli',
      description: 'legacy-cli',
      version: '1.0.0'
    })

    expect(runSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        values: {
          visible: 'public',
          legacy: 'hidden'
        }
      })
    )

    const renderedUsage = await cli(['-h'], entry, {
      name: 'legacy-cli',
      description: 'legacy-cli',
      version: '1.0.0'
    })

    expect(renderedUsage).toContain('--visible')
    expect(renderedUsage).not.toContain('--legacy')
    expect(renderedUsage).not.toContain('legacy option')
  })

  test('hidden() combinator option is parseable and excluded from help', async () => {
    const entry = {
      name: 'command2',
      description: 'This command uses hidden() combinator',
      args: {
        visible: {
          type: 'string',
          short: 'v',
          description: 'visible option'
        },
        legacy: hidden(string())
      },
      run: vi.fn<() => void>()
    } satisfies Command<GunshiParams>

    const runSpy = entry.run
    await cli(['--visible', 'public', '--legacy', 'hidden'], entry, {
      name: 'legacy-cli-2',
      description: 'legacy-cli',
      version: '1.0.0'
    })

    expect(runSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        values: {
          visible: 'public',
          legacy: 'hidden'
        }
      })
    )

    const renderedUsage = await cli(['-h'], entry, {
      name: 'legacy-cli-2',
      description: 'legacy-cli',
      version: '1.0.0'
    })

    expect(renderedUsage).toContain('--visible')
    expect(renderedUsage).not.toContain('--legacy')
  })

  test('loosely sub commands', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)
    const meta = {
      name: 'my-cli',
      renderHeader: null // no header
    }

    const entryArgs = {
      foo: {
        type: 'string',
        description: 'The foo option',
        short: 'f'
      }
    } satisfies Args
    const entry = {
      // `name` property is not defined at entry
      description: 'This is entry command',
      args: entryArgs,
      run: vi.fn<() => void>()
    } satisfies Command<GunshiParams<{ args: typeof entryArgs }>>

    const command2Args = {
      bar: {
        type: 'number',
        short: 'b',
        default: 42
      }
    } satisfies Args
    const command2 = {
      // `name` property is defined at sub command
      description: 'This is command2',
      args: command2Args,
      run: vi.fn<() => void>()
    } satisfies Command<GunshiParams<{ args: typeof command2Args }>>

    const subCommands = new Map()
    subCommands.set('command2', command2)

    expect(await cli(['-h'], entry, { ...meta, subCommands })).toMatchSnapshot('entry')
    expect(await cli(['command2', '-h'], entry, { ...meta, subCommands })).toMatchSnapshot(
      'command2'
    )

    const message = log()
    expect(message).toMatchSnapshot('console output')
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
      // `name` property is defined at entry
      name: 'command1',
      description: 'This is command1 (entry)',
      args: entryArgs,
      examples: '# Example 1\n$ gunshi --foo bar\n# Example 2\n$ gunshi -f bar',
      run: vi.fn<() => void>()
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
      // `name` property is defined at sub command
      name: 'command2',
      description: 'This is command2',
      args: command2Args,
      examples: '# Example 1\n$ gunshi command2 --bar 42\n# Example 2\n$ gunshi command2 -b 42',
      run: ctx => {
        console.log(ctx.values)
      }
    } satisfies Command<GunshiParams<{ args: typeof command2Args }>>

    const subCommands = new Map()
    subCommands.set('command2', command2)

    const meta = {
      name: 'gunshi',
      description: 'Modern CLI tool',
      version: '0.0.0'
    }

    // execute the entry command (implicitly called `command1`)
    const mainUsageRendered = await cli(['-h'], entry, {
      ...meta,
      subCommands,
      leftMargin: 4,
      middleMargin: 15,
      plugins: [
        i18n({
          locale: 'ja-JP',
          builtinResources: { 'ja-JP': jsJPResource }
        })
      ]
    })
    expect(mainUsageRendered).toMatchSnapshot('entry')

    // explicitly execute the default command
    const command1UsageRendered = await cli(['command1', '-h'], entry, {
      ...meta,
      subCommands
    })
    expect(command1UsageRendered).toMatchSnapshot('command1')

    const command2UsageRendered = await cli(['command2', '-h'], entry, {
      ...meta,
      subCommands
    })
    expect(command2UsageRendered).toMatchSnapshot('command2')

    const message = log()
    expect(message).toMatchSnapshot('console output')
  })

  test('named entry command + sub commands', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)

    function entry() {} // `name` property is already required

    const command1 = {
      // `name` property is defined at sub command
      name: 'command1',
      description: 'This is command1 (entry)',
      args: {
        foo: {
          type: 'string',
          description: 'The foo option',
          short: 'f'
        }
      },
      run: vi.fn<() => void>()
    }

    const meta = {
      name: 'gunshi',
      description: 'Modern CLI tool',
      version: '0.0.0'
    }

    const renderedEntry = await cli(['-h'], entry, { ...meta, subCommands: { command1 } })
    const renderedExplicitEntry = await cli(['entry', '-h'], entry, {
      ...meta,
      subCommands: { command1 }
    })
    const renderedCommand1 = await cli(['command1', '-h'], entry, {
      ...meta,
      subCommands: { command1 }
    })

    expect(renderedEntry).toMatchSnapshot('entry')
    expect(renderedExplicitEntry).toMatchSnapshot('explicit entry')
    expect(renderedCommand1).toMatchSnapshot('command1')
    expect(log()).toBeTruthy()
  })

  test('inline entry command + sub commands', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)

    const command1 = {
      // `name` property is defined at sub command
      name: 'command1',
      description: 'This is command1 (entry)',
      args: {
        foo: {
          type: 'string',
          description: 'The foo option',
          short: 'f'
        }
      },
      run: vi.fn<() => void>()
    }

    const meta = {
      name: 'gunshi',
      description: 'Modern CLI tool',
      version: '0.0.0'
    }

    const renderedEntry = await cli(['-h'], () => {}, { ...meta, subCommands: { command1 } })
    const renderedCommand1 = await cli(['command1', '-h'], () => {}, {
      ...meta,
      subCommands: { command1 }
    })

    expect(renderedEntry).toMatchSnapshot('entry')
    expect(renderedCommand1).toMatchSnapshot('command1')
    expect(log()).toBeTruthy()
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
      run: vi.fn<() => void>()
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

    // validation errors, reported to stderr
    const stderr = defineMockErrorLog()
    await expect(cli([''], entry, options)).resolves.toBeUndefined()

    const message = [log(), stderr()].join('\n')
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
    run: vi.fn<() => void>()
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

test('usageSilent silences ctx.log but not console.log', async () => {
  const utils = await import('./utils.ts')
  const log = defineMockLog(utils)
  const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})

  await cli(
    [],
    {
      name: 'cmd',
      run: ctx => {
        ctx.log('via ctx.log')
        console.log('via console.log')
      }
    },
    { name: 'my-cli', version: '0.0.0', usageSilent: true, renderHeader: null }
  )

  expect(log()).toBe('')
  expect(consoleLog).toHaveBeenCalledTimes(1)
  expect(consoleLog).toHaveBeenCalledWith('via console.log')
})

test('_ (rawArgs)', async () => {
  const args = ['--foo', 'bar', '--baz', 'qux']
  const fn = vi.fn<() => void>()
  await cli(args, fn)

  expect(fn).toHaveBeenCalledWith(expect.objectContaining({ _: args }))
})

test('tokens', async () => {
  const args = ['--foo', 'bar']
  const fn = vi.fn<() => void>()
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
  const mockFn = vi.fn<() => void>()
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
  const mockFn = vi.fn<() => void>()
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
  const entry = define({
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
  await cli(args, entry)
})

test('enum optional argument', async () => {
  const stderr = defineMockErrorLog()

  // success case
  const args = {
    foo: {
      type: 'enum',
      choices: ['a', 'b', 'c']
    }
  } satisfies Args
  const mockFn1 = vi.fn<() => void>()
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
  await expect(
    cli(['--foo', 'z'], {
      args,
      run: vi.fn<() => void>()
    })
  ).resolves.toBeUndefined()
  expect(process.exitCode).toBe(1)
  expect(stderr()).toEqual(`Invalid value for '--foo': expected one of "a", "b", "c"` + helpHint())
})

describe('args validation i18n', () => {
  test('translates required option', async () => {
    const stderr = defineMockErrorLog()

    await expect(
      cli(
        [],
        {
          args: {
            id: {
              type: 'string',
              required: true
            }
          },
          run: vi.fn<() => void>()
        },
        {
          plugins: [
            i18n({
              locale: 'ja-JP',
              builtinResources: {
                'ja-JP': {
                  'err:arg:required-option': '必須オプション: {$displayName}'
                }
              }
            })
          ]
        }
      )
    ).resolves.toBeUndefined()

    expect(stderr()).toEqual("必須オプション: '--id'" + helpHint())
  })

  test('translates required positional', async () => {
    const stderr = defineMockErrorLog()

    await expect(
      cli(
        [],
        {
          args: {
            file: {
              type: 'positional'
            }
          },
          run: vi.fn<() => void>()
        },
        {
          plugins: [
            i18n({
              locale: 'ja-JP',
              builtinResources: {
                'ja-JP': {
                  'err:arg:required-positional': '必須位置引数: {$name}'
                }
              }
            })
          ]
        }
      )
    ).resolves.toBeUndefined()

    expect(stderr()).toEqual('必須位置引数: file' + helpHint())
  })

  test('translates invalid type and invalid choice', async () => {
    const stderr = defineMockErrorLog()

    await expect(
      cli(
        ['--count', 'invalid', '--level', 'trace'],
        {
          args: {
            count: {
              type: 'number'
            },
            level: {
              type: 'enum',
              choices: ['debug', 'info']
            }
          },
          run: vi.fn<() => void>()
        },
        {
          plugins: [
            i18n({
              locale: 'ja-JP',
              builtinResources: {
                'ja-JP': {
                  'err:arg:invalid-type': '型エラー: {$displayName}',
                  'err:arg:invalid-choice': '選択エラー: {$displayName}'
                }
              }
            })
          ]
        }
      )
    ).resolves.toBeUndefined()

    expect(stderr()).toEqual(
      ["型エラー: '--count'", "選択エラー: '--level'"].join('\n') + helpHint()
    )
  })

  test('translates custom parse wrapper', async () => {
    const stderr = defineMockErrorLog()

    await expect(
      cli(
        ['--port', '80'],
        {
          args: {
            port: {
              type: 'custom',
              parse: () => {
                throw new Error('Invalid port')
              }
            }
          },
          run: vi.fn<() => void>()
        },
        {
          plugins: [
            i18n({
              locale: 'ja-JP',
              builtinResources: {
                'ja-JP': {
                  'err:arg:custom-parse': 'カスタム解析エラー: {$reason}'
                }
              }
            })
          ]
        }
      )
    ).resolves.toBeUndefined()

    expect(stderr()).toEqual('カスタム解析エラー: Invalid port' + helpHint())
  })

  test('translates a missing value, with the hint of args-tokens', async () => {
    // the translation replaces the whole message of args-tokens, and took the hint with it (#791)
    const stderr = defineMockErrorLog()

    await expect(
      cli(
        ['--port', '-5'],
        {
          args: {
            port: {
              type: 'number',
              short: 'p'
            }
          },
          run: vi.fn<() => void>()
        },
        {
          plugins: [
            i18n({
              locale: 'ja-JP',
              builtinResources: { 'ja-JP': jsJPResource }
            })
          ]
        }
      )
    ).resolves.toBeUndefined()

    expect(stderr()).toEqual(
      "オプション '--port' or '-p' には値が必要です ('-5' を値として渡すには '--port=-5' と書いてください)" +
        helpHint([], { locale: 'ja-JP' })
    )
  })

  test('a missing value in en-US reads as the message of args-tokens', async () => {
    const stderr = defineMockErrorLog()

    await expect(
      cli(
        ['--port', '-5'],
        {
          args: {
            port: {
              type: 'number',
              short: 'p'
            }
          },
          run: vi.fn<() => void>()
        },
        {
          plugins: [i18n({ locale: 'en-US' })]
        }
      )
    ).resolves.toBeUndefined()

    expect(stderr()).toEqual(
      "Option '--port' or '-p' requires a value (to pass '-5' as its value, write '--port=-5')" +
        helpHint()
    )
  })

  test('translates a required positional by its display name', async () => {
    // the translation named it by its key, `inputFile`, and the other errors by their display name (#792)
    const stderr = defineMockErrorLog()

    await expect(
      cli(
        [],
        {
          toKebab: true,
          args: {
            inputFile: {
              type: 'positional'
            }
          },
          run: vi.fn<() => void>()
        },
        {
          plugins: [
            i18n({
              locale: 'ja-JP',
              builtinResources: { 'ja-JP': jsJPResource }
            })
          ]
        }
      )
    ).resolves.toBeUndefined()

    expect(stderr()).toEqual("位置引数 'input-file' は必須です" + helpHint([], { locale: 'ja-JP' }))
  })

  test('a required positional in en-US reads as the message of args-tokens', async () => {
    const stderr = defineMockErrorLog()

    await expect(
      cli(
        [],
        {
          toKebab: true,
          args: {
            inputFile: {
              type: 'positional'
            }
          },
          run: vi.fn<() => void>()
        },
        {
          plugins: [i18n({ locale: 'en-US' })]
        }
      )
    ).resolves.toBeUndefined()

    expect(stderr()).toEqual("Positional argument 'input-file' is required" + helpHint())
  })
})

describe('positional arguments', () => {
  test('basic', async () => {
    const stderr = defineMockErrorLog()

    // success case
    const args = {
      foo: {
        type: 'positional'
      },
      bar: {
        type: 'positional'
      }
    } satisfies Args
    const mockFn1 = vi.fn<() => void>()
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
    await expect(
      cli(['value1'], {
        args,
        run: vi.fn<() => void>()
      })
    ).resolves.toBeUndefined()
    expect(stderr()).toEqual(`Positional argument 'bar' is required` + helpHint())
  })

  test('optional positional arguments', async () => {
    const args = {
      query: {
        type: 'positional',
        required: false
      },
      file: {
        type: 'positional'
      }
    } satisfies Args

    const omitted = vi.fn<() => void>()
    await cli(['input.sql'], {
      args,
      run: omitted
    })
    expect(omitted).toHaveBeenCalledWith(
      expect.objectContaining({
        values: { file: 'input.sql' },
        positionals: ['input.sql']
      })
    )

    const provided = vi.fn<() => void>()
    await cli(['SELECT * FROM users', 'input.sql'], {
      args,
      run: provided
    })
    expect(provided).toHaveBeenCalledWith(
      expect.objectContaining({
        values: { query: 'SELECT * FROM users', file: 'input.sql' },
        positionals: ['SELECT * FROM users', 'input.sql']
      })
    )
  })

  test('positional argument default is used when omitted', async () => {
    const args = {
      query: {
        type: 'positional',
        default: 'SELECT 1'
      },
      file: {
        type: 'positional'
      }
    } satisfies Args

    const mockFn1 = vi.fn<() => void>()
    await cli(['input.sql'], {
      args,
      run: mockFn1
    })
    expect(mockFn1).toHaveBeenCalledWith(
      expect.objectContaining({
        values: { query: 'SELECT 1', file: 'input.sql' },
        positionals: ['input.sql']
      })
    )
  })

  test('sub commands', async () => {
    const stderr = defineMockErrorLog()
    const mockFn1 = vi.fn<() => void>()
    const mockFn2 = vi.fn<() => void>()

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
        run: vi.fn<() => void>()
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
    await expect(
      cli(
        ['command2', '-o=1'],
        {
          run: vi.fn<() => void>()
        },
        {
          subCommands
        }
      )
    ).resolves.toBeUndefined()
    expect(stderr()).toEqual(`Positional argument 'bar' is required` + helpHint(['command2']))
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
  const mockFn1 = vi.fn<() => void>()
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

    const mockFn1 = vi.fn<() => void>()
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

    const mockFn1 = vi.fn<() => void>()
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

    const mockFn = vi.fn<() => void>()
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

    const mockFn = vi.fn<() => void>()
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

    const mockFn = vi.fn<() => void>()
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
    const stderr = defineMockErrorLog()

    const args = {
      port: {
        type: 'custom',
        short: 'p',
        description: 'Port number (1024-65535)',
        parse: (value: string) => {
          const port = Number(value)
          if (Number.isNaN(port) || port < 1024 || port > 65535) {
            throw new TypeError(`Invalid port: ${value}. Must be a number between 1024 and 65535`)
          }
          return port
        }
      }
    } satisfies Args

    await expect(
      cli(['--port', '80'], {
        args,
        run: vi.fn<() => void>()
      })
    ).resolves.toBeUndefined()

    expect(stderr()).toContain('Invalid port: 80. Must be a number between 1024 and 65535')
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

    const mockFn = vi.fn<() => void>()
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
    const mockFn = vi.fn<() => void>()
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

    const mockFn = vi.fn<() => void>()
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
  vi.spyOn(console, 'log').mockImplementation((msg: string) => msgs.push(msg))

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
      run: vi.fn<() => void>()
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

describe('command lifecycle hooks', () => {
  test('onBeforeCommand and onAfterCommand hooks', async () => {
    const executionOrder: string[] = []
    const mockCommand = vi.fn<() => void>().mockImplementation(() => {
      executionOrder.push('command')
      return 'command result'
    })

    await cli(
      [],
      { run: mockCommand },
      {
        onBeforeCommand: ctx => {
          executionOrder.push('before')
          expect(ctx.name).toBe('(anonymous)')
        },
        onAfterCommand: (_ctx, result) => {
          executionOrder.push('after')
          expect(result).toBe('command result')
        }
      }
    )

    expect(executionOrder).toEqual(['before', 'command', 'after'])
    expect(mockCommand).toHaveBeenCalledOnce()
  })

  test('onErrorCommand hook', async () => {
    const executionOrder: string[] = []
    const testError = new Error('Test error')
    const mockCommand = vi.fn<() => void>().mockImplementation(() => {
      executionOrder.push('command')
      throw testError
    })

    let capturedError: Error | undefined

    await expect(
      cli(
        [],
        { run: mockCommand },
        {
          onBeforeCommand: () => {
            executionOrder.push('before')
          },
          onAfterCommand: () => {
            executionOrder.push('after') // Should not be called
          },
          onErrorCommand: (ctx, error) => {
            executionOrder.push('error')
            capturedError = error
            expect(ctx.name).toBe('(anonymous)')
          }
        }
      )
    ).rejects.toThrow('Test error')

    expect(executionOrder).toEqual(['before', 'command', 'error'])
    expect(capturedError).toBe(testError)
  })

  test('onErrorCommand hook with validation error', async () => {
    const stderr = defineMockErrorLog()
    const executionOrder: string[] = []
    const mockCommand = vi.fn<() => void>()
    const args = {
      id: {
        type: 'string',
        required: true
      }
    } satisfies Args

    let capturedError: Error | undefined

    await expect(
      cli(
        [],
        { args, run: mockCommand },
        {
          onBeforeCommand: () => {
            executionOrder.push('before')
          },
          onAfterCommand: () => {
            executionOrder.push('after')
          },
          onErrorCommand: (ctx, error) => {
            executionOrder.push('error')
            capturedError = error
            expect(ctx.validationError).toBe(error)
          }
        }
      )
    ).resolves.toBeUndefined()

    expect(executionOrder).toEqual(['before', 'error'])
    expect(mockCommand).not.toHaveBeenCalled()
    expect(capturedError).toBeInstanceOf(AggregateError)
    expect(stderr()).toBe(`Option '--id' is required` + helpHint())
    expect(process.exitCode).toBe(1)
  })

  describe('strict option validation', () => {
    test('keeps unknown options compatible by default and with strict disabled', async () => {
      const mockCommand = vi.fn<() => void>()

      await cli(['--alow-reload'], { run: mockCommand })
      await cli(['--alow-reload'], { run: mockCommand }, { strict: false })

      expect(mockCommand).toHaveBeenCalledTimes(2)
    })

    test('reports unknown long options before command execution', async () => {
      const stderr = defineMockErrorLog()
      const mockCommand = vi.fn<() => void>()
      let capturedError: AggregateError | undefined

      await expect(
        cli(
          ['--alow-reload'],
          {
            toKebab: true,
            args: {
              allowReload: {
                type: 'boolean'
              }
            },
            run: mockCommand
          },
          {
            strict: true,
            onErrorCommand: (_ctx, error) => {
              capturedError = error as AggregateError
            }
          }
        )
      ).resolves.toBeUndefined()

      expect(mockCommand).not.toHaveBeenCalled()
      expect(
        (capturedError?.errors[0] as { values: Record<string, unknown> } | undefined)?.values
      ).toEqual({
        rawName: '--alow-reload',
        name: 'alow-reload',
        candidates: ['--help', '--version', '--allow-reload']
      })
      expect(stderr()).toBe('Unknown option: --alow-reload' + helpHint())
    })

    test('allows declared long, short, negatable, and kebab-case options', async () => {
      const mockCommand = vi.fn<() => void>()

      await cli(
        ['--out-dir', 'dist', '-f', '--no-cache'],
        {
          toKebab: true,
          args: {
            outDir: {
              type: 'string'
            },
            force: {
              type: 'boolean',
              short: 'f'
            },
            cache: {
              type: 'boolean',
              negatable: true
            }
          },
          run: mockCommand
        },
        {
          strict: true
        }
      )

      expect(mockCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          values: {
            outDir: 'dist',
            force: true,
            cache: false
          }
        })
      )
    })

    test('ignores options after option terminator', async () => {
      const mockCommand = vi.fn<() => void>()

      await cli(['--', '--unknown'], { run: mockCommand }, { strict: true })

      expect(mockCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          rest: ['--unknown']
        })
      )
    })

    test('allows built-in help and version options', async () => {
      const mockCommand = vi.fn<() => void>()

      await expect(
        cli(['--help'], { run: mockCommand }, { strict: true, usageSilent: true })
      ).resolves.toBeTypeOf('string')
      await expect(
        cli(
          ['--version'],
          { run: mockCommand },
          { strict: true, usageSilent: true, version: '1.0.0' }
        )
      ).resolves.toBe('1.0.0')

      expect(mockCommand).not.toHaveBeenCalled()
    })

    test('reports help and version as unknown options without global plugin', async () => {
      const mockCommand = vi.fn<() => void>()

      for (const option of ['--help', '-h', '--version', '-v']) {
        await expect(
          boneCli([option], { run: mockCommand }, { strict: true, version: '1.0.0' })
        ).rejects.toBeInstanceOf(AggregateError)
      }

      expect(mockCommand).not.toHaveBeenCalled()
    })

    test('allows custom global options from plugins', async () => {
      const mockCommand = vi.fn<() => void>()
      const globalConfig = plugin({
        id: 'global-config',
        setup: ctx => {
          ctx.addGlobalOption('config', {
            type: 'string',
            short: 'c'
          })
        }
      })

      await cli(
        ['--config', 'production'],
        { run: mockCommand },
        {
          strict: true,
          plugins: [globalConfig]
        }
      )

      expect(mockCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          values: {
            config: 'production'
          }
        })
      )
    })

    test('uses resolved subcommand args', async () => {
      const mockEntry = vi.fn<() => void>()
      const mockDeploy = vi.fn<() => void>()

      await cli(
        ['deploy', '--env', 'production'],
        { run: mockEntry },
        {
          strict: true,
          subCommands: new Map([
            [
              'deploy',
              define({
                name: 'deploy',
                args: {
                  env: {
                    type: 'string'
                  }
                },
                run: mockDeploy
              })
            ]
          ])
        }
      )

      expect(mockEntry).not.toHaveBeenCalled()
      expect(mockDeploy).toHaveBeenCalledWith(
        expect.objectContaining({
          values: {
            env: 'production'
          }
        })
      )
    })

    test('uses resolved lazy command args', async () => {
      const mockEntry = vi.fn<() => void>()
      const mockLazy = vi.fn<() => void>()

      await cli(
        ['load', '--config', 'production'],
        { run: mockEntry },
        {
          strict: true,
          subCommands: new Map([
            [
              'load',
              lazy(
                () =>
                  define({
                    name: 'load',
                    args: {
                      config: {
                        type: 'string'
                      }
                    },
                    run: mockLazy
                  }),
                { name: 'load' }
              )
            ]
          ])
        }
      )

      expect(mockEntry).not.toHaveBeenCalled()
      expect(mockLazy).toHaveBeenCalledWith(
        expect.objectContaining({
          values: {
            config: 'production'
          }
        })
      )
    })

    test('merges unknown option errors with existing validation errors', async () => {
      const stderr = defineMockErrorLog()
      const mockCommand = vi.fn<() => void>()
      let capturedError: AggregateError | undefined

      await expect(
        cli(
          ['--bad'],
          {
            args: {
              id: {
                type: 'string',
                required: true
              }
            },
            run: mockCommand
          },
          {
            strict: true,
            onErrorCommand: (_ctx, error) => {
              capturedError = error as AggregateError
            }
          }
        )
      ).resolves.toBeUndefined()

      expect(mockCommand).not.toHaveBeenCalled()
      expect(capturedError?.errors.map((error: Error) => error.message)).toEqual([
        `Option '--id' is required`,
        'Unknown option: --bad'
      ])
      expect(stderr()).toBe(`Option '--id' is required\nUnknown option: --bad` + helpHint())
    })

    test('localizes unknown option validation errors with i18n plugin', async () => {
      const stderr = defineMockErrorLog()
      const mockCommand = vi.fn<() => void>()

      await expect(
        cli(
          ['--alow-reload'],
          { run: mockCommand },
          {
            strict: true,
            plugins: [
              i18n({
                locale: 'ja-JP',
                builtinResources: {
                  'ja-JP': jsJPResource
                }
              })
            ]
          }
        )
      ).resolves.toBeUndefined()

      expect(mockCommand).not.toHaveBeenCalled()
      expect(stderr()).toBe(
        '未定義のオプションです: --alow-reload' + helpHint([], { locale: 'ja-JP' })
      )
    })

    test('localizes command not found validation errors with i18n plugin', async () => {
      const stderr = defineMockErrorLog()
      const mockCommand = vi.fn<() => void>()

      await expect(
        cli(
          ['missing'],
          define({
            name: 'main',
            run: mockCommand
          }),
          {
            subCommands: {
              deploy: define({
                name: 'deploy',
                run: vi.fn<() => void>()
              })
            },
            plugins: [
              i18n({
                locale: 'ja-JP',
                builtinResources: {
                  'ja-JP': jsJPResource
                }
              })
            ]
          }
        )
      ).resolves.toBeUndefined()

      expect(mockCommand).not.toHaveBeenCalled()
      expect(stderr()).toBe('コマンドが見つかりません: missing' + helpHint([], { locale: 'ja-JP' }))
    })
  })

  test('hooks with subcommands', async () => {
    const executionOrder: string[] = []
    const deployCommand = define({
      name: 'deploy',
      run: () => {
        executionOrder.push('deploy')
      }
    })

    const testCommand = define({
      name: 'test',
      run: () => {
        executionOrder.push('test')
      }
    })

    await cli(
      ['deploy'],
      { run: () => {} },
      {
        subCommands: new Map([
          ['deploy', deployCommand],
          ['test', testCommand]
        ]),
        onBeforeCommand: ctx => {
          executionOrder.push(`before-${ctx.name}`)
        },
        onAfterCommand: ctx => {
          executionOrder.push(`after-${ctx.name}`)
        }
      }
    )

    expect(executionOrder).toEqual(['before-deploy', 'deploy', 'after-deploy'])
  })

  test('onErrorCommand hook error handling', async () => {
    const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const testError = new Error('Command error')
    const hookError = new Error('Hook error')

    await expect(
      cli(
        [],
        {
          run: () => {
            throw testError
          }
        },
        {
          onErrorCommand: () => {
            throw hookError
          }
        }
      )
    ).rejects.toThrow('Command error')

    expect(mockConsoleError).toHaveBeenCalledWith('Error in onErrorCommand hook:', hookError)
    mockConsoleError.mockRestore()
  })

  test('hooks with plugins', async () => {
    const executionOrder: string[] = []

    const testPlugin = plugin({
      id: 'test',
      name: 'Test Plugin',
      setup: ctx => {
        ctx.decorateCommand(baseRunner => async cmdCtx => {
          executionOrder.push('plugin-before')
          const result = await baseRunner(cmdCtx)
          executionOrder.push('plugin-after')
          return result
        })
      }
    })

    await cli(
      [],
      {
        run: () => {
          executionOrder.push('command')
        }
      },
      {
        plugins: [testPlugin],
        onBeforeCommand: () => {
          executionOrder.push('hook-before')
        },
        onAfterCommand: () => {
          executionOrder.push('hook-after')
        }
      }
    )

    // hooks run outside plugins
    expect(executionOrder).toEqual([
      'hook-before',
      'plugin-before',
      'command',
      'plugin-after',
      'hook-after'
    ])
  })
})

test('subCommands option with command array', async () => {
  const mockCommand1 = vi.fn<() => void>()
  const mockCommand2 = vi.fn<() => void>()
  const subCommands = {
    command1: {
      run: mockCommand1
    },
    command2: {
      run: mockCommand2
    }
  }

  await cli(['command1'], { run: vi.fn<() => void>() }, { subCommands })
  expect(mockCommand1).toBeCalled()

  await cli(['command2'], { run: vi.fn<() => void>() }, { subCommands })
  expect(mockCommand2).toBeCalled()
})

describe('github issues', () => {
  test('#252', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)

    const meta = {
      name: 'mycli',
      description: 'mycli description',
      version: '1.2.3'
    }

    const rendered1 = await cli(['-h'], { run: vi.fn<() => void>() }, { ...meta })
    expect(rendered1).toMatchSnapshot('example1')

    const rendered2 = await cli(
      ['-h'],
      { run: vi.fn<() => void>() },
      {
        ...meta,
        subCommands: new Map([['cmd1', { run: vi.fn<() => void>() }]])
      }
    )
    expect(rendered2).toMatchSnapshot('example2')

    const rendered3 = await cli(
      ['-h'],
      { run: vi.fn<() => void>() },
      {
        ...meta,
        subCommands: new Map([
          ['cmd1', { run: vi.fn<() => void>() }],
          ['cmd2', { run: vi.fn<() => void>() }]
        ])
      }
    )
    expect(rendered3).toMatchSnapshot('example3')

    expect(log()).toMatchSnapshot('console output')
  })

  describe('#716 - lazy command definition dropped by a loaded command object', () => {
    const definition = define({
      name: 'deploy',
      description: 'Deploy the app',
      args: {
        env: { type: 'string', short: 'e', description: 'Target environment', required: true },
        port: { type: 'number', default: 3000 }
      },
      examples: '$ my-cli deploy --env prod'
    })

    // the two shapes that a loader can return for the same definition
    const loaders = {
      runner: (run: CommandRunner) => () => run,
      command: (run: CommandRunner) => () => define({ run })
    }

    function createOptions(shape: keyof typeof loaders, run: CommandRunner): CliOptions {
      return {
        name: 'my-cli',
        version: '1.0.0',
        subCommands: { deploy: lazy(loaders[shape](run), definition) }
      }
    }

    const entry = define({ run: () => {} })

    test.each(['runner', 'command'] as const)(
      'loader that returns a %s: parse the arguments of the definition',
      async shape => {
        const run = vi.fn<CommandRunner>()

        await cli(['deploy', '--env', 'prod'], entry, createOptions(shape, run))

        expect(run).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'deploy',
            description: 'Deploy the app',
            values: { env: 'prod', port: 3000 }
          })
        )
      }
    )

    test.each(['runner', 'command'] as const)(
      'loader that returns a %s: validate the arguments of the definition',
      async shape => {
        const stderr = defineMockErrorLog()
        const run = vi.fn<CommandRunner>()

        await expect(cli(['deploy'], entry, createOptions(shape, run))).resolves.toBeUndefined()
        expect(run).not.toHaveBeenCalled()
        expect(stderr()).toContain("'--env'")
        expect(process.exitCode).toBe(1)
      }
    )

    test('usage is the same for both of the loaders', async () => {
      const usage = await generate(
        'deploy',
        entry,
        createOptions('command', vi.fn<CommandRunner>())
      )

      expect(usage).toContain('Deploy the app')
      expect(usage).toContain('-e, --env <env>')
      expect(usage).toContain('$ my-cli deploy --env prod')
      expect(usage).toEqual(
        await generate('deploy', entry, createOptions('runner', vi.fn<CommandRunner>()))
      )
    })

    test('entry command of a CLI without sub-commands', async () => {
      const options = { name: 'my-cli', version: '1.0.0' }
      const usage = await generate(
        null,
        lazy(loaders.command(vi.fn<CommandRunner>()), definition),
        options
      )

      expect(usage).toContain('-e, --env <env>')
      expect(usage).toContain('$ my-cli deploy --env prod')
      expect(usage).toEqual(
        await generate(null, lazy(loaders.runner(vi.fn<CommandRunner>()), definition), options)
      )
    })
  })

  // the `rendering` half of the issue is in rendering.test.ts, under `Command rendering options`
  describe('#717 - `toKebab` and `rendering` of a lazy command ignored', () => {
    const definition = define({
      name: 'deploy',
      description: 'Deploy the app',
      toKebab: true,
      args: {
        dryRun: { type: 'boolean', negatable: true, description: 'Dry run' },
        targetEnv: { type: 'string', required: true, description: 'Target environment' }
      }
    })

    // `plain` is the baseline, and the others are where `toKebab` of a lazy command comes from
    const commands = {
      plain: (run: CommandRunner) => define({ ...definition, run }),
      'lazy with the definition': (run: CommandRunner) => lazy(() => run, definition),
      'lazy with the loaded command': (run: CommandRunner) =>
        lazy(() => define({ ...definition, run }), { name: 'deploy' }),
      // the loaded command defines no `toKebab`, so it falls back to the definition
      'lazy with both': (run: CommandRunner) => lazy(() => define({ run }), definition)
    }
    const kinds = Object.keys(commands) as (keyof typeof commands)[]
    const lazyKinds = kinds.filter(kind => kind !== 'plain')

    function createOptions(kind: keyof typeof commands, run: CommandRunner): CliOptions {
      return {
        name: 'my-cli',
        version: '1.0.0',
        subCommands: { deploy: commands[kind](run) }
      }
    }

    const entry = define({ run: () => {} })

    test.each(kinds)('%s: parse the kebab-case options', async kind => {
      const run = vi.fn<CommandRunner>()

      await cli(['deploy', '--target-env', 'prod', '--no-dry-run'], entry, createOptions(kind, run))

      expect(run).toHaveBeenCalledWith(
        expect.objectContaining({
          toKebab: true,
          values: { targetEnv: 'prod', dryRun: false }
        })
      )
    })

    test.each(kinds)('%s: kebab-case options are known ones with `strict`', async kind => {
      const run = vi.fn<CommandRunner>()

      await cli(['deploy', '--target-env', 'prod', '--dry-run'], entry, {
        ...createOptions(kind, run),
        strict: true
      })

      expect(run).toHaveBeenCalledWith(
        expect.objectContaining({ values: { targetEnv: 'prod', dryRun: true } })
      )
    })

    test('usage is the same as the one of the command that is not lazy', async () => {
      const usage = await generate('deploy', entry, createOptions('plain', vi.fn<CommandRunner>()))

      expect(usage).toContain('--target-env <target-env>')
      expect(usage).toContain('--no-dry-run')
      for (const kind of lazyKinds) {
        expect(
          await generate('deploy', entry, createOptions(kind, vi.fn<CommandRunner>()))
        ).toEqual(usage)
      }
    })

    test.each(lazyKinds)('%s: entry command of a CLI without sub-commands', async kind => {
      const run = vi.fn<CommandRunner>()

      await cli(['--target-env', 'prod'], commands[kind](run), {
        name: 'my-cli',
        version: '1.0.0'
      })

      expect(run).toHaveBeenCalledWith(
        expect.objectContaining({ toKebab: true, values: { targetEnv: 'prod' } })
      )
    })

    test.each(lazyKinds)('%s: nested sub-command', async kind => {
      const run = vi.fn<CommandRunner>()
      const remote = define({
        name: 'remote',
        subCommands: { deploy: commands[kind](run) },
        run: () => {}
      })

      await cli(['remote', 'deploy', '--target-env', 'prod'], entry, {
        name: 'my-cli',
        version: '1.0.0',
        subCommands: { remote }
      })

      expect(run).toHaveBeenCalledWith(
        expect.objectContaining({ toKebab: true, values: { targetEnv: 'prod' } })
      )
    })
  })

  describe("#729 - a command's own `version` / `help` argument is hijacked", () => {
    const base = { name: 'my-cli', version: '9.9.9', usageSilent: true } satisfies CliOptions

    function createCli(args: Args, run: CommandRunner, argv: string[]) {
      const command = define({ name: 'target', args, run })
      return cli(['target', ...argv], define({ name: 'root', run: () => {} }), {
        ...base,
        subCommands: { target: command }
      })
    }

    test('an option of the command takes the value, instead of printing the version', async () => {
      const run = vi.fn<CommandRunner>()

      await createCli({ version: { type: 'string', description: 'Version to release' } }, run, [
        '--version',
        '1.2.3'
      ])

      expect(run).toHaveBeenCalledWith(expect.objectContaining({ values: { version: '1.2.3' } }))
    })

    test('a default value does not make the command unreachable', async () => {
      const run = vi.fn<CommandRunner>()

      // `values.version` is truthy on every run, so the command could never be reached
      await createCli({ version: { type: 'string', default: 'latest' } }, run, [])

      expect(run).toHaveBeenCalledWith(expect.objectContaining({ values: { version: 'latest' } }))
    })

    test('an option of the command takes the value, instead of printing the usage', async () => {
      const run = vi.fn<CommandRunner>()

      await createCli({ help: { type: 'string', description: 'Help topic' } }, run, [
        '--help',
        'topics'
      ])

      expect(run).toHaveBeenCalledWith(expect.objectContaining({ values: { help: 'topics' } }))
    })

    test('a positional argument of the command is not a global option either', async () => {
      const run = vi.fn<CommandRunner>()

      // nothing on the command line looks like `--version`, yet the version used to be printed
      await createCli({ version: { type: 'positional' } }, run, ['1.2.3'])

      expect(run).toHaveBeenCalledWith(expect.objectContaining({ values: { version: '1.2.3' } }))
    })

    test('the entry command may declare it too', async () => {
      const run = vi.fn<CommandRunner>()
      const entry = define({ name: 'root', args: { version: { type: 'string' } }, run })

      await cli(['--version', '1.2.3'], entry, base)

      expect(run).toHaveBeenCalledWith(expect.objectContaining({ values: { version: '1.2.3' } }))
    })

    test('a command that declares neither keeps the global options', async () => {
      const run = vi.fn<CommandRunner>()
      const args = { name: { type: 'string' } } satisfies Args

      await expect(createCli(args, run, ['--version'])).resolves.toBe('9.9.9')
      await expect(createCli(args, run, ['--help'])).resolves.toContain('OPTIONS')
      expect(run).not.toHaveBeenCalled()
    })

    test("a schema identical to the global one is still the command's", async () => {
      const run = vi.fn<CommandRunner>()

      await createCli(
        { version: { type: 'boolean', short: 'v', description: 'Display this version' } },
        run,
        ['--version']
      )

      expect(run).toHaveBeenCalledWith(expect.objectContaining({ values: { version: true } }))
    })

    test("an identical help schema is still the command's", async () => {
      const run = vi.fn<CommandRunner>()

      await createCli(
        { help: { type: 'boolean', short: 'h', description: 'Display this help message' } },
        run,
        ['--help']
      )

      expect(run).toHaveBeenCalledWith(expect.objectContaining({ values: { help: true } }))
    })
  })

  describe('#722 - positional arguments lost when a plugin adds a command', () => {
    const args = { name: { type: 'positional', description: 'Name to greet' } } satisfies Args

    function addsCommand(name: string, run: () => void = () => {}, internal = false) {
      return plugin({
        id: `adds-${name}`,
        setup: ctx => {
          ctx.addCommand(name, { name, internal, run })
        }
      })
    }

    function createEntry(run: CommandRunner) {
      return define({ name: 'greet', args, run })
    }

    const base = { name: 'my-cli', version: '1.0.0', usageSilent: true } satisfies CliOptions

    test.each([
      ['a plain value', 'World'],
      // the entry command is not part of `subCommands`, so its own name is a plain value too
      ["the entry command's own name", 'greet'],
      // only an exact match is a command name
      ['a near miss of the plugin command', 'healt']
    ])('%s is a positional argument, not a command name', async (_label, value) => {
      const run = vi.fn<CommandRunner>()

      await cli([value], createEntry(run), { ...base, plugins: [addsCommand('health')] })

      expect(run).toHaveBeenCalledWith(expect.objectContaining({ values: { name: value } }))
    })

    test('an internal command of a plugin does not change it either', async () => {
      const run = vi.fn<CommandRunner>()

      await cli(['World'], createEntry(run), {
        ...base,
        plugins: [addsCommand('health', () => {}, true)]
      })

      expect(run).toHaveBeenCalledWith(expect.objectContaining({ values: { name: 'World' } }))
    })

    test('the command that the plugin adds still runs', async () => {
      const run = vi.fn<CommandRunner>()
      const health = vi.fn<() => void>()

      await cli(['health'], createEntry(run), { ...base, plugins: [addsCommand('health', health)] })

      expect(health).toHaveBeenCalled()
      expect(run).not.toHaveBeenCalled()
    })

    test('`fallbackToEntry: false` keeps the error', async () => {
      const run = vi.fn<CommandRunner>()

      await expect(
        cli(['World'], createEntry(run), {
          ...base,
          fallbackToEntry: false,
          plugins: [addsCommand('health')]
        })
      ).rejects.toBeInstanceOf(AggregateError)
      expect(run).not.toHaveBeenCalled()
    })

    test('a CLI that declares sub-commands still reports an unknown command', async () => {
      const run = vi.fn<CommandRunner>()

      await expect(
        cli(['World'], createEntry(run), {
          ...base,
          subCommands: { list: define({ name: 'list', run: () => {} }) },
          plugins: [addsCommand('health')]
        })
      ).rejects.toBeInstanceOf(AggregateError)
      expect(run).not.toHaveBeenCalled()
    })

    test('a plugin that adds no command leaves `fallbackToEntry` alone', async () => {
      let env: Readonly<CommandEnvironment> | undefined
      const noCommand = plugin({ id: 'no-command', setup: () => {} })

      await cli(
        ['World'],
        createEntry(ctx => {
          env = ctx.env
        }),
        { ...base, plugins: [noCommand] }
      )

      expect((env as { fallbackToEntry?: boolean } | undefined)?.fallbackToEntry).toBe(false)
    })
  })

  describe('#874 - a word that is not a command name, when plugins add the commands of an entry without run', () => {
    afterEach(() => {
      process.exitCode = undefined
    })

    const add = define({ name: 'add', description: 'Add a record', run: () => {} })
    const list = define({ name: 'list', description: 'List the records', run: () => {} })
    const tools = plugin({
      id: 'tools',
      setup: ctx => {
        ctx.addCommand('add', add)
        ctx.addCommand('list', list)
      }
    })

    test.each([
      ['a plugin adds the commands', { plugins: [tools] }],
      ['the CLI declares the commands', { subCommands: { add, list } }]
    ])('is reported to stderr with exit code 1 when %s', async (_label, options) => {
      const stderr = defineMockErrorLog()

      await expect(
        cli(['ad'], define({ name: 'app' }), { name: 'app', ...options })
      ).resolves.toBeUndefined()

      expect(stderr()).toContain('Command not found: ad')
      expect(process.exitCode).toBe(1)
    })

    test('is the error that cli() rejects with, with usageSilent and with gunshi/bone', async () => {
      const entry = define({ name: 'app' })

      for (const run of [
        cli(['ad'], entry, { name: 'app', usageSilent: true, plugins: [tools] }),
        boneCli(['ad'], entry, { name: 'app', plugins: [tools] })
      ]) {
        const error = await run.then(
          () => undefined,
          (error: unknown) => error
        )
        expect(error).toBeInstanceOf(AggregateError)
        expect((error as AggregateError).errors).toEqual([
          expect.objectContaining({ message: 'Command not found: ad' })
        ])
      }
    })

    test('the commands that the plugins add still run, and the entry alone prints its usage', async () => {
      const run = vi.fn<() => void>()
      const adds = plugin({
        id: 'adds',
        setup: ctx => {
          ctx.addCommand('add', define({ name: 'add', run }))
        }
      })
      const options = { name: 'app', usageSilent: true, plugins: [adds] } satisfies CliOptions

      await cli(['add'], define({ name: 'app' }), options)
      const usage = await cli([], define({ name: 'app' }), options)

      expect(run).toHaveBeenCalledTimes(1)
      expect(usage).toContain('USAGE:\n  app [COMMANDS] [OPTIONS]')
    })

    test.each([
      ['an entry command with run', (run: CommandRunner) => define({ name: 'app', run })],
      ['a runner given to cli()', (run: CommandRunner) => run],
      ['a lazy entry command', (run: CommandRunner) => lazy(() => run, { name: 'app' })]
    ])('%s still takes the word, as since #722', async (_label, createEntry) => {
      const run = vi.fn<CommandRunner>()

      await cli(['ad'], createEntry(run), { name: 'app', usageSilent: true, plugins: [tools] })

      expect(run).toHaveBeenCalledWith(expect.objectContaining({ positionals: ['ad'] }))
    })

    test('an explicit `fallbackToEntry: true` still passes the word to the entry, as before', async () => {
      const stderr = defineMockErrorLog()

      await expect(
        cli(['ad'], define({ name: 'app' }), {
          name: 'app',
          plugins: [tools],
          fallbackToEntry: true
        })
      ).resolves.toBeUndefined()

      expect(stderr()).toBe('')
      expect(process.exitCode).toBeUndefined()
    })
  })

  describe('#768 - plugin-added commands include the entry in help', () => {
    function createEntry() {
      return define({
        name: 'build',
        description: 'Build the project',
        args: { target: { type: 'positional', description: 'Build target' } },
        run: vi.fn<CommandRunner>()
      })
    }

    function createCommands(count: number) {
      const commands = [
        define({ name: 'clean', description: 'Clean artifacts', run: vi.fn<CommandRunner>() }),
        define({ name: 'lint', description: 'Run linter', run: vi.fn<CommandRunner>() })
      ]
      return Object.fromEntries(commands.slice(0, count).map(command => [command.name, command]))
    }

    function addCommands(commands: Record<string, Command>) {
      return plugin({
        id: 'issue-768-help',
        setup: ctx => {
          for (const [name, command] of Object.entries(commands)) {
            ctx.addCommand(name, command)
          }
        }
      })
    }

    test.each([1, 2])('matches subCommands help with %s plugin command(s)', async count => {
      const options = { name: 'mycli', renderHeader: null, usageSilent: true } satisfies CliOptions
      const commands = createCommands(count)
      const userHelp = await cli(['--help'], createEntry(), {
        ...options,
        subCommands: commands
      })
      const mapHelp = await cli(['--help'], createEntry(), {
        ...options,
        subCommands: new Map(Object.entries(commands))
      })
      const pluginHelp = await cli(['--help'], createEntry(), {
        ...options,
        plugins: [addCommands(createCommands(count))]
      })

      expect(mapHelp).toBe(userHelp)
      expect(pluginHelp).toBe(userHelp)
      expect(pluginHelp).toContain('  [build] <target>')
      expect(pluginHelp?.match(/^ {2}mycli --help$/gm)).toHaveLength(1)
    })

    test('does not add the entry to the command registry', async () => {
      let env: Readonly<CommandEnvironment> | undefined
      const entry = createEntry()
      const pluginCommand = define({ name: 'clean', run: () => {} })
      const tools = plugin({
        id: 'issue-768-registry',
        setup: ctx => ctx.addCommand('clean', pluginCommand)
      })

      await cli(['clean'], entry, {
        name: 'mycli',
        plugins: [
          tools,
          plugin({
            id: 'issue-768-capture',
            setup: ctx =>
              ctx.decorateCommand(base => commandCtx => {
                env = commandCtx.env
                return base(commandCtx)
              })
          })
        ]
      })

      expect([...(env?.subCommands?.keys() || [])]).toEqual(['clean'])
      expect(env?.entryCommand).toMatchObject({ name: 'build', entry: true })
    })

    test('includes the root entry when a distinct plugin command is marked as entry', async () => {
      const pluginEntry = define({ name: 'plugin', entry: true, run: vi.fn<CommandRunner>() })
      const usage = await cli(['--help'], createEntry(), {
        name: 'mycli',
        renderHeader: null,
        usageSilent: true,
        plugins: [addCommands({ plugin: pluginEntry })]
      })

      expect(usage).toContain('  [build] <target>')
      expect(usage).toContain('  [plugin]')
    })
  })

  describe('#769 - unnamed lazy entry commands', () => {
    const args = { target: { type: 'string' } } satisfies Args
    const options = { name: 'mycli', renderHeader: null, usageSilent: true } satisfies CliOptions

    test('runs an unnamed lazy entry and passes parsed values to its runner', async () => {
      let loaderCalls = 0
      let runnerCalls = 0
      let values: unknown
      let commandName: string | undefined
      const command = lazy(async () => {
        loaderCalls++
        return ctx => {
          runnerCalls++
          values = ctx.values
          commandName = ctx.name
        }
      }, define({ args }))

      await cli(['--target', 'prod'], command, options)

      expect(loaderCalls).toBe(1)
      expect(runnerCalls).toBe(1)
      expect(values).toEqual({ target: 'prod' })
      expect(commandName).toBe('(anonymous)')
    })

    test('runs an unnamed lazy entry without a definition', async () => {
      let loaderCalls = 0
      let runnerCalls = 0
      const runner = vi.fn<CommandRunner>(() => {
        runnerCalls++
      })
      const command = lazy(async () => {
        loaderCalls++
        return runner
      })

      await cli([], command, options)

      expect(loaderCalls).toBe(1)
      expect(runnerCalls).toBe(1)
      expect(runner).toHaveBeenCalledWith(expect.objectContaining({ callMode: 'entry' }))
    })

    test('runs an unnamed lazy command registered as a sub-command', async () => {
      let loaderCalls = 0
      const runner = vi.fn<CommandRunner>()
      const command = lazy(async () => {
        loaderCalls++
        return runner
      }, define({ args }))

      await cli(['build', '--target', 'prod'], define({ run: () => {} }), {
        ...options,
        subCommands: { build: command }
      })

      expect(loaderCalls).toBe(1)
      expect(runner).toHaveBeenCalledWith(
        expect.objectContaining({ callMode: 'subCommand', values: { target: 'prod' } })
      )
    })

    test('does not load an unnamed lazy parent when resolving its child', async () => {
      let parentLoaderCalls = 0
      const childRunner = vi.fn<CommandRunner>()
      const parent = lazy(
        async () => {
          parentLoaderCalls++
          return () => {}
        },
        {
          subCommands: {
            add: define({ run: childRunner })
          }
        }
      )

      await cli(['remote', 'add'], define({ run: () => {} }), {
        ...options,
        subCommands: { remote: parent }
      })

      expect(parentLoaderCalls).toBe(0)
      expect(childRunner).toHaveBeenCalledWith(
        expect.objectContaining({ commandPath: ['remote', 'add'] })
      )
    })

    test('keeps validation before the runner for an unnamed lazy entry', async () => {
      let loaderCalls = 0
      const runner = vi.fn<CommandRunner>()
      const command = lazy(
        async () => {
          loaderCalls++
          return runner
        },
        { args: { target: { type: 'string', required: true } } }
      )

      await expect(cli([], command, options)).rejects.toMatchObject({
        errors: expect.arrayContaining([
          expect.objectContaining({ message: "Option '--target' is required" })
        ])
      })

      expect(loaderCalls).toBe(1)
      expect(runner).not.toHaveBeenCalled()
    })
  })

  describe('#499 - lazy command args not parsed', () => {
    const mainCommand = define({
      description: 'My CLI application',
      run: () => {}
    })

    const helloLoader = () => {
      return define({
        description: 'Say hello',
        args: {
          name: {
            type: 'string',
            description: 'The name of the person to say hello to',
            default: 'World'
          }
        },
        run(ctx) {
          console.log(`Hello ${ctx.values.name}!`)
        }
      })
    }

    const hello = lazy(helloLoader, {
      name: 'hello',
      description: 'Say hello'
    })

    const cliOptions: CliOptions = {
      name: 'my-cli',
      version: '1.0.0',
      subCommands: { hello }
    }

    test('lazy sub-command uses default argument values', async () => {
      using spy = vi.spyOn(console, 'log')

      await cli(['hello'], mainCommand, cliOptions)

      expect(spy).toHaveBeenLastCalledWith('Hello World!')
    })

    test('lazy sub-command uses argument values', async () => {
      using spy = vi.spyOn(console, 'log')

      await cli(['hello', '--name', 'Gunshi'], mainCommand, cliOptions)

      expect(spy).toHaveBeenLastCalledWith('Hello Gunshi!')
    })

    test('lazy sub-command usage includes argument definitions', async () => {
      const usage = await generate('hello', mainCommand, cliOptions)

      expect(usage).toMatchSnapshot()
    })
  })

  describe('#728 - hidden arguments suggested for an unknown option', () => {
    const args = {
      output: { type: 'string', description: 'Output file' },
      legacyMode: { type: 'boolean', description: 'Deprecated flag', hidden: true },
      legacyLevel: { type: 'string', short: 'L', description: 'Deprecated level', hidden: true },
      legacyForce: {
        type: 'boolean',
        negatable: true,
        description: 'Deprecated force',
        hidden: true
      },
      force: { type: 'boolean', negatable: true, description: 'Force' }
    } as const

    async function candidatesOf(argv: string[]): Promise<unknown> {
      let captured: AggregateError | undefined
      await expect(
        cli(
          argv,
          { name: 'app', args, run: vi.fn<() => void>() },
          {
            strict: true,
            usageSilent: true,
            onErrorCommand: (_ctx, error) => {
              captured = error as AggregateError
            }
          }
        )
      ).rejects.toBeInstanceOf(AggregateError)
      return (captured?.errors[0] as { values: Record<string, unknown> } | undefined)?.values
        ?.candidates
    }

    test('a hidden option is not offered as a candidate', async () => {
      expect(await candidatesOf(['--outpu'])).toEqual([
        '--help',
        '--version',
        '--output',
        '--force',
        '--no-force'
      ])
    })

    test('a mistyped hidden option reports the error without naming it', async () => {
      expect(await candidatesOf(['--legacyMod'])).not.toContain('--legacyMode')
    })

    test('a hidden option is still accepted, which is what `hidden` means', async () => {
      const run = vi.fn<(ctx: { values: Record<string, unknown> }) => void>()

      await cli(
        ['--legacyMode', '--legacyLevel', 'trace', '--no-legacyForce', '--output', 'dist'],
        { name: 'app', args, run },
        { strict: true, usageSilent: true }
      )

      expect(run.mock.calls[0][0].values).toMatchObject({
        legacyMode: true,
        legacyLevel: 'trace',
        legacyForce: false,
        output: 'dist'
      })
    })

    test('the short name of a hidden option is still accepted', async () => {
      const run = vi.fn<(ctx: { values: Record<string, unknown> }) => void>()

      await cli(['-L', 'trace'], { name: 'app', args, run }, { strict: true, usageSilent: true })

      expect(run.mock.calls[0][0].values).toMatchObject({ legacyLevel: 'trace' })
    })
  })

  describe("#730 - a command's own short option loses to a global one", () => {
    const build = define({
      name: 'build',
      args: { verbose: { type: 'boolean', short: 'v', description: 'Verbose output' } },
      run: vi.fn<(ctx: { values: Record<string, unknown> }) => void>()
    })
    const serve = define({
      name: 'serve',
      args: { host: { type: 'string', short: 'h', description: 'Host name' } },
      run: vi.fn<(ctx: { values: Record<string, unknown> }) => void>()
    })
    const entry = define({
      name: 'root',
      run: vi.fn<(ctx: { values: Record<string, unknown> }) => void>()
    })

    function run(argv: string[]): Promise<string | undefined> {
      return cli(argv, entry, {
        name: 'my-cli',
        version: '9.9.9',
        usageSilent: true,
        renderHeader: null,
        subCommands: { build, serve }
      })
    }

    test('a boolean short name reaches the command, not the global option', async () => {
      await run(['build', '-v'])

      expect(build.run.mock.calls[0][0].values).toEqual({ verbose: true })
    })

    test.each([
      ['separate', ['serve', '-h', 'localhost']],
      ['inline', ['serve', '-h=localhost']]
    ])('a short name that takes a value keeps it (%s)', async (_, argv) => {
      await run(argv)

      expect(serve.run.mock.calls[0][0].values).toEqual({ host: 'localhost' })
    })

    test('the global option keeps its long name', async () => {
      expect(await run(['build', '--version'])).toEqual('9.9.9')
      expect(await run(['serve', '--help'])).toContain('--help')
      expect(build.run).not.toHaveBeenCalled()
      expect(serve.run).not.toHaveBeenCalled()
    })

    test('only the global option of the same letter gives up its short name', async () => {
      const usage = await run(['build', '--help'])

      // `verbose` claims `-v`, so `--version` gives it up, while `--help` keeps `-h`
      expect(usage).toContain('-h, --help')
      expect(usage).toContain('--version')
      expect(usage).not.toContain('-v, --version')
      expect(usage).toContain('-v, --verbose')
    })

    test('a command that claims no short name leaves the global ones alone', async () => {
      expect(await run(['-v'])).toEqual('9.9.9')
      expect(await run(['-h'])).toContain('-h, --help')
    })

    test('a short name of a global option that a plugin adds is shadowed too', async () => {
      const deploy = define({
        name: 'deploy',
        args: { port: { type: 'number', short: 'p', description: 'Port' } },
        run: vi.fn<(ctx: { values: Record<string, unknown> }) => void>()
      })
      const globals = plugin({
        id: 'test:globals',
        name: 'globals',
        setup: ctx => {
          ctx.addGlobalOption('profile', { type: 'string', short: 'p', description: 'Profile' })
        }
      })

      await cli(['deploy', '-p', '8080'], entry, {
        name: 'my-cli',
        version: '9.9.9',
        usageSilent: true,
        renderHeader: null,
        subCommands: { deploy },
        plugins: [globals]
      })

      expect(deploy.run.mock.calls[0][0].values).toEqual({ port: 8080 })
    })

    test('the schema that the plugin registered is left as it is', async () => {
      // the global options are shared by every command, so a command that gives one a new short
      // name must not change what the next command sees
      await run(['build', '-v'])

      expect(await run(['-v'])).toEqual('9.9.9')
      expect(await run(['serve', '--help'])).toContain('-v, --version')
    })
  })

  describe('#742 - a plugin that cannot be installed', () => {
    const entry = { name: 'root', run: vi.fn<() => void>() } satisfies Command
    const base = { name: 'my-cli', version: '0.0.0', usageSilent: true } satisfies CliOptions

    function failing(id: string, error: Error, sync = true) {
      return plugin({
        id,
        setup: () => {
          if (sync) {
            throw error
          }
          return Promise.reject(error)
        }
      })
    }

    test('ends the run, naming the plugin', async () => {
      await expect(
        cli([], entry, { ...base, plugins: [failing('broken', new Error('boom'))] })
      ).rejects.toThrow('Failed to install the plugin `broken`')
    })

    test('carries the error it was given as the cause', async () => {
      const cause = new Error('boom')

      await expect(
        cli([], entry, { ...base, plugins: [failing('broken', cause)] })
      ).rejects.toMatchObject({ cause })
    })

    test('a `setup` that rejects ends the run the same way', async () => {
      await expect(
        cli([], entry, { ...base, plugins: [failing('broken', new Error('boom'), false)] })
      ).rejects.toThrow('Failed to install the plugin `broken`')
    })

    test('a global option that is already registered ends the run', async () => {
      const clash = plugin({
        id: 'clash',
        setup: ctx => {
          // `help` belongs to `@gunshi/plugin-global`, which is installed before this one
          ctx.addGlobalOption('help', { type: 'string' })
        }
      })

      await expect(cli([], entry, { ...base, plugins: [clash] })).rejects.toThrow(
        'Failed to install the plugin `clash`'
      )
    })

    test('the plugins behind it are not installed', async () => {
      const setup = vi.fn<() => void>()
      const after = plugin({ id: 'after', setup })

      await expect(
        cli([], entry, { ...base, plugins: [failing('broken', new Error('boom')), after] })
      ).rejects.toThrow('Failed to install the plugin `broken`')
      expect(setup).not.toHaveBeenCalled()
    })

    test('the command is not run', async () => {
      const run = vi.fn<() => void>()

      await expect(
        cli([], { name: 'root', run }, { ...base, plugins: [failing('broken', new Error('boom'))] })
      ).rejects.toThrow('Failed to install the plugin `broken`')
      expect(run).not.toHaveBeenCalled()
    })

    test('a plugin that installs cleanly is left alone', async () => {
      const run = vi.fn<CommandRunner>()
      const fine = plugin({
        id: 'fine',
        setup: ctx => {
          ctx.addGlobalOption('fineOpt', { type: 'boolean', description: 'Fine' })
        }
      })

      await cli([], { name: 'root', run }, { ...base, plugins: [fine] })

      expect(run).toHaveBeenCalledWith(
        expect.objectContaining({ args: expect.objectContaining({ fineOpt: expect.anything() }) })
      )
    })

    test('a circular dependency is reported as it was before', async () => {
      const a = plugin({ id: 'a', dependencies: ['b'], setup: () => {} })
      const b = plugin({ id: 'b', dependencies: ['a'], setup: () => {} })

      await expect(cli([], entry, { ...base, plugins: [a, b] })).rejects.toThrow(
        'Circular dependency detected'
      )
    })
  })

  describe('#761 - a plugin whose id is empty', () => {
    test('a function with no id is rejected, and the command is not run', async () => {
      const run = vi.fn<() => void>()
      const setup = vi.fn<() => void>()
      const raw = setup as unknown as Plugin

      await expect(
        cli(
          [],
          { name: 'root', run },
          {
            name: 'my-cli',
            version: '0.0.0',
            usageSilent: true,
            plugins: [raw]
          }
        )
      ).rejects.toThrow('Plugin id must be a non-empty string')
      expect(run).not.toHaveBeenCalled()
      expect(setup).not.toHaveBeenCalled()
    })
  })

  describe('#746 - two global options with the same short name', () => {
    const base = { name: 'my-cli', version: '9.9.9', usageSilent: true } satisfies CliOptions

    function global(id: string, name: string, schema: Args[string]) {
      return plugin({ id, setup: ctx => ctx.addGlobalOption(name, schema) })
    }

    // the collision is warned about, which `context.test.ts` pins; keep it out of the test output,
    // and give `console.warn` back afterwards so that the rest of the file sees the real one
    let warn: ReturnType<typeof vi.spyOn>
    beforeEach(() => {
      warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    })
    afterEach(() => {
      warn.mockRestore()
    })

    test('the letter reaches the one that asked for it first', async () => {
      const run = vi.fn<CommandRunner>()

      await cli(
        ['-c', 'conf.json'],
        { name: 'app', run },
        {
          ...base,
          plugins: [
            global('config', 'config', { type: 'string', short: 'c' }),
            // a boolean under the same letter used to make the parser leave the value behind
            global('color', 'color', { type: 'boolean', short: 'c' })
          ]
        }
      )

      expect(run).toHaveBeenCalledWith(
        expect.objectContaining({ values: expect.objectContaining({ config: 'conf.json' }) })
      )
    })

    test('the value does not reach both of them', async () => {
      const run = vi.fn<CommandRunner>()

      await cli(
        ['-c', 'conf.json'],
        { name: 'app', run },
        {
          ...base,
          plugins: [
            global('config', 'config', { type: 'string', short: 'c' }),
            global('cache', 'cache', { type: 'string', short: 'c' })
          ]
        }
      )

      const values = run.mock.calls[0][0].values as Record<string, unknown>
      expect(values.config).toBe('conf.json')
      expect(values.cache).toBeUndefined()
    })

    test('the long name of the one that gave the letter up still works', async () => {
      const run = vi.fn<CommandRunner>()

      await cli(
        ['--color'],
        { name: 'app', run },
        {
          ...base,
          plugins: [
            global('config', 'config', { type: 'string', short: 'c' }),
            global('color', 'color', { type: 'boolean', short: 'c' })
          ]
        }
      )

      expect(run).toHaveBeenCalledWith(
        expect.objectContaining({ values: expect.objectContaining({ color: true }) })
      )
    })

    test("a command's own short name still shadows a global one", async () => {
      const run = vi.fn<CommandRunner>()

      // #730: the command claims `-h`, and the global `help` gives it up for this command
      await cli(
        ['-h', 'myhost'],
        { name: 'app', args: { host: { type: 'string', short: 'h' } }, run },
        base
      )

      expect(run).toHaveBeenCalledWith(
        expect.objectContaining({ values: expect.objectContaining({ host: 'myhost' }) })
      )
    })
  })
})

describe('nested sub-commands', () => {
  test('2-level command execution (git remote add)', async () => {
    const utils = await import('./utils.ts')
    defineMockLog(utils)

    const mockAdd = vi.fn<() => void>()
    const mockRemove = vi.fn<() => void>()
    const mockRemote = vi.fn<() => void>()

    const addCommand = define({
      name: 'add',
      description: 'Add a remote',
      args: {
        url: { type: 'string', required: true }
      },
      run: mockAdd
    })

    const removeCommand = define({
      name: 'remove',
      description: 'Remove a remote',
      run: mockRemove
    })

    const remoteCommand = define({
      name: 'remote',
      description: 'Manage remotes',
      subCommands: { add: addCommand, remove: removeCommand },
      run: mockRemote
    })

    const entry = define({
      name: 'git',
      run: vi.fn<() => void>()
    })

    await cli(['remote', 'add', '--url', 'origin'], entry, {
      name: 'git',
      subCommands: { remote: remoteCommand }
    })

    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        callMode: 'subCommand',
        commandPath: ['remote', 'add'],
        values: { url: 'origin' }
      })
    )
    expect(mockRemote).not.toHaveBeenCalled()
  })

  test('3-level command execution', async () => {
    const utils = await import('./utils.ts')
    defineMockLog(utils)

    const mockLeaf = vi.fn<() => void>()

    const leafCommand = define({
      name: 'leaf',
      description: 'Leaf command',
      run: mockLeaf
    })

    const midCommand = define({
      name: 'mid',
      description: 'Middle command',
      subCommands: { leaf: leafCommand },
      run: vi.fn<() => void>()
    })

    const topCommand = define({
      name: 'top',
      description: 'Top command',
      subCommands: { mid: midCommand },
      run: vi.fn<() => void>()
    })

    await cli(
      ['top', 'mid', 'leaf'],
      { run: vi.fn<() => void>() },
      {
        name: 'app',
        subCommands: { top: topCommand }
      }
    )

    expect(mockLeaf).toHaveBeenCalledWith(
      expect.objectContaining({
        callMode: 'subCommand',
        commandPath: ['top', 'mid', 'leaf']
      })
    )
  })

  test('intermediate command with subCommands shows help (omitted mode)', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)

    const addCommand = define({
      name: 'add',
      description: 'Add a remote',
      run: vi.fn<() => void>()
    })

    const remoteCommand = define({
      name: 'remote',
      description: 'Manage remotes',
      subCommands: { add: addCommand },
      run: vi.fn<() => void>()
    })

    const entry = define({
      name: 'git',
      run: vi.fn<() => void>()
    })

    const rendered = await cli(['remote', '-h'], entry, {
      name: 'git',
      subCommands: { remote: remoteCommand }
    })

    expect(rendered).toBeTruthy()
    expect(log()).toBeTruthy()
  })

  test('intermediate command with own run() is executed', async () => {
    const utils = await import('./utils.ts')
    defineMockLog(utils)

    const mockRemote = vi.fn<() => void>()

    const addCommand = define({
      name: 'add',
      description: 'Add a remote',
      run: vi.fn<() => void>()
    })

    const remoteCommand = define({
      name: 'remote',
      description: 'Manage remotes',
      subCommands: { add: addCommand },
      run: mockRemote
    })

    // invoke 'remote' without specifying a nested sub-command
    await cli(
      ['remote'],
      { run: vi.fn<() => void>() },
      {
        name: 'git',
        subCommands: { remote: remoteCommand }
      }
    )

    expect(mockRemote).toHaveBeenCalledWith(
      expect.objectContaining({
        callMode: 'subCommand',
        omitted: true,
        commandPath: ['remote']
      })
    )
  })

  test('unknown nested sub-command is treated as positional argument', async () => {
    const utils = await import('./utils.ts')
    defineMockLog(utils)

    const mockAdd = vi.fn<() => void>()

    const addCommand = define({
      name: 'add',
      description: 'Add something',
      args: {
        item: { type: 'positional' }
      },
      run: mockAdd
    })

    const topCommand = define({
      name: 'top',
      description: 'Top command',
      subCommands: { add: addCommand },
      run: vi.fn<() => void>()
    })

    // 'top add unknown-thing' -> 'unknown-thing' should be a positional arg for 'add'
    await cli(
      ['top', 'add', 'unknown-thing'],
      { run: vi.fn<() => void>() },
      {
        name: 'app',
        subCommands: { top: topCommand }
      }
    )

    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        commandPath: ['top', 'add'],
        values: { item: 'unknown-thing' }
      })
    )
  })

  test('unknown nested sub-command reports parent command metadata', async () => {
    const mockRemote = vi.fn<() => void>()

    const remoteCommand = define({
      name: 'remote',
      description: 'Manage remotes',
      subCommands: {
        add: define({ name: 'add', run: vi.fn<() => void>() }),
        remove: define({ name: 'remove', run: vi.fn<() => void>() })
      },
      run: mockRemote
    })

    const stderr = defineMockErrorLog()
    let capturedError: AggregateError | undefined
    await expect(
      cli(
        ['remote', 'ad'],
        define({
          name: 'git',
          run: vi.fn<() => void>()
        }),
        {
          name: 'git',
          subCommands: { remote: remoteCommand },
          onErrorCommand: (ctx, error) => {
            capturedError = error as AggregateError
            expect(ctx.name).toBe('remote')
            expect(ctx.commandPath).toEqual(['remote'])
            expect(ctx.validationError).toBe(error)
          }
        }
      )
    ).resolves.toBeUndefined()
    expect(stderr()).toContain('Command not found: ad')

    const commandError = findCommandNotFoundError(capturedError)
    expect(commandError.commandName).toBe('ad')
    expect(commandError.commandPath).toEqual(['remote'])
    expect(commandError.candidates).toEqual(['add', 'remove'])
    expect(mockRemote).not.toHaveBeenCalled()
  })

  test('commandPath is correct for depth=1', async () => {
    const mockCmd = vi.fn<() => void>()

    const subCmd = define({
      name: 'sub',
      description: 'Sub command',
      run: mockCmd
    })

    await cli(
      ['sub'],
      { run: vi.fn<() => void>() },
      {
        subCommands: { sub: subCmd }
      }
    )

    expect(mockCmd).toHaveBeenCalledWith(
      expect.objectContaining({
        commandPath: ['sub']
      })
    )
  })

  test('commandPath is empty for entry command', async () => {
    const mockEntry = vi.fn<() => void>()

    await cli([], { run: mockEntry })

    expect(mockEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        commandPath: []
      })
    )
  })

  test('nested sub-commands with lazy commands', async () => {
    const utils = await import('./utils.ts')
    defineMockLog(utils)

    const mockAdd = vi.fn<() => void>()

    const addCommand = lazy(
      () =>
        Promise.resolve({
          name: 'add',
          description: 'Add a remote',
          args: { url: { type: 'string' } },
          run: mockAdd
        }),
      {
        name: 'add',
        description: 'Add a remote',
        args: { url: { type: 'string' } }
      }
    )

    const remoteCommand = define({
      name: 'remote',
      description: 'Manage remotes',
      subCommands: { add: addCommand },
      run: vi.fn<() => void>()
    })

    await cli(
      ['remote', 'add', '--url', 'origin'],
      { run: vi.fn<() => void>() },
      {
        name: 'git',
        subCommands: { remote: remoteCommand }
      }
    )

    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        commandPath: ['remote', 'add'],
        values: { url: 'origin' }
      })
    )
  })

  test('nested sub-commands as Record (not Map)', async () => {
    const mockAdd = vi.fn<() => void>()

    const addCommand = define({
      name: 'add',
      description: 'Add',
      run: mockAdd
    })

    const remoteCommand = define({
      name: 'remote',
      description: 'Remote',
      subCommands: { add: addCommand },
      run: vi.fn<() => void>()
    })

    await cli(
      ['remote', 'add'],
      { run: vi.fn<() => void>() },
      {
        subCommands: { remote: remoteCommand }
      }
    )

    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        commandPath: ['remote', 'add']
      })
    )
  })

  test('lazy command with subCommands metadata', async () => {
    const utils = await import('./utils.ts')
    defineMockLog(utils)

    const mockAdd = vi.fn<() => void>()

    const addCommand = define({
      name: 'add',
      description: 'Add a remote',
      run: mockAdd
    })

    const remoteCommand = lazy(
      () =>
        Promise.resolve({
          name: 'remote',
          description: 'Manage remotes',
          run: vi.fn<() => void>()
        }),
      {
        name: 'remote',
        description: 'Manage remotes',
        subCommands: { add: addCommand }
      }
    )

    await cli(
      ['remote', 'add'],
      { run: vi.fn<() => void>() },
      {
        name: 'git',
        subCommands: { remote: remoteCommand }
      }
    )

    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        commandPath: ['remote', 'add']
      })
    )
  })

  test('unknown nested sub-command resolves lazy parent command context', async () => {
    const mockRemote = vi.fn<() => void>()

    const remoteCommand = lazy(
      () =>
        Promise.resolve(
          define({
            name: 'remote',
            description: 'Manage remotes',
            subCommands: {
              add: define({ name: 'add', run: vi.fn<() => void>() }),
              remove: define({ name: 'remove', run: vi.fn<() => void>() })
            },
            run: mockRemote
          })
        ),
      {
        name: 'remote',
        description: 'Manage remotes',
        subCommands: {
          add: define({ name: 'add', run: vi.fn<() => void>() }),
          remove: define({ name: 'remove', run: vi.fn<() => void>() })
        }
      }
    )

    const stderr = defineMockErrorLog()
    let capturedError: AggregateError | undefined
    await expect(
      cli(
        ['remote', 'ad'],
        define({
          name: 'git',
          run: vi.fn<() => void>()
        }),
        {
          name: 'git',
          subCommands: { remote: remoteCommand },
          onErrorCommand: (ctx, error) => {
            capturedError = error as AggregateError
            expect(ctx.name).toBe('remote')
            expect(ctx.commandPath).toEqual(['remote'])
            expect(ctx.validationError).toBe(error)
          }
        }
      )
    ).resolves.toBeUndefined()
    expect(stderr()).toContain('Command not found: ad')

    const commandError = findCommandNotFoundError(capturedError)
    expect(commandError.commandName).toBe('ad')
    expect(commandError.commandPath).toEqual(['remote'])
    expect(commandError.candidates).toEqual(['add', 'remove'])
    expect(mockRemote).not.toHaveBeenCalled()
  })
})

describe('global options in the command environment', () => {
  async function envOf(
    args: Args,
    globals: Record<string, ArgSchema> = { token: { type: 'string', short: 't' } }
  ): Promise<Readonly<CommandEnvironment> | undefined> {
    let env: Readonly<CommandEnvironment> | undefined
    const adds = plugin({
      id: 'test:globals',
      name: 'globals',
      setup: ctx => {
        for (const [name, schema] of Object.entries(globals)) {
          ctx.addGlobalOption(name, schema)
        }
      }
    })

    await cli(
      [],
      define({
        name: 'deploy',
        args,
        run: ctx => {
          env = ctx.env
        }
      }),
      { name: 'my-cli', version: '0.0.0', usageSilent: true, plugins: [adds] }
    )

    return env
  }

  test('the global options that a plugin added are in effect', async () => {
    const env = await envOf({ output: { type: 'string' } })

    expect([...(env?.globalOptions?.keys() ?? [])]).toEqual(['help', 'version', 'token'])
    expect(env?.globalOptions?.get('token')).toEqual({ type: 'string', short: 't' })
  })

  test('an argument of the command takes its name out of the list', async () => {
    // the command declares `token` itself, so the global option is not in effect (#745)
    const env = await envOf({ token: { type: 'boolean', description: 'Use a token' } })

    expect([...(env?.globalOptions?.keys() ?? [])]).toEqual(['help', 'version'])
    expect(env?.globalOptions?.has('token')).toBe(false)
  })

  test('a global option that only gave up its short name is still in effect', async () => {
    // the command claims `-t`, so the global `token` keeps its long name only (#730)
    const env = await envOf({ tag: { type: 'string', short: 't', description: 'Tag' } })

    expect(env?.globalOptions?.has('token')).toBe(true)
    expect(env?.globalOptions?.get('token')).toEqual({ type: 'string', short: undefined })
  })

  test('a name that every object inherits is not read as a declaration', async () => {
    // `constructor` is on the prototype of an object literal, and inheriting a name is not
    // declaring an argument under it
    const inherited = 'constructor'
    const globals: Record<string, ArgSchema> = {}
    globals[inherited] = { type: 'boolean', description: 'Odd but legal' }
    const env = await envOf({ output: { type: 'string' } }, globals)

    expect(env?.globalOptions?.has('constructor')).toBe(true)
  })
})

describe('entry command in the command environment', () => {
  test('CLI without sub-commands', async () => {
    let env: Readonly<CommandEnvironment> | undefined
    const args = { config: { type: 'string', short: 'c' } } satisfies Args
    const entry = define({
      name: 'deploy',
      description: 'Deploy the app',
      args,
      run: ctx => {
        env = ctx.env
      }
    })

    await cli([], entry)

    expect(env?.subCommands?.size).toBe(0)
    expect(env?.entryCommand).toMatchObject({
      name: 'deploy',
      description: 'Deploy the app',
      entry: true
    })
    expect(env?.entryCommand?.args).toBe(args)
    // the command that the user passes is not marked
    expect(entry.entry).toBeUndefined()
  })

  test('CLI to which only a plugin adds a command', async () => {
    let env: Readonly<CommandEnvironment> | undefined
    const entry = define({ name: 'deploy', run: vi.fn<() => void>() })
    const tools = plugin({
      id: 'tools',
      setup: ctx => {
        ctx.addCommand('inspect', {
          name: 'inspect',
          run: cmdCtx => {
            env = cmdCtx.env
          }
        })
      }
    })

    await cli(['inspect'], entry, { plugins: [tools] })

    // the entry command is not part of the sub-commands, because the user passes none
    expect([...(env?.subCommands?.keys() || [])]).toEqual(['inspect'])
    expect(env?.entryCommand).toMatchObject({ name: 'deploy', entry: true })
  })

  test('CLI with sub-commands', async () => {
    let env: Readonly<CommandEnvironment> | undefined
    const entry = define({ name: 'main', run: vi.fn<() => void>() })
    const sub = define({
      name: 'sub',
      run: ctx => {
        env = ctx.env
      }
    })

    await cli(['sub'], entry, { subCommands: { sub } })

    expect(env?.entryCommand).toMatchObject({ name: 'main', entry: true })
    expect(env?.entryCommand).toBe(env?.subCommands?.get('main'))
  })

  test('lazy entry command', async () => {
    let env: Readonly<CommandEnvironment> | undefined
    const args = { config: { type: 'string', short: 'c' } } satisfies Args
    const entry = lazy(
      () => ctx => {
        env = ctx.env
      },
      { name: 'deploy', args }
    )

    await cli([], entry)

    const entryCommand = env?.entryCommand as LazyCommand | undefined
    expect(typeof entryCommand).toBe('function')
    expect(entryCommand?.commandName).toBe('deploy')
    expect(entryCommand?.entry).toBe(true)
    expect(entryCommand?.args).toBe(args)
    // the lazy command that the user passes is not marked
    expect(entry.entry).toBeUndefined()
  })

  test('inline command runner as entry', async () => {
    let env: Readonly<CommandEnvironment> | undefined
    const main: CommandRunner = ctx => {
      env = ctx.env
    }

    await cli([], main)

    expect(env?.entryCommand).toMatchObject({ name: 'main', entry: true, run: main })
  })

  test('nested sub-commands', async () => {
    let env: Readonly<CommandEnvironment> | undefined
    const remote = define({
      name: 'remote',
      subCommands: { add: define({ name: 'add', run: vi.fn<() => void>() }) },
      run: ctx => {
        env = ctx.env
      }
    })
    const entry = define({ name: 'git', run: vi.fn<() => void>() })

    await cli(['remote'], entry, { subCommands: { remote } })

    // the sub-commands are the ones of `remote`, which is their entry ...
    expect(env?.subCommands?.get('remote')?.entry).toBe(true)
    // ... while the entry command stays the one of the CLI
    expect(env?.entryCommand).toMatchObject({ name: 'git', entry: true })
  })

  test('not freeze the command that the user defines', async () => {
    let env: Readonly<CommandEnvironment> | undefined
    const args = { config: { type: 'string', short: 'c' } } satisfies Args
    const entry = define({
      name: 'deploy',
      args,
      run: ctx => {
        env = ctx.env
      }
    })

    await cli([], entry)

    // the command environment is frozen, but it must not reach the user's objects through the entry command
    expect(Object.isFrozen(env)).toBe(true)
    expect(Object.isFrozen(entry)).toBe(false)
    expect(Object.isFrozen(args)).toBe(false)
    expect(Object.isFrozen(args.config)).toBe(false)
  })
})

describe('arguments read by args-tokens 1.0', () => {
  interface Ran {
    commandPath: string[]
    values: Record<string, unknown>
    positionals: string[]
    rest: string[]
  }

  /**
   * Run a CLI, and record which command ran with what, or which validation errors it rejected with.
   *
   * @param argv - Command line arguments
   * @param subCommands - The sub-commands of the entry
   * @param options - Other CLI options
   * @returns The command that ran, or the codes of the validation errors
   */
  async function run(
    argv: string[],
    subCommands: Record<string, Command> = {
      build: { name: 'build', args: { out: { type: 'string', short: 'o' } } }
    },
    options: CliOptions = {}
  ): Promise<{ ran?: Ran; codes?: string[] }> {
    let ran: Ran | undefined
    const record: CommandRunner = ctx => {
      ran = {
        commandPath: [...ctx.commandPath],
        values: { ...ctx.values },
        positionals: [...ctx.positionals],
        rest: [...ctx.rest]
      }
    }
    const recorded = (command: Command): Command => ({
      ...command,
      run: record,
      subCommands:
        command.subCommands &&
        Object.fromEntries(
          Object.entries(command.subCommands as Record<string, Command>).map(([name, sub]) => [
            name,
            recorded(sub)
          ])
        )
    })

    try {
      await cli(
        argv,
        recorded({
          name: 'app',
          args: {
            quiet: { type: 'boolean', short: 'q' },
            port: { type: 'number', short: 'p' },
            config: { type: 'string', short: 'c' }
          }
        }),
        {
          usageSilent: true,
          subCommands: Object.fromEntries(
            Object.entries(subCommands).map(([name, command]) => [name, recorded(command)])
          ),
          ...options
        }
      )
    } catch (error) {
      if (error instanceof AggregateError) {
        return {
          codes: (error.errors as { code?: string }[]).map(e => e.code ?? e.constructor.name)
        }
      }
      throw error
    }
    return { ran }
  }

  test('an option that takes a number but has no value is reported, not thrown', async () => {
    // args-tokens 0.29.0 threw a `TypeError`, and the CLI rejected with it (args-tokens #619, #625)
    expect(await run(['--port'])).toEqual({ codes: ['err:arg:missing-value'] })
  })

  test('a dash in a short option group starts the value of the option before it', async () => {
    // `-o-` gives `-` to `-o`, so `build` is not taken as a value (args-tokens #641)
    expect(await run(['-o-', 'build'])).toMatchObject({
      ran: { commandPath: ['build'], values: { out: '-' } }
    })
  })

  test.each([[['-c=', 'build']], [['--config', '--==', 'build']]])(
    '%j does not give `build` to --config',
    async argv => {
      // an explicit empty value, or a long option without a name, is what `--config` gets
      // (args-tokens #637, #645)
      expect(await run(argv)).toMatchObject({ ran: { commandPath: ['build'] } })
    }
  )

  test('an empty argument after `--` goes to the rest, not to the positional arguments', async () => {
    // args-tokens 0.29.0 gave it to the positional arguments (args-tokens #640); the routing has
    // skipped it since #781 either way, so what is left to see is where the value goes
    expect(await run(['--quiet', '--', ''])).toEqual({
      ran: { commandPath: [], values: { quiet: true }, positionals: [], rest: [''] }
    })
  })

  test('an empty argument after `--` goes to the rest of a command that has sub-commands', async () => {
    const parent: Command = {
      name: 'parent',
      args: { verbose: { type: 'boolean' } },
      subCommands: { child: { name: 'child' } }
    }

    expect(await run(['parent', '--verbose', '--', ''], { parent })).toMatchObject({
      ran: { commandPath: ['parent'], values: { verbose: true }, rest: [''] }
    })
  })

  test('strict reports the options of the entry that the selected sub-command does not have', async () => {
    // `-q-` is `-q` with the value `-`, so `build` is the command (args-tokens #641)
    expect(await run(['-q-', 'build', '--nope'], undefined, { strict: true })).toEqual({
      codes: ['err:arg:unknown-option', 'err:arg:unknown-option']
    })
  })
})

function findCommandNotFoundError(error: AggregateError | undefined): CommandNotFoundError {
  expect(error).toBeInstanceOf(AggregateError)
  const commandError = error?.errors.find((error: unknown) => isCommandNotFoundError(error))
  expect(commandError).toBeInstanceOf(CommandNotFoundError)
  return commandError as CommandNotFoundError
}

describe('reported validation errors', () => {
  const args = {
    id: {
      type: 'string',
      required: true
    }
  } satisfies Args

  beforeEach(() => {
    // the tests check the exit code, which other tests may have left
    process.exitCode = undefined
  })

  test('resolve with undefined, with the message on stderr and exit code 1', async () => {
    const utils = await import('./utils.ts')
    const stdout = defineMockLog(utils)
    const stderr = defineMockErrorLog()
    const run = vi.fn<() => void>()

    await expect(cli([], { args, run })).resolves.toBeUndefined()

    expect(run).not.toHaveBeenCalled()
    expect(stderr()).toBe(`Option '--id' is required` + helpHint())
    expect(stdout()).toBe('')
    expect(process.exitCode).toBe(1)
  })

  test('onErrorCommand sees the errors after the exit code is set, and can change it', async () => {
    defineMockErrorLog()
    const onErrorCommand = vi.fn<NonNullable<CliOptions['onErrorCommand']>>((ctx, error) => {
      expect(process.exitCode).toBe(1)
      expect(error).toBe(ctx.validationError)
      process.exitCode = 2
    })

    await expect(
      cli([], { args, run: vi.fn<() => void>() }, { onErrorCommand })
    ).resolves.toBeUndefined()

    expect(onErrorCommand).toHaveBeenCalledWith(expect.anything(), expect.any(AggregateError))
    expect(process.exitCode).toBe(2)
  })

  test.each([
    ['`renderValidationErrors: null`', { renderValidationErrors: null }],
    [
      'a renderer that returns an empty message',
      { renderValidationErrors: () => Promise.resolve('') }
    ],
    ['`usageSilent`', { usageSilent: true }]
  ] as const)(
    'reject with the errors for %s, for the caller to report them',
    async (_, options) => {
      const stderr = defineMockErrorLog()

      await expect(cli([], { args, run: vi.fn<() => void>() }, options)).rejects.toBeInstanceOf(
        AggregateError
      )

      expect(stderr()).toBe('')
      expect(process.exitCode).toBeUndefined()
    }
  )

  test('an error thrown by a command still rejects', async () => {
    defineMockErrorLog()
    const error = new Error('boom')

    await expect(
      cli([], {
        run: () => {
          throw error
        }
      })
    ).rejects.toBe(error)

    expect(process.exitCode).toBeUndefined()
  })

  test('the mark of a reported error is used once', async () => {
    defineMockErrorLog()
    let reported: Error | undefined
    await expect(
      cli(
        [],
        { args, run: vi.fn<() => void>() },
        {
          onErrorCommand: (_ctx, error) => {
            reported = error
          }
        }
      )
    ).resolves.toBeUndefined()
    expect(reported).toBeInstanceOf(AggregateError)

    // a command that throws the same error later is not a reported validation error
    await expect(
      cli([], {
        run: () => {
          throw reported
        }
      })
    ).rejects.toBe(reported)
  })

  test('a nested cli() in onErrorCommand does not take the report of the outer run', async () => {
    defineMockErrorLog()
    let nested: unknown
    await expect(
      cli(
        [],
        { args, run: vi.fn<() => void>() },
        {
          onErrorCommand: async (_ctx, error) => {
            // the nested command throws the error of the outer run, which the nested run did not report
            nested = await cli([], {
              run: () => {
                throw error
              }
            }).catch((reason: unknown) => reason)
          }
        }
      )
    ).resolves.toBeUndefined()

    expect(nested).toBeInstanceOf(AggregateError)
  })

  test('an error that a decorator suppressed is not reported in a later run', async () => {
    defineMockErrorLog()
    let suppressed: unknown
    // installed before the global options plugin, so its decorator wraps the one of the plugin
    const suppress = plugin({
      id: 'test:suppress',
      setup: ctx => {
        ctx.decorateCommand(runner => async commandContext => {
          try {
            return await runner(commandContext)
          } catch (error: unknown) {
            suppressed = error
            return undefined
          }
        })
      }
    })
    await expect(
      boneCli([], { args, run: vi.fn<() => void>() }, { plugins: [suppress, global(), renderer()] })
    ).resolves.toBeUndefined()
    expect(suppressed).toBeInstanceOf(AggregateError)

    await expect(
      cli([], {
        run: () => {
          throw suppressed
        }
      })
    ).rejects.toBe(suppressed)
  })

  test('a priority error is reported too', async () => {
    const stderr = defineMockErrorLog()
    const run = vi.fn<() => void>()

    await expect(cli(['--nope'], { args, run }, { strict: true })).resolves.toBeUndefined()

    expect(run).not.toHaveBeenCalled()
    expect(stderr()).toContain('Unknown option: --nope')
    expect(process.exitCode).toBe(1)
  })
})

describe('the help after the validation errors', () => {
  const entry = define({ name: 'demo', run: vi.fn<() => void>() })
  const deploy = define({
    name: 'deploy',
    args: {
      name: { type: 'string', required: true },
      count: { type: 'number' }
    },
    run: vi.fn<() => void>()
  })
  const records = define({
    name: 'records',
    subCommands: {
      tags: define({
        name: 'tags',
        subCommands: { add: define({ name: 'add', run: vi.fn<() => void>() }) }
      })
    }
  })

  beforeEach(() => {
    // the tests check the exit code, which other tests may have left
    process.exitCode = undefined
  })

  test('an argument error is followed by the help of the command', async () => {
    const stderr = defineMockErrorLog()

    await expect(
      cli(['deploy'], entry, { name: 'demo', subCommands: { deploy } })
    ).resolves.toBeUndefined()

    expect(stderr()).toBe(`Option '--name' is required` + helpHint(['deploy'], { name: 'demo' }))
    expect(process.exitCode).toBe(1)
  })

  test('two or more errors are followed by the help once', async () => {
    const stderr = defineMockErrorLog()

    await expect(
      cli(['deploy', '--count', 'abc'], entry, { name: 'demo', subCommands: { deploy } })
    ).resolves.toBeUndefined()

    expect(stderr()).toBe(
      [`Option '--name' is required`, `Invalid value for '--count': expected number`].join('\n') +
        helpHint(['deploy'], { name: 'demo' })
    )
  })

  test.each([
    { argv: ['nope'], path: [] },
    { argv: ['records', 'nope'], path: ['records'] },
    { argv: ['records', 'tags', 'nope'], path: ['records', 'tags'] }
  ])(
    'an unknown command in $argv is followed by the help of its parent',
    async ({ argv, path }) => {
      const stderr = defineMockErrorLog()

      await expect(
        cli(argv, entry, { name: 'demo', subCommands: { deploy, records } })
      ).resolves.toBeUndefined()

      expect(stderr()).toBe('Command not found: nope' + helpHint(path, { name: 'demo' }))
      expect(process.exitCode).toBe(1)
    }
  )

  test('a command that cannot be resolved is followed by the help of the commands it is among', async () => {
    const stderr = defineMockErrorLog()
    const config = plugin({
      id: 'test:config',
      setup(ctx) {
        ctx.addGlobalOption('config', { type: 'string' })
      }
    })

    await expect(
      cli(['--config', 'clean', 'deploy'], entry, {
        name: 'demo',
        plugins: [config],
        subCommands: {
          clean: define({ name: 'clean', run: vi.fn<() => void>() }),
          deploy: define({
            name: 'deploy',
            args: { config: { type: 'boolean' } },
            run: vi.fn<() => void>()
          })
        }
      })
    ).resolves.toBeUndefined()

    expect(stderr()).toBe(
      'The options do not identify a consistent command. Move options after the command name.' +
        helpHint([], { name: 'demo' })
    )
  })

  test('follows the errors that a plugin of the app decorates', async () => {
    const stderr = defineMockErrorLog()
    const theme = plugin({
      id: 'test:theme',
      setup(ctx) {
        ctx.decorateValidationErrorsRenderer(
          async (baseRenderer, cmdCtx, error) => `[theme] ${await baseRenderer(cmdCtx, error)}`
        )
      }
    })

    await expect(
      cli(['deploy'], entry, { name: 'demo', plugins: [theme], subCommands: { deploy } })
    ).resolves.toBeUndefined()

    expect(stderr()).toBe(
      `[theme] Option '--name' is required` + helpHint(['deploy'], { name: 'demo' })
    )
  })

  test('the heading is translated by the i18n plugin', async () => {
    const stderr = defineMockErrorLog()

    await expect(
      cli(['records', 'nope'], entry, {
        name: 'demo',
        plugins: [i18n({ locale: 'ja-JP', builtinResources: { 'ja-JP': jsJPResource } })],
        subCommands: { deploy, records }
      })
    ).resolves.toBeUndefined()

    expect(stderr()).toBe(
      'コマンドが見つかりません: nope' + helpHint(['records'], { name: 'demo', locale: 'ja-JP' })
    )
  })

  test('is not printed for a command that declares a help argument of its own', async () => {
    const stderr = defineMockErrorLog()
    const ownHelp = define({
      name: 'deploy',
      args: {
        name: { type: 'string', required: true },
        help: { type: 'boolean' }
      },
      run: vi.fn<() => void>()
    })

    await expect(
      cli(['deploy'], entry, { name: 'demo', subCommands: { deploy: ownHelp } })
    ).resolves.toBeUndefined()

    expect(stderr()).toBe(`Option '--name' is required`)
    expect(process.exitCode).toBe(1)
  })

  test('is not printed when the CLI renders no usage', async () => {
    const stderr = defineMockErrorLog()

    await expect(
      cli(['deploy'], entry, { name: 'demo', renderUsage: null, subCommands: { deploy } })
    ).resolves.toBeUndefined()

    expect(stderr()).toBe(`Option '--name' is required`)
    expect(process.exitCode).toBe(1)
  })

  test('follows the errors that the app renders', async () => {
    const stderr = defineMockErrorLog()

    await expect(
      cli(['deploy'], entry, {
        name: 'demo',
        renderValidationErrors: (_ctx: unknown, error: AggregateError) =>
          Promise.resolve(`app: ${error.errors.length} wrong argument`),
        subCommands: { deploy }
      })
    ).resolves.toBeUndefined()

    expect(stderr()).toBe('app: 1 wrong argument' + helpHint(['deploy'], { name: 'demo' }))
    expect(process.exitCode).toBe(1)
  })

  test('follows the errors that the command renders', async () => {
    const stderr = defineMockErrorLog()
    const rendered = define({
      name: 'deploy',
      args: { name: { type: 'string', required: true } },
      rendering: { validationErrors: () => Promise.resolve('deploy cannot start') },
      run: vi.fn<() => void>()
    })

    await expect(
      cli(['deploy'], entry, { name: 'demo', subCommands: { deploy: rendered } })
    ).resolves.toBeUndefined()

    expect(stderr()).toBe('deploy cannot start' + helpHint(['deploy'], { name: 'demo' }))
    expect(process.exitCode).toBe(1)
  })

  test.each([
    { title: 'the plugins render', options: {} },
    {
      title: 'the app renders',
      options: {
        renderValidationErrors: (_ctx: unknown, error: AggregateError) =>
          Promise.resolve(`app: ${error.errors.length} wrong argument`)
      }
    }
  ])('is not printed with helpHint: false, after the errors that $title', async ({ options }) => {
    const stderr = defineMockErrorLog()

    await expect(
      cli(['deploy'], entry, { name: 'demo', helpHint: false, subCommands: { deploy }, ...options })
    ).resolves.toBeUndefined()

    expect(stderr()).toBe(
      options.renderValidationErrors ? 'app: 1 wrong argument' : `Option '--name' is required`
    )
    expect(process.exitCode).toBe(1)
  })

  test('with helpHint: false, the JSON error still points to the help in next', async () => {
    const stderr = defineMockErrorLog()
    const status = define({
      name: 'status',
      args: { ...jsonArgs, project: { type: 'string', required: true } },
      run: () => ({ project: 'acme' })
    })

    await expect(
      cli(['status', '--json'], entry, { name: 'demo', helpHint: false, subCommands: { status } })
    ).resolves.toBeUndefined()

    expect(JSON.parse(stderr())).toMatchObject({
      reason: 'required_option',
      next: [{ command: 'demo status --help', argv: ['demo', 'status', '--help'] }]
    })
  })
})

describe('reported command errors', () => {
  beforeEach(() => {
    // the tests check the exit code, which other tests may have left
    process.exitCode = undefined
  })

  test('resolve with undefined, with the message on stderr and the exit code of the error', async () => {
    const utils = await import('./utils.ts')
    const stdout = defineMockLog(utils)
    const stderr = defineMockErrorLog()

    await expect(
      cli([], {
        run: () => {
          throw new CommandError('Project acme not found', { code: 'not_found', exitCode: 2 })
        }
      })
    ).resolves.toBeUndefined()

    expect(stderr()).toBe('Project acme not found')
    expect(stdout()).toBe('')
    expect(process.exitCode).toBe(2)
  })

  test('onErrorCommand sees the error after the exit code is set, and can change it', async () => {
    defineMockErrorLog()
    const error = new CommandError('Project acme not found')
    const onErrorCommand = vi.fn<NonNullable<CliOptions['onErrorCommand']>>(() => {
      expect(process.exitCode).toBe(1)
      process.exitCode = 3
    })

    await expect(
      cli(
        [],
        {
          run: () => {
            throw error
          }
        },
        { onErrorCommand }
      )
    ).resolves.toBeUndefined()

    expect(onErrorCommand).toHaveBeenCalledWith(expect.anything(), error)
    expect(process.exitCode).toBe(3)
  })

  test('a CommandError thrown by a decorator of another plugin is reported', async () => {
    const stderr = defineMockErrorLog()
    const run = vi.fn<() => void>()
    const auth = plugin({
      id: 'test:auth',
      setup: ctx => {
        ctx.decorateCommand(() => () => {
          throw new CommandError('Not logged in. Run `demo login` first', { exitCode: 4 })
        })
      }
    })

    await expect(cli([], { run }, { plugins: [auth] })).resolves.toBeUndefined()

    expect(run).not.toHaveBeenCalled()
    expect(stderr()).toBe('Not logged in. Run `demo login` first')
    expect(process.exitCode).toBe(4)
  })

  test('a CommandError thrown by a function of an extension that the command calls is reported', async () => {
    const stderr = defineMockErrorLog()
    const api = plugin({
      id: 'test:api',
      extension: () => ({
        fetchProject: (name: string): never => {
          throw new CommandError(`Project ${name} not found`)
        }
      })
    })

    await expect(
      cli(
        [],
        {
          run: ctx => {
            ;(
              ctx.extensions as unknown as Record<string, { fetchProject: (name: string) => never }>
            )['test:api'].fetchProject('acme')
          }
        },
        { plugins: [api] }
      )
    ).resolves.toBeUndefined()

    expect(stderr()).toBe('Project acme not found')
    expect(process.exitCode).toBe(1)
  })

  test('the heading of the causes is translated by the i18n plugin', async () => {
    const stderr = defineMockErrorLog()

    await expect(
      cli(
        [],
        {
          run: () => {
            throw new CommandError('プロジェクトが見つかりません: acme', {
              cause: new Error('connect ECONNREFUSED 127.0.0.1:5432')
            })
          }
        },
        { plugins: [i18n({ locale: 'ja-JP', builtinResources: { 'ja-JP': jsJPResource } })] }
      )
    ).resolves.toBeUndefined()

    expect(stderr()).toBe(
      'プロジェクトが見つかりません: acme\n原因: connect ECONNREFUSED 127.0.0.1:5432'
    )
  })

  test('the heading of the causes is English when the resources of the locale lack it', async () => {
    const stderr = defineMockErrorLog()

    await expect(
      cli(
        [],
        {
          run: () => {
            throw new CommandError('Could not deploy acme', { cause: new Error('Request failed') })
          }
        },
        // resources made before the key, which the i18n plugin fills in with the English ones
        { plugins: [i18n({ locale: 'ja-JP', builtinResources: { 'ja-JP': { USAGE: '使い方' } } })] }
      )
    ).resolves.toBeUndefined()

    expect(stderr()).toBe('Could not deploy acme\nCaused by: Request failed')
  })

  test.each<{ title: string; setup: (error: CommandError) => Parameters<typeof cli> }>([
    {
      title: 'with `usageSilent`, for the caller to report it',
      setup: error => [
        [],
        {
          run: () => {
            throw error
          }
        },
        { usageSilent: true }
      ]
    },
    {
      title: 'from onBeforeCommand',
      setup: error => [
        [],
        { run: vi.fn<() => void>() },
        {
          onBeforeCommand: () => {
            throw error
          }
        }
      ]
    },
    {
      title: 'from onAfterCommand',
      setup: error => [
        [],
        { run: vi.fn<() => void>() },
        {
          onAfterCommand: () => {
            throw error
          }
        }
      ]
    },
    {
      title: 'while a plugin extends the command context',
      setup: error => [
        [],
        { run: vi.fn<() => void>() },
        {
          plugins: [
            plugin({
              id: 'test:config',
              extension: () => {
                throw error
              }
            })
          ]
        }
      ]
    }
  ])('reject with a CommandError thrown $title, without printing it', async ({ setup }) => {
    const stderr = defineMockErrorLog()
    const error = new CommandError('Project acme not found', { exitCode: 2 })

    await expect(cli(...setup(error))).rejects.toBe(error)

    expect(stderr()).toBe('')
    expect(process.exitCode).toBeUndefined()
  })

  test('an error whose properties throw when they are read still rejects with it', async () => {
    const stderr = defineMockErrorLog()
    const error = new Error('boom')
    Object.defineProperty(error, 'code', {
      get() {
        throw new Error('the getter of code')
      }
    })

    await expect(
      cli([], {
        run: () => {
          throw error
        }
      })
    ).rejects.toBe(error)

    expect(stderr()).toBe('')
    expect(process.exitCode).toBeUndefined()
  })

  test('gunshi/bone rejects with a CommandError, without the global options plugin', async () => {
    const stderr = defineMockErrorLog()
    const error = new CommandError('Project acme not found')

    await expect(
      boneCli([], {
        run: () => {
          throw error
        }
      })
    ).rejects.toBe(error)

    expect(stderr()).toBe('')
    expect(process.exitCode).toBeUndefined()
  })
})

describe('--json', () => {
  beforeEach(() => {
    // the tests check the exit code, which other tests may have left
    process.exitCode = undefined
  })

  test('prints the result as JSON, with the human output and the hooks silenced', async () => {
    const stdout = vi.spyOn(console, 'log').mockImplementation(() => {})
    const onAfterCommand = vi.fn<NonNullable<CliOptions['onAfterCommand']>>()
    try {
      const result = await cli(
        ['list', '--json'],
        { name: 'demo', run: () => {} },
        {
          name: 'demo',
          subCommands: {
            list: define({
              name: 'list',
              args: { ...jsonArgs },
              run: ctx => {
                ctx.log('Projects:')
                return { projects: ['acme'] }
              }
            })
          },
          onBeforeCommand: ctx => {
            ctx.log('before the command')
          },
          onAfterCommand
        }
      )

      expect(result).toBeUndefined()
      expect(stdout.mock.calls).toEqual([['{"projects":["acme"]}']])
      // the hook gets no data: the result is printed, not returned
      expect(onAfterCommand).toHaveBeenCalledWith(expect.anything(), undefined)
    } finally {
      stdout.mockRestore()
    }
  })

  test('onAfterCommand gets the result only when it is a string', async () => {
    const onAfterCommand = vi.fn<NonNullable<CliOptions['onAfterCommand']>>()

    await cli([], { run: () => 'text' }, { onAfterCommand })
    // a runner written in JavaScript may return anything
    await cli([], { run: (() => ({ ok: true })) as unknown as CommandRunner }, { onAfterCommand })

    expect(onAfterCommand.mock.calls.map(([, result]) => result)).toEqual(['text', undefined])
  })

  test('a command without jsonArgs is stopped with json_not_supported, after the hook', async () => {
    const stderr = defineMockErrorLog()
    const run = vi.fn<() => void>()
    const onBeforeCommand = vi.fn<NonNullable<CliOptions['onBeforeCommand']>>()

    await expect(
      cli(['--json'], { name: 'legacy', run }, { name: 'demo', onBeforeCommand })
    ).resolves.toBeUndefined()

    expect(run).not.toHaveBeenCalled()
    // the hooks run before the decorators, so the hook runs for it
    expect(onBeforeCommand).toHaveBeenCalled()
    expect(JSON.parse(stderr())).toMatchObject({ reason: 'json_not_supported' })
    expect(process.exitCode).toBe(1)
  })
})

describe('sub-commands on the entry command', () => {
  function commands() {
    const add = vi.fn<(...args: unknown[]) => void>()
    const list = vi.fn<(...args: unknown[]) => void>()
    const addCommand = define({
      name: 'add',
      description: 'Add an item',
      args: { title: { type: 'positional', description: 'The title' } },
      run: add
    })
    const listCommand = define({ name: 'list', description: 'List the items', run: list })
    return { add, list, addCommand, listCommand }
  }

  test('runs a sub-command of the entry when cli() has no sub-commands', async () => {
    const { add, list, addCommand, listCommand } = commands()
    const entry = define({ name: 'todo', subCommands: { add: addCommand, list: listCommand } })

    await cli(['add', 'milk'], entry)

    expect(add).toHaveBeenCalledWith(
      expect.objectContaining({
        callMode: 'subCommand',
        commandPath: ['add'],
        values: { title: 'milk' }
      })
    )
    expect(list).not.toHaveBeenCalled()
  })

  test('takes the sub-commands of the entry from a Map', async () => {
    const { list, addCommand, listCommand } = commands()
    const subCommands = new Map()
    subCommands.set('add', addCommand)
    subCommands.set('list', listCommand)
    const entry = define({ name: 'todo', subCommands })

    await cli(['list'], entry)

    expect(list).toHaveBeenCalledWith(expect.objectContaining({ callMode: 'subCommand' }))
  })

  test('takes the sub-commands of a lazy entry', async () => {
    const { add, addCommand, listCommand } = commands()
    const entryRun = vi.fn<() => void>()
    const entry = lazy(() => entryRun, {
      name: 'todo',
      subCommands: { add: addCommand, list: listCommand }
    })

    await cli(['add', 'milk'], entry)

    expect(add).toHaveBeenCalledWith(expect.objectContaining({ values: { title: 'milk' } }))
    expect(entryRun).not.toHaveBeenCalled()
  })

  test('reports an unknown command instead of running the entry', async () => {
    const { addCommand, listCommand } = commands()
    const entryRun = vi.fn<() => void>()
    const entry = define({
      name: 'todo',
      subCommands: { add: addCommand, list: listCommand },
      run: entryRun
    })
    const stderr = defineMockErrorLog()

    await expect(cli(['nope'], entry)).resolves.toBeUndefined()

    expect(entryRun).not.toHaveBeenCalled()
    expect(stderr()).toContain('Command not found: nope')
    expect(process.exitCode).toBe(1)
  })

  test('runs the entry without arguments', async () => {
    const { addCommand } = commands()
    const entryRun = vi.fn<() => void>()
    const entry = define({ name: 'todo', subCommands: { add: addCommand }, run: entryRun })

    await cli([], entry)

    expect(entryRun).toHaveBeenCalledWith(expect.objectContaining({ callMode: 'entry' }))
  })

  test('lists the sub-commands of the entry in the usage and in the environment', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)
    const { addCommand, listCommand } = commands()
    const entry = define({ name: 'todo', subCommands: { add: addCommand, list: listCommand } })

    await cli(['--help'], entry, { name: 'todo' })

    expect(log()).toContain('COMMANDS:')
    expect(log()).toMatch(/^\s+add\b.+Add an item/m)
    expect(log()).toMatch(/^\s+list\b.+List the items/m)

    let names: string[] = []
    const probe = define({
      name: 'add',
      run: ctx => {
        names = [...(ctx.env.subCommands?.keys() ?? [])]
      }
    })
    await cli(['add'], define({ name: 'todo', subCommands: { add: probe, list: listCommand } }))
    expect(names).toEqual(['add', 'list', 'todo'])
  })

  test('generate() renders the sub-commands of the entry', async () => {
    const { addCommand, listCommand } = commands()
    const entry = define({ name: 'todo', subCommands: { add: addCommand, list: listCommand } })

    const usage = await generate(null, entry, { name: 'todo' })

    expect(usage).toContain('COMMANDS:')
    expect(usage).toMatch(/^\s+add\b/m)
    expect(usage).toMatch(/^\s+list\b/m)
  })

  test('runs a sub-command of the entry without plugins', async () => {
    const { add, addCommand } = commands()
    const entry = define({ name: 'todo', subCommands: { add: addCommand } })

    await boneCli(['add', 'milk'], entry)

    expect(add).toHaveBeenCalledWith(expect.objectContaining({ values: { title: 'milk' } }))
  })

  test('keeps the sub-commands of the entry when a plugin adds a command', async () => {
    const { add, addCommand } = commands()
    const extra = vi.fn<() => void>()
    const addsCommand = plugin({
      id: 'adds-command',
      setup: ctx => {
        ctx.addCommand('extra', { name: 'extra', run: extra })
      }
    })
    const entry = define({ name: 'todo', subCommands: { add: addCommand } })
    const stderr = defineMockErrorLog()

    await cli(['add', 'milk'], entry, { plugins: [addsCommand] })
    await cli(['extra'], entry, { plugins: [addsCommand] })
    await cli(['nope'], entry, { plugins: [addsCommand] })

    expect(add).toHaveBeenCalledWith(expect.objectContaining({ values: { title: 'milk' } }))
    expect(extra).toHaveBeenCalled()
    expect(stderr()).toContain('Command not found: nope')
  })

  test('the sub-commands of cli() come first, and those of the entry stay under its name', async () => {
    const audit = vi.fn<() => void>()
    const list = vi.fn<() => void>()
    const snapshot = define({
      name: 'snapshot',
      subCommands: { list: define({ name: 'list', run: list }) },
      run: vi.fn<() => void>()
    })
    const stderr = defineMockErrorLog()

    await cli(['snapshot', 'list'], snapshot, {
      subCommands: { audit: define({ name: 'audit', run: audit }) }
    })
    expect(list).toHaveBeenCalledTimes(1)

    await cli(['audit'], snapshot, {
      subCommands: { audit: define({ name: 'audit', run: audit }) }
    })
    expect(audit).toHaveBeenCalledTimes(1)

    await cli(['list'], snapshot, { subCommands: { audit: define({ name: 'audit', run: audit }) } })
    expect(list).toHaveBeenCalledTimes(1)
    expect(stderr()).toContain('Command not found: list')
  })
})

describe('an array of sub-commands', () => {
  function commands() {
    const add = vi.fn<(...args: unknown[]) => void>()
    const list = vi.fn<(...args: unknown[]) => void>()
    const addCommand = define({
      name: 'add',
      description: 'Add an item',
      args: { title: { type: 'positional', description: 'The title' } },
      run: add
    })
    const listCommand = define({ name: 'list', description: 'List the items', run: list })
    return { add, list, addCommand, listCommand }
  }

  test('keys the commands by their names', async () => {
    const { add, addCommand, listCommand } = commands()
    const entry = define({ name: 'todo', run: vi.fn<() => void>() })
    const stderr = defineMockErrorLog()

    await cli(['add', 'milk'], entry, { subCommands: [addCommand, listCommand] })
    expect(add).toHaveBeenCalledWith(
      expect.objectContaining({ commandPath: ['add'], values: { title: 'milk' } })
    )

    await cli(['0'], entry, { subCommands: [addCommand, listCommand] })
    expect(stderr()).toContain('Command not found: 0')
  })

  test('takes an array on the entry and in nested commands', async () => {
    const { add, addCommand, listCommand } = commands()
    const remoteAdd = vi.fn<() => void>()
    const remote = define({
      name: 'remote',
      subCommands: [define({ name: 'add', run: remoteAdd })]
    })
    const entry = define({ name: 'todo', subCommands: [addCommand, listCommand, remote] })

    await cli(['add', 'milk'], entry)
    await cli(['remote', 'add'], entry)

    expect(add).toHaveBeenCalledWith(expect.objectContaining({ values: { title: 'milk' } }))
    expect(remoteAdd).toHaveBeenCalledWith(
      expect.objectContaining({ commandPath: ['remote', 'add'] })
    )
  })

  test('keys a lazy command by its command name', async () => {
    const { listCommand } = commands()
    const run = vi.fn<() => void>()
    const lazyAdd = lazy(() => run, { name: 'add' })

    await cli(['add'], define({ name: 'todo', run: vi.fn<() => void>() }), {
      subCommands: [lazyAdd, listCommand]
    })

    expect(run).toHaveBeenCalled()
  })

  test('lists the names in the usage', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)
    const { addCommand, listCommand } = commands()

    await cli(['--help'], define({ name: 'todo', run: vi.fn<() => void>() }), {
      name: 'todo',
      subCommands: [addCommand, listCommand]
    })

    expect(log()).toMatch(/^\s+add\b.+Add an item/m)
    expect(log()).toMatch(/^\s+list\b.+List the items/m)
  })

  test('rejects a command without a name', async () => {
    const { addCommand } = commands()

    await expect(
      cli(['add'], define({ name: 'todo', run: vi.fn<() => void>() }), {
        subCommands: [addCommand, define({ run: vi.fn<() => void>() })]
      })
    ).rejects.toThrow(
      new TypeError(`Sub-command name must be a non-empty string in an array of 'subCommands'`)
    )
  })

  test('rejects a command whose name is not a string', async () => {
    const run = vi.fn<() => void>()
    // a JavaScript caller can give any name; it would be a key that no argument selects
    const numbered = { name: 1, run } as unknown as Command

    await expect(
      cli(['1'], define({ name: 'todo', run: vi.fn<() => void>() }), { subCommands: [numbered] })
    ).rejects.toThrow(
      new TypeError(`Sub-command name must be a non-empty string in an array of 'subCommands'`)
    )
    expect(run).not.toHaveBeenCalled()
  })

  test('rejects two commands with the same name', async () => {
    const { addCommand } = commands()

    await expect(
      cli(['add'], define({ name: 'todo', run: vi.fn<() => void>() }), {
        subCommands: [addCommand, addCommand]
      })
    ).rejects.toThrow(
      new TypeError(`Sub-command 'add' is given twice in an array of 'subCommands'`)
    )
  })
})

describe('a command without run and without sub-commands (#879)', () => {
  const status = define({ name: 'status', description: 'Show the status' })
  const entry = define({ name: 'demo', run: vi.fn<() => void>() })

  test('fails when it runs as a sub-command, with its name', async () => {
    await expect(cli(['status'], entry, { name: 'demo', subCommands: { status } })).rejects.toThrow(
      new TypeError(`'run' is required in command: status`)
    )
    expect(entry.run).not.toHaveBeenCalled()
  })

  test('is named after its key when it has no name', async () => {
    await expect(
      cli(['info'], entry, { name: 'demo', subCommands: { info: { description: 'Show info' } } })
    ).rejects.toThrow(`'run' is required in command: info`)
  })

  test('prints its usage with --help', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)

    await cli(['status', '--help'], entry, { name: 'demo', subCommands: { status } })

    expect(log()).toContain('demo status [OPTIONS]')
  })

  test('fails as a lazy command whose loader returns a command without run does', async () => {
    const lazyStatus = lazy(async () => define({ name: 'status' }), { name: 'status' })
    await expect(
      cli(['status'], entry, { name: 'demo', subCommands: { status: lazyStatus } })
    ).rejects.toThrow(new TypeError(`'run' is required in command: status`))
  })

  test('@gunshi/bone fails too', async () => {
    await expect(boneCli(['status'], entry, { subCommands: { status } })).rejects.toThrow(
      `'run' is required in command: status`
    )
  })

  test('with --json, fails with command_failed, when it spreads jsonArgs', async () => {
    const errorLog = defineMockErrorLog()
    const list = define({ name: 'list', args: { ...jsonArgs } })

    await cli(['list', '--json'], entry, { name: 'demo', subCommands: { list } })

    // it was invalid_result, whose message suspects a plugin that decorates the command
    expect(JSON.parse(errorLog())).toEqual({
      status: 'error',
      reason: 'command_failed',
      message: `'run' is required in command: list`
    })
    expect(process.exitCode).toBe(1)
  })
})

/**
 * NOTE(kazupon): a lazy command is loaded before the arguments are parsed, and an error of the loading is thrown
 * where the command would run, after the decorators, as an error of `run` is. The definition stands for the
 * command until then.
 */
describe('the errors of loading a lazy command (#885)', () => {
  const entry = define({ name: 'demo', run: vi.fn<() => void>() })
  const failing = (error: unknown) =>
    lazy(
      () => {
        throw error
      },
      { name: 'deploy', description: 'Deploy the app', args: { ...jsonArgs } }
    )

  test('a CommandError thrown by the loader is printed with its exit code, and onErrorCommand sees it', async () => {
    const stderr = defineMockErrorLog()
    const error = new CommandError('Project acme not found', { exitCode: 2 })
    const onErrorCommand = vi.fn<NonNullable<CliOptions['onErrorCommand']>>()

    await expect(
      cli(['deploy'], entry, {
        name: 'demo',
        subCommands: { deploy: failing(error) },
        onErrorCommand
      })
    ).resolves.toBeUndefined()

    expect(stderr()).toBe('Project acme not found')
    expect(process.exitCode).toBe(2)
    expect(onErrorCommand).toHaveBeenCalledWith(expect.anything(), error)
    expect(entry.run).not.toHaveBeenCalled()
  })

  test('with --json, a failure of the loader is printed as JSON', async () => {
    const stderr = defineMockErrorLog()
    const error = new CommandError('Project acme not found', { code: 'not_found' })

    await cli(['deploy', '--json'], entry, {
      name: 'demo',
      subCommands: { deploy: failing(error) }
    })

    expect(JSON.parse(stderr())).toEqual({
      status: 'error',
      reason: 'not_found',
      message: 'Project acme not found'
    })
    expect(process.exitCode).toBe(1)
  })

  test('any other error of the loader rejects, after onErrorCommand sees it', async () => {
    const error = new Error('boom')
    const onErrorCommand = vi.fn<NonNullable<CliOptions['onErrorCommand']>>()

    await expect(
      cli(['deploy'], entry, {
        name: 'demo',
        subCommands: { deploy: failing(error) },
        onErrorCommand
      })
    ).rejects.toBe(error)

    expect(onErrorCommand).toHaveBeenCalledWith(expect.anything(), error)
  })

  test('--help prints the usage of the definition when the loader fails', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)

    await cli(['deploy', '--help'], entry, {
      name: 'demo',
      subCommands: { deploy: failing(new Error('boom')) }
    })

    expect(log()).toContain('Deploy the app')
    expect(log()).toContain('USAGE:\n  demo deploy [OPTIONS]')
  })

  test('a loaded command without run fails where it runs, and --help prints its usage', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)
    const status = lazy(async () => ({ description: 'Show the loaded status' }), { name: 'status' })
    const options = { name: 'demo', subCommands: { status } }

    await expect(cli(['status'], entry, options)).rejects.toThrow(
      new TypeError(`'run' is required in command: status`)
    )
    await cli(['status', '--help'], entry, options)

    expect(log()).toContain('Show the loaded status')
  })

  test('a lazy group whose loaded command has no run prints its usage, as a group without run does', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)
    const add = define({ name: 'add', run: vi.fn<() => void>() })
    const records = lazy(async () => ({ description: 'Manage the records' }), {
      name: 'records',
      subCommands: { add }
    })

    await cli(['records'], entry, { name: 'demo', subCommands: { records } })

    expect(log()).toContain('Manage the records')
    expect(log()).toContain('USAGE:\n  demo records [COMMANDS] [OPTIONS]')
  })

  test('@gunshi/bone calls onErrorCommand, and rejects', async () => {
    const error = new CommandError('Project acme not found')
    const onErrorCommand = vi.fn<NonNullable<CliOptions['onErrorCommand']>>()

    await expect(
      boneCli(['deploy'], entry, { subCommands: { deploy: failing(error) }, onErrorCommand })
    ).rejects.toBe(error)

    expect(onErrorCommand).toHaveBeenCalledWith(expect.anything(), error)
  })

  test('generate renders the usage of the definition when the loader fails', async () => {
    const usage = await generate('deploy', entry, {
      name: 'demo',
      subCommands: { deploy: failing(new CommandError('Project acme not found')) }
    })

    expect(usage).toContain('Deploy the app')
    expect(usage).toContain('USAGE:\n  demo deploy [OPTIONS]')
  })
})

describe('a command without run that has sub-commands', () => {
  const add = define({ name: 'add', description: 'Add a record', run: () => {} })
  const list = define({ name: 'list', description: 'List the records', run: () => {} })
  const records = define({
    name: 'records',
    description: 'Manage records',
    subCommands: { add, list }
  })
  const entry = define({ name: 'demo', run: vi.fn<() => void>() })
  const options = { name: 'demo', version: '1.0.0', subCommands: { records } }

  test('prints its usage when it runs without a sub-command, as --help does', async () => {
    onTestFinished(() => {
      process.exitCode = undefined
    })
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)

    const usage = await cli(['records'], entry, options)
    const printed = log()

    expect(usage).toBe(await cli(['records', '--help'], entry, { ...options, usageSilent: true }))
    expect(printed).toContain('USAGE:\n  demo records [COMMANDS] [OPTIONS]')
    expect(printed).toContain('COMMANDS:\n  add')
    expect(process.exitCode).toBeUndefined()
  })

  test('an entry without run prints its usage when it runs without a sub-command', async () => {
    const utils = await import('./utils.ts')
    defineMockLog(utils)
    const main = define({ name: 'demo', description: 'Demo CLI' })
    const mainOptions = { name: 'demo', subCommands: { add, list }, usageSilent: true }

    const usage = await cli([], main, mainOptions)

    expect(usage).toBe(await cli(['--help'], main, mainOptions))
    expect(usage).toContain('USAGE:\n  demo [COMMANDS] [OPTIONS]')
  })

  test('a command with run runs it, with omitted set to true', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)
    const run = vi.fn<() => void>()
    const group = define({ name: 'records', subCommands: { add, list }, run })

    const result = await cli(['records'], entry, { name: 'demo', subCommands: { records: group } })

    expect(run).toHaveBeenCalledWith(expect.objectContaining({ omitted: true }))
    expect(result).toBeUndefined()
    expect(log()).toBe('')
  })

  test('a command without sub-commands fails instead, since it has nothing to run (#879)', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)

    await expect(cli([], define({ name: 'demo' }), { name: 'demo' })).rejects.toThrow(
      new TypeError(`'run' is required in command: demo`)
    )
    expect(log()).toBe('')
  })

  test('an entry without run that takes a word with fallbackToEntry prints nothing, as before', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)

    const result = await cli(['foo'], define({ name: 'demo' }), {
      name: 'demo',
      subCommands: { add, list },
      fallbackToEntry: true
    })

    expect(result).toBeUndefined()
    expect(log()).toBe('')
  })

  test('prints nothing with usageSilent, and returns the usage', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)

    const usage = await cli(['records'], entry, { ...options, usageSilent: true })

    expect(usage).toContain('USAGE:\n  demo records [COMMANDS] [OPTIONS]')
    expect(log()).toBe('')
  })

  test('the hooks are called, and onAfterCommand gets the usage', async () => {
    const utils = await import('./utils.ts')
    defineMockLog(utils)
    const onBeforeCommand = vi.fn<() => void>()
    const onAfterCommand = vi.fn<(ctx: unknown, result: string | undefined) => void>()

    const usage = await cli(['records'], entry, {
      ...options,
      usageSilent: true,
      onBeforeCommand,
      onAfterCommand
    })

    expect(usage).toContain('USAGE:\n  demo records [COMMANDS] [OPTIONS]')
    expect(onBeforeCommand).toHaveBeenCalledTimes(1)
    expect(onAfterCommand).toHaveBeenCalledWith(expect.anything(), usage)
  })

  test('the errors of the arguments are reported first', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)
    const errorLog = defineMockErrorLog()

    const result = await cli(['records', '--verbose'], entry, { ...options, strict: true })

    expect(result).toBeUndefined()
    expect(errorLog()).toContain('Unknown option: --verbose')
    expect(process.exitCode).toBe(1)
    expect(log()).toBe('')
  })

  test('does not print its usage with --json, which it does not support', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)
    const errorLog = defineMockErrorLog()

    await cli(['records', '--json'], entry, options)

    expect(JSON.parse(errorLog())).toMatchObject({ reason: 'json_not_supported' })
    expect(process.exitCode).toBe(1)
    expect(log()).toBe('')
  })

  test('does not print its usage with --json when it spreads jsonArgs', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)
    const errorLog = defineMockErrorLog()
    const group = define({ name: 'records', args: { ...jsonArgs }, subCommands: { add, list } })

    await cli(['records', '--json'], entry, { name: 'demo', subCommands: { records: group } })

    expect(JSON.parse(errorLog())).toMatchObject({ reason: 'invalid_result' })
    expect(process.exitCode).toBe(1)
    expect(log()).toBe('')
  })

  test('a nested cli() in a hook is a run of its own', async () => {
    const run = vi.fn<() => void>()
    const inner = define({ name: 'inner', run })
    let innerResult: string | undefined

    const usage = await cli(['records'], entry, {
      ...options,
      usageSilent: true,
      onBeforeCommand: async () => {
        innerResult = await cli([], inner, { usageSilent: true })
      }
    })

    expect(run).toHaveBeenCalledTimes(1)
    expect(innerResult).toBeUndefined()
    expect(usage).toContain('USAGE:\n  demo records [COMMANDS] [OPTIONS]')
  })

  test('@gunshi/bone prints nothing, as before', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)

    const result = await boneCli(['records'], entry, options)

    expect(result).toBeUndefined()
    expect(log()).toBe('')
  })
})

describe('--help and --version with an unknown option of strict', () => {
  const entry = define({ name: 'demo', run: vi.fn<() => void>() })
  const deploy = define({
    name: 'deploy',
    args: { name: { type: 'string', required: true } },
    run: vi.fn<() => void>()
  })
  const status = define({
    name: 'status',
    args: { ...jsonArgs, project: { type: 'string', required: true } },
    run: () => ({ project: 'acme' })
  })
  const records = define({
    name: 'records',
    subCommands: { list: define({ name: 'list', run: vi.fn<() => void>() }) }
  })
  const options = {
    name: 'demo',
    version: '1.0.0',
    strict: true,
    subCommands: { deploy, status, records }
  }

  test.each([
    { argv: ['deploy', '--unknown', '--help'] },
    { argv: ['deploy', '--help', '--unknown'] },
    { argv: ['deploy', '--unknown=1', '-h'] },
    { argv: ['deploy', '-hx'] }
  ])('$argv prints the help, without the argument errors', async ({ argv }) => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)
    const stderr = defineMockErrorLog()
    const onErrorCommand = vi.fn<() => void>()

    await cli(argv, entry, { ...options, onErrorCommand })

    expect(log()).toContain('demo deploy [OPTIONS] --name <name>')
    expect(stderr()).toBe('')
    expect(process.exitCode).toBeUndefined()
    expect(onErrorCommand).not.toHaveBeenCalled()
    expect(deploy.run).not.toHaveBeenCalled()
  })

  test('--version prints the version, without the argument errors', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)
    const stderr = defineMockErrorLog()

    await cli(['deploy', '--unknown', '--version'], entry, options)

    expect(log()).toBe('1.0.0')
    expect(stderr()).toBe('')
    expect(process.exitCode).toBeUndefined()
  })

  test('--help with --json prints the help as JSON', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)
    const stderr = defineMockErrorLog()

    await cli(['status', '--unknown', '--json', '--help'], entry, options)

    expect(JSON.parse(log())).toMatchObject({ help: { command: 'demo status', json: true } })
    expect(stderr()).toBe('')
    expect(process.exitCode).toBeUndefined()
  })

  test('an unknown command is still reported with --help', async () => {
    const stderr = defineMockErrorLog()

    await expect(
      cli(['records', 'nope', '--unknown', '--help'], entry, options)
    ).resolves.toBeUndefined()

    expect(stderr()).toBe(
      'Command not found: nope\nUnknown option: --unknown' + helpHint(['records'], { name: 'demo' })
    )
    expect(process.exitCode).toBe(1)
  })

  test('a command line that cannot be resolved is still reported with --help', async () => {
    const stderr = defineMockErrorLog()
    const config = plugin({
      id: 'test:config',
      setup(ctx) {
        ctx.addGlobalOption('config', { type: 'string' })
      }
    })

    await expect(
      cli(['--config', 'clean', 'deploy', '--help'], entry, {
        ...options,
        plugins: [config],
        subCommands: {
          clean: define({ name: 'clean', run: vi.fn<() => void>() }),
          deploy: define({
            name: 'deploy',
            args: { config: { type: 'boolean' } },
            run: vi.fn<() => void>()
          })
        }
      })
    ).resolves.toBeUndefined()

    expect(stderr()).toBe(
      'The options do not identify a consistent command. Move options after the command name.' +
        helpHint([], { name: 'demo' })
    )
    expect(process.exitCode).toBe(1)
  })

  test('a lazy command whose definition does not match is still reported with --help', async () => {
    const stderr = defineMockErrorLog()
    const config = plugin({
      id: 'test:config',
      setup(ctx) {
        ctx.addGlobalOption('config', { type: 'string' })
      }
    })
    const lazyDeploy = lazy(
      async () =>
        define({ name: 'deploy', args: { config: { type: 'boolean' } }, run: vi.fn<() => void>() }),
      { name: 'deploy' }
    )

    await expect(
      cli(['--config', 'clean', 'deploy', '--unknown', '--help'], entry, {
        ...options,
        plugins: [config],
        subCommands: {
          clean: define({ name: 'clean', run: vi.fn<() => void>() }),
          deploy: lazyDeploy
        }
      })
    ).resolves.toBeUndefined()

    expect(stderr()).toBe(
      'Lazy command schema mismatch at deploy. Declare leading options in the lazy definition or move options after the command name.\nUnknown option: --unknown' +
        helpHint(['deploy'], { name: 'demo' })
    )
    expect(process.exitCode).toBe(1)
  })

  test('the unknown option is reported with --help that a command takes itself', async () => {
    const stderr = defineMockErrorLog()
    const own = define({
      name: 'own',
      args: { help: { type: 'boolean' } },
      run: vi.fn<() => void>()
    })

    await expect(
      cli(['own', '--unknown', '--help'], entry, { ...options, subCommands: { own } })
    ).resolves.toBeUndefined()

    expect(stderr()).toBe('Unknown option: --unknown')
    expect(process.exitCode).toBe(1)
    expect(own.run).not.toHaveBeenCalled()
  })
})

describe('--help and --version together', () => {
  const entry = define({ name: 'demo', run: vi.fn<() => void>() })
  const deploy = define({ name: 'deploy', run: vi.fn<() => void>() })

  test.each([{ argv: ['--version', '--help'] }, { argv: ['deploy', '--help', '--version'] }])(
    '$argv prints the help',
    async ({ argv }) => {
      const utils = await import('./utils.ts')
      const log = defineMockLog(utils)

      await cli(argv, entry, { name: 'demo', version: '1.0.0', subCommands: { deploy } })

      expect(log()).toContain('USAGE:')
      expect(deploy.run).not.toHaveBeenCalled()
    }
  )
})

describe('--help and --version with --json', () => {
  const entry = define({ name: 'demo', description: 'A demo CLI', run: vi.fn<() => void>() })
  const status = define({
    name: 'status',
    description: 'Show the status',
    args: {
      ...jsonArgs,
      project: { type: 'string', short: 'p', required: true, description: 'The project' }
    },
    run: () => ({ project: 'acme' })
  })
  const deploy = define({
    name: 'deploy',
    args: {
      target: { type: 'positional', description: 'The target' },
      env: {
        type: 'enum',
        choices: ['production', 'preview'],
        default: 'preview',
        description: 'Environment'
      },
      prod: { type: 'boolean', negatable: true },
      secret: { type: 'string', hidden: true }
    },
    run: vi.fn<() => void>()
  })
  const records = define({
    name: 'records',
    description: 'Manage records',
    subCommands: {
      list: define({ name: 'list', description: 'List the records', run: vi.fn<() => void>() })
    }
  })
  const options = { name: 'demo', version: '1.0.0', subCommands: { status, deploy, records } }
  const help = {
    name: '--help',
    short: '-h',
    description: 'Display this help message',
    type: 'boolean',
    value: null,
    required: false,
    multiple: false,
    default: null,
    choices: null,
    negatable: false,
    global: true
  }
  const version = {
    ...help,
    name: '--version',
    short: '-v',
    description: 'Display this version'
  }

  test('--help prints the help of a command that spreads jsonArgs as JSON', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)

    await cli(['status', '--help', '--json'], entry, options)

    expect(JSON.parse(log())).toEqual({
      help: {
        command: 'demo status',
        argv: ['demo', 'status'],
        description: 'Show the status',
        runnable: true,
        commands: [],
        arguments: [],
        options: [
          help,
          version,
          {
            name: '--json',
            short: null,
            description: 'Output the result as JSON',
            type: 'boolean',
            value: null,
            required: false,
            multiple: false,
            default: null,
            choices: null,
            negatable: false,
            global: false
          },
          {
            name: '--project',
            short: '-p',
            description: 'The project',
            type: 'string',
            value: '<project>',
            required: true,
            multiple: false,
            default: null,
            choices: null,
            negatable: false,
            global: false
          }
        ],
        json: true
      }
    })
  })

  test('--help prints the help of a command without jsonArgs as JSON too', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)

    await cli(['deploy', '--json', '--help'], entry, options)

    expect(JSON.parse(log())).toEqual({
      help: {
        command: 'demo deploy',
        argv: ['demo', 'deploy'],
        description: null,
        runnable: true,
        commands: [],
        arguments: [{ name: 'target', description: 'The target', required: true, multiple: false }],
        options: [
          help,
          version,
          {
            name: '--env',
            short: null,
            description: 'Environment',
            type: 'enum',
            value: '<env>',
            required: false,
            multiple: false,
            default: 'preview',
            choices: ['production', 'preview'],
            negatable: false,
            global: false
          },
          {
            name: '--prod',
            short: null,
            description: null,
            type: 'boolean',
            value: null,
            required: false,
            multiple: false,
            default: null,
            choices: null,
            negatable: true,
            global: false
          }
        ],
        json: false
      }
    })
  })

  test('--help lists the sub-commands of a group', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)

    await cli(['records', '--help', '--json'], entry, options)

    expect(JSON.parse(log())).toMatchObject({
      help: {
        command: 'demo records',
        runnable: false,
        commands: [{ name: 'list', description: 'List the records' }]
      }
    })
  })

  test('--help tells whether the command runs by itself, without a sub-command', async () => {
    const list = define({ name: 'list', run: vi.fn<() => void>() })
    const tags = define({ name: 'tags', subCommands: { list }, run: vi.fn<() => void>() })
    const lazyRecords = lazy(() => define({ name: 'records' }), {
      name: 'records',
      subCommands: { list }
    })
    const silent = { ...options, usageSilent: true }
    const runnable = (json: string | undefined) =>
      (JSON.parse(json as string) as { help: { runnable: boolean } }).help.runnable

    // the entry, a command without sub-commands, and a group, with `run`
    expect(runnable(await cli(['--help', '--json'], entry, silent))).toBe(true)
    expect(runnable(await cli(['status', '--help', '--json'], entry, silent))).toBe(true)
    expect(
      runnable(await cli(['tags', '--help', '--json'], entry, { ...silent, subCommands: { tags } }))
    ).toBe(true)
    // the entry and a group without `run`, which print their usage when they run
    const group = define({ name: 'demo', subCommands: { records } })
    expect(runnable(await cli(['--help', '--json'], group, silent))).toBe(false)
    expect(runnable(await cli(['records', '--help', '--json'], entry, silent))).toBe(false)
    // a lazy group whose loader returns a command without `run`
    expect(
      runnable(
        await cli(['records', '--help', '--json'], entry, {
          ...silent,
          subCommands: { records: lazyRecords }
        })
      )
    ).toBe(false)
  })

  test('--help starts the command with <COMMAND> without the name of the CLI', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)

    await cli(['status', '--help', '--json'], entry, { ...options, name: undefined })

    expect(JSON.parse(log())).toMatchObject({
      help: { command: '<COMMAND> status', argv: ['<COMMAND>', 'status'] }
    })
  })

  test('--version prints the version as JSON', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)

    await cli(['--version', '--json'], entry, options)
    await cli(['--version', '--json'], entry, { ...options, version: undefined })

    expect(log()).toBe('{"version":"1.0.0"}\n{"version":null}')
  })

  test('the help is text with --json=false, and for a command with a json argument of its own', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)
    const own = define({
      name: 'own',
      args: { json: { type: 'boolean' } },
      run: vi.fn<() => void>()
    })

    await cli(['status', '--help', '--json=false'], entry, options)
    await cli(['own', '--help', '--json'], entry, { ...options, subCommands: { own } })

    expect(log()).not.toContain('{"help"')
    expect(log()).toContain('demo status [OPTIONS]')
    expect(log()).toContain('demo own [OPTIONS]')
  })

  test('nothing is printed with usageSilent, and cli() returns the JSON', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)

    const json = await cli(['status', '--help', '--json'], entry, { ...options, usageSilent: true })

    expect(log()).toBe('')
    expect(JSON.parse(json as string)).toMatchObject({ help: { command: 'demo status' } })
  })

  test('nothing is printed when the CLI renders no usage', async () => {
    const utils = await import('./utils.ts')
    const log = defineMockLog(utils)

    await expect(
      cli(['status', '--help', '--json'], entry, { ...options, renderUsage: null })
    ).resolves.toBeUndefined()

    expect(log()).toBe('')
  })
})

describe('strictPositionals of cli()', () => {
  const entry = () => define({ name: 'app', run: () => {} })

  test('keeps the positional arguments that a command does not declare, by default', async () => {
    let positionals: string[] = []
    const deploy = define({
      name: 'deploy',
      run: ctx => {
        positionals = ctx.positionals
      }
    })

    await cli(['deploy', 'extra'], entry(), { name: 'app', subCommands: { deploy } })

    expect(positionals).toEqual(['deploy', 'extra'])
  })

  test('reports the positional arguments that the command does not take, before it runs', async () => {
    const stderr = defineMockErrorLog()
    const run = vi.fn<() => void>()
    let codes: unknown[] = []
    const deploy = define({ name: 'deploy', args: { name: { type: 'string' } }, run })

    await cli(['deploy', '--name', 'web', 'extra1', 'extra2'], entry(), {
      name: 'app',
      subCommands: { deploy },
      strictPositionals: true,
      onErrorCommand: (_ctx, error) => {
        codes = (error as AggregateError).errors.map(error => (error as { code?: unknown }).code)
      }
    })

    expect(run).not.toHaveBeenCalled()
    expect(codes).toEqual(['err:arg:unexpected-positional', 'err:arg:unexpected-positional'])
    expect(stderr()).toBe(
      'Unexpected positional argument: extra1\nUnexpected positional argument: extra2' +
        helpHint(['deploy'], { name: 'app' })
    )
    expect(process.exitCode).toBe(1)
  })

  test('takes as many as the command declares, and any number for a positional argument with multiple', async () => {
    const seen: unknown[] = []
    const add = define({
      name: 'add',
      args: { file: { type: 'positional' } },
      run: ctx => {
        seen.push(ctx.values.file)
      }
    })
    const open = define({
      name: 'open',
      args: { target: { type: 'positional', required: false } },
      run: ctx => {
        seen.push(ctx.values.target ?? null)
      }
    })
    const cat = define({
      name: 'cat',
      args: { files: { type: 'positional', multiple: true } },
      run: ctx => {
        seen.push(ctx.values.files)
      }
    })
    const options = { name: 'app', subCommands: { add, open, cat }, strictPositionals: true }

    await cli(['add', 'a.txt'], entry(), options)
    await cli(['open'], entry(), options)
    await cli(['open', 'x'], entry(), options)
    await cli(['cat', 'a', 'b', 'c'], entry(), options)

    expect(seen).toEqual(['a.txt', null, 'x', ['a', 'b', 'c']])
  })

  test('counts them after the command path, for a nested and a lazy command too', async () => {
    const stderr = defineMockErrorLog()
    const run = vi.fn<() => void>()
    const add = define({ name: 'add', args: { file: { type: 'positional' } }, run })
    const records = define({ name: 'records', subCommands: { add } })
    const later = lazy(() => run, { name: 'later', args: { name: { type: 'string' } } })
    const options = { name: 'app', subCommands: { records, later }, strictPositionals: true }

    await cli(['records', 'add', 'a.txt', 'extra1'], entry(), options)
    await cli(['later', '--name', 'web', 'extra2'], entry(), options)

    expect(run).not.toHaveBeenCalled()
    expect(stderr()).toBe(
      'Unexpected positional argument: extra1' +
        helpHint(['records', 'add'], { name: 'app' }) +
        '\nUnexpected positional argument: extra2' +
        helpHint(['later'], { name: 'app' })
    )
  })

  test('reports an unknown command only, after a command with sub-commands', async () => {
    const stderr = defineMockErrorLog()
    const add = define({ name: 'add', run: () => {} })
    const records = define({ name: 'records', subCommands: { add } })

    await cli(['records', 'nope'], entry(), {
      name: 'app',
      subCommands: { records },
      strictPositionals: true
    })

    expect(stderr()).toBe('Command not found: nope' + helpHint(['records'], { name: 'app' }))
  })

  test('leaves the arguments after -- in rest', async () => {
    let rest: string[] = []
    const deploy = define({
      name: 'deploy',
      run: ctx => {
        rest = ctx.rest
      }
    })

    await cli(['deploy', '--', 'a', '--b'], entry(), {
      name: 'app',
      subCommands: { deploy },
      strictPositionals: true
    })

    expect(rest).toEqual(['a', '--b'])
  })

  test('answers --help before them', async () => {
    const run = vi.fn<() => void>()

    const usage = await cli(['extra', '--help'], define({ name: 'app', run }), {
      name: 'app',
      usageSilent: true,
      strictPositionals: true
    })

    expect(run).not.toHaveBeenCalled()
    expect(usage).toContain('USAGE:')
    expect(process.exitCode).toBeUndefined()
  })

  test('reports them as JSON with --json', async () => {
    const stderr = defineMockErrorLog()
    const deploy = define({
      name: 'deploy',
      args: { ...jsonArgs },
      run: () => ({ deployed: true })
    })

    await cli(['deploy', 'extra1', '--json'], entry(), {
      name: 'app',
      subCommands: { deploy },
      strictPositionals: true
    })

    const failure = JSON.parse(stderr()) as { reason: string; data: { issues: unknown[] } }
    expect(failure.reason).toBe('unexpected_positional')
    expect(failure.data.issues).toEqual([
      {
        field: 'extra1',
        reason: 'unexpected_positional',
        message: 'Unexpected positional argument: extra1'
      }
    ])
  })

  test('is translated with the built-in resources', async () => {
    const stderr = defineMockErrorLog()

    await cli(['extra'], entry(), {
      name: 'app',
      strictPositionals: true,
      plugins: [i18n({ locale: 'ja-JP', builtinResources: { 'ja-JP': jsJPResource } })]
    })

    expect(stderr()).toBe(
      '余分な位置引数です: extra' + helpHint([], { name: 'app', locale: 'ja-JP' })
    )
  })

  test('stops the command of bone, whose cli() rejects with the error', async () => {
    const run = vi.fn<() => void>()

    await expect(
      boneCli(['extra'], define({ name: 'app', run }), { strictPositionals: true })
    ).rejects.toThrow('Unexpected positional argument: extra')
    expect(run).not.toHaveBeenCalled()
  })
})

describe('validationErrorExitCode of cli()', () => {
  const entry = () => define({ name: 'app', run: () => {} })
  const deploy = () =>
    define({
      name: 'deploy',
      args: { ...jsonArgs, name: { type: 'string', required: true } },
      run: () => ({ deployed: true })
    })

  afterEach(() => {
    process.exitCode = undefined
  })

  test('is 1 by default', async () => {
    defineMockErrorLog()

    await cli(['deploy'], entry(), { name: 'app', subCommands: { deploy: deploy() } })

    expect(process.exitCode).toBe(1)
  })

  test('is the exit code of the errors of the arguments and of an unknown command', async () => {
    defineMockErrorLog()
    const options = {
      name: 'app',
      subCommands: { deploy: deploy() },
      strict: true,
      strictPositionals: true,
      validationErrorExitCode: 2
    }
    const codes: unknown[] = []

    for (const argv of [
      ['deploy'],
      ['deploy', '--name'],
      ['nope'],
      ['deploy', '--name', 'web', '--unknown'],
      ['deploy', '--name', 'web', 'extra']
    ]) {
      process.exitCode = undefined
      await cli(argv, entry(), options)
      codes.push(process.exitCode)
    }

    expect(codes).toEqual([2, 2, 2, 2, 2])
  })

  test('is the exit code of the errors printed as JSON, json_not_supported included', async () => {
    const stderr = defineMockErrorLog()
    const plain = define({ name: 'plain', run: () => {} })
    const options = {
      name: 'app',
      subCommands: { deploy: deploy(), plain },
      validationErrorExitCode: 2
    }
    const codes: unknown[] = []

    for (const argv of [
      ['deploy', '--json'],
      ['plain', '--json']
    ]) {
      process.exitCode = undefined
      await cli(argv, entry(), options)
      codes.push(process.exitCode)
    }

    expect(codes).toEqual([2, 2])
    expect(stderr()).toContain('"reason":"json_not_supported"')
  })

  test('is the exit code of an unknown command and of a command line that cannot be resolved, with --help and --version too', async () => {
    defineMockErrorLog()
    const config = plugin({
      id: 'test:config',
      setup(ctx) {
        ctx.addGlobalOption('config', { type: 'string' })
      }
    })
    const options = {
      name: 'app',
      version: '1.2.3',
      plugins: [config],
      subCommands: {
        clean: define({ name: 'clean', run: () => {} }),
        deploy: define({ name: 'deploy', args: { config: { type: 'boolean' } }, run: () => {} })
      },
      validationErrorExitCode: 2
    }
    const codes: unknown[] = []

    for (const argv of [
      ['nope', '--help'],
      ['nope', '--version'],
      ['--config', 'clean', 'deploy'],
      ['--config', 'clean', 'deploy', '--help']
    ]) {
      process.exitCode = undefined
      await cli(argv, entry(), options)
      codes.push(process.exitCode)
    }

    expect(codes).toEqual([2, 2, 2, 2])
  })

  test('is the exit code of a default that is not one of its choices too', async () => {
    const stderr = defineMockErrorLog()
    const level = define({
      name: 'level',
      args: { level: { type: 'enum', choices: ['info', 'warn'], default: 'debug' } },
      run: () => {}
    })

    await cli(['level'], entry(), {
      name: 'app',
      subCommands: { level },
      validationErrorExitCode: 2
    })

    expect(stderr()).toContain('Invalid default for')
    expect(process.exitCode).toBe(2)
  })

  test('does not change the exit code of an error that the command throws', async () => {
    defineMockErrorLog()
    const fail = define({
      name: 'fail',
      args: { ...jsonArgs },
      run: () => {
        throw new CommandError('Release v9 does not exist', { exitCode: 3 })
      }
    })
    const crash = define({
      name: 'crash',
      args: { ...jsonArgs },
      run: () => {
        throw new TypeError('Cannot read properties of undefined')
      }
    })
    const options = { name: 'app', subCommands: { fail, crash }, validationErrorExitCode: 2 }
    const codes: unknown[] = []

    for (const argv of [['fail'], ['fail', '--json'], ['crash', '--json']]) {
      process.exitCode = undefined
      await cli(argv, entry(), options)
      codes.push(process.exitCode)
    }
    process.exitCode = undefined
    await expect(cli(['crash'], entry(), options)).rejects.toThrow(
      'Cannot read properties of undefined'
    )

    expect(codes).toEqual([3, 3, 1])
    expect(process.exitCode).toBeUndefined()
  })

  test('is set before onErrorCommand, which can change it', async () => {
    defineMockErrorLog()
    let seen: unknown

    await cli(['deploy'], entry(), {
      name: 'app',
      subCommands: { deploy: deploy() },
      validationErrorExitCode: 2,
      onErrorCommand: () => {
        seen = process.exitCode
        process.exitCode = 4
      }
    })

    expect(seen).toBe(2)
    expect(process.exitCode).toBe(4)
  })

  test('does not apply to --help and --version, which are answered', async () => {
    const options = {
      name: 'app',
      version: '1.2.3',
      subCommands: { deploy: deploy() },
      usageSilent: true,
      validationErrorExitCode: 2
    }

    const usage = await cli(['deploy', '--help'], entry(), options)
    const version = await cli(['deploy', '--version'], entry(), options)

    expect(usage).toContain('USAGE:')
    expect(version).toBe('1.2.3')
    expect(process.exitCode).toBeUndefined()
  })

  test('is replaced with 1 when it is not an integer from 1 to 255', async () => {
    defineMockErrorLog()
    const codes: unknown[] = []

    for (const value of [0, 256, 1.5, -1, Number.NaN, '2']) {
      process.exitCode = undefined
      await cli(['deploy'], entry(), {
        name: 'app',
        subCommands: { deploy: deploy() },
        validationErrorExitCode: value as number
      })
      codes.push(process.exitCode)
    }

    expect(codes).toEqual([1, 1, 1, 1, 1, 1])
  })

  test('leaves the exit code alone when the app reports the errors itself', async () => {
    defineMockErrorLog()
    const options = { name: 'app', subCommands: { deploy: deploy() }, validationErrorExitCode: 2 }

    await expect(
      cli(['deploy'], entry(), { ...options, renderValidationErrors: null })
    ).rejects.toThrow(AggregateError)
    await expect(cli(['deploy'], entry(), { ...options, usageSilent: true })).rejects.toThrow(
      AggregateError
    )

    expect(process.exitCode).toBeUndefined()
  })

  test('does not apply to bone, which does not report the errors', async () => {
    const run = vi.fn<() => void>()

    await expect(
      boneCli(['extra'], define({ name: 'app', run }), {
        strictPositionals: true,
        validationErrorExitCode: 2
      })
    ).rejects.toThrow('Unexpected positional argument: extra')

    expect(run).not.toHaveBeenCalled()
    expect(process.exitCode).toBeUndefined()
  })
})
