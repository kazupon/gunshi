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
  GunshiParamsConstraint,
  LazyCommand,
  MergeGunshiExtensions,
  RendererDecorator,
  ValidationErrorsDecorator
} from '../types.ts'

/**
 * Gunshi plugin context interface.
 *
 * @typeParam G - A type extending {@linkcode GunshiParams} to specify the shape of command parameters.
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
   * @param schema - An {@linkcode ArgSchema} for the option
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
   * @typeParam L - An extensions type to specify the shape of {@linkcode CommandContext}'s extensions.
   *
   * @param decorator - A decorator function that wraps the base header renderer.
   */
  decorateHeaderRenderer<L extends Record<string, unknown> = DefaultGunshiParams['extensions']>(
    decorator: (
      baseRenderer: (ctx: Readonly<CommandContext<MergeGunshiExtensions<G, L>>>) => Promise<string>,
      ctx: Readonly<CommandContext<MergeGunshiExtensions<G, L>>>
    ) => Promise<string>
  ): void

  /**
   * Decorate the usage renderer.
   *
   * @typeParam L - An extensions type to specify the shape of {@linkcode CommandContext}'s extensions.
   *
   * @param decorator - A decorator function that wraps the base usage renderer.
   */
  decorateUsageRenderer<L extends Record<string, unknown> = DefaultGunshiParams['extensions']>(
    decorator: (
      baseRenderer: (ctx: Readonly<CommandContext<MergeGunshiExtensions<G, L>>>) => Promise<string>,
      ctx: Readonly<CommandContext<MergeGunshiExtensions<G, L>>>
    ) => Promise<string>
  ): void

  /**
   * Decorate the validation errors renderer.
   *
   * @typeParam L - An extensions type to specify the shape of {@linkcode CommandContext}'s extensions.
   *
   * @param decorator - A decorator function that wraps the base validation errors renderer.
   */
  decorateValidationErrorsRenderer<
    L extends Record<string, unknown> = DefaultGunshiParams['extensions']
  >(
    decorator: (
      baseRenderer: (
        ctx: Readonly<CommandContext<MergeGunshiExtensions<G, L>>>,
        error: AggregateError
      ) => Promise<string>,
      ctx: Readonly<CommandContext<MergeGunshiExtensions<G, L>>>,
      error: AggregateError
    ) => Promise<string>
  ): void

  /**
   * Decorate the command execution.
   *
   * Decorators are applied in reverse order (last registered is executed first).
   *
   * @typeParam L - An extensions type to specify the shape of {@linkcode CommandContext}'s extensions.
   *
   * @param decorator - A decorator function that wraps the command runner
   */
  decorateCommand<L extends Record<string, unknown> = DefaultGunshiParams['extensions']>(
    decorator: (
      baseRunner: (
        ctx: Readonly<CommandContext<MergeGunshiExtensions<G, L>>>
      ) => Awaitable<void | string>
    ) => (ctx: Readonly<CommandContext<MergeGunshiExtensions<G, L>>>) => Awaitable<void | string>
  ): void
}

/**
 * Factory function for creating a plugin context.
 *
 * @typeParam G - A type extending {@linkcode GunshiParams} to specify the shape of command parameters.
 *
 * @param decorators - A {@linkcode Decorators} instance.
 * @param initialSubCommands - Initial sub commands map.
 * @returns A new {@linkcode PluginContext} instance.
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
      /**
       * NOTE(kazupon): a short name belongs to one option. The global options of a CLI come from
       * plugins that know nothing of each other, so two of them may reach for the same letter, and
       * the parser would then match both and give neither the value that was typed. The one that
       * asked first keeps the letter, and the other keeps its long name — the same way a global
       * option gives its short name up to an argument of the command that claims it.
       */
      const taken = schema.short && findGlobalOptionByShort(globalOptions, schema.short)
      if (taken) {
        console.warn(
          `Short name '-${schema.short}' of the global option '${name}' is already used by '${taken}'. ` +
            `Global option '${name}' is registered without it.`
        )
        globalOptions.set(name, { ...schema, short: undefined })
        return
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
        baseRenderer: (
          ctx: Readonly<CommandContext<MergeGunshiExtensions<G, L>>>
        ) => Promise<string>,
        ctx: Readonly<CommandContext<MergeGunshiExtensions<G, L>>>
      ) => Promise<string>
    ): void {
      decorators.addHeaderDecorator(decorator as unknown as RendererDecorator<string, G>)
    },

    decorateUsageRenderer<L extends Record<string, unknown> = DefaultGunshiParams['extensions']>(
      decorator: (
        baseRenderer: (
          ctx: Readonly<CommandContext<MergeGunshiExtensions<G, L>>>
        ) => Promise<string>,
        ctx: Readonly<CommandContext<MergeGunshiExtensions<G, L>>>
      ) => Promise<string>
    ): void {
      decorators.addUsageDecorator(decorator as unknown as RendererDecorator<string, G>)
    },

    decorateValidationErrorsRenderer<
      L extends Record<string, unknown> = DefaultGunshiParams['extensions']
    >(
      decorator: (
        baseRenderer: (
          ctx: Readonly<CommandContext<MergeGunshiExtensions<G, L>>>,
          error: AggregateError
        ) => Promise<string>,
        ctx: Readonly<CommandContext<MergeGunshiExtensions<G, L>>>,
        error: AggregateError
      ) => Promise<string>
    ): void {
      decorators.addValidationErrorsDecorator(decorator as unknown as ValidationErrorsDecorator<G>)
    },

    decorateCommand<L extends Record<string, unknown> = DefaultGunshiParams['extensions']>(
      decorator: (
        baseRunner: (
          ctx: Readonly<CommandContext<MergeGunshiExtensions<G, L>>>
        ) => Awaitable<void | string>
      ) => (ctx: Readonly<CommandContext<MergeGunshiExtensions<G, L>>>) => Awaitable<void | string>
    ): void {
      decorators.addCommandDecorator(decorator as unknown as CommandDecorator<G>)
    }
  })
}

/**
 * Find the global option that already uses a short name.
 *
 * @param globalOptions - The global options registered so far
 * @param short - A short name, without the leading dash
 * @returns The name of the global option that uses it, or `undefined`
 */
function findGlobalOptionByShort(
  globalOptions: ReadonlyMap<string, ArgSchema>,
  short: string
): string | undefined {
  for (const [name, schema] of globalOptions) {
    if (schema.short === short) {
      return name
    }
  }
  return undefined
}
