/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { namespacedId } from '@gunshi/shared'

import type { Command, DefaultGunshiParams, GunshiParams } from '@gunshi/plugin'
import type { CommandArgKeys, CommandBuiltinKeys } from '@gunshi/shared'

/**
 * The unique identifier for usage renderer plugin.
 */
export const pluginId = namespacedId('renderer')

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
    T extends string = CommandBuiltinKeys,
    O = CommandArgKeys<G['args']>,
    K = CommandBuiltinKeys | O | T
  >(
    key: K,
    values?: Record<string, unknown>
  ) => Promise<string>
  /**
   * Load commands
   * @returns A list of commands loaded from the command loader plugin.
   */
  loadCommands: <G extends GunshiParams = DefaultGunshiParams>() => Promise<Command<G>[]>
}
