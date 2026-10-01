import { describe, expect, test } from 'vitest'
import { resolveCommandArgs as resolveCommandArgsOfCore } from '../../gunshi/src/cli/args.ts'
import {
  resolveArgKey,
  resolveCommandArgs,
  resolveDisplayName,
  resolveKey,
  resolveOptionNames
} from './utils.ts'

import type { ArgSchema, Args } from 'gunshi'

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

describe('resolveDisplayName', () => {
  test('leaves the name alone without `toKebab`', () => {
    expect(resolveDisplayName('dryRun', { type: 'boolean' })).toEqual('dryRun')
  })

  test('kebab-cases the name when the command asks for it', () => {
    expect(resolveDisplayName('dryRun', { type: 'boolean' }, true)).toEqual('dry-run')
  })

  test('kebab-cases the name when the schema asks for it', () => {
    expect(resolveDisplayName('dryRun', { type: 'boolean', toKebab: true })).toEqual('dry-run')
  })
})

describe('resolveOptionNames', () => {
  test('collects the names as they are rendered', () => {
    const names = resolveOptionNames(
      { noDryRun: { type: 'boolean' }, dryRun: { type: 'boolean' } } satisfies Args,
      true
    )

    expect([...names]).toEqual(['no-dry-run', 'dry-run'])
  })

  test('two keys that render alike collapse into one name', () => {
    const names = resolveOptionNames(
      { 'no-dry-run': { type: 'boolean' }, noDryRun: { type: 'boolean' } } satisfies Args,
      true
    )

    expect([...names]).toEqual(['no-dry-run'])
  })

  test('a positional argument is left out', () => {
    const names = resolveOptionNames(
      { target: { type: 'positional' }, dryRun: { type: 'boolean' } } satisfies Args,
      true
    )

    expect([...names]).toEqual(['dry-run'])
  })

  test('a hidden argument is counted', () => {
    const names = resolveOptionNames(
      { noDryRun: { type: 'boolean', hidden: true } } satisfies Args,
      true
    )

    expect([...names]).toEqual(['no-dry-run'])
  })

  test('the `toKebab` of a schema is read per argument', () => {
    const names = resolveOptionNames({
      dryRun: { type: 'boolean', toKebab: true },
      logLevel: { type: 'boolean' }
    } satisfies Args)

    expect([...names]).toEqual(['dry-run', 'logLevel'])
  })
})

describe('resolveCommandArgs', () => {
  const globalOptions = new Map<string, ArgSchema>([
    ['help', { type: 'boolean', short: 'h', description: 'Display this help message' }],
    ['version', { type: 'boolean', short: 'v', description: 'Display this version' }]
  ])

  // `@gunshi/plugin-completion` completes the arguments with this copy, so it has to resolve them
  // as the core does when it parses and renders them
  test.each<[string, ReadonlyMap<string, ArgSchema> | undefined, Args | undefined]>([
    [
      'the command shadows a global option by name',
      globalOptions,
      { version: { type: 'string', description: 'Version to release' } }
    ],
    [
      'the command claims the short name of a global option',
      globalOptions,
      { verbose: { type: 'boolean', short: 'v' } }
    ],
    [
      'a positional argument claims no short name',
      globalOptions,
      // `short` means nothing on a positional argument
      { value: { type: 'positional', short: 'v' } } as Args
    ],
    ['no global options', undefined, { port: { type: 'number' } }],
    ['no arguments', globalOptions, undefined],
    ['empty arguments', globalOptions, {}]
  ])('%s: the same result as the core', (_, globals, args) => {
    const resolved = resolveCommandArgs(globals, args)
    const resolvedByCore = resolveCommandArgsOfCore(globals, args)

    expect(Object.keys(resolved)).toEqual(Object.keys(resolvedByCore))
    expect(resolved).toStrictEqual(resolvedByCore)
    expect(Object.getPrototypeOf(resolved)).toBeNull()
  })

  test('the schema of the global option is not changed', () => {
    resolveCommandArgs(globalOptions, { verbose: { type: 'boolean', short: 'v' } } satisfies Args)

    expect(globalOptions.get('version')!.short).toEqual('v')
  })
})
