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

/**
 * Resolve a namespaced key for built-in resources.
 * Built-in keys are prefixed with "_:".
 *
 * @param key - The built-in key to resolve.
 * @returns Prefixed built-in key.
 */
export function resolveBuiltInKey<
  K extends string = CommandBuiltinArgsKeys | CommandBuiltinResourceKeys
>(key: K): GenerateNamespacedKey<K> {
  return `${BUILT_IN_PREFIX}${BUILT_IN_KEY_SEPARATOR}${key}`
}

/**
 * Resolve a namespaced key for argument resources.
 * Argument keys are prefixed with "arg:".
 * If the command name is provided, it will be prefixed with the command name (e.g. "cmd1:arg:foo").
 *
 * @param key - The argument key to resolve.
 * @param ctx - The command context.
 * @returns Prefixed argument key.
 */
export function resolveArgKey<
  A extends Args = DefaultGunshiParams['args'],
  K extends string = KeyOfArgs<RemovedIndex<A>>
>(key: K, ctx?: Readonly<CommandContext>): string {
  return `${ctx?.name ? `${ctx.name}${BUILT_IN_KEY_SEPARATOR}` : ''}${ARG_PREFIX}${BUILT_IN_KEY_SEPARATOR}${key}`
}

/**
 * Resolve a namespaced key for non-built-in resources.
 * Non-built-in keys are not prefixed with any special characters. If the command name is provided, it will be prefixed with the command name (e.g. "cmd1:foo").
 *
 * @param key - The non-built-in key to resolve.
 * @param ctx - The command context.
 * @returns Prefixed non-built-in key.
 */
export function resolveKey<
  T extends Record<string, string> = {},
  K = keyof T extends string ? keyof T : string
>(key: K, ctx?: Readonly<CommandContext>): string {
  return `${ctx?.name ? `${ctx.name}${BUILT_IN_KEY_SEPARATOR}` : ''}${key}`
}

/**
 * Resolve command examples.
 *
 * @param ctx - The command context.
 * @param examples - The examples to resolve, which can be a string or a function that returns a string.
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
 * @param schema - The argument schema to generate the option pair.
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
