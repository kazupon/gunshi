import { ArgsValidationError, ArgsValidationErrorKeys } from 'args-tokens'
import { describe, expect, test } from 'vitest'
import {
  CommandNotFoundError,
  hasPriorityValidationError,
  isArgsValidationError,
  isCommandNotFoundError
} from './error.ts'

/**
 * Stand-ins for the duplicated class copies that `@gunshi/plugin` ships: it is bundled
 * with `noExternal: ['gunshi/plugin']`, so a plugin importing these guards holds a
 * different class object than the one `gunshi` throws with, and `instanceof` cannot match.
 */
class DuplicatedCommandNotFoundError extends Error {
  readonly commandName: string
  readonly candidates: readonly string[]
  constructor(message: string, commandName: string, candidates: readonly string[]) {
    super(message)
    this.name = 'CommandNotFoundError'
    this.commandName = commandName
    this.candidates = candidates
  }
}

class DuplicatedArgsValidationError extends Error {
  readonly code: string
  readonly values: Record<string, unknown>
  constructor(message: string, code: string, values: Record<string, unknown>) {
    super(message)
    this.name = 'ArgsValidationError'
    this.code = code
    this.values = values
  }
}

describe('isCommandNotFoundError', () => {
  test('matches an instance of the class', () => {
    const error = new CommandNotFoundError('not found', { commandName: 'lod' })
    expect(isCommandNotFoundError(error)).toBe(true)
  })

  test('matches an error from a duplicated copy of the class', () => {
    const error = new DuplicatedCommandNotFoundError('not found', 'lod', ['load'])
    expect(error instanceof CommandNotFoundError).toBe(false)
    expect(isCommandNotFoundError(error)).toBe(true)
  })

  test('does not match unrelated errors or non-errors', () => {
    expect(isCommandNotFoundError(new Error('boom'))).toBe(false)
    expect(isCommandNotFoundError({ name: 'CommandNotFoundError' })).toBe(false)
    expect(isCommandNotFoundError(undefined)).toBe(false)
  })
})

describe('isArgsValidationError', () => {
  test('matches an instance of the class', () => {
    const error = new ArgsValidationError('unknown option', {
      code: ArgsValidationErrorKeys.unknownOption,
      values: { name: 'alow-reload' }
    })
    expect(isArgsValidationError(error)).toBe(true)
  })

  test('matches an error from a duplicated copy of the class', () => {
    const error = new DuplicatedArgsValidationError(
      'unknown option',
      ArgsValidationErrorKeys.unknownOption,
      { name: 'alow-reload' }
    )
    expect(error instanceof ArgsValidationError).toBe(false)
    expect(isArgsValidationError(error)).toBe(true)
  })

  test('does not match unrelated errors or non-errors', () => {
    expect(isArgsValidationError(new Error('boom'))).toBe(false)
    expect(isArgsValidationError({ name: 'ArgsValidationError' })).toBe(false)
    expect(isArgsValidationError(undefined)).toBe(false)
  })
})

describe('hasPriorityValidationError', () => {
  test('detects a duplicated-copy unknown-option error', () => {
    const error = new AggregateError([
      new DuplicatedArgsValidationError('unknown', ArgsValidationErrorKeys.unknownOption, {})
    ])
    expect(hasPriorityValidationError(error)).toBe(true)
  })

  test('detects a duplicated-copy command-not-found error', () => {
    const error = new AggregateError([
      new DuplicatedCommandNotFoundError('not found', 'lod', ['load'])
    ])
    expect(hasPriorityValidationError(error)).toBe(true)
  })
})
