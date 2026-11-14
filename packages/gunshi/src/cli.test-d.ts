/**
 * Type test for cli() and define() inference
 * This test verifies that type inference works correctly when combining cli() and define()
 */

import { describe, expectTypeOf, test } from 'vite-plus/test'
import { cli as boneCli } from './bone.ts'
import { cli } from './cli.ts'
import { integer, multiple, string, withDefault } from './combinators.ts'
import { define, defineWithTypes, jsonArgs, lazy, lazyWithTypes } from './definition.ts'
import { generate } from './generator.ts'

import type { Args, Command, CommandContext, CommandRunner, SubCommandable } from './types.ts'

test('cli() with define() should preserve type inference', async () => {
  // Test that define() alone has correct type inference
  define({
    name: 'foo',
    args: {
      foo: {
        type: 'string'
      }
    },
    run: ctx => {
      // Should be: string | undefined
      expectTypeOf(ctx.values.foo).toEqualTypeOf<string | undefined>()
    }
  })

  // Test that cli() with define() also has correct type inference
  await cli(
    [],
    define({
      name: 'foo',
      args: {
        foo: {
          type: 'string'
        }
      },
      run: ctx => {
        // Should be: string | undefined, not any
        expectTypeOf(ctx.values.foo).toEqualTypeOf<string | undefined>()
      }
    })
  )
})

test('cli() with inline command should preserve type inference', async () => {
  // Test with inline command object wrapped in define()
  await cli(
    [],
    define({
      name: 'bar',
      args: {
        count: {
          type: 'number'
        }
      },
      run: ctx => {
        // Should be: number | undefined
        expectTypeOf(ctx.values.count).toEqualTypeOf<number | undefined>()
      }
    })
  )
})

test('cli() with complex args should preserve type inference', async () => {
  await cli(
    [],
    define({
      name: 'complex',
      args: {
        str: { type: 'string', default: 'hello' },
        num: { type: 'number' },
        bool: { type: 'boolean', default: false }
      },
      run: ctx => {
        // Test each arg type
        expectTypeOf(ctx.values.str).toEqualTypeOf<string>()
        expectTypeOf(ctx.values.num).toEqualTypeOf<number | undefined>()
        expectTypeOf(ctx.values.bool).toEqualTypeOf<boolean>()
      }
    })
  )
})

test('Command with subCommands property is valid', () => {
  const cmd: Command = {
    name: 'remote',
    description: 'Manage remotes',
    subCommands: {
      add: { name: 'add', description: 'Add a remote', run: () => {} }
    },
    run: () => {}
  }
  expectTypeOf(cmd.subCommands).toEqualTypeOf<Command['subCommands']>()
})

test('CommandContext has commandPath accessible', () => {
  type Ctx = CommandContext
  expectTypeOf<Ctx['commandPath']>().toEqualTypeOf<string[]>()
})

test('cli() accepts strict option', () => {
  expectTypeOf(cli).toBeCallableWith(
    [],
    define({
      name: 'strict',
      run: () => {}
    }),
    { strict: true }
  )
})

test('cli() preserves values for an unnamed lazy entry', async () => {
  await cli(
    ['--input', 'value'],
    lazy(
      () => {
        return ctx => {
          expectTypeOf(ctx.values.input).toEqualTypeOf<string | undefined>()
        }
      },
      { args: { input: { type: 'string' } } }
    )
  )
})

test('sub-commands can be an array, on the entry and in the options', () => {
  const add = define({ name: 'add', run: () => {} })
  const list = define({ name: 'list', run: () => {} })
  const entry = define({ name: 'todo', subCommands: [add, list] })
  const subCommands: Command['subCommands'] = entry.subCommands
  expectTypeOf(subCommands).not.toBeNever()
  const readonlySubCommands: Command['subCommands'] = [add, list] as const
  expectTypeOf(readonlySubCommands).not.toBeNever()

  const readonlyCommands = [add, list] as const
  expectTypeOf(cli([], entry, { subCommands: readonlyCommands })).toEqualTypeOf<
    Promise<string | undefined>
  >()
  expectTypeOf(
    cli([], entry, { subCommands: [add, lazy(() => () => {}, { name: 'lazy' })] })
  ).toEqualTypeOf<Promise<string | undefined>>()
})

/**
 * NOTE(kazupon): a statement that must not type-check is written on one line, so that tsc (the type
 * tests) and tsgo (`oxlint --type-check`) report its error on the line under `@ts-expect-error`.
 */
test('cli() rejects the keys that a command does not have (#871)', async () => {
  const run = () => {}
  const entry = define({ name: 'git', run })
  // @ts-expect-error `desc` is not a key of a command
  await cli([], { name: 'git', desc: 'Git', run })
  // @ts-expect-error `desc`, in a sub-command
  await cli([], entry, { subCommands: { remote: { name: 'remote', desc: 'Remote', run } } })
  // @ts-expect-error a function as a sub-command is a loader, which returns the command
  await cli([], entry, { subCommands: { remote: async () => {} } })
  // @ts-expect-error an array keys its commands by their names, and a loader has none
  await cli([], entry, { subCommands: [() => define({ name: 'remote', run })] })
})

