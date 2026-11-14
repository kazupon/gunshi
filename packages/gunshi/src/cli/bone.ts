/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { cliCore } from './core.ts'

import type { UnknownArgKeys } from '../arg-keys.ts'
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
import type { NoInferParams } from './entry-types.ts'

/**
 * Run the command, without the built-in plugins: `--help` and `--version` print nothing, unless you add the plugins.
 * To have them, use `cli` from `gunshi`.
 *
 * An object written as the entry command is typed by its `args`, as with `define`: `ctx.values` of its `run` are
 * inferred from them, and a key that an argument does not have is an error.
 *
 * @typeParam A - The type of {@linkcode Args | arguments} of the entry command, inferred from its `args`.
 * @typeParam G - A type extending {@linkcode GunshiParams}, which is not inferred: `{ args: A; extensions: {} }`.
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
  entry:
    | (Command<NoInferParams<G>> & { args?: A & UnknownArgKeys<A> })
    | CommandRunner<NoInferParams<G>>
    | LazyCommand<NoInferParams<G>>,
  options?: CliOptions<NoInferParams<G>>
): Promise<string | undefined>

/**
 * Run the command, without the built-in plugins: `--help` and `--version` print nothing, unless you add the plugins.
 * To have them, use `cli` from `gunshi`.
 *
 * @typeParam E - An {@linkcode ExtendContext} type to specify the shape of command and cli options.
 *
 * @param args - Command line arguments
 * @param entry - A {@link Command | entry command}, an {@link CommandRunner | inline command runner}, or a {@link LazyCommand | lazily-loaded command}
 * @param options - A {@link CliOptions | CLI options}
 * @returns A rendered usage or undefined. if you will use {@link CliOptions.usageSilent} option, it will return rendered usage string.
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
 * Run the command, without the built-in plugins: `--help` and `--version` print nothing, unless you add the plugins.
 * To have them, use `cli` from `gunshi`.
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
 * Run the command, without the built-in plugins: `--help` and `--version` print nothing, unless you add the plugins.
 * To have them, use `cli` from `gunshi`.
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
  return cliCore<G>(args, entry, options, [])
}
