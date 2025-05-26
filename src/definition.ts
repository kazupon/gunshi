/**
 * The entry for command deifinition.
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
import type { Command, CommandLoader, LazyCommand } from './types.ts'

export type { Args, ArgSchema, ArgValues } from 'args-tokens'

/**
 * Define a {@link Command | command} with type inference
 * @param definition A {@link Command | command} definition
 * @returns A {@link Command | command} definition with type inference
 */
export function define<A extends Args = Args>(definition: Command<A>): Command<A> {
  return definition
}

/**
 * Define a {@link LazyCommand | lazy command} with command loader, which is attached with command definition as usage metadata.
 * @param loader A {@link CommandLoader | command loader}
 * @param definition A {@link Command | command} definition
 * @returns A {@link LazyCommand | lazy command} loader
 */
export function lazy<A extends Args = Args>(
  loader: CommandLoader<A>,
  definition?: Command<A>
): LazyCommand<A> {
  if (definition != null) {
    ;(loader as LazyCommand<A>).commandName = definition.name
    ;(loader as LazyCommand<A>).description = definition.description
    ;(loader as LazyCommand<A>).args = definition.args
    ;(loader as LazyCommand<A>).examples = definition.examples
    ;(loader as LazyCommand<A>).resource = definition.resource
    ;(loader as LazyCommand<A>).toKebab = definition.toKebab
  }
  return loader
}
