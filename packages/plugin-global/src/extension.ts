/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type { Awaitable, CommandContextCore, DefaultGunshiParams } from '@gunshi/plugin'

/**
 * Extended command context which provides utilities via global options plugin.
 * These utilities are available via `CommandContext.extensions['g:global']`.
 */
export interface GlobalExtension {
  /**
   * Show the version of the application. if `--version` option is specified, it will print the version to the console.
   *
   * @returns The version of the application, or `unknown` if the version is not specified.
   */
  showVersion: () => string

  /**
   * Show the header of the application.
   *
   * @returns The header of the application, or `undefined` if the `renderHeader` is not specified.
   */
  showHeader: () => Awaitable<string | undefined>

  /**
   * Show the usage of the application. if `--help` option is specified, it will print the usage to the console.
   *
   * @returns The usage of the application, or `undefined` if the `renderUsage` is not specified.
   */
  showUsage: () => Awaitable<string | undefined>

  /**
   * Show validation errors. This is called when argument validation fails.
   *
   * @param error - The aggregate error containing validation failures
   * @returns The rendered error message, or `undefined` if `renderValidationErrors` is null
   */
  showValidationErrors: (error: AggregateError) => Awaitable<string | undefined>
}

/**
 * Extends the command context for global options plugin.
 *
 * @param ctx - The {@linkcode CommandContextCore | command context} core
 * @returns An {@linkcode GlobalExtension} of global options plugin
 */
export default function extension(ctx: CommandContextCore<DefaultGunshiParams>): GlobalExtension {
  return {
    showVersion: () => {
      const version = ctx.env.version || 'unknown'
      if (!ctx.env.usageSilent) {
        ctx.log(version)
      }
      return version
    },

    showHeader: async () => {
      let header: string | undefined
      if (ctx.env.renderHeader != null) {
        header = await ctx.env.renderHeader(ctx)
        if (header) {
          ctx.log(header)
          ctx.log() // empty line after header
        }
      }
      return header
    },

    showUsage: async () => {
      if (ctx.env.renderUsage != null) {
        const usage = await ctx.env.renderUsage(ctx)
        if (usage) {
          ctx.log(usage)
          return usage
        }
      }
    },

    showValidationErrors: async (error: AggregateError) => {
      if (ctx.env.renderValidationErrors === null) {
        return
      }
      if (ctx.env.renderValidationErrors !== undefined) {
        const message = await ctx.env.renderValidationErrors(ctx, error)
        ctx.log(message)
        return message
      }
    }
  }
}
