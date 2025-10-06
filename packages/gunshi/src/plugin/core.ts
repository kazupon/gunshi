/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type { Args } from 'args-tokens'
import type {
  Awaitable,
  Command,
  CommandContext,
  CommandContextCore,
  CommandContextExtension,
  DefaultGunshiParams,
  ExtendContext,
  GunshiParams
} from '../types.ts'
import type { PluginContext } from './context.ts'

const NOOP_EXTENSION = () => {
  return Object.create(null)
}

/**
 * Helper type to extract plugin ID from dependency
 *
 * @internal
 */
export type ExtractDependencyId<D> = D extends PluginDependency
  ? D['id']
  : D extends string
    ? D
    : never

/**
 * Helper type to check if dependency is optional
 *
 * @internal
 */
export type IsOptionalDependency<D> = D extends PluginDependency
  ? D['optional'] extends true
    ? true
    : false
  : false

type ProcessDependency<D, A extends ExtendContext> = D extends string
  ? D extends keyof A
    ? { [K in D]: A[K] }
    : {}
  : D extends { id: infer ID; optional?: any } // eslint-disable-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): generic type
    ? ID extends string
      ? ID extends keyof A
        ? D extends { optional: true }
          ? { [K in ID]: A[K] | undefined }
          : { [K in ID]: A[K] }
        : {}
      : never
    : never

/**
 * Helper type to infer dependency extensions with optional support
 *
 * @internal
 */
export type InferDependencyExtensions<
  D extends ReadonlyArray<PluginDependency | string>,
  A extends ExtendContext
> = D extends readonly []
  ? {}
  : D extends readonly [infer First, ...infer Rest]
    ? ProcessDependency<First, A> &
        (Rest extends ReadonlyArray<PluginDependency | string>
          ? InferDependencyExtensions<Rest, A>
          : {})
    : {}

/**
 * Plugin dependency definition
 *
 * @since v0.27.0
 */
export interface PluginDependency {
  /**
   * Dependency plugin id
   */
  id: string
  /**
   * Optional dependency flag.
   * If `true`, the plugin will not throw an error if the dependency is not found
   */
  optional?: boolean
}

/**
 * Plugin function type
 *
 * @typeParam G - A type extending {@linkcode GunshiParams} to specify the {@linkcode PluginContext}.
 *
 * @since v0.27.0
 */
export type PluginFunction<G extends GunshiParams = DefaultGunshiParams> = (
  ctx: Readonly<PluginContext<G>>
) => Awaitable<void>

/**
 * Plugin extension
 *
 * @typeParam T - The type of the extension object returned by the plugin extension function.
 * @typeParam G - A type extending {@linkcode GunshiParams} to specify the shape of {@linkcode CommandContextCore}.
 *
 * @param ctx - The {@linkcode CommandContextCore | command context} core
 * @param cmd - The {@linkcode Command | command} to which the plugin is being applied
 * @returns An object of type T that represents the extension provided by the plugin
 *
 * @since v0.27.0
 */
export type PluginExtension<
  T = Record<string, unknown>,
  G extends GunshiParams = DefaultGunshiParams
> = (ctx: CommandContextCore<G>, cmd: Command<G>) => Awaitable<T>

/**
 * Plugin extension callback, which is called when the plugin is extended with `extension` option.
 *
 * @typeParam G - A type extending {@linkcode GunshiParams} to specify the shape of {@linkcode CommandContext} and {@linkcode Command}.
 *
 * @param ctx - The {@linkcode CommandContext | command context}
 * @param cmd - The {@linkcode Command | command}
 *
 * @since v0.27.0
 */
export type OnPluginExtension<G extends GunshiParams = DefaultGunshiParams> = (
  ctx: Readonly<CommandContext<G>>,
  cmd: Readonly<Command<G>>
) => Awaitable<void>

type IsStringLiteral<S extends string> = string extends S ? false : true

type MergeExtension<
  Id,
  ResolvedDepExt extends ExtendContext,
  PluginExt extends ExtendContext
> = Id extends infer I
  ? I extends string
    ? IsStringLiteral<I> extends true
      ? ResolvedDepExt & { [K in I]: PluginExt }
      : ResolvedDepExt
    : ResolvedDepExt
  : ResolvedDepExt

/**
 * Plugin definition options
 *
 * @since v0.27.0
 */
