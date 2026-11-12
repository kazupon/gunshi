import { ArgsValidationError, ArgsValidationErrorKeys, parseArgs } from 'args-tokens'
import { cpSync, mkdtempSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { basename, dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { runInNewContext } from 'node:vm'
import { afterAll, afterEach, describe, expect, test, vi } from 'vite-plus/test'
import {
  CommandError,
  CommandNotFoundError,
  CommandNotFoundErrorKeys,
  CommandResolutionError,
  CommandResolutionErrorKeys,
  hasPriorityValidationError,
  isArgsValidationError,
  isCommandError,
  isCommandNotFoundError,
  isCommandResolutionError,
  isJsonOutputError,
  JsonOutputError,
  JsonOutputErrorKeys
} from './error.ts'

import type { Args } from 'args-tokens'

/**
 * Stand-ins for the duplicated class copies that `@gunshi/plugin` ships: it is bundled
 * with `noExternal: ['gunshi/plugin']`, so a plugin importing these guards holds a
 * different class object than the one `gunshi` throws with, and `instanceof` cannot match.
 * Like the real constructors, they set every property of the class, but no brand.
 */
class DuplicatedCommandNotFoundError extends Error {
  readonly code = CommandNotFoundErrorKeys.notFound
  readonly values: Record<string, unknown>
  readonly commandName: string
  readonly candidates: readonly string[]
  readonly commandPath: readonly string[] = []
  constructor(message: string, commandName: string, candidates: readonly string[]) {
    super(message)
    this.name = 'CommandNotFoundError'
    this.values = { commandName }
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

// the registry keys are the contract shared with other bundled copies of gunshi and args-tokens
const COMMAND_NOT_FOUND_ERROR_BRAND = Symbol.for('gunshi.CommandNotFoundError')
const ARGS_VALIDATION_ERROR_BRAND = Symbol.for('args-tokens.ArgsValidationError')

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

  test('does not match an error whose properties have the wrong shape', () => {
    // keys exist, but the values would not satisfy the `CommandNotFoundError` type
    expect(
      isCommandNotFoundError(
        Object.assign(new Error('bad'), {
          name: 'CommandNotFoundError',
          commandName: 'x',
          candidates: undefined
        })
      )
    ).toBe(false)
    expect(
      isCommandNotFoundError(
        Object.assign(new Error('bad'), {
          name: 'CommandNotFoundError',
          commandName: 1,
          candidates: []
        })
      )
    ).toBe(false)
  })
})

describe('CommandNotFoundError brand', () => {
  test('is an own, non-enumerable and immutable property', () => {
    const error = new CommandNotFoundError('Command not found: lod', {
      code: CommandNotFoundErrorKeys.notFound,
      values: { commandName: 'lod' },
      commandName: 'lod',
      candidates: ['load']
    })

    expect(Object.getOwnPropertyDescriptor(error, COMMAND_NOT_FOUND_ERROR_BRAND)).toEqual({
      value: true,
      enumerable: false,
      writable: false,
      configurable: false
    })
    // copying own enumerable properties (string and symbol keys) must not carry the brand
    expect(COMMAND_NOT_FOUND_ERROR_BRAND in Object.assign({}, error)).toBe(false)
    // equality with an unbranded error that has the same shape is not affected by the brand
    expect(error).toEqual(
      Object.assign(new Error('Command not found: lod'), {
        name: 'CommandNotFoundError',
        code: CommandNotFoundErrorKeys.notFound,
        values: { commandName: 'lod' },
        commandName: 'lod',
        candidates: ['load'],
        commandPath: []
      })
    )

    // modules are strict mode, so writing or deleting a non-writable, non-configurable property throws
    expect(() => {
      ;(error as unknown as Record<PropertyKey, unknown>)[COMMAND_NOT_FOUND_ERROR_BRAND] = false
    }).toThrow(TypeError)
    expect(() => {
      delete (error as unknown as Record<PropertyKey, unknown>)[COMMAND_NOT_FOUND_ERROR_BRAND]
    }).toThrow(TypeError)
    expect(isCommandNotFoundError(error)).toBe(true)
  })

  test('keeps recognizing an instance whose name has been changed', () => {
    const error = new CommandNotFoundError('Command not found: lod', { commandName: 'lod' })
    error.name = 'RenamedError'
    expect(isCommandNotFoundError(error)).toBe(true)
  })

  test('recognizes a branded error from a foreign class that overrides name', () => {
    class ForeignCommandNotFoundError extends Error {
      code = CommandNotFoundErrorKeys.notFound
      values = { commandName: 'lod' }
      commandName = 'lod'
      candidates = ['load']
      commandPath = []
      constructor() {
        super('Command not found: lod')
        this.name = 'SomethingElse'
        Object.defineProperty(this, COMMAND_NOT_FOUND_ERROR_BRAND, { value: true })
      }
    }

    const error = new ForeignCommandNotFoundError()
    expect(error).not.toBeInstanceOf(CommandNotFoundError)
    expect(isCommandNotFoundError(error)).toBe(true)
  })

  test('recognizes a branded error created in another realm', () => {
    const error: unknown = runInNewContext(`
      const error = new Error('Command not found: lod')
      Object.defineProperty(error, Symbol.for('gunshi.CommandNotFoundError'), { value: true })
      error.code = 'err:cmd:not-found'
      error.values = { commandName: 'lod' }
      error.commandName = 'lod'
      error.candidates = ['load']
      error.commandPath = []
      error
    `)

    // the global symbol registry is shared across realms, while `Error` is not
    expect(error).not.toBeInstanceOf(Error)
    expect(isCommandNotFoundError(error)).toBe(true)
  })

  /**
   * Create the own properties that every copy of `CommandNotFoundError` sets.
   *
   * @returns The properties, which each rejection case below breaks one at a time
   */
  function commandNotFoundErrorShape(): Record<string, unknown> {
    return {
      code: CommandNotFoundErrorKeys.notFound,
      values: { commandName: 'lod' },
      commandName: 'lod',
      candidates: ['load'],
      commandPath: []
    }
  }

  /**
   * Create a plain object with the brand and a valid shape, with some properties overridden.
   *
   * @param overrides - Properties to override, where `undefined` removes the property
   * @returns The branded object
   */
  function brandedCommandNotFoundError(overrides: Record<string, unknown> = {}): object {
    const value: Record<PropertyKey, unknown> = {
      [COMMAND_NOT_FOUND_ERROR_BRAND]: true,
      ...commandNotFoundErrorShape(),
      ...overrides
    }
    for (const [key, override] of Object.entries(overrides)) {
      if (override === undefined) {
        delete value[key]
      }
    }
    return value
  }

  test('recognizes a branded plain object with a valid shape', () => {
    // the control for the rejection cases below
    expect(isCommandNotFoundError(brandedCommandNotFoundError())).toBe(true)
  })

  test.each([
    {
      title: 'brand without commandName',
      value: brandedCommandNotFoundError({ commandName: undefined })
    },
    {
      title: 'brand with a non-string commandName',
      value: brandedCommandNotFoundError({ commandName: 1 })
    },
    {
      title: 'brand without candidates',
      value: brandedCommandNotFoundError({ candidates: undefined })
    },
    {
      title: 'brand with non-array candidates',
      value: brandedCommandNotFoundError({ candidates: 'load' })
    },
    {
      title: 'brand with a non-string candidate',
      value: brandedCommandNotFoundError({ candidates: ['load', 1] })
    },
    {
      title: 'brand without commandPath',
      value: brandedCommandNotFoundError({ commandPath: undefined })
    },
    {
      title: 'brand with a non-string command path segment',
      value: brandedCommandNotFoundError({ commandPath: [null] })
    },
    { title: 'brand without values', value: brandedCommandNotFoundError({ values: undefined }) },
    { title: 'brand with null values', value: brandedCommandNotFoundError({ values: null }) },
    { title: 'brand without code', value: brandedCommandNotFoundError({ code: undefined }) },
    { title: 'brand with a non-string code', value: brandedCommandNotFoundError({ code: 42 }) },
    {
      title: 'brand set to a string',
      value: { ...commandNotFoundErrorShape(), [COMMAND_NOT_FOUND_ERROR_BRAND]: 'true' }
    },
    {
      title: 'brand keyed by a non-registry symbol',
      value: { ...commandNotFoundErrorShape(), [Symbol('gunshi.CommandNotFoundError')]: true }
    },
    {
      title: 'inherited brand',
      value: Object.assign(
        Object.create({ [COMMAND_NOT_FOUND_ERROR_BRAND]: true }) as object,
        commandNotFoundErrorShape()
      )
    },
    {
      title: 'error named CommandNotFoundError with a non-string candidate',
      value: Object.assign(new Error('Command not found: lod'), {
        ...commandNotFoundErrorShape(),
        name: 'CommandNotFoundError',
        candidates: [1]
      })
    }
  ])('rejects $title', ({ value }) => {
    expect(isCommandNotFoundError(value)).toBe(false)
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

  test('matches a duplicated-copy error without a `code`', () => {
    // `code` is optional on `ArgsValidationError`, so `undefined` is a valid shape
    const error = Object.assign(new Error('bad'), {
      name: 'ArgsValidationError',
      code: undefined,
      values: {}
    })
    expect(isArgsValidationError(error)).toBe(true)
  })

  test('does not match an error whose properties have the wrong shape', () => {
    expect(
      isArgsValidationError(
        Object.assign(new Error('bad'), {
          name: 'ArgsValidationError',
          code: 1,
          values: {}
        })
      )
    ).toBe(false)
    expect(
      isArgsValidationError(
        Object.assign(new Error('bad'), {
          name: 'ArgsValidationError',
          code: ArgsValidationErrorKeys.unknownOption,
          values: undefined
        })
      )
    ).toBe(false)
  })

  test('recognizes a branded subclass that overrides name with the argument name (#687)', () => {
    // `ArgResolveError` overrides `name` with the argument name, so a `name` check cannot match it
    class ForeignArgResolveError extends Error {
      code = ArgsValidationErrorKeys.requiredOption
      values = { name: 'foo' }
      constructor() {
        super("Option '--foo' is required")
        this.name = 'foo'
        Object.defineProperty(this, ARGS_VALIDATION_ERROR_BRAND, { value: true })
      }
    }

    const error = new ForeignArgResolveError()
    expect(error).not.toBeInstanceOf(ArgsValidationError)
    expect(isArgsValidationError(error)).toBe(true)
  })

  test('does not match an unbranded subclass that overrides name', () => {
    const error = Object.assign(new Error("Option '--foo' is required"), {
      name: 'foo',
      code: ArgsValidationErrorKeys.requiredOption,
      values: { name: 'foo' }
    })
    expect(isArgsValidationError(error)).toBe(false)
  })

  test('does not match a forged brand without values', () => {
    expect(isArgsValidationError({ [ARGS_VALIDATION_ERROR_BRAND]: true })).toBe(false)
  })

  test('matches a branded plain object with a valid shape', () => {
    // the control for the rejection cases below
    expect(
      isArgsValidationError({ [ARGS_VALIDATION_ERROR_BRAND]: true, code: undefined, values: {} })
    ).toBe(true)
  })

  test.each([
    // `args-tokens` accepts these, but consumers use `code` as a resource key
    {
      title: 'brand with a non-string code',
      value: { [ARGS_VALIDATION_ERROR_BRAND]: true, code: 42, values: {} }
    },
    { title: 'brand without code', value: { [ARGS_VALIDATION_ERROR_BRAND]: true, values: {} } },
    {
      title: 'error named ArgsValidationError without code',
      value: Object.assign(new Error('bad'), { name: 'ArgsValidationError', values: {} })
    }
  ])('rejects $title', ({ value }) => {
    expect(isArgsValidationError(value)).toBe(false)
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

  test('detects a command-resolution error', () => {
    const error = new AggregateError([
      new CommandResolutionError('ambiguous', {
        code: CommandResolutionErrorKeys.ambiguous,
        commandPath: [],
        candidatePaths: [['clean'], ['deploy']]
      })
    ])
    expect(hasPriorityValidationError(error)).toBe(true)
  })
})

describe('CommandResolutionError', () => {
  const brand = Symbol.for('gunshi.CommandResolutionError')

  test('stores structured routing metadata and its own brand', () => {
    const error = new CommandResolutionError('ambiguous', {
      code: CommandResolutionErrorKeys.ambiguous,
      values: { candidatePaths: 'clean, deploy' },
      commandPath: ['remote'],
      candidatePaths: [
        ['remote', 'clean'],
        ['remote', 'deploy']
      ]
    })

    expect(isCommandResolutionError(error)).toBe(true)
    expect(error.code).toBe(CommandResolutionErrorKeys.ambiguous)
    expect(error.commandPath).toEqual(['remote'])
    expect(error.candidatePaths).toEqual([
      ['remote', 'clean'],
      ['remote', 'deploy']
    ])
    expect(Object.getOwnPropertyDescriptor(error, brand)).toMatchObject({
      value: true,
      enumerable: false,
      writable: false,
      configurable: false
    })
  })

  test('recognizes a valid branded error from another copy without using name', () => {
    const error: Record<PropertyKey, unknown> = {
      [brand]: true,
      name: 'ForeignError',
      code: CommandResolutionErrorKeys.inconsistentOptions,
      values: {},
      commandPath: [],
      candidatePaths: [['deploy']]
    }

    expect(isCommandResolutionError(error)).toBe(true)
    expect(
      isCommandResolutionError({
        name: 'CommandResolutionError',
        code: CommandResolutionErrorKeys.ambiguous,
        values: {},
        commandPath: [],
        candidatePaths: []
      })
    ).toBe(false)
  })
})

describe('CommandError', () => {
  // the registry key is the contract shared with other bundled copies of gunshi
  const brand = Symbol.for('gunshi.CommandError')

  test('has the message and the defaults without options', () => {
    const error = new CommandError('Project acme not found')

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('CommandError')
    expect(error.message).toBe('Project acme not found')
    expect(error.code).toBeUndefined()
    expect(error.exitCode).toBe(1)
    expect(error.cause).toBeUndefined()
  })

  test('has the code, the exit code and the cause of the options', () => {
    const cause = new Error('ENOENT: no such file or directory')
    const error = new CommandError('Project acme not found', {
      code: 'not_found',
      exitCode: 2,
      cause
    })

    expect(error.code).toBe('not_found')
    expect(error.exitCode).toBe(2)
    expect(error.cause).toBe(cause)
  })

  test.each([1, 2, 3, 255])('keeps the exit code %s', exitCode => {
    expect(new CommandError('failed', { exitCode }).exitCode).toBe(exitCode)
  })

  // a failure never ends with 0, and the exit code of a process is an integer from 0 to 255
  test.each([0, -1, 256, 1.5, Number.NaN, Number.POSITIVE_INFINITY, '2' as unknown as number])(
    'replaces the exit code %s with 1',
    exitCode => {
      expect(new CommandError('failed', { exitCode }).exitCode).toBe(1)
    }
  )

  test('has an own, non-enumerable and immutable brand', () => {
    const error = new CommandError('Project acme not found', { code: 'not_found' })

    expect(Object.getOwnPropertyDescriptor(error, brand)).toEqual({
      value: true,
      enumerable: false,
      writable: false,
      configurable: false
    })
    expect(Object.keys(error)).not.toContain(brand)
    // copying own enumerable properties (string and symbol keys) must not carry the brand
    expect(brand in Object.assign({}, error)).toBe(false)
  })

  test('is recognized when a subclass changes the name', () => {
    class ProjectNotFoundError extends CommandError {
      constructor(project: string) {
        super(`Project ${project} not found`, { code: 'not_found' })
        this.name = 'ProjectNotFoundError'
      }
    }

    expect(isCommandError(new ProjectNotFoundError('acme'))).toBe(true)
  })
})

describe('isCommandError', () => {
  const brand = Symbol.for('gunshi.CommandError')

  /**
   * Create a plain object with the brand and the shape that every copy of `CommandError` sets,
   * with some properties overridden.
   *
   * @param overrides - Properties to override, where `undefined` removes the property
   * @returns The branded object
   */
  function brandedCommandError(overrides: Record<string, unknown> = {}): object {
    const value: Record<PropertyKey, unknown> = {
      [brand]: true,
      message: 'Project acme not found',
      code: 'not_found',
      exitCode: 1,
      ...overrides
    }
    for (const [key, override] of Object.entries(overrides)) {
      if (override === undefined) {
        delete value[key]
      }
    }
    return value
  }

  test('matches an instance of the class', () => {
    expect(isCommandError(new CommandError('Project acme not found'))).toBe(true)
  })

  test('recognizes a branded error from a foreign class without using name', () => {
    class ForeignCommandError extends Error {
      code = undefined
      exitCode = 2
      constructor() {
        super('Project acme not found')
        this.name = 'SomethingElse'
        Object.defineProperty(this, brand, { value: true })
      }
    }

    const error = new ForeignCommandError()
    expect(error).not.toBeInstanceOf(CommandError)
    expect(isCommandError(error)).toBe(true)
  })

  test('recognizes a branded error created in another realm', () => {
    const error: unknown = runInNewContext(`
      const error = new Error('Project acme not found')
      Object.defineProperty(error, Symbol.for('gunshi.CommandError'), { value: true })
      error.code = undefined
      error.exitCode = 1
      error
    `)

    // the global symbol registry is shared across realms, while `Error` is not
    expect(error).not.toBeInstanceOf(Error)
    expect(isCommandError(error)).toBe(true)
  })

  test('recognizes a branded plain object with a valid shape', () => {
    // the control for the rejection cases below
    expect(isCommandError(brandedCommandError())).toBe(true)
  })

  test('does not read the properties of an error without the brand', () => {
    // the global options plugin checks every error that a command throws
    const error = new Error('boom')
    for (const key of ['code', 'exitCode']) {
      Object.defineProperty(error, key, {
        get() {
          throw new Error(`the getter of ${key}`)
        }
      })
    }

    expect(isCommandError(error)).toBe(false)
  })

  test('does not match an error of the app that has the same name', () => {
    class AppCommandError extends Error {
      code = 'not_found'
      exitCode = 1
      constructor(message: string) {
        super(message)
        this.name = 'CommandError'
      }
    }

    expect(isCommandError(new AppCommandError('Project acme not found'))).toBe(false)
  })

  test.each([
    { title: 'a plain error', value: new Error('Project acme not found') },
    { title: 'undefined', value: undefined },
    { title: 'null', value: null },
    { title: 'a string', value: 'Project acme not found' },
    { title: 'brand without message', value: brandedCommandError({ message: undefined }) },
    { title: 'brand with a non-string message', value: brandedCommandError({ message: 1 }) },
    { title: 'brand without code', value: brandedCommandError({ code: undefined }) },
    { title: 'brand with a non-string code', value: brandedCommandError({ code: 404 }) },
    { title: 'brand without exitCode', value: brandedCommandError({ exitCode: undefined }) },
    { title: 'brand with exitCode 0', value: brandedCommandError({ exitCode: 0 }) },
    { title: 'brand with exitCode 256', value: brandedCommandError({ exitCode: 256 }) },
    { title: 'brand with a fractional exitCode', value: brandedCommandError({ exitCode: 1.5 }) },
    { title: 'brand with a string exitCode', value: brandedCommandError({ exitCode: '1' }) },
    {
      title: 'brand set to a string',
      value: { ...brandedCommandError(), [brand]: 'true' }
    },
    {
      title: 'brand keyed by a non-registry symbol',
      value: {
        message: 'Project acme not found',
        code: undefined,
        exitCode: 1,
        [Symbol('gunshi.CommandError')]: true
      }
    },
    {
      title: 'inherited brand',
      value: Object.assign(Object.create({ [brand]: true }) as object, {
        message: 'Project acme not found',
        code: undefined,
        exitCode: 1
      })
    }
  ])('rejects $title', ({ value }) => {
    expect(isCommandError(value)).toBe(false)
  })
})

describe('JsonOutputError', () => {
  const brand = Symbol.for('gunshi.JsonOutputError')

  test('has the code, the values and the cause of the options, and an own brand', () => {
    const cause = new TypeError('Do not know how to serialize a BigInt')
    const error = new JsonOutputError('The result cannot be converted to JSON', {
      code: JsonOutputErrorKeys.unserializableResult,
      values: { message: cause.message },
      cause
    })

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('JsonOutputError')
    expect(error.code).toBe('err:json:unserializable-result')
    expect(error.values).toEqual({ message: cause.message })
    expect(error.cause).toBe(cause)
    expect(Object.getOwnPropertyDescriptor(error, brand)).toEqual({
      value: true,
      enumerable: false,
      writable: false,
      configurable: false
    })
    expect(isJsonOutputError(error)).toBe(true)
  })

  test('has empty values without them', () => {
    const error = new JsonOutputError('This command does not support --json', {
      code: JsonOutputErrorKeys.notSupported
    })
    expect(error.values).toEqual({})
  })

  test('has the codes that are the keys of the resources', () => {
    expect(JsonOutputErrorKeys).toEqual({
      notSupported: 'err:json:not-supported',
      invalidResult: 'err:json:invalid-result',
      unserializableResult: 'err:json:unserializable-result'
    })
  })
})

describe('isJsonOutputError', () => {
  const brand = Symbol.for('gunshi.JsonOutputError')

  test('recognizes a branded error from another copy without using name', () => {
    const error = Object.assign(new Error('This command does not support --json'), {
      [brand]: true,
      name: 'SomethingElse',
      code: 'err:json:not-supported',
      values: {}
    })
    expect(isJsonOutputError(error)).toBe(true)
  })

  test('does not read the properties of an error without the brand', () => {
    const error = new Error('boom')
    Object.defineProperty(error, 'code', {
      get() {
        throw new Error('the getter of code')
      }
    })
    expect(isJsonOutputError(error)).toBe(false)
  })

  test.each([
    { title: 'a plain error', value: new Error('boom') },
    { title: 'null', value: null },
    {
      title: 'an error of the app with the same name',
      value: Object.assign(new Error('boom'), {
        name: 'JsonOutputError',
        code: 'err:json:not-supported',
        values: {}
      })
    },
    {
      title: 'brand with a code that is not one of the keys',
      value: { [brand]: true, code: 'err:json:other', values: {} }
    },
    { title: 'brand without values', value: { [brand]: true, code: 'err:json:not-supported' } }
  ])('rejects $title', ({ value }) => {
    expect(isJsonOutputError(value)).toBe(false)
  })
})

describe('errors raised by another bundled copy of args-tokens', () => {
  let foreignDir: string | undefined

  afterAll(() => {
    if (foreignDir !== undefined) {
      rmSync(foreignDir, { recursive: true, force: true })
    }
  })

  /**
   * Load another copy of the `args-tokens` resolver, like the one bundled into `@gunshi/plugin`.
   *
   * `vi.resetModules()` does not duplicate externalized dependencies such as `args-tokens`,
   * so the built `lib` directory is copied to a temporary directory once, and the resolver
   * module of the copy is imported. Every module of the copy, including the chunks that the
   * resolver imports, has a URL of its own, so the module loader evaluates them as separate
   * module instances that define their own error classes.
   *
   * @returns The foreign resolver module
   */
  async function loadForeignResolver(): Promise<typeof import('args-tokens/resolver')> {
    const require = createRequire(import.meta.url)
    const resolverPath = require.resolve('args-tokens/resolver')
    // a query string on `resolver.js` alone does not reach the chunks that it imports
    if (foreignDir === undefined) {
      foreignDir = mkdtempSync(join(tmpdir(), 'args-tokens-foreign-'))
      cpSync(dirname(resolverPath), foreignDir, { recursive: true })
    }
    const foreign = (await import(
      /* @vite-ignore */ pathToFileURL(join(foreignDir, basename(resolverPath))).href
    )) as typeof import('args-tokens/resolver')
    // guard the premise: otherwise the cross-copy tests would pass trivially
    expect(foreign.ArgsValidationError).not.toBe(ArgsValidationError)
    return foreign
  }

  test.each<{ title: string; args: Args; argv: string[]; code: string }>([
    {
      title: 'required option',
      args: { foo: { type: 'string', required: true } },
      argv: [],
      code: ArgsValidationErrorKeys.requiredOption
    },
    {
      title: 'required positional',
      args: { file: { type: 'positional' } },
      argv: [],
      code: ArgsValidationErrorKeys.requiredPositional
    },
    {
      title: 'invalid type',
      args: { port: { type: 'number' } },
      argv: ['--port', 'abc'],
      code: ArgsValidationErrorKeys.invalidType
    },
    {
      title: 'invalid choice',
      args: { level: { type: 'enum', choices: ['debug', 'info'] } },
      argv: ['--level', 'warn'],
      code: ArgsValidationErrorKeys.invalidChoice
    },
    {
      title: 'conflict',
      args: { summer: { type: 'boolean', conflicts: 'autumn' }, autumn: { type: 'boolean' } },
      argv: ['--summer', '--autumn'],
      code: ArgsValidationErrorKeys.conflict
    },
    {
      title: 'missing value',
      args: { name: { type: 'string' } },
      argv: ['--name'],
      code: ArgsValidationErrorKeys.missingValue
    },
    {
      title: 'unexpected value',
      args: { color: { type: 'boolean', negatable: true } },
      argv: ['--no-color=false'],
      code: ArgsValidationErrorKeys.unexpectedValue
    },
    {
      title: 'invalid default',
      args: { level: { type: 'enum', choices: ['debug', 'info'], default: 'verbose' } },
      argv: [],
      code: ArgsValidationErrorKeys.invalidDefault
    }
  ])('recognizes $title errors', async ({ args, argv, code }) => {
    const foreign = await loadForeignResolver()
    const { error } = foreign.resolveArgs(args, parseArgs(argv))
    expect(error?.errors).toHaveLength(1)

    const validationError = error!.errors[0] as ArgsValidationError
    // neither `instanceof` nor the `name` fallback can match an `ArgResolveError` from another copy
    expect(validationError).toBeInstanceOf(foreign.ArgResolveError)
    expect(validationError).not.toBeInstanceOf(ArgsValidationError)
    expect(validationError.name).not.toBe('ArgsValidationError')

    expect(isArgsValidationError(validationError)).toBe(true)
    expect(validationError.code).toBe(code)
    // only unknown-option and command-not-found errors are handled with priority
    expect(hasPriorityValidationError(error)).toBe(false)
  })

  test('treats an unknown-option error as a priority error', async () => {
    const foreign = await loadForeignResolver()
    const error = new AggregateError([
      new foreign.ArgsValidationError('Unknown option: --alow-reload', {
        code: foreign.ArgsValidationErrorKeys.unknownOption,
        values: { rawName: '--alow-reload', name: 'alow-reload', candidates: [] }
      })
    ])

    expect(error.errors[0]).not.toBeInstanceOf(ArgsValidationError)
    expect(isArgsValidationError(error.errors[0])).toBe(true)
    expect(hasPriorityValidationError(error)).toBe(true)
  })
})

describe('errors thrown by another bundled copy of gunshi', () => {
  afterEach(() => {
    vi.resetModules()
  })

  /**
   * Run a CLI with a module copy of gunshi that is independent of the one under test,
   * like `gunshi` and `@gunshi/plugin` that each bundle their own error classes.
   *
   * @param argv - Command line arguments
   * @returns The foreign error module and the error thrown by the CLI
   */
  async function runForeignCli(argv: string[]): Promise<{
    foreign: typeof import('./error.ts')
    thrown: AggregateError
  }> {
    vi.resetModules()
    const { cli } = await import('./cli.ts')
    const foreign = await import('./error.ts')
    // guard the premise: otherwise the cross-copy tests would pass trivially
    expect(foreign.CommandNotFoundError).not.toBe(CommandNotFoundError)

    let thrown: unknown
    try {
      await cli(
        argv,
        { name: 'app', run: () => {} },
        { usageSilent: true, subCommands: { load: { name: 'load', run: () => {} } } }
      )
    } catch (error) {
      thrown = error
    }
    expect(thrown).toBeInstanceOf(AggregateError)
    return { foreign, thrown: thrown as AggregateError }
  }

  test('recognizes a command-not-found error', async () => {
    const { foreign, thrown } = await runForeignCli(['lod'])
    const [notFound] = thrown.errors

    expect(notFound).toBeInstanceOf(foreign.CommandNotFoundError)
    expect(notFound).not.toBeInstanceOf(CommandNotFoundError)
    expect(isCommandNotFoundError(notFound)).toBe(true)
    expect((notFound as CommandNotFoundError).candidates).toContain('load')
    expect(hasPriorityValidationError(thrown)).toBe(true)
  })

  test('recognizes a command-not-found error through the brand when name has been changed', async () => {
    const { thrown } = await runForeignCli(['lod'])
    const [notFound] = thrown.errors as Error[]

    notFound.name = 'RenamedError'
    expect(isCommandNotFoundError(notFound)).toBe(true)
  })

  test('recognizes a CommandError, and the other copy recognizes ours', async () => {
    vi.resetModules()
    const foreign = await import('./error.ts')
    // guard the premise: otherwise the cross-copy tests would pass trivially
    expect(foreign.CommandError).not.toBe(CommandError)

    const theirs = new foreign.CommandError('Project acme not found', { exitCode: 2 })
    expect(theirs).not.toBeInstanceOf(CommandError)
    expect(isCommandError(theirs)).toBe(true)
    expect(foreign.isCommandError(new CommandError('Project acme not found'))).toBe(true)
  })
})
