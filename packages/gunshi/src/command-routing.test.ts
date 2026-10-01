import { describe, expect, test, vi } from 'vitest'
import { cli } from './cli.ts'
import { define, lazy } from './definition.ts'
import {
  CommandNotFoundErrorKeys,
  CommandResolutionError,
  CommandResolutionErrorKeys,
  isCommandResolutionError
} from './error.ts'
import { plugin } from './plugin/core.ts'

function globals(parse?: (value: string) => string) {
  return plugin({
    id: 'test:routing-global',
    setup(ctx) {
      ctx.addGlobalOption('config', {
        type: 'string',
        short: 'c',
        parse
      })
      ctx.addGlobalOption('debug', {
        type: 'boolean',
        short: 'd',
        negatable: true
      })
    }
  })
}

function options(plugins = [globals()]) {
  return {
    plugins,
    renderHeader: null,
    usageSilent: true
  }
}

describe('command routing with option values', () => {
  test.each([
    ['--config prod.json deploy', ['--config', 'prod.json', 'deploy']],
    ['--config=prod.json deploy', ['--config=prod.json', 'deploy']],
    ['deploy --config prod.json', ['deploy', '--config', 'prod.json']],
    ['-c prod.json deploy', ['-c', 'prod.json', 'deploy']]
  ])('%s selects deploy after a leading option value', async (_label, argv) => {
    const run = vi.fn()

    await cli(argv, define({ name: 'app', run: vi.fn() }), {
      ...options(),
      subCommands: { deploy: define({ name: 'deploy', run }) }
    })

    expect(run).toHaveBeenCalledOnce()
    expect(run).toHaveBeenCalledWith(
      expect.objectContaining({
        values: { config: 'prod.json' },
        commandPath: ['deploy'],
        positionals: ['deploy']
      })
    )
  })

  test('does not execute a command whose name is an option value', async () => {
    const deploy = vi.fn()
    const clean = vi.fn()

    await cli(['--config', 'clean', 'deploy'], define({ name: 'app', run: vi.fn() }), {
      ...options(),
      subCommands: {
        clean: define({ name: 'clean', run: clean }),
        deploy: define({ name: 'deploy', run: deploy })
      }
    })

    expect(deploy).toHaveBeenCalledOnce()
    expect(clean).not.toHaveBeenCalled()
  })

  test('handles nested command names before and between options', async () => {
    const run = vi.fn()
    const remote = define({
      name: 'remote',
      run: vi.fn(),
      subCommands: {
        add: define({
          name: 'add',
          args: { item: { type: 'positional' } },
          run
        })
      }
    })

    for (const argv of [
      ['--config', 'prod.json', 'remote', 'add', 'origin'],
      ['remote', '--config', 'prod.json', 'add', 'origin'],
      ['remote', 'add', '--config', 'prod.json', 'origin']
    ]) {
      await cli(argv, define({ name: 'app', run: vi.fn() }), {
        ...options(),
        subCommands: { remote }
      })
    }

    expect(run).toHaveBeenCalledTimes(3)
    expect(run).toHaveBeenLastCalledWith(
      expect.objectContaining({
        commandPath: ['remote', 'add'],
        values: { config: 'prod.json', item: 'origin' },
        positionals: ['remote', 'add', 'origin']
      })
    )
  })

  test('preserves boolean, negatable, and grouped short option routing', async () => {
    const run = vi.fn()
    const command = define({ name: 'deploy', run })

    await cli(['-dc', 'prod.json', 'deploy'], define({ name: 'app', run: vi.fn() }), {
      ...options(),
      subCommands: { deploy: command }
    })
    await cli(['--no-debug', 'deploy'], define({ name: 'app', run: vi.fn() }), {
      ...options(),
      subCommands: { deploy: command }
    })

    expect(run).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ values: { config: 'prod.json', debug: true } })
    )
    expect(run).toHaveBeenNthCalledWith(2, expect.objectContaining({ values: { debug: false } }))
  })

  test('stops command exploration at the option terminator', async () => {
    const entry = vi.fn()
    const deploy = vi.fn()

    await cli(['--', 'deploy'], define({ name: 'app', run: entry }), {
      ...options(),
      subCommands: { deploy: define({ name: 'deploy', run: deploy }) }
    })

    expect(entry).toHaveBeenCalledOnce()
    expect(deploy).not.toHaveBeenCalled()
    expect(entry).toHaveBeenCalledWith(expect.objectContaining({ rest: ['deploy'] }))
  })

  test('consumes an unknown option value before selecting a command', async () => {
    const run = vi.fn()
    await expect(
      cli(['--unknown', 'x', 'deploy'], define({ name: 'app', run: vi.fn() }), {
        ...options(),
        strict: true,
        subCommands: { deploy: define({ name: 'deploy', run }) }
      })
    ).rejects.toBeInstanceOf(AggregateError)

    expect(run).not.toHaveBeenCalled()
  })

  test('does not call parse while exploring unselected candidates', async () => {
    const parse = vi.fn((value: string) => value)
    const clean = vi.fn()
    const deploy = vi.fn()

    await cli(['--config', 'clean', 'deploy'], define({ name: 'app', run: vi.fn() }), {
      ...options([globals(parse)]),
      subCommands: {
        clean: define({
          name: 'clean',
          run: clean
        }),
        deploy: define({ name: 'deploy', run: deploy })
      }
    })

    expect(parse).toHaveBeenCalledOnce()
    expect(deploy).toHaveBeenCalledOnce()
    expect(clean).not.toHaveBeenCalled()
  })

  test('reports an inconsistent option interpretation without running a command', async () => {
    const clean = vi.fn()
    const deploy = vi.fn()
    let captured: AggregateError | undefined

    await expect(
      cli(['--config', 'clean', 'deploy'], define({ name: 'app', run: vi.fn() }), {
        ...options(),
        subCommands: {
          clean: define({ name: 'clean', run: clean }),
          deploy: define({
            name: 'deploy',
            args: { config: { type: 'boolean' } },
            run: deploy
          })
        },
        onErrorCommand: (_ctx, error) => {
          captured = error as AggregateError
        }
      })
    ).rejects.toBeInstanceOf(AggregateError)

    const error = captured?.errors.find(isCommandResolutionError)
    expect(error).toBeInstanceOf(CommandResolutionError)
    expect(error?.code).toBe(CommandResolutionErrorKeys.inconsistentOptions)
    expect(error?.candidatePaths).toEqual([['clean'], ['deploy']])
    expect(clean).not.toHaveBeenCalled()
    expect(deploy).not.toHaveBeenCalled()
  })

  test('loads a selected lazy command once and rejects a loaded schema mismatch', async () => {
    const run = vi.fn()
    const load = vi.fn(async () =>
      define({
        name: 'deploy',
        args: { config: { type: 'boolean' } },
        run
      })
    )
    const deploy = lazy(load, { name: 'deploy' })

    await expect(
      cli(['--config', 'clean', 'deploy'], define({ name: 'app', run: vi.fn() }), {
        ...options(),
        subCommands: {
          clean: define({ name: 'clean', run: vi.fn() }),
          deploy
        }
      })
    ).rejects.toMatchObject({
      errors: [expect.objectContaining({ code: CommandResolutionErrorKeys.lazySchemaMismatch })]
    })

    expect(load).toHaveBeenCalledOnce()
    expect(run).not.toHaveBeenCalled()
  })

  test('keeps fallbackToEntry for option-aware routing', async () => {
    const entry = vi.fn()
    await cli(['--config', 'prod.json', 'input.txt'], define({ name: 'app', run: entry }), {
      ...options(),
      fallbackToEntry: true,
      subCommands: { deploy: define({ name: 'deploy', run: vi.fn() }) }
    })

    expect(entry).toHaveBeenCalledWith(
      expect.objectContaining({ values: { config: 'prod.json' }, positionals: ['input.txt'] })
    )
  })
})

