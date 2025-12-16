/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import globals from '@gunshi/plugin-global'
import renderer from '@gunshi/plugin-renderer'
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
  GunshiParamsConstraint,
  LazyCommand,
  SubCommandable
} from '../types.ts'

/**
 * Run the command.
 *
 * This overload accepts any command-like object using a loose structural type.
 * It bypasses TypeScript contravariance issues with callback properties.
 *
 * @param args - Command line arguments
 * @param entry - A command-like object (command, command runner, or lazy command)
 * @param options - A {@link CliOptions | CLI options}
 * @returns A rendered usage or undefined. if you will use {@linkcode CliOptions.usageSilent} option, it will return rendered usage string.
 */
export async function cli(
  args: string[],
  entry: SubCommandable,
  options?: CliOptions
): Promise<string | undefined>

/**
 * Run the command.
 *
 * @typeParam G - A type extending {@linkcode GunshiParams} to specify the shape of command and cli options.
 *
 * @param args - Command line arguments
 * @param entry - A {@link Command | entry command}, an {@link CommandRunner | inline command runner}, or a {@link LazyCommand | lazily-loaded command}
 * @param options - A {@link CliOptions | CLI options}
 * @returns A rendered usage or undefined. if you will use {@linkcode CliOptions.usageSilent} option, it will return rendered usage string.
 */
export async function cli<G extends GunshiParamsConstraint>(
  args: string[],
  entry: Command<G> | CommandRunner<G> | LazyCommand<G>,
  options?: CliOptions<G>
): Promise<string | undefined>

/**
 * Run the command.
 *
 * @typeParam A - The type of {@linkcode Args | arguments} defined in the command and cli options.
 *
 * @param args - Command line arguments
 * @param entry - A {@link Command | entry command}, an {@link CommandRunner | inline command runner}, or a {@link LazyCommand | lazily-loaded command}
 * @param options - A {@link CliOptions | CLI options}
 * @returns A rendered usage or undefined. if you will use {@linkcode CliOptions.usageSilent} option, it will return rendered usage string.
 */
export async function cli<
  A extends Args = Args,
  G extends GunshiParams = { args: A; extensions: {} }
>(
  args: string[],
  entry: Command<G> | CommandRunner<G> | LazyCommand<G>,
  options?: CliOptions<G>
): Promise<string | undefined>

/**
 * Run the command.
 *
 * @typeParam E - An {@linkcode ExtendContext} type to specify the shape of command and cli options.
 *
 * @param args - Command line arguments
 * @param entry - A {@link Command | entry command}, an {@link CommandRunner | inline command runner}, or a {@link LazyCommand | lazily-loaded command}
 * @param options - A {@link CliOptions | CLI options}
 * @returns A rendered usage or undefined. if you will use {@linkcode CliOptions.usageSilent} option, it will return rendered usage string.
 */
export async function cli<
  E extends ExtendContext = ExtendContext,
  G extends GunshiParams = { args: Args; extensions: E }
>(
  args: string[],
  entry: Command<G> | CommandRunner<G> | LazyCommand<G>,
  options?: CliOptions<G>
): Promise<string | undefined>

/**
 * Run the command.
 *
 * @typeParam G - A type extending {@linkcode GunshiParams} to specify the shape of command and cli options.
 *
 * @param args - Command line arguments
 * @param entry - A {@link Command | entry command}, an {@link CommandRunner | inline command runner}, or a {@link LazyCommand | lazily-loaded command}
 * @param options - A {@link CliOptions | CLI options}
 * @returns A rendered usage or undefined. if you will use {@linkcode CliOptions.usageSilent} option, it will return rendered usage string.
 */
export async function cli<G extends GunshiParams = DefaultGunshiParams>(
  args: string[],
  entry: Command<G> | CommandRunner<G> | LazyCommand<G>,
  options?: CliOptions<G>
): Promise<string | undefined>

/**
 * Run the command.
 *
 * @typeParam G - A type extending {@linkcode GunshiParams} to specify the shape of command and cli options.
 *
 * @param args - Command line arguments
 * @param entry - A {@link Command | entry command}, an {@link CommandRunner | inline command runner}, or a {@link LazyCommand | lazily-loaded command}
 * @param options - A {@link CliOptions | CLI options}
 * @returns A rendered usage or undefined. if you will use {@linkcode CliOptions.usageSilent} option, it will return rendered usage string.
 */
export async function cli<G extends GunshiParams = DefaultGunshiParams>(
  args: string[],
  entry: Command<G> | CommandRunner<G> | LazyCommand<G>,
  options: CliOptions<G> = {}
): Promise<string | undefined> {
  const builtInPlugins: Plugin[] = [globals(), renderer()]
  return cliCore<G>(args, entry, options, builtInPlugins)
}
