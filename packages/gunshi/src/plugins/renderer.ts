/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { renderHeader } from '../renderer/header.ts'
import { renderUsage } from '../renderer/usage.ts'
import { renderValidationErrors } from '../renderer/validation.ts'

import type { PluginContext } from '../plugin.ts'

/**
 * Default renderer plugin for Gunshi.
 */
export default function defaultRenderer(ctx: PluginContext) {
  ctx.decorateHeaderRenderer(async (_baseRenderer, cmdCtx) => await renderHeader(cmdCtx))
  ctx.decorateUsageRenderer(async (_baseRenderer, cmdCtx) => await renderUsage(cmdCtx))
  ctx.decorateValidationErrorsRenderer(
    async (_baseRenderer, cmdCtx, error) => await renderValidationErrors(cmdCtx, error)
  )
}
