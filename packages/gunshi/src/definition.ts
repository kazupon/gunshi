/**
 * The entry for gunshi command definition.
 *
 * This entry point exports the following APIs and types:
 * - `define`: A function to define a command.
 * - `defineWithTypes`: A function to define a command with specific type parameters.
 * - `lazy`: A function to lazily load a command.
 * - `lazyWithTypes`: A function to lazily load a command with specific type parameters.
 * - `CommandError` and `isCommandError`: An error for the failures that a command expects, and its guard.
 * - `jsonArgs`: The argument that a command spreads into its `args` to support `--json`.
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
  HasJsonArgs,
  LazyCommand,
  NormalizeToGunshiParams,
  Prettify
} from './types.ts'

export { createCommandContext } from './context.ts'
export { CommandError, isCommandError } from './error.ts'
export { jsonArgs } from './json.ts'

export type {
  Args,
  ArgSchema,
  ArgValues,
  Command,
  CommandLoader,
  CommandRunner,
  CommandRunnerResult,
  DefaultGunshiParams,
  ExtendContext,
  GunshiParams,
  JsonResult,
  LazyCommand,
  SubCommandable
} from './types.ts'

export type { CommandContextParams } from './context.ts'
export type { CommandErrorOptions } from './error.ts'

/**
 * The result type of the {@link define} function
 *
 * @internal
 */
type CommandDefinitionResult<
  G extends GunshiParamsConstraint = DefaultGunshiParams,
  C = {}
> = Prettify<Pick<C, keyof C> & Partial<Pick<Command<G>, Exclude<keyof Command<G>, keyof C>>>>

/**
 * The command definition accepted by {@link define} helpers.
 *
 * @internal
 */
type CommandDefinition<
  A extends Args,
  E extends ExtendContext,
  C extends Partial<Command<{ args: A; extensions: E }>>
> = C & Command<{ args: A; extensions: E }> & UnknownKeys<C, Command<{ args: A; extensions: E }>>

/**
 * The keys of a definition that the shape does not have, mapped to `never`
 *
 * NOTE(kazupon): the helpers infer the definition, so that the keys that it has are not optional in
 * their result. A type parameter that is inferred from an object literal takes in every key of the
 * literal, and TypeScript checks no excess property against it, so a typo such as `subcommands`
 * would type-check and be ignored at run time (#871). Mapping the keys that the shape does not have
 * to `never` reports each of them at the key.
 *
 * @internal
 */
type UnknownKeys<D, Shape> = { [K in Exclude<keyof D, keyof Shape>]: never }

/**
 * The shape of the definition of a lazy command: a command, and the `resource` of the i18n plugin,
 * which `lazy` copies onto the lazy command
 *
 * @internal
 */
type LazyDefinitionShape<G extends GunshiParamsConstraint> = Command<G> & { resource?: unknown }

/**
 * A definition of a lazy command without `run`: the `run` that a definition has is mapped to `never`
 *
 * NOTE(kazupon): a lazy command takes `run` from its loader, and never from its definition (#881): the
 * runner is what the loader loads when the command runs. A `run` in the definition would be dropped, or
 * fail as a command without `run`, so it is reported at the key. A `run` that is optional in the type
 * is not, because `define` without `run`, the definition of the guide, returns a command whose `run`
 * is optional, and so does a value of the `Command` type.
 *
 * @internal
 */
type WithoutRun<D> = { [K in D extends { run: unknown } ? 'run' : never]: never }

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
  C extends Partial<Command<{ args: A; extensions: ExtractExtensions<G> }>> = {}
>(definition: CommandDefinition<A, ExtractExtensions<G>, C>): CommandDefinitionResult<G, C>

/**
 * Define a {@link Command | command}.
 *
 * @typeParam G - A {@link GunshiParamsConstraint} type
 *
 * @param definition - A {@link Command | command} definition
 * @returns A defined {@link Command | command}
 */
export function define(definition: any): any {
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
  definition: CommandDefinition<A, DefaultExtensions, C>
) => CommandDefinitionResult<{ args: A; extensions: DefaultExtensions }, C>

/**
 * Define a {@link Command | command} with types
 *
 * This helper function allows specifying the type parameter of {@link GunshiParamsConstraint}
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
 * @typeParam G - A {@link GunshiParamsConstraint} type
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
    definition: CommandDefinition<A, DefaultExtensions, C>
  ): CommandDefinitionResult<{ args: A; extensions: DefaultExtensions }, C> => {
    return define(definition) as CommandDefinitionResult<
      { args: A; extensions: DefaultExtensions },
      C
    >
  }
}

/**
 * A definition that does not spread `jsonArgs`. A definition that does is checked by the overload that ties the
 * runner to its arguments.
 *
 * @internal
 */
type WithoutJsonArgs<D> = D extends { args: infer A }
  ? HasJsonArgs<A> extends true
    ? never
    : unknown
  : unknown

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
 * @typeParam D - A partial {@link Command} definition type with required `args`
 *
 * @param loader - A {@link CommandLoader | command loader} function that returns a command definition
 * @param definition - A {@link Command | command} definition without `run`, which the loader returns.
 *   Its `name` may be omitted, including when the lazy command is used as the CLI entry command.
 * @returns A {@link LazyCommand | lazy command} that can be executed later
 */
