/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { pluginId as Global } from './types.ts'

import {
  ArgsValidationErrorKeys,
  hasPriorityValidationError,
  isArgsValidationError,
  isCommandError,
  isCommandNotFoundError,
  isCommandResolutionError,
  JsonOutputError,
  JsonOutputErrorKeys
} from '@gunshi/plugin'
import {
  DefaultResource,
  formatResource,
  log,
  namespacedId,
  resolveBuiltInKey,
  resolveJsonRequest
} from '@gunshi/shared'
import { writeUsage, writeUsageJson, writeVersion, writeVersionJson } from './extension.ts'
import {
  collectCauses,
  createNotSupportedFailure,
  createResultFailure,
  createRunFailure,
  createValidationFailure,
  messageOf,
  renderHelpHint
} from './json.ts'

import type {
  CommandDecorator,
  CommandError,
  DefaultGunshiParams,
  JsonOutputErrorCode
} from '@gunshi/plugin'
import type { GlobalExtension, Writer } from './extension.ts'
import type { JsonFailure } from './json.ts'
import type { PluginId } from './types.ts'

/**
 * The id of the i18n plugin, which translates the heading of the causes of a {@linkcode CommandError}.
 */
const I18n = namespacedId('i18n')

/**
 * The key of the built-in resource for the heading of the causes of a {@linkcode CommandError}.
 */
const CAUSED_BY = resolveBuiltInKey('CAUSEDBY')

/**
 * The key of the registry in which the core keeps, for the command context of each run, the set of the
 * errors that have been reported to the user. An error in the set tells `cli()` to end without
 * rejecting. The errors are frozen with the command context, so they are not marked themselves. The key
 * is a registered symbol, since `gunshi` and the plugins bundle their own copies.
 */
const REPORTED = Symbol.for('gunshi.reported')

/**
 * The key of the registry in which the core keeps the command contexts whose command has no `run`. The
 * key is a registered symbol, since `gunshi` and the plugins bundle their own copies.
 */
const WITHOUT_RUN = Symbol.for('gunshi.withoutRun')

const NOOP: Writer = () => {}

/**
 * Check if the command of a run has no `run`, by the registry that the core keeps.
 *
 * @param ctx - The command context of the run
 * @returns `true` if the core marked the context as the one of a command without `run`
 */
function isWithoutRun(ctx: object): boolean {
  const registry = (globalThis as unknown as Record<symbol, WeakSet<object> | undefined>)[
    WITHOUT_RUN
  ]
  return registry?.has(ctx) === true
}

/**
 * Mark an error as reported to the user, in the set that the core keeps for the run of the context.
 *
 * @param ctx - The command context of the run
 * @param error - The error that has been reported
 * @returns `true` if the error is marked, `false` if the core keeps no set for the run
 */
function markReported(ctx: object, error: object): boolean {
  const registry = (
    globalThis as unknown as Record<symbol, WeakMap<object, WeakSet<object>> | undefined>
  )[REPORTED]
  const reported = registry?.get(ctx)
  if (reported === undefined) {
    return false
  }
  reported.add(error)
  return true
}

/**
 * Set the exit code of the process, where the runtime has one (Node.js and Bun have `process`).
 * The core does not call the APIs of a runtime, so the plugin, which reports the errors, sets it.
 *
 * @param code - The exit code
 */
function setExitCode(code: number): void {
  const proc = (globalThis as { process?: { exitCode?: number | string } }).process
  if (proc != null && typeof proc === 'object') {
    proc.exitCode = code
  }
}

/**
 * The part of the stdout of the runtime that the plugin reads: Node.js and Bun have it.
 */
interface Stdout {
  isTTY?: boolean
  writableLength?: number
  once?: (event: string, listener: () => void) => unknown
  removeListener?: (event: string, listener: () => void) => unknown
}

function getStdout(): Stdout | undefined {
  const stdout = (globalThis as { process?: { stdout?: Stdout } }).process?.stdout
  return stdout != null && typeof stdout === 'object' ? stdout : undefined
}

/**
 * Wait until stdout has written what it holds, when it holds something: it drains, fails, or closes.
 *
 * NOTE(kazupon): Node.js writes to a pipe later, and `process.exit()` does not wait for it, so a large
 * JSON document is cut at 64KB or so when the app calls `process.exit()` after `cli()`. The wait has no
 * limit: a limit would cut the document only when the reader is slow. It does not keep the process
 * alive any longer than the write does.
 */
