/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { ANONYMOUS_COMMAND_NAME, JSON_ARG } from './constants.ts'

import type {
  Args,
  ArgToken,
  Command,
  Commandable,
  DefaultGunshiParams,
  GunshiParamsConstraint,
  LazyCommand
} from './types.ts'

export { kebabnize } from 'args-tokens/utils'

/**
 * How `--json` asks a command for JSON.
 *
 * - `'declared'`: the command spreads `jsonArgs` into its arguments, and `--json` asks it for JSON
 * - `'undeclared'`: the command has no `json` argument, and `--json` is given to it
 */
export type JsonRequest = 'declared' | 'undeclared'

/**
 * Check whether an argument schema is the `json` argument of `jsonArgs`, by its mark.
 *
 * @param schema - An argument schema
 * @returns `true` if the schema has the mark of `jsonArgs`
 */
export function isJsonArg(schema: unknown): boolean {
  return (
    typeof schema === 'object' &&
    schema !== null &&
    (schema as Record<string, unknown>)[JSON_ARG] === true
  )
}

/**
 * Resolve whether `--json` asks a command for JSON.
 *
 * A command that spreads `jsonArgs` is asked for JSON when the resolved value of its `json` is `true`:
 * with `--json`, or with a short name that the command gives it, but not with `--json=false`, nor with
 * `--json` after `--`. The raw tokens are read only when they are given, and only when there is no
 * value to read: when the command has no `json` argument, and when the core could not resolve the
 * command and left the values empty. A `json` argument without the mark belongs to the command, and
 * `--json` is never taken for a request then.
 *
 * @param args - The arguments of the command, the global options included
 * @param values - The resolved values of the arguments
 * @param tokens - The raw tokens of the arguments, to find a `--json` that no argument declares
 * @returns How the command is asked for JSON, or `undefined` when it is not
 */
export function resolveJsonRequest(
  args: Readonly<Args>,
  values: Readonly<Record<string, unknown>>,
  tokens?: readonly ArgToken[]
): JsonRequest | undefined {
  const schema = Object.hasOwn(args, 'json') ? args.json : undefined
  if (schema === undefined) {
    return tokens !== undefined && hasJsonOption(tokens) ? 'undeclared' : undefined
  }
  if (!isJsonArg(schema)) {
    return undefined
  }
  if (values.json !== undefined) {
    return values.json === true ? 'declared' : undefined
  }
  return tokens !== undefined && hasJsonOption(tokens) ? 'declared' : undefined
}

/**
 * Check whether the raw tokens have a `--json` that asks for JSON: `--json` or `--json=true`, before
 * `--`. Without a declaration, a short name of `--json` is not known.
 *
 * @param tokens - The raw tokens of the arguments
 * @returns `true` if a `--json` asks for JSON
 */
function hasJsonOption(tokens: readonly ArgToken[]): boolean {
  for (const token of tokens) {
    if (token.kind === 'option-terminator') {
      return false
    }
    if (
      token.kind === 'option' &&
      token.rawName === '--json' &&
      (token.value === undefined || token.value === 'true')
    ) {
      return true
    }
  }
  return false
}

/**
 * Check if the given command is a {@link LazyCommand}.
 *
 * @param cmd - A command to check
 * @returns `true` if the command is a {@link LazyCommand}, otherwise `false`
 *
 * A lazy command is identified by its `commandName` property. The property may be
 * `undefined` when the lazy command has no definition name.
 */
export function isLazyCommand<G extends GunshiParamsConstraint = DefaultGunshiParams>(
  cmd: unknown
): cmd is LazyCommand<G> {
  return typeof cmd === 'function' && 'commandName' in cmd
}

/**
 * Resolve a lazy command to a {@link Command}.
 *
 * If the loader returns a command, the properties of the loaded command take precedence,
 * and the properties that it does not define fall back to the definition that is given to `lazy`.
 * `run` comes from the loader only, as the definition has none. A loaded command without `run` is resolved
 * without it, as any command without `run`, which the CLI fails with when it runs, unless it has sub-commands.
 *
 * @param cmd - A {@link Commandable} or {@link LazyCommand} to resolve
 * @param name - Optional name of the command, if not provided, it will use the name from the command itself.
 * @param needRunResolving - Whether to run the resolving function of the lazy command.
 * @returns A resolved {@link Command}
 */
