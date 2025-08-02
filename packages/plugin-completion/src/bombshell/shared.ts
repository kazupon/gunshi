/**
 * @author Bombshell team and Bombshell contributors
 * @license ISC
 *
 * This file is forked from @bombsh/tab
 * https://github.com/bombshell-dev/tab/blob/6c42c55f46157ae97e2c059039e21ee412b48138/src/powershell.ts
 *
 * Because JSR cannot resolve the dependency of the `http` protocol.
 * https://github.com/kazupon/gunshi/actions/runs/16289584073/job/45996167304#step:11:1124
 */

import { Handler } from './index.ts'

/**
 *
 */
export const noopHandler: Handler = () => {
  return []
}

// TODO(43081j): use type inference some day, so we can type-check
// that the sub commands exist, the options exist, etc.
/**
 *
 */
export interface CompletionConfig {
  /**
   *
   */
  handler?: Handler
  /**
   *
   */
  subCommands?: Record<string, CompletionConfig>
  /**
   *
   */
  options?: Record<
    string,
    {
      /**
       *
       */
      handler: Handler
    }
  >
}

/**
 *
 * @param programName
 */
export function assertDoubleDashes(programName: string = 'cli'): void {
  const dashDashIndex = process.argv.indexOf('--')

  if (dashDashIndex === -1) {
    const errorMessage = `Error: You need to use -- to separate completion arguments.\nExample: ${programName} complete -- <args>`
    console.error(errorMessage)
    process.exit(1) // eslint-disable-line unicorn/no-process-exit -- NOTE(kazupon): keep code as forked
  }
}
