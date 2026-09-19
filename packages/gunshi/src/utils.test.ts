import { describe, expect, test } from 'vitest'
import { lazy } from './definition.ts'
import { resolveLazyCommand } from './utils.ts'

import type { Args, Command, CommandRunner } from './types.ts'

const run: CommandRunner = () => {}

describe('resolveLazyCommand', () => {
  const definition = {
    name: 'deploy',
    description: 'Deploy the app',
    args: { env: { type: 'string', short: 'e' } } satisfies Args,
    examples: '$ my-cli deploy --env prod',
    internal: true,
    entry: true,
    subCommands: { status: { name: 'status', run } }
  }

  const loaded = {
    name: 'loaded',
    description: 'Loaded description',
    args: { target: { type: 'string' } } satisfies Args,
    examples: '$ my-cli loaded',
    internal: false,
    entry: false,
    subCommands: { logs: { name: 'logs', run } }
  }

  test('not run the loader unless it is requested', async () => {
    let called = 0
    const cmd = lazy(() => {
      called++
      return run
    }, definition)

    const resolved = await resolveLazyCommand(cmd)

    expect(called).toBe(0)
    expect(resolved).toMatchObject({ ...definition, subCommands: expect.anything() })
    expect(resolved.run).toBeUndefined()
  })

  test('loader that returns a command runner keeps the definition', async () => {
    const resolved = await resolveLazyCommand(
      lazy(() => run, definition),
      'key',
      true
    )

    expect(resolved).toMatchObject({ ...definition, subCommands: expect.anything(), run })
  })

  test('loader that returns a command without the properties falls back to the definition', async () => {
    const resolved = await resolveLazyCommand(
      lazy(() => ({ run }), definition),
      'key',
      true
    )

    expect(resolved.run).toBe(run)
    expect(resolved.name).toBe('deploy')
    expect(resolved.description).toBe('Deploy the app')
    expect(resolved.args).toEqual(definition.args)
    expect(resolved.examples).toBe('$ my-cli deploy --env prod')
    expect(resolved.internal).toBe(true)
    expect(resolved.entry).toBe(true)
    expect(Object.keys(resolved.subCommands || {})).toEqual(['status'])
  })

  test('loader that returns a command with the properties wins over the definition', async () => {
    const resolved = await resolveLazyCommand(
      lazy(() => ({ ...loaded, run }), definition),
      'key',
      true
    )

    expect(resolved.name).toBe('loaded')
    expect(resolved.description).toBe('Loaded description')
    expect(resolved.args).toEqual(loaded.args)
    expect(resolved.examples).toBe('$ my-cli loaded')
    expect(resolved.internal).toBe(false)
    expect(resolved.entry).toBe(false)
    expect(Object.keys(resolved.subCommands || {})).toEqual(['logs'])
  })

  test('falsy values of the loaded command are not taken as missing', async () => {
    const resolved = await resolveLazyCommand(
      lazy(
        () => ({ run, description: '', args: {}, examples: '', internal: false, entry: false }),
        definition
      ),
      'key',
      true
    )

    expect(resolved.description).toBe('')
    expect(resolved.args).toEqual({})
    // a command that declares no examples must not inherit the ones of the definition
    expect(resolved.examples).toBe('')
    expect(resolved.internal).toBe(false)
    expect(resolved.entry).toBe(false)
  })

  test('`undefined` of the loaded command falls back to the definition', async () => {
    const partial: Command = { run, description: undefined, args: undefined }
    const resolved = await resolveLazyCommand(
      lazy(() => partial, definition),
      'key',
      true
    )

    expect(resolved.description).toBe('Deploy the app')
    expect(resolved.args).toEqual(definition.args)
  })

  test('command name: the loaded command, the definition, then the given name', async () => {
    const byLoaded = await resolveLazyCommand(
      lazy(() => ({ name: 'loaded', run }), { name: 'deploy' }),
      'key',
      true
    )
    const byDefinition = await resolveLazyCommand(
      lazy(() => ({ run }), { name: 'deploy' }),
      'key',
      true
    )
    // a command that is not lazy has no definition to fall back to
    const byGivenName = await resolveLazyCommand({ run }, 'key', true)

    expect(byLoaded.name).toBe('loaded')
    expect(byDefinition.name).toBe('deploy')
    expect(byGivenName.name).toBe('key')
  })
})
