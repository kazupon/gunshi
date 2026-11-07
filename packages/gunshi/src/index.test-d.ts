import { expectTypeOf, test } from 'vitest'
import {
  CommandError as DefinitionCommandError,
  isCommandError as definitionIsCommandError
} from './definition.ts'
import {
  ArgsValidationError,
  ArgsValidationErrorKeys,
  CommandError,
  CommandNotFoundError,
  CommandNotFoundErrorKeys,
  CommandResolutionError,
  CommandResolutionErrorKeys,
  isArgsValidationError,
  isCommandError,
  isCommandNotFoundError,
  isCommandResolutionError
} from './index.ts'
import {
  CommandError as PluginCommandError,
  isCommandError as pluginIsCommandError
} from './plugin.ts'

import type { CommandErrorOptions as DefinitionCommandErrorOptions } from './definition.ts'
import type {
  ArgsValidationErrorCode,
  CommandErrorOptions,
  CommandNotFoundErrorCode,
  CommandResolutionErrorCode
} from './index.ts'
import type { CommandErrorOptions as PluginCommandErrorOptions } from './plugin.ts'

test('exports args validation error types', () => {
  expectTypeOf(ArgsValidationError).toBeConstructibleWith('fallback message')
  expectTypeOf(ArgsValidationErrorKeys.requiredOption).toEqualTypeOf<'err:arg:required-option'>()
  expectTypeOf(ArgsValidationErrorKeys.unexpectedValue).toEqualTypeOf<'err:arg:unexpected-value'>()
  expectTypeOf(ArgsValidationErrorKeys.missingValue).toEqualTypeOf<'err:arg:missing-value'>()
  expectTypeOf(ArgsValidationErrorKeys.conflict).toEqualTypeOf<'err:arg:conflict'>()
  expectTypeOf(ArgsValidationErrorKeys.invalidDefault).toEqualTypeOf<'err:arg:invalid-default'>()
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

test('exports command error types', () => {
  expectTypeOf(CommandError).toBeConstructibleWith('Project acme not found')
  expectTypeOf(CommandError).toBeConstructibleWith('Project acme not found', {
    code: 'not_found',
    exitCode: 2,
    cause: new Error('ENOENT: no such file or directory')
  })
  // a cause may be any value, as the cause of `Error` is
  expectTypeOf(CommandError).toBeConstructibleWith('Could not deploy acme', {
    cause: 'timeout after 30s'
  })
  expectTypeOf<CommandErrorOptions>().toEqualTypeOf<{
    code?: string
    exitCode?: number
    cause?: unknown
  }>()

  const error = new CommandError('Project acme not found')
  expectTypeOf(error).toMatchTypeOf<Error>()
  expectTypeOf(error.code).toEqualTypeOf<string | undefined>()
  expectTypeOf(error.exitCode).toEqualTypeOf<number>()

  // @ts-expect-error -- the code is a string
  new CommandError('Project acme not found', { code: 404 })
  // @ts-expect-error -- the exit code is a number
  new CommandError('Project acme not found', { exitCode: '2' })
})

test('isCommandError narrows an unknown error', () => {
  const error: unknown = new CommandError('Project acme not found')
  if (isCommandError(error)) {
    expectTypeOf(error).toEqualTypeOf<CommandError>()
    expectTypeOf(error.exitCode).toEqualTypeOf<number>()
  }
})

test('exports CommandError from gunshi/plugin and gunshi/definition', () => {
  expectTypeOf(PluginCommandError).toEqualTypeOf(CommandError)
  expectTypeOf(pluginIsCommandError).toEqualTypeOf(isCommandError)
  expectTypeOf<PluginCommandErrorOptions>().toEqualTypeOf<CommandErrorOptions>()
  expectTypeOf(DefinitionCommandError).toEqualTypeOf(CommandError)
  expectTypeOf(definitionIsCommandError).toEqualTypeOf(isCommandError)
  expectTypeOf<DefinitionCommandErrorOptions>().toEqualTypeOf<CommandErrorOptions>()
})
