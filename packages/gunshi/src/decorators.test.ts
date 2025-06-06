import { describe, expect, test, vi } from 'vitest'
import { createMockCommandContext } from '../test/utils.ts'
import { RendererDecorators } from './decorators.ts'

// Mock the default renderers
vi.mock('./renderer.ts', () => ({
  renderHeader: vi.fn().mockResolvedValue('Default Header'),
  renderUsage: vi.fn().mockResolvedValue('Default Usage'),
  renderValidationErrors: vi.fn().mockResolvedValue('Default Validation Errors')
}))

describe('RendererDecorators', () => {
  test('Return default header renderer when no decorators', async () => {
    const decorators = new RendererDecorators()
    const renderer = decorators.getHeaderRenderer()
    const ctx = createMockCommandContext()

    const result = await renderer(ctx)

    expect(result).toBe('Default Header')
  })

  test('Return default usage renderer when no decorators', async () => {
    const decorators = new RendererDecorators()
    const renderer = decorators.getUsageRenderer()
    const ctx = createMockCommandContext()

    const result = await renderer(ctx)

    expect(result).toBe('Default Usage')
  })

  test('Return default validation errors renderer when no decorators', async () => {
    const decorators = new RendererDecorators()
    const renderer = decorators.getValidationErrorsRenderer()
    const ctx = createMockCommandContext()
    const error = new AggregateError([new Error('Test error')], 'Validation errors')

    const result = await renderer(ctx, error)

    expect(result).toBe('Default Validation Errors')
  })

  test('Apply single header decorator', async () => {
    const decorators = new RendererDecorators()
    const ctx = createMockCommandContext()

    decorators.addHeaderDecorator(async (baseRenderer, cmdCtx) => {
      const result = await baseRenderer(cmdCtx)
      return `[DECORATED] ${result}`
    })

    const renderer = decorators.getHeaderRenderer()
    const result = await renderer(ctx)

    expect(result).toBe('[DECORATED] Default Header')
  })

  test('Apply multiple decorators in correct order', async () => {
    const decorators = new RendererDecorators()
    const ctx = createMockCommandContext()

    decorators.addHeaderDecorator(async (baseRenderer, cmdCtx) => {
      const result = await baseRenderer(cmdCtx)
      return `[A] ${result}`
    })

    decorators.addHeaderDecorator(async (baseRenderer, cmdCtx) => {
      const result = await baseRenderer(cmdCtx)
      return `[B] ${result} [B]`
    })

    const renderer = decorators.getHeaderRenderer()
    const result = await renderer(ctx)

    // B is applied last, so it wraps A
    expect(result).toBe('[B] [A] Default Header [B]')
  })

  test('Handle async decorators correctly', async () => {
    const decorators = new RendererDecorators()
    const ctx = createMockCommandContext()

    decorators.addUsageDecorator(async (baseRenderer, cmdCtx) => {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 10))
      const result = await baseRenderer(cmdCtx)
      return `[ASYNC] ${result} [ASYNC]`
    })

    const renderer = decorators.getUsageRenderer()
    const result = await renderer(ctx)

    expect(result).toBe('[ASYNC] Default Usage [ASYNC]')
  })

  test('Pass context correctly through decorators', async () => {
    const decorators = new RendererDecorators()
    const ctx = createMockCommandContext()
    ctx.name = 'special-command'

    decorators.addHeaderDecorator(async (baseRenderer, cmdCtx) => {
      const result = await baseRenderer(cmdCtx)
      return `[${cmdCtx.name}] ${result} [${cmdCtx.name}]`
    })

    const renderer = decorators.getHeaderRenderer()
    const result = await renderer(ctx)

    expect(result).toBe('[special-command] Default Header [special-command]')
  })

  test('Handle validation errors decorator with error parameter', async () => {
    const decorators = new RendererDecorators()
    const ctx = createMockCommandContext()
    const error = new AggregateError(
      [new Error('Error 1'), new Error('Error 2')],
      'Validation errors'
    )

    decorators.addValidationErrorsDecorator(async (baseRenderer, cmdCtx, err) => {
      const result = await baseRenderer(cmdCtx, err)
      return `[${err.errors.length} errors] ${result} [${err.errors.length} errors]`
    })

    const renderer = decorators.getValidationErrorsRenderer()
    const result = await renderer(ctx, error)

    expect(result).toBe('[2 errors] Default Validation Errors [2 errors]')
  })

  test('Handle decorator that throws error', async () => {
    const decorators = new RendererDecorators()
    const ctx = createMockCommandContext()

    decorators.addHeaderDecorator(async () => {
      throw new Error('Decorator error')
    })

    const renderer = decorators.getHeaderRenderer()

    await expect(renderer(ctx)).rejects.toThrow('Decorator error')
  })

  test('Build empty decorator chain correctly', async () => {
    const decorators = new RendererDecorators()
    const ctx = createMockCommandContext()

    // Add and then test all three types
    const headerRenderer = decorators.getHeaderRenderer()
    const usageRenderer = decorators.getUsageRenderer()
    const validationRenderer = decorators.getValidationErrorsRenderer()

    expect(await headerRenderer(ctx)).toBe('Default Header')
    expect(await usageRenderer(ctx)).toBe('Default Usage')
    expect(await validationRenderer(ctx, new AggregateError([], 'validation errors'))).toBe(
      'Default Validation Errors'
    )
  })
})
