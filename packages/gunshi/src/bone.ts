/**
 * gunshi cli bone (minimum) entry point.
 *
 * This entry point exports the bellow APIs and types.
 * - `cli`: The main CLI function to run the command, **not included `global` and `renderer` built-in plugins**.
 * - some basic type definitions only.
 *
 * @example
 * ```js
 * import { cli } from 'gunshi/bone'
 * ```
 *
 * @module bone
 */

/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

export { cli } from './cli/bone.ts'

export type * from './types.ts'
