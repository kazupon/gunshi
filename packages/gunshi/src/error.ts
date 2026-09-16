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
   * Command names available at the same level.
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

/**
 * Brand that marks {@link CommandNotFoundError} instances.
 *
 * The brand is looked up in the global symbol registry with `Symbol.for`, so it stays
 * identical across bundled copies of gunshi (`gunshi`, `@gunshi/plugin`, `@gunshi/bone`)
 * and across realms. It lets {@link isCommandNotFoundError} recognize errors created by
 * another copy, where `instanceof` cannot match.
 */
const COMMAND_NOT_FOUND_ERROR_BRAND: unique symbol = Symbol.for('gunshi.CommandNotFoundError')

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

function hasArgsValidationErrorShape(error: Record<PropertyKey, unknown>): boolean {
  return hasOptionalStringCode(error) && isRecord(error.values)
}

/**
 * Check whether validation errors should be handled before version, help, or command execution.
 *
 * @param error - An aggregate validation error
 * @returns `true` if the validation error must be handled with priority
 */
export function hasPriorityValidationError(error: AggregateError | undefined): boolean {
  return (
    error?.errors.some(
      (error: unknown) =>
        isCommandNotFoundError(error) ||
        (isArgsValidationError(error) && error.code === ArgsValidationErrorKeys.unknownOption)
    ) ?? false
  )
}
