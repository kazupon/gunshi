/**
 * The main entry point for Gunshi.
 * @example
 * ```js
 * import { cli } from 'gunshi'
 * ```
 * @module default
 */

export type { ArgOptions, ArgOptionSchema, ArgValues } from 'args-tokens'
export * from './cli.ts'
export { DEFAULT_LOCALE } from './constants.ts'
export { DefaultTranslation } from './translation.ts'
export type * from './types.ts'
