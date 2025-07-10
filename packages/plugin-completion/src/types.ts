/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { namespacedId, PLUGIN_PREFIX } from '@gunshi/shared'

import type { Handler } from '@bombsh/tab'
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
 * Extended command context which provides utilities via completion plugin.
 * These utilities are available via `CommandContext.extensions['g:completion']`.
 */
export interface CompletionCommandContext {}

/**
 * Parameters for {@link CompletionHandler | the completion handler}.
 */
export interface CompletionParams {
  previousArgs: Parameters<Handler>[0]
  toComplete: Parameters<Handler>[1]
  endWithSpace: Parameters<Handler>[2]
  locale?: Intl.Locale
}

/**
 * The handler for completion.
 */
export type CompletionHandler = (params: CompletionParams) => ReturnType<Handler>

/**
 * Completion configuration, which structure is similar `bombsh/tab`'s `CompletionConfig`.
 */
export interface CompletionConfig {
  handler?: CompletionHandler
  args?: Record<string, { handler: CompletionHandler }>
}

/**
 * Completion plugin options.
 */
export interface CompletionOptions {
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
