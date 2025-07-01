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
  GunshiParams
} from '../types.ts'
import type { PluginContext } from './context.ts'

/**
 * Plugin dependency definition
 */
export interface PluginDependency {
  /**
   * Dependency plugin id
   */
  id: string
  /**
   * Optional dependency flag.
   * If true, the plugin will not throw an error if the dependency is not found.
   */
  optional?: boolean
}

/**
 *  Plugin function type
 */
export type PluginFunction<G extends GunshiParams = DefaultGunshiParams> = (
  ctx: Readonly<PluginContext<G>>
) => Awaitable<void>

/**
 * Plugin extension for CommandContext
 */
export type PluginExtension<
  T = Record<string, unknown>,
  G extends GunshiParams = DefaultGunshiParams
> = (ctx: CommandContextCore<G>, cmd: Command<G>) => T

/**
 * Plugin extension callback type
 */
export type OnPluginExtension<G extends GunshiParams = DefaultGunshiParams> = (
  ctx: Readonly<CommandContext<G>>,
  cmd: Readonly<Command<G>>
) => void

/**
 * Plugin definition options
 */
export interface PluginOptions<
  T extends Record<string, unknown> = Record<never, never>,
  G extends GunshiParams = DefaultGunshiParams
> {
  /**
   * Plugin unique identifier
   */
  id: string
  /**
   * Plugin name
   */
  name?: string
  /**
   * Plugin dependencies
   */
  dependencies?: (PluginDependency | string)[]
  /**
   * Plugin setup function
   */
  setup?: PluginFunction<G>
  /**
   * Plugin extension
   */
  extension?: PluginExtension<T, G>
  /**
   * Callback for when the plugin is extended with `extension` option.
   */
  onExtension?: OnPluginExtension<G>
}

/**
 * Gunshi plugin, which is a function that receives a PluginContext.
 * @param ctx - A {@link PluginContext}.
 * @returns An {@link Awaitable} that resolves when the plugin is loaded.
 */
export type Plugin<E extends GunshiParams['extensions'] = DefaultGunshiParams['extensions']> =
  PluginFunction & {
    id: string
    name?: string
    dependencies?: (PluginDependency | string)[]
    extension?: CommandContextExtension<E>
  }

/**
 * Plugin return type with extension
 * @internal
 */
export interface PluginWithExtension<
  E extends GunshiParams['extensions'] = DefaultGunshiParams['extensions']
> extends Plugin<E> {
  id: string
  name: string
  dependencies?: (PluginDependency | string)[]
  extension: CommandContextExtension<E>
}

/**
 * Plugin return type without extension
 * @internal
 */
export interface PluginWithoutExtension<
  E extends GunshiParams['extensions'] = DefaultGunshiParams['extensions']
> extends Plugin<E> {
  id: string
  name: string
  dependencies?: (PluginDependency | string)[]
}

/**
 * Define a plugin with extension capabilities
 * @param options - {@link PluginOptions | plugin options}
 * @return A defined plugin with extension capabilities.
 */
export function plugin<
  I extends string,
  P extends PluginExtension<any, DefaultGunshiParams> // eslint-disable-line @typescript-eslint/no-explicit-any
>(options: {
  id: I
  name?: string
  dependencies?: (PluginDependency | string)[]
  setup?: (
    ctx: Readonly<
      PluginContext<GunshiParams<{ args: Args; extensions: { [K in I]: ReturnType<P> } }>>
    >
  ) => Awaitable<void>
  extension: P
  onExtension?: OnPluginExtension<{ args: Args; extensions: { [K in I]: ReturnType<P> } }>
}): PluginWithExtension<ReturnType<P>>

/**
 * Define a plugin without extension capabilities
 * @param options - {@link PluginOptions | plugin options} without extension
 * @returns A defined plugin without extension capabilities.
 */
export function plugin(options: {
  id: string
  name?: string
  dependencies?: (PluginDependency | string)[]
  setup?: (ctx: Readonly<PluginContext<DefaultGunshiParams>>) => Awaitable<void>
}): PluginWithoutExtension<DefaultGunshiParams['extensions']>

/**
 * Define a plugin
 * @param options - {@link PluginOptions | plugin options}
 * @returns A defined plugin.
 */
export function plugin<
  I extends string,
  E extends GunshiParams['extensions'] = DefaultGunshiParams['extensions']
>(options: {
  id: I
  name?: string
  dependencies?: (PluginDependency | string)[]
  setup?: (
    ctx: Readonly<PluginContext<GunshiParams<{ args: Args; extensions: { [K in I]?: E } }>>>
  ) => Awaitable<void>
  extension?: PluginExtension<E, DefaultGunshiParams>
  onExtension?: OnPluginExtension<{ args: Args; extensions: { [K in I]?: E } }>
}): PluginWithExtension<E> | PluginWithoutExtension<DefaultGunshiParams['extensions']> {
  const { id, name, setup, extension, onExtension, dependencies } = options

  // create a wrapper function with properties
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  }) as PluginWithExtension<E> | PluginWithoutExtension<DefaultGunshiParams['extensions']>
}
