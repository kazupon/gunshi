/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type { CommandContext, DefaultGunshiParams, GunshiParams } from '@gunshi/plugin'

/**
 * Render the header.
 *
 * @param ctx A {@link CommandContext | command context}
 * @returns A rendered header.
 */
export function renderHeader<G extends GunshiParams = DefaultGunshiParams>(
  ctx: Readonly<CommandContext<G>>
): Promise<string> {
  const title = ctx.env.description || ctx.env.name || ''
  return Promise.resolve(
    title
      ? `${title} (${ctx.env.name || ''}${ctx.env.version ? ` v${ctx.env.version}` : ''})`
      : title
  )
}
