/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { plugin } from '@gunshi/plugin'

import type { PluginWithoutExtension } from '@gunshi/plugin'

export interface DryRunCommandContext {}

/**
 * dryrun option plugin for gunshi
 */
export default function dryrun(): PluginWithoutExtension<DryRunCommandContext> {
  return plugin({
    id: 'g:dryrun',
    name: 'dryrun',

    setup(_ctx) {
      // TODO(kazupon): implement dryrun option plugin logic
    }
  })
}
