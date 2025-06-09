/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { COMMON_ARGS } from '../constants.ts'

import type { PluginContext } from '../plugin.ts'

/**
 * Built-in global options plugin for Gunshi.
 */
export default function globals(ctx: PluginContext) {
  for (const [name, schema] of Object.entries(COMMON_ARGS)) {
    ctx.addGlobalOption(name, schema)
  }

  // apply help and version decorators
  ctx.decorateCommand(baseRunner => async ctx => {
    if (ctx.values.version) {
      const version = ctx.env.version || 'unknown'
      if (!ctx.env.usageSilent) {
        ctx.log(version)
      }
      return version
    }

    const outBuf: string[] = []

    let header: string | undefined
    if (ctx.env.renderHeader !== null && ctx.env.renderHeader !== undefined) {
      header = await ctx.env.renderHeader(ctx)
      if (header) {
        ctx.log(header)
        ctx.log() // empty line after header
        outBuf.push(header)
      }
    }

    if (ctx.values.help) {
      if (ctx.env.renderUsage !== null && ctx.env.renderUsage !== undefined) {
        const usage = await ctx.env.renderUsage(ctx)
        if (usage) {
          ctx.log(usage)
          outBuf.push(usage)
          return outBuf.join('\n')
        }
      }
      return
    }

    // normal command execution
    return baseRunner(ctx)
  })
}
