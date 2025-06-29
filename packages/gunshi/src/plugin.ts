/**
 * The entry point for Gunshi plugin module.
 *
 * @example
 * ```js
 * import { plugin } from 'gunshi/plugin'
 *
 * export default yourPlugin() {
 *   return plugin({
 *     name: 'your-plugin',
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
  CommandResource,
  CommandResourceFetcher,
  CommandRunner,
  DefaultGunshiParams,
  GunshiParams,
  LazyCommand,
  RendererDecorator,
  ValidationErrorsDecorator
} from './types.ts'
