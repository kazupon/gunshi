/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { ARG_PREFIX, BUILT_IN_KEY_SEPARATOR, BUILT_IN_PREFIX } from './constants.ts'

import type { Args } from 'gunshi'

type RemoveIndexSignature<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K]
}

/**
 * Remove index signature from object or record type.
 */
export type RemovedIndex<T> = RemoveIndexSignature<{
  [K in keyof T]: T[K]
}>

export type KeyOfArgs<A extends Args> =
  | keyof A
  | {
      [K in keyof A]: A[K]['type'] extends 'boolean'
        ? A[K]['negatable'] extends true
          ? `no-${Extract<K, string>}`
          : never
        : never
    }[keyof A]

/**
 * Generate a namespaced key.
 */
export type GenerateNamespacedKey<
  Key extends string,
  Prefixed extends string = typeof BUILT_IN_PREFIX
> = `${Prefixed}${typeof BUILT_IN_KEY_SEPARATOR}${Key}`

/**
 * Command i18n built-in arguments keys.
 */
export type CommandBuiltinArgsKeys = keyof (typeof import('./constants.ts'))['COMMON_ARGS']

/**
 * Command i18n built-in resource keys.
 */
export type CommandBuiltinResourceKeys =
  (typeof import('./constants.ts'))['COMMAND_BUILTIN_RESOURCE_KEYS'][number]

/**
 * i18n built-in resource keys.
 */
export type BuiltinResourceKeys = CommandBuiltinArgsKeys | CommandBuiltinResourceKeys

/**
 * Command i18n built-in keys.
 * The command i18n built-in keys are used by the i18n plugin for translation.
 */
export type CommandBuiltinKeys =
  | GenerateNamespacedKey<BuiltinResourceKeys>
  | 'description'
  | 'examples'

/**
 * Command i18n option keys.
 * The command i18n option keys are used by the i18n plugin for translation.
 */
export type CommandArgKeys<A extends Args> = GenerateNamespacedKey<
  KeyOfArgs<RemovedIndex<A>>,
  typeof ARG_PREFIX
>