export interface PluginOptions<
  DepExt extends ExtendContext = DefaultGunshiParams['extensions'], // for plugin dependency extensions
  Id extends string = string, // for plugin id
  Deps extends ReadonlyArray<PluginDependency | string> = (PluginDependency | string)[], // for plugin dependencies
  Ext extends Record<string, unknown> = {}, // for plugin extension type
  ResolvedDepExt extends GunshiParams = GunshiParams<{
    args: Args
    extensions: InferDependencyExtensions<Deps, DepExt>
  }>,
  PluginExt extends PluginExtension<Ext, ResolvedDepExt> = PluginExtension<Ext, ResolvedDepExt>,
  MergedExt extends GunshiParams = GunshiParams<{
    args: Args
    extensions: MergeExtension<
      Id,
      InferDependencyExtensions<Deps, DepExt>,
      Awaited<ReturnType<PluginExt>>
    >
  }>
> {
  /**
   * Plugin unique identifier
   */
  id: Id
  /**
   * Plugin name
   */
  name?: string
  /**
   * Plugin dependencies
   */
  dependencies?: Deps
  /**
   * Plugin setup function
   */
  setup?: PluginFunction<MergedExt>
  /**
   * Plugin extension
   */
  extension?: PluginExt
  /**
   * Callback for when the plugin is extended with `extension` option.
   */
  onExtension?: OnPluginExtension<MergedExt>
}

/**
 * Gunshi plugin, which is a function that receives a PluginContext.
 *
 * @typeParam E - A type extending {@link GunshiParams} to specify the shape of {@linkcode CommandContext}'s extensions.
 *
 * @param ctx - A {@linkcode PluginContext}.
 * @returns An {@linkcode Awaitable} that resolves when the plugin is loaded.
 *
 * @since v0.27.0
 */
export type Plugin<E extends GunshiParams['extensions'] = DefaultGunshiParams['extensions']> =
  PluginFunction & {
    id: string
    name?: string
    dependencies?: (PluginDependency | string)[]
    extension?: CommandContextExtension<E>
  }

/**
 * Plugin return type with extension, which includes the plugin ID, name, dependencies, and extension.
 *
 * This type is used to define a plugin at `plugin` function.
 *
 * @typeParam E - A type extending {@link GunshiParams} to specify the shape of {@linkcode CommandContext}'s extensions.
 */
export interface PluginWithExtension<
  E extends GunshiParams['extensions'] = DefaultGunshiParams['extensions']
> extends Plugin<E> {
  /**
   * Plugin identifier
   */
  id: string
  /**
   * Plugin name
   */
  name: string
  /**
   * Plugin dependencies
   */
  dependencies?: (PluginDependency | string)[]
  /**
   * Plugin extension
   */
  extension: CommandContextExtension<E>
}

/**
 * Plugin return type without extension, which includes the plugin ID, name, and dependencies, but no extension.
 *
 * This type is used to define a plugin at `plugin` function without extension.
 *
 * @typeParam E - A type extending {@link GunshiParams} to specify the shape of {@linkcode CommandContext}'s extensions.
 */
export interface PluginWithoutExtension<
  E extends GunshiParams['extensions'] = DefaultGunshiParams['extensions']
> extends Plugin<E> {
  /**
   * Plugin identifier
   */
  id: string
  /**
   * Plugin name
   */
  name: string
  /**
   * Plugin dependencies
   */
  dependencies?: (PluginDependency | string)[]
}

/**
 * Define a plugin with extension compatibility and typed dependency extensions
 *
 * @typeParam Context - A type extending {@linkcode ExtendContext} to specify the shape of plugin dependency extensions.
 * @typeParam Id - A string type to specify the plugin ID.
 * @typeParam Deps - A readonly array of {@linkcode PluginDependency} or string to specify the plugin dependencies.
 * @typeParam Extension - A type to specify the shape of the plugin extension object.
 *
 * @param options - {@linkcode PluginOptions | plugin options}
 * @returns A defined plugin with extension
 *
 * @since v0.27.0
 */
