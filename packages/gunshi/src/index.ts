/**
 * gunshi cli entry point.
 *
 * This entry point exports the bellow APIs and types:
 * - `cli`: The main CLI function to run the command, included `global options` and `usage renderer` built-in plugins.
 * - `define`: A function to define a command.
 * - `lazy`: A function to lazily load a command.
 * - `plugin`: A function to create a plugin.
 * - `args-tokens` utilities, `parseArgs` and `resolveArgs` for parsing command line arguments.
 * - Some basic type definitions, such as `CommandContext`, `Plugin`, `PluginContext`, etc.
 *
 * @example
 * ```js
 * import { cli } from 'gunshi'
 * ```
 *
 * @module default
 */

/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

export { parseArgs, resolveArgs } from 'args-tokens'
export * from './cli.ts'
export { define, lazy } from './definition.ts'
export { plugin } from './plugin/core.ts'

export type { PluginContext } from './plugin/context.ts'
export type {
  OnPluginExtension,
  Plugin,
  PluginDependency,
  PluginExtension,
  PluginFunction,
  PluginOptions,
  PluginWithExtension,
  PluginWithoutExtension
} from './plugin/core.ts'
export type * from './types.ts'
