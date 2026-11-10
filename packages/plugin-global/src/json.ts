/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import {
  ArgsValidationErrorKeys,
  CommandNotFoundErrorKeys,
  CommandResolutionErrorKeys,
  isArgsValidationError,
  isCommandError,
  isCommandNotFoundError,
  isCommandResolutionError,
  JsonOutputErrorKeys
} from '@gunshi/plugin'
import {
  localizeBuiltinResource,
  localizeValidationError,
  resolveBuiltInKey,
  resolveDisplayName
} from '@gunshi/shared'

import type { CommandContext, DefaultGunshiParams } from '@gunshi/plugin'

/**
 * A command to run next, which `next` of a JSON error lists.
 */
interface JsonNext {
  /**
   * The command line, to read.
   */
  command: string
  /**
   * The arguments of the command line, to run.
   */
  argv: string[]
  /**
   * When to run it.
   */
  when: string
}

/**
 * One of the argument errors, which `data.issues` of a JSON error lists.
 */
interface JsonIssue {
  /**
   * How the user wrote the argument on the command line: `--dry-run`, `file`, or an unknown command.
   * It is left out for an error that no argument caused, such as an ambiguous command.
   */
  field?: string
  /**
   * The reason of the error, in snake_case.
   */
  reason: string
  /**
   * The message of the error, as gunshi shows it to people.
   */
  message: string
}

/**
 * The line of JSON that the global options plugin prints to stderr when a command fails with `--json`.
 */
export interface JsonFailure {
  /**
   * `action_required` when the command stopped before it ran and the input can be fixed, and `error`
   * when the command failed while it ran or after it.
   */
  status: 'action_required' | 'error'
  /**
   * The reason of the error, for programs to read.
   */
  reason: string
  /**
   * The message of the error, for people to read.
   */
  message: string
  /**
   * The commands to run next. Only for `action_required`, when `--help` shows the help of the command.
   */
  next?: JsonNext[]
  /**
   * The argument errors, and the messages of the causes.
   */
  data?: {
    issues?: JsonIssue[]
    causes?: string[]
  }
}

type Context = Readonly<CommandContext<DefaultGunshiParams>>

/**
 * The reasons that are not derived from the codes by the rule: they would read as something else.
 */
const RENAMED_REASONS: ReadonlyMap<string, string> = new Map([
  // a conflict with a resource that exists, in the reasons of Vercel's guidelines
  [ArgsValidationErrorKeys.conflict, 'conflicting_options'],
  // `not_found` is a resource that is not found
  [CommandNotFoundErrorKeys.notFound, 'unknown_command'],
  [CommandResolutionErrorKeys.ambiguous, 'ambiguous_command'],
  // `not_supported` does not tell what is not supported
  [JsonOutputErrorKeys.notSupported, 'json_not_supported']
])

/**
 * Convert the code of an error of gunshi to the `reason` of a JSON error: without the prefix, in
 * snake_case, such as `required_option` for `err:arg:required-option`. So the reasons are a contract
 * apart from the keys of the resources.
 *
 * @param code - The code of the error
 * @returns The reason
 */
function toReason(code: string): string {
  return RENAMED_REASONS.get(code) ?? code.replace(/^err:[^:]+:/, '').replaceAll('-', '_')
}

/**
 * Create the JSON error of the validation errors: the argument errors, an unknown command, and a command
 * that cannot be resolved. They stop the command before it runs.
 *
 * @param ctx - The command context
 * @param error - The aggregate error of the validation errors
 * @returns The JSON error
 */
export async function createValidationFailure(
  ctx: Context,
  error: AggregateError
): Promise<JsonFailure> {
  const errors = error.errors as Error[]
  const issues: JsonIssue[] = []
  for (const err of errors) {
    issues.push(await createIssue(ctx, err))
  }
  const [single] = issues.length === 1 ? issues : []
  const next = await createNext(ctx, resolveCommandPath(ctx, errors))
  return {
    status: 'action_required',
    reason: single ? single.reason : 'invalid_arguments',
    message: single
      ? single.message
      : await localizeBuiltinResource(ctx, resolveBuiltInKey('json:invalid-arguments'), {
          count: issues.length
        }),
    ...(next ? { next } : {}),
    data: { issues }
  }
}

