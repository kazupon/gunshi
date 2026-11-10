/**
 * The JSON output of the global options plugin, for a command that spreads `jsonArgs` and is given
 * `--json`, and for `--json` given to a command that does not spread it.
 */

import {
  ArgsValidationError,
  ArgsValidationErrorKeys,
  CommandError,
  CommandNotFoundError,
  CommandNotFoundErrorKeys,
  CommandResolutionError,
  CommandResolutionErrorKeys,
  isJsonOutputError
} from '@gunshi/plugin'
import { COMMON_ARGS } from '@gunshi/shared'
import { describe, expect, onTestFinished, test, vi } from 'vitest'
import { createCommandContext } from '../../gunshi/src/context.ts'
import { jsonArgs } from '../../gunshi/src/json.ts'
import decorator from './decorator.ts'
import extension from './extension.ts'
import { pluginId } from './types.ts'

import type { Args, ArgSchema, ArgToken, ArgValues, JsonOutputError } from '@gunshi/plugin'
import type { CliOptions } from '../../gunshi/src/types.ts'

const JSON_TOKEN: ArgToken = { kind: 'option', index: 0, name: 'json', rawName: '--json' }

const SEE_THE_ARGUMENTS = 'See the arguments of the command'

/**
 * Prepare the set of reported errors for the run of a context, as the core does in `cli()`.
 *
 * @param ctx - The command context of the run
 * @returns The set of the errors that the plugin reports during the run
 */
function trackReported(ctx: object): WeakSet<object> {
  const registry = globalThis as unknown as Record<
    symbol,
    WeakMap<object, WeakSet<object>> | undefined
  >
  const reported = new WeakSet<object>()
  ;(registry[Symbol.for('gunshi.reported')] ??= new WeakMap()).set(ctx, reported)
  return reported
}

interface Run {
  args?: Args
  values?: ArgValues<Args>
  tokens?: ArgToken[]
  validationError?: AggregateError
  // the options of the command environment, such as the global options that the core puts
  cliOptions?: Partial<CliOptions> & { globalOptions?: Map<string, ArgSchema> }
  commandPath?: string[]
  extensions?: Record<string, object>
}

/**
 * Create the command context of a run of `demo`, by default for a command that spreads `jsonArgs` and
 * is given `--json`. The global `--help` and `--version` are in effect, and the CLI renders a usage, as
 * with the global options plugin and the renderer plugin.
 *
 * @param run - What differs from the default
 * @returns The command context and the set of the reported errors
 */
async function createRun({
  args = { ...jsonArgs },
  values = { json: true },
  tokens = [JSON_TOKEN],
  validationError,
  cliOptions = {},
  commandPath = [],
  extensions = {}
}: Run = {}) {
  const ctx = await createCommandContext({
    args,
    values,
    tokens,
    validationError,
    commandPath,
    cliOptions: {
      name: 'demo',
      version: '1.0.0',
      globalOptions: new Map(Object.entries(COMMON_ARGS)),
      renderUsage: () => Promise.resolve('USAGE: demo'),
      ...cliOptions
    } as CliOptions,
    extensions: {
      [pluginId]: { key: Symbol(pluginId), factory: extension },
      ...Object.fromEntries(
        Object.entries(extensions).map(([id, value]) => [
          id,
          { key: Symbol(id), factory: () => value }
        ])
      )
    }
  })
  return { ctx, reported: trackReported(ctx) }
}

/**
 * Capture what is printed to stdout and stderr, and restore the exit code after the test.
 *
 * @returns The lines of stdout, the lines of stderr, and the JSON documents of stderr
 */
function captureOutput() {
  const stdout = vi.spyOn(console, 'log').mockImplementation(() => {})
  const stderr = vi.spyOn(console, 'error').mockImplementation(() => {})
  onTestFinished(() => {
    stdout.mockRestore()
    stderr.mockRestore()
    process.exitCode = undefined
  })
  return {
    stdout: () => stdout.mock.calls.map(args => args.join(' ')),
    stderr: () => stderr.mock.calls.map(args => args.join(' ')),
    json: () => stderr.mock.calls.map(([line]) => JSON.parse(String(line)) as unknown)
  }
}

/**
 * Set whether stdout is a terminal, for the test.
 *
 * @param isTTY - Whether stdout is a terminal
 */
