/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { namespacedId, PLUGIN_PREFIX } from '@gunshi/shared'

import type { Completion } from '@bomb.sh/tab'
import type { GenerateNamespacedKey } from '@gunshi/shared'

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
 * Parameters for {@linkcode CompletionHandler | the completion handler}.
 */
export interface CompletionParams {
  /**
   * The locale to use for i18n.
   */
  locale?: Intl.Locale
}

/**
 * The handler for completion.
 *
 * @param params - The {@linkcode CompletionParams | parameters} for the completion handler.
 * @returns An array of {@linkcode Completion | completions}.
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
   * The {@linkcode CompletionHandler | handler} for the completion.
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
     * The entry point {@linkcode CompletionConfig | completion configuration}.
     */
    entry?: CompletionConfig
    /**
     * The handlers for sub-commands.
     */
    subCommands?: Record<string, CompletionConfig>
  }
}
