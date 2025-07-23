import { define } from 'gunshi'
import { createCommandContext } from 'gunshi/context'
import { describe, expect, test } from 'vitest'
import { resolveArgKey, resolveKey } from './utils.ts'

import type { Args } from 'gunshi'

const args = {
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
    expect(resolveArgKey<typeof args>('bar')).toBe('arg:bar')
  })

  test('resolve with command context', async () => {
    const cmd = define({
      name: 'test',
      args
    })
    const ctx = await createCommandContext({
      args: cmd.args!,
      values: {},
      positionals: [],
      explicit: {},
      rest: [],
      argv: [],
      tokens: [],
      omitted: false,
      callMode: 'subCommand',
      command: cmd,
      extensions: {},
      cliOptions: {}
    })

    expect(resolveArgKey('foo', ctx)).toBe('test:arg:foo')
    expect(resolveArgKey<typeof args>('bar', ctx)).toBe('test:arg:bar')
  })
})

describe('resolveKey', () => {
  test('basic resolving', () => {
    expect(resolveKey('foo')).toBe('foo')
  })

  test('resolve with command context', async () => {
    const cmd = define({
      name: 'test',
      args
    })
    const ctx = await createCommandContext({
      args: cmd.args!,
      values: {},
      positionals: [],
      explicit: {},
      rest: [],
      argv: [],
      tokens: [],
      omitted: false,
      callMode: 'subCommand',
      command: cmd,
      extensions: {},
      cliOptions: {}
    })

    expect(resolveKey('foo', ctx)).toBe('test:foo')
  })

  test('resolve with command context without name', async () => {
    const cmd = define({
      args
    })
    const ctx = await createCommandContext({
      args: cmd.args!,
      values: {},
      positionals: [],
      explicit: {},
      rest: [],
      argv: [],
      tokens: [],
      omitted: false,
      callMode: 'subCommand',
      command: cmd,
      extensions: {},
      cliOptions: {}
    })

    expect(resolveKey('foo', ctx)).toBe('(anonymous):foo')
  })
})
