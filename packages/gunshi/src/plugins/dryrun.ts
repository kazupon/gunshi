/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { plugin } from '../plugin.ts'

/**
 * dry-run plugin
 */
export default function dryRun(_options = {}) {
  return plugin({
    name: 'dry-run'
    // TODO(kazupon): Implement dry-run plugin logic
  })
}
