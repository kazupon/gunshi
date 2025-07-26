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
  Args,
  Command,
  CommandContext,
  CommandContextCore,
  DefaultGunshiParams,
  GunshiParams,
  PluginWithExtension
} from '@gunshi/plugin'
import type { I18nCommandContext } from '@gunshi/plugin-i18n'
import type { PluginId, UsageRendererCommandContext } from './types.ts'

export { renderHeader } from './header.ts'
export { renderUsage } from './usage.ts'
export { renderValidationErrors } from './validation.ts'

export type { UsageRendererCommandContext } from './types.ts'

// type for the command context with renderer extension
type RendererCommandContext = GunshiParams<{
  args: Args
  extensions: {
    [K in PluginId]: UsageRendererCommandContext<DefaultGunshiParams>
  }
}>

const i18nPluginId = namespacedId('i18n')

/**
 * usage renderer plugin
 */
export default function renderer(): PluginWithExtension<UsageRendererCommandContext> {
  return plugin({
    id,
    name: 'usage renderer',

    dependencies: [{ id: i18nPluginId, optional: true }],

    extension: (ctx: CommandContextCore, cmd: Command): UsageRendererCommandContext => {
      const {
        extensions: { [i18nPluginId]: i18n }
      } = ctx as unknown as CommandContext<{
        args: Args
        extensions: {
          [i18nPluginId]?: I18nCommandContext
        }
      }>

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
          if (a.entry) {
            return -1 // prioritize entry commands
          }
          if (a.name?.localeCompare(b.name || '') === 0) {
            return 0 // keep the order of commands with the same name
          }
          if (a.name && b.name) {
            return a.name.localeCompare(b.name) // sort by name
          }
          return 0 // fallback to no change
        })
        return cachedCommands
      }

      return {
        text: localizable(ctx, cmd, i18n?.translate),
        loadCommands
      }
    },

    setup: ctx => {
      ctx.decorateHeaderRenderer(
        async (_baseRenderer, cmdCtx) => await renderHeader<RendererCommandContext>(cmdCtx)
      )
      ctx.decorateUsageRenderer(
        async (_baseRenderer, cmdCtx) => await renderUsage<RendererCommandContext>(cmdCtx)
      )
      ctx.decorateValidationErrorsRenderer(
        async (_baseRenderer, cmdCtx, error) =>
          await renderValidationErrors<RendererCommandContext>(cmdCtx, error)
      )
    }
  })
}
