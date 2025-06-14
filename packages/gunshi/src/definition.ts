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
import type { Command, CommandLoader, ExtendContext, LazyCommand } from './types.ts'

export type { Args, ArgSchema, ArgValues } from 'args-tokens'

/**
 * Define a {@link Command | command}
 * @param definition A {@link Command | command} definition
 */
export function define<A extends Args = Args, E extends ExtendContext = {}>(
  definition: Command<A, E>
): Command<A, E> {
  return definition
}

/**
 * Define a {@link LazyCommand | lazy command}
 * @param loader A {@link CommandLoader | command loader}
 * @returns A {@link LazyCommand | lazy command} loader
 */
export function lazy<A extends Args = Args, E extends ExtendContext = {}>(
  loader: CommandLoader<A, E>
): LazyCommand<A, E>

/**
 * Define a {@link LazyCommand | lazy command} with definition.
 * @param loader A {@link CommandLoader | command loader} function that returns a command definition
 * @param definition An optional {@link Command | command} definition
 * @returns A {@link LazyCommand | lazy command} that can be executed later
 */
export function lazy<A extends Args = Args, E extends ExtendContext = {}>(
  loader: CommandLoader<A, E>,
  definition: Command<A, E>
): LazyCommand<A, E>

/**
 * Define a {@link LazyCommand | lazy command} with or without definition.
 * @param loader A {@link CommandLoader | command loader} function that returns a command definition
 * @param definition An optional {@link Command | command} definition
 * @returns A {@link LazyCommand | lazy command} that can be executed later
 */
export function lazy<A extends Args = Args, E extends ExtendContext = {}>(
  loader: CommandLoader<A, E>,
  definition?: Command<A, E>
): LazyCommand<A, E> {
  const lazyCommand = loader as LazyCommand<A, E>

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