async function flushStdout(): Promise<void> {
  const stdout = getStdout()
  if (
    stdout === undefined ||
    typeof stdout.writableLength !== 'number' ||
    stdout.writableLength === 0 ||
    typeof stdout.once !== 'function'
  ) {
    return
  }
  const once = stdout.once.bind(stdout)
  await new Promise<void>(resolve => {
    const done = () => {
      for (const event of ['drain', 'error', 'close']) {
        stdout.removeListener?.(event, done)
      }
      resolve()
    }
    for (const event of ['drain', 'error', 'close']) {
      once(event, done)
    }
  })
}

/**
 * Translate the heading of the causes of a {@linkcode CommandError}, with the i18n plugin when it is
 * installed.
 *
 * NOTE(kazupon): the i18n plugin depends on this plugin, so this plugin cannot depend on it, and reads
 * its extension as the renderer plugin does. The i18n plugin translates a built-in key that the
 * resources of the app lack in English, and an older one returns the key itself: then the heading is
 * the English one of this plugin.
 *
 * @param extensions - The extensions of the command context
 * @returns The heading
 */
function translateCausedBy(extensions: object): string {
  const i18n = (extensions as Record<string, { translate?: (key: string) => string } | undefined>)[
    I18n
  ]
  const heading = i18n?.translate?.(CAUSED_BY)
  return heading && heading !== CAUSED_BY ? heading : DefaultResource.CAUSEDBY
}

/**
 * Render a {@linkcode CommandError} for the user: its message, followed by a `Caused by:` line for each
 * cause in the chain. The stack traces and the code are not rendered.
 *
 * @param error - The error
 * @param extensions - The extensions of the command context, to translate the heading of the causes
 * @returns The rendered error
 */
function renderCommandError(error: CommandError, extensions: object): string {
  const causes = collectCauses(error)
  if (causes.length === 0) {
    return error.message
  }
  const heading = translateCausedBy(extensions)
  return [error.message, ...causes.map(cause => `${heading}: ${cause}`)].join('\n')
}

/**
 * Create a {@linkcode JsonOutputError}, with the English message.
 *
 * @param code - The code of the error
 * @param values - The values of the message
 * @param cause - The cause of the error
 * @returns The error
 */
function createJsonOutputError(
  code: JsonOutputErrorCode,
  values?: Record<string, unknown>,
  cause?: unknown
): JsonOutputError {
  const message = formatResource((DefaultResource as Record<string, string>)[code], values) || code
  return new JsonOutputError(message, { code, values, cause })
}

/**
 * Leave out the unknown-option errors of a `--json` that asks for JSON, which `strict` reports for a
 * command without a `json` argument. `--json` is the option of gunshi, so it is not unknown to it: the
 * plugin reports `json_not_supported` for it instead, with or without `strict`.
 *
 * @param error - The aggregate error of the validation errors
 * @returns The aggregate error without them, or `undefined` when no error is left
 */
function withoutJsonOption(error: AggregateError | undefined): AggregateError | undefined {
  if (error === undefined) {
    return undefined
  }
  const errors = (error.errors as unknown[]).filter(
    err =>
      !(
        isArgsValidationError(err) &&
        err.code === ArgsValidationErrorKeys.unknownOption &&
        err.values.rawName === '--json'
      )
  )
  if (errors.length === error.errors.length) {
    return error
  }
  return errors.length === 0 ? undefined : new AggregateError(errors, error.message)
}

/**
 * Check whether the validation errors leave it unknown which command was meant: a command that is not
 * found, or a command line that cannot be resolved.
 *
 * @param error - The aggregate error of the validation errors
 * @returns `true` when one of the errors is about the command itself
 */
function leavesCommandUnknown(error: AggregateError | undefined): boolean {
  return (
    error?.errors.some(
      (err: unknown) => isCommandNotFoundError(err) || isCommandResolutionError(err)
    ) ?? false
  )
}

/**
 * Decorator function to extend the command with global options.
 *
 * @param baseRunner - The base command runner
 * @returns A command decorator that adds global options handling
 */
