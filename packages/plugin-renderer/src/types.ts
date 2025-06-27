/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type { I18nCommandContext } from '@gunshi/plugin-i18n'
import type { Command, DefaultGunshiParams, GunshiParams } from 'gunshi'

/**
 * Extended command context which provides utilities via usage renderer plugin.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface UsageRendererCommandContext<G extends GunshiParams<any> = DefaultGunshiParams> {
  /**
   * Render the text message
   */
  text: I18nCommandContext<G>['translate']
  /**
   * Load commands
   * @returns A list of commands loaded from the command loader plugin.
   */
  loadCommands: <G extends GunshiParams = DefaultGunshiParams>() => Promise<Command<G>[]>
}
