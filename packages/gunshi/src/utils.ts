/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { ARG_PREFIX, BUILT_IN_KEY_SEPARATOR, BUILT_IN_PREFIX } from './constants.ts'

import type { Args, ArgValues } from 'args-tokens'
import type {
  Command,
  Commandable,
  CommandBuiltinArgsKeys,
  CommandBuiltinResourceKeys,
  CommandContext,
  CommandExamplesFetcher,
  GenerateNamespacedKey,
  KeyOfArgs,
  LazyCommand,
  RemovedIndex
} from './types.ts'

export function isLazyCommand<A extends Args = Args>(cmd: unknown): cmd is LazyCommand<A> {
  return typeof cmd === 'function' && 'commandName' in cmd && !!cmd.commandName
}

export async function resolveLazyCommand<A extends Args = Args>(
  cmd: Commandable<A>,
  name?: string | undefined,
  needRunResolving: boolean = false
): Promise<Command<A>> {
  let command: Command<A> | undefined
  if (isLazyCommand<A>(cmd)) {
    command = Object.assign(create<Command<A>>(), {
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
    command = Object.assign(create<Command<A>>(), cmd)
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

export function resolveArgKey<A extends Args = {}, K extends string = KeyOfArgs<RemovedIndex<A>>>(
  key: K
): GenerateNamespacedKey<K, typeof ARG_PREFIX> {
  return `${ARG_PREFIX}${BUILT_IN_KEY_SEPARATOR}${key}`
}

export async function resolveExamples<A extends Args = Args, V extends ArgValues<A> = ArgValues<A>>(
  ctx: Readonly<CommandContext<A, V>>,
  examples?: string | CommandExamplesFetcher<A>
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