const decorator: CommandDecorator<{
  args: DefaultGunshiParams['args']
  extensions: Record<PluginId, GlobalExtension>
}> = baseRunner => async ctx => {
  /**
   * NOTE(kazupon): the core puts the globals still in effect on `env.globalOptions`. A command that
   * declares the same name — even with an identical schema — is not in that map, so `--version` /
   * `--help` belong to the command.
   */
  const {
    values,
    env: { globalOptions },
    extensions: {
      [Global]: { showValidationErrors }
    }
  } = ctx

  /**
   * NOTE(kazupon): whether `--json` asks for JSON. `'declared'` for a command that spreads `jsonArgs`,
   * by the resolved value of its `json`, and `'undeclared'` for a command without a `json` argument, by
   * the raw tokens. Either way, the errors are printed as JSON. A command with a `json` of its own
   * handles `--json` itself.
   */
  const request = resolveJsonRequest(ctx.args, values, ctx.tokens)
  const validationError =
    request === undefined ? ctx.validationError : withoutJsonOption(ctx.validationError)

  /**
   * Print a JSON error to stderr, and mark the error as reported, with the exit code.
   *
   * @param error - The error
   * @param failure - The JSON error
   * @param exitCode - The exit code
   */
  const printFailure = (error: unknown, failure: JsonFailure, exitCode: number): void => {
    console.error(JSON.stringify(failure))
    if (typeof error === 'object' && error !== null && markReported(ctx, error)) {
      setExitCode(exitCode)
    }
  }

  /**
   * NOTE(kazupon): when the plugin has shown the validation errors to the user, they have been
   * reported: the exit code is 1, and `cli()` ends without rejecting, as the other CLI libraries end
   * without a stack trace. They are still thrown, so that the `onErrorCommand` hook sees them. When
   * nothing was shown (`renderValidationErrors: null`, an empty message, or `usageSilent`), `cli()`
   * rejects with them, for the app to report them. So it does when the core keeps no set of reported
   * errors for the run, and then the exit code is left alone.
   *
   * With `--json`, they are printed as JSON, and the renderer of the validation errors is not called.
   * `renderValidationErrors: null` and `usageSilent` still leave them to the app.
   *
   * @param error - The aggregate error of the validation errors
   * @param createFailure - The function that creates the JSON error, for an error that is not one of
   * the validation errors
   */
  const report = async (
    error: AggregateError,
    createFailure: () => Promise<JsonFailure> = () => createValidationFailure(ctx, error)
  ): Promise<never> => {
    if (request !== undefined) {
      if (ctx.env.renderValidationErrors !== null && !ctx.env.usageSilent) {
        printFailure(error, await createFailure(), 1)
      }
      throw error
    }
    const message = await showValidationErrors(error)
    if (message && !ctx.env.usageSilent) {
      /**
       * NOTE(kazupon): the errors are followed by the command that shows the help of the command nearest
       * to what the user wrote, as `next` of the JSON error has it: the command itself for an argument
       * error, and the parent for an unknown command. The errors tell what is wrong, and the command tells
       * where to look next, which the message of an unknown command does not: it is the same at every
       * level. It is printed outside the renderer of the errors, so it comes after the hints that a plugin
       * such as the suggestion plugin adds, and after the errors that a renderer of the app renders.
       * `helpHint: false` leaves it out, for an app that points to the help in its own way.
       */
      const hint = ctx.env.helpHint === false ? undefined : await renderHelpHint(ctx, error)
      if (hint) {
        console.error(hint)
      }
      if (markReported(ctx, error)) {
        setExitCode(1)
      }
    }
    throw error
  }

  /**
   * NOTE(kazupon): `--help` and `--version` are answered before the argument errors, as what was asked
   * for: the help is what a user reads when the arguments are wrong. An unknown option of `strict` is one
   * of the argument errors then, as a missing or an invalid value is. An unknown command and a command
   * line that cannot be resolved are still reported first, since they leave it unknown which command was
   * meant, and the error points to the help of the nearest command.
   */
  const asked =
    (values.version && globalOptions?.has('version')) || (values.help && globalOptions?.has('help'))
  if (asked ? leavesCommandUnknown(validationError) : hasPriorityValidationError(validationError)) {
    return await report(validationError!)
  }

  /**
   * NOTE(kazupon): `--help` and `--version` print with `log`, not with `ctx.log`, which is silenced when
   * the command is asked for JSON: the help and the version are what was asked for. `usageSilent` still
   * silences them. `--help` comes before `--version` when both are given, whichever comes first on the
   * command line: the help is what tells how to use the command. With `--json`, they are printed as one
   * JSON document, so that stdout has the JSON only, whether the command spreads `jsonArgs` or not: they
   * are answered by gunshi, not by the command. A command with a `json` argument of its own takes
   * `--json` itself, and gets the text.
   */
  const write: Writer = ctx.env.usageSilent ? NOOP : log

  if (values.help && globalOptions?.has('help')) {
    return request === undefined ? await writeUsage(ctx, write) : await writeUsageJson(ctx, write)
  }

  if (values.version && globalOptions?.has('version')) {
    return request === undefined ? writeVersion(ctx, write) : writeVersionJson(ctx, write)
  }

  /**
   * NOTE(kazupon): `--json` given to a command that does not spread `jsonArgs` stops it before it runs,
   * as an argument error does, so that the caller does not take its text for JSON.
   */
  if (request === 'undeclared') {
    return await report(
      new AggregateError([createJsonOutputError(JsonOutputErrorKeys.notSupported)]),
      () => createNotSupportedFailure(ctx)
    )
  }

  // check for validation errors before executing command
  if (validationError) {
    return await report(validationError)
  }

  /**
   * NOTE(kazupon): a command that has sub-commands and no `run`, run without a sub-command, prints its
   * usage instead of nothing, as `--help` does: to stdout, with exit code 0, and `cli()` returns the
   * text. The CLI guidelines of Vercel say so: "A group invoked without an action shows its help and
   * exits `0`". It is printed where the command would run, so the argument errors are reported first.
   * With `--json`, stdout has the JSON only, so the usage is not printed, and a command that spreads
   * `jsonArgs` fails for its missing result as before.
   */
  if (request === undefined && ctx.omitted && isWithoutRun(ctx)) {
    return await writeUsage(ctx, write)
  }

  // normal command execution
  let result: Awaited<ReturnType<typeof baseRunner>>
  try {
    result = await baseRunner(ctx)
  } catch (error: unknown) {
    if (request === 'declared') {
      /**
       * NOTE(kazupon): with `--json`, any error of the command is printed as JSON, so that the caller
       * always gets JSON: the `code` of a `CommandError` is the reason, with the exit code of the error,
       * and any other error is `command_failed`, with exit code 1. It is printed with `usageSilent` too,
       * since it is not a text for people.
       */
      printFailure(error, createRunFailure(error), isCommandError(error) ? error.exitCode : 1)
    } else if (isCommandError(error) && !ctx.env.usageSilent) {
      /**
       * NOTE(kazupon): a `CommandError` thrown from the command, or from a decorator of another plugin,
       * is a failure that the command expects. It is reported as the validation errors are: the message
       * is printed to stderr without a stack trace, the exit code is the one of the error, and `cli()`
       * ends without rejecting. It is still thrown, so that the `onErrorCommand` hook sees it after the
       * exit code is set. With `usageSilent`, nothing is printed, and `cli()` rejects with it, for the
       * app to report it. Any other error is thrown as before, and `cli()` rejects with it.
       */
      console.error(renderCommandError(error, ctx.extensions))
      if (markReported(ctx, error)) {
        setExitCode(error.exitCode)
      }
    }
    throw error
  }

  if (request !== 'declared') {
    return result
  }

  /**
   * Report a result that cannot be printed as JSON, and throw the error. The command has finished, so the
   * message says so.
   *
   * @param code - The code of the error
   * @param messageValues - The values of the message
   * @param cause - The cause of the error
   */
  const fail = async (
    code:
      | typeof JsonOutputErrorKeys.invalidResult
      | typeof JsonOutputErrorKeys.unserializableResult,
    messageValues?: Record<string, unknown>,
    cause?: unknown
  ): Promise<never> => {
    const error = createJsonOutputError(code, messageValues, cause)
    printFailure(error, await createResultFailure(ctx, code, messageValues), 1)
    throw error
  }
  /**
   * NOTE(kazupon): the result is printed as one JSON document to stdout: indented on a terminal, on one
   * line otherwise. It is checked first, for the code written in JavaScript and the types cast away: it
   * must be an object, which `JSON.stringify` turns into an object.
   */
  if (result === null || typeof result !== 'object' || Array.isArray(result)) {
    return await fail(JsonOutputErrorKeys.invalidResult)
  }
  let text: string | undefined
  try {
    text = JSON.stringify(result, null, getStdout()?.isTTY === true ? 2 : undefined)
  } catch (error: unknown) {
    return await fail(
      JsonOutputErrorKeys.unserializableResult,
      { message: messageOf(error) },
      error
    )
  }
  // a `Date`, or an object whose `toJSON` returns a string or `undefined`, is not an object then
  if (typeof text !== 'string' || !text.startsWith('{')) {
    return await fail(JsonOutputErrorKeys.invalidResult)
  }
  log(text)
  await flushStdout()
}

export default decorator
