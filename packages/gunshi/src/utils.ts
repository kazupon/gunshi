/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { ARG_PREFIX, BUILT_IN_KEY_SEPARATOR, BUILT_IN_PREFIX } from './constants.ts'

import type { Args } from 'args-tokens'
import type {
  Command,
  Commandable,
  CommandBuiltinArgsKeys,
  CommandBuiltinResourceKeys,
  CommandContext,
  CommandExamplesFetcher,
  DefaultGunshiParams,
  GenerateNamespacedKey,
  GunshiParams,
  KeyOfArgs,
  LazyCommand,
  RemovedIndex
} from './types.ts'

export { kebabnize } from 'args-tokens/utils'

export function isLazyCommand<G extends GunshiParams = DefaultGunshiParams>(
  cmd: unknown
): cmd is LazyCommand<G> {
  return typeof cmd === 'function' && 'commandName' in cmd && !!cmd.commandName
}

export async function resolveLazyCommand<G extends GunshiParams = DefaultGunshiParams>(
  cmd: Commandable<G>,
  name?: string | undefined,
  needRunResolving: boolean = false
): Promise<Command<G>> {
  let command: Command<G> | undefined
  if (isLazyCommand<G>(cmd)) {
    command = Object.assign(create<Command<G>>(), {
      name: cmd.commandName,
      description: cmd.description,
      args: cmd.args,
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
        command.args = loaded.args
        command.examples = loaded.examples
        command.resource = loaded.resource
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

export function resolveBuiltInKey<
  K extends string = CommandBuiltinArgsKeys | CommandBuiltinResourceKeys
>(key: K): GenerateNamespacedKey<K> {
  return `${BUILT_IN_PREFIX}${BUILT_IN_KEY_SEPARATOR}${key}`
}

export function resolveArgKey<
  A extends Args = DefaultGunshiParams['args'],
  K extends string = KeyOfArgs<RemovedIndex<A>>
>(key: K): GenerateNamespacedKey<K, typeof ARG_PREFIX> {
  return `${ARG_PREFIX}${BUILT_IN_KEY_SEPARATOR}${key}`
}

export async function resolveExamples<G extends GunshiParams = DefaultGunshiParams>(
  ctx: Readonly<CommandContext<G>>,
  examples?: string | CommandExamplesFetcher<G>
): Promise<string> {
  return typeof examples === 'string'
    ? examples
    : typeof examples === 'function'
      ? await examples(ctx)
      : ''
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
