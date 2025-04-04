import type { ArgOptions } from 'args-tokens'
import type { Command } from './types.ts'

export type { ArgOptions, ArgOptionSchema, ArgValues } from 'args-tokens'

export function define<Options extends ArgOptions = ArgOptions>(
  definition: Command<Options>
): Command<Options> {
  return definition
}
