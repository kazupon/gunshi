import { pluginId } from './constants.ts'

import type { CommandContext, CommandDecorator } from 'gunshi/plugin'
import type { PluginId } from './constants.ts'
import type { MyPluginExtension } from './types.ts'

export const commandDecorator: CommandDecorator = baseRunner => async ctx => {
  if (ctx.values.help && ctx.env.renderUsage != null) {
    return await ctx.env.renderUsage(ctx)
  }
  return baseRunner(ctx)
}

type RenderDecoratorParams = {
  extensions: Record<PluginId, MyPluginExtension>
}

export const headerRendererDecorator = async (
  baseRenderer: (ctx: Readonly<CommandContext<RenderDecoratorParams>>) => Promise<string>,
  ctx: Readonly<CommandContext<RenderDecoratorParams>>
) => {
  return (await ctx.extensions[pluginId]?.showHeader()) || (await baseRenderer(ctx))
}
