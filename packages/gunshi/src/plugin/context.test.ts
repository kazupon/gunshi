import { describe, expect, expectTypeOf, test } from 'vitest'
import { createCommandContext } from '../context.ts'
import { createDecorators } from '../decorators.ts'
import { createPluginContext } from './context.ts'

import type { Args } from 'args-tokens'
import type { GunshiParams } from '../types.ts'

describe('PluginContext#addGlobalOpttion', () => {
  test('basic', () => {
    const decorators = createDecorators()
    const ctx = createPluginContext(decorators)
    ctx.addGlobalOption('foo', { type: 'string', description: 'foo option' })

    expect(ctx.globalOptions.size).toBe(1)
    expect(ctx.globalOptions.get('foo')).toEqual({
      type: 'string',
      description: 'foo option'
    })
  })

  test('name empty', () => {
    const decorators = createDecorators()
    const ctx = createPluginContext(decorators)

    expect(() => ctx.addGlobalOption('', { type: 'string' })).toThrow(
      'Option name must be a non-empty string'
    )
  })

  test('duplicate name', () => {
    const decorators = createDecorators()
    const ctx = createPluginContext(decorators)
    ctx.addGlobalOption('foo', { type: 'string', description: 'foo option' })

    expect(() => ctx.addGlobalOption('foo', { type: 'string' })).toThrow(
      `Global option 'foo' is already registered`
    )
  })
})

type Auth = { token: string; login: () => string }
type Logger = { log: (msg: string) => void; level: string }

test('PluginContext#decorateHeaderRenderer', async () => {
  const decorators = createDecorators<GunshiParams<{ args: Args; extensions: Auth }>>()
  const ctx = createPluginContext<GunshiParams<{ args: Args; extensions: Auth }>>(decorators)

  ctx.decorateHeaderRenderer<Logger>(async (baseRenderer, cmdCtx) => {
    const result = await baseRenderer(cmdCtx)

    expectTypeOf(cmdCtx.extensions).toEqualTypeOf<Auth & Logger>()
    return `[DECORATED] ${result}`
  })

  const renderer = decorators.getHeaderRenderer()
  const mockCtx = await createCommandContext<GunshiParams<{ args: Args; extensions: Auth }>>({})
  const result = await renderer(mockCtx)

  expect(result).toBe('[DECORATED] ')
})

test('PluginContext#decorateUsageRenderer', async () => {
  const decorators = createDecorators<GunshiParams<{ args: Args; extensions: Auth }>>()
  const ctx = createPluginContext<GunshiParams<{ args: Args; extensions: Auth }>>(decorators)

  ctx.decorateUsageRenderer<Logger>(async (baseRenderer, cmdCtx) => {
    const result = await baseRenderer(cmdCtx)

    expectTypeOf(cmdCtx.extensions).toEqualTypeOf<Auth & Logger>()

    return `[USAGE] ${result}`
  })

  const renderer = decorators.getUsageRenderer()
  const mockCtx = await createCommandContext<GunshiParams<{ args: Args; extensions: Auth }>>({})
  const result = await renderer(mockCtx)

  expect(result).toBe('[USAGE] ')
})

test('PluginContext#decorateValidationErrorsRenderer', async () => {
  const decorators = createDecorators<GunshiParams<{ args: Args; extensions: Auth }>>()
  const ctx = createPluginContext<GunshiParams<{ args: Args; extensions: Auth }>>(decorators)

  ctx.decorateValidationErrorsRenderer<Logger>(async (baseRenderer, cmdCtx, error) => {
    const result = await baseRenderer(cmdCtx, error)

    expectTypeOf(cmdCtx.extensions).toEqualTypeOf<Auth & Logger>()

    return `[ERROR] ${result}`
  })

  const renderer = decorators.getValidationErrorsRenderer()
  const mockCtx = await createCommandContext<GunshiParams<{ args: Args; extensions: Auth }>>({})
  const error = new AggregateError([new Error('Test')], 'Validation failed')
  const result = await renderer(mockCtx, error)

  expect(result).toBe('[ERROR] ')
})

