import { expect, test } from 'vitest'
import { ArgsValidationError, ArgsValidationErrorKeys, isArgsValidationError } from './index.ts'

test('exports args validation error runtime API', () => {
  const error = new ArgsValidationError('fallback message', {
    code: ArgsValidationErrorKeys.requiredOption,
    values: {
      displayName: "'--id'"
    }
  })

  expect(isArgsValidationError(error)).toBe(true)
  expect(error.code).toBe(ArgsValidationErrorKeys.requiredOption)
  expect(error.values).toEqual({
    displayName: "'--id'"
  })
})
