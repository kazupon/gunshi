/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { namespacedId, PLUGIN_PREFIX } from '@gunshi/shared'

import type { Completion } from '@bomb.sh/tab'
import type { GenerateNamespacedKey } from '@gunshi/shared'
import type { Handler } from './bombshell/index.ts'

/**
 * The unique identifier for the completion plugin.
 */
export const pluginId: GenerateNamespacedKey<'completion', typeof PLUGIN_PREFIX> =
  namespacedId('completion')

/**
 * Type representing the unique identifier for the completion plugin.
 */
export type PluginId = typeof pluginId

/**
 * Parameters for {@link CompletionHandler | the completion handler}.
 */
export interface CompletionParams {
  /**
   * The previous arguments
   */
  previousArgs?: Parameters<Handler>[0]
  /**
   * A value to complete.
   */
  toComplete?: Parameters<Handler>[1]
  /**
   * Whether to end the completion with a space.
   */
  endWithSpace?: Parameters<Handler>[2]
  /**
   * The locale to use for i18n.
   */
  locale?: Intl.Locale
}

/**
 * The handler for completion.
 */
export type CompletionHandler = (params: CompletionParams) => Completion[]

/**
 * Extended command context which provides utilities via completion plugin.
 * These utilities are available via `CommandContext.extensions['g:completion']`.
 */
export interface CompletionExtension {}

/**
 * Completion configuration, which structure is similar `bombsh/tab`'s `CompletionConfig`.
 */
export interface CompletionConfig {
  /**
   * The handler for the completion.
   */
  handler?: CompletionHandler
  /**
   * The command arguments for the completion.
   */
  args?: Record<string, { handler: CompletionHandler }>
}

/**
 * Completion plugin options.
 */
export interface CompletionOptions {
  /**
   * The completion configuration
   */
  config?: {
    /**
     * The entry point completion configuration.
     */
    entry?: CompletionConfig
    /**
     * The handlers for subcommands.
     */
    subCommands?: Record<string, CompletionConfig>
  }
}
