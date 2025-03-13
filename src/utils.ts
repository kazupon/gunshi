import type { ArgOptions } from 'args-tokens'
import type { Command, Commandable } from './types'

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
