/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { plugin } from '../plugin.ts'
import { renderHeader } from '../renderer/header.ts'
import { renderUsage } from '../renderer/usage.ts'
import { renderValidationErrors } from '../renderer/validation.ts'

/**
 * Default renderer plugin for Gunshi.
 */
export default function renderer() {
  return plugin({
    name: 'default-renderer',
    dependencies: ['loader'],
    setup: ctx => {
      ctx.decorateHeaderRenderer(async (_baseRenderer, cmdCtx) => await renderHeader(cmdCtx))
      ctx.decorateUsageRenderer(async (_baseRenderer, cmdCtx) => await renderUsage(cmdCtx))
      ctx.decorateValidationErrorsRenderer(
        async (_baseRenderer, cmdCtx, error) => await renderValidationErrors(cmdCtx, error)
      )
    }
  })
}
