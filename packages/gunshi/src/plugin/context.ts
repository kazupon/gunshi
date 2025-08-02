/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type { ArgSchema } from 'args-tokens'
import type { Decorators } from '../decorators.ts'
import type {
  Awaitable,
  Command,
  CommandContext,
  CommandDecorator,
  DefaultGunshiParams,
  ExtractArgs,
  ExtractExtensions,
  GunshiParamsConstraint,
  LazyCommand,
  RendererDecorator,
  ValidationErrorsDecorator
} from '../types.ts'

/**
 * Type helper to create GunshiParams from extracted args and extensions
 *
 * @internal
 */
type ExtractedParams<G extends GunshiParamsConstraint, L extends Record<string, unknown> = {}> = {
  args: ExtractArgs<G>
  extensions: ExtractExtensions<G> & L
}

/**
 * Gunshi plugin context interface.
 *
 * @since v0.27.0
 */
export interface PluginContext<G extends GunshiParamsConstraint = DefaultGunshiParams> {
  /**
   * Get the global options
   *
   * @returns A map of global options.
   */
  readonly globalOptions: Map<string, ArgSchema>

  /**
   * Get the registered sub commands
   *
   * @returns A map of sub commands.
   */
  readonly subCommands: ReadonlyMap<string, Command<G> | LazyCommand<G>>

  /**
   * Add a global option.
   *
   * @param name - An option name
   * @param schema - An {@link ArgSchema} for the option
   */
  addGlobalOption(name: string, schema: ArgSchema): void

  /**
   * Add a sub command.
   *
   * @param name - Command name
   * @param command - Command definition
   */
  addCommand(name: string, command: Command<G> | LazyCommand<G>): void

  /**
   * Check if a command exists.
   *
   * @param name - Command name
   * @returns True if the command exists, false otherwise
   */
  hasCommand(name: string): boolean

  /**
   * Decorate the header renderer.
   *
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
   *
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
   *
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
   *
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
 *
 * @param decorators - A {@link Decorators} instance.
 * @param initialSubCommands - Initial sub commands map.
 * @returns A new {@link PluginContext} instance.
 */
export function createPluginContext<G extends GunshiParamsConstraint = DefaultGunshiParams>(
  decorators: Decorators<G>,
  initialSubCommands?: Map<string, Command<G> | LazyCommand<G>>
): PluginContext<G> {
  /**
   * private states
   */

  const globalOptions = new Map<string, ArgSchema>()

  const subCommands = new Map<string, Command<G> | LazyCommand<G>>(initialSubCommands || [])

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

    get subCommands(): ReadonlyMap<string, Command<G> | LazyCommand<G>> {
      return new Map(subCommands)
    },

    addCommand(name: string, command: Command<G> | LazyCommand<G>): void {
      if (!name) {
        throw new Error('Command name must be a non-empty string')
      }
      if (subCommands.has(name)) {
        throw new Error(`Command '${name}' is already registered`)
      }
      subCommands.set(name, command)
    },

    hasCommand(name: string): boolean {
      return subCommands.has(name)
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
