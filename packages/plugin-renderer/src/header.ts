/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type { CommandContext, DefaultGunshiParams, GunshiParams } from '@gunshi/plugin'

/**
 * Render the header.
 *
 * @param ctx - A {@link CommandContext | command context}
 * @returns A rendered header.
 */
export function renderHeader<G extends GunshiParams = DefaultGunshiParams>(
  ctx: Readonly<CommandContext<G>>
): Promise<string> {
  const title = ctx.env.description || ctx.env.name || ''
  /**
   * NOTE(kazupon): the parentheses tell only what the CLI has of its name and its version: without
   * `name`, they have no empty name, and without both, there are none.
   */
  const detail = [ctx.env.name, ctx.env.version ? `v${ctx.env.version}` : '']
    .filter(Boolean)
    .join(' ')
  return Promise.resolve(title && detail ? `${title} (${detail})` : title)
}