/**
 * Render the lines that follow the validation errors for people: the command that shows the help of the
 * command nearest to what the user wrote, with what it is for, which `next` of the JSON error has too.
 * They start with an empty line, which parts them from the errors.
 *
 * @param ctx - The command context
 * @param error - The aggregate error of the validation errors
 * @returns The lines, or `undefined` when `--help` does not show the help of the command
 */
export async function renderHelpHint(
  ctx: Context,
  error: AggregateError
): Promise<string | undefined> {
  const next = await createNext(ctx, resolveCommandPath(ctx, error.errors as Error[]))
  if (next === undefined) {
    return undefined
  }
  const [{ command, when }] = next
  return ['', `${when}:`, `  ${command}`].join('\n')
}

/**
 * Create the JSON error of `--json` given to a command that does not spread `jsonArgs`.
 *
 * @param ctx - The command context
 * @returns The JSON error
 */
export async function createNotSupportedFailure(ctx: Context): Promise<JsonFailure> {
  const next = await createNext(ctx, ctx.commandPath)
  return {
    status: 'action_required',
    reason: toReason(JsonOutputErrorKeys.notSupported),
    message: await localizeBuiltinResource(ctx, JsonOutputErrorKeys.notSupported),
    ...(next ? { next } : {})
  }
}

/**
 * Create the JSON error of a result that cannot be printed as JSON.
 *
 * @param ctx - The command context
 * @param code - The code of the error
 * @param values - The values of the message
 * @returns The JSON error
 */
export async function createResultFailure(
  ctx: Context,
  code: typeof JsonOutputErrorKeys.invalidResult | typeof JsonOutputErrorKeys.unserializableResult,
  values?: Record<string, unknown>
): Promise<JsonFailure> {
  return {
    status: 'error',
    reason: toReason(code),
    message: await localizeBuiltinResource(ctx, code, values)
  }
}

/**
 * Create the JSON error of an error that the command threw. The `code` of a `CommandError` is its
 * reason, as it is: it is a contract of the app. Any other error is `command_failed`, even with a
 * `code`, such as `ENOENT`, that the app does not promise.
 *
 * @param error - The thrown error
 * @returns The JSON error
 */
export function createRunFailure(error: unknown): JsonFailure {
  const causes = collectCauses(error)
  let message: string
  try {
    message = messageOf(error)
  } catch {
    // the error may be any value, with a getter that throws
    message = Object.prototype.toString.call(error)
  }
  return {
    status: 'error',
    reason: (isCommandError(error) ? error.code : undefined) ?? 'command_failed',
    message,
    ...(causes.length > 0 ? { data: { causes } } : {})
  }
}

/**
 * Collect the messages of the causes of an error, from the outermost.
 *
 * A cause may be any value: a value without a message, such as a string, is converted to a string. A
 * cause may point back to an error in the chain, and may have a getter that throws: the chain ends
 * there.
 *
 * @param error - The error
 * @returns The messages of the causes
 */
export function collectCauses(error: unknown): string[] {
  const causes: string[] = []
  const seen = new Set<unknown>([error])
  let cause: unknown
  try {
    cause =
      typeof error === 'object' && error !== null ? (error as { cause?: unknown }).cause : undefined
  } catch {
    return causes
  }
  while (cause != null && !seen.has(cause)) {
    seen.add(cause)
    try {
      causes.push(messageOf(cause))
      cause = typeof cause === 'object' ? (cause as { cause?: unknown }).cause : undefined
    } catch {
      break
    }
  }
  return causes
}

/**
 * Get the message of an error, or of a cause, which may be any value. A value without a message, such as
 * a string, is converted to a string.
 *
 * @param value - The error or the cause
 * @returns The message
 * @throws {unknown} The error of a getter of `message` that throws
 */
