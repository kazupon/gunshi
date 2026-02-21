/**
 * Parser combinator entry point.
 *
 * This entry point exports composable combinator factory functions for building
 * type-safe argument schemas. These combinators produce {@link ArgSchema} objects
 * that can be used anywhere regular argument schemas are accepted.
 *
 * @example
 * ```ts
 * import { string, integer, boolean, required, withDefault, short } from 'gunshi/combinators'
 * import { define, cli } from 'gunshi'
 *
 * const command = define({
 *   name: 'serve',
 *   args: {
 *     host: withDefault(string(), 'localhost'),
 *     port: withDefault(integer({ min: 1, max: 65535 }), 8080),
 *     verbose: short(boolean(), 'v')
 *   },
 *   run: ctx => {
 *     console.log(`Listening on ${ctx.values.host}:${ctx.values.port}`)
 *   }
 * })
 * ```
 *
 * @experimental This module is experimental and may change in future versions.
 *
 * @module combinators
 */

/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

export {
  args,
  boolean,
  choice,
  combinator,
  describe,
  extend,
  float,
  integer,
  map,
  merge,
  multiple,
  number,
  positional,
  required,
  short,
  string,
  unrequired,
  withDefault
} from 'args-tokens/combinators'

export type {
  BaseOptions,
  BooleanOptions,
  Combinator,
  CombinatorOptions,
  CombinatorSchema,
  FloatOptions,
  IntegerOptions,
  NumberOptions,
  StringOptions
} from 'args-tokens/combinators'
