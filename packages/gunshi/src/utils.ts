/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type {
  Args,
  ArgSchema,
  Command,
  Commandable,
  DefaultGunshiParams,
  GunshiParamsConstraint,
  LazyCommand
} from './types.ts'

export { kebabnize } from 'args-tokens/utils'

/**
 * Check if the given command is a {@link LazyCommand}.
 *
 * @param cmd - A command to check
 * @returns `true` if the command is a {@link LazyCommand}, otherwise `false
 */
export function isLazyCommand<G extends GunshiParamsConstraint = DefaultGunshiParams>(
  cmd: unknown
): cmd is LazyCommand<G> {
  return typeof cmd === 'function' && 'commandName' in cmd && !!cmd.commandName
}

/**
 * Resolve a lazy command to a {@link Command}.
 *
 * If the loader returns a command, the properties of the loaded command take precedence,
 * and the properties that it does not define fall back to the definition that is given to `lazy`.
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
      const loaded = await cmd()
      if (typeof loaded === 'function') {
        command.run = loaded
      } else if (typeof loaded === 'object') {
        if (loaded.run == null) {
          throw new TypeError(`'run' is required in command: ${cmd.name || name}`)
        }
        /**
         * NOTE(kazupon): the loaded command wins, and the definition that is given to `lazy` is the fallback
         * for what the loaded command does not define. A loader that returns `{ run }` keeps the whole definition,
         * like a loader that returns the runner itself.
         */
        command.run = loaded.run
        command.name = loaded.name ?? cmd.commandName
        command.description = loaded.description ?? cmd.description
        command.args = loaded.args ?? cmd.args
        command.examples = loaded.examples ?? cmd.examples
        command.internal = loaded.internal ?? cmd.internal
        command.entry = loaded.entry ?? cmd.entry
        command.toKebab = loaded.toKebab ?? cmd.toKebab
        command.rendering = loaded.rendering ?? cmd.rendering
        command.subCommands = loaded.subCommands || cmd.subCommands
        if ('resource' in loaded && loaded.resource) {
          ;(command as { resource: any }).resource = loaded.resource
        }
      } else {
        throw new TypeError(`Cannot resolve command: ${cmd.name || name}`)
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
 * Resolve the arguments of a command, the way gunshi parses and renders them.
 *
 * The global options belong to no command definition, so they are merged into the arguments of the
 * command that runs. An argument of the command shadows the global option of the same name, and it
 * shadows the same way by short name: a global option gives up its short name to an argument of the
 * command that claims the same letter, and keeps its long name.
 *
 * @param globalOptions - The global options that plugins registered with `addGlobalOption`
 * @param args - The arguments that the command declares
 * @returns The merged arguments
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
 * @param cmd - A command or lazy command
 * @returns A Map of sub-commands, or undefined if the command has no sub-commands.
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
