/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { ArgResolveError } from 'args-tokens'
import { describe, expect, test, vi } from 'vitest'
import { revalidateError, resolveValue } from './resolver.ts'
import type { Args, ArgExplicitlyProvided, ArgValues } from 'args-tokens'

type TestArgs = Args & {
  name: { type: 'string' }
  port: { type: 'number' }
  debug: { type: 'boolean' }
}

type NestedArgs = Args & {
  name: { type: 'string' }
}

const values: ArgValues<TestArgs> = {
  name: 'default-name',
  port: 3000,
  debug: false
}

const explicit: ArgExplicitlyProvided<TestArgs> = {
  name: false,
  port: false,
  debug: false
}

describe('resolveValue', () => {
  test('should return original values when hook is undefined', async () => {
    const result = await resolveValue(undefined, values, explicit)
    expect(result).toBe(values)
  })

  test('should return hook result when hook returns a value', async () => {
    const overridden: ArgValues<TestArgs> = { name: 'from-config', port: 8080, debug: true }
    const hook = vi.fn().mockResolvedValue(overridden)

    const result = await resolveValue(hook, values, explicit)

    expect(result).toBe(overridden)
    expect(hook).toHaveBeenCalledOnce()
    // hook receives a frozen snapshot (not the original reference), but with equal values
    const [calledSources] = hook.mock.calls[0]
    expect(calledSources.values).toEqual(values)
    expect(calledSources.values).not.toBe(values)
    expect(Object.isFrozen(calledSources.values)).toBe(true)
    expect(calledSources.explicit).toBe(explicit)
  })

  test('should fall back to original values when hook returns undefined', async () => {
    const hook = vi.fn().mockResolvedValue(undefined)

    const result = await resolveValue(hook, values, explicit)

    expect(result).toBe(values)
    expect(hook).toHaveBeenCalledOnce()
  })

  test('should pass correct sources to hook', async () => {
    const explicitWithPort: ArgExplicitlyProvided<TestArgs> = {
      name: false,
      port: true,
      debug: false
    }
    const hook = vi.fn().mockResolvedValue(undefined)

    await resolveValue(hook, values, explicitWithPort)

    const [calledSources] = hook.mock.calls[0]
    expect(calledSources.values).toEqual(values)
    expect(calledSources.explicit).toBe(explicitWithPort)
  })

  test('should return original values when hook mutates snapshot and returns undefined', async () => {
    const original = { name: 'original', port: 3000, debug: false }
    const inputValues: ArgValues<TestArgs> = { ...original }

    const hook = vi.fn().mockImplementation((sources: { values: ArgValues<TestArgs> }) => {
      // Attempt to mutate the snapshot passed to the hook
      try {
        ;(sources.values as Record<string, unknown>)['name'] = 'mutated'
      } catch {
        // Silently ignore TypeError from frozen object in strict mode
      }
      return undefined
    })

    const result = await resolveValue(hook, inputValues, explicit)

    // Fallback must be the unmodified original
    expect(result).toBe(inputValues)
    expect(result.name).toBe('original')
  })

  test('should preserve original values when hook mutates a nested object on the snapshot and returns undefined', async () => {
    // Object.freeze only freezes the top-level properties, so nested objects/arrays
    // are still mutable. The fallback must still return the unmodified original reference.
    const nested = { extra: 'original' }
    const inputValues = { name: 'original' } as ArgValues<NestedArgs>
    // Attach a nested object outside the type so we can observe mutation attempts
    ;(inputValues as Record<string, unknown>)['meta'] = nested

    const nestedExplicit: ArgExplicitlyProvided<NestedArgs> = { name: false }

    const hook = vi
      .fn()
      .mockImplementation(
        (sources: { values: ArgValues<NestedArgs> & Record<string, unknown> }) => {
          // Top-level freeze blocks this; nested objects are not frozen
          try {
            ;(sources.values as Record<string, unknown>)['name'] = 'mutated-top'
          } catch {
            // Silently ignore TypeError from frozen top-level in strict mode
          }
          // Mutate nested object — shallow freeze does NOT protect this
          const meta = sources.values['meta'] as Record<string, unknown> | undefined
          if (meta) {
            meta['extra'] = 'mutated-nested'
          }
          return undefined
        }
      )

    const result = await resolveValue(
      hook as unknown as Parameters<typeof resolveValue>[0],
      inputValues,
      nestedExplicit as unknown as ArgExplicitlyProvided<NestedArgs>
    )

    // Fallback reference must be the unmodified original
    expect(result).toBe(inputValues)
    // Top-level string was protected by Object.freeze
    expect(result.name).toBe('original')
    // Nested object was mutated through the shallow-frozen snapshot —
    // this documents the known limitation of Object.freeze and ensures the
    // suite catches any regression if the implementation moves to deep-freeze.
    expect(nested.extra).toBe('mutated-nested')
  })

  test('should support synchronous hook', async () => {
    const overridden: ArgValues<TestArgs> = { name: 'sync-result', port: 9000, debug: true }
    const hook = vi.fn().mockReturnValue(overridden)

    const result = await resolveValue(hook, values, explicit)

    expect(result).toBe(overridden)
  })
})

