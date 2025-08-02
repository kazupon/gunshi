/**
 * The entry for gunshi command definition.
 *
 * This entry point exports the following APIs and types:
 * - `define`: A function to define a command.
 * - `lazy`: A function to lazily load a command.
 * - Some basic type definitions, such as `Command`, `LazyCommand`, etc.
 *
 * @example
 * ```js
 * import { define } from 'gunshi/definition'
 *
 * export default define({
 *   name: 'say',
 *   args: {
 *     say: {
 *       type: 'string',
 *       description: 'say something',
 *       default: 'hello!'
 *     }
 *   },
 *   run: ctx => {
 *     return `You said: ${ctx.values.say}`
 *   }
 * })
 * ```
 *
 * @module
 */

/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type {
  Args,
  Command,
  CommandLoader,
  DefaultGunshiParams,
  ExtendContext,
  GunshiParamsConstraint,
  LazyCommand
} from './types.ts'

export type {
  Args,
  ArgSchema,
  ArgValues,
  Command,
  CommandLoader,
  CommandRunner,
  DefaultGunshiParams,
  ExtendContext,
  GunshiParams,
  LazyCommand
} from './types.ts'

/**
 * Define a {@link Command | command}
 *
 * @param definition A {@link Command | command} definition
 * @returns A defined {@link Command | command}
 */
export function define<A extends Args>(
  definition: Command<{ args: A; extensions: {} }>
): Command<{ args: A; extensions: {} }>

/**
 * Define a {@link Command | command}
 *
 * @param definition A {@link Command | command} definition
 * @returns A defined {@link Command | command}
 */
export function define<E extends ExtendContext>(
  definition: Command<{ args: Args; extensions: E }>
): Command<{ args: Args; extensions: E }>

/**
 * Define a {@link Command | command}
 *
 * @param definition A {@link Command | command} definition
 * @returns A defined {@link Command | command}
 */
export function define<G extends GunshiParamsConstraint = DefaultGunshiParams>(
  definition: Command<G>
): Command<G>

/**
 * Define a {@link Command | command}
 *
 * @param definition A {@link Command | command} definition
 * @returns A defined {@link Command | command}
 */
export function define<G extends GunshiParamsConstraint = DefaultGunshiParams>(
  definition: Command<G>
): Command<G> {
  return definition
}

/**
 * Define a {@link LazyCommand | lazy command}
 *
 * @param loader A {@link CommandLoader | command loader}
 * @returns A {@link LazyCommand | lazy command} loader
 */
export function lazy<A extends Args>(
  loader: CommandLoader<{ args: A; extensions: {} }>
): LazyCommand<{ args: A; extensions: {} }>

/**
 * Define a {@link LazyCommand | lazy command} with definition.
 *
 * @param loader A {@link CommandLoader | command loader} function that returns a command definition
 * @param definition An optional {@link Command | command} definition
 * @returns A {@link LazyCommand | lazy command} that can be executed later
 */
export function lazy<A extends Args>(
  loader: CommandLoader<{ args: A; extensions: {} }>,
  definition: Command<{ args: A; extensions: {} }>
): LazyCommand<{ args: A; extensions: {} }>

/**
 * Define a {@link LazyCommand | lazy command}
 *
 * @param loader A {@link CommandLoader | command loader}
 * @returns A {@link LazyCommand | lazy command} loader
 */
export function lazy<E extends ExtendContext>(
  loader: CommandLoader<{ args: Args; extensions: E }>
): LazyCommand<{ args: Args; extensions: E }>

/**
 * Define a {@link LazyCommand | lazy command} with definition.
 *
 * @param loader A {@link CommandLoader | command loader} function that returns a command definition
 * @param definition An optional {@link Command | command} definition
 * @returns A {@link LazyCommand | lazy command} that can be executed later
 */
export function lazy<E extends ExtendContext>(
  loader: CommandLoader<{ args: Args; extensions: E }>,
  definition: Command<{ args: Args; extensions: E }>
): LazyCommand<{ args: Args; extensions: E }>

/**
 * Define a {@link LazyCommand | lazy command}
 *
 * @param loader A {@link CommandLoader | command loader}
 * @returns A {@link LazyCommand | lazy command} loader
 */
export function lazy<G extends GunshiParamsConstraint = DefaultGunshiParams>(
  loader: CommandLoader<G>
): LazyCommand<G>

/**
 * Define a {@link LazyCommand | lazy command} with definition.
 *
 * @param loader A {@link CommandLoader | command loader} function that returns a command definition
 * @param definition An optional {@link Command | command} definition
 * @returns A {@link LazyCommand | lazy command} that can be executed later
 */
export function lazy<G extends GunshiParamsConstraint = DefaultGunshiParams>(
  loader: CommandLoader<G>,
  definition: Command<G>
): LazyCommand<G>

/**
 * Define a {@link LazyCommand | lazy command} with or without definition.
 *
 * @param loader A {@link CommandLoader | command loader} function that returns a command definition
 * @param definition An optional {@link Command | command} definition
 * @returns A {@link LazyCommand | lazy command} that can be executed later
 */
export function lazy<G extends GunshiParamsConstraint = DefaultGunshiParams>(
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
    lazyCommand.internal = definition.internal
    lazyCommand.entry = definition.entry
    // @ts-ignore - resource property is now provided by plugin-i18n
    if ('resource' in definition) {
      // @ts-ignore
      lazyCommand.resource = definition.resource
    }
    lazyCommand.toKebab = definition.toKebab
  }

  return lazyCommand
}
