import { describe, expectTypeOf, test } from 'vitest'
import { define, defineWithTypes, lazy, lazyWithTypes } from './definition.ts'

import type { Args, CommandRunner, GunshiParams } from './types.ts'

const loggerPluginId = 'logger' as const

type LoggerExtension = {
  log: (message: string) => void
}

type LoggerExtensions = Record<typeof loggerPluginId, LoggerExtension>

const commandArgs = {
  input: {
    type: 'string',
    required: true
  },
  count: {
    type: 'number'
  },
  verbose: {
    type: 'boolean',
    default: false
  }
} satisfies Args

describe('define', () => {
  test('infers ctx.values from inline args', () => {
    define({
      name: 'deploy',
      args: commandArgs,
      run: ctx => {
        expectTypeOf(ctx.values.input).toEqualTypeOf<string>()
        expectTypeOf(ctx.values.count).toEqualTypeOf<number | undefined>()
        expectTypeOf(ctx.values.verbose).toEqualTypeOf<boolean>()
        expectTypeOf(ctx.extensions).toEqualTypeOf<any>()
      }
    })
  })

  test('preserves specified command property types', () => {
    const command = define({
      name: 'deploy',
      description: 'Deploy command',
      args: commandArgs,
      toKebab: false,
      run: () => {}
    })

    expectTypeOf(command.name).toEqualTypeOf<string>()
    expectTypeOf(command.description).toEqualTypeOf<string>()
    expectTypeOf(command.args).toEqualTypeOf<typeof commandArgs>()
    expectTypeOf(command.toKebab).toEqualTypeOf<false>()
  })

  test('accepts explicit GunshiParams for args and extensions', () => {
    define<GunshiParams<{ args: typeof commandArgs; extensions: LoggerExtensions }>>({
      name: 'deploy',
      args: commandArgs,
      run: ctx => {
        expectTypeOf(ctx.values.input).toEqualTypeOf<string>()
        expectTypeOf(ctx.values.count).toEqualTypeOf<number | undefined>()
        expectTypeOf(ctx.values.verbose).toEqualTypeOf<boolean>()
        expectTypeOf(ctx.extensions[loggerPluginId]).toEqualTypeOf<LoggerExtension>()
        expectTypeOf(ctx.extensions)
          // @ts-expect-error unknown plugin extension should not be available
          .toHaveProperty('missing')
      }
    })
  })
})

describe('defineWithTypes', () => {
  test('infers args while applying an explicit extension map', () => {
    const command = defineWithTypes<{ extensions: LoggerExtensions }>()({
      name: 'deploy',
      args: commandArgs,
      run: ctx => {
        expectTypeOf(ctx.values.input).toEqualTypeOf<string>()
        expectTypeOf(ctx.values.count).toEqualTypeOf<number | undefined>()
        expectTypeOf(ctx.values.verbose).toEqualTypeOf<boolean>()
        expectTypeOf(ctx.extensions[loggerPluginId]).toEqualTypeOf<LoggerExtension>()
        expectTypeOf(ctx.extensions)
          // @ts-expect-error unknown plugin extension should not be available
          .toHaveProperty('missing')
      }
    })

    expectTypeOf(command.args).toEqualTypeOf<typeof commandArgs>()
  })

  test('respects explicit args and extensions', () => {
    defineWithTypes<{ args: typeof commandArgs; extensions: LoggerExtensions }>()({
      name: 'deploy',
      args: commandArgs,
      run: ctx => {
        expectTypeOf(ctx.values.input).toEqualTypeOf<string>()
        expectTypeOf(ctx.values.count).toEqualTypeOf<number | undefined>()
        expectTypeOf(ctx.values.verbose).toEqualTypeOf<boolean>()
        expectTypeOf(ctx.extensions[loggerPluginId]).toEqualTypeOf<LoggerExtension>()
      }
    })
  })

  test('accepts GunshiParams wrapper', () => {
    defineWithTypes<GunshiParams<{ args: typeof commandArgs; extensions: LoggerExtensions }>>()({
      name: 'deploy',
      args: commandArgs,
      run: ctx => {
        expectTypeOf(ctx.values.input).toEqualTypeOf<string>()
        expectTypeOf(ctx.values.count).toEqualTypeOf<number | undefined>()
        expectTypeOf(ctx.values.verbose).toEqualTypeOf<boolean>()
        expectTypeOf(ctx.extensions[loggerPluginId]).toEqualTypeOf<LoggerExtension>()
      }
    })
  })
})

