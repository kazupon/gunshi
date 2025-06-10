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
  ContextExtension,
  ExtendedCommand,
  LazyCommand
} from './types.ts'

export type { Args, ArgSchema, ArgValues } from 'args-tokens'

/**
 * Define a {@link Command | command} with type inference
 * @param definition A {@link Command | command} definition
 * @returns A {@link Command | command} definition with type inference
 */
export function define<A extends Args = Args>(definition: Command<A>): Command<A>

/**
 * Define an {@link ExtendedCommand | extended command} with type inference and extension support
 * @param definition An {@link ExtendedCommand | extended command} definition with extensions
 * @returns An {@link ExtendedCommand | extended command} definition with type inference
 */
export function define<
  A extends Args = Args,
  E extends Record<string, ContextExtension> = Record<string, ContextExtension>
>(
  definition: ExtendedCommand<A, E> & {
    extensions?: E
  }
): ExtendedCommand<A, E>

export function define<
  A extends Args = Args,
  E extends Record<string, ContextExtension> = Record<string, ContextExtension>
>(
  definition: Command<A> | (ExtendedCommand<A, E> & { extensions?: E })
): Command<A> | ExtendedCommand<A, E> {
  if ('extensions' in definition && definition.extensions) {
    const { extensions, ...rest } = definition
    return { ...rest, _extensions: extensions } as ExtendedCommand<A, E>
  }
  return definition as Command<A>
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
): LazyCommand<A>

/**
 * Define a {@link LazyCommand | lazy command} with extension support
 * @param loader A {@link CommandLoader | command loader}
 * @param definition An {@link ExtendedCommand | extended command} definition with extensions
 * @returns A {@link LazyCommand | lazy command} loader with extension support
 */
export function lazy<
  A extends Args = Args,
  E extends Record<string, ContextExtension> = Record<string, ContextExtension>
>(
  loader: CommandLoader<A>,
  definition?: ExtendedCommand<A, E> & { extensions?: E }
): LazyCommand<A> & { _extensions?: E }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazy<A extends Args = Args>(loader: CommandLoader<A>, definition?: any): any {
  const lazyCommand = loader as LazyCommand<A>

  if (definition != null) {
    // copy existing properties
    lazyCommand.commandName = definition.name
    lazyCommand.description = definition.description
    lazyCommand.args = definition.args
    lazyCommand.examples = definition.examples
    lazyCommand.resource = definition.resource
    lazyCommand.toKebab = definition.toKebab

    // handle extensions
    if (definition.extensions) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(lazyCommand as any)._extensions = definition.extensions
    } else if (definition._extensions) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(lazyCommand as any)._extensions = definition._extensions
    }
  }

  return lazyCommand
}
