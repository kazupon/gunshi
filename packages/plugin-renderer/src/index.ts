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
  resolveLazyCommand
} from '@gunshi/shared'
import { renderHeader } from './header.ts'
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
import type { CommandArgKeys, CommandBuiltinKeys } from '@gunshi/shared'
import type { UsageRendererCommandContext } from './types.ts'

export { renderHeader } from './header.ts'
export { renderUsage } from './usage.ts'
export { renderValidationErrors } from './validation.ts'

export type { UsageRendererCommandContext } from './types.ts'

// type for the command context with renderer extension
type RendererCommandContext = GunshiParams<{
  args: Args
  extensions: {
    renderer: UsageRendererCommandContext<DefaultGunshiParams>
  }
}>

/**
 * usage renderer plugin
 */
export default function renderer(): PluginWithExtension<UsageRendererCommandContext> {
  return plugin({
    name: 'renderer',

    dependencies: [{ name: 'i18n', optional: true }],

    extension: (ctx: CommandContextCore): UsageRendererCommandContext => {
      // TODO(kazupon): This is a workaround for the type system.
      const {
        extensions: { i18n }
      } = ctx as unknown as CommandContext<{
        args: Args
        extensions: {
          i18n?: I18nCommandContext
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
        cachedCommands = (await Promise.all(
          subCommands.map(async ([name, cmd]) => await resolveLazyCommand(cmd, name))
        )) as Command<DefaultGunshiParams>[]

        return cachedCommands as unknown as Command<G>[]
      }

      function text<
        T extends string = CommandBuiltinKeys,
        O = CommandArgKeys<DefaultGunshiParams['args']>,
        K = CommandBuiltinKeys | O | T
      >(key: K, values: Record<string, unknown> = Object.create(null)): string {
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
              ? `${DefaultResource['NEGATABLE']} --${argKey}`
              : schema.description || ''
          } else {
            return key as string
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