function setTerminal(isTTY: boolean) {
  const descriptor = Object.getOwnPropertyDescriptor(process.stdout, 'isTTY')
  Object.defineProperty(process.stdout, 'isTTY', { value: isTTY, configurable: true })
  onTestFinished(() => {
    if (descriptor) {
      Object.defineProperty(process.stdout, 'isTTY', descriptor)
    } else {
      delete (process.stdout as { isTTY?: boolean }).isTTY
    }
  })
}

/**
 * Run a function, and return what it throws.
 *
 * @param fn - The function
 * @returns The thrown value
 */
async function catchError(fn: () => unknown): Promise<unknown> {
  try {
    await fn()
  } catch (error: unknown) {
    return error
  }
  throw new Error('expected to throw')
}

describe('the result', () => {
  test('is printed as one line of JSON to stdout, and nothing is returned', async () => {
    const output = captureOutput()
    setTerminal(false)
    const { ctx } = await createRun()

    const result = await decorator(() => ({ projects: [{ name: 'acme' }] }))(ctx)

    expect(result).toBeUndefined()
    expect(output.stdout()).toEqual(['{"projects":[{"name":"acme"}]}'])
    expect(output.stderr()).toEqual([])
    expect(process.exitCode).toBeUndefined()
  })

  test('is indented on a terminal', async () => {
    const output = captureOutput()
    setTerminal(true)
    const { ctx } = await createRun()

    await decorator(() => ({ projects: [{ name: 'acme' }] }))(ctx)

    expect(output.stdout()).toEqual([JSON.stringify({ projects: [{ name: 'acme' }] }, null, 2)])
  })

  test('is printed with usageSilent too, since it is not a text for people', async () => {
    const output = captureOutput()
    setTerminal(false)
    const { ctx } = await createRun({ cliOptions: { usageSilent: true } })

    await decorator(() => ({ ok: true }))(ctx)

    expect(output.stdout()).toEqual(['{"ok":true}'])
  })

  test('is returned as before without --json', async () => {
    const output = captureOutput()
    const { ctx } = await createRun({ values: {}, tokens: [] })

    expect(await decorator(() => 'text')(ctx)).toBe('text')
    expect(output.stdout()).toEqual([])
  })

  test('the functions of the extension print nothing, and return the text', async () => {
    const output = captureOutput()
    setTerminal(false)
    const { ctx } = await createRun()

    await decorator(c => ({ version: c.extensions[pluginId].showVersion() }))(ctx)

    // `ctx.log` is silenced, so only the JSON is printed
    expect(output.stdout()).toEqual(['{"version":"1.0.0"}'])
  })

  test('waits until stdout has written what it holds', async () => {
    captureOutput()
    setTerminal(false)
    const { ctx } = await createRun()
    Object.defineProperty(process.stdout, 'writableLength', { get: () => 1, configurable: true })
    onTestFinished(() => {
      delete (process.stdout as { writableLength?: number }).writableLength
    })
    const listeners = process.stdout.listenerCount('drain')

    let done = false
    const running = Promise.resolve(decorator(() => ({ ok: true }))(ctx)).then(() => {
      done = true
    })
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(done).toBe(false)

    process.stdout.emit('drain')
    await running

    expect(done).toBe(true)
    // the listeners are removed after the wait
    expect(process.stdout.listenerCount('drain')).toBe(listeners)
  })
})

describe('a result that cannot be printed as JSON', () => {
  const INVALID_RESULT =
    'The command finished, but did not return an object to output as JSON. A plugin that decorates the command may have dropped its result'

  test.each([
    { title: 'null', value: null },
    { title: 'a string', value: 'done' },
    { title: 'an array', value: [{ name: 'acme' }] },
    { title: 'undefined', value: undefined },
    { title: 'a Date', value: new Date(0) },
    { title: 'an object whose toJSON returns a string', value: { toJSON: () => 'done' } },
    { title: 'an object whose toJSON returns undefined', value: { toJSON: () => undefined } }
  ])('is reported for $title: invalid_result, exit code 1', async ({ value }) => {
    const output = captureOutput()
    const { ctx, reported } = await createRun()

    const error = await catchError(() => decorator(() => value as never)(ctx))

    expect(isJsonOutputError(error)).toBe(true)
    expect((error as JsonOutputError).code).toBe('err:json:invalid-result')
    expect(output.stdout()).toEqual([])
    expect(output.json()).toEqual([
      { status: 'error', reason: 'invalid_result', message: INVALID_RESULT }
    ])
    expect(process.exitCode).toBe(1)
    expect(reported.has(error as object)).toBe(true)
  })

  test.each([
    { title: 'a BigInt', value: { count: 1n } },
    {
      title: 'a cycle',
      value: (() => {
        const value: Record<string, unknown> = {}
        value.self = value
        return value
      })()
    }
  ])('is reported for $title: unserializable_result, with the cause', async ({ value }) => {
    const output = captureOutput()
    const { ctx } = await createRun()

    const error = await catchError(() => decorator(() => value)(ctx))

    expect(isJsonOutputError(error)).toBe(true)
    expect((error as JsonOutputError).code).toBe('err:json:unserializable-result')
    expect((error as JsonOutputError).cause).toBeInstanceOf(TypeError)
    const [failure] = output.json() as { reason: string; message: string }[]
    expect(failure.reason).toBe('unserializable_result')
    expect(failure.message).toBe(
      `The command finished, but its result cannot be converted to JSON: ${((error as JsonOutputError).cause as Error).message}`
    )
    expect(process.exitCode).toBe(1)
  })

  test('is reported with usageSilent too', async () => {
    const output = captureOutput()
    const { ctx } = await createRun({ cliOptions: { usageSilent: true } })

    await catchError(() => decorator(() => null as never)(ctx))

    expect(output.json()).toHaveLength(1)
    expect(process.exitCode).toBe(1)
  })
})

