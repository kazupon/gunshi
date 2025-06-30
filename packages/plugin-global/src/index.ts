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

import type { PluginWithExtension } from '@gunshi/plugin'
import type { GlobalsCommandContext } from './extension.ts'

export type { GlobalsCommandContext } from './extension.ts'

/**
 * global options plugin
 */
export default function globals(): PluginWithExtension<GlobalsCommandContext> {
  return plugin({
    name: 'g:globals',

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
