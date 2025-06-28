/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import {
  ARG_NEGATABLE_PREFIX,
  ARG_PREFIX_AND_KEY_SEPARATOR,
  BUILD_IN_PREFIX_AND_KEY_SEPARATOR
} from '../constants.ts'
import DefaultResource from '../locales/en-US.json' with { type: 'json' }
import { plugin } from '../plugin/core.ts'
import { create, resolveLazyCommand } from '../utils.ts'
import { renderHeader } from './renderer/header.ts'
import { renderUsage } from './renderer/usage.ts'
import { renderValidationErrors } from './renderer/validation.ts'

import type { Args } from 'args-tokens'
import type {
  Command,
  CommandArgKeys,
  CommandBuiltinKeys,
  CommandContext,
  CommandContextCore,
  DefaultGunshiParams,
  GunshiParams
} from '../types.ts'
import type { I18nCommandContext } from './i18n.ts'

/**
 * Extended command context which provides utilities via default renderer plugin.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DefaultRendererCommandContext<G extends GunshiParams<any> = DefaultGunshiParams> {
  /**
   * Render the text message
   */
  text: I18nCommandContext<G>['translate']
  /**
   * Load commands
   * @returns A list of commands loaded from the command loader plugin.
   */
  loadCommands: <G extends GunshiParams = DefaultGunshiParams>() => Promise<Command<G>[]>
}

/**
 * Default renderer plugin
 */
export default function renderer() {
  return plugin({
    name: 'renderer',

    dependencies: [{ name: 'i18n', optional: true }],

    extension: (ctx: CommandContextCore): DefaultRendererCommandContext => {
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
          return cachedCommands as Command<G>[]
        }

        const subCommands = [...(ctx.env.subCommands || [])] as [string, Command<G>][]
        cachedCommands = (await Promise.all(
          subCommands.map(async ([name, cmd]) => await resolveLazyCommand(cmd, name))
        )) as Command<DefaultGunshiParams>[]

        return cachedCommands as Command<G>[]
      }

      function text<
        T extends string = CommandBuiltinKeys,
        O = CommandArgKeys<DefaultGunshiParams['args']>,
        K = CommandBuiltinKeys | O | T
      >(key: K, values: Record<string, unknown> = create<Record<string, unknown>>()): string {
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
      ctx.decorateHeaderRenderer(async (_baseRenderer, cmdCtx) => await renderHeader(cmdCtx))
      ctx.decorateUsageRenderer(async (_baseRenderer, cmdCtx) => await renderUsage(cmdCtx))
      ctx.decorateValidationErrorsRenderer(
        async (_baseRenderer, cmdCtx, error) => await renderValidationErrors(cmdCtx, error)
      )
    }
  })
}
