/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import {
  ArgsValidationError,
  ArgsValidationErrorKeys,
  isArgsValidationError as isBrandedArgsValidationError
} from 'args-tokens'

/**
 * Command not found error resource keys.
 */
export const CommandNotFoundErrorKeys = {
  notFound: 'err:cmd:not-found'
} as const

/**
 * Command not found error code.
 */
export type CommandNotFoundErrorCode =
  (typeof CommandNotFoundErrorKeys)[keyof typeof CommandNotFoundErrorKeys]

/**
 * Command resolution error resource keys.
 *
 * These errors describe an ambiguity or inconsistency while choosing a command from arguments.
 * They are kept separate from {@link CommandNotFoundError} so consumers can distinguish a typo
 * from an input whose command interpretation is not unique.
 */
export const CommandResolutionErrorKeys = {
  ambiguous: 'err:cmd:ambiguous',
  inconsistentOptions: 'err:cmd:inconsistent-options',
  lazySchemaMismatch: 'err:cmd:lazy-schema-mismatch'
} as const

/** Command resolution error code. */
export type CommandResolutionErrorCode =
  (typeof CommandResolutionErrorKeys)[keyof typeof CommandResolutionErrorKeys]

/**
 * The resource keys of the errors of the JSON output, which are the codes of {@link JsonOutputError}.
 */
export const JsonOutputErrorKeys = {
  notSupported: 'err:json:not-supported',
  invalidResult: 'err:json:invalid-result',
  unserializableResult: 'err:json:unserializable-result'
} as const

/**
 * The code of a {@link JsonOutputError}.
 */
export type JsonOutputErrorCode = (typeof JsonOutputErrorKeys)[keyof typeof JsonOutputErrorKeys]

/**
 * Options for {@link CommandNotFoundError}.
 */
export type CommandNotFoundErrorOptions = {
  /**
   * Localization resource key for command-not-found rendering.
   */
  code?: CommandNotFoundErrorCode
  /**
   * Values used when localizing the message.
   */
  values?: Record<string, unknown>
  /**
   * The command name that could not be resolved.
   */
  commandName: string
  /**
   * The names of the commands at the same level, which `@gunshi/plugin-suggestion` offers as "Did you mean".
   * An internal command is left out, as the help leaves it out.
   */
  candidates?: readonly string[]
  /**
   * Parent command path where resolution failed.
   */
  commandPath?: readonly string[]
  /**
   * Underlying cause.
   */
  cause?: unknown
}

/** Options for {@link CommandResolutionError}. */
export type CommandResolutionErrorOptions = {
  /** Localization resource key for the resolution failure. */
  code?: CommandResolutionErrorCode
  /** Values used when localizing the message. */
  values?: Record<string, unknown>
  /** Command path at which the resolution failed. */
  commandPath?: readonly string[]
  /** Candidate command paths considered by the resolver. */
  candidatePaths?: readonly (readonly string[])[]
  /** Underlying cause. */
  cause?: unknown
}

/**
 * Options for {@link CommandError}. All of them are optional.
 */
export type CommandErrorOptions = {
  /**
   * The name of the failure, for programs to read, such as `not_found`. snake_case is recommended.
   *
   * It is not printed to the user. With `--json`, it is the `reason` of the JSON error, as it is.
   */
  code?: string
  /**
   * The exit code of the process, an integer from 1 to 255. Defaults to 1, and any other value is
   * replaced with 1, since the command has failed.
   */
  exitCode?: number
  /**
   * The error that caused the failure.
   *
   * Its message is printed as is, on a `Caused by:` line after the message of the
   * {@link CommandError}, and so is the message of its own cause. With `--json`, the messages are in
   * `data.causes` of the JSON error. Do not pass an error whose message may contain a secret, such as
   * a token in a URL: write the message of the {@link CommandError} yourself instead.
   */
  cause?: unknown
}

/**
 * Brand that marks {@link CommandNotFoundError} instances.
 *
 * The brand is looked up in the global symbol registry with `Symbol.for`, so it stays
 * identical across bundled copies of gunshi (`gunshi`, `@gunshi/plugin`, `@gunshi/bone`)
 * and across realms. It lets {@link isCommandNotFoundError} recognize errors created by
 * another copy, where `instanceof` cannot match.
 */
