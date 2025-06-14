import { expectTypeOf, test } from 'vitest'

import { PluginExtension } from './plugin.ts'

test('PluginExtension', () => {
  type T1 = PluginExtension<{ foo: number }>
  expectTypeOf<ReturnType<T1>>().toEqualTypeOf<{ foo: number }>()
})
