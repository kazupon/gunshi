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
import {
  ARG_NEGATABLE_PREFIX,
  ARG_PREFIX_AND_KEY_SEPARATOR,
  BUILD_IN_PREFIX_AND_KEY_SEPARATOR,
  DefaultResource,
  namespacedId,
  resolveExamples,
  resolveLazyCommand
} from '@gunshi/shared'
import { renderHeader } from './header.ts'
import { pluginId as id } from './types.ts'
import { makeShortLongOptionPair, renderUsage } from './usage.ts'
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
import type { CommandArgKeys, CommandBuiltinKeys } from '@gunshi/shared'
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
        return (cachedCommands = allCommands.filter(cmd => !cmd.internal).filter(Boolean))
      }

      async function text<
        T extends string = CommandBuiltinKeys,
        O = CommandArgKeys<DefaultGunshiParams['args']>,
        K = CommandBuiltinKeys | O | T
      >(key: K, values: Record<string, unknown> = Object.create(null)): Promise<string> {
        if (i18n) {
          return i18n.translate(key, values)
        } else {
          if ((key as string).startsWith(BUILD_IN_PREFIX_AND_KEY_SEPARATOR)) {
            const resKey = (key as string).slice(BUILD_IN_PREFIX_AND_KEY_SEPARATOR.length)
            return DefaultResource[resKey as keyof typeof DefaultResource] || (key as string)
          } else if ((key as string).startsWith(ARG_PREFIX_AND_KEY_SEPARATOR)) {
            let argKey = (key as string).slice(ARG_PREFIX_AND_KEY_SEPARATOR.length)
            let negatable = false
            if (argKey.startsWith(ARG_NEGATABLE_PREFIX)) {
              argKey = argKey.slice(ARG_NEGATABLE_PREFIX.length)
              negatable = true
            }
            const schema = ctx.args[argKey as keyof typeof ctx.args]
            return negatable && schema.type === 'boolean' && schema.negatable
              ? `${DefaultResource['NEGATABLE']} ${makeShortLongOptionPair(schema, argKey, ctx.toKebab)}`
              : schema.description || ''
          } else {
            // if the key is a built-in key 'description' and 'examples', return empty string, because the these keys are resolved by the renderer itself.
            if (key === 'description') {
              return ''
            } else if (key === 'examples') {
              return await resolveExamples(ctx, cmd.examples)
            } else {
              return key as string
            }
          }
        }
      }

      return {
        text,
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
