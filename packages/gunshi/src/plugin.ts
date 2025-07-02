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
  CommandDecorator,
  CommandExamplesFetcher,
  CommandRunner,
  DefaultGunshiParams,
  ExtendContext,
  ExtractArgs,
  GunshiParams,
  GunshiParamsConstraint,
  LazyCommand,
  NormalizeToGunshiParams,
  RendererDecorator,
  ValidationErrorsDecorator
} from './types.ts'
