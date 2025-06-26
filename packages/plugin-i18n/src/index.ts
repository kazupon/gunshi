/**
 * The entry point of i18n plugin
 *
 * @example
 * ```js
 * import i18n from '@gunshi/plugin-i18n'
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
 * i18n plugin
 */
export default function i18n(): ReturnType<typeof plugin> {
  return plugin({
    name: 'i18n'
  })
}
