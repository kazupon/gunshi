/**
 * The entry point of the helpers that a plugin uses to walk the commands of a CLI, the same as `gunshi/utils`.
 *
 * @example
 * ```js
 * import { getCommandSubCommands, resolveLazyCommand } from '@gunshi/plugin/utils'
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

export * from 'gunshi/utils'