test('PluginContext#decorateCommand', async () => {
  const decorators = createDecorators<GunshiParams<{ args: Args; extensions: Auth }>>()
  const ctx = createPluginContext<GunshiParams<{ args: Args; extensions: Auth }>>(decorators)

  ctx.decorateCommand<Logger>(baseRunner => async ctx => {
    const result = await baseRunner(ctx)

    expectTypeOf(ctx.extensions).toEqualTypeOf<Auth & Logger>()

    return `[USAGE] ${result}`
  })

  const runner = decorators.commandDecorators[0]
  const mockCtx = await createCommandContext<GunshiParams<{ args: Args; extensions: Auth }>>({})
  const result = await runner(_ctx => '[TEST]')(mockCtx)

  expect(result).toBe('[USAGE] [TEST]')
})

describe('PluginContext#addCommand', () => {
  test('basic', () => {
    const decorators = createDecorators()
    const ctx = createPluginContext(decorators)
    const command = {
      name: 'test',
      description: 'Test command',
      run: () => {
        console.log('test')
      }
    }

    ctx.addCommand('test', command)

    expect(ctx.subCommands.size).toBe(1)
    expect(ctx.subCommands.get('test')).toEqual(command)
    expect(ctx.hasCommand('test')).toBe(true)
  })

  test('with initial sub commands', () => {
    const decorators = createDecorators()
    const initialCommand = {
      name: 'initial',
      description: 'Initial command',
      run: () => {
        console.log('initial')
      }
    }
    const initialSubCommands = new Map([['initial', initialCommand]])

    const ctx = createPluginContext(decorators, initialSubCommands)

    expect(ctx.subCommands.size).toBe(1)
    expect(ctx.subCommands.get('initial')).toEqual(initialCommand)

    const newCommand = {
      name: 'new',
      description: 'New command',
      run: () => {
        console.log('new')
      }
    }

    ctx.addCommand('new', newCommand)

    expect(ctx.subCommands.size).toBe(2)
    expect(ctx.subCommands.get('new')).toEqual(newCommand)
    expect(ctx.hasCommand('new')).toBe(true)
  })

  test('lazy command', () => {
    const decorators = createDecorators()
    const ctx = createPluginContext(decorators)
    const lazyCommand = Object.assign(
      () => ({
        name: 'lazy',
        description: 'Lazy command',
        run: () => {
          console.log('lazy')
        }
      }),
      {
        commandName: 'lazy',
        description: 'Lazy command'
      }
    )

    ctx.addCommand('lazy', lazyCommand)

    expect(ctx.subCommands.size).toBe(1)
    expect(ctx.subCommands.get('lazy')).toEqual(lazyCommand)
    expect(ctx.hasCommand('lazy')).toBe(true)
  })

  test('name empty', () => {
    const decorators = createDecorators()
    const ctx = createPluginContext(decorators)
    const command = {
      name: 'test',
      description: 'Test command',
      run: () => {
        console.log('test')
      }
    }

    expect(() => ctx.addCommand('', command)).toThrow('Command name must be a non-empty string')
  })

  test('duplicate name', () => {
    const decorators = createDecorators()
    const ctx = createPluginContext(decorators)
    const command = {
      name: 'test',
      description: 'Test command',
      run: () => {
        console.log('test')
      }
    }

    ctx.addCommand('test', command)

    expect(() => ctx.addCommand('test', command)).toThrow(`Command 'test' is already registered`)
  })
})

describe('PluginContext#hasCommand', () => {
  test('returns true for existing command', () => {
    const decorators = createDecorators()
    const ctx = createPluginContext(decorators)
    const command = {
      name: 'test',
      description: 'Test command',
      run: () => {
        console.log('test')
      }
    }

    ctx.addCommand('test', command)

    expect(ctx.hasCommand('test')).toBe(true)
  })

  test('returns false for non-existing command', () => {
    const decorators = createDecorators()
    const ctx = createPluginContext(decorators)

    expect(ctx.hasCommand('nonexistent')).toBe(false)
  })
})

describe('PluginContext#subCommands', () => {
  test('returns readonly map', () => {
    const decorators = createDecorators()
    const ctx = createPluginContext(decorators)
    const command = {
      name: 'test',
      description: 'Test command',
      run: () => {
        console.log('test')
      }
    }

    ctx.addCommand('test', command)

    const subCommands = ctx.subCommands
    expect(subCommands.size).toBe(1)
    expect(subCommands.get('test')).toEqual(command)

    // verify that it's a new Map instance (readonly)
    expect(subCommands).not.toBe(ctx.subCommands)
  })
})
