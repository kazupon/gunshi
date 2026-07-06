import { expectTypeOf, test } from 'vitest'
import {
  SuggestionErrorKeys,
  defineSuggestNames,
  levenshtein,
  pluginId,
  suggestion
} from './index.ts'

import type {
  DistanceFunction,
  ResolvedSuggestionOptions,
  SuggestNames,
  SuggestionErrorCode,
  SuggestionOptions
} from './index.ts'

test('exports plugin APIs', () => {
  expectTypeOf(suggestion).toBeFunction()
  expectTypeOf(pluginId).toEqualTypeOf<'g:suggestion'>()
  expectTypeOf(SuggestionErrorKeys.didYouMean).toEqualTypeOf<'err:suggestion:did-you-mean'>()
  expectTypeOf<SuggestionErrorCode>().toEqualTypeOf<
    (typeof SuggestionErrorKeys)[keyof typeof SuggestionErrorKeys]
  >()
})

test('exports suggestion utility APIs', () => {
  expectTypeOf(levenshtein).toEqualTypeOf<DistanceFunction>()
  expectTypeOf(defineSuggestNames).toBeFunction()
  expectTypeOf<SuggestNames>().toEqualTypeOf<
    (typed: string, candidates: readonly string[]) => string[]
  >()
})

test('accepts suggestion options', () => {
  const options: SuggestionOptions = {
    maxDistance: 1,
    maxSuggestions: 2,
    includeOptions: true,
    includeCommands: false,
    distance: () => 0,
    normalize: value => value.toLowerCase()
  }

  const resolved: ResolvedSuggestionOptions = {
    maxDistance: options.maxDistance!,
    maxSuggestions: options.maxSuggestions!,
    includeOptions: options.includeOptions!,
    includeCommands: options.includeCommands!,
    distance: options.distance!,
    normalize: options.normalize!
  }

  expectTypeOf(defineSuggestNames(resolved)).toEqualTypeOf<SuggestNames>()
})
