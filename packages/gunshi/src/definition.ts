/**
 * The entry for gunshi command definition.
 *
 * This entry point exports the following APIs and types:
 * - `define`: A function to define a command.
 * - `defineWithExtensions`: A function to define a command with extensions.
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
  ExtractArgs,
  ExtractExtensions,
  GunshiParamsConstraint,
  LazyCommand,
  Prettify
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
 * Infer command properties excluding for {@link define} function
 */
type InferCommandProps<G extends GunshiParamsConstraint = DefaultGunshiParams> = Pick<
  Command<G>,
  Exclude<keyof Command<G>, keyof Command<G>>
>

/**
 * The result type of the {@link define} function
 */
type CommandDefinitionResult<
  G extends GunshiParamsConstraint = DefaultGunshiParams,
  C extends Command<G> = Command<G>
> = Prettify<Pick<C, keyof C> & Partial<Pick<Command<G>, Exclude<keyof Command<G>, keyof C>>>>

/**
 * Define a {@link Command | command}.
 *
 * @example
 * ```ts
 * const command = define({
 *   name: 'test',
 *   description: 'A test command',
 *   args: {
 *     debug: {
 *       type: 'boolean',
 *       description: 'Enable debug mode',
 *       default: false
 *     }
 *   },
 *   run: ctx => {
 *     if (ctx.values.debug) {
 *       console.debug('Debug mode is enabled');
 *     }
 *   }
 * })
 * ```
 *
 * @typeParam G - A {@link GunshiParamsConstraint} type
 * @typeParam A - An {@link Args} type extracted from {@link GunshiParamsConstraint}
 * @typeParam C - A {@link Command} type inferred from {@link GunshiParamsConstraint}
 *
 * @param definition - A {@link Command | command} definition
 * @returns A defined {@link Command | command}
 */
export function define<
  G extends GunshiParamsConstraint = DefaultGunshiParams,
  A extends Args = ExtractArgs<G>,
  C extends InferCommandProps<G> = InferCommandProps<G>
>(
  definition: C & Command<{ args: A; extensions: ExtractExtensions<G> }>
): CommandDefinitionResult<G, C>

/**
 * Define a {@link Command | command}.
 *
 * @typeParam G - A {@link GunshiParamsConstraint} type
 *
 * @param definition - A {@link Command | command} definition
 * @returns A defined {@link Command | command}
 */
export function define<G extends GunshiParamsConstraint = DefaultGunshiParams>(
  definition: Command<G>
): Command<G> {
  return definition
}

/**
 * Define a {@link Command | command} with extensions type parameter.
 *
 * This helper function allows specifying the extensions type parameter
 * while inferring the args type from the definition.
 *
 * @example
 * ```ts
 * type MyExtensions = { logger: { log: (message: string) => void } }
 *
 * const command = defineWithExtensions<MyExtensions>()({
 *   args: { name: { type: 'string' } },
 *   run: ctx => {
 *     // ctx.values is inferred as { name?: string }
 *     // ctx.extensions is MyExtensions
 *   }
 * })
 * ```
 *
 * @typeParam E - The extensions type
 *
 * @returns A function that takes a command definition via {@link define}
 *
 * @since v0.27.0
 */
export function defineWithExtensions<E extends ExtendContext = never>() {
  return <
    G extends GunshiParamsConstraint = DefaultGunshiParams,
    A extends Args = ExtractArgs<G>,
    C extends InferCommandProps<G> = InferCommandProps<G>
  >(
    definition: C & Command<{ args: A; extensions: E }>
  ): CommandDefinitionResult<G, C> => define(definition) as CommandDefinitionResult<G, C>
}

/**
 * Define a {@link LazyCommand | lazy command}.
 *
 * @example
 * ```ts
 * // load command with dynamic importing
 * const test = lazy(() => import('./commands/test'))
 * ```
 *
 * @typeParam A - An {@link Args} type
 *
 * @param loader - A {@link CommandLoader | command loader}
 * @returns A {@link LazyCommand | lazy command} with loader
 */
export function lazy<A extends Args>(
  loader: CommandLoader<{ args: A; extensions: {} }>
): LazyCommand<{ args: A; extensions: {} }, {}>

/**
 * Define a {@link LazyCommand | lazy command} with definition.
 *
 * @example
 * ```ts
 * // define command without command runner
 * const test = define({
 *   name: 'test',
 *   description: 'Test command',
 *   args: {
 *     debug: {
 *       type: 'boolean',
 *       description: 'Enable debug mode',
 *       default: false
 *     }
 *   },
 * })
 *
 * // define load command with command runner and defined command
 * const lazyTest = lazy((): CommandRunner<{ args: typeof test.args; extensions: {} }> => {
 *   return ctx => {
 *     if (ctx.values.debug) {
 *       console.debug('Debug mode is enabled');
 *     }
 *   }
 * }, test)
 * ```
 *
 * @typeParam A - An {@link Args} type
 * @typeParam D - A partial {@link Command} definition type
 *
 * @param loader - A {@link CommandLoader | command loader} function that returns a command definition
 * @param definition - An optional {@link Command | command} definition
 * @returns A {@link LazyCommand | lazy command} that can be executed later
 */
export function lazy<
  A extends Args,
  D extends Partial<Command<{ args: A; extensions: {} }>> = Partial<
    Command<{ args: A; extensions: {} }>
  >
>(
  loader: CommandLoader<{ args: A; extensions: {} }>,
  definition: D
): LazyCommand<{ args: A; extensions: {} }, D>

/**
 * Define a {@link LazyCommand | lazy command} with or without definition.
 *
 * @param loader - A {@link CommandLoader | command loader} function that returns a command definition
 * @param definition - An optional {@link Command | command} definition
 * @returns A {@link LazyCommand | lazy command} that can be executed later
 */
export function lazy<G extends GunshiParamsConstraint = DefaultGunshiParams>(
  loader: CommandLoader<G>,
  definition?: Partial<Command<G>>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- for generic D
): LazyCommand<G, any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- for generic D
  const lazyCommand = loader as LazyCommand<G, any>

  if (definition != null) {
    // copy existing properties
    lazyCommand.commandName = definition.name
    lazyCommand.description = definition.description
    lazyCommand.args = definition.args
    lazyCommand.examples = definition.examples
    lazyCommand.internal = definition.internal
    lazyCommand.entry = definition.entry
    lazyCommand.toKebab = definition.toKebab
    // resource property is now provided by plugin-i18n
    if ('resource' in definition) {
      lazyCommand.resource = definition.resource
    }
  }

  return lazyCommand
}

/**
 * Define a {@link LazyCommand | lazy command} with extensions type parameter.
 *
 * @typeParam E - The extensions type
 *
 * @returns A function that takes a lazy command definition via {@link lazy}
 *
 * @since v0.27.0
 */
export function lazyWithExtensions<E extends ExtendContext = never>() {
  return <
    A extends Args,
    D extends Partial<Command<{ args: A; extensions: {} }>> = Partial<
      Command<{ args: A; extensions: {} }>
    >
  >(
    loader: CommandLoader<{ args: A; extensions: E }>,
    definition?: D
  ): LazyCommand<{ args: A; extensions: E }, D> =>
    lazy(loader, definition as D) as LazyCommand<{ args: A; extensions: E }, D>
}
