/**
 * gunshi cli entry point.
 *
 * This entry point exports the bellow APIs and types:
 * - `cli`: The main CLI function to run the command, included `global options` and `usage renderer` built-in plugins.
 * - `define`: A function to define a command.
 * - `defineWithTypes`: A function to define a command with specific type parameters.
 * - `lazy`: A function to lazily load a command.
 * - `lazyWithTypes`: A function to lazily load a command with specific type parameters.
 * - `plugin`: A function to create a plugin.
 * - `createCommandContext`: A function to create a command context, mainly for testing purposes.
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

export { DefaultTranslation } from '@gunshi/plugin-i18n' // TODO(kazupon): remove this import after the next major release
export { parseArgs, resolveArgs } from 'args-tokens'
export * from './cli.ts'
export { ANONYMOUS_COMMAND_NAME } from './constants.ts'
export { createCommandContext } from './context.ts'
export { define, defineWithTypes, lazy, lazyWithTypes } from './definition.ts'
export { plugin } from './plugin/core.ts'

export type { CommandContextParams } from './context.ts'
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
