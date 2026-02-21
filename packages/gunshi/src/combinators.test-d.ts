import { expectTypeOf, test } from 'vitest'
import {
  args,
  boolean,
  choice,
  integer,
  merge,
  required,
  short,
  string,
  withDefault
} from './combinators.ts'
import { define } from './definition.ts'

import type { Args, ArgSchema } from './types.ts'
import type { CombinatorSchema } from './combinators.ts'

test('CombinatorSchema extends ArgSchema', () => {
  const s = string()
  expectTypeOf(s).toMatchTypeOf<ArgSchema>()

  const n = integer()
  expectTypeOf(n).toMatchTypeOf<ArgSchema>()

  const b = boolean()
  expectTypeOf(b).toMatchTypeOf<ArgSchema>()
})

test('combinator-built args satisfy Args', () => {
  const a = {
    name: required(string()),
    port: withDefault(integer(), 8080)
  }
  expectTypeOf(a).toMatchTypeOf<Args>()
})

test('merged schemas satisfy Args', () => {
  const common = args({ verbose: boolean() })
  const network = args({ host: required(string()), port: withDefault(integer(), 8080) })
  const merged = merge(common, network)
  expectTypeOf(merged).toMatchTypeOf<Args>()
})

test('define with combinators infers ctx.values types', () => {
  define({
    name: 'test',
    args: {
      host: withDefault(string(), 'localhost'),
      port: withDefault(integer(), 8080),
      verbose: short(boolean(), 'v'),
      level: choice(['debug', 'info'] as const)
    },
    run: ctx => {
      expectTypeOf(ctx.values.host).toEqualTypeOf<string>()
      expectTypeOf(ctx.values.port).toEqualTypeOf<number>()
      expectTypeOf(ctx.values.verbose).toEqualTypeOf<boolean | undefined>()
      expectTypeOf(ctx.values.level).toEqualTypeOf<'debug' | 'info' | undefined>()
    }
  })
})

test('CombinatorSchema type parameter', () => {
  const s: CombinatorSchema<string> = string()
  expectTypeOf(s.parse).toMatchTypeOf<(value: string) => string>()

  const n: CombinatorSchema<number> = integer()
  expectTypeOf(n.parse).toMatchTypeOf<(value: string) => number>()
})
