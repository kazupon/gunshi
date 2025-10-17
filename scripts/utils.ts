import { exec } from 'node:child_process'

import type { ExecOptions } from 'node:child_process'

/**
 * Run a command in a child process.
 *
 * @param command - The command to run
 * @param options - The exec options
 *
 * @returns The stdout of the command
 */
export function runCommand(command: string, options?: ExecOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(
      command,
      { ...options, env: { ...process.env, ...options?.env } },
      (error, stdout, stderr) => {
        if (error) {
          reject(stderr)
        } else {
          resolve(stdout.toString())
        }
      }
    )
  })
}
