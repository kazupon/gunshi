import { expectTypeOf, test } from 'vitest'

import type { Args } from 'args-tokens'
import type {
  CommandContext,
  CommandRunner,
  ExtractCommandContextExtension,
  KeyOfArgs
} from './types.ts'

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
  expectTypeOf<KeyOfArgs<typeof _args>>().toEqualTypeOf<'foo' | 'bar' | 'baz' | 'no-baz'>()
})

type A = {
  foo: {
    type: 'string'
  }
}
type E = {
  ext1: {
    foo: number
  }
  ext2: {
    bar: string
  }
}

test('CommandContext', () => {
  // Args type argument
  type T1 = CommandContext<A>
  expectTypeOf<T1['extensions']>().toEqualTypeOf<undefined>()
  // Args and Extend type argument
  type T2 = CommandContext<A, E>
  expectTypeOf<T2['extensions']>().toEqualTypeOf<E>()
})

test('CommandRunner', () => {
  // Args type argument
  type C1 = Parameters<CommandRunner<A>>[0]
  expectTypeOf<C1['extensions']>().toEqualTypeOf<undefined>()

  // Args and Extend type argument
  type C2 = Parameters<CommandRunner<A, E>>[0]
  expectTypeOf<C2['extensions']>().toEqualTypeOf<E>()
})

test('ExtractCommandContextExtension', () => {
  const _extensions = {
    ext1: {
      key: Symbol('ext1'),
      factory: () => ({ value1: 'test1' })
    },
    ext2: {
      key: Symbol('ext2'),
      factory: () => ({ value2: 'test2' })
    },
    ext3: {
      key: Symbol('ext3'),
      factory: () => ({ value3: 'test3' })
    }
  }

  type T1 = ExtractCommandContextExtension<typeof _extensions>
  expectTypeOf<T1>().toEqualTypeOf<{
    ext1: { value1: string }
    ext2: { value2: string }
    ext3: { value3: string }
  }>()
})
