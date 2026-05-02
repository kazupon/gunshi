/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { expectTypeOf, test } from 'vitest'
import type { Args, ArgExplicitlyProvided, ArgValues } from 'args-tokens'
import type { Awaitable, ValueResolutionSources } from './types.ts'

type StringArg = { type: 'string' }
type NumberArg = { type: 'number' }
type BooleanArg = { type: 'boolean' }

type MyArgs = Args & {
  name: StringArg
  port: NumberArg
  debug: BooleanArg
}

test('ValueResolutionSources.values is typed as ArgValues<A>', () => {
  type Sources = ValueResolutionSources<MyArgs>
  expectTypeOf<Sources['values']>().toEqualTypeOf<ArgValues<MyArgs>>()
})

test('ValueResolutionSources.explicit is typed as ArgExplicitlyProvided<A>', () => {
  type Sources = ValueResolutionSources<MyArgs>
  expectTypeOf<Sources['explicit']>().toEqualTypeOf<ArgExplicitlyProvided<MyArgs>>()
})

test('sources.values.name resolves to string | undefined', () => {
  type Sources = ValueResolutionSources<MyArgs>
  expectTypeOf<Sources['values']['name']>().toEqualTypeOf<string | undefined>()
})

test('sources.values.port resolves to number | undefined', () => {
  type Sources = ValueResolutionSources<MyArgs>
  expectTypeOf<Sources['values']['port']>().toEqualTypeOf<number | undefined>()
})

test('sources.values.debug resolves to boolean | undefined', () => {
  type Sources = ValueResolutionSources<MyArgs>
  expectTypeOf<Sources['values']['debug']>().toEqualTypeOf<boolean | undefined>()
})

test('sources.explicit flags resolve to boolean', () => {
  type Sources = ValueResolutionSources<MyArgs>
  expectTypeOf<Sources['explicit']['name']>().toEqualTypeOf<boolean>()
  expectTypeOf<Sources['explicit']['port']>().toEqualTypeOf<boolean>()
  expectTypeOf<Sources['explicit']['debug']>().toEqualTypeOf<boolean>()
})

test('onResolveValue hook return type is Awaitable<ArgValues<A> | undefined>', () => {
  type Hook = (sources: ValueResolutionSources<MyArgs>) => Awaitable<ArgValues<MyArgs> | undefined>
  // Sync return: ArgValues<MyArgs>
  expectTypeOf<ReturnType<Hook>>().toEqualTypeOf<Awaitable<ArgValues<MyArgs> | undefined>>()
})

test('onResolveValue hook accepts ValueResolutionSources<A> as parameter', () => {
  type Hook = (sources: ValueResolutionSources<MyArgs>) => Awaitable<ArgValues<MyArgs> | undefined>
  expectTypeOf<Parameters<Hook>[0]>().toEqualTypeOf<ValueResolutionSources<MyArgs>>()
})

test('ValueResolutionSources defaults A to Args when no type parameter given', () => {
  type DefaultSources = ValueResolutionSources
  expectTypeOf<DefaultSources['values']>().toEqualTypeOf<ArgValues<Args>>()
  expectTypeOf<DefaultSources['explicit']>().toEqualTypeOf<ArgExplicitlyProvided<Args>>()
})
