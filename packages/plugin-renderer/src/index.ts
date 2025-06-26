/**
 * The entry point of renderer plugin
 *
 * @example
 * ```js
 * import i18n from '@gunshi/plugin-renderer'
 * ```
 *
 * @module
 */

/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { plugin } from 'gunshi/plugin'

/**
 * usage renderer plugin
 */
export default function renderer(): ReturnType<typeof plugin> {
  return plugin({
    name: 'renderer'
  })
}
