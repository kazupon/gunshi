/**
 * The entry for command deifinition.
 * @example
 * ```js
 * import { define } from 'gunshi/definition'
 * ```
 * @module
 */

/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type { ArgOptions } from 'args-tokens'
import type { Command, CommandLoader, LazyCommand } from './types.ts'

export type { ArgOptions, ArgOptionSchema, ArgValues } from 'args-tokens'

/**
 * Define a {@link Command | command} with type inference
 * @param definition A {@link Command | command} definition
 * @returns A {@link Command | command} definition with type inference
 */
export function define<Options extends ArgOptions = ArgOptions>(
  definition: Command<Options>
): Command<Options> {
  return definition
}

export function lazy<Options extends ArgOptions = ArgOptions>(
  loader: CommandLoader<Options>,
  definition?: Command<Options>
): LazyCommand<Options> {
  if (definition != null) {
    ;(loader as LazyCommand<Options>).commandName = definition.name
    ;(loader as LazyCommand<Options>).description = definition.description
    ;(loader as LazyCommand<Options>).options = definition.options
    ;(loader as LazyCommand<Options>).examples = definition.examples
    ;(loader as LazyCommand<Options>).resource = definition.resource
  }
  return loader
}
