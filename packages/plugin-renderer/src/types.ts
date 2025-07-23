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
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface UsageRendererCommandContext<G extends GunshiParams<any> = DefaultGunshiParams> {
  /**
   * Render the text message
   */
  text: <
    A extends Args = G['args'],
    C = {}, // for CommandContext
    E extends Record<string, string> = {}, // for extended resources
    K = ResolveTranslationKeys<A, C, E>
  >(
    key: K,
    values?: Record<string, unknown>
  ) => string
  /**
   * Load commands
   * @returns A list of commands loaded from the usage renderert plugin.
   */
  loadCommands: <G extends GunshiParams = DefaultGunshiParams>() => Promise<Command<G>[]>
}
