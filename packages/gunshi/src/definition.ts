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
  Awaitable,
  Command,
  CommandContext,
  CommandContextExtension,
  CommandLoader,
  ExtendedCommand,
  LazyCommand
} from './types.ts'

export type { Args, ArgSchema, ArgValues } from 'args-tokens'

/**
 * Define a {@link Command | command} with type inference
 * @param definition A {@link Command | command} definition
 * @returns A {@link Command | command} definition with type inference
 */
export function define<A extends Args = Args>(
  definition: Command<A>
): Command<A> & { _extensions?: never; extensions?: never }

/**
 * Define an {@link ExtendedCommand | extended command} with type inference and extension support
 * @param definition An {@link ExtendedCommand | extended command} definition with extensions
 * @returns An {@link ExtendedCommand | extended command} definition with type inference
 */
export function define<
  A extends Args = Args,
  E extends Record<string, CommandContextExtension> = Record<string, CommandContextExtension>
>(
  definition: Omit<Command<A>, 'run'> & {
    extensions: E
    run?: (
      ctx: Readonly<
        CommandContext<A> & {
          ext: { [K in keyof E]: ReturnType<E[K]['factory']> }
        }
      >
    ) => Awaitable<void | string>
  }
): ExtendedCommand<A, E> & { _extensions: E }

export function define<
  A extends Args = Args,
  E extends Record<string, CommandContextExtension> = Record<string, CommandContextExtension>
>(
  definition:
    | Command<A>
    | (Omit<Command<A>, 'run'> & {
        extensions: E
        run?: (
          ctx: Readonly<
            CommandContext<A> & {
              ext: { [K in keyof E]: ReturnType<E[K]['factory']> }
            }
          >
        ) => Awaitable<void | string>
      })
):
  | (Command<A> & { _extensions?: never; extensions?: never })
  | (ExtendedCommand<A, E> & { _extensions: E }) {
  if ('extensions' in definition && definition.extensions) {
    const { extensions, run, ...rest } = definition
    return { ...rest, run, _extensions: extensions } as ExtendedCommand<A, E> & { _extensions: E }
  }
  return definition as Command<A> & { _extensions?: never; extensions?: never }
}

/**
 * Define a {@link LazyCommand | lazy command} without definition
 * @param loader A {@link CommandLoader | command loader}
 * @returns A {@link LazyCommand | lazy command} loader
 */
export function lazy<A extends Args = Args>(
  loader: CommandLoader<A>
): LazyCommand<A> & { _extensions?: never }

/**
 * Define a {@link LazyCommand | lazy command} with command loader, which is attached with command definition as usage metadata.
 * @param loader A {@link CommandLoader | command loader}
 * @param definition A {@link Command | command} definition
 * @returns A {@link LazyCommand | lazy command} loader
 */
export function lazy<A extends Args = Args>(
  loader: CommandLoader<A>,
  definition: Omit<Command<A>, 'run'>
): LazyCommand<A> & { _extensions?: never }

/**
 * Define a {@link LazyCommand | lazy command} with extension support (extensions property)
 * @param loader A {@link CommandLoader | command loader}
 * @param definition An {@link ExtendedCommand | extended command} definition with extensions
 * @returns A {@link LazyCommand | lazy command} loader with extension support
 */
export function lazy<
  A extends Args = Args,
  E extends Record<string, CommandContextExtension> = Record<string, CommandContextExtension>
>(
  loader: CommandLoader<A>,
  definition: Omit<Command<A>, 'run'> & { extensions: E }
): LazyCommand<A> & { _extensions: E }

/**
 * Define a {@link LazyCommand | lazy command} with extension support (_extensions property)
 * @param loader A {@link CommandLoader | command loader}
 * @param definition An {@link ExtendedCommand | extended command} definition with _extensions
 * @returns A {@link LazyCommand | lazy command} loader with extension support
 */
export function lazy<
  A extends Args = Args,
  E extends Record<string, CommandContextExtension> = Record<string, CommandContextExtension>
>(
  loader: CommandLoader<A>,
  definition: Omit<Command<A>, 'run'> & { _extensions: E }
): LazyCommand<A> & { _extensions: E }

export function lazy<
  A extends Args = Args,
  E extends Record<string, CommandContextExtension> = Record<string, CommandContextExtension>
>(
  loader: CommandLoader<A>,
  definition?: Omit<Command<A>, 'run'> & ({ extensions?: E } | { _extensions?: E })
): LazyCommand<A> & { _extensions?: E | never } {
  const lazyCommand = loader as LazyCommand<A> & { _extensions?: E | never }

  if (definition != null) {
    // copy existing properties
    lazyCommand.commandName = definition.name
    lazyCommand.description = definition.description
    lazyCommand.args = definition.args
    lazyCommand.examples = definition.examples
    lazyCommand.resource = definition.resource
    lazyCommand.toKebab = definition.toKebab

    // handle extensions
    if ('extensions' in definition && definition.extensions) {
      lazyCommand._extensions = definition.extensions
    } else if ('_extensions' in definition && definition._extensions) {
      lazyCommand._extensions = definition._extensions
    }
  }

  return lazyCommand
}
