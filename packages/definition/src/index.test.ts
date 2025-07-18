import { createCommandContext } from 'gunshi/context'
import { describe, expect, test } from 'vitest'
import { define, lazy } from './index.ts'

import type { CommandRunner } from './index.ts'

describe('@gunshi/definition', () => {
  test('define', async () => {
    const command = define({
      name: 'test',
      description: 'A test command',
      args: {
        foo: {
          type: 'string',
          description: 'A string option'
        }
      },
      run: ctx => {
        return `foo value: ${ctx.values.foo}`
      }
    })

    // check command properties
    expect(command.name).toBe('test')
    expect(command.description).toBe('A test command')
    expect(command.args!.foo.type).toBe('string')

    // test command execution
    const ctx = await createCommandContext({
      args: command.args!,
      values: { foo: 'bar' },
      explicit: { foo: true },
      positionals: [],
      rest: [],
      argv: [],
      tokens: [],
      omitted: false,
      callMode: 'entry',
      command,
      cliOptions: {
        cwd: '/path/to/cmd1',
        version: '0.0.0',
        name: 'cmd1'
      }
    })
    const result = await command.run!(ctx as Parameters<NonNullable<typeof command.run>>[0])
    expect(result).toBe('foo value: bar')
  })

  test('lazy', async () => {
    const command = lazy(() => ctx => ctx.values.foo, {
      name: 'lazy-test',
      description: 'A lazy test command',
      args: {
        foo: {
          type: 'string',
          description: 'A string option'
        }
      }
    })

    // load the command
    const loadedCommand = (await command()) as CommandRunner
    expect(loadedCommand).toBeTypeOf('function')

    // test command execution
    const ctx = await createCommandContext({
      args: command.args!,
      explicit: { foo: true },
      values: { foo: 'bar' },
      positionals: [],
      rest: [],
      argv: [],
      tokens: [],
      omitted: false,
      callMode: 'entry',
      command,
      cliOptions: {
        cwd: '/path/to/cmd1',
        version: '0.0.0',
        name: 'cmd1'
      }
    })
    const result = await loadedCommand(ctx)
    expect(result).toBe('bar')
  })
})
