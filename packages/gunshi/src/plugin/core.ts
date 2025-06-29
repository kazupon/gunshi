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
   * Dependency plugin name
   */
  name: string
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
   * Plugin name
   */
  name: string
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
  name: string
  dependencies?: (PluginDependency | string)[]
}

/**
 * Create a plugin with extension capabilities
 * @param options - {@link PluginOptions | plugin options}
 */
export function plugin<
  N extends string,
  P extends PluginExtension<any, DefaultGunshiParams> // eslint-disable-line @typescript-eslint/no-explicit-any
>(options: {
  name: N
  dependencies?: (PluginDependency | string)[]
  setup?: (
    ctx: Readonly<
      PluginContext<GunshiParams<{ args: Args; extensions: { [K in N]: ReturnType<P> } }>>
    >
  ) => Awaitable<void>
  extension: P
  onExtension?: OnPluginExtension<{ args: Args; extensions: { [K in N]: ReturnType<P> } }>
}): PluginWithExtension<ReturnType<P>>

export function plugin(options: {
  name: string
  dependencies?: (PluginDependency | string)[]
  setup?: (ctx: Readonly<PluginContext<DefaultGunshiParams>>) => Awaitable<void>
}): PluginWithoutExtension<DefaultGunshiParams['extensions']>

export function plugin<
  N extends string,
  E extends GunshiParams['extensions'] = DefaultGunshiParams['extensions']
>(options: {
  name: N
  dependencies?: (PluginDependency | string)[]
  setup?: (
    ctx: Readonly<PluginContext<GunshiParams<{ args: Args; extensions: { [K in N]?: E } }>>>
  ) => Awaitable<void>
  extension?: PluginExtension<E, DefaultGunshiParams>
  onExtension?: OnPluginExtension<{ args: Args; extensions: { [K in N]?: E } }>
}): PluginWithExtension<E> | PluginWithoutExtension<DefaultGunshiParams['extensions']> {
  const { name, setup, extension, onExtension, dependencies } = options

  // create a wrapper function with properties
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pluginFn = async (ctx: Readonly<PluginContext<any>>) => {
    if (setup) {
      await setup(ctx)
    }
  }

  // define the properties
  return Object.defineProperties(pluginFn, {
    name: {
      value: name,
      writable: false,
      enumerable: true,
      configurable: true
    },
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
          key: Symbol(name),
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
