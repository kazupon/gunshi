/**
 * The main entry point for Gunshi.
 * @example
 * ```js
 * import { cli } from 'gunshi'
 * ```
 * @module default
 */

export { parseArgs, resolveArgs } from 'args-tokens'
export type { ArgOptions, ArgOptionSchema, ArgValues } from 'args-tokens'
export * from './cli.ts'
export { DEFAULT_LOCALE } from './constants.ts'
export { define } from './define.ts'
export { DefaultTranslation } from './translation.ts'
export type * from './types.ts'
