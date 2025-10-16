import { vi } from 'vitest'

/**
 *
 * @param utils
 */
export function defineMockLog(utils: typeof import('../src/utils.ts')) {
  const logs: unknown[] = []
  vi.spyOn(utils, 'log').mockImplementation((...args: unknown[]) => {
    logs.push(args)
  })

  return () => logs.join(`\n`)
}

/**
 *
 * @param obj
 */
export function hasPrototype(obj: unknown): boolean {
  return Object.getPrototypeOf(obj) !== null
}
