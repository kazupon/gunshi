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

import type {
  CliOptions,
  Command,
  DefaultGunshiParams,
  GunshiParams,
  LazyCommand
} from './types.ts'

/**
 * generate options of `generate` function.
 *
 * @typeParam G - A type extending {@linkcode GunshiParams} to specify the shape of {@linkcode CliOptions}.
 */
export type GenerateOptions<G extends GunshiParams = DefaultGunshiParams> = CliOptions<G>

/**
 * Generate the command usage.
 *
 * @typeParam G - A type extending {@linkcode GunshiParams} to specify the shape of command parameters.
 *
 * @param command - usage generate command, if you want to generate the usage of the default command where there are target commands and sub-commands, specify `null`.
 * @param entry - A {@linkcode Command | entry command}
 * @param options - A {@linkcode GenerateOptions | cli options}
 * @returns A rendered usage.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): GunshiParams is a generic type
export async function generate<G extends GunshiParams<any> = DefaultGunshiParams>(
  command: string | null,
  entry: Command<G> | LazyCommand<G>,
  options: GenerateOptions<G> = {}
): Promise<string> {
  const args = ['-h']
  if (command != null) {
    args.unshift(command)
  }
  return (
    (await cli(args, entry, {
      ...create<GenerateOptions<G>>(), // default options
      ...options, // caller-supplied overrides
      usageSilent: true // force silent usage
    })) || ''
  )
}