describe('an error of the command', () => {
  test('a CommandError is printed with its code as the reason, its causes, and its exit code', async () => {
    const output = captureOutput()
    const { ctx, reported } = await createRun()
    const error = new CommandError('Could not reach api.example.com', {
      code: 'network_error',
      exitCode: 3,
      cause: new Error('getaddrinfo ENOTFOUND api.example.com')
    })

    expect(
      await catchError(() =>
        decorator(() => {
          throw error
        })(ctx)
      )
    ).toBe(error)

    expect(output.stdout()).toEqual([])
    // no `next`: the help does not fix a failure of the work
    expect(output.json()).toEqual([
      {
        status: 'error',
        reason: 'network_error',
        message: 'Could not reach api.example.com',
        data: { causes: ['getaddrinfo ENOTFOUND api.example.com'] }
      }
    ])
    expect(process.exitCode).toBe(3)
    expect(reported.has(error)).toBe(true)
  })

  test('a CommandError without a code is command_failed', async () => {
    const output = captureOutput()
    const { ctx } = await createRun()

    await catchError(() =>
      decorator(() => {
        throw new CommandError('Project acme not found')
      })(ctx)
    )

    expect(output.json()).toEqual([
      { status: 'error', reason: 'command_failed', message: 'Project acme not found' }
    ])
  })

  test('any other error is command_failed, even with a code, with exit code 1', async () => {
    const output = captureOutput()
    const { ctx, reported } = await createRun()
    const error = Object.assign(new Error('Unexpected end of input'), { code: 'ERR_PARSE' })

    await catchError(() =>
      decorator(() => {
        throw error
      })(ctx)
    )

    expect(output.json()).toEqual([
      { status: 'error', reason: 'command_failed', message: 'Unexpected end of input' }
    ])
    expect(process.exitCode).toBe(1)
    expect(reported.has(error)).toBe(true)
  })

  test('is printed with usageSilent too', async () => {
    const output = captureOutput()
    const { ctx, reported } = await createRun({ cliOptions: { usageSilent: true } })
    const error = new CommandError('Project acme not found', { exitCode: 2 })

    await catchError(() =>
      decorator(() => {
        throw error
      })(ctx)
    )

    expect(output.json()).toHaveLength(1)
    expect(process.exitCode).toBe(2)
    expect(reported.has(error)).toBe(true)
  })

  test('a thrown value that is not an error is printed with its string', async () => {
    const output = captureOutput()
    const { ctx } = await createRun()

    await catchError(() =>
      decorator(() => {
        // oxlint-disable-next-line no-throw-literal -- a value that is not an error
        throw 'boom'
      })(ctx)
    )

    expect(output.json()).toEqual([{ status: 'error', reason: 'command_failed', message: 'boom' }])
  })
})

