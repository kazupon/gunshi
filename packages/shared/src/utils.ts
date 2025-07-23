/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { kebabnize } from 'gunshi/utils'
import { ARG_PREFIX, BUILT_IN_KEY_SEPARATOR, BUILT_IN_PREFIX, PLUGIN_PREFIX } from './constants.ts'

import type {
  Args,
  ArgSchema,
  CommandContext,
  CommandExamplesFetcher,
  DefaultGunshiParams,
  GunshiParamsConstraint
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
>(key: K, ctx?: Readonly<CommandContext>): string {
  return `${ctx?.name ? `${ctx.name}${BUILT_IN_KEY_SEPARATOR}` : ''}${ARG_PREFIX}${BUILT_IN_KEY_SEPARATOR}${key}`
}

export function resolveKey<
  T extends Record<string, string> = {},
  K = keyof T extends string ? keyof T : string
>(key: K, ctx?: Readonly<CommandContext>): string {
  return `${ctx?.name ? `${ctx.name}${BUILT_IN_KEY_SEPARATOR}` : ''}${key}`
}

export async function resolveExamples<G extends GunshiParamsConstraint = DefaultGunshiParams>(
  ctx: Readonly<CommandContext<G>>,
  examples?: string | CommandExamplesFetcher<G>
): Promise<string> {
  return typeof examples === 'string'
    ? examples
    : typeof examples === 'function'
      ? await examples(ctx)
      : ''
}

export function namespacedId<K extends string>(
  id: K
): GenerateNamespacedKey<K, typeof PLUGIN_PREFIX> {
  return `${PLUGIN_PREFIX}${BUILT_IN_KEY_SEPARATOR}${id}`
}

export function makeShortLongOptionPair(
  schema: ArgSchema,
  name: string,
  toKebab?: boolean
): string {
  // Convert camelCase to kebab-case for display in help text if toKebab is true
  const displayName = toKebab || schema.toKebab ? kebabnize(name) : name
  let key = `--${displayName}`
  if (schema.short) {
    key = `-${schema.short}, ${key}`
  }
  return key
}