describe('revalidateError', () => {
  const requiredArgs = {
    name: { type: 'string' as const, required: true as const },
    port: { type: 'number' as const }
  }

  test('should return undefined when original error is undefined', () => {
    const result = revalidateError(undefined, requiredArgs, { name: 'foo', port: 3000 })
    expect(result).toBeUndefined()
  })

  test('should clear required error when resolved value is now present', () => {
    const schema = requiredArgs.name
    const requiredError = new ArgResolveError(
      "Optional argument '--name' is required",
      'name',
      'required',
      schema
    )
    const error = new AggregateError([requiredError])

    // hook filled in the required arg
    const result = revalidateError(error, requiredArgs, { name: 'from-config', port: 3000 })

    expect(result).toBeUndefined()
  })

  test('should keep required error when resolved value is still missing', () => {
    const schema = requiredArgs.name
    const requiredError = new ArgResolveError(
      "Optional argument '--name' is required",
      'name',
      'required',
      schema
    )
    const error = new AggregateError([requiredError])

    // hook did not fill in the required arg
    const result = revalidateError(error, requiredArgs, { port: 3000 } as ArgValues<
      typeof requiredArgs
    >)

    expect(result).toBeInstanceOf(AggregateError)
    expect(result!.errors).toHaveLength(1)
    expect(result!.errors[0]).toBe(requiredError)
  })

  test('should keep non-required errors (type, conflict) unchanged', () => {
    const schema = requiredArgs.port
    const typeError = new ArgResolveError(
      "Optional argument '--port' should be 'number'",
      'port',
      'type',
      schema
    )
    const error = new AggregateError([typeError])

    // values look resolved but the type error should still remain
    const result = revalidateError(error, requiredArgs, { name: 'foo', port: 3000 })

    expect(result).toBeInstanceOf(AggregateError)
    expect(result!.errors).toHaveLength(1)
    expect(result!.errors[0]).toBe(typeError)
  })

  test('should partially clear errors when only some required args are resolved', () => {
    const mixedArgs = {
      name: { type: 'string' as const, required: true as const },
      config: { type: 'string' as const, required: true as const }
    }
    const nameError = new ArgResolveError(
      "Optional argument '--name' is required",
      'name',
      'required',
      mixedArgs.name
    )
    const configError = new ArgResolveError(
      "Optional argument '--config' is required",
      'config',
      'required',
      mixedArgs.config
    )
    const error = new AggregateError([nameError, configError])

    // hook filled in 'name' but not 'config'
    const result = revalidateError(error, mixedArgs, { name: 'filled' } as ArgValues<
      typeof mixedArgs
    >)

    expect(result).toBeInstanceOf(AggregateError)
    expect(result!.errors).toHaveLength(1)
    expect(result!.errors[0]).toBe(configError)
  })
})
