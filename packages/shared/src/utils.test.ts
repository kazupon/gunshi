import { describe, expect, test } from 'vitest'
import { resolveArgKey, resolveKey } from './utils.ts'

import type { Args } from 'gunshi'

const _args = {
  foo: {
    type: 'string',
    description: 'Foo argument description',
    short: 'f'
  },
  bar: {
    type: 'boolean',
    description: 'Bar argument description',
    negatable: true
  }
} satisfies Args

describe('resolveArgKey', () => {
  test('basic resolving', () => {
    expect(resolveArgKey('foo')).toBe('arg:foo')
    expect(resolveArgKey<typeof _args>('bar')).toBe('arg:bar')
  })

  test('resolve with command context', () => {
    expect(resolveArgKey('foo', 'test')).toBe('test:arg:foo')
    // Infer key type from args
    expect(resolveArgKey<typeof _args>('bar', 'test')).toBe('test:arg:bar')
  })
})

describe('resolveKey', () => {
  test('basic resolving', () => {
    expect(resolveKey('foo')).toBe('foo')
  })

  test('resolve with command context', () => {
    expect(resolveKey('foo', 'test')).toBe('test:foo')
  })
})
