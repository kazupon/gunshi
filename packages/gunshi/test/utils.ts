import { onTestFinished, vi } from 'vitest'

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
 * Capture what is printed to stderr with `console.error`, such as the validation errors that the global
 * options plugin reports. When the test finishes, `console.error` and the exit code of the process, which
 * the plugin sets to `1`, are restored.
 *
 * @returns A function that returns what was printed to stderr
 */
export function defineMockErrorLog(): () => string {
  const logs: unknown[] = []
  const spy = vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    logs.push(args)
  })
  onTestFinished(() => {
    spy.mockRestore()
    process.exitCode = undefined
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
