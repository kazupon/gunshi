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
 * The lines that the global options plugin prints after the validation errors that the plugins render:
 * the command that shows the help of the nearest command, after an empty line. For a CLI without a
 * name, the command starts with `<COMMAND>`, and the heading says to replace it.
 *
 * @param path - The path of the command whose help the command shows
 * @param options - The name of the CLI, and the locale of the heading
 * @param options.name - The name of the CLI, given to `cli()`
 * @param options.locale - The locale of the heading: `ja-JP` with the built-in resources of `ja-JP`
 * @returns The lines, as `stderr()` of {@link defineMockErrorLog} joins them to the errors
 */
export function helpHint(
  path: string[] = [],
  { name, locale = 'en-US' }: { name?: string; locale?: 'en-US' | 'ja-JP' } = {}
): string {
  const headings = {
    'en-US': name
      ? 'See the arguments of the command'
      : 'Replace <COMMAND> with how you ran this CLI, to see the arguments of the command',
    'ja-JP': name
      ? 'コマンドの引数を確認する'
      : '<COMMAND> を、この CLI を実行したときのコマンドに置き換えて、コマンドの引数を確認する'
  }
  return `\n\n${headings[locale]}:\n  ${[name ?? '<COMMAND>', ...path, '--help'].join(' ')}`
}

/**
 *
 * @param obj
 */
export function hasPrototype(obj: unknown): boolean {
  return Object.getPrototypeOf(obj) !== null
}
