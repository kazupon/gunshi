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
   * Show the usage of the application, with the header as its title. if `--help` option is specified, it will print the usage to the console.
   *
   * @returns The header and the usage of the application, or `undefined` if the `renderUsage` is not specified.
   */
  showUsage: () => Awaitable<string | undefined>

  /**
   * Show validation errors. This is called when argument validation fails. The rendered message is printed to stderr, unless it is empty or `usageSilent` is set.
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
      if (ctx.env.renderUsage == null) {
        return
      }
      const usage = await ctx.env.renderUsage(ctx)
      if (!usage) {
        return
      }
      /**
       * NOTE(kazupon): the header is the title of the usage, so it comes with the usage, wherever the
       * usage is shown: for `--help`, and when a command that takes `--help` itself shows it. It is not
       * shown before a command runs, where it would come before what the command prints, such as JSON.
       */
      const header = ctx.env.renderHeader == null ? undefined : await ctx.env.renderHeader(ctx)
      if (header) {
        ctx.log(header)
        ctx.log() // empty line after header
      }
      ctx.log(usage)
      return header ? [header, usage].join('\n') : usage
    },

    showValidationErrors: async (error: AggregateError) => {
      if (ctx.env.renderValidationErrors === null) {
        return
      }
      if (ctx.env.renderValidationErrors !== undefined) {
        const message = await ctx.env.renderValidationErrors(ctx, error)
        /**
         * NOTE(kazupon): the validation errors are diagnostics, not the output of the command, so they
         * go to stderr, as the other CLI libraries do. stdout stays for what a command prints, such as JSON.
         */
        if (message && !ctx.env.usageSilent) {
          console.error(message)
        }
        return message
      }
    }
  }
}