test('cli() takes the commands of other types as the sub-commands', async () => {
  const run = () => {}
  const entry = define({ name: 'git', run })
  const typed = defineWithTypes<{ extensions: { logger: { log: (message: string) => void } } }>()({
    name: 'typed',
    run: ctx => ctx.extensions.logger.log('typed')
  })
  const list = define({ name: 'list', args: { ...jsonArgs }, run: () => ({ items: ['a'] }) })
  const show = lazy(() => run, { name: 'show', args: { file: { type: 'string' } } })
  await cli([], entry, { subCommands: { typed, list, show } })
  await cli([], entry, { subCommands: new Map([['typed', typed]]) })
  await cli([], entry, { subCommands: [typed, list] })
})

test('cli() takes a loader as a sub-command, which the CLI loads as a lazy command', async () => {
  const run = () => {}
  const entry = define({ name: 'git', run })
  await cli([], entry, { subCommands: { remote: () => define({ name: 'remote', run }) } })
  await cli([], entry, { subCommands: { tag: async () => define({ name: 'tag', run }) } })
})

test('cli() takes a runner, a lazy command and an object as the entry', async () => {
  await cli([], async () => {})
  const git = lazy(() => () => {}, { name: 'git' })
  await cli([], git)
  await cli([], {
    name: 'git',
    args: { verbose: { type: 'boolean' } },
    run: ctx => {
      expectTypeOf(ctx.values.verbose).toEqualTypeOf<boolean | undefined>()
      return String(ctx.values.verbose)
    }
  })
})

/**
 * NOTE(kazupon): an object written in the call of `cli()` is typed by its `args`, as `define` types it (#931). Two
 * forms are not checked, as before: an object written in the table of the sub-commands, which `SubCommandable` takes
 * with any arguments (#440), and a command that spreads `jsonArgs` and returns a string, which the overloads after the
 * first one take with the arguments as `Args`, whose values have no mark of `jsonArgs`.
 */
