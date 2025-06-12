/**
 * The gunshi plugin entry point
 *
 * @example
 * ```js
 * ```
 *
 * @module default
 */

/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { Decorators } from './decorators.ts'

import type { Args, ArgSchema } from 'args-tokens'
import type {
  Awaitable,
  CommandContextCore,
  CommandContextExtension,
  CommandContextWithExt,
  CommandDecorator,
  RendererDecorator,
  ValidationErrorsDecorator
} from './types.ts'

/**
 * Gunshi plugin context.
 * @typeParam A - The args type
 * @typeParam E - The expected extension shape for contexts in decorators
 */
export class PluginContext<
  A extends Args = Args,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  E extends Record<string, any> = Record<string, never>
> {
  #globalOptions: Map<string, ArgSchema> = new Map()
  #decorators: Decorators<A>

  constructor(decorators: Decorators<A>) {
    this.#decorators = decorators
  }

  /**
   * Get the global options
   * @returns A map of global options.
   */
  get globalOptions(): Map<string, ArgSchema> {
    return new Map(this.#globalOptions)
  }

  /**
   * Add a global option.
   * @param name An option name
   * @param schema An {@link ArgSchema} for the option
   */
  addGlobalOption(name: string, schema: ArgSchema): void {
    if (!name) {
      throw new Error('Option name must be a non-empty string')
    }
    if (this.#globalOptions.has(name)) {
      throw new Error(`Global option '${name}' is already registered`)
    }
    this.#globalOptions.set(name, schema)
  }

  /**
   * Decorate the header renderer.
   * @param decorator - A decorator function that wraps the base header renderer.
   */
  decorateHeaderRenderer(
    decorator: (
      baseRenderer: (ctx: CommandContextWithExt<A, E>) => Promise<string>,
      ctx: CommandContextWithExt<A, E>
    ) => Promise<string>
  ): void {
    this.#decorators.addHeaderDecorator(decorator as RendererDecorator<string, A>)
  }

  /**
   * Decorate the usage renderer.
   * @param decorator - A decorator function that wraps the base usage renderer.
   */
  decorateUsageRenderer(
    decorator: (
      baseRenderer: (ctx: CommandContextWithExt<A, E>) => Promise<string>,
      ctx: CommandContextWithExt<A, E>
    ) => Promise<string>
  ): void {
    this.#decorators.addUsageDecorator(decorator as RendererDecorator<string, A>)
  }

  /**
   * Decorate the validation errors renderer.
   * @param decorator - A decorator function that wraps the base validation errors renderer.
   */
  decorateValidationErrorsRenderer(
    decorator: (
      baseRenderer: (ctx: CommandContextWithExt<A, E>, error: AggregateError) => Promise<string>,
      ctx: CommandContextWithExt<A, E>,
      error: AggregateError
    ) => Promise<string>
  ): void {
    this.#decorators.addValidationErrorsDecorator(decorator as ValidationErrorsDecorator<A>)
  }

  /**
   * Decorate the command execution.
   * Decorators are applied in reverse order (last registered is executed first).
   * @param decorator - A decorator function that wraps the command runner
   */
  decorateCommand(
    decorator: (
      baseRunner: (ctx: CommandContextWithExt<A, E>) => Awaitable<void | string>
    ) => (ctx: CommandContextWithExt<A, E>) => Awaitable<void | string>
  ): void {
    this.#decorators.addCommandDecorator(decorator as CommandDecorator<A>)
  }
}

/**
 * Plugin definition options
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface PluginOptions<T = any> {
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setup: (ctx: PluginContext<Args, Record<string, any>>) => Awaitable<void>
  extension?: (core: CommandContextCore) => T
}

/**
 * Gunshi plugin, which is a function that receives a PluginContext.
 * @param ctx - A {@link PluginContext}.
 * @returns An {@link Awaitable} that resolves when the plugin is loaded.
 */
export type Plugin = ((ctx: PluginContext) => Awaitable<void>) & {
  name?: string
  extension?: CommandContextExtension<any> // eslint-disable-line @typescript-eslint/no-explicit-any
}

/**
 * Plugin return type with extension
 */
interface PluginWithExtension<T> extends Plugin {
  name: string
  extension: CommandContextExtension<T>
}

/**
 * Plugin return type without extension
 */
interface PluginWithoutExtension extends Plugin {
  name: string
}

/**
 * Create a plugin with extension capabilities
 * @typeParam T - The type of the plugin's own extension
 * @typeParam E - The expected shape of ext in decorated contexts
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function plugin<T = any, E extends Record<string, any> = Record<string, any>>(options: {
  name: string
  setup: (ctx: PluginContext<Args, E>) => Awaitable<void>
  extension: (core: CommandContextCore) => T
}): PluginWithExtension<T>

/**
 * Create a plugin without extension
 * @typeParam E - The expected shape of ext in decorated contexts
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function plugin<E extends Record<string, any> = Record<string, never>>(options: {
  name: string
  setup: (ctx: PluginContext<Args, E>) => Awaitable<void>
}): PluginWithoutExtension

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function plugin<T = any, E extends Record<string, any> = Record<string, any>>(
  options: PluginOptions<T> & { setup: (ctx: PluginContext<Args, E>) => Awaitable<void> }
) {
  const { name, setup, extension } = options

  // create a wrapper function with properties
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pluginFn = async (ctx: PluginContext<Args, any>) =>
    await setup(ctx as PluginContext<Args, E>)

  // define the properties
  const result = Object.defineProperties(pluginFn, {
    name: {
      value: name,
      writable: false,
      enumerable: true,
      configurable: true
    },
    ...(extension && {
      extension: {
        value: {
          key: Symbol(name),
          factory: extension
        },
        writable: false,
        enumerable: true,
        configurable: true
      }
    })
  })

  return result as any // eslint-disable-line @typescript-eslint/no-explicit-any
}
