import { expect, test } from 'vitest'
import {
  ArgsValidationError,
  ArgsValidationErrorKeys,
  CommandNotFoundError,
  CommandNotFoundErrorKeys,
  isArgsValidationError,
  isCommandNotFoundError
} from './index.ts'

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

test('exports command not found error runtime API', () => {
  const error = new CommandNotFoundError('Command not found: deployx', {
    code: CommandNotFoundErrorKeys.notFound,
    values: {
      commandName: 'deployx'
    },
    commandName: 'deployx',
    candidates: ['deploy'],
    commandPath: []
  })

  expect(isCommandNotFoundError(error)).toBe(true)
  expect(error.code).toBe(CommandNotFoundErrorKeys.notFound)
  expect(error.commandName).toBe('deployx')
  expect(error.candidates).toEqual(['deploy'])
  expect(error.values).toEqual({
    commandName: 'deployx'
  })
})
