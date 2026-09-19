import { describe, expect, test } from 'vitest'
import { lazy } from './definition.ts'
import { resolveCommandArgs, resolveLazyCommand } from './utils.ts'

import type { ArgSchema, Args, Command, CommandRunner } from './types.ts'

const run: CommandRunner = () => {}

describe('resolveLazyCommand', () => {
  /**
   * NOTE(kazupon): every property of `Command` but `run`, which the loader provides.
   * `Required` fails the type check when `Command` gets a new property, and the value that is added here
   * fails the tests below until `lazy` and `resolveLazyCommand` carry it (#716, #717).
   */
  const definition = {
    name: 'deploy',
    description: 'Deploy the app',
    args: { env: { type: 'string', short: 'e' } } satisfies Args,
    examples: '$ my-cli deploy --env prod',
    toKebab: true,
    internal: true,
    entry: true,
    rendering: { header: null },
    subCommands: { status: { name: 'status', run } }
  } satisfies Required<Omit<Command, 'run'>>

  const loaded = {
    name: 'loaded',
    description: 'Loaded description',
    args: { target: { type: 'string' } } satisfies Args,
    examples: '$ my-cli loaded',
    toKebab: false,
    internal: false,
    entry: false,
    rendering: { usage: null },
    subCommands: { logs: { name: 'logs', run } }
  } satisfies Required<Omit<Command, 'run'>>

  test('not run the loader unless it is requested', async () => {
    let called = 0
    const cmd = lazy(() => {
      called++
      return run
    }, definition)

    const resolved = await resolveLazyCommand(cmd)

    expect(called).toBe(0)
    expect(resolved).toMatchObject({ ...definition, subCommands: expect.anything() })
    expect(resolved.run).toBeUndefined()
  })

  test('loader that returns a command runner keeps the definition', async () => {
    const resolved = await resolveLazyCommand(
      lazy(() => run, definition),
      'key',
      true
    )

    expect(resolved).toMatchObject({ ...definition, subCommands: expect.anything(), run })
  })

  test('loader that returns a command without the properties falls back to the definition', async () => {
    const resolved = await resolveLazyCommand(
      lazy(() => ({ run }), definition),
      'key',
      true
    )

    expect(resolved.run).toBe(run)
    expect(resolved.name).toBe('deploy')
    expect(resolved.description).toBe('Deploy the app')
    expect(resolved.args).toEqual(definition.args)
    expect(resolved.examples).toBe('$ my-cli deploy --env prod')
    expect(resolved.toKebab).toBe(true)
    expect(resolved.internal).toBe(true)
    expect(resolved.entry).toBe(true)
    expect(resolved.rendering).toEqual({ header: null })
    expect(Object.keys(resolved.subCommands || {})).toEqual(['status'])
  })

  test('loader that returns a command with the properties wins over the definition', async () => {
    const resolved = await resolveLazyCommand(
      lazy(() => ({ ...loaded, run }), definition),
      'key',
      true
    )

    // every property, so that a new one of `Command` that this branch forgets fails here
    expect(resolved).toMatchObject({ ...loaded, subCommands: expect.anything(), run })
    expect(resolved.name).toBe('loaded')
    expect(resolved.description).toBe('Loaded description')
    expect(resolved.args).toEqual(loaded.args)
    expect(resolved.examples).toBe('$ my-cli loaded')
    expect(resolved.toKebab).toBe(false)
    expect(resolved.internal).toBe(false)
    expect(resolved.entry).toBe(false)
    // the whole `rendering` of the loaded command, not a merge with the one of the definition
    expect(resolved.rendering).toEqual({ usage: null })
    expect(Object.keys(resolved.subCommands || {})).toEqual(['logs'])
  })

  test('falsy values of the loaded command are not taken as missing', async () => {
    const resolved = await resolveLazyCommand(
      lazy(
        () => ({
          run,
          description: '',
          args: {},
          examples: '',
          toKebab: false,
          internal: false,
          entry: false,
          rendering: {}
        }),
        definition
      ),
      'key',
      true
    )

    expect(resolved.description).toBe('')
    expect(resolved.args).toEqual({})
    // a command that declares no examples must not inherit the ones of the definition
    expect(resolved.examples).toBe('')
    expect(resolved.toKebab).toBe(false)
    expect(resolved.internal).toBe(false)
    expect(resolved.entry).toBe(false)
    expect(resolved.rendering).toEqual({})
  })

  test('`undefined` of the loaded command falls back to the definition', async () => {
    const partial: Command = {
      run,
      description: undefined,
      args: undefined,
      toKebab: undefined,
      rendering: undefined
    }
    const resolved = await resolveLazyCommand(
      lazy(() => partial, definition),
      'key',
      true
    )

    expect(resolved.description).toBe('Deploy the app')
    expect(resolved.args).toEqual(definition.args)
    expect(resolved.toKebab).toBe(true)
    expect(resolved.rendering).toEqual({ header: null })
  })

  test('command name: the loaded command, the definition, then the given name', async () => {
    const byLoaded = await resolveLazyCommand(
      lazy(() => ({ name: 'loaded', run }), { name: 'deploy' }),
      'key',
      true
    )
    const byDefinition = await resolveLazyCommand(
      lazy(() => ({ run }), { name: 'deploy' }),
      'key',
      true
    )
    // a command that is not lazy has no definition to fall back to
    const byGivenName = await resolveLazyCommand({ run }, 'key', true)

    expect(byLoaded.name).toBe('loaded')
    expect(byDefinition.name).toBe('deploy')
    expect(byGivenName.name).toBe('key')
  })
})

