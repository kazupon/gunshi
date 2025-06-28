/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { COMMON_ARGS } from '../constants.ts'
import { plugin } from '../plugin/core.ts'
import decorator from './globals/decorator.ts'
import extension from './globals/extension.ts'

/**
 * Built-in global options plugin
 */
export default function globals() {
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
