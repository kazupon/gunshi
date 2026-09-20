import { describe, expect, test, vi } from 'vitest'
import { cli } from './cli.ts'
import { define, lazy } from './definition.ts'
import {
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
