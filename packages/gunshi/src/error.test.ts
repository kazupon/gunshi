import { ArgsValidationError, ArgsValidationErrorKeys, parseArgs } from 'args-tokens'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { runInNewContext } from 'node:vm'
import { afterEach, describe, expect, test, vi } from 'vitest'
import {
  CommandNotFoundError,
  CommandNotFoundErrorKeys,
  hasPriorityValidationError,
  isArgsValidationError,
  isCommandNotFoundError
} from './error.ts'

import type { Args } from 'args-tokens'

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
      commandName = 'lod'
      candidates = ['load']
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
      error.commandName = 'lod'
      error.candidates = ['load']
      error
    `)

    // the global symbol registry is shared across realms, while `Error` is not
    expect(error).not.toBeInstanceOf(Error)
    expect(isCommandNotFoundError(error)).toBe(true)
  })

  test.each([
    {
      title: 'brand without commandName',
      value: { [COMMAND_NOT_FOUND_ERROR_BRAND]: true, candidates: [] }
    },
    {
      title: 'brand with a non-string commandName',
      value: { [COMMAND_NOT_FOUND_ERROR_BRAND]: true, commandName: 1, candidates: [] }
    },
    {
      title: 'brand without candidates',
      value: { [COMMAND_NOT_FOUND_ERROR_BRAND]: true, commandName: 'lod' }
    },
    {
      title: 'brand with non-array candidates',
      value: { [COMMAND_NOT_FOUND_ERROR_BRAND]: true, commandName: 'lod', candidates: 'load' }
    },
    {
      title: 'brand set to a string',
      value: { [COMMAND_NOT_FOUND_ERROR_BRAND]: 'true', commandName: 'lod', candidates: [] }
    },
    {
      title: 'brand keyed by a non-registry symbol',
      value: { [Symbol('gunshi.CommandNotFoundError')]: true, commandName: 'lod', candidates: [] }
    },
    {
      title: 'inherited brand',
      value: Object.assign(Object.create({ [COMMAND_NOT_FOUND_ERROR_BRAND]: true }) as object, {
        commandName: 'lod',
        candidates: []
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
        super("Optional argument '--foo' is required")
        this.name = 'foo'
        Object.defineProperty(this, ARGS_VALIDATION_ERROR_BRAND, { value: true })
      }
    }

    const error = new ForeignArgResolveError()
    expect(error).not.toBeInstanceOf(ArgsValidationError)
    expect(isArgsValidationError(error)).toBe(true)
  })

  test('does not match an unbranded subclass that overrides name', () => {
    const error = Object.assign(new Error("Optional argument '--foo' is required"), {
      name: 'foo',
      code: ArgsValidationErrorKeys.requiredOption,
      values: { name: 'foo' }
    })
    expect(isArgsValidationError(error)).toBe(false)
  })

  test('does not match a forged brand without values', () => {
    expect(isArgsValidationError({ [ARGS_VALIDATION_ERROR_BRAND]: true })).toBe(false)
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

describe('errors raised by another bundled copy of args-tokens', () => {
  /**
   * Load another copy of the `args-tokens` resolver, like the one bundled into `@gunshi/plugin`.
   *
   * `vi.resetModules()` does not duplicate externalized dependencies such as `args-tokens`,
   * so the built resolver module is imported again with a query string. The module loader
   * evaluates it as a separate module instance that defines its own error classes.
   *
   * @returns The foreign resolver module
   */
  async function loadForeignResolver(): Promise<typeof import('args-tokens/resolver')> {
    const require = createRequire(import.meta.url)
    const resolverPath = require.resolve('args-tokens/resolver')
    const foreign = (await import(
      /* @vite-ignore */ `${pathToFileURL(resolverPath).href}?copy=foreign`
    )) as typeof import('args-tokens/resolver')
    // guard the premise: otherwise the cross-copy tests would pass trivially
    expect(foreign.ArgsValidationError).not.toBe(ArgsValidationError)
    return foreign
  }

  test.each<{ title: string; args: Args; argv: string[]; code: string | undefined }>([
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
      code: undefined
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
})