describe('lazy', () => {
  test('infers loader context from inline definition without explicit extensions generic (Issue #582)', () => {
    lazy(
      () => {
        return ({ values }) => {
          const test = values.test
          expectTypeOf(test).toEqualTypeOf<boolean | undefined>()
        }
      },
      {
        name: 'main',
        args: {
          test: {
            type: 'boolean'
          }
        }
      }
    )
  })

  test('infers standard arg value types from inline definition', () => {
    lazy(
      () => {
        return ({ values }) => {
          expectTypeOf(values.input).toEqualTypeOf<string>()
          expectTypeOf(values.count).toEqualTypeOf<number | undefined>()
          expectTypeOf(values.verbose).toEqualTypeOf<boolean>()
        }
      },
      {
        name: 'deploy',
        args: commandArgs
      }
    )
  })

  test('infers loader context from CommandRunner annotation', () => {
    const lazyCommand = lazy((): CommandRunner<{ args: typeof commandArgs; extensions: {} }> => {
      return ctx => {
        expectTypeOf(ctx.values.input).toEqualTypeOf<string>()
        expectTypeOf(ctx.values.count).toEqualTypeOf<number | undefined>()
        expectTypeOf(ctx.values.verbose).toEqualTypeOf<boolean>()
        expectTypeOf(ctx.extensions).toEqualTypeOf<any>()
      }
    })

    expectTypeOf(lazyCommand.commandName).toEqualTypeOf<string | undefined>()
  })

  test('preserves inline definition metadata without args', () => {
    const lazyCommand = lazy(
      () => {
        return () => {}
      },
      {
        name: 'lazy'
      }
    )

    expectTypeOf(lazyCommand.commandName).toEqualTypeOf<string>()
  })

  test('preserves inline definition metadata', () => {
    const lazyCommand = lazy(
      (): CommandRunner<{ args: typeof commandArgs; extensions: {} }> => {
        return () => {}
      },
      {
        name: 'deploy',
        description: 'Deploy command',
        args: commandArgs,
        toKebab: true
      }
    )

    expectTypeOf(lazyCommand.commandName).toEqualTypeOf<string>()
    expectTypeOf(lazyCommand.description).toEqualTypeOf<string>()
    expectTypeOf(lazyCommand.args).toEqualTypeOf<typeof commandArgs>()
    expectTypeOf(lazyCommand.toKebab).toEqualTypeOf<true>()
  })
})

describe('lazyWithTypes', () => {
  test('respects explicit args', () => {
    lazyWithTypes<{ args: typeof commandArgs }>()(
      () => {
        return ctx => {
          expectTypeOf(ctx.values.input).toEqualTypeOf<string>()
          expectTypeOf(ctx.values.count).toEqualTypeOf<number | undefined>()
          expectTypeOf(ctx.values.verbose).toEqualTypeOf<boolean>()
          expectTypeOf(ctx.extensions).toEqualTypeOf<any>()
        }
      },
      {
        name: 'deploy',
        args: commandArgs
      }
    )
  })

  test('keeps default Args values while applying extensions only', () => {
    lazyWithTypes<{ extensions: LoggerExtensions }>()(
      () => {
        return ctx => {
          expectTypeOf(ctx.values).toEqualTypeOf<{
            [x: string]: string | number | boolean | undefined
          }>()
          expectTypeOf(ctx.extensions[loggerPluginId]).toEqualTypeOf<LoggerExtension>()
        }
      },
      {
        name: 'deploy',
        args: commandArgs
      }
    )
  })

  test('respects explicit args and extensions', () => {
    lazyWithTypes<{ args: typeof commandArgs; extensions: LoggerExtensions }>()(
      () => {
        return ctx => {
          expectTypeOf(ctx.values.input).toEqualTypeOf<string>()
          expectTypeOf(ctx.values.count).toEqualTypeOf<number | undefined>()
          expectTypeOf(ctx.values.verbose).toEqualTypeOf<boolean>()
          expectTypeOf(ctx.extensions[loggerPluginId]).toEqualTypeOf<LoggerExtension>()
        }
      },
      {
        name: 'deploy',
        args: commandArgs
      }
    )
  })

  test('accepts GunshiParams wrapper', () => {
    lazyWithTypes<GunshiParams<{ args: typeof commandArgs; extensions: LoggerExtensions }>>()(
      () => {
        return ctx => {
          expectTypeOf(ctx.values.input).toEqualTypeOf<string>()
          expectTypeOf(ctx.values.count).toEqualTypeOf<number | undefined>()
          expectTypeOf(ctx.values.verbose).toEqualTypeOf<boolean>()
          expectTypeOf(ctx.extensions[loggerPluginId]).toEqualTypeOf<LoggerExtension>()
        }
      },
      {
        name: 'deploy',
        args: commandArgs
      }
    )
  })
})
