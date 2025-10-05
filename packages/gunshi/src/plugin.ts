/**
 * The entry point for Gunshi plugin module.
 *
 * @example
 * ```js
 * import { plugin } from 'gunshi/plugin'
 *
 * export default yourPlugin() {
 *   return plugin({
 *     id: 'your-plugin-id',
 *     setup: (ctx) => {
 *       // your plugin setup logic here
 *     },
 *   })
 * }
 * ```
 *
 * @module
 */

/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

export { ANONYMOUS_COMMAND_NAME, CLI_OPTIONS_DEFAULT } from './constants.ts'
export { createCommandContext } from './context.ts'
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
export type {
  Args,
  ArgSchema,
  ArgToken,
  ArgValues,
  Awaitable,
  Command,
  CommandContext,
  CommandContextCore,
  CommandContextExtension,
  CommandDecorator,
  CommandExamplesFetcher,
  CommandRunner,
  DefaultGunshiParams,
  ExtendContext,
  ExtractArgs,
  ExtractExtensions,
  GunshiParams,
  GunshiParamsConstraint,
  LazyCommand,
  NormalizeToGunshiParams,
  Prettify,
  RendererDecorator,
  ValidationErrorsDecorator
} from './types.ts'