describe('an error before the command runs', () => {
  const required = (name: string) =>
    new ArgsValidationError(`Option '--${name}' is required`, {
      code: ArgsValidationErrorKeys.requiredOption,
      values: { name, displayName: `'--${name}'` }
    })

  test('the validation errors are printed as JSON, without the renderer', async () => {
    const output = captureOutput()
    const renderValidationErrors = vi.fn<() => Promise<string>>(() => Promise.resolve('rendered'))
    const validationError = new AggregateError([required('name')])
    const { ctx, reported } = await createRun({
      args: { ...jsonArgs, name: { type: 'string', required: true } },
      validationError,
      commandPath: ['deploy'],
      cliOptions: { renderValidationErrors }
    })
    const run = vi.fn<() => { ok: boolean }>(() => ({ ok: true }))

    expect(await catchError(() => decorator(run)(ctx))).toBe(validationError)

    expect(run).not.toHaveBeenCalled()
    expect(renderValidationErrors).not.toHaveBeenCalled()
    expect(output.json()).toEqual([
      {
        status: 'action_required',
        reason: 'required_option',
        message: "Option '--name' is required",
        next: [
          {
            command: 'demo deploy --help',
            argv: ['demo', 'deploy', '--help'],
            when: SEE_THE_ARGUMENTS
          }
        ],
        data: {
          issues: [
            { field: '--name', reason: 'required_option', message: "Option '--name' is required" }
          ]
        }
      }
    ])
    expect(process.exitCode).toBe(1)
    expect(reported.has(validationError)).toBe(true)
  })

  test('two or more are invalid_arguments, with an issue each, written as on the command line', async () => {
    const output = captureOutput()
    const validationError = new AggregateError([
      new ArgsValidationError("Option '--dry-run' does not take a value", {
        code: ArgsValidationErrorKeys.unexpectedValue,
        values: { name: 'dryRun', displayName: "'--dry-run'" }
      }),
      new ArgsValidationError("Positional argument 'file' is required", {
        code: ArgsValidationErrorKeys.requiredPositional,
        values: { name: 'file', displayName: "'file'" }
      })
    ])
    const { ctx } = await createRun({
      args: {
        ...jsonArgs,
        dryRun: { type: 'boolean', toKebab: true },
        file: { type: 'positional' }
      },
      validationError
    })

    await catchError(() => decorator(() => ({ ok: true }))(ctx))

    const [failure] = output.json() as { reason: string; message: string; data: unknown }[]
    expect(failure.reason).toBe('invalid_arguments')
    expect(failure.message).toBe('2 arguments are invalid')
    expect(failure.data).toEqual({
      issues: [
        {
          field: '--dry-run',
          reason: 'unexpected_value',
          message: "Option '--dry-run' does not take a value"
        },
        {
          field: 'file',
          reason: 'required_positional',
          message: "Positional argument 'file' is required"
        }
      ]
    })
  })

  test.each([
    {
      title: 'a conflict',
      error: new ArgsValidationError("'--summer' conflicts with '--autumn'", {
        code: ArgsValidationErrorKeys.conflict,
        values: { name: 'summer', displayName: "'--summer'" }
      }),
      issue: { field: '--summer', reason: 'conflicting_options' },
      argv: ['demo', '--help']
    },
    {
      title: 'an unknown command',
      error: new CommandNotFoundError('Command not found: nope', {
        code: CommandNotFoundErrorKeys.notFound,
        commandName: 'nope',
        commandPath: ['db']
      }),
      issue: { field: 'nope', reason: 'unknown_command' },
      argv: ['demo', 'db', '--help']
    },
    {
      title: 'an ambiguous command',
      error: new CommandResolutionError('Ambiguous command resolution', {
        code: CommandResolutionErrorKeys.ambiguous,
        candidatePaths: [['logs'], ['status']]
      }),
      // no argument caused it
      issue: { reason: 'ambiguous_command' },
      argv: ['demo', '--help']
    }
  ])('$title is renamed, with the help of the nearest command', async ({ error, issue, argv }) => {
    const output = captureOutput()
    const { ctx } = await createRun({
      args: { ...jsonArgs, summer: { type: 'boolean' } },
      validationError: new AggregateError([error])
    })

    await catchError(() => decorator(() => ({ ok: true }))(ctx))

    const [failure] = output.json() as {
      reason: string
      next: { argv: string[] }[]
      data: { issues: object[] }
    }[]
    expect(failure.reason).toBe(issue.reason)
    expect(failure.next[0].argv).toEqual(argv)
    expect(failure.data.issues).toEqual([{ ...issue, message: error.message }])
  })

  test.each([
    { title: 'renderValidationErrors: null', cliOptions: { renderValidationErrors: null } },
    { title: 'usageSilent', cliOptions: { usageSilent: true } }
  ])('are left to the app with $title, as before', async ({ cliOptions }) => {
    const output = captureOutput()
    const validationError = new AggregateError([required('name')])
    const { ctx, reported } = await createRun({ validationError, cliOptions })

    expect(await catchError(() => decorator(() => ({ ok: true }))(ctx))).toBe(validationError)

    expect(output.stderr()).toEqual([])
    expect(process.exitCode).toBeUndefined()
    expect(reported.has(validationError)).toBe(false)
  })

  test('the name of the CLI is <COMMAND> without it, and `when` says to replace it', async () => {
    const output = captureOutput()
    const { ctx } = await createRun({
      args: {},
      values: {},
      commandPath: ['legacy'],
      cliOptions: { name: undefined }
    })

    await catchError(() => decorator(() => {})(ctx))

    const [failure] = output.json() as { next: unknown }[]
    expect(failure.next).toEqual([
      {
        command: '<COMMAND> legacy --help',
        argv: ['<COMMAND>', 'legacy', '--help'],
        when: 'Replace <COMMAND> with how you ran this CLI, to see the arguments of the command'
      }
    ])
  })

  test('the texts are translated by the i18n plugin', async () => {
    const output = captureOutput()
    const texts: Record<string, string> = {
      'err:json:not-supported': 'このコマンドは --json に対応していません',
      '_:json:next:help': 'コマンドの引数を確認する'
    }
    const translate = vi.fn<(key: string) => string>(key => texts[key] ?? key)
    const { ctx } = await createRun({
      args: {},
      values: {},
      commandPath: ['legacy'],
      extensions: { 'g:i18n': { translate } }
    })

    await catchError(() => decorator(() => {})(ctx))

    expect(output.json()).toEqual([
      {
        status: 'action_required',
        reason: 'json_not_supported',
        message: 'このコマンドは --json に対応していません',
        next: [
          {
            command: 'demo legacy --help',
            argv: ['demo', 'legacy', '--help'],
            when: 'コマンドの引数を確認する'
          }
        ]
      }
    ])
  })

  test.each([
    {
      title: 'the command declares a help argument of its own',
      args: {
        ...jsonArgs,
        name: { type: 'string', required: true },
        help: { type: 'boolean' }
      } satisfies Args,
      // the core leaves the global options that the command declares out of the ones in effect
      cliOptions: { globalOptions: new Map([['version', COMMON_ARGS.version]]) }
    },
    {
      title: 'the CLI renders no usage',
      args: { ...jsonArgs, name: { type: 'string', required: true } } satisfies Args,
      cliOptions: { renderUsage: null }
    }
  ])('has no next when --help does not show the help: $title', async ({ args, cliOptions }) => {
    const output = captureOutput()
    const validationError = new AggregateError([required('name')])
    const { ctx, reported } = await createRun({
      args,
      validationError,
      commandPath: ['deploy'],
      cliOptions
    })

    expect(await catchError(() => decorator(() => ({ ok: true }))(ctx))).toBe(validationError)

    const [failure] = output.json() as Record<string, unknown>[]
    expect(failure).toEqual({
      status: 'action_required',
      reason: 'required_option',
      message: "Option '--name' is required",
      data: {
        issues: [
          { field: '--name', reason: 'required_option', message: "Option '--name' is required" }
        ]
      }
    })
    expect(process.exitCode).toBe(1)
    expect(reported.has(validationError)).toBe(true)
  })
})

