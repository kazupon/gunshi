import { expectTypeOf, test } from 'vitest'
import { cli } from './cli.ts'
import { define } from './definition.ts'

import type { Args } from 'args-tokens'
import type { KeyOfArgOptions } from './types.ts'

test('KeyOfArgOptions', () => {
  const _args = {
    foo: {
      type: 'string'
    },
    bar: {
      type: 'boolean'
    },
    baz: {
      type: 'boolean',
      negatable: true
    }
  } satisfies Args
  expectTypeOf<KeyOfArgOptions<typeof _args>>().toEqualTypeOf<'foo' | 'bar' | 'baz' | 'no-baz'>()
})

test('specified read only value as enum option default', async () => {
  const choices = ['a', 'b'] as const

  const command = define({
    args: {
      foo: {
        type: 'enum',
        choices
      }
    },
    run: ctx => {
      expectTypeOf(ctx.values.foo).toEqualTypeOf<'a' | 'b' | undefined>()
    }
  })

  await cli(['--foo', 'a'], command)
})
