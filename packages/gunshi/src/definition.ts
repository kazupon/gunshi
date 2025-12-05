/**
 * The entry for gunshi command definition.
 *
 * This entry point exports the following APIs and types:
 * - `define`: A function to define a command.
 * - `defineWithTypes`: A function to define a command with specific type parameters.
 * - `lazy`: A function to lazily load a command.
 * - `lazyWithTypes`: A function to lazily load a command with specific type parameters.
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
  GunshiParams,
  GunshiParamsConstraint,
  LazyCommand,
  Prettify
} from './types.ts'

export { createCommandContext } from './context.ts'

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

export type { CommandContextParams } from './context.ts'

/**
 * Infer command properties excluding for {@link define} function
 *
 * @internal
 */
type InferCommandProps<G extends GunshiParamsConstraint = DefaultGunshiParams> = Pick<
  Command<G>,
  Exclude<keyof Command<G>, keyof Command<G>>
>

/**
 * The result type of the {@link define} function
 *
 * @internal
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
export function define(
  definition: any // eslint-disable-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): for implementation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): for implementation
): any {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- NOTE(kazupon): for implementation
  return definition
}

/**
 * Return type for defineWithTypes
 *
 * @typeParam DefaultExtensions - The {@link ExtendContext} type extracted from G
 *
 * @internal
 */
type DefineWithTypesReturn<DefaultExtensions extends ExtendContext, DefaultArgs extends Args> = <
  A extends DefaultArgs = DefaultArgs,
  C extends Partial<Command<{ args: A; extensions: DefaultExtensions }>> = {}
>(
  definition: C & Command<{ args: A; extensions: DefaultExtensions }>
) => CommandDefinitionResult<{ args: A; extensions: DefaultExtensions }, C>

/**
 * Define a {@link Command | command} with types
 *
 * This helper function allows specifying the type parameter of {@link GunshiParams}
 * while inferring the {@link Args} type, {@link ExtendContext} type from the definition.
 *
 * @example
 * ```ts
 * // Define a command with specific extensions type
 * type MyExtensions = { logger: { log: (message: string) => void } }
 *
 * const command = defineWithTypes<{ extensions: MyExtensions }>()({
 *   name: 'greet',
 *   args: {
 *     name: { type: 'string' }
 *   },
 *   run: ctx => {
 *     // ctx.values is inferred as { name?: string }
 *     // ctx.extensions is MyExtensions
 *   }
 * })
 * ```
 *
 * @typeParam G - A {@link GunshiParams} type
 *
 * @returns A function that takes a command definition via {@link define}
 *
 * @since v0.27.0
 */
export function defineWithTypes<G extends GunshiParamsConstraint>(): DefineWithTypesReturn<
  ExtractExtensions<G>,
  ExtractArgs<G>
> {
  // Extract extensions from G, with proper defaults
  type DefaultExtensions = ExtractExtensions<G>
  type DefaultArgs = ExtractArgs<G>

  return <
    A extends DefaultArgs = DefaultArgs,
    C extends Partial<Command<{ args: A; extensions: DefaultExtensions }>> = {}
  >(
    definition: C & Command<{ args: A; extensions: DefaultExtensions }>
  ): CommandDefinitionResult<{ args: A; extensions: DefaultExtensions }, C> => {
    return define(definition) as CommandDefinitionResult<
      { args: A; extensions: DefaultExtensions },
      C
    >
  }
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
 * const testDefinition = define({
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
 * const test = lazy((): CommandRunner<{ args: typeof testDefinition.args; extensions: {} }> => {
 *   return ctx => {
 *     if (ctx.values.debug) {
 *       console.debug('Debug mode is enabled');
 *     }
 *   }
 * }, testDefinition)
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
  G extends GunshiParamsConstraint = DefaultGunshiParams,
  A extends ExtractArgs<G> = ExtractArgs<G>,
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
 * Normalize G to a full GunshiParams type
 *
 * @typeParam G - A {@link GunshiParamsConstraint} type
 *
 * @internal
 */
type NormalizeGunshiParams<G extends GunshiParamsConstraint> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- for type inference
  G extends GunshiParams<any>
    ? G
    : G extends { args: infer A; extensions: infer E }
      ? { args: A; extensions: E }
      : G extends { args: infer A }
        ? { args: A; extensions: {} }
        : G extends { extensions: infer E }
          ? { args: Args; extensions: E }
          : DefaultGunshiParams

/**
 * Return type for lazyWithTypes
 *
 * @typeParam FullG - The normalized {@link GunshiParams} type
 *
 * @internal
 */
type LazyWithTypesReturn<FullG extends GunshiParamsConstraint> = <
  D extends Partial<Command<FullG>> = {}
>(
  loader: CommandLoader<FullG>,
  definition?: D
) => LazyCommand<FullG, D>

/**
 * Define a {@link LazyCommand | lazy command} with specific type parameters.
 *
 * This helper function allows specifying the type parameter of {@link GunshiParams}
 * while inferring the {@link Args} type, {@link ExtendContext} type from the definition.
 *
 * @example
 * ```ts
 * type MyExtensions = { logger: { log: (message: string) => void } }
 *
 * const command = lazyWithTypes<{ extensions: MyExtensions }>()(
 *   () => {
 *     return ctx => {
 *       // Command runner implementation
 *       ctx.extensions.logger?.log('Command executed')
 *   },
 *  {
 *   name: 'lazy-command',
 *   args: {
 *     opt: {
 *       type: 'string',
 *       description: 'An optional string argument',
 *       required: false,
 *     },
 *   },
 * )
 * ```
 *
 * @typeParam G - A {@link GunshiParams} type
 *
 * @returns A function that takes a lazy command definition via {@link lazy}
 *
 * @since v0.27.0
 */
export function lazyWithTypes<G extends GunshiParamsConstraint>(): LazyWithTypesReturn<
  NormalizeGunshiParams<G>
> {
  // Helper type to normalize G to a full GunshiParams type
  type FullGunshiParams = NormalizeGunshiParams<G>

  return <D extends Partial<Command<FullGunshiParams>> = {}>(
    loader: CommandLoader<FullGunshiParams>,
    definition?: D
  ): LazyCommand<FullGunshiParams, D> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument -- for type casting
    return lazy(loader as any, definition as any) as LazyCommand<FullGunshiParams, D>
  }
}
