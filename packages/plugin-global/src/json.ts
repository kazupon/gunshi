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
  isJsonArg,
  localizeBuiltinResource,
  localizeValidationError,
  namespacedId,
  resolveArgKey,
  resolveBuiltInKey,
  resolveDisplayName,
  resolveKey
} from '@gunshi/shared'
import { isWithoutRun } from './runner.ts'

import type { ArgSchema, CommandContext, DefaultGunshiParams } from '@gunshi/plugin'

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

/**
 * An option, which `options` of the help as JSON lists.
 */
interface JsonHelpOption {
  /**
   * The name of the option, as it is written on the command line: `--dry-run`.
   */
  name: string
  /**
   * The short name of the option: `-n`, or `null`.
   */
  short: string | null
  /**
   * The description of the option, as the help shows it, or `null`.
   */
  description: string | null
  /**
   * The type of the value: `string`, `number`, `boolean`, `enum`, or `custom`.
   */
  type: string
  /**
   * What to write for the value, as the help shows it: `<name>`. `null` for a boolean, which takes no
   * value.
   */
  value: string | null
  /**
   * Whether the option must be given.
   */
  required: boolean
  /**
   * Whether the option may be given more than once.
   */
  multiple: boolean
  /**
   * The value that the option has when it is not given, or `null`.
   */
  default: unknown
  /**
   * The values that the option takes, or `null` when it takes any.
   */
  choices: unknown[] | null
  /**
   * Whether `--no-` in front of the name turns the option off.
   */
  negatable: boolean
  /**
   * Whether the option is a global option, which the commands take: `--help` and `--version`.
   */
  global: boolean
}

/**
 * A positional argument, which `arguments` of the help as JSON lists.
 */
interface JsonHelpArgument {
  /**
   * The name of the argument.
   */
  name: string
  /**
   * The description of the argument, as the help shows it, or `null`.
   */
  description: string | null
  /**
   * Whether the argument must be given.
   */
  required: boolean
  /**
   * Whether the argument takes the rest of the positional arguments.
   */
  multiple: boolean
}

/**
 * A sub-command, which `commands` of the help as JSON lists.
 */
interface JsonHelpCommand {
  /**
   * The name of the sub-command, which follows the command line of the help.
   */
  name: string
  /**
   * The description of the sub-command, as the help shows it, or `null`.
   */
  description: string | null
}

/**
 * The document that the global options plugin prints to stdout for `--help` with `--json`. In it, an
 * empty list is `[]`, and a value that is not there is `null`, so that every key is always there.
 */
export interface JsonHelp {
  /**
   * The help of the command.
   */
  help: {
    /**
     * The command line of the command, to read: `demo deploy`. Without the name of the CLI, it starts
     * with `<COMMAND>`.
     */
    command: string
    /**
     * The arguments of the command line, to run.
     */
    argv: string[]
    /**
     * The description of the command, or `null`.
     */
    description: string | null
    /**
     * Whether the command runs by itself, without a sub-command: it has `run`. A command with sub-commands
     * and no `run` prints its usage instead.
     */
    runnable: boolean
    /**
     * The sub-commands, when the command is a group of them, as the help lists them.
     */
    commands: JsonHelpCommand[]
    /**
     * The positional arguments, in order.
     */
    arguments: JsonHelpArgument[]
    /**
     * The options, the global options included.
     */
    options: JsonHelpOption[]
    /**
     * Whether the command prints its result as JSON with `--json`: it spreads `jsonArgs`.
     */
    json: boolean
  }
}

/**
 * The id of the usage renderer plugin. The help as JSON takes the descriptions and the sub-commands
 * from its extension, so that they are the ones of the help, translated by the i18n plugin.
 */
const RENDERER = namespacedId('renderer')

/**
 * What the help as JSON uses of the extension of the usage renderer plugin.
 */
interface RendererExtension {
  text: (key: string) => Promise<string>
  loadCommands: () => Promise<{ name?: string; entry?: boolean }[]>
  localizeCommandDescription: (cmd: unknown) => Promise<string>
}

/**
 * Create the help as JSON: the command, its sub-commands, its positional arguments, and its options,
 * from the metadata that the help is rendered from. A hidden argument and an internal command are left
 * out, as the help leaves them out.
 *
 * @param ctx - The command context
 * @returns The help as JSON
 */
export async function createHelpDocument(ctx: Context): Promise<JsonHelp> {
  const renderer = (ctx.extensions as Record<string, unknown> | undefined)?.[RENDERER] as
    | RendererExtension
    | undefined
  const describe = async (key: string, fallback?: string): Promise<string | null> =>
    (renderer ? await renderer.text(key) : '') || fallback || null

  const options: JsonHelpOption[] = []
  const positionals: JsonHelpArgument[] = []
  for (const [key, schema] of Object.entries(ctx.args) as [string, ArgSchema][]) {
    if (schema.hidden) {
      continue
    }
    const description = await describe(resolveArgKey(key, ctx.name), schema.description)
    if (schema.type === 'positional') {
      positionals.push({
        name: key,
        description,
        required: isRequiredPositional(schema),
        multiple: schema.multiple === true
      })
      continue
    }
    const name = resolveDisplayName(key, schema, ctx.toKebab)
    options.push({
      name: `--${name}`,
      short: schema.short ? `-${schema.short}` : null,
      description,
      type: schema.type,
      value: schema.type === 'boolean' ? null : `<${name}>`,
      required: schema.required === true,
      multiple: schema.multiple === true,
      default: isJsonValue(schema.default) ? schema.default : null,
      choices: schema.type === 'enum' && Array.isArray(schema.choices) ? [...schema.choices] : null,
      negatable: schema.type === 'boolean' && schema.negatable === true,
      global: ctx.env.globalOptions?.has(key) === true
    })
  }

  const commands: JsonHelpCommand[] = []
  if (ctx.omitted && renderer) {
    for (const cmd of await renderer.loadCommands()) {
      if (cmd.entry || !cmd.name) {
        continue
      }
      commands.push({
        name: cmd.name,
        description: (await renderer.localizeCommandDescription(cmd)) || null
      })
    }
  }

  const argv = [ctx.env.name || '<COMMAND>', ...ctx.commandPath]
  return {
    help: {
      command: argv.join(' '),
      argv,
      description: await describe(resolveKey('description', ctx.name), ctx.description),
      /**
       * NOTE(kazupon): the help for people tells it by listing the command first among its sub-commands,
       * as `[app]`, only when it has `run` (#866), and the document lists the sub-commands only. It is
       * told by the mark of the core, which makes a command with sub-commands and no `run` print its usage
       * when it runs: the mark is set for the command that was loaded, a lazy one included.
       */
      runnable: !isWithoutRun(ctx),
      commands,
      arguments: positionals,
      options,
      json: isJsonArg(ctx.args.json)
    }
  }
}

/**
 * Check whether a positional argument must be given, as the help shows it: unless the schema says
 * otherwise, an argument without a default must be given.
 *
 * @param schema - The schema of the positional argument
 * @returns `true` when the argument must be given
 */
function isRequiredPositional(schema: ArgSchema): boolean {
  if (schema.required === true || schema.required === false) {
    return schema.required
  }
  return schema.default == null
}

/**
 * Check whether a value can be written in JSON as it is.
 *
 * @param value - The value
 * @returns `true` when the value is written in JSON
 */
function isJsonValue(value: unknown): boolean {
  if (value === undefined) {
    return false
  }
  try {
    return JSON.stringify(value) !== undefined
  } catch {
    return false
  }
}
