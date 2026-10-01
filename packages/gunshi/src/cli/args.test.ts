import { describe, expect, test } from 'vitest'
import { resolveCommandArgs } from './args.ts'

import type { ArgSchema, Args } from '../types.ts'

describe('resolveCommandArgs', () => {
  const globalOptions = new Map<string, ArgSchema>([
    ['help', { type: 'boolean', short: 'h', description: 'Display this help message' }],
    ['version', { type: 'boolean', short: 'v', description: 'Display this version' }]
  ])

  test('the global options come first, and the command shadows them by name', () => {
    const args: Args = resolveCommandArgs(globalOptions, {
      version: { type: 'string', description: 'Version to release' }
    } satisfies Args)

    expect(Object.keys(args)).toEqual(['help', 'version'])
    expect(args.version).toEqual({ type: 'string', description: 'Version to release' })
  })

  test('a global option gives up a short name that the command claims', () => {
    // the return type is the one of the command, as the core resolves it: the global options are
    // there at run time, so the result is read through `Args` to reach them
    const args: Args = resolveCommandArgs(globalOptions, {
      verbose: { type: 'boolean', short: 'v' }
    } satisfies Args)

    expect(args.version.short).toBeUndefined()
    expect(args.version.type).toEqual('boolean')
    expect(args.help.short).toEqual('h')
  })

  test('the schema of the global option is not changed', () => {
    resolveCommandArgs(globalOptions, { verbose: { type: 'boolean', short: 'v' } } satisfies Args)

    expect(globalOptions.get('version')!.short).toEqual('v')
  })

  test('a positional argument claims no short name', () => {
    const args: Args = resolveCommandArgs(globalOptions, {
      // `short` means nothing on a positional argument
      value: { type: 'positional', short: 'v' }
    } as Args)

    expect(args.version.short).toEqual('v')
  })

  test('without global options, the arguments of the command are all there is', () => {
    const args = resolveCommandArgs(undefined, { port: { type: 'number' } } satisfies Args)

    expect(Object.keys(args)).toEqual(['port'])
  })

  test('without arguments, the global options are all there is', () => {
    expect(Object.keys(resolveCommandArgs(globalOptions))).toEqual(['help', 'version'])
  })

  test('the result has no prototype, so an argument cannot be named after one', () => {
    expect(Object.getPrototypeOf(resolveCommandArgs(globalOptions, {}))).toBeNull()
  })
})