const COMMAND_NOT_FOUND_ERROR_BRAND: unique symbol = Symbol.for('gunshi.CommandNotFoundError')

const COMMAND_RESOLUTION_ERROR_BRAND: unique symbol = Symbol.for('gunshi.CommandResolutionError')

const COMMAND_ERROR_BRAND: unique symbol = Symbol.for('gunshi.CommandError')

const JSON_OUTPUT_ERROR_BRAND: unique symbol = Symbol.for('gunshi.JsonOutputError')

/**
 * Error raised when a command cannot be resolved.
 *
 * Each instance carries a non-enumerable brand keyed by
 * `Symbol.for('gunshi.CommandNotFoundError')`, so that {@link isCommandNotFoundError}
 * recognizes it even when it was created by another bundled copy of gunshi.
 */
export class CommandNotFoundError extends Error {
  readonly code?: CommandNotFoundErrorCode
  readonly values: Record<string, unknown>
  readonly commandName: string
  readonly candidates: readonly string[]
  readonly commandPath: readonly string[]

  /**
   * Create a command-not-found error.
   *
   * @param message - Fallback error message
   * @param options - Command-not-found metadata
   */
  constructor(message: string, options: CommandNotFoundErrorOptions) {
    super(message, { cause: options.cause })
    this.name = 'CommandNotFoundError'
    this.code = options.code
    this.values = options.values || {}
    this.commandName = options.commandName
    this.candidates = options.candidates || []
    this.commandPath = options.commandPath || []
    // The brand is an own property so that the guard can reject a brand inherited from a
    // prototype, such as a polluted `Object.prototype`.
    Object.defineProperty(this, COMMAND_NOT_FOUND_ERROR_BRAND, {
      value: true,
      enumerable: false,
      writable: false,
      configurable: false
    })
  }
}

/**
 * Error raised when command routing cannot produce one consistent command.
 *
 * The own registry brand is the cross-bundle contract. Unlike the legacy command-not-found
 * guard, the new guard deliberately has no name-based fallback because this error type is new and
 * must not classify arbitrary errors from older versions.
 */
export class CommandResolutionError extends Error {
  readonly code?: CommandResolutionErrorCode
  readonly values: Record<string, unknown>
  readonly commandPath: readonly string[]
  readonly candidatePaths: readonly (readonly string[])[]

  /**
   * Create a command resolution error with structured routing metadata.
   *
   * @param message - Human-readable fallback message
   * @param options - Error code and command-routing metadata
   */
  constructor(message: string, options: CommandResolutionErrorOptions = {}) {
    super(message, { cause: options.cause })
    this.name = 'CommandResolutionError'
    this.code = options.code
    this.values = options.values || {}
    this.commandPath = options.commandPath || []
    this.candidatePaths = options.candidatePaths || []
    Object.defineProperty(this, COMMAND_RESOLUTION_ERROR_BRAND, {
      value: true,
      enumerable: false,
      writable: false,
      configurable: false
    })
  }
}

/**
 * Error for a failure that a command expects, such as a project that does not exist.
 *
 * When a command throws it from `run`, or a plugin throws it from a command decorator, the global
 * options plugin prints its message to stderr, followed by a `Caused by:` line for each cause,
 * without a stack trace. It sets the exit code of the process to {@link CommandError.exitCode},
 * and `cli()` resolves with `undefined`. `onErrorCommand` is still called with the error, after the
 * exit code is set, so the hook can change it.
 *
 * It is not printed, and `cli()` rejects with it, in these cases:
 *
 * - `usageSilent` is set, for the caller to report it
 * - it is thrown from a hook, while a plugin extends the command context, or while a lazy command
 *   loads, outside the command decorators
 * - the CLI runs without the global options plugin, as `gunshi/bone` does
 *
 * Any other error thrown from a command is not printed either, and `cli()` rejects with it.
 *
 * Each package of gunshi (`gunshi`, `@gunshi/plugin`, `@gunshi/definition`) bundles its own copy of
 * this class, so `instanceof` does not match an error from another copy. Use
 * {@link isCommandError} to tell it.
 *
 * @example
 * ```js
 * import { CommandError, define } from 'gunshi'
 *
 * export default define({
 *   name: 'show',
 *   args: { project: { type: 'positional', description: 'Project name' } },
 *   run: async ctx => {
 *     const project = await findProject(ctx.values.project)
 *     if (!project) {
 *       throw new CommandError(`Project ${ctx.values.project} not found`, { code: 'not_found' })
 *     }
 *     ctx.log(project.description)
 *   }
 * })
 * ```
 */
