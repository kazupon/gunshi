/**
 * The entry point of usage renderer plugin
 *
 * @example
 * ```js
 * import renderer from '@gunshi/plugin-renderer'
 * import { cli } from 'gunshi'
 *
 * const entry = (ctx) => {
 *   // ...
 * }
 *
 * await cli(process.argv.slice(2), entry, {
 *   // ...
 *
 *   plugins: [
 *     renderer()
 *   ],
 *
 *   // ...
 * })
 * ```
 *
 * @module
 */

/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { plugin } from '@gunshi/plugin'
import { localizable, namespacedId, resolveLazyCommand } from '@gunshi/shared'
import { renderHeader } from './header.ts'
import { pluginId as id } from './types.ts'
import { renderUsage } from './usage.ts'
import { renderValidationErrors } from './validation.ts'

import type {
  Command,
  CommandContext,
  DefaultGunshiParams,
  GunshiParams,
  PluginWithExtension
} from '@gunshi/plugin'
import type { I18nExtension } from '@gunshi/plugin-i18n'
import type { UsageRendererExtension } from './types.ts'

export { renderHeader } from './header.ts'
export * from './types.ts'
export { renderUsage } from './usage.ts'
export { renderValidationErrors } from './validation.ts'

const i18nPluginId = namespacedId('i18n')

const dependencies = [{ id: i18nPluginId, optional: true }] as const

/**
 * usage renderer plugin
 *
 * @returns A defined plugin as usage renderer
 */
export default function renderer(): PluginWithExtension<UsageRendererExtension> {
  return plugin<
    Record<typeof i18nPluginId, I18nExtension>,
    typeof id,
    typeof dependencies,
    UsageRendererExtension
  >({
    id,
    name: 'usage renderer',
    dependencies,

    extension: async (ctx, cmd) => {
      const i18n = ctx.extensions[i18nPluginId]

      let cachedCommands: Command[] | undefined

      async function loadCommands<G extends GunshiParams = DefaultGunshiParams>(): Promise<
        Command<G>[]
      > {
        if (cachedCommands) {
          return cachedCommands as unknown as Command<G>[]
        }

        const subCommands = [...(ctx.env.subCommands || [])] as [string, Command<G>][]
        const allCommands = await Promise.all(
          subCommands.map(async ([name, cmd]) => await resolveLazyCommand(cmd, name))
        )

        // filter out internal commands
        cachedCommands = allCommands.filter(cmd => !cmd.internal).filter(Boolean)
        cachedCommands.sort((a, b) => {
          // first, prioritize entry commands
          if (a.entry && !b.entry) {
            return -1
          }
          if (!a.entry && b.entry) {
            return 1
          }

          // then sort by name
          if (a.name && b.name) {
            return a.name.localeCompare(b.name)
          }

          // handle cases where one or both names are missing
          if (a.name && !b.name) {
            return -1
          }
          if (!a.name && b.name) {
            return 1
          }

          return 0 // keep original order if both have no name
        })
        return cachedCommands
      }

      return {
        text: localizable(ctx as unknown as CommandContext, cmd, i18n?.translate),
        loadCommands
      }
    },

    setup: ctx => {
      ctx.decorateHeaderRenderer(async (_baseRenderer, cmdCtx) => await renderHeader(cmdCtx))
      ctx.decorateUsageRenderer(async (_baseRenderer, cmdCtx) => await renderUsage(cmdCtx))
      ctx.decorateValidationErrorsRenderer(
        async (_baseRenderer, cmdCtx, error) => await renderValidationErrors(cmdCtx, error)
      )
    }
  })
}
