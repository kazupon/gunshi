/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { create, kebabnize } from 'gunshi/utils'
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
  const displayName = resolveDisplayName(name, schema, toKebab)
  let key = `--${displayName}`
  if (schema.short) {
    key = `-${schema.short}, ${key}`
  }
  return key
}

/**
 * Resolve the name that an argument is parsed and rendered under.
 *
 * @param name - The key of the argument.
 * @param schema - The {@linkcode ArgSchema | argument schema}.
 * @param toKebab - Whether to convert the name to kebab-case.
 * @returns The name of the argument, kebab-cased when `toKebab` asks for it.
 */
export function resolveDisplayName(name: string, schema: ArgSchema, toKebab?: boolean): string {
  return toKebab || schema.toKebab ? kebabnize(name) : name
}

/**
 * Collect the names that the arguments are parsed and rendered under.
 *
 * A positional argument is left out: it is never spelled as an option, so it cannot take the name of
 * one. A `hidden` argument is counted, because it still owns the name that it parses.
 *
 * @param args - The {@linkcode Args | arguments} of a command, global options included.
 * @param toKebab - Whether the command converts its names to kebab-case.
 * @returns The set of names.
 */
export function resolveOptionNames(args: Args, toKebab?: boolean): Set<string> {
  const names = new Set<string>()
  for (const [name, schema] of Object.entries(args)) {
    if (schema.type !== 'positional') {
      names.add(resolveDisplayName(name, schema, toKebab))
    }
  }
  return names
}

/**
 * Resolve the arguments of a command, the way gunshi parses and renders them.
 *
 * The global options belong to no command definition, so they are merged into the arguments of the
 * command. An argument of the command shadows the global option of the same name, and it shadows the
 * same way by short name: a global option gives up its short name to an argument of the command that
 * claims the same letter, and keeps its long name.
 *
 * NOTE(kazupon): a copy of the function that the core of gunshi resolves the arguments with. The
 * core does not export its own, to keep it out of the public API. `@gunshi/plugin-completion`
 * completes the arguments with this copy, and the tests pin it to the results of the core.
 *
 * @param globalOptions - The global options that plugins registered with `addGlobalOption`.
 * @param args - The {@linkcode Args | arguments} that the command declares.
 * @returns The merged arguments.
 */
export function resolveCommandArgs<A extends Args = Args>(
  globalOptions?: ReadonlyMap<string, ArgSchema>,
  args?: A
): A {
  return Object.assign(create<A>(), resolveGlobalOptions(globalOptions, args), args)
}

function resolveGlobalOptions(
  globalOptions: ReadonlyMap<string, ArgSchema> | undefined,
  args: Args | undefined
): Args | undefined {
  if (!globalOptions) {
    return undefined
  }

  const shortNames = new Set<string>()
  for (const schema of Object.values(args || {})) {
    if (schema.type !== 'positional' && schema.short) {
      shortNames.add(schema.short)
    }
  }

  const resolved = create<Args>()
  for (const [name, schema] of globalOptions) {
    /**
     * NOTE(kazupon): a copy, because the schema is the one that the plugin registered, which every
     * command of the CLI shares. Only this command gives up the short name.
     */
    resolved[name] =
      schema.short && shortNames.has(schema.short) ? { ...schema, short: undefined } : schema
  }

  return resolved
}
