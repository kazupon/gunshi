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
      { timeout: 30_000, ...options, env: { ...process.env, ...options?.env } },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Command failed: ${command}\n${stderr.toString()}\n${error.message}`))
        } else {
          resolve(stdout.toString())
        }
      }
    )
  })
}
