import { expectTypeOf, test } from 'vitest'

import type { Awaitable } from '@gunshi/plugin'
import type { DryRunExtension } from './index.ts'

declare const extension: DryRunExtension

test('run supports void tasks without fallback options', () => {
  expectTypeOf(extension.run(() => {})).toEqualTypeOf<Awaitable<void>>()
  expectTypeOf(
    extension.run(() => {}, {
      message: 'publish package'
    })
  ).toEqualTypeOf<Awaitable<void>>()
})

test('run requires fallback options for non-void tasks', () => {
  expectTypeOf(extension.run(() => 'actual', { result: 'fallback' })).toEqualTypeOf<
    Awaitable<string>
  >()
  expectTypeOf(
    extension.run(() => 'actual', {
      resolve: () => 'fallback'
    })
  ).toEqualTypeOf<Awaitable<string>>()

  // @ts-expect-error non-void tasks need a dry-run fallback result
  void extension.run(() => 'actual')

  // @ts-expect-error message alone cannot produce a non-void result in dry-run mode
  void extension.run(() => 'actual', { message: 'create release' })
})

test('wrap supports void functions without fallback options', () => {
  expectTypeOf(extension.wrap((_file: string) => {})).toEqualTypeOf<
    (file: string) => Awaitable<void>
  >()
  expectTypeOf(
    extension.wrap((_file: string) => {}, {
      message: 'write file'
    })
  ).toEqualTypeOf<(file: string) => Awaitable<void>>()
})

test('wrap requires fallback options for non-void functions', () => {
  expectTypeOf(extension.wrap((file: string) => file, { result: 'fallback' })).toEqualTypeOf<
    (file: string) => Awaitable<string>
  >()
  expectTypeOf(
    extension.wrap((file: string) => file, {
      resolve: file => `dry:${file}`
    })
  ).toEqualTypeOf<(file: string) => Awaitable<string>>()

  // @ts-expect-error non-void functions need a dry-run fallback result
  extension.wrap((file: string) => file)

  // @ts-expect-error message alone cannot produce a non-void result in dry-run mode
  extension.wrap((file: string) => file, { message: 'write file' })
})
