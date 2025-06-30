/**
 * gunshi cli bone (minimum) entry point.
 *
 * This entry point exports the bellow APIs and types.
 * - `cli`: The main CLI function to run the command, **not included `global` and `renderer` built-in plugins**.
 * - some basic type definitions only.
 *
 * > [!IMPORTANT]
 * > You cannot use the `cli` function in this entry to display the usage of the command with `--help` option.
 * > This entry point is provided to allow users to customize it completely, such as command usage rendering and plugin composition.
 *
 * @example
 * ```js
 * import { cli } from 'gunshi/bone'
 * import global from '@gunshi/plugin-global'
 * import renderer from '@gunshi/plugin-renderer'
 * import i18n from '@gunshi/plugin-i18n'
 *
 * const entry = (ctx) => {
 *   // entry logic ...
 * }
 *
 * await cli(process.argv.slice(2), entry, {
 *   // ...
 *   plugins: [
 *     global(),
 *     renderer(),
 *     i18n({
 *      // plugin options ...
 *     })
 *   ],
 * })
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
