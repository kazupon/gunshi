import { vi } from 'vitest'
export function defineMockLog(utils: typeof import('../src/utils')) {
  const logs: unknown[] = []
  vi.spyOn(utils, 'log').mockImplementation((...args: unknown[]) => {
    logs.push(args)
  })

  return () => logs.join(`\n`)
}