describe('--json given to a command that does not spread jsonArgs', () => {
  test('stops it before it runs, with json_not_supported', async () => {
    const output = captureOutput()
    const { ctx, reported } = await createRun({ args: {}, values: {}, commandPath: ['legacy'] })
    const run = vi.fn<() => void>()

    const error = await catchError(() => decorator(run)(ctx))

    expect(run).not.toHaveBeenCalled()
    expect(error).toBeInstanceOf(AggregateError)
    const [notSupported] = (error as AggregateError).errors
    expect(isJsonOutputError(notSupported)).toBe(true)
    expect((notSupported as JsonOutputError).code).toBe('err:json:not-supported')
    expect(output.json()).toEqual([
      {
        status: 'action_required',
        reason: 'json_not_supported',
        message: 'This command does not support --json',
        next: [
          {
            command: 'demo legacy --help',
            argv: ['demo', 'legacy', '--help'],
            when: SEE_THE_ARGUMENTS
          }
        ]
      }
    ])
    expect(process.exitCode).toBe(1)
    expect(reported.has(error as object)).toBe(true)
  })

  test('has no next when the command declares a help argument of its own', async () => {
    const output = captureOutput()
    const { ctx } = await createRun({
      args: { help: { type: 'boolean' } },
      values: {},
      commandPath: ['legacy'],
      cliOptions: { globalOptions: new Map([['version', COMMON_ARGS.version]]) }
    })

    await catchError(() => decorator(() => {})(ctx))

    expect(output.json()).toEqual([
      {
        status: 'action_required',
        reason: 'json_not_supported',
        message: 'This command does not support --json'
      }
    ])
  })

  test.each([
    { title: '--json=false', tokens: [{ ...JSON_TOKEN, value: 'false', inlineValue: true }] },
    {
      title: '--json after --',
      tokens: [
        { kind: 'option-terminator', index: 0 },
        { ...JSON_TOKEN, kind: 'positional', index: 1, value: '--json' }
      ]
    }
  ] satisfies { title: string; tokens: ArgToken[] }[])(
    'runs it for $title, which does not ask for JSON',
    async ({ tokens }) => {
      const output = captureOutput()
      const { ctx } = await createRun({ args: {}, values: {}, tokens })

      expect(await decorator(() => 'text')(ctx)).toBe('text')
      expect(output.stderr()).toEqual([])
    }
  )

  test('shows the help for --help, and the version for --version, as JSON, first', async () => {
    const output = captureOutput()
    const globalOptions = new Map(Object.entries(COMMON_ARGS))
    const renderUsage = () => Promise.resolve('USAGE: demo legacy')
    const help = await createRun({
      args: { ...COMMON_ARGS },
      values: { help: true },
      cliOptions: { globalOptions, renderUsage }
    })
    const version = await createRun({
      args: { ...COMMON_ARGS },
      values: { version: true },
      cliOptions: { globalOptions }
    })

    const helpJson = (await decorator(() => {})(help.ctx)) as string
    expect(JSON.parse(helpJson)).toMatchObject({
      help: { command: 'demo', argv: ['demo'], commands: [], arguments: [], json: false }
    })
    expect(await decorator(() => {})(version.ctx)).toBe('{"version":"1.0.0"}')
    expect(output.stdout()).toEqual([helpJson, '{"version":"1.0.0"}'])
    expect(output.stderr()).toEqual([])
  })

  test('with strict, the unknown --json is not reported as an unknown option', async () => {
    const output = captureOutput()
    const unknownJson = new ArgsValidationError('Unknown option: --json', {
      code: ArgsValidationErrorKeys.unknownOption,
      values: { rawName: '--json', name: 'json' }
    })
    const { ctx } = await createRun({
      args: {},
      values: {},
      validationError: new AggregateError([unknownJson])
    })

    await catchError(() => decorator(() => {})(ctx))

    expect((output.json() as { reason: string }[]).map(({ reason }) => reason)).toEqual([
      'json_not_supported'
    ])
  })

  test('with strict, an unknown command is reported without the unknown --json', async () => {
    const output = captureOutput()
    const { ctx } = await createRun({
      args: {},
      values: {},
      validationError: new AggregateError([
        new CommandNotFoundError('Command not found: lod', {
          code: CommandNotFoundErrorKeys.notFound,
          commandName: 'lod'
        }),
        new ArgsValidationError('Unknown option: --json', {
          code: ArgsValidationErrorKeys.unknownOption,
          values: { rawName: '--json', name: 'json' }
        })
      ])
    })

    await catchError(() => decorator(() => {})(ctx))

    const [failure] = output.json() as { reason: string; data: { issues: object[] } }[]
    expect(failure.reason).toBe('unknown_command')
    expect(failure.data.issues).toEqual([
      { field: 'lod', reason: 'unknown_command', message: 'Command not found: lod' }
    ])
  })

  test('with strict, --json=false is an unknown option for people, as before', async () => {
    const output = captureOutput()
    const renderValidationErrors = vi.fn<() => Promise<string>>(() =>
      Promise.resolve('Unknown option: --json')
    )
    const { ctx } = await createRun({
      args: {},
      values: {},
      tokens: [{ ...JSON_TOKEN, value: 'false', inlineValue: true }],
      validationError: new AggregateError([
        new ArgsValidationError('Unknown option: --json', {
          code: ArgsValidationErrorKeys.unknownOption,
          values: { rawName: '--json', name: 'json' }
        })
      ]),
      cliOptions: { renderValidationErrors }
    })

    await catchError(() => decorator(() => {})(ctx))

    expect(renderValidationErrors).toHaveBeenCalled()
    expect(output.stderr()).toEqual([
      'Unknown option: --json',
      `\n${SEE_THE_ARGUMENTS}:\n  demo --help`
    ])
  })
})
