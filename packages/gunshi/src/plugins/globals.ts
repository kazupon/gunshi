/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { COMMON_ARGS } from '../constants.ts'
import { plugin } from '../plugin.ts'

import type { Awaitable, CommandContextCore, DefaultGunshiParams } from '../types.ts'

/**
 * Extended command context which provides utilities via global options plugin.
 * These utilities are available via `CommandContext.extensions.globals`.
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
  /**
   * Show validation errors. This is called when argument validation fails.
   * @param error The aggregate error containing validation failures
   * @returns The rendered error message, or `undefined` if `renderValidationErrors` is null
   */
  showValidationErrors: (error: AggregateError) => Awaitable<string | undefined>
}

/**
 * Built-in global options plugin
 */
export default function globals() {
  return plugin({
    name: 'globals',

    extension: (ctx: CommandContextCore<DefaultGunshiParams>) => ({
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
    }),

    setup(ctx) {
      for (const [name, schema] of Object.entries(COMMON_ARGS)) {
        ctx.addGlobalOption(name, schema)
      }

      // apply help and version decorators
      ctx.decorateCommand(baseRunner => async ctx => {
        const {
          values,
          validationError,
          extensions: {
            globals: { showVersion, showHeader, showUsage, showValidationErrors }
          }
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

        // check for validation errors before executing command
        if (validationError) {
          return await showValidationErrors(validationError)
        }

        // normal command execution
        return baseRunner(ctx)
      })
    }
  })
}