describe('#781 - an empty argument is never a command name', () => {
  // an entry command whose optional positional argument takes the empty argument
  function entry(run = vi.fn()) {
    return define({
      name: 'app',
      args: {
        verbose: { type: 'boolean' },
        file: { type: 'positional', required: false }
      },
      run
    })
  }

  const subCommands = { deploy: define({ name: 'deploy', run: vi.fn() }) }

  test.each([
    ["--verbose ''", ['--verbose', ''], {}],
    ["'' --verbose", ['', '--verbose'], {}],
    ["--debug '' (a global option)", ['--debug', ''], {}],
    ["--verbose '' (strict)", ['--verbose', ''], { strict: true }]
  ])('%s runs the entry command with the empty argument', async (_label, argv, extra) => {
    const run = vi.fn()

    await cli(argv, entry(run), { ...options(), ...extra, subCommands })

    expect(run).toHaveBeenCalledOnce()
    expect(run).toHaveBeenCalledWith(
      expect.objectContaining({
        commandPath: [],
        omitted: true,
        positionals: [''],
        values: expect.objectContaining({ file: '' })
      })
    )
  })

  test("an empty argument after '--' does not stop the entry command either", async () => {
    const run = vi.fn()

    await cli(['--verbose', '--', ''], entry(run), { ...options(), subCommands })

    // args-tokens 0.29.0 gives the argument to `positionals`, and 1.0 gives it to `rest`
    // (kazupon/args-tokens#640), so this checks only which command runs
    expect(run).toHaveBeenCalledOnce()
    expect(run).toHaveBeenCalledWith(
      expect.objectContaining({
        commandPath: [],
        values: expect.objectContaining({ verbose: true })
      })
    )
  })

  test('an empty argument before a command name does not hide the command', async () => {
    const deploy = vi.fn()

    await cli(['', 'deploy', '--config', 'prod.json'], entry(), {
      ...options(),
      subCommands: { deploy: define({ name: 'deploy', run: deploy }) }
    })

    expect(deploy).toHaveBeenCalledOnce()
    expect(deploy).toHaveBeenCalledWith(
      expect.objectContaining({ commandPath: ['deploy'], values: { config: 'prod.json' } })
    )
  })

  test('an empty argument after a command that has sub-commands selects that command', async () => {
    const remote = vi.fn()
    const add = vi.fn()
    const command = define({
      name: 'remote',
      args: { verbose: { type: 'boolean' } },
      run: remote,
      subCommands: { add: define({ name: 'add', run: add }) }
    })

    for (const argv of [
      ['remote', '--verbose', ''],
      ['remote', '', '--verbose']
    ]) {
      await cli(argv, entry(), { ...options(), subCommands: { remote: command } })
    }

    expect(remote).toHaveBeenCalledTimes(2)
    expect(remote).toHaveBeenLastCalledWith(
      expect.objectContaining({ commandPath: ['remote'], omitted: true, values: { verbose: true } })
    )
    expect(add).not.toHaveBeenCalled()
  })

  test('a lazy command that declares sub-commands is loaded and runs', async () => {
    const run = vi.fn()
    const load = vi.fn(async () =>
      define({ name: 'group', args: { verbose: { type: 'boolean' } }, run })
    )
    const group = lazy(load, {
      name: 'group',
      args: { verbose: { type: 'boolean' } },
      subCommands: { child: define({ name: 'child', run: vi.fn() }) }
    })

    await cli(['group', '--verbose', ''], entry(), { ...options(), subCommands: { group } })

    expect(load).toHaveBeenCalledOnce()
    expect(run).toHaveBeenCalledWith(
      expect.objectContaining({ commandPath: ['group'], omitted: true, values: { verbose: true } })
    )
  })

  test('--help with an empty argument renders the usage', async () => {
    const run = vi.fn()

    const rendered = await cli(['--help', ''], entry(run), { ...options(), subCommands })

    expect(rendered).toContain('USAGE')
    expect(run).not.toHaveBeenCalled()
  })

  test('a name that is not empty is still looked up as a command', async () => {
    // regression watchdog: only an empty argument is skipped
    await expect(
      cli(['--verbose', 'nope'], entry(), { ...options(), subCommands })
    ).rejects.toMatchObject({
      errors: [expect.objectContaining({ code: CommandNotFoundErrorKeys.notFound })]
    })
  })
})

