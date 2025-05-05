/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type { Args } from 'args-tokens'
import type { CommandContext } from '../types.ts'

/**
 * Render the header.
 * @param ctx A {@link CommandContext | command context}
 * @returns A rendered header.
 */
export function renderHeader<A extends Args = Args>(
  ctx: Readonly<CommandContext<A>>
): Promise<string> {
  const title = ctx.env.description || ctx.env.name || ''
  return Promise.resolve(
    title
      ? `${title} (${ctx.env.name || ''}${ctx.env.version ? ` v${ctx.env.version}` : ''})`
      : title
  )
}
