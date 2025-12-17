/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { namespacedId, PLUGIN_PREFIX } from '@gunshi/shared'

import type { Args, Command, DefaultGunshiParams, GunshiParams } from '@gunshi/plugin'
import type { GenerateNamespacedKey, ResolveTranslationKeys } from '@gunshi/shared'

/**
 * The unique identifier for usage renderer plugin.
 */
export const pluginId: GenerateNamespacedKey<'renderer', typeof PLUGIN_PREFIX> =
  namespacedId('renderer')

/**
 * Type representing the unique identifier for usage renderer plugin.
 */
export type PluginId = typeof pluginId

/**
 * Extended command context which provides utilities via usage renderer plugin.
 * These utilities are available via `CommandContext.extensions['g:renderer']`.
 *
 * @typeParam G - A type extending {@link GunshiParams} to specify the shape of command parameters.
 */
export interface UsageRendererExtension<G extends GunshiParams<any> = DefaultGunshiParams> {
  /**
   * Render the text message.
   *
   * @typeParam A - The type of {@linkcode Args | arguments} defined in the command parameters.
   * @typeParam C - The type representing the command context.
   * @typeParam E - The type representing extended resources for localization.
   *
   * @param key - The translation key to be resolved.
   * @param values - An optional record of values to interpolate into the translation string.
   * @returns The resolved translation string with interpolated values if provided.
   */
  text: <
    A extends Args = G['args'],
    C = {}, // for CommandContext
    E extends Record<string, string> = {}, // for extended resources
    K = ResolveTranslationKeys<A, C, E>
  >(
    key: K,
    values?: Record<string, unknown>
  ) => Promise<string>
  /**
   * Load commands
   *
   * @typeParam G - A type extending {@link GunshiParams} to specify the shape of command parameters.
   *
   * @returns A list of commands loaded from the usage renderer plugin.
   */
  loadCommands: <G extends GunshiParams = DefaultGunshiParams>() => Promise<Command<G>[]>
}
