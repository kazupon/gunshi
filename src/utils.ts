/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { BUILT_IN_KEY_SEPARATOR, BUILT_IN_PREFIX, OPTION_PREFIX } from './constants.ts'

import type { ArgOptions } from 'args-tokens'
import type {
  Command,
  Commandable,
  CommandBuiltinOptionsKeys,
  CommandBuiltinResourceKeys,
  GenerateNamespacedKey,
  KeyOfArgOptions,
  RemovedIndex
} from './types.ts'

export async function resolveLazyCommand<Options extends ArgOptions = ArgOptions>(
  cmd: Commandable<Options>,
  name?: string | undefined,
  needRunResolving: boolean = false
): Promise<Command<Options>> {
  let command: Command<Options> | undefined
  if (typeof cmd === 'function') {
    command = Object.assign(create<Command<Options>>(), {
      name: cmd.commandName,
      description: cmd.description,
      options: cmd.options,
      examples: cmd.examples,
      resource: cmd.resource
    })

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
        command.options = loaded.options
        command.examples = loaded.examples
        command.resource = loaded.resource
      } else {
        throw new TypeError(`Cannot resolve command: ${cmd.name || name}`)
      }
    }
  } else {
    command = Object.assign(create<Command<Options>>(), cmd)
  }

  if (command.name == null && name) {
    command.name = name
  }

  return deepFreeze(command)
}

export function resolveBuiltInKey<
  Key extends string = CommandBuiltinOptionsKeys | CommandBuiltinResourceKeys
>(key: Key): GenerateNamespacedKey<Key> {
  return `${BUILT_IN_PREFIX}${BUILT_IN_KEY_SEPARATOR}${key}`
}

export function resolveOptionKey<
  Options extends ArgOptions = {},
  Key extends string = KeyOfArgOptions<RemovedIndex<Options>>
>(key: Key): GenerateNamespacedKey<Key, typeof OPTION_PREFIX> {
  return `${OPTION_PREFIX}${BUILT_IN_KEY_SEPARATOR}${key}`
}

export function mapResourceWithBuiltinKey(
  resource: Record<string, string>
): Record<string, string> {
  return Object.entries(resource).reduce((acc, [key, value]) => {
    acc[resolveBuiltInKey(key)] = value
    return acc
  }, create<Record<string, string>>())
}

export function create<T>(obj: object | null = null): T {
  return Object.create(obj) as T
}

export function log(...args: unknown[]): void {
  console.log(...args)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deepFreeze<T extends Record<string, any>>(obj: T): Readonly<T> {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  for (const key of Object.keys(obj)) {
    const value = obj[key]
    if (typeof value === 'object' && value !== null) {
      deepFreeze(value)
    }
  }

  return Object.freeze(obj)
}
