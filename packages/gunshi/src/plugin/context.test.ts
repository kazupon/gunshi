import { describe, expect, expectTypeOf, test } from 'vitest'
import { createMockCommandContext } from '../../test/utils.ts'
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
  const mockCtx =
    await createMockCommandContext<GunshiParams<{ args: Args; extensions: Auth }>['extensions']>()
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
  const mockCtx = await createMockCommandContext<Auth>()
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
  const mockCtx =
    await createMockCommandContext<GunshiParams<{ args: Args; extensions: Auth }>['extensions']>()
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
  const mockCtx =
    await createMockCommandContext<GunshiParams<{ args: Args; extensions: Auth }>['extensions']>()
  const result = await runner(_ctx => '[TEST]')(mockCtx)

  expect(result).toBe('[USAGE] [TEST]')
})
