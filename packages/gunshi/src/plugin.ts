/**
 * The gunshi plugin entry point
 *
 * @example
 * ```js
 * ```
 *
 * @module default
 */

/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type { ArgSchema } from 'args-tokens'
import type { Awaitable } from './types.ts'

/**
 * Gunshi plugin, which is a function that receives a PluginContext.
 * @param ctx - A {@link PluginContext}.
 * @returns An {@link Awaitable} that resolves when the plugin is loaded.
 */
export type Plugin = (ctx: PluginContext) => Awaitable<void>

/**
 * Gunshi plugin context.
 */
export class PluginContext {
  #globalOptions: Map<string, ArgSchema> = new Map()

  constructor() {
    // TODO:
  }

  /**
   * Get the global options.
   * @returns A map of global options.
   */
  get globalOptions(): Map<string, ArgSchema> {
    return new Map(this.#globalOptions)
  }

  addGlobalOption(name: string, schema: ArgSchema): void {
    this.#globalOptions.set(name, schema)
  }

  // TODO: Implement more hooks for plugin context
}
