/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { plugin } from '@gunshi/plugin'

import type { PluginWithoutExtension } from '@gunshi/plugin'

/**
 * Dry run command context.
 */
export interface DryRunCommandContext {}

/**
 * dryrun plugin
 *
 * @returns A defined plugin as dryrun
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