export class CommandError extends Error {
  /**
   * The name of the failure, for programs to read. See {@link CommandErrorOptions.code}.
   */
  readonly code?: string
  /**
   * The exit code of the process, an integer from 1 to 255.
   */
  readonly exitCode: number

  /**
   * Create an error for a failure that a command expects.
   *
   * @param message - The message printed to the user. It may have more than one line.
   * @param options - The code, the exit code and the cause of the failure
   */
  constructor(message: string, options: CommandErrorOptions = {}) {
    super(message, { cause: options.cause })
    this.name = 'CommandError'
    this.code = options.code
    this.exitCode = isFailureExitCode(options.exitCode) ? options.exitCode : 1
    Object.defineProperty(this, COMMAND_ERROR_BRAND, {
      value: true,
      enumerable: false,
      writable: false,
      configurable: false
    })
  }
}

/**
 * Check whether an error is a {@link CommandNotFoundError}.
 *
 * `instanceof` alone is not enough: `@gunshi/plugin` is bundled with its own copy of this
 * class (`noExternal: ['gunshi/plugin']`), so an error thrown by `gunshi` is never an instance
 * of the class a plugin imports. Errors from another copy are recognized through the
 * `Symbol.for('gunshi.CommandNotFoundError')` brand, which does not depend on `error.name`.
 *
 * @param error - An unknown error
 * @returns `true` if the error is a {@link CommandNotFoundError}
 */
export function isCommandNotFoundError(error: unknown): error is CommandNotFoundError {
  if (error instanceof CommandNotFoundError) {
    return true
  }
  // Consumers such as `@gunshi/plugin-renderer` and `@gunshi/plugin-suggestion` read these
  // properties, so an error from another copy must have the shape that this type predicate
  // promises, however it is recognized. The constructor of every copy sets all of them.
  if (!isRecord(error) || !hasCommandNotFoundErrorShape(error)) {
    return false
  }
  // Accept only an own brand, so that an inherited one cannot mark arbitrary objects.
  if (
    Object.hasOwn(error, COMMAND_NOT_FOUND_ERROR_BRAND) &&
    error[COMMAND_NOT_FOUND_ERROR_BRAND] === true
  ) {
    return true
  }
  // NOTE(kazupon): Structural fallback for copies of gunshi older than the brand, which
  // only set `name`. Drop it in the next major.
  return error instanceof Error && error.name === 'CommandNotFoundError'
}

/**
 * Check whether an error is a {@link CommandResolutionError}.
 *
 * @param error - An unknown error
 * @returns `true` when the error has the command-resolution brand and shape
 */
export function isCommandResolutionError(error: unknown): error is CommandResolutionError {
  if (error instanceof CommandResolutionError) {
    return true
  }
  if (!isRecord(error) || !hasCommandResolutionErrorShape(error)) {
    return false
  }
  return (
    Object.hasOwn(error, COMMAND_RESOLUTION_ERROR_BRAND) &&
    error[COMMAND_RESOLUTION_ERROR_BRAND] === true
  )
}

/**
 * Check whether an error is a {@link CommandError}.
 *
 * An error from another copy of gunshi is recognized through the `Symbol.for('gunshi.CommandError')`
 * brand. It is not recognized by `error.name`, so an error of the app that is also named
 * `CommandError` is not taken for one.
 *
 * @param error - An unknown error
 * @returns `true` if the error is a {@link CommandError}
 */
