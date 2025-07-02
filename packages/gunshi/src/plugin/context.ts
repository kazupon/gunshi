/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type { ArgSchema } from 'args-tokens'
import type { Decorators } from '../decorators.ts'
import type {
  Awaitable,
  CommandContext,
  CommandDecorator,
  DefaultGunshiParams,
  ExtractArgs,
  ExtractExtensions,
  GunshiParamsConstraint,
  RendererDecorator,
  ValidationErrorsDecorator
} from '../types.ts'

/**
 * Type helper to create GunshiParams from extracted args and extensions
 * @internal
 */
type ExtractedParams<G extends GunshiParamsConstraint, L extends Record<string, unknown> = {}> = {
  args: ExtractArgs<G>
  extensions: ExtractExtensions<G> & L
}

/**
 * Gunshi plugin context interface.
 */
export interface PluginContext<G extends GunshiParamsConstraint = DefaultGunshiParams> {
  /**
   * Get the global options
   * @returns A map of global options.
   */
  readonly globalOptions: Map<string, ArgSchema>

  /**
   * Add a global option.
   * @param name An option name
   * @param schema An {@link ArgSchema} for the option
   */
  addGlobalOption(name: string, schema: ArgSchema): void

  /**
   * Decorate the header renderer.
   * @param decorator - A decorator function that wraps the base header renderer.
   */
  decorateHeaderRenderer<L extends Record<string, unknown> = DefaultGunshiParams['extensions']>(
    decorator: (
      baseRenderer: (ctx: Readonly<CommandContext<ExtractedParams<G, L>>>) => Promise<string>,
      ctx: Readonly<CommandContext<ExtractedParams<G, L>>>
    ) => Promise<string>
  ): void

  /**
   * Decorate the usage renderer.
   * @param decorator - A decorator function that wraps the base usage renderer.
   */
  decorateUsageRenderer<L extends Record<string, unknown> = DefaultGunshiParams['extensions']>(
    decorator: (
      baseRenderer: (ctx: Readonly<CommandContext<ExtractedParams<G, L>>>) => Promise<string>,
      ctx: Readonly<CommandContext<ExtractedParams<G, L>>>
    ) => Promise<string>
  ): void

  /**
   * Decorate the validation errors renderer.
   * @param decorator - A decorator function that wraps the base validation errors renderer.
   */
  decorateValidationErrorsRenderer<
    L extends Record<string, unknown> = DefaultGunshiParams['extensions']
  >(
    decorator: (
      baseRenderer: (
        ctx: Readonly<CommandContext<ExtractedParams<G, L>>>,
        error: AggregateError
      ) => Promise<string>,
      ctx: Readonly<CommandContext<ExtractedParams<G, L>>>,
      error: AggregateError
    ) => Promise<string>
  ): void

  /**
   * Decorate the command execution.
   * Decorators are applied in reverse order (last registered is executed first).
   * @param decorator - A decorator function that wraps the command runner
   */
  decorateCommand<L extends Record<string, unknown> = DefaultGunshiParams['extensions']>(
    decorator: (
      baseRunner: (ctx: Readonly<CommandContext<ExtractedParams<G, L>>>) => Awaitable<void | string>
    ) => (ctx: Readonly<CommandContext<ExtractedParams<G, L>>>) => Awaitable<void | string>
  ): void
}

/**
 * Factory function for creating a plugin context.
 * @param decorators - A {@link Decorators} instance.
 * @returns A new {@link PluginContext} instance.
 */
export function createPluginContext<G extends GunshiParamsConstraint = DefaultGunshiParams>(
  decorators: Decorators<G>
): PluginContext<G> {
  /**
   * private states
   */

  const globalOptions = new Map<string, ArgSchema>()

  /**
   * public interfaces
   */

  return Object.freeze({
    get globalOptions(): Map<string, ArgSchema> {
      return new Map(globalOptions)
    },

    addGlobalOption(name: string, schema: ArgSchema): void {
      if (!name) {
        throw new Error('Option name must be a non-empty string')
      }
      if (globalOptions.has(name)) {
        throw new Error(`Global option '${name}' is already registered`)
      }
      globalOptions.set(name, schema)
    },

    decorateHeaderRenderer<L extends Record<string, unknown> = DefaultGunshiParams['extensions']>(
      decorator: (
        baseRenderer: (ctx: Readonly<CommandContext<ExtractedParams<G, L>>>) => Promise<string>,
        ctx: Readonly<CommandContext<ExtractedParams<G, L>>>
      ) => Promise<string>
    ): void {
      decorators.addHeaderDecorator(decorator as unknown as RendererDecorator<string, G>)
    },

    decorateUsageRenderer<L extends Record<string, unknown> = DefaultGunshiParams['extensions']>(
      decorator: (
        baseRenderer: (ctx: Readonly<CommandContext<ExtractedParams<G, L>>>) => Promise<string>,
        ctx: Readonly<CommandContext<ExtractedParams<G, L>>>
      ) => Promise<string>
    ): void {
      decorators.addUsageDecorator(decorator as unknown as RendererDecorator<string, G>)
    },

    decorateValidationErrorsRenderer<
      L extends Record<string, unknown> = DefaultGunshiParams['extensions']
    >(
      decorator: (
        baseRenderer: (
          ctx: Readonly<CommandContext<ExtractedParams<G, L>>>,
          error: AggregateError
        ) => Promise<string>,
        ctx: Readonly<CommandContext<ExtractedParams<G, L>>>,
        error: AggregateError
      ) => Promise<string>
    ): void {
      decorators.addValidationErrorsDecorator(decorator as unknown as ValidationErrorsDecorator<G>)
    },

    decorateCommand<L extends Record<string, unknown> = DefaultGunshiParams['extensions']>(
      decorator: (
        baseRunner: (
          ctx: Readonly<CommandContext<ExtractedParams<G, L>>>
        ) => Awaitable<void | string>
      ) => (ctx: Readonly<CommandContext<ExtractedParams<G, L>>>) => Awaitable<void | string>
    ): void {
      decorators.addCommandDecorator(decorator as unknown as CommandDecorator<G>)
    }
  })
}
