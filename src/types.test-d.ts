import { expectTypeOf, test } from 'vitest'

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