describe('resolveCommandArgs', () => {
  const globalOptions = new Map<string, ArgSchema>([
    ['help', { type: 'boolean', short: 'h', description: 'Display this help message' }],
    ['version', { type: 'boolean', short: 'v', description: 'Display this version' }]
  ])

  test('the global options come first, and the command shadows them by name', () => {
    const args: Args = resolveCommandArgs(globalOptions, {
      version: { type: 'string', description: 'Version to release' }
    } satisfies Args)

    expect(Object.keys(args)).toEqual(['help', 'version'])
    expect(args.version).toEqual({ type: 'string', description: 'Version to release' })
  })

  test('a global option gives up a short name that the command claims', () => {
    // the return type is the one of the command, as the core resolves it: the global options are
    // there at run time, so the result is read through `Args` to reach them
    const args: Args = resolveCommandArgs(globalOptions, {
      verbose: { type: 'boolean', short: 'v' }
    } satisfies Args)

    expect(args.version.short).toBeUndefined()
    expect(args.version.type).toEqual('boolean')
    expect(args.help.short).toEqual('h')
  })

  test('the schema of the global option is not changed', () => {
    resolveCommandArgs(globalOptions, { verbose: { type: 'boolean', short: 'v' } } satisfies Args)

    expect(globalOptions.get('version')!.short).toEqual('v')
  })

  test('a positional argument claims no short name', () => {
    const args: Args = resolveCommandArgs(globalOptions, {
      // `short` means nothing on a positional argument
      value: { type: 'positional', short: 'v' }
    } as Args)

    expect(args.version.short).toEqual('v')
  })

  test('without global options, the arguments of the command are all there is', () => {
    const args = resolveCommandArgs(undefined, { port: { type: 'number' } } satisfies Args)

    expect(Object.keys(args)).toEqual(['port'])
  })

  test('without arguments, the global options are all there is', () => {
    expect(Object.keys(resolveCommandArgs(globalOptions))).toEqual(['help', 'version'])
  })

  test('the result has no prototype, so an argument cannot be named after one', () => {
    expect(Object.getPrototypeOf(resolveCommandArgs(globalOptions, {}))).toBeNull()
  })
})