export function isCommandError(error: unknown): error is CommandError {
  if (error instanceof CommandError) {
    return true
  }
  // The global options plugin checks every error that a command throws, so the brand comes first:
  // reading the properties of any other error could run a getter that throws, and the error that
  // the command threw would be lost.
  if (
    !isRecord(error) ||
    !Object.hasOwn(error, COMMAND_ERROR_BRAND) ||
    error[COMMAND_ERROR_BRAND] !== true
  ) {
    return false
  }
  // the global options plugin prints `message` and sets the exit code to `exitCode`, so an error
  // from another copy must have the shape that this type predicate promises
  return hasCommandErrorShape(error)
}

/**
 * Options for {@link JsonOutputError}.
 */
export type JsonOutputErrorOptions = {
  /**
   * The code of the error, which is also the resource key of its message.
   */
  code: JsonOutputErrorCode
  /**
   * Values used when localizing the message.
   */
  values?: Record<string, unknown>
  /**
   * Underlying cause, such as the error of `JSON.stringify`.
   */
  cause?: unknown
}

/**
 * Error raised by the global options plugin for the JSON output, when a command is given `--json`.
 *
 * - `err:json:not-supported`: the command does not spread `jsonArgs`. It is raised before the command
 *   runs, and thrown in an `AggregateError`, as the argument errors are.
 * - `err:json:invalid-result`: the command finished, but did not return an object to output as JSON
 * - `err:json:unserializable-result`: the command finished, but its result cannot be converted to
 *   JSON, such as an object with a `BigInt`
 *
 * The plugin prints it as one line of JSON to stderr, and `cli()` resolves with `undefined`. For
 * `err:json:not-supported`, with `renderValidationErrors: null` or `usageSilent`, nothing is printed
 * and `cli()` rejects with the `AggregateError`, as it does for the argument errors.
 *
 * Use {@link isJsonOutputError} to tell it, since each package bundles its own copy of this class.
 */
export class JsonOutputError extends Error {
  /**
   * The code of the error, which is also the resource key of its message.
   */
  readonly code: JsonOutputErrorCode
  /**
   * Values used when localizing the message.
   */
  readonly values: Record<string, unknown>

  /**
   * Create an error of the JSON output.
   *
   * @param message - Fallback error message
   * @param options - The code of the error, and the values of its message
   */
  constructor(message: string, options: JsonOutputErrorOptions) {
    super(message, { cause: options.cause })
    this.name = 'JsonOutputError'
    this.code = options.code
    this.values = options.values || {}
    Object.defineProperty(this, JSON_OUTPUT_ERROR_BRAND, {
      value: true,
      enumerable: false,
      writable: false,
      configurable: false
    })
  }
}

/**
 * Check whether an error is a {@link JsonOutputError}.
 *
 * An error from another copy of gunshi is recognized through the
 * `Symbol.for('gunshi.JsonOutputError')` brand, not by `error.name`.
 *
 * @param error - An unknown error
 * @returns `true` if the error is a {@link JsonOutputError}
 */
export function isJsonOutputError(error: unknown): error is JsonOutputError {
  if (error instanceof JsonOutputError) {
    return true
  }
  // the brand comes first, as for `isCommandError`: the error may be any error of a command
  if (
    !isRecord(error) ||
    !Object.hasOwn(error, JSON_OUTPUT_ERROR_BRAND) ||
    error[JSON_OUTPUT_ERROR_BRAND] !== true
  ) {
    return false
  }
  return hasJsonOutputErrorShape(error)
}

/**
 * Check whether an error is an {@link ArgsValidationError}.
 *
 * Prefer this over the `args-tokens` guard of the same name. Both recognize errors from another
 * bundled copy through the `Symbol.for('args-tokens.ArgsValidationError')` brand that
 * `args-tokens` 0.29.0 or later sets, including subclasses such as `ArgResolveError` that
 * override `name` with the argument name. This guard additionally:
 *
 * - recognizes direct `ArgsValidationError` instances from copies bundling `args-tokens`
 *   older than 0.29.0, which do not set the brand
 * - checks that `code` and `values` of an error from another copy have the expected types
 *
 * The guard narrows only to {@link ArgsValidationError}: across copies,
 * `instanceof ArgResolveError` still fails, so do not rely on `type` or `schema` for such errors.
 *
 * @param error - An unknown error
 * @returns `true` if the error is an {@link ArgsValidationError}
 */