export async function resolveLazyCommand<G extends GunshiParamsConstraint = DefaultGunshiParams>(
  cmd: Commandable<G>,
  name?: string,
  needRunResolving: boolean = false
): Promise<Command<G>> {
  let command: Command<G>
  if (isLazyCommand<G>(cmd)) {
    const baseCommand: Record<string, unknown> = {
      name: cmd.commandName,
      description: cmd.description,
      args: cmd.args,
      examples: cmd.examples,
      internal: cmd.internal,
      aliases: cmd.aliases,
      entry: cmd.entry,
      toKebab: cmd.toKebab,
      rendering: cmd.rendering,
      subCommands: cmd.subCommands
    }
    if ('resource' in cmd && cmd.resource) {
      baseCommand.resource = cmd.resource
    }
    command = Object.assign(create<Command<G>>(), baseCommand)

    if (needRunResolving) {
      /**
       * NOTE(kazupon): the error names the command, by its `commandName` or the name that it is given with.
       * The lazy command is the loader function, so its `name` is the name of the function, such as
       * `buildLoader` of a loader in a const.
       */
      const commandName = cmd.commandName || name || ANONYMOUS_COMMAND_NAME
      const loaded = await cmd()
      if (typeof loaded === 'function') {
        command.run = loaded
      } else if (typeof loaded === 'object' && loaded !== null) {
        /**
         * NOTE(kazupon): the loaded command wins, and the definition that is given to `lazy` is the fallback
         * for what the loaded command does not define. A loader that returns `{ run }` keeps the whole definition,
         * like a loader that returns the runner itself. A loaded command without `run` is a command without `run`
         * (#885): the CLI fails with it where it would run, as with any other, or prints the usage of a group.
         */
        command.run = loaded.run
        command.name = loaded.name ?? cmd.commandName
        command.description = loaded.description ?? cmd.description
        command.args = loaded.args ?? cmd.args
        command.examples = loaded.examples ?? cmd.examples
        command.internal = loaded.internal ?? cmd.internal
        command.aliases = loaded.aliases ?? cmd.aliases
        command.entry = loaded.entry ?? cmd.entry
        command.toKebab = loaded.toKebab ?? cmd.toKebab
        command.rendering = loaded.rendering ?? cmd.rendering
        command.subCommands = loaded.subCommands || cmd.subCommands
        if ('resource' in loaded && loaded.resource) {
          ;(command as { resource: any }).resource = loaded.resource
        }
      } else {
        /**
         * NOTE(kazupon): `null` comes here too, though `typeof null` is `'object'` (#883): a loader may return it
         * for a module that is not found, and it is neither a command nor a runner, as `undefined` is not.
         */
        throw new TypeError(`Cannot resolve command: ${commandName}`)
      }
    }
  } else {
    command = Object.assign(create<Command<G>>(), cmd)
  }

  if (command.name == null && name) {
    command.name = name
  }

  return deepFreeze(command)
}

/**
 * Create an object with the specified prototype. A shorthand for `Object.create`.
 *
 * @param obj - An object to use as the prototype for the new object. If `null`, it will create an object with no prototype.
 * @returns A new object with the specified prototype
 */
export function create<T>(obj: object | null = null): T {
  return Object.create(obj) as T
}

/**
 * Log a message to the console.
 *
 * @param args - Arguments to log
 */
export function log(...args: unknown[]): void {
  console.log(...args)
}

/**
 * Get the sub-commands of a command as a normalized Map.
 *
 * An array of sub-commands is keyed by the names of the commands (`commandName` for a lazy command).
 *
 * @param cmd - A command or lazy command
 * @returns A Map of sub-commands, or undefined if the command has no sub-commands.
 * @throws {TypeError} If a command in an array has no name, or two commands in an array have the same name.
 */
export function getCommandSubCommands<G extends GunshiParamsConstraint = DefaultGunshiParams>(
  cmd: Commandable<G> | Command<G> | LazyCommand<G>
): Map<string, Command<G> | LazyCommand<G>> | undefined {
  const subCommands = isLazyCommand<G>(cmd)
    ? cmd.subCommands
    : typeof cmd === 'object'
      ? cmd.subCommands
      : undefined

  if (!subCommands) {
    return undefined
  }

  if (subCommands instanceof Map) {
    return subCommands.size > 0
      ? (subCommands as Map<string, Command<G> | LazyCommand<G>>)
      : undefined
  }

  // an array of commands is keyed by the names of the commands
  if (Array.isArray(subCommands)) {
    if (subCommands.length === 0) {
      return undefined
    }
    const map = new Map<string, Command<G> | LazyCommand<G>>()
    for (const sub of subCommands as readonly (Command<G> | LazyCommand<G>)[]) {
      const name: unknown = isLazyCommand<G>(sub) ? sub.commandName : sub?.name
      if (typeof name !== 'string' || name === '') {
        throw new TypeError(
          `Sub-command name must be a non-empty string in an array of 'subCommands'`
        )
      }
      if (map.has(name)) {
        throw new TypeError(`Sub-command '${name}' is given twice in an array of 'subCommands'`)
      }
      map.set(name, sub)
    }
    return map
  }

  if (typeof subCommands === 'object') {
    const entries = Object.entries(subCommands)
    if (entries.length === 0) {
      return undefined
    }
    const map = new Map<string, Command<G> | LazyCommand<G>>()
    for (const [name, cmd] of entries) {
      map.set(name, cmd as Command<G> | LazyCommand<G>)
    }
    return map
  }

  return undefined
}

/**
 * Deep freeze an object, making it immutable.
 *
 * @param obj - The object to freeze
 * @param ignores - Properties to ignore during freezing
 * @returns A frozen object
 */
export function deepFreeze<T extends Record<string, any>>(
  obj: T,
  ignores: string[] = []
): Readonly<T> {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  for (const key of Object.keys(obj)) {
    const value = obj[key]
    if (ignores.includes(key)) {
      continue
    }
    if (typeof value === 'object' && value !== null) {
      deepFreeze(value, ignores)
    }
  }

  return Object.freeze(obj)
}
