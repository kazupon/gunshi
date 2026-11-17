/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import resource from '@gunshi/resources/en-US' with { type: 'json' }

import type { BuiltinResourceKeys } from './types.ts'

/**
 * Built-in resource keys for `en-US` locale.
 */
// NOTE(kazupon): the declaration file of TypeScript 7 cannot refer to a JSON module, so the type is written here.
// It is the same type as the JSON: the keys of the JSON are `BuiltinResourceKeys`.
const DefaultResource: Record<BuiltinResourceKeys, string> = resource

export default DefaultResource
