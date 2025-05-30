/**
 * The entry for usage generator.
 *
 * @example
 * ```js
 * import { generate } from 'gunshi/generator'
 * ```
 *
 * @module
 */

/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { cli } from './cli.ts'
import { create } from './utils.ts'

import type { Args } from 'args-tokens'
import type { CliOptions, Command, LazyCommand } from './types.ts'

/**
 * generate options of `generate` function.
 */
export type GenerateOptions<A extends Args = Args> = CliOptions<A>

/**
 * Generate the command usage.
 * @param command - usage generate command, if you want to generate the usage of the default command where there are target commands and sub-commands, specify `null`.
 * @param entry - A {@link Command | entry command}
 * @param options - A {@link CliOptions | cli options}
 * @returns A rendered usage.
 */
export async function generate<A extends Args = Args>(
  command: string | null,
  entry: Command<A> | LazyCommand<A>,
  options: GenerateOptions<A> = {}
): Promise<string> {
  const args = ['-h']
  if (command != null) {
    args.unshift(command)
  }
  return (
    (await cli(args, entry, {
      ...create<GenerateOptions<A>>(), // default options
      ...options, // caller-supplied overrides
      usageSilent: true // force silent usage
    })) || ''
  )
}
