/**
 * The entry point of global options plugin
 *
 * @example
 * ```js
 * import global from '@gunshi/plugin-global'
 * import { cli } from 'gunshi'
 *
 * const entry = (ctx) => {
 *   // ...
 * }
 *
 * await cli(process.argv.slice(2), entry, {
 *   // ...
 *
 *   plugins: [
 *     global()
 *   ],
 *
 *   // ...
 * })
 * ```
 *
 * @module
 */

/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { plugin } from '@gunshi/plugin'
import { COMMON_ARGS } from '@gunshi/shared'
import decorator from './decorator.ts'
import extension from './extension.ts'
import { pluginId as id } from './types.ts'

import type { PluginWithExtension } from '@gunshi/plugin'
import type { GlobalCommandContext } from './extension.ts'

export type { GlobalCommandContext } from './extension.ts'
export * from './types.ts'

/**
 * global options plugin
 */
export default function global(): PluginWithExtension<GlobalCommandContext> {
  return plugin({
    id,
    name: 'global options',

    // install global options plugin extension
    extension,

    setup(ctx) {
      // install global options
      for (const [name, schema] of Object.entries(COMMON_ARGS)) {
        ctx.addGlobalOption(name, schema)
      }

      // apply command decorators for global options
      ctx.decorateCommand(decorator)
    }
  })
}
