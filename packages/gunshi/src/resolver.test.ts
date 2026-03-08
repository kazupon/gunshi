/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { describe, expect, test, vi } from 'vitest'
import { resolveValue } from './resolver.ts'
import type { Args, ArgValues, ArgExplicitlyProvided } from 'args-tokens'

type TestArgs = Args & {
  name: { type: 'string' }
  port: { type: 'number' }
  debug: { type: 'boolean' }
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
    expect(hook).toHaveBeenCalledWith({ values, explicit })
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

    expect(hook).toHaveBeenCalledWith({ values, explicit: explicitWithPort })
  })

  test('should support synchronous hook', async () => {
    const overridden: ArgValues<TestArgs> = { name: 'sync-result', port: 9000, debug: true }
    const hook = vi.fn().mockReturnValue(overridden)

    const result = await resolveValue(hook, values, explicit)

    expect(result).toBe(overridden)
  })
})
