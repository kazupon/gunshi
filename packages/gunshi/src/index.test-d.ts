import { expectTypeOf, test } from 'vitest'
import {
  ArgsValidationError,
  ArgsValidationErrorKeys,
  CommandNotFoundError,
  CommandNotFoundErrorKeys,
  isArgsValidationError,
  isCommandNotFoundError
} from './index.ts'

import type { ArgsValidationErrorCode, CommandNotFoundErrorCode } from './index.ts'

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
