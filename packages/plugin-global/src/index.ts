/**
 * The entry point of global options plugin
 *
 * @example
 * ```js
 * import global from '@gunshi/plugin-global'
 * ```
 *
 * @module
 */

/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { plugin } from 'gunshi/plugin'
import { COMMON_ARGS } from '../../shared/constants.ts'
import decorator from './decorator.ts'
import extension from './extension.ts'

export type { GlobalsCommandContext } from './extension.ts'

/**
 * Built-in global options plugin
 */
export default function globals(): ReturnType<typeof plugin> {
  return plugin({
    name: 'globals',

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
