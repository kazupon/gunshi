/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { COMMON_ARGS } from '../constants.ts'
import { plugin } from '../plugin.ts'

import type { PluginContext } from '../plugin.ts'
import type { Awaitable, CommandContextCore } from '../types.ts'

/**
 * Extended command context which provides utilities via global options plugin.
 */
export interface GlobalsCommandContext {
  /**
   * Show the version of the application. if `--version` option is specified, it will print the version to the console.
   * @returns The version of the application, or `unknown` if the version is not specified.
   */
  showVersion: () => string
  /**
   * Show the header of the application.
   * @returns The header of the application, or `undefined` if the `renderHeader` is not specified.
   */
  showHeader: () => Awaitable<string | undefined>
  /**
   * Show the usage of the application. if `--help` option is specified, it will print the usage to the console.
   * @returns The usage of the application, or `undefined` if the `renderUsage` is not specified.
   */
  showUsage: () => Awaitable<string | undefined>
}

/**
 * Extension for the global options plugin.
 */
const extension = (ctx: CommandContextCore) => ({
  showVersion: () => {
    const version = ctx.env.version || 'unknown'
    if (!ctx.env.usageSilent) {
      ctx.log(version)
    }
    return version
  },
  showHeader: async () => {
    let header: string | undefined
    if (ctx.env.renderHeader !== null && ctx.env.renderHeader !== undefined) {
      header = await ctx.env.renderHeader(ctx)
      if (header) {
        ctx.log(header)
        ctx.log() // empty line after header
      }
    }
    return header
  },
  showUsage: async () => {
    if (ctx.env.renderUsage !== null && ctx.env.renderUsage !== undefined) {
      const usage = await ctx.env.renderUsage(ctx)
      if (usage) {
        ctx.log(usage)
        return usage
      }
    }
  }
})

// TODO(kazupon): use default as the plugin export
/**
 * Built-in global options plugin for Gunshi.
 */
// @ts-ignore -- FIXME(kazupon): this is a plugin definition, not a function
const _definition = plugin({
  name: 'globals',
  extension,
  setup(ctx) {
    for (const [name, schema] of Object.entries(COMMON_ARGS)) {
      ctx.addGlobalOption(name, schema)
    }

    // apply help and version decorators
    ctx.decorateCommand(baseRunner => async ctx => {
      console.log('globals decorator', ctx)
      const {
        values,
        extensions: { showVersion, showHeader, showUsage }
      } = ctx

      if (values.version) {
        return showVersion()
      }

      const buf: string[] = []
      const header = await showHeader()
      if (header) {
        buf.push(header)
      }

      if (values.help) {
        const usage = await showUsage()
        if (usage) {
          buf.push(usage)
          return buf.join('\n')
        }
        return
      }

      // normal command execution
      return baseRunner(ctx)
    })
  }
})

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
