import type { ArgOptions } from 'args-tokens'
import type { Command } from './types.ts'

export type { ArgOptions, ArgOptionSchema, ArgValues } from 'args-tokens'

/**
 * Define a {@link Command | command} with type inference
 * @param definition A {@link Command | command} definition
 * @returns A {@link Command | command} definition with type inference
 */
export function define<Options extends ArgOptions = ArgOptions>(
  definition: Command<Options>
): Command<Options> {
  return definition
}