describe('an object given to cli() as the command (#931)', () => {
  const run = () => {}
  type Logger = { log: (message: string) => void }

  test('cli() infers the values of its arguments', async () => {
    await cli([], {
      name: 'deploy',
      args: {
        replicas: { type: 'number', default: 1 },
        name: { type: 'string' },
        force: { type: 'boolean' },
        file: { type: 'positional' },
        tags: { type: 'string', multiple: true },
        port: integer(),
        retries: withDefault(integer(), 3),
        names: multiple(string())
      },
      run: ctx => {
        expectTypeOf(ctx).not.toBeAny()
        expectTypeOf(ctx.values.replicas).toEqualTypeOf<number>()
        expectTypeOf(ctx.values.name).toEqualTypeOf<string | undefined>()
        expectTypeOf(ctx.values.force).toEqualTypeOf<boolean | undefined>()
        expectTypeOf(ctx.values.file).toEqualTypeOf<string>()
        expectTypeOf(ctx.values.tags).toEqualTypeOf<string[] | undefined>()
        expectTypeOf(ctx.values.port).toEqualTypeOf<number | undefined>()
        expectTypeOf(ctx.values.retries).toEqualTypeOf<number>()
        expectTypeOf(ctx.values.names).toEqualTypeOf<string[] | undefined>()
        expectTypeOf(ctx.values).not.toHaveProperty('replica')
      }
    })
  })

  test('cli() of bone infers them too', async () => {
    await boneCli([], {
      name: 'deploy',
      args: { replicas: { type: 'number', default: 1 } },
      run: ctx => {
        expectTypeOf(ctx.values.replicas).toEqualTypeOf<number>()
      }
    })
  })

  test('cli() infers them from the arguments in a variable', async () => {
    const constArgs = { replicas: { type: 'number', default: 1 } } as const
    const satisfiedArgs = { replicas: { type: 'number', default: 1 } } satisfies Args
    await cli([], {
      args: constArgs,
      run: ctx => {
        expectTypeOf(ctx.values.replicas).toEqualTypeOf<number>()
      }
    })
    await cli([], {
      args: satisfiedArgs,
      run: ctx => {
        expectTypeOf(ctx.values.replicas).toEqualTypeOf<number>()
      }
    })
  })

  test('cli() types the examples, the hooks and the result of a command that spreads jsonArgs', async () => {
    await cli([], { name: 'list', args: { ...jsonArgs }, run: () => ({ items: ['a'] }) })
    await cli(
      [],
      {
        name: 'deploy',
        args: { replicas: { type: 'number', default: 1 } },
        examples: async ctx => {
          expectTypeOf(ctx.values.replicas).toEqualTypeOf<number>()
          return 'deploy --replicas 3'
        },
        run
      },
      {
        onBeforeCommand: ctx => {
          expectTypeOf(ctx.values.replicas).toEqualTypeOf<number>()
        }
      }
    )
  })

  test('cli() takes the type parameter, which types the values with the extensions', async () => {
    const entryArgs = { output: { type: 'string', default: 'json' } } as const
    await cli<{ args: typeof entryArgs; extensions: { logger: Logger } }>([], {
      args: entryArgs,
      run: ctx => {
        expectTypeOf(ctx.values.output).toEqualTypeOf<string>()
        expectTypeOf(ctx.extensions.logger).toEqualTypeOf<Logger>()
      }
    })
    // only the extensions: TypeScript infers none of the type parameters once one is given
    await cli<{ extensions: { logger: Logger } }>([], {
      args: entryArgs,
      run: ctx => {
        expectTypeOf(ctx.values.output).toEqualTypeOf<string | number | boolean | undefined>()
        expectTypeOf(ctx.extensions.logger).toEqualTypeOf<Logger>()
      }
    })
  })

  test('cli() rejects an object that is not a command', async () => {
    // @ts-expect-error 'numbr' is not a type of an argument
    await cli([], { name: 'deploy', args: { n: { type: 'numbr' } }, run })
    // @ts-expect-error `desc` is not a key of an argument (#930)
    await cli([], { name: 'deploy', args: { s: { type: 'string', desc: 'S' } }, run })
    // @ts-expect-error a runner returns a string or nothing, as with define()
    await cli([], { args: { n: { type: 'number', default: 1 } }, run: ctx => ctx.values.n })
    // @ts-expect-error `desc` is not a key of a command (#871)
    await cli([], { name: 'deploy', desc: 'Deploy', run })
  })

  test('cli() of bone rejects an object that is not a command', async () => {
    // @ts-expect-error 'numbr' is not a type of an argument
    await boneCli([], { name: 'deploy', args: { n: { type: 'numbr' } }, run })
    // @ts-expect-error `desc` is not a key of an argument (#930)
    await boneCli([], { name: 'deploy', args: { s: { type: 'string', desc: 'S' } }, run })
  })

  test('cli() takes the commands that are typed', async () => {
    await cli([], ctx => {
      expectTypeOf(ctx).not.toBeAny()
    })
    const typed = defineWithTypes<{ extensions: { logger: Logger } }>()({
      name: 'typed',
      args: { replicas: { type: 'number', default: 1 } },
      run: ctx => ctx.extensions.logger.log(String(ctx.values.replicas))
    })
    await cli([], typed)
    const lazyTyped = lazyWithTypes<{ extensions: { logger: Logger } }>()(
      () => ctx => ctx.extensions.logger.log('lazy'),
      { name: 'lazy' }
    )
    await cli([], lazyTyped)
    const command: Command = { name: 'command', args: { replicas: { type: 'number' } }, run }
    await cli([], command)
    await cli([], { name: 'command', run } as Command)
    const constTyped = { name: 'const', args: { size: { type: 'string' as const } }, run }
    await cli([], constTyped)
    const loose: SubCommandable = { name: 'loose', run }
    await cli([], loose)
    const perf: CommandRunner<{ extensions: { 'x:perf': { start: number } } }> = ctx =>
      String(ctx.extensions['x:perf'].start)
    await cli<{ 'x:perf': { start: number } }>([], perf)
    await cli([], { name: 'git', subCommands: { add: define({ name: 'add', run }) } })
    await cli([], { name: 'method', args: {}, async run() {} })
  })

  test('cli() rejects an object in a variable whose `type` is widened to a string', async () => {
    const plain = { name: 'plain', args: { size: { type: 'string', short: 's' } }, run }
    // @ts-expect-error `type` is a `string`: define it with define(), or write `as const`
    await cli([], plain)
  })
})

describe('an object given to generate() as the command (#931)', () => {
  const run = () => {}

  test('generate() takes the commands that cli() takes', async () => {
    await generate(null, define({ name: 'list', args: { ...jsonArgs }, run: () => ({ ok: true }) }))
    await generate(null, {
      name: 'deploy',
      args: { replicas: { type: 'number', default: 1 } },
      run
    })
    await generate(
      null,
      lazy(() => run, { name: 'show', args: { input: { type: 'string' } } })
    )
  })

  test('generate() rejects an object that is not a command', async () => {
    // @ts-expect-error 'numbr' is not a type of an argument
    await generate(null, { name: 'deploy', args: { n: { type: 'numbr' } }, run })
    // @ts-expect-error `desc` is not a key of an argument
    await generate(null, { name: 'deploy', args: { s: { type: 'string', desc: 'S' } }, run })
    const plain = { name: 'plain', args: { size: { type: 'string' } }, run }
    // @ts-expect-error `type` is a `string`: define it with define(), or write `as const`
    await generate(null, plain)
  })
})
