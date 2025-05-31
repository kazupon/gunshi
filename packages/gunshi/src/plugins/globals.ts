/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { COMMON_ARGS } from '../constants.ts'

import type { PluginContext } from '../plugin.ts'

/**
 * Built-in global options plugin for Gunshi.
 */
export default function globals(ctx: PluginContext) {
  for (const [name, schema] of Object.entries(COMMON_ARGS)) {
    ctx.addGlobalOption(name, schema)
  }
}
