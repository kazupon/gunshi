/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { plugin } from '../plugin.ts'
import { renderHeader } from '../renderer/header.ts'
import { renderUsage } from '../renderer/usage.ts'
import { renderValidationErrors } from '../renderer/validation.ts'
import { create } from '../utils.ts'

import type { Args } from 'args-tokens'
import type {
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
}

/**
 * Default renderer plugin for Gunshi.
 */
export default function renderer() {
  return plugin({
    name: 'renderer',

    dependencies: ['loader', { name: 'i18n', optional: true }],

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

      function text<
        T extends string = CommandBuiltinKeys,
        O = CommandArgKeys<DefaultGunshiParams['args']>,
        K = CommandBuiltinKeys | O | T
      >(key: K, values: Record<string, unknown> = create<Record<string, unknown>>()): string {
        return i18n ? i18n.translate(key, values) : (key as string)
      }

      return {
        text
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
