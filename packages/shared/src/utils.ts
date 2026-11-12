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
 * Compose the description of the negated form of a negatable option.
 *
 * The `NEGATABLE` built-in resource places the option with `{$option}`, so that a language can put it
 * where it reads naturally, as `Negate --force` and `--force を打ち消す` do. A resource without the
 * placeholder, such as one that an app gives to the i18n plugin for its own locale, is read as a
 * prefix of the option, as before.
 *
 * @param text - The `NEGATABLE` built-in resource, formatted with `{ option }`.
 * @param option - The option that the negated form negates, as rendered (`-f, --force`).
 * @returns The description of the negated form.
 */
export function composeNegatableDescription(text: string, option: string): string {
  return text.includes(option) ? text : `${text} ${option}`.trim()
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

/**
 * The key of the registry in which the core of gunshi keeps the command contexts whose command has no
 * `run`: the same registered symbol as the one of the core, which marks the context.
 */
const WITHOUT_RUN = Symbol.for('gunshi.withoutRun')

/**
 * Check if the command of a run has no `run`, by the mark that the core of gunshi puts on its context.
 *
 * NOTE(kazupon): the plugins cannot tell it from the context, nor from the runner that they decorate,
 * which the core always wraps, so the core marks the context, once the command is loaded, a lazy one
 * included. The mark is kept in a registry under a registered symbol, since `gunshi` and the plugins
 * bundle their own copies. The global options plugin prints the usage of a group without `run` by the
 * mark, and tells it in the help as JSON, and the usage renderer plugin does not list such a group as its
 * default command. The core keeps its own key and its writer out of the public API, as only the plugins
 * read the mark, and the tests pin this reader to the mark of the core.
 *
 * @param ctx - The command context of the run
 * @returns `true` if the core marked the context as the one of a command without `run`
 */
export function isWithoutRun(ctx: object): boolean {
  const registry = (globalThis as unknown as Record<symbol, WeakSet<object> | undefined>)[
    WITHOUT_RUN
  ]
  return registry?.has(ctx) === true
}

/**
 * Order the arguments of a command as the help lists them: the arguments of the command first, and the
 * global options in effect after them, each in the order in which they are merged.
 *
 * NOTE(kazupon): the reader looks for the options of the command, and the global options, such as `--help`
 * and `--version`, are the same for every command. The help for people and the help as JSON both list the
 * options in this order, so that they agree. Only the help is ordered this way: the arguments are parsed as
 * `resolveCommandArgs` merges them, the global options first. An argument of the command that replaces a
 * global option is not in effect as a global option, so it is listed with the arguments of the command.
 *
 * @typeParam T - The type of the value of an argument, such as its schema
 * @param args - The arguments, as pairs of a name and a value, in the order in which they are merged
 * @param globalOptions - The global options in effect, as `ctx.env.globalOptions` has them
 * @returns The arguments, the global options in effect last
 */
export function orderGlobalOptionsLast<T>(
  args: [string, T][],
  globalOptions: ReadonlyMap<string, unknown> | undefined
): [string, T][] {
  if (!globalOptions || globalOptions.size === 0) {
    return [...args]
  }
  return [
    ...args.filter(([name]) => !globalOptions.has(name)),
    ...args.filter(([name]) => globalOptions.has(name))
  ]
}
