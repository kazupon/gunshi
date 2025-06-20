/**
 * The entry for command definition.
 *
 * @example
 * ```js
 * import { define } from 'gunshi/definition'
 * ```
 *
 * @module
 */

/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type { Args } from 'args-tokens'
import type {
  Command,
  CommandLoader,
  DefaultGunshiParams,
  ExtendContext,
  GunshiParams,
  LazyCommand
} from './types.ts'

export type { Args, ArgSchema, ArgValues } from 'args-tokens'

/**
 * Define a {@link Command | command}
 * @param definition A {@link Command | command} definition
 */
// Overload for args with explicit type (improved type inference for ArgValues)
export function define<A extends Args>(
  definition: Command<GunshiParams<{ args: A; extensions: {} }>> & { args: A }
): Command<GunshiParams<{ args: A; extensions: {} }>>

// Overload for extensions only
export function define<E extends ExtendContext>(
  definition: Command<GunshiParams<{ args: Args; extensions: E }>>
): Command<GunshiParams<{ args: Args; extensions: E }>>

// Generic overload (default)
export function define<G extends GunshiParams = DefaultGunshiParams>(
  definition: Command<G>
): Command<G>

export function define<G extends GunshiParams = DefaultGunshiParams>(
  definition: Command<G>
): Command<G> {
  return definition
}

/**
 * Define a {@link LazyCommand | lazy command}
 * @param loader A {@link CommandLoader | command loader}
 * @returns A {@link LazyCommand | lazy command} loader
 */
export function lazy<G extends GunshiParams = DefaultGunshiParams>(
  loader: CommandLoader<G>
): LazyCommand<G>

/**
 * Define a {@link LazyCommand | lazy command} with definition.
 * @param loader A {@link CommandLoader | command loader} function that returns a command definition
 * @param definition An optional {@link Command | command} definition
 * @returns A {@link LazyCommand | lazy command} that can be executed later
 */
export function lazy<G extends GunshiParams = DefaultGunshiParams>(
  loader: CommandLoader<G>,
  definition: Command<G>
): LazyCommand<G>

/**
 * Define a {@link LazyCommand | lazy command} with or without definition.
 * @param loader A {@link CommandLoader | command loader} function that returns a command definition
 * @param definition An optional {@link Command | command} definition
 * @returns A {@link LazyCommand | lazy command} that can be executed later
 */
export function lazy<G extends GunshiParams = DefaultGunshiParams>(
  loader: CommandLoader<G>,
  definition?: Command<G>
): LazyCommand<G> {
  const lazyCommand = loader as LazyCommand<G>

  if (definition != null) {
    // copy existing properties
    lazyCommand.commandName = definition.name
    lazyCommand.description = definition.description
    lazyCommand.args = definition.args
    lazyCommand.examples = definition.examples
    lazyCommand.resource = definition.resource
    lazyCommand.toKebab = definition.toKebab
  }

  return lazyCommand
}
