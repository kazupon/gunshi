import { describe, expectTypeOf, test } from 'vite-plus/test'
import {
  args,
  boolean,
  choice,
  hidden,
  integer,
  merge,
  positional,
  required,
  short,
  string,
  unrequired,
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
      query: unrequired(positional()),
      level: choice(['debug', 'info'] as const)
    },
    run: ctx => {
      expectTypeOf(ctx.values.host).toEqualTypeOf<string>()
      expectTypeOf(ctx.values.port).toEqualTypeOf<number>()
      expectTypeOf(ctx.values.verbose).toEqualTypeOf<boolean | undefined>()
      expectTypeOf(ctx.values.query).toEqualTypeOf<string | undefined>()
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

test('hidden combinator marks schema as hidden', () => {
  const s = hidden(string())
  expectTypeOf(s).toMatchTypeOf<ArgSchema>()
  expectTypeOf(s.hidden).toEqualTypeOf<true>()
})

describe('type inference with combinators', () => {
  test('withDefault makes values non-optional', () => {
    define({
      name: 'test',
      args: {
        host: withDefault(string(), 'localhost'),
        port: withDefault(integer(), 8080)
      },
      run: ctx => {
        expectTypeOf(ctx.values.host).toEqualTypeOf<string>()
        expectTypeOf(ctx.values.port).toEqualTypeOf<number>()
      }
    })
  })

  test('required string', () => {
    define({
      name: 'test',
      args: {
        name: required(string())
      },
      run: ctx => {
        expectTypeOf(ctx.values.name).toEqualTypeOf<string>()
      }
    })
  })

  test('optional combinators', () => {
    define({
      name: 'test',
      args: {
        flag: boolean(),
        value: string()
      },
      run: ctx => {
        expectTypeOf(ctx.values.flag).toEqualTypeOf<boolean | undefined>()
        expectTypeOf(ctx.values.value).toEqualTypeOf<string | undefined>()
      }
    })
  })

  test('unrequired positional combinator', () => {
    define({
      name: 'test',
      args: {
        query: unrequired(positional()),
        file: positional()
      },
      run: ctx => {
        expectTypeOf(ctx.values.query).toEqualTypeOf<string | undefined>()
        expectTypeOf(ctx.values.file).toEqualTypeOf<string>()
      }
    })
  })

  test('choice literal type inference', () => {
    define({
      name: 'test',
      args: {
        level: choice(['debug', 'info', 'warn', 'error'] as const)
      },
      run: ctx => {
        expectTypeOf(ctx.values.level).toEqualTypeOf<
          'debug' | 'info' | 'warn' | 'error' | undefined
        >()
      }
    })
  })
})
