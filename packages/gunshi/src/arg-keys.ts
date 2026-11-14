/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type { ArgSchema } from './types.ts'

/**
 * The keys that people write in an argument, from another library or by a typo, with the key of Gunshi to use
 * instead
 *
 * NOTE(kazupon): keep it short. A key is here when people write it, as the apps that use Gunshi did with `alias`
 * and `array` (#930). The i18n plugin keeps a copy of it (`packages/plugin-i18n/src/helpers.ts`): change both.
 *
 * @internal
 */
type ArgKeyHints = {
  alias: 'short'
  array: 'multiple'
  desc: 'description'
  require: 'required'
}

/**
 * The message for a key that an argument does not have, with the key to use instead when {@link ArgKeyHints} has
 * one
 *
 * @internal
 */
type UnknownArgKeyMessage<P> =
  `'${P & string}' is not a key of an argument${P extends keyof ArgKeyHints ? `: use '${ArgKeyHints[P]}'` : ''}`

/**
 * The keys of each argument that {@link ArgSchema} does not have, mapped to a type that names the key
 *
 * NOTE(kazupon): the definition helpers infer the arguments, so a key that an argument does not have, such as
 * `positional: true` or a misspelled `require`, would type-check and be ignored at run time (#930). A value does not
 * fit the type, so the error is reported at the key, and says which key an argument does not have, and the key to
 * use instead for the keys of {@link ArgKeyHints}:
 * `Type 'true' is not assignable to type 'boolean & { "'require' is not a key of an argument: use 'required'": never; }'`.
 * The marks of Gunshi, such as the one of `jsonArgs`, are keys that start with `~gunshi.`.
 *
 * @internal
 */
export type UnknownArgKeys<A> = {
  [K in keyof A]: {
    [P in Exclude<keyof A[K], keyof ArgSchema | `~gunshi.${string}`>]: {
      [M in UnknownArgKeyMessage<P>]: never
    }
  }
}