export function messageOf(value: unknown): string {
  const message = (value as { message?: unknown } | null | undefined)?.message
  if (typeof message === 'string' && message !== '') {
    return message
  }
  try {
    return String(value)
  } catch {
    // an object without a prototype has no `toString`
    return Object.prototype.toString.call(value)
  }
}

async function createIssue(ctx: Context, error: Error): Promise<JsonIssue> {
  const field = resolveField(ctx, error)
  const reason = resolveReason(error)
  const message = await localizeValidationError(ctx, error)
  return field === undefined ? { reason, message } : { field, reason, message }
}

function resolveReason(error: Error): string {
  if (isCommandNotFoundError(error)) {
    return toReason(error.code ?? CommandNotFoundErrorKeys.notFound)
  }
  const code = (error as { code?: unknown }).code
  return typeof code === 'string' ? toReason(code) : 'invalid_arguments'
}

/**
 * Resolve how the user wrote the argument of an error on the command line: the long form of an option,
 * the name of a positional argument, an unknown option as it is typed, and an unknown command as it is
 * typed. So an agent can use it as it is.
 *
 * @param ctx - The command context
 * @param error - A validation error
 * @returns The field, or `undefined` for an error that no argument caused
 */
function resolveField(ctx: Context, error: Error): string | undefined {
  if (isCommandNotFoundError(error)) {
    return error.commandName
  }
  if (!isArgsValidationError(error)) {
    return undefined
  }
  const { name, rawName } = error.values
  if (error.code === ArgsValidationErrorKeys.unknownOption) {
    return typeof rawName === 'string' ? rawName : undefined
  }
  if (typeof name !== 'string' || !Object.hasOwn(ctx.args, name)) {
    return undefined
  }
  const schema = ctx.args[name]
  return schema.type === 'positional' ? name : `--${resolveDisplayName(name, schema, ctx.toKebab)}`
}

/**
 * Resolve the path of the command whose help `next` points to: the command that is nearest to what the
 * user wrote. For an unknown command, and for a command that cannot be resolved, it is the command
 * under which the resolution failed.
 *
 * @param ctx - The command context
 * @param errors - The validation errors
 * @returns The command path
 */
function resolveCommandPath(ctx: Context, errors: Error[]): readonly string[] {
  for (const error of errors) {
    if (isCommandNotFoundError(error) || isCommandResolutionError(error)) {
      return error.commandPath
    }
  }
  return ctx.commandPath
}

/**
 * Check whether `--help` shows the help of the command of the context.
 *
 * NOTE(kazupon): a command may declare a `help` argument of its own, which wins over the global one, and
 * then `--help` is an argument of the command. Without a usage renderer, `--help` prints nothing. Either
 * way, the help is not a way to fix the input. For an unknown command, the context is the one of its
 * parent, whose help is pointed to.
 *
 * @param ctx - The command context
 * @returns `true` when the global `--help` is in effect for the command, and the CLI renders a usage
 */
function hasHelp(ctx: Context): boolean {
  return ctx.env.globalOptions?.has('help') === true && ctx.env.renderUsage != null
}

/**
 * Create the `next` of a JSON error: the help of a command. Without the name of the CLI, the command
 * line has `<COMMAND>` for its name, and `when` tells to replace it, since the agent knows how it ran
 * the CLI.
 *
 * @param ctx - The command context
 * @param commandPath - The path of the command
 * @returns The `next`, or `undefined` when `--help` does not show the help of the command
 */
async function createNext(
  ctx: Context,
  commandPath: readonly string[]
): Promise<JsonNext[] | undefined> {
  if (!hasHelp(ctx)) {
    return undefined
  }
  const name = ctx.env.name
  const argv = [name || '<COMMAND>', ...commandPath, '--help']
  const when = await localizeBuiltinResource(
    ctx,
    resolveBuiltInKey(name ? 'json:next:help' : 'json:next:help-placeholder')
  )
  return [{ command: argv.join(' '), argv, when }]
}