describe('#793 - an empty argument before a command name is not a positional argument of the command', () => {
  type Ran = {
    commandPath: string[]
    values: Record<string, unknown>
    positionals: string[]
    rest: string[]
  }

  // run the CLI, and return what the command that ran was given, or the codes of the errors
  async function resolve(argv: string[]): Promise<Ran | { codes: (string | undefined)[] }> {
    let ran: Ran | undefined
    const record = (ctx: Ran) => {
      ran = {
        commandPath: ctx.commandPath,
        values: { ...ctx.values },
        positionals: ctx.positionals,
        rest: ctx.rest
      }
    }
    const item = { type: 'positional', required: false } as const
    const subCommands = {
      build: define({
        name: 'build',
        args: { target: item, verbose: { type: 'boolean' }, out: { type: 'string' } },
        run: ctx => record(ctx)
      }),
      deploy: define({
        name: 'deploy',
        args: { env: { type: 'positional' } },
        run: ctx => record(ctx)
      }),
      remote: define({
        name: 'remote',
        run: ctx => record(ctx),
        subCommands: { add: define({ name: 'add', args: { item }, run: ctx => record(ctx) }) }
      }),
      lz: lazy(async () => define({ name: 'lz', args: { item }, run: ctx => record(ctx) }), {
        name: 'lz',
        args: { item }
      })
    }

    try {
      await cli(argv, define({ name: 'app', run: ctx => record(ctx) }), {
        ...options(),
        subCommands
      })
    } catch (error) {
      return { codes: (error as AggregateError).errors.map((e: { code?: string }) => e.code) }
    }
    return ran!
  }

  test.each([
    ["'' build x", ['', 'build', 'x'], ['build'], { target: 'x' }],
    ["'' '' build x", ['', '', 'build', 'x'], ['build'], { target: 'x' }],
    [
      "'' build x --verbose",
      ['', 'build', 'x', '--verbose'],
      ['build'],
      { target: 'x', verbose: true }
    ],
    ["'' build --out o x", ['', 'build', '--out', 'o', 'x'], ['build'], { target: 'x', out: 'o' }],
    ["--debug '' build x", ['--debug', '', 'build', 'x'], ['build'], { target: 'x', debug: true }],
    [
      "'' remote add origin",
      ['', 'remote', 'add', 'origin'],
      ['remote', 'add'],
      { item: 'origin' }
    ],
    [
      "remote '' add origin",
      ['remote', '', 'add', 'origin'],
      ['remote', 'add'],
      { item: 'origin' }
    ],
    ["'' lz x (a lazy command)", ['', 'lz', 'x'], ['lz'], { item: 'x' }]
  ])(
    '%s gives the argument after the command name to the command',
    async (_label, argv, commandPath, values) => {
      // `skipPositional` was `depth - 1`, and args-tokens counts the empty arguments too, so the last
      // command name became the first positional argument of the command
      await expect(resolve(argv)).resolves.toMatchObject({ commandPath, values })
    }
  )

  test("'' deploy reports the missing positional argument, as deploy does", async () => {
    await expect(resolve(['', 'deploy'])).resolves.toEqual({
      codes: ['err:arg:required-positional']
    })
  })

  test("'' build -- x gives nothing to the positional argument, as build -- x does", async () => {
    await expect(resolve(['', 'build', '--', 'x'])).resolves.toEqual({
      commandPath: ['build'],
      values: {},
      positionals: ['', 'build'],
      rest: ['x']
    })
  })

  test('the empty argument stays in the positional arguments', async () => {
    // only the values move: `positionals` is what args-tokens reads, the command names included
    await expect(resolve(['', 'build', 'x'])).resolves.toMatchObject({
      positionals: ['', 'build', 'x']
    })
  })

  test('an empty argument after the command name is its positional argument', async () => {
    // regression watchdog: only an empty argument before the last command name is skipped
    await expect(resolve(['build', '', 'x'])).resolves.toMatchObject({
      commandPath: ['build'],
      values: { target: '' }
    })
  })

  test('an empty value of an option is not skipped as a positional argument', async () => {
    // regression watchdog: `--config` takes the empty argument, so the positional arguments start at `build`
    await expect(resolve(['--config', '', 'build', 'x'])).resolves.toMatchObject({
      commandPath: ['build'],
      values: { config: '', target: 'x' }
    })
  })
})
