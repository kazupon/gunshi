import { BUILT_IN_KEY_SEPARATOR, BUILT_IN_PREFIX } from './constants.js'

import type { ArgOptions } from 'args-tokens'
import type {
  Command,
  Commandable,
  CommandBuiltinOptionsKeys,
  CommandBuiltinResourceKeys,
  GenerateNamespacedKey
} from './types'

export async function resolveLazyCommand<Options extends ArgOptions = ArgOptions>(
  cmd: Commandable<Options>,
  name: string | undefined,
  entry: boolean = false
): Promise<Command<Options>> {
  const resolved = Object.assign(
    create<Command<Options>>(),
    typeof cmd == 'function' ? await cmd() : cmd,
    { default: entry }
  )

  if (resolved.name == null && name) {
    resolved.name = name
  }
  return deepFreeze(resolved)
}

export function resolveBuiltInKey<
  Key extends string = CommandBuiltinOptionsKeys | CommandBuiltinResourceKeys
>(key: Key): GenerateNamespacedKey<Key> {
  return `${BUILT_IN_PREFIX}${BUILT_IN_KEY_SEPARATOR}${key}`
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const value = obj[key]
    if (typeof value === 'object' && value !== null) {
      deepFreeze(value)
    }
  }

  return Object.freeze(obj)
}
