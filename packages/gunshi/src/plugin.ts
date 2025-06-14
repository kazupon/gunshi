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
  CommandContext,
  CommandContextCore,
  CommandContextExtension,
  CommandDecorator,
  ExtendContext,
  RendererDecorator,
  ValidationErrorsDecorator
} from './types.ts'

export type { GlobalsCommandContext } from './plugins/globals.ts'

/**
 * Gunshi plugin context.
 * @internal
 */
export class PluginContext<A extends Args = Args, E extends ExtendContext = {}> {
  #globalOptions: Map<string, ArgSchema> = new Map()
  #decorators: Decorators<A, E>

  constructor(decorators: Decorators<A, E>) {
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
  decorateHeaderRenderer<
    L extends Record<string, unknown> = {},
    C extends Record<string, unknown> = keyof E extends never ? L : E & L
  >(
    decorator: (
      baseRenderer: (ctx: Readonly<CommandContext<A, C>>) => Promise<string>,
      ctx: Readonly<CommandContext<A, C>>
    ) => Promise<string>
  ): void {
    this.#decorators.addHeaderDecorator(decorator as unknown as RendererDecorator<string, A, E>)
  }

  /**
   * Decorate the usage renderer.
   * @param decorator - A decorator function that wraps the base usage renderer.
   */
  decorateUsageRenderer<
    L extends Record<string, unknown> = {},
    C extends Record<string, unknown> = keyof E extends never ? L : E & L
  >(
    decorator: (
      baseRenderer: (ctx: Readonly<CommandContext<A, C>>) => Promise<string>,
      ctx: Readonly<CommandContext<A, C>>
    ) => Promise<string>
  ): void {
    this.#decorators.addUsageDecorator(decorator as unknown as RendererDecorator<string, A, E>)
  }

  /**
   * Decorate the validation errors renderer.
   * @param decorator - A decorator function that wraps the base validation errors renderer.
   */
  decorateValidationErrorsRenderer<
    L extends Record<string, unknown> = {},
    C extends Record<string, unknown> = keyof E extends never ? L : E & L
  >(
    decorator: (
      baseRenderer: (ctx: Readonly<CommandContext<A, C>>, error: AggregateError) => Promise<string>,
      ctx: Readonly<CommandContext<A, C>>,
      error: AggregateError
    ) => Promise<string>
  ): void {
    this.#decorators.addValidationErrorsDecorator(
      decorator as unknown as ValidationErrorsDecorator<A, E>
    )
  }

  /**
   * Decorate the command execution.
   * Decorators are applied in reverse order (last registered is executed first).
   * @param decorator - A decorator function that wraps the command runner
   */
  decorateCommand<
    L extends Record<string, unknown> = {},
    C extends Record<string, unknown> = keyof E extends never ? L : E & L
  >(
    decorator: (
      baseRunner: (ctx: Readonly<CommandContext<A, C>>) => Awaitable<void | string>
    ) => (ctx: Readonly<CommandContext<A, C>>) => Awaitable<void | string>
  ): void {
    this.#decorators.addCommandDecorator(decorator as unknown as CommandDecorator<A, E>)
  }
}

/**
 *  Plugin function type
 */
export type PluginFunction<E extends ExtendContext = {}> = (
  ctx: PluginContext<Args, E>
) => Awaitable<void>

/**
 * Plugin extension for CommandContext
 */
export type PluginExtension<T = Record<string, unknown>, A extends Args = Args> = (
  core: CommandContextCore<A>
) => T

/**
 * Plugin definition options
 */
export interface PluginOptions<T extends Record<string, unknown> = {}> {
  name: string

  setup: PluginFunction<T>
  extension?: PluginExtension<T, Args>
}

/**
 * Gunshi plugin, which is a function that receives a PluginContext.
 * @param ctx - A {@link PluginContext}.
 * @returns An {@link Awaitable} that resolves when the plugin is loaded.
 */
export type Plugin<E extends ExtendContext = {}> = PluginFunction<E> & {
  name?: string
  extension?: CommandContextExtension<E>
}

/**
 * Plugin return type with extension
 * @internal
 */
export interface PluginWithExtension<E extends ExtendContext = {}> extends Plugin<E> {
  name: string
  extension: CommandContextExtension<E>
}

/**
 * Plugin return type without extension
 * @internal
 */
export interface PluginWithoutExtension<E extends ExtendContext = {}> extends Plugin<E> {
  name: string
}

/**
 * Create a plugin with extension capabilities
 * @param options - {@link PluginOptions | plugin options}
 */
export function plugin<E extends ExtendContext = {}>(options: {
  name: string
  setup: (ctx: PluginContext<Args, E>) => Awaitable<void>
  extension: PluginExtension<E, Args>
}): PluginWithExtension<E>

export function plugin(options: {
  name: string
  setup: (ctx: PluginContext<Args>) => Awaitable<void>
}): PluginWithoutExtension

export function plugin(
  options: PluginOptions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  const { name, setup, extension } = options

  // create a wrapper function with properties
  const pluginFn = async (ctx: PluginContext) => await setup(ctx)

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
