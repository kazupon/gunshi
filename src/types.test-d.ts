import { expectTypeOf, test } from 'vitest'
import { cli } from './cli.ts'
import { define } from './definition.ts'

import type { ArgOptions } from 'args-tokens'
import type { KeyOfArgOptions } from './types.ts'

test('KeyOfArgOptions', () => {
  const _options = {
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
  } satisfies ArgOptions
  expectTypeOf<KeyOfArgOptions<typeof _options>>().toEqualTypeOf<'foo' | 'bar' | 'baz' | 'no-baz'>()
})

test('specified read only value as enum option default', async () => {
  const choices = ['a', 'b'] as const

  const command = define({
    options: {
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
