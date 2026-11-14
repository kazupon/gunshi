import { describe, expectTypeOf, test } from 'vite-plus/test'
import {
  choice,
  combinator,
  describe as describeArg,
  integer,
  map,
  multiple,
  positional,
  required,
  short,
  string,
  withDefault
} from './combinators.ts'
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
      aliases: ['dp'],
      deprecated: 'Use release.',
      entry: false,
      rendering: { header: null },
      run
    })
    const plain = { name: 'deploy', run }
    expectTypeOf(define(plain).name).toEqualTypeOf<string>()
    const typed: Command = { name: 'deploy', run }
    expectTypeOf(define(typed).name).toEqualTypeOf<string | undefined>()
  })

  test('aliases are the names of a command, in its definition and in the definition of lazy', () => {
    define({ name: 'list', aliases: ['ls', 'l'] as const, run })
    lazy(loader, { name: 'list', aliases: ['ls'] })
    define({ name: 'remote', subCommands: { add: { name: 'add', aliases: ['a'], run } }, run })
    // @ts-expect-error `aliases` is an array of names
    define({ name: 'list', aliases: 'ls', run })
  })

  test('deprecated is true or a text, in a command and in an argument', () => {
    define({ name: 'push', deprecated: true, run })
    define({ name: 'push', deprecated: 'Use deploy.', run })
    lazy(loader, { name: 'push', deprecated: 'Use deploy.' })
    define({
      name: 'export',
      args: { format: { type: 'string', deprecated: 'Use --output.' } },
      run
    })
    // @ts-expect-error `deprecated` is true or a text
    define({ name: 'push', deprecated: 1, run })
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

/**
 * NOTE(kazupon): a lazy command takes `run` from its loader, so its definition has none. A statement
 * that must not type-check is written on one line, as above.
 */
describe('the run of a lazy command comes from its loader (#881)', () => {
  const run = () => {}
  const loader = (): CommandRunner => run

  test('lazy and lazyWithTypes reject a run in the definition', () => {
    // @ts-expect-error `run` comes from the loader
    lazy(loader, { name: 'deploy', args: commandArgs, run })
    // @ts-expect-error `run`, in a definition without args
    lazy(loader, { name: 'deploy', run })
    // @ts-expect-error `run` of the command that `define` returns
    lazy(loader, define({ name: 'deploy', args: commandArgs, run }))
    // @ts-expect-error `run` comes from the loader
    lazyWithTypes<{ extensions: LoggerExtensions }>()(loader, { name: 'deploy', run })
    // @ts-expect-error `run` with explicit Gunshi parameters
    lazy<{ args: typeof commandArgs; extensions: {} }>(loader, { name: 'deploy', run })
  })

  test('a definition without run is accepted, also when its type has an optional run', () => {
    lazy(loader, { name: 'deploy', args: commandArgs })
    const definition = define({ name: 'deploy', args: commandArgs })
    expectTypeOf(definition.run).toBeNullable()
    lazy(loader, definition)
    lazyWithTypes<{ extensions: LoggerExtensions }>()(loader, define({ name: 'deploy' }))
    const typed: Command = { name: 'deploy' }
    lazy(loader, typed)
  })
})

/**
 * NOTE(kazupon): a key that an argument does not have is reported at the key, with a type that
 * names the key, and the key to use instead for a key of another library or a typo, such as
 * `'alias' is not a key of an argument: use 'short'`. The e2e tests check the messages with the
 * built declarations (`e2e/type-copies.spec.ts`). A statement that must not type-check is written
 * on one line, as above. Two forms are not checked:
 *
 * - An object given to `cli()` as a command: its arguments are not typed at all (#931)
 * - A sub-command written as an object in a table of sub-commands: `SubCommandable` takes any
 *   arguments (#440), so that a sub-command in a variable without `as const` type-checks. Such a
 *   sub-command is defined with `define`, which checks its arguments
 */
describe('the keys that an argument does not have (#930)', () => {
  const run = () => {}
  const list = () => ({ ok: true })
  const loader = (): CommandRunner => run
  const parse = (value: string) => Number(value)
  const strict = true as boolean

  test('define rejects them', () => {
    // @ts-expect-error `positional` is not a key of an argument: use `type: 'positional'`
    define({ name: 'rm', args: { n: { type: 'custom', positional: true, parse } }, run })
    // @ts-expect-error `require`: the key of a required argument is `required`
    define({ name: 'add', args: { store: { type: 'string', require: true } }, run })
    // @ts-expect-error `desc`: the key of the description is `description`
    define({ name: 'add', args: { store: { type: 'string', desc: 'The file' } }, run })
    // @ts-expect-error `alias`: the key of the short name is `short`
    define({ name: 'add', args: { verbose: { type: 'boolean', alias: 'v' } }, run })
    // @ts-expect-error `array`: the key of an argument given more than once is `multiple`
    define({ name: 'add', args: { tag: { type: 'string', array: true } }, run })
    // @ts-expect-error `desc`, next to the arguments of `jsonArgs`
    define({ name: 'ls', args: { ...jsonArgs, s: { type: 'string', desc: 'S' } }, run: list })
  })

  test('define rejects them in a variable, and in a spread of it', () => {
    const args = { store: { type: 'string', desc: 'The file' } } as const
    // @ts-expect-error `desc`, in the arguments in a variable
    define({ name: 'add', args, run })
    // @ts-expect-error `desc`, spread from the variable
    define({ name: 'add', args: { ...args, count: { type: 'number' } }, run })
  })

  test('define rejects them in a member of a union of schemas', () => {
    type Value = { type: 'string'; require: true } | { type: 'number' }
    const value: Value = strict ? { type: 'string', require: true } : { type: 'number' }
    // @ts-expect-error `require`, in one member of the union
    define({ name: 'add', args: { value }, run })
    type Short = { type: 'string'; short: 's' } | { type: 'number' }
    const short: Short = strict ? { type: 'string', short: 's' } : { type: 'number' }
    define({ name: 'add', args: { short }, run })
  })

  test('defineWithTypes rejects them', () => {
    const defineWithLogger = defineWithTypes<{ extensions: LoggerExtensions }>()
    // @ts-expect-error `desc` is not a key of an argument
    defineWithLogger({ name: 'add', args: { store: { type: 'string', desc: 'S' } }, run })
  })

  test('lazy and lazyWithTypes reject them in the definition', () => {
    // @ts-expect-error `desc` is not a key of an argument
    lazy(loader, { name: 'add', args: { store: { type: 'string', desc: 'S' } } })
    const lazyWithLogger = lazyWithTypes<{ extensions: LoggerExtensions }>()
    // @ts-expect-error `desc` is not a key of an argument
    lazyWithLogger(loader, { name: 'add', args: { store: { type: 'string', desc: 'S' } } })
  })

  test('the keys of an argument are accepted, and the values are inferred', () => {
    define({
      name: 'all',
      args: {
        s: { type: 'string', short: 's', description: 'S', hidden: false, required: true },
        d: { type: 'string', deprecated: 'Use s.', metavar: 'text', toKebab: true, conflicts: 's' },
        b: { type: 'boolean', negatable: true, default: false },
        e: { type: 'enum', choices: ['x', 'y'] as const, default: 'x' },
        p: { type: 'positional', parse, required: false, multiple: true },
        c: { type: 'custom', parse, default: 1 }
      },
      run: ctx => {
        expectTypeOf(ctx.values.s).toEqualTypeOf<string>()
        expectTypeOf(ctx.values.e).toEqualTypeOf<'x' | 'y'>()
        expectTypeOf(ctx.values.p).toEqualTypeOf<number[] | undefined>()
        expectTypeOf(ctx.values.c).toEqualTypeOf<number>()
      }
    })
  })

  test('the arguments of jsonArgs and of the parser combinators are accepted', () => {
    define({ name: 'ls', args: { ...jsonArgs }, run: list })
    define({ name: 'ls', args: { json: { ...jsonArgs.json, short: 'j' } }, run: list })
    lazy(() => define({ name: 'ls', args: { ...jsonArgs }, run: list }), {
      name: 'ls',
      args: { ...jsonArgs }
    })
    define({
      name: 'combinators',
      args: {
        i: integer({ min: 1 }),
        w: withDefault(integer(), 1),
        r: required(string()),
        p: positional(integer()),
        m: multiple(string()),
        sh: short(string(), 's'),
        d: describeArg(string(), 'D'),
        ch: choice(['a', 'b'] as const),
        mp: map(string(), value => value.length),
        co: combinator({ parse }),
        u: strict ? multiple(integer()) : string()
      },
      run: ctx => {
        expectTypeOf(ctx.values.w).toEqualTypeOf<number>()
        expectTypeOf(ctx.values.r).toEqualTypeOf<string>()
      }
    })
  })

  test('the arguments typed as Args, and in variables without unknown keys, are accepted', () => {
    define({ name: 'add', args: commandArgs, run })
    const typed: Args = { store: { type: 'string' } }
    define({ name: 'add', args: typed, run })
    const common = { config: { type: 'string', default: 'ship.json' } } as const
    define({
      name: 'add',
      args: { ...common, count: { type: 'number' } },
      run: ctx => {
        expectTypeOf(ctx.values.config).toEqualTypeOf<string>()
      }
    })
    defineWithTypes<{ extensions: LoggerExtensions }>()({ name: 'add', args: commandArgs, run })
    lazyWithTypes<{ extensions: LoggerExtensions }>()(loader, { name: 'add', args: commandArgs })
  })
})
