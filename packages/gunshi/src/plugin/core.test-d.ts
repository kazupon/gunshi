import { expectTypeOf, test } from 'vitest'

import { PluginExtension } from './core.ts'

test('PluginExtension', () => {
  type T1 = PluginExtension<{ foo: number }>
  expectTypeOf<Awaited<ReturnType<T1>>>().toEqualTypeOf<{ foo: number }>()
})
