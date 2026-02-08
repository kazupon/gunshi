/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type {
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
        command.run = loaded.run
        command.name = loaded.name
        command.description = loaded.description
        command.args = loaded.args
        command.examples = loaded.examples
        command.internal = loaded.internal
        command.entry = loaded.entry
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
