/**
 * The entry point of the helpers that a plugin uses to walk the commands of a CLI.
 *
 * @example
 * ```js
 * import { getCommandSubCommands, resolveLazyCommand } from 'gunshi/utils'
 *
 * const command = await resolveLazyCommand(lazyCommand, 'build', true)
 * const subCommands = getCommandSubCommands(command)
 * ```
 *
 * @module
 */

/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

export { getCommandSubCommands, isLazyCommand, kebabnize, resolveLazyCommand } from './utils.ts'
