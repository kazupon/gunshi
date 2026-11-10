/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { createHelpDocument } from './json.ts'

import type {
  Awaitable,
  CommandContext,
  CommandContextCore,
  DefaultGunshiParams
} from '@gunshi/plugin'

/**
 * Extended command context which provides utilities via global options plugin.
 * These utilities are available via `CommandContext.extensions['g:global']`.
 *
 * The functions that show the version, the header and the usage print with `ctx.log`. So they print
 * nothing when `ctx.log` is silenced, with `usageSilent` or when a command that spreads `jsonArgs` is
 * asked for JSON with `--json`, and return the text only.
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
 * A function that prints a line, such as `ctx.log`.
 */
export type Writer = (...args: unknown[]) => void

/**
 * Print the version of the application.
 *
 * @param ctx - The command context
 * @param write - The function to print with
 * @returns The version of the application, or `unknown` if the version is not specified
 */
export function writeVersion(ctx: CommandContextCore<DefaultGunshiParams>, write: Writer): string {
  const version = ctx.env.version || 'unknown'
  write(version)
  return version
}

/**
 * Print the usage of the application, with the header as its title.
 *
 * NOTE(kazupon): the header is the title of the usage, so it comes with the usage, wherever the usage is
 * shown: for `--help`, and when a command that takes `--help` itself shows it. It is not shown before a
 * command runs, where it would come before what the command prints, such as JSON.
 *
 * @param ctx - The command context
 * @param write - The function to print with
 * @returns The header and the usage of the application, or `undefined` if the `renderUsage` is not specified
 */
export async function writeUsage(
  ctx: CommandContextCore<DefaultGunshiParams>,
  write: Writer
): Promise<string | undefined> {
  if (ctx.env.renderUsage == null) {
    return
  }
  const usage = await ctx.env.renderUsage(ctx)
  if (!usage) {
    return
  }
  const header = ctx.env.renderHeader == null ? undefined : await ctx.env.renderHeader(ctx)
  if (header) {
    write(header)
    write() // empty line after header
  }
  write(usage)
  return header ? [header, usage].join('\n') : usage
}

/**
 * The indent of a JSON document on stdout: 2 spaces on a terminal, and one line otherwise, as the result
 * of a command is printed.
 *
 * @returns The indent for `JSON.stringify`
 */
function indentOf(): number | undefined {
  const stdout = (globalThis as { process?: { stdout?: { isTTY?: boolean } } }).process?.stdout
  return stdout?.isTTY === true ? 2 : undefined
}

/**
 * Print the version of the application as JSON: `{"version":"1.2.3"}`, and `null` when the version is not
 * specified.
 *
 * @param ctx - The command context
 * @param write - The function to print with
 * @returns The JSON that is printed
 */
export function writeVersionJson(
  ctx: CommandContextCore<DefaultGunshiParams>,
  write: Writer
): string {
  const json = JSON.stringify({ version: ctx.env.version || null }, null, indentOf())
  write(json)
  return json
}

/**
 * Print the help of the command as JSON (see {@linkcode createHelpDocument}). As with the help, nothing is
 * printed when the CLI renders no usage.
 *
 * @param ctx - The command context
 * @param write - The function to print with
 * @returns The JSON that is printed, or `undefined` if the `renderUsage` is not specified
 */
export async function writeUsageJson(
  ctx: Readonly<CommandContext<DefaultGunshiParams>>,
  write: Writer
): Promise<string | undefined> {
  if (ctx.env.renderUsage == null) {
    return
  }
  const json = JSON.stringify(await createHelpDocument(ctx), null, indentOf())
  write(json)
  return json
}

/**
 * Extends the command context for global options plugin.
 *
 * @param ctx - The {@linkcode CommandContextCore | command context} core
 * @returns An {@linkcode GlobalExtension} of global options plugin
 */
export default function extension(ctx: CommandContextCore<DefaultGunshiParams>): GlobalExtension {
  return {
    showVersion: () => writeVersion(ctx, ctx.log),

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

    showUsage: async () => await writeUsage(ctx, ctx.log),

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
