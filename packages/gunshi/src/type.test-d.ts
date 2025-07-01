import { expectTypeOf, test } from 'vitest'
import type { Args, CommandContext, DefaultGunshiParams, GunshiParams } from './types.ts'

const _args1 = {
  say: {
    type: 'string',
    description: 'say something',
    default: 'hello!'
  }
} satisfies Args

type Extension1 = {
  foo: string
  getFoo(): string
}

interface Extension2 {
  bar: number
  getBar(): number
}

test('GunshiParams', () => {
  // default
  expectTypeOf<GunshiParams>().toEqualTypeOf<{ args: Args; extensions: {} }>()

  // specify args
  expectTypeOf<GunshiParams<{ args: typeof _args1 }>>().toEqualTypeOf<
    GunshiParams<{ args: typeof _args1 }>
  >()

  // specify extensions
  expectTypeOf<GunshiParams<{ extensions: { foo: Extension1 } }>>().toEqualTypeOf<
    GunshiParams<{ extensions: { foo: Extension1 } }>
  >()

  // for interface extensions
  expectTypeOf<GunshiParams<{ extensions: { foo: Extension2 } }>>().toEqualTypeOf<
    GunshiParams<{ extensions: { foo: Extension2 } }>
  >()

  // specify args and extensions
  expectTypeOf<
    GunshiParams<{ args: typeof _args1; extensions: { foo: Extension1 } }>
  >().toEqualTypeOf<GunshiParams<{ args: typeof _args1; extensions: { foo: Extension1 } }>>()
})

test('DefaultGunshiParams', () => {
  expectTypeOf<DefaultGunshiParams>().toEqualTypeOf<GunshiParams>()
  expectTypeOf<DefaultGunshiParams>().not.toEqualTypeOf<{
    args: typeof _args1
    extensions: { foo: Extension1 }
  }>()
})

test('CommandContext extensions', () => {
  // default
  expectTypeOf<CommandContext['extensions']>().toEqualTypeOf<undefined>()

  // with extensions only
  type t1 = CommandContext<{ extensions: { foo: Extension1 } }>
  expectTypeOf<t1['extensions']>().toEqualTypeOf<{ foo: Extension1 }>()

  // for interface extensions
  type t2 = CommandContext<{ extensions: { foo: Extension2 } }>
  expectTypeOf<t2['extensions']>().toEqualTypeOf<{ foo: Extension2 }>()

  // with args and extensions
  type t3 = CommandContext<{ args: typeof _args1; extensions: { foo: Extension1 } }>
  expectTypeOf<t3['extensions']>().toEqualTypeOf<{ foo: Extension1 }>()
})
