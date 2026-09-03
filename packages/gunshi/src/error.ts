/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import {
  ArgsValidationErrorKeys,
  isArgsValidationError as isArgsValidationErrorInstance
} from 'args-tokens'

import type { ArgsValidationError } from 'args-tokens'

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
 * Error raised when a command cannot be resolved.
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
  }
}

/**
 * Check whether an error is a {@link CommandNotFoundError}.
 *
 * @param error - An unknown error
 * @returns `true` if the error is a {@link CommandNotFoundError}
 */
export function isCommandNotFoundError(error: unknown): error is CommandNotFoundError {
  return (
    error instanceof CommandNotFoundError ||
    // `instanceof` alone is not enough: `@gunshi/plugin` is bundled with its own copy of
    // this class (`noExternal: ['gunshi/plugin']`), so an error thrown by `gunshi` is never
    // an instance of the class a plugin imports. Fall back to a structural check on the
    // `name` brand the constructor sets, so the guard works across duplicated copies.
    (error instanceof Error &&
      error.name === 'CommandNotFoundError' &&
      'commandName' in error &&
      'candidates' in error)
  )
}

/**
 * Check whether an error is an {@link ArgsValidationError}.
 *
 * Prefer this over the `args-tokens` guard of the same name: it additionally matches
 * errors produced by a duplicated copy of the class, which is what plugins importing
 * from `@gunshi/plugin` receive.
 *
 * @param error - An unknown error
 * @returns `true` if the error is an {@link ArgsValidationError}
 */
export function isArgsValidationError(error: unknown): error is ArgsValidationError {
  return (
    isArgsValidationErrorInstance(error) ||
    (error instanceof Error &&
      error.name === 'ArgsValidationError' &&
      'code' in error &&
      'values' in error)
  )
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
