import { describe, expect, test } from 'vitest'
import { createMockCommandContext } from '../test/utils.ts'
import { Decorators } from './decorators.ts'

import type { CommandDecorator } from './types.ts'

describe('Decorators', () => {
  test('return default header renderer when no decorators', async () => {
    const decorators = new Decorators()
    const renderer = decorators.getHeaderRenderer()
    const ctx = createMockCommandContext()

    const result = await renderer(ctx)

    expect(result).toBe('')
  })

  test('return default usage renderer when no decorators', async () => {
    const decorators = new Decorators()
    const renderer = decorators.getUsageRenderer()
    const ctx = createMockCommandContext()

    const result = await renderer(ctx)

    expect(result).toBe('')
  })

  test('return default validation errors renderer when no decorators', async () => {
    const decorators = new Decorators()
    const renderer = decorators.getValidationErrorsRenderer()
    const ctx = createMockCommandContext()
    const error = new AggregateError([new Error('Test error')], 'Validation errors')

    const result = await renderer(ctx, error)

    expect(result).toBe('')
  })

  test('apply single header decorator', async () => {
    const decorators = new Decorators()
    const ctx = createMockCommandContext()

    decorators.addHeaderDecorator(async (baseRenderer, cmdCtx) => {
      const result = await baseRenderer(cmdCtx)
      return `[DECORATED] ${result}`
    })

    const renderer = decorators.getHeaderRenderer()
    const result = await renderer(ctx)

    expect(result).toBe('[DECORATED] ')
  })

  test('apply multiple decorators in correct order', async () => {
    const decorators = new Decorators()
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
    expect(result).toBe('[B] [A]  [B]')
  })

  test('handle async decorators correctly', async () => {
    const decorators = new Decorators()
    const ctx = createMockCommandContext()

    decorators.addUsageDecorator(async (baseRenderer, cmdCtx) => {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 10))
      const result = await baseRenderer(cmdCtx)
      return `[ASYNC] ${result} [ASYNC]`
    })

    const renderer = decorators.getUsageRenderer()
    const result = await renderer(ctx)

    expect(result).toBe('[ASYNC]  [ASYNC]')
  })

  test('pass context correctly through decorators', async () => {
    const decorators = new Decorators()
    const ctx = createMockCommandContext()
    ctx.name = 'special-command'

    decorators.addHeaderDecorator(async (baseRenderer, cmdCtx) => {
      const result = await baseRenderer(cmdCtx)
      return `[${cmdCtx.name}] ${result} [${cmdCtx.name}]`
    })

    const renderer = decorators.getHeaderRenderer()
    const result = await renderer(ctx)

    expect(result).toBe('[special-command]  [special-command]')
  })

  test('handle validation errors decorator with error parameter', async () => {
    const decorators = new Decorators()
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

    expect(result).toBe('[2 errors]  [2 errors]')
  })

  test('handle decorator that throws error', async () => {
    const decorators = new Decorators()
    const ctx = createMockCommandContext()

    decorators.addHeaderDecorator(async () => {
      throw new Error('Decorator error')
    })

    const renderer = decorators.getHeaderRenderer()

    await expect(renderer(ctx)).rejects.toThrow('Decorator error')
  })

  test('Build empty decorator chain correctly', async () => {
    const decorators = new Decorators()
    const ctx = createMockCommandContext()

    // Add and then test all three types
    const headerRenderer = decorators.getHeaderRenderer()
    const usageRenderer = decorators.getUsageRenderer()
    const validationRenderer = decorators.getValidationErrorsRenderer()

    expect(await headerRenderer(ctx)).toBe('')
    expect(await usageRenderer(ctx)).toBe('')
    expect(await validationRenderer(ctx, new AggregateError([], 'validation errors'))).toBe('')
  })
})

const identityDecorator: CommandDecorator = baseRunner => baseRunner

test('add command decorator', () => {
  const decorators = new Decorators()

  decorators.addCommandDecorator(identityDecorator)

  expect(decorators.commandDecorators).toHaveLength(1)
  expect(decorators.commandDecorators[0]).toBe(identityDecorator)
})

test('add multiple command decorators', () => {
  const decorators = new Decorators()

  const decorator1 = identityDecorator
  const decorator2 = identityDecorator

  decorators.addCommandDecorator(decorator1)
  decorators.addCommandDecorator(decorator2)

  expect(decorators.commandDecorators).toHaveLength(2)
  expect(decorators.commandDecorators[0]).toBe(decorator1)
  expect(decorators.commandDecorators[1]).toBe(decorator2)
})

test('return a copy of decorators array', () => {
  const decorators = new Decorators()

  decorators.addCommandDecorator(identityDecorator)

  const decorators1 = decorators.commandDecorators
  const decorators2 = decorators.commandDecorators

  expect(decorators1).not.toBe(decorators2)
  expect(decorators1).toEqual(decorators2)
})
