/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import globals from '../../../plugin-global/src/index.ts'
import renderer from '../../../plugin-renderer/src/index.ts'
import { cliCore } from './core.ts'

import type { Plugin } from '../plugin.ts'
import type {
  Args,
  CliOptions,
  Command,
  CommandRunner,
  DefaultGunshiParams,
  ExtendContext,
  GunshiParams,
  LazyCommand
} from '../types.ts'

/**
 * Run the command.
 * @param args Command line arguments
 * @param entry A {@link Command | entry command}, an {@link CommandRunner | inline command runner}, or a {@link LazyCommand | lazily-loaded command}
 * @param options A {@link CliOptions | CLI options}
 * @returns A rendered usage or undefined. if you will use {@link CliOptions.usageSilent} option, it will return rendered usage string.
 */
export async function cli<
  A extends Args = Args,
  G extends GunshiParams = { args: A; extensions: {} }
>(
  argv: string[],
  entry: Command<G> | CommandRunner<G> | LazyCommand<G>,
  options?: CliOptions<G>
): Promise<string | undefined>

/**
 * Run the command.
 * @param args Command line arguments
 * @param entry A {@link Command | entry command}, an {@link CommandRunner | inline command runner}, or a {@link LazyCommand | lazily-loaded command}
 * @param options A {@link CliOptions | CLI options}
 * @returns A rendered usage or undefined. if you will use {@link CliOptions.usageSilent} option, it will return rendered usage string.
 */
export async function cli<
  E extends ExtendContext = ExtendContext,
  G extends GunshiParams = { args: Args; extensions: E }
>(
  argv: string[],
  entry: Command<G> | CommandRunner<G> | LazyCommand<G>,
  options?: CliOptions<G>
): Promise<string | undefined>

/**
 * Run the command.
 * @param args Command line arguments
 * @param entry A {@link Command | entry command}, an {@link CommandRunner | inline command runner}, or a {@link LazyCommand | lazily-loaded command}
 * @param options A {@link CliOptions | CLI options}
 * @returns A rendered usage or undefined. if you will use {@link CliOptions.usageSilent} option, it will return rendered usage string.
 */
export async function cli<G extends GunshiParams = DefaultGunshiParams>(
  argv: string[],
  entry: Command<G> | CommandRunner<G> | LazyCommand<G>,
  options?: CliOptions<G>
): Promise<string | undefined>

/**
 * Run the command.
 * @param args Command line arguments
 * @param entry A {@link Command | entry command}, an {@link CommandRunner | inline command runner}, or a {@link LazyCommand | lazily-loaded command}
 * @param options A {@link CliOptions | CLI options}
 * @returns A rendered usage or undefined. if you will use {@link CliOptions.usageSilent} option, it will return rendered usage string.
 */
export async function cli<G extends GunshiParams = DefaultGunshiParams>(
  argv: string[],
  entry: Command<G> | CommandRunner<G> | LazyCommand<G>,
  options: CliOptions<G> = {}
): Promise<string | undefined> {
  const builtInPlugins: Plugin[] = [globals(), renderer()]
  return cliCore<G>(argv, entry, options, builtInPlugins)
}
