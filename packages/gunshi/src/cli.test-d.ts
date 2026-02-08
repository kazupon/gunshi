/**
 * Type test for cli() and define() inference
 * This test verifies that type inference works correctly when combining cli() and define()
 */

import { expectTypeOf, test } from 'vitest'
import { cli } from './cli.ts'
import { define } from './definition.ts'

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
