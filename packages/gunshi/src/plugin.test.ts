import { describe, expect, test } from 'vitest'
import { createMockCommandContext } from '../test/utils.ts'
import { RendererDecorators } from './decorators.ts'
import { PluginContext } from './plugin.ts'

describe('PluginContext#addGlobalOpttion', () => {
  test('basic', () => {
    const decorators = new RendererDecorators()
    const ctx = new PluginContext(decorators)
    ctx.addGlobalOption('foo', { type: 'string', description: 'foo option' })
    expect(ctx.globalOptions.size).toBe(1)
    expect(ctx.globalOptions.get('foo')).toEqual({
      type: 'string',
      description: 'foo option'
    })
  })

  test('name empty', () => {
    const decorators = new RendererDecorators()
    const ctx = new PluginContext(decorators)
    expect(() => ctx.addGlobalOption('', { type: 'string' })).toThrow(
      'Option name must be a non-empty string'
    )
  })

  test('duplicate name', () => {
    const decorators = new RendererDecorators()
    const ctx = new PluginContext(decorators)
    ctx.addGlobalOption('foo', { type: 'string', description: 'foo option' })
    expect(() => ctx.addGlobalOption('foo', { type: 'string' })).toThrow(
      `Global option 'foo' is already registered`
    )
  })
})

describe('PluginContext#decorateHeaderRenderer', () => {
  test('basic', async () => {
    const decorators = new RendererDecorators()
    const ctx = new PluginContext(decorators)

    ctx.decorateHeaderRenderer(async (baseRenderer, cmdCtx) => {
      const result = await baseRenderer(cmdCtx)
      return `[DECORATED] ${result}`
    })

    const renderer = decorators.getHeaderRenderer()
    const mockCtx = createMockCommandContext()
    const result = await renderer(mockCtx)

    expect(result).toBe('[DECORATED] ')
  })
})

describe('PluginContext#decorateUsageRenderer', () => {
  test('basic', async () => {
    const decorators = new RendererDecorators()
    const ctx = new PluginContext(decorators)

    ctx.decorateUsageRenderer(async (baseRenderer, cmdCtx) => {
      const result = await baseRenderer(cmdCtx)
      return `[USAGE] ${result}`
    })

    const renderer = decorators.getUsageRenderer()
    const mockCtx = createMockCommandContext()
    const result = await renderer(mockCtx)

    expect(result).toBe('[USAGE] ')
  })
})

describe('PluginContext#decorateValidationErrorsRenderer', () => {
  test('basic', async () => {
    const decorators = new RendererDecorators()
    const ctx = new PluginContext(decorators)

    ctx.decorateValidationErrorsRenderer(async (baseRenderer, cmdCtx, error) => {
      const result = await baseRenderer(cmdCtx, error)
      return `[ERROR] ${result}`
    })

    const renderer = decorators.getValidationErrorsRenderer()
    const mockCtx = createMockCommandContext()
    const error = new AggregateError([new Error('Test')], 'Validation failed')
    const result = await renderer(mockCtx, error)

    expect(result).toBe('[ERROR] ')
  })
})