export function plugin<
  Context extends ExtendContext = DefaultGunshiParams['extensions'], // for plugin dependency extensions
  Id extends string = string, // for plugin id
  Deps extends ReadonlyArray<PluginDependency | string> = [], // for plugin dependencies
  Extension extends {} = {}, // for plugin extension type
  ResolvedDepExtensions extends GunshiParams = GunshiParams<{
    args: Args
    extensions: InferDependencyExtensions<Deps, Context>
  }>,
  PluginExt extends PluginExtension<Extension, DefaultGunshiParams> = PluginExtension<
    Extension,
    ResolvedDepExtensions
  >,
  MergedExtensions extends GunshiParams = GunshiParams<{
    args: Args
    extensions: MergeExtension<
      Id,
      InferDependencyExtensions<Deps, Context>,
      Awaited<ReturnType<PluginExt>>
    >
  }>
>(options: {
  id: Id
  name?: string
  dependencies?: Deps
  setup?: (
    ctx: Readonly<
      PluginContext<
        GunshiParams<{
          args: Args
          extensions: MergeExtension<
            Id,
            InferDependencyExtensions<Deps, Context>,
            Awaited<ReturnType<PluginExt>>
          >
        }>
      >
    >
  ) => Awaitable<void>
  extension: PluginExt
  onExtension?: OnPluginExtension<MergedExtensions>
}): PluginWithExtension<Awaited<ReturnType<PluginExt>>>

/**
 * Define a plugin without extension and typed dependency extensions
 *
 * @typeParam Context - A type extending {@linkcode ExtendContext} to specify the shape of plugin dependency extensions.
 * @typeParam Id - A string type to specify the plugin ID.
 * @typeParam Deps - A readonly array of {@linkcode PluginDependency} or string to specify the plugin dependencies.
 * @typeParam Extension - A type to specify the shape of the plugin extension object.
 *
 * @param options - {@linkcode PluginOptions | plugin options} without extension
 * @returns A defined plugin without extension
 *
 * @since v0.27.0
 */
export function plugin<
  Context extends ExtendContext = DefaultGunshiParams['extensions'], // for plugin dependency extensions
  Id extends string = string, // for plugin id
  Deps extends ReadonlyArray<PluginDependency | string> = [], // for plugin dependencies
  Extension extends Record<string, unknown> = {}, // for plugin extension type
  ResolvedDepExtensions extends GunshiParams = GunshiParams<{
    args: Args
    extensions: InferDependencyExtensions<Deps, Context>
  }>,
  PluginExt extends PluginExtension<Extension, DefaultGunshiParams> = PluginExtension<
    Extension,
    ResolvedDepExtensions
  >,
  MergedExtensions extends GunshiParams = GunshiParams<{
    args: Args
    extensions: MergeExtension<
      Id,
      InferDependencyExtensions<Deps, Context>,
      Awaited<ReturnType<PluginExt>>
    >
  }>
>(options: {
  id: Id
  name?: string
  dependencies?: Deps
  setup?: (
    ctx: Readonly<
      PluginContext<
        GunshiParams<{
          args: Args
          extensions: MergeExtension<
            Id,
            InferDependencyExtensions<Deps, Context>,
            Awaited<ReturnType<PluginExt>>
          >
        }>
      >
    >
  ) => Awaitable<void>
  onExtension?: OnPluginExtension<MergedExtensions>
}): PluginWithoutExtension<DefaultGunshiParams['extensions']>

/**
 * Define a plugin
 *
 * @param options - {@linkcode PluginOptions | plugin options}
 * @returns A defined plugin
 *
 * @since v0.27.0
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): generic type for plugin options
export function plugin(options: any = {}): any {
  const { id, name, setup, onExtension, dependencies } = options
  const extension = options.extension || NOOP_EXTENSION

  // create a wrapper function with properties
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): generic type for plugin function
  const pluginFn = async (ctx: Readonly<PluginContext<any>>) => {
    if (setup) {
      await setup(ctx)
    }
  }

  // define the properties
  return Object.defineProperties(pluginFn, {
    id: {
      value: id,
      writable: false,
      enumerable: true,
      configurable: true
    },
    ...(name && {
      name: {
        value: name,
        writable: false,
        enumerable: true,
        configurable: true
      }
    }),
    ...(dependencies && {
      dependencies: {
        value: dependencies,
        writable: false,
        enumerable: true,
        configurable: true
      }
    }),
    ...(extension && {
      extension: {
        value: {
          key: Symbol(id),
          factory: extension,
          onFactory: onExtension
        },
        writable: false,
        enumerable: true,
        configurable: true
      }
    })
  })
}