export function isArgsValidationError(error: unknown): error is ArgsValidationError {
  if (error instanceof ArgsValidationError) {
    return true
  }
  // Consumers such as `@gunshi/plugin-renderer` use `code` as a resource key and read `values`,
  // so an error from another copy must have the shape that this type predicate promises.
  if (!isRecord(error) || !hasArgsValidationErrorShape(error)) {
    return false
  }
  // `args-tokens` checks its registry brand, which also covers subclasses from another copy.
  if (isBrandedArgsValidationError(error)) {
    return true
  }
  // NOTE(kazupon): Structural fallback for copies bundling `args-tokens` older than 0.29.0,
  // which do not set the brand. It matches only direct `ArgsValidationError` instances,
  // because `ArgResolveError` overrides `name`. Drop it in the next major.
  return error instanceof Error && error.name === 'ArgsValidationError'
}

function isRecord(value: unknown): value is Record<PropertyKey, unknown> {
  return typeof value === 'object' && value !== null
}

function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string')
}

/**
 * Check whether `code` is an own or inherited property that is a string or `undefined`.
 *
 * Constructors always assign `code`, even when the option is omitted.
 *
 * @param error - An error from another copy
 * @returns `true` if `code` has the expected type
 */
function hasOptionalStringCode(error: Record<PropertyKey, unknown>): boolean {
  return 'code' in error && (error.code === undefined || typeof error.code === 'string')
}

function hasCommandNotFoundErrorShape(error: Record<PropertyKey, unknown>): boolean {
  return (
    hasOptionalStringCode(error) &&
    isRecord(error.values) &&
    typeof error.commandName === 'string' &&
    isStringArray(error.candidates) &&
    isStringArray(error.commandPath)
  )
}

function hasCommandResolutionErrorShape(error: Record<PropertyKey, unknown>): boolean {
  return (
    hasOptionalStringCode(error) &&
    isRecord(error.values) &&
    isStringArray(error.commandPath) &&
    Array.isArray(error.candidatePaths) &&
    error.candidatePaths.every(path => isStringArray(path))
  )
}

function hasArgsValidationErrorShape(error: Record<PropertyKey, unknown>): boolean {
  return hasOptionalStringCode(error) && isRecord(error.values)
}

function hasCommandErrorShape(error: Record<PropertyKey, unknown>): boolean {
  return (
    hasOptionalStringCode(error) &&
    typeof error.message === 'string' &&
    isFailureExitCode(error.exitCode)
  )
}

function hasJsonOutputErrorShape(error: Record<PropertyKey, unknown>): boolean {
  return (
    (Object.values(JsonOutputErrorKeys) as unknown[]).includes(error.code) && isRecord(error.values)
  )
}

/**
 * Check whether a value is an exit code of a failure: an integer from 1 to 255.
 *
 * @param value - The value to check
 * @returns `true` if the value is an exit code of a failure
 */
export function isFailureExitCode(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 1 && (value as number) <= 255
}

/**
 * Check whether validation errors must stop the command before it runs: an unknown command, a command
 * line that cannot be resolved, an unknown option of `strict`, or a positional argument that the command
 * does not take, of `strictPositionals`. The global options plugin reports them before `--help` and
 * `--version`, except an unknown option and a positional argument that the command does not take:
 * `--help` and `--version` are answered before them, as they are before the other validation errors.
 *
 * @param error - An aggregate validation error
 * @returns `true` if the validation error must be handled with priority
 */
export function hasPriorityValidationError(error: AggregateError | undefined): boolean {
  return (
    error?.errors.some(
      (error: unknown) =>
        isCommandNotFoundError(error) ||
        isCommandResolutionError(error) ||
        (isArgsValidationError(error) &&
          (error.code === ArgsValidationErrorKeys.unknownOption ||
            error.code === ArgsValidationErrorKeys.unexpectedPositional))
    ) ?? false
  )
}
