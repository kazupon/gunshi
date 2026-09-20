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

import { ANONYMOUS_COMMAND_NAME, createCommandContext, plugin } from '@gunshi/plugin'
import { localizable, namespacedId, resolveKey, resolveLazyCommand } from '@gunshi/shared'
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

    extension: (ctx, cmd) => {
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

        // Plugins can add sub-commands without registering the CLI's entry in the command map.
        // Add it only to the root's display list; nested lists already have their own entry.
        const entryCommand = ctx.env.entryCommand
        if (
          ctx.callMode === 'entry' &&
          subCommands.length > 0 &&
          entryCommand &&
          !allCommands.some(command => command.entry)
        ) {
          allCommands.push(await resolveLazyCommand<G>(entryCommand, ANONYMOUS_COMMAND_NAME))
        }

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

      /**
       * Resolve the description of a command in the command list.
       *
       * NOTE(kazupon): the description is localized the way the command's own help localizes it,
       * which needs that command's resource. `text()` is bound to the command that is running, so it
       * cannot answer for another one. The i18n plugin loads a resource into the adapter under the
       * name of the command it is given, and `translate()` reads it back from there (#748).
       *
       * @param target - A command from `loadCommands`
       * @returns The description to show for the command
       */
      async function localizeCommandDescription(target: Command): Promise<string> {
        const fallback = target.description || ''
        if (!i18n || !target.name) {
          return fallback
        }

        const commandCtx = await createCommandContext({
          args: target.args,
          command: target,
          callMode: target.entry ? 'entry' : 'subCommand',
          extensions: {}
        })
        await i18n.loadResource(i18n.locale, commandCtx, target)

        return (await i18n.translate(resolveKey('description', target.name))) || fallback
      }

      return {
        text: localizable(ctx as unknown as CommandContext, cmd, i18n?.translate),
        loadCommands,
        localizeCommandDescription
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
