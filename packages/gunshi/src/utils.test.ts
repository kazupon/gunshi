import { parseArgs, resolveArgs } from 'args-tokens'
import { describe, expect, test } from 'vitest'
import { lazy } from './definition.ts'
import { jsonArgs } from './json.ts'
import { isJsonArg, isLazyCommand, resolveJsonRequest, resolveLazyCommand } from './utils.ts'

import type { Args, Command, CommandLoader, CommandRunner } from './types.ts'

const run: CommandRunner = () => {}

describe('isLazyCommand', () => {
  test.each([
    ['a named definition', lazy(() => run, { name: 'deploy' })],
    ['an unnamed definition', lazy(() => run, { args: {} })],
    ['no definition', lazy(() => run)],
    ['an empty name', lazy(() => run, { name: '' })]
  ])('recognizes %s', (_label, command) => {
    expect(isLazyCommand(command)).toBe(true)
  })

  test('does not recognize an ordinary command runner', () => {
    expect(isLazyCommand(run)).toBe(false)
    expect(isLazyCommand({ run })).toBe(false)
  })

  test('recognizes a structurally marked lazy command with no name', () => {
    const command = Object.assign(() => run, { commandName: undefined })

    expect(isLazyCommand(command)).toBe(true)
  })
})

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

  test('resolves an unnamed lazy command without running its loader for metadata', async () => {
    let called = 0
    const command = lazy(
      () => {
        called++
        return run
      },
      { args: { target: { type: 'string' } } }
    )

    const resolved = await resolveLazyCommand(command)

    expect(called).toBe(0)
    expect(resolved.args).toEqual({ target: { type: 'string' } })
    expect(resolved.name).toBeUndefined()
    expect(resolved.run).toBeUndefined()
  })

  test('the errors of a loaded command name the command, not the loader function', async () => {
    // loaders in consts, as the guide writes them: each function is named after its const
    const buildLoader = async () => ({ description: 'Build the project' })
    const deployLoader = (async () => undefined) as unknown as CommandLoader
    const statusLoader = async () => ({ description: 'Show the status' })

    await expect(
      resolveLazyCommand(lazy(buildLoader, { name: 'build' }), 'key', true)
    ).rejects.toThrow(new TypeError(`'run' is required in command: build`))
    await expect(
      resolveLazyCommand(lazy(deployLoader, { name: 'deploy' }), 'key', true)
    ).rejects.toThrow(new TypeError(`Cannot resolve command: deploy`))
    // without a name in the definition, the name that the command is given with
    await expect(resolveLazyCommand(lazy(statusLoader), 'key', true)).rejects.toThrow(
      new TypeError(`'run' is required in command: key`)
    )
  })
})

describe('isJsonArg', () => {
  test('recognizes the json argument of jsonArgs by its mark', () => {
    expect(isJsonArg(jsonArgs.json)).toBe(true)
    // spreading keeps the mark, so a short name can be added
    expect(isJsonArg({ ...jsonArgs.json, short: 'j' })).toBe(true)
  })

  test.each([
    { title: 'a json argument of its own', schema: { type: 'boolean' } },
    { title: 'the mark set to a string', schema: { type: 'boolean', '~gunshi.json-arg': 'true' } },
    { title: 'undefined', schema: undefined },
    { title: 'null', schema: null }
  ])('does not recognize $title', ({ schema }) => {
    expect(isJsonArg(schema)).toBe(false)
  })
})

describe('resolveJsonRequest', () => {
  /**
   * Resolve the request for a command line, as the core and the global options plugin see it.
   *
   * @param args - The arguments of the command
   * @param argv - The command line
   * @param withTokens - Whether to pass the raw tokens, as the global options plugin does
   * @returns The request
   */
  function resolve(args: Args, argv: string[], withTokens = true) {
    const tokens = parseArgs(argv)
    // as the core resolves them
    const { values } = resolveArgs(args, tokens, { shortGrouping: true })
    return resolveJsonRequest(args, values, withTokens ? tokens : undefined)
  }

  const short = {
    json: { ...jsonArgs.json, short: 'j' },
    verbose: { type: 'boolean', short: 'v' }
  } satisfies Args

  test.each([
    { argv: ['--json'], expected: 'declared' },
    { argv: ['--json=true'], expected: 'declared' },
    { argv: ['-j'], expected: 'declared' },
    { argv: ['-vj'], expected: 'declared' },
    { argv: ['-j', '--', 'x'], expected: 'declared' },
    { argv: ['--json=false'], expected: undefined },
    { argv: ['--', '--json'], expected: undefined },
    { argv: [], expected: undefined }
  ])('a command that spreads jsonArgs: $argv is $expected', ({ argv, expected }) => {
    expect(resolve(short, argv)).toBe(expected)
    // the core passes no tokens, and comes to the same answer
    expect(resolve(short, argv, false)).toBe(expected)
  })

  test.each([
    { argv: ['--json'], expected: 'undeclared' },
    { argv: ['--json=true'], expected: 'undeclared' },
    { argv: ['--json=false'], expected: undefined },
    { argv: ['--', '--json'], expected: undefined },
    // without a declaration, a short name of --json is not known
    { argv: ['-j'], expected: undefined }
  ])('a command without a json argument: $argv is $expected', ({ argv, expected }) => {
    expect(resolve({ verbose: { type: 'boolean' } }, argv)).toBe(expected)
    // the core passes no tokens, and never takes --json for a request of such a command
    expect(resolve({ verbose: { type: 'boolean' } }, argv, false)).toBeUndefined()
  })

  test("a json argument of its own is the command's", () => {
    expect(resolve({ json: { type: 'boolean' } }, ['--json'])).toBeUndefined()
  })

  test('reads the raw tokens when the core left the values empty', () => {
    // the core cannot resolve the command, and leaves the values empty then
    const tokens = parseArgs(['--json'])
    expect(resolveJsonRequest({ ...jsonArgs }, {}, tokens)).toBe('declared')
    expect(resolveJsonRequest({ ...jsonArgs }, {})).toBeUndefined()
  })
})
