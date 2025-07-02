/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { namespacedId } from '@gunshi/shared'

/**
 * The unique identifier for the global options plugin.
 */
export const pluginId = namespacedId('global')

/**
 * Type representing the unique identifier for the global options plugin.
 */
export type PluginId = typeof pluginId
