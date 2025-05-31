/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { COMMON_ARGS } from '../constants.ts'

import type { Plugin } from '../plugin.ts'

/**
 * Built-in options plugin for Gunshi.
 */
export default function builtinOptions(): Plugin {
  return ctx => {
    for (const [name, schema] of Object.entries(COMMON_ARGS)) {
      ctx.addGlobalOption(name, schema)
    }
  }
}
