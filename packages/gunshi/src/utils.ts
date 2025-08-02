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
  name?: string | undefined,
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
      entry: cmd.entry
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
        if ('resource' in loaded && loaded.resource) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): type assertion for lazy command
          ;(command as any).resource = loaded.resource
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
 * Deep freeze an object, making it immutable.
 *
 * @param obj - The object to freeze
 * @param ignores - Properties to ignore during freezing
 * @returns A frozen object
 */
export function deepFreeze<T extends Record<string, any>>( // eslint-disable-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): generic type for deepFreeze
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
