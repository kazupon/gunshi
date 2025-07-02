/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { namespacedId, PLUGIN_PREFIX } from '@gunshi/shared'

import type { GenerateNamespacedKey } from '@gunshi/shared'

/**
 * The unique identifier for the global options plugin.
 */
export const pluginId: GenerateNamespacedKey<'global', typeof PLUGIN_PREFIX> =
  namespacedId('global')

/**
 * Type representing the unique identifier for the global options plugin.
 */
export type PluginId = typeof pluginId
