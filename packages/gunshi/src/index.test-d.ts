import { expectTypeOf, test } from 'vitest'
import {
  ArgsValidationError,
  ArgsValidationErrorKeys,
  CommandNotFoundError,
  CommandNotFoundErrorKeys,
  CommandResolutionError,
  CommandResolutionErrorKeys,
  isArgsValidationError,
  isCommandNotFoundError,
  isCommandResolutionError
} from './index.ts'

import type {
  ArgsValidationErrorCode,
  CommandNotFoundErrorCode,
  CommandResolutionErrorCode
} from './index.ts'

test('exports args validation error types', () => {
  expectTypeOf(ArgsValidationError).toBeConstructibleWith('fallback message')
  expectTypeOf(ArgsValidationErrorKeys.requiredOption).toEqualTypeOf<'err:arg:required-option'>()
  expectTypeOf<ArgsValidationErrorCode>().toEqualTypeOf<
    (typeof ArgsValidationErrorKeys)[keyof typeof ArgsValidationErrorKeys]
  >()
  expectTypeOf(isArgsValidationError).toBeFunction()
})

test('exports command not found error types', () => {
  expectTypeOf(CommandNotFoundError).toBeConstructibleWith('Command not found: deployx', {
    commandName: 'deployx'
  })
  expectTypeOf(CommandNotFoundErrorKeys.notFound).toEqualTypeOf<'err:cmd:not-found'>()
  expectTypeOf<CommandNotFoundErrorCode>().toEqualTypeOf<
    (typeof CommandNotFoundErrorKeys)[keyof typeof CommandNotFoundErrorKeys]
  >()
  expectTypeOf(isCommandNotFoundError).toBeFunction()
})

test('exports command resolution error types', () => {
  expectTypeOf(CommandResolutionError).toBeConstructibleWith('ambiguous', {
    code: 'err:cmd:ambiguous',
    commandPath: [],
    candidatePaths: [['deploy']]
  })
  expectTypeOf(CommandResolutionErrorKeys.ambiguous).toEqualTypeOf<'err:cmd:ambiguous'>()
  expectTypeOf<CommandResolutionErrorCode>().toEqualTypeOf<
    (typeof CommandResolutionErrorKeys)[keyof typeof CommandResolutionErrorKeys]
  >()
  expectTypeOf(isCommandResolutionError).toBeFunction()
})
