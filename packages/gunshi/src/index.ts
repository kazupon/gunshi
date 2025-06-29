/**
 * The main entry point for Gunshi.
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
export { DefaultTranslation } from '../../plugin-i18n/src/index.ts' // TODO(kazupon): remove this import after the next major release
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
