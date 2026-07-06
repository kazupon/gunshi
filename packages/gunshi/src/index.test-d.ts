import { expectTypeOf, test } from 'vitest'
import { ArgsValidationError, ArgsValidationErrorKeys, isArgsValidationError } from './index.ts'

import type { ArgsValidationErrorCode } from './index.ts'

test('exports args validation error types', () => {
  expectTypeOf(ArgsValidationError).toBeConstructibleWith('fallback message')
  expectTypeOf(ArgsValidationErrorKeys.requiredOption).toEqualTypeOf<'err:arg:required-option'>()
  expectTypeOf<ArgsValidationErrorCode>().toEqualTypeOf<
    (typeof ArgsValidationErrorKeys)[keyof typeof ArgsValidationErrorKeys]
  >()
  expectTypeOf(isArgsValidationError).toBeFunction()
})
