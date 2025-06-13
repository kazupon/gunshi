/**
 * The gunshi plugin entry point
 *
 * @example
 * ```js
 * import { plugin } from 'gunshi/plugin'
 * ```
 *
 * @module
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
 * @internal
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  decorateHeaderRenderer<L extends Record<string, any> = {}>(
    decorator: (
      baseRenderer: (
        ctx: CommandContextWithExt<A, keyof E extends never ? L : E & L>
      ) => Promise<string>,
      ctx: CommandContextWithExt<A, keyof E extends never ? L : E & L>
    ) => Promise<string>
  ): void {
    this.#decorators.addHeaderDecorator(decorator as RendererDecorator<string, A>)
  }

  /**
   * Decorate the usage renderer.
   * @param decorator - A decorator function that wraps the base usage renderer.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  decorateUsageRenderer<L extends Record<string, any> = {}>(
    decorator: (
      baseRenderer: (
        ctx: CommandContextWithExt<A, keyof E extends never ? L : E & L>
      ) => Promise<string>,
      ctx: CommandContextWithExt<A, keyof E extends never ? L : E & L>
    ) => Promise<string>
  ): void {
    this.#decorators.addUsageDecorator(decorator as RendererDecorator<string, A>)
  }

  /**
   * Decorate the validation errors renderer.
   * @param decorator - A decorator function that wraps the base validation errors renderer.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  decorateValidationErrorsRenderer<L extends Record<string, any> = {}>(
    decorator: (
      baseRenderer: (
        ctx: CommandContextWithExt<A, keyof E extends never ? L : E & L>,
        error: AggregateError
      ) => Promise<string>,
      ctx: CommandContextWithExt<A, keyof E extends never ? L : E & L>,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  decorateCommand<L extends Record<string, any> = {}>(
    decorator: (
      baseRunner: (
        ctx: CommandContextWithExt<A, keyof E extends never ? L : E & L>
      ) => Awaitable<void | string>
    ) => (
      ctx: CommandContextWithExt<A, keyof E extends never ? L : E & L>
    ) => Awaitable<void | string>
  ): void {
    this.#decorators.addCommandDecorator(decorator as CommandDecorator<A>)
  }
}

/**
 * Plugin extension for CommandContext
 */
export type PluginExtension<T> = (core: CommandContextCore) => T

/**
 * Plugin definition options
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface PluginOptions<T extends Record<string, any> = Record<string, never>> {
  name: string

  setup: (ctx: PluginContext<Args, T>) => Awaitable<void>
  extension?: PluginExtension<T>
}

/**
 * Gunshi plugin, which is a function that receives a PluginContext.
 * @param ctx - A {@link PluginContext}.
 * @returns An {@link Awaitable} that resolves when the plugin is loaded.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Plugin<T = any> = ((ctx: PluginContext) => Awaitable<void>) & {
  name?: string
  extension?: CommandContextExtension<T>
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
 * @param options - {@link PluginOptions | plugin options}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function plugin<T extends Record<string, any> = any>(options: {
  name: string
  setup: (ctx: PluginContext<Args, T>) => Awaitable<void>
  extension: PluginExtension<T>
}): PluginWithExtension<T>

/**
 * Create a plugin without extension
 */
export function plugin(options: {
  name: string
  setup: (ctx: PluginContext<Args, Record<string, never>>) => Awaitable<void>
}): PluginWithoutExtension

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function plugin<T extends Record<string, any> = Record<string, never>>(
  options: PluginOptions<T>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  const { name, setup, extension } = options

  // create a wrapper function with properties
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pluginFn = async (ctx: PluginContext<Args, any>) => await setup(ctx)

  // define the properties
  return Object.defineProperties(pluginFn, {
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
}
