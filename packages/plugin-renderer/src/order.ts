/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

/**
 * NOTE(kazupon): the commands are listed by name in the order of the collation of English, which is the
 * same on every machine. `String#localeCompare` without a locale follows the default locale of the
 * process, which comes from `LANG`, so the order differed by machine (in Czech, `ch` comes after `h`),
 * and its first call starts ICU, which takes milliseconds on Node.js. Most command names are lowercase
 * ASCII letters, digits and `-`, which the collation orders as their code units, so two such names are
 * compared without a collator.
 */
let collator: Intl.Collator | undefined

const PLAIN_NAME = /^[a-z0-9-]*$/

/**
 * Compare two command names for the list of commands.
 *
 * @param a - A command name
 * @param b - Another command name
 * @returns A negative number when `a` comes first, a positive number when `b` comes first, and `0` when they are the same
 */
export function compareNames(a: string, b: string): number {
  if (PLAIN_NAME.test(a) && PLAIN_NAME.test(b)) {
    return a < b ? -1 : a > b ? 1 : 0
  }
  collator ??= new Intl.Collator('en')
  return collator.compare(a, b)
}
