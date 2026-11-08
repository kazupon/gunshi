import { describe, expectTypeOf, test } from 'vitest'
import { define, defineWithTypes, jsonArgs, lazy, lazyWithTypes } from './definition.ts'

import type { Args, Command, CommandRunner, GunshiParams } from './types.ts'

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

  test('infers an unnamed definition and keeps commandName optional', () => {
    const lazyCommand = lazy(
      () => {
        return ctx => {
          expectTypeOf(ctx.values.input).toEqualTypeOf<string>()
        }
      },
      { args: commandArgs }
    )

    expectTypeOf(lazyCommand.commandName).toEqualTypeOf<string | undefined>()
    expectTypeOf(lazyCommand.args).toEqualTypeOf<typeof commandArgs>()
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
  test('infers an unnamed lazy command without a definition', () => {
    const lazyCommand = lazyWithTypes<{ args: typeof commandArgs }>()(() => {
      return ctx => {
        expectTypeOf(ctx.values.input).toEqualTypeOf<string>()
      }
    })

    expectTypeOf(lazyCommand.commandName).toEqualTypeOf<string | undefined>()
  })

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

/**
 * NOTE(kazupon): a statement that must not type-check is written on one line, so that tsc (the type
 * tests) and tsgo (`oxlint --type-check`) report its error on the line under `@ts-expect-error`.
 *
 * A typo in a sub-command that is written as an object in the definition, such as
 * `define({ name: 'remote', subCommands: { add: { name: 'add', desc: 'Add' } } })`, is not a type
 * error: the inferred definition takes in the keys of the object. Checking the keys of each
 * sub-command would also reject a command in a variable whose type has keys of its own, such as
 * the `resource` of the i18n plugin. Such a sub-command is defined with `define`, which checks its
 * keys.
 */
describe('the keys that a command does not have (#871)', () => {
  const run = () => {}
  const loader = (): CommandRunner => run
  const resource = async () => ({ description: 'Deploy the app' })

  test('define rejects them', () => {
    // @ts-expect-error `desc` is not a key of a command
    define({ name: 'deploy', desc: 'Deploy', run })
    // @ts-expect-error the key of the sub-commands is `subCommands`
    define({ name: 'remote', subcommands: {}, run })
    // @ts-expect-error `strict` is an option of `cli`, not a key of a command
    define({ name: 'deploy', strict: true, run })
    // @ts-expect-error `desc`, next to the arguments of `jsonArgs`
    define({ name: 'list', args: { ...jsonArgs }, desc: 'List', run: () => ({ ok: true }) })
  })

  test('an array of sub-commands does not take a loader, which has no name', () => {
    // @ts-expect-error an array keys its commands by their names, and a loader has none
    define({ name: 'remote', subCommands: [() => define({ name: 'add', run })], run })
  })

  test('define rejects them in a variable, and in a spread of it', () => {
    const base = { name: 'deploy', meta: 1, run }
    // @ts-expect-error `meta` is not a key of a command
    define(base)
    // @ts-expect-error `meta`, spread from the variable
    define({ ...base, description: 'Deploy' })
  })

  test('defineWithTypes rejects them', () => {
    // @ts-expect-error `desc` is not a key of a command
    defineWithTypes<{ extensions: LoggerExtensions }>()({ name: 'deploy', desc: 'Deploy', run })
  })

  test('lazy and lazyWithTypes reject them in the definition', () => {
    // @ts-expect-error `desc` is not a key of a command
    lazy(loader, { name: 'deploy', args: {}, desc: 'Deploy' })
    // @ts-expect-error `desc`, in a definition without args
    lazy(loader, { name: 'deploy', desc: 'Deploy' })
    // @ts-expect-error `desc` is not a key of a command
    lazyWithTypes<{ extensions: LoggerExtensions }>()(loader, { name: 'deploy', desc: 'Deploy' })
  })

  test('the keys of a command are accepted', () => {
    define({
      name: 'deploy',
      description: 'Deploy the app',
      args: commandArgs,
      examples: 'deploy --input app.zip',
      toKebab: true,
      internal: false,
      entry: false,
      rendering: { header: null },
      run
    })
    const plain = { name: 'deploy', run }
    expectTypeOf(define(plain).name).toEqualTypeOf<string>()
    const typed: Command = { name: 'deploy', run }
    expectTypeOf(define(typed).name).toEqualTypeOf<string | undefined>()
  })

  test('the keys of the definition are not optional in the result, and the other keys are', () => {
    const command = define({ name: 'deploy', run })
    expectTypeOf(command.name).toEqualTypeOf<string>()
    expectTypeOf(command.examples).toBeNullable()
  })

  test('a lazy command takes the resource of the i18n plugin in its definition', () => {
    const deploy = lazy(loader, { name: 'deploy', args: {}, resource })
    expectTypeOf(deploy.resource).toEqualTypeOf<typeof resource>()
  })

  test('the sub-commands can be the commands of other types, and the objects without typos', () => {
    const typed = defineWithTypes<{ extensions: LoggerExtensions }>()({
      name: 'typed',
      run: ctx => ctx.extensions.logger.log('typed')
    })
    const deploy = lazy(loader, { name: 'deploy', args: commandArgs })
    define({ name: 'app', subCommands: { typed, deploy }, run })
    define({ name: 'remote', subCommands: { add: { name: 'add', run } }, run })
  })
})
