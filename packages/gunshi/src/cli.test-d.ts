/**
 * Type test for cli() and define() inference
 * This test verifies that type inference works correctly when combining cli() and define()
 */

import { expectTypeOf, test } from 'vite-plus/test'
import { cli } from './cli.ts'
import { define, defineWithTypes, jsonArgs, lazy } from './definition.ts'

import type { Command, CommandContext } from './types.ts'

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
    run: ctx => String(ctx.values.verbose)
  })
})
