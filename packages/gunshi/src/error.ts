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
 * Brand that marks {@link CommandNotFoundError} instances.
 *
 * The brand is looked up in the global symbol registry with `Symbol.for`, so it stays
 * identical across bundled copies of gunshi (`gunshi`, `@gunshi/plugin`, `@gunshi/bone`)
 * and across realms. It lets {@link isCommandNotFoundError} recognize errors created by
 * another copy, where `instanceof` cannot match.
 */
const COMMAND_NOT_FOUND_ERROR_BRAND: unique symbol = Symbol.for('gunshi.CommandNotFoundError')

const COMMAND_RESOLUTION_ERROR_BRAND: unique symbol = Symbol.for('gunshi.CommandResolutionError')

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

/** Check whether an error is a {@link CommandResolutionError}. */
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
        isCommandResolutionError(error) ||
        (isArgsValidationError(error) && error.code === ArgsValidationErrorKeys.unknownOption)
    ) ?? false
  )
}
