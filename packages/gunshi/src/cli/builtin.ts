/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import globals from '@gunshi/plugin-global'
import renderer from '@gunshi/plugin-renderer'
import { cliCore } from './core.ts'

import type { UnknownArgKeys } from '../arg-keys.ts'
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
  LazyCommand
} from '../types.ts'
import type { EntryCommandable, NoInferParams } from './entry-types.ts'

/**
 * Run the command.
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
 * It is also `undefined` when the arguments fail validation and the errors are reported to stderr (see {@linkcode CliOptions.renderValidationErrors}).
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
 * Run the command.
 *
 * @typeParam G - A type extending {@linkcode GunshiParams} to specify the shape of command and cli options.
 *
 * @param args - Command line arguments
 * @param entry - A {@link Command | entry command}, an {@link CommandRunner | inline command runner}, or a {@link LazyCommand | lazily-loaded command}
 * @param options - A {@link CliOptions | CLI options}
 * @returns A rendered usage or undefined. if you will use {@linkcode CliOptions.usageSilent} option, it will return rendered usage string.
 * It is also `undefined` when the arguments fail validation and the errors are reported to stderr (see {@linkcode CliOptions.renderValidationErrors}).
 */
export async function cli<G extends GunshiParamsConstraint>(
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
 * It is also `undefined` when the arguments fail validation and the errors are reported to stderr (see {@linkcode CliOptions.renderValidationErrors}).
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
 * It is also `undefined` when the arguments fail validation and the errors are reported to stderr (see {@linkcode CliOptions.renderValidationErrors}).
 */
export async function cli<G extends GunshiParams = DefaultGunshiParams>(
  args: string[],
  entry: Command<G> | CommandRunner<G> | LazyCommand<G>,
  options?: CliOptions<G>
): Promise<string | undefined>

/**
 * Run the command.
 *
 * This overload takes a command of another copy of the types of gunshi, such as a command of `@gunshi/definition`,
 * whose types the overloads above cannot compare. Its arguments are checked as `Args`, and its runner returns what a
 * runner returns.
 *
 * Note: This overload MUST be last in the overload list. TypeScript checks overloads
 * in declaration order and selects the first matching one.
 *
 * @param args - Command line arguments
 * @param entry - A command-like object (command, command runner, or lazy command)
 * @param options - A {@link CliOptions | CLI options}
 * @returns A rendered usage or undefined. if you will use {@linkcode CliOptions.usageSilent} option, it will return rendered usage string.
 * It is also `undefined` when the arguments fail validation and the errors are reported to stderr (see {@linkcode CliOptions.renderValidationErrors}).
 */
export async function cli(
  args: string[],
  entry: EntryCommandable,
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
 * It is also `undefined` when the arguments fail validation and the errors are reported to stderr (see {@linkcode CliOptions.renderValidationErrors}).
 */
export async function cli<G extends GunshiParams = DefaultGunshiParams>(
  args: string[],
  entry: Command<G> | CommandRunner<G> | LazyCommand<G> | EntryCommandable,
  options: CliOptions<G> = {}
): Promise<string | undefined> {
  return cliCore<G>(
    args,
    entry as Command<G> | CommandRunner<G> | LazyCommand<G>,
    options,
    createBuiltInPlugins()
  )
}

/**
 * Render the usage of a command, without running it.
 *
 * This is what `generate` of `gunshi/generator` is made of. It resolves the command the same way
 * {@linkcode cli} does, with the same built-in plugins, and renders the usage of the command it
 * arrives at, whatever that command declares as its own arguments.
 *
 * @internal
 *
 * @typeParam G - A type extending {@linkcode GunshiParams} to specify the shape of command and cli options.
 *
 * @param args - Command line arguments, which name the command to render
 * @param entry - A {@link Command | entry command}, an {@link CommandRunner | inline command runner}, or a {@link LazyCommand | lazily-loaded command}
 * @param options - A {@link CliOptions | CLI options}
 * @returns A rendered usage, or `undefined` if there is no usage renderer to render it
 */
export async function cliUsage<G extends GunshiParamsConstraint = DefaultGunshiParams>(
  args: string[],
  entry: Command<G> | CommandRunner<G> | LazyCommand<G>,
  options: CliOptions<G> = {}
): Promise<string | undefined> {
  return cliCore<G>(args, entry, options, createBuiltInPlugins(), true)
}

function createBuiltInPlugins(): Plugin[] {
  return [globals(), renderer()]
}
