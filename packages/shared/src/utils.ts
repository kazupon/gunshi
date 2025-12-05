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
  CommandBuiltinResourceKeys,
  GenerateNamespacedKey,
  KeyOfArgs,
  RemovedIndex
} from './types.ts'

/**
 * Resolve a namespaced key for built-in resources.
 *
 * Built-in keys are prefixed with "_:".
 *
 * @typeParam K - The type of the built-in key to resolve. Defaults to command built-in argument and resource keys.
 *
 * @param key - The built-in key to resolve.
 * @returns Prefixed built-in key.
 */
export function resolveBuiltInKey<K extends string = CommandBuiltinResourceKeys>(
  key: K
): GenerateNamespacedKey<K> {
  return `${BUILT_IN_PREFIX}${BUILT_IN_KEY_SEPARATOR}${key}`
}

/**
 * Resolve a namespaced key for argument resources.
 *
 * Argument keys are prefixed with "arg:".
 * If the command name is provided, it will be prefixed with the command name (e.g. "cmd1:arg:foo").
 *
 * @typeParam A - The {@linkcode Args} type extracted from G
 *
 * @param key - The argument key to resolve.
 * @param name - The command name.
 * @returns Prefixed argument key.
 */
export function resolveArgKey<
  A extends Args = DefaultGunshiParams['args'],
  K extends string = KeyOfArgs<RemovedIndex<A>>
>(key: K, name?: string): string {
  return `${name ? `${name}${BUILT_IN_KEY_SEPARATOR}` : ''}${ARG_PREFIX}${BUILT_IN_KEY_SEPARATOR}${key}`
}

/**
 * Resolve a namespaced key for non-built-in resources.
 *
 * Non-built-in keys are not prefixed with any special characters. If the command name is provided, it will be prefixed with the command name (e.g. "cmd1:foo").
 *
 * @typeParam T - The type of the non-built-in key to resolve. Defaults to string.
 *
 * @param key - The non-built-in key to resolve.
 * @param name - The command name.
 * @returns Prefixed non-built-in key.
 */
export function resolveKey<
  T extends Record<string, string> = {},
  K extends string = keyof T extends string ? keyof T : string
>(key: K, name?: string): string {
  return `${name ? `${name}${BUILT_IN_KEY_SEPARATOR}` : ''}${key}`
}

/**
 * Resolve command examples.
 *
 * @typeParam G - Type parameter extending {@linkcode GunshiParams}
 *
 * @param ctx - A {@linkcode CommandContext | command context}.
 * @param examples - The examples to resolve, which can be a string or a {@linkcode CommandExamplesFetcher | function} that returns a string.
 * @returns A resolved string of examples.
 */
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

/**
 * Generate a namespaced key for a plugin.
 *
 * @typeParam K - The type of the plugin id to generate a namespaced key for.
 *
 * @param id - A plugin id to generate a namespaced key.
 * @returns A namespaced key for the plugin.
 */
export function namespacedId<K extends string>(
  id: K
): GenerateNamespacedKey<K, typeof PLUGIN_PREFIX> {
  return `${PLUGIN_PREFIX}${BUILT_IN_KEY_SEPARATOR}${id}`
}

/**
 * Generate a short and long option pair for command arguments.
 *
 * @param schema - The {@linkcode ArgSchema | argument schema} to generate the option pair.
 * @param name - The name of the argument.
 * @param toKebab - Whether to convert the name to kebab-case for display in help text.
 * @returns A string representing the short and long option pair.
 */
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