export function lazy<
  D extends { args: Args } & Partial<Command<{ args: D['args']; extensions: {} }>>
>(
  loader: CommandLoader<{ args: D['args']; extensions: {} }>,
  definition: D &
    UnknownKeys<D, LazyDefinitionShape<{ args: D['args']; extensions: {} }>> &
    WithoutRun<D>
): LazyCommand<{ args: D['args']; extensions: {} }, D>

/**
 * Define a {@link LazyCommand | lazy command} with explicit Gunshi parameters and optional definition.
 *
 * @typeParam G - A {@link GunshiParamsConstraint}
 * @typeParam D - A partial {@link Command} definition type
 *
 * @param loader - A {@link CommandLoader | command loader} function that returns a command definition
 * @param definition - An optional {@link Command | command} definition without `run`, which the loader
 *   returns. Its `name` may be omitted, including when the lazy command is used as the CLI entry command.
 * @returns A {@link LazyCommand | lazy command} that can be executed later
 */
export function lazy<
  G extends GunshiParamsConstraint = DefaultGunshiParams,
  D extends Partial<Command<G>> = Omit<Partial<Command<G>>, 'run'>
>(
  loader: CommandLoader<G>,
  definition?: D & WithoutJsonArgs<D> & UnknownKeys<D, LazyDefinitionShape<G>> & WithoutRun<D>
): LazyCommand<G, D>

/**
 * Define a {@link LazyCommand | lazy command} with or without definition.
 *
 * @param loader - A {@link CommandLoader | command loader} function that returns a command definition
 * @param definition - An optional {@link Command | command} definition without `run`, which the loader
 *   returns. Its `name` may be omitted, including when the lazy command is used as the CLI entry command.
 * @returns A {@link LazyCommand | lazy command} that can be executed later
 */
export function lazy<G extends GunshiParamsConstraint = DefaultGunshiParams>(
  loader: CommandLoader<G>,
  definition?: Partial<Command<G>>
): LazyCommand<G, any> {
  let lazyCommand = loader as LazyCommand<G, any>

  // Definition metadata and marker properties are copied onto the loader below.
  // Preserve its identity whenever the function object can be extended, and use
  // a delegating wrapper when the loader cannot be modified.
  if (
    (definition != null || !('commandName' in lazyCommand)) &&
    !Object.isExtensible(lazyCommand)
  ) {
    lazyCommand = Object.assign(() => loader(), loader) as LazyCommand<G, any>
  }

  if (definition == null && !('commandName' in lazyCommand)) {
    lazyCommand.commandName = undefined
  }

  if (definition != null) {
    // copy existing properties
    lazyCommand.commandName = definition.name
    lazyCommand.description = definition.description
    lazyCommand.args = definition.args
    lazyCommand.examples = definition.examples
    lazyCommand.internal = definition.internal
    lazyCommand.aliases = definition.aliases
    lazyCommand.deprecated = definition.deprecated
    lazyCommand.entry = definition.entry
    lazyCommand.toKebab = definition.toKebab
    lazyCommand.rendering = definition.rendering
    if (definition.subCommands) {
      lazyCommand.subCommands = definition.subCommands
    }
    // resource property is now provided by plugin-i18n
    if ('resource' in definition) {
      lazyCommand.resource = definition.resource
    }
  }

  return lazyCommand
}

/**
 * Return type for lazyWithTypes
 *
 * @typeParam FullG - The normalized {@link GunshiParamsConstraint} type
 *
 * @internal
 */
type LazyWithTypesReturn<FullG extends GunshiParamsConstraint> = <
  D extends Partial<Command<FullG>> = {}
>(
  loader: CommandLoader<FullG>,
  definition?: D & UnknownKeys<D, LazyDefinitionShape<FullG>> & WithoutRun<D>
) => LazyCommand<FullG, D>

/**
 * Define a {@link LazyCommand | lazy command} with specific type parameters.
 *
 * This helper function allows specifying the type parameter of {@link GunshiParamsConstraint}
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
 * @typeParam G - A {@link GunshiParamsConstraint} type
 *
 * @returns A function that takes a lazy command definition via {@link lazy}
 *
 * @since v0.27.0
 */
export function lazyWithTypes<G extends GunshiParamsConstraint>(): LazyWithTypesReturn<
  NormalizeToGunshiParams<G>
> {
  // Helper type to normalize G to a full GunshiParams type
  type FullGunshiParams = NormalizeToGunshiParams<G>

  return <D extends Partial<Command<FullGunshiParams>> = {}>(
    loader: CommandLoader<FullGunshiParams>,
    definition?: D & UnknownKeys<D, LazyDefinitionShape<FullGunshiParams>> & WithoutRun<D>
  ): LazyCommand<FullGunshiParams, D> => {
    return lazy(loader as any, definition as any) as LazyCommand<FullGunshiParams, D>
  }
}
