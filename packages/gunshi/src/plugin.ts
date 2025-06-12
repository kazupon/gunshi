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
  CommandDecorator,
  RendererDecorator,
  ValidationErrorsDecorator
} from './types.ts'

/**
 * Gunshi plugin context.
 */
export class PluginContext<A extends Args = Args> {
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
  decorateHeaderRenderer(decorator: RendererDecorator<string, A>): void {
    this.#decorators.addHeaderDecorator(decorator)
  }

  /**
   * Decorate the usage renderer.
   * @param decorator - A decorator function that wraps the base usage renderer.
   */
  decorateUsageRenderer(decorator: RendererDecorator<string, A>): void {
    this.#decorators.addUsageDecorator(decorator)
  }

  /**
   * Decorate the validation errors renderer.
   * @param decorator - A decorator function that wraps the base validation errors renderer.
   */
  decorateValidationErrorsRenderer(decorator: ValidationErrorsDecorator<A>): void {
    this.#decorators.addValidationErrorsDecorator(decorator)
  }

  /**
   * Decorate the command execution.
   * Decorators are applied in reverse order (last registered is executed first).
   * @param decorator - A decorator function that wraps the command runner
   */
  decorateCommand(decorator: CommandDecorator<A>): void {
    this.#decorators.addCommandDecorator(decorator)
  }
}

/**
 * Plugin definition options
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface PluginOptions<T = any> {
  name: string
  setup: (ctx: PluginContext) => Awaitable<void>
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
 */
export function plugin<T>(options: {
  name: string
  setup: (ctx: PluginContext) => Awaitable<void>
  extension: (core: CommandContextCore) => T
}): PluginWithExtension<T>

/**
 * Create a plugin without extension
 */
export function plugin(options: {
  name: string
  setup: (ctx: PluginContext) => Awaitable<void>
}): PluginWithoutExtension

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function plugin<T = any>(options: PluginOptions<T>) {
  const { name, setup, extension } = options

  // create a wrapper function with properties
  const pluginFn = async (ctx: PluginContext) => await setup(ctx)

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
