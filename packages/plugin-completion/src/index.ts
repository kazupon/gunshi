/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { plugin } from '@gunshi/plugin'

import type { PluginWithoutExtension } from '@gunshi/plugin'

export interface CompletionCommandContext {}

/**
 * completion plugin for gunshi
 */
export default function completion(): PluginWithoutExtension<CompletionCommandContext> {
  return plugin({
    name: 'completion',

    setup(_ctx) {
      // TODO(kazupon): implement completion plugin logic
    }
  })
}
