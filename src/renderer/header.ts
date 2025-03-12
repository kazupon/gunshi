import type { ArgOptions } from 'args-tokens'
import type { CommandContext } from '../types'

/**
 * Render the header
 * @param ctx A {@link CommandContext | command context}
 * @returns A rendered header
 */
export function renderHeader<Options extends ArgOptions = ArgOptions>(
  ctx: Readonly<CommandContext<Options>>
): Promise<string> {
  const title = ctx.env.description || ctx.env.name || ''
  return Promise.resolve(
    title
      ? `${title} (${ctx.env.name || ''}${ctx.env.version ? ` v${ctx.env.version}` : ''})`
      : title
  )
}
