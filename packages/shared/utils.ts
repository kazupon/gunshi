/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { ARG_PREFIX, BUILT_IN_KEY_SEPARATOR, BUILT_IN_PREFIX } from './constants.ts'

import type {
  Args,
  CommandContext,
  CommandExamplesFetcher,
  DefaultGunshiParams,
  GunshiParams
} from 'gunshi'
import type {
  CommandBuiltinArgsKeys,
  CommandBuiltinResourceKeys,
  GenerateNamespacedKey,
  KeyOfArgs,
  RemovedIndex
} from './types.ts'

export function resolveBuiltInKey<
  K extends string = CommandBuiltinArgsKeys | CommandBuiltinResourceKeys
>(key: K): GenerateNamespacedKey<K> {
  return `${BUILT_IN_PREFIX}${BUILT_IN_KEY_SEPARATOR}${key}`
}

export function resolveArgKey<
  A extends Args = DefaultGunshiParams['args'],
  K extends string = KeyOfArgs<RemovedIndex<A>>
>(key: K): GenerateNamespacedKey<K, typeof ARG_PREFIX> {
  return `${ARG_PREFIX}${BUILT_IN_KEY_SEPARATOR}${key}`
}

export async function resolveExamples<G extends GunshiParams = DefaultGunshiParams>(
  ctx: Readonly<CommandContext<G>>,
  examples?: string | CommandExamplesFetcher<G>
): Promise<string> {
  return typeof examples === 'string'
    ? examples
    : typeof examples === 'function'
      ? await examples(ctx)
      : ''
}
