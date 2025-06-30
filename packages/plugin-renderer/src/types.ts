/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type { Command, DefaultGunshiParams, GunshiParams } from '@gunshi/plugin'
import type { CommandArgKeys, CommandBuiltinKeys } from '@gunshi/shared'

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
