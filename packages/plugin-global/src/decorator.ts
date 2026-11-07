/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { pluginId as Global } from './types.ts'

import { hasPriorityValidationError, isCommandError } from '@gunshi/plugin'
import { DefaultResource, namespacedId, resolveBuiltInKey } from '@gunshi/shared'

import type { CommandDecorator, CommandError, DefaultGunshiParams } from '@gunshi/plugin'
import type { GlobalExtension } from './extension.ts'
import type { PluginId } from './types.ts'

/**
 * The id of the i18n plugin, which translates the heading of the causes of a {@linkcode CommandError}.
 */
const I18n = namespacedId('i18n')

/**
 * The key of the built-in resource for the heading of the causes of a {@linkcode CommandError}.
 */
const CAUSED_BY = resolveBuiltInKey('CAUSEDBY')

/**
 * The key of the registry in which the core keeps, for the command context of each run, the set of the
 * errors that have been reported to the user. An error in the set tells `cli()` to end without
 * rejecting. The errors are frozen with the command context, so they are not marked themselves. The key
 * is a registered symbol, since `gunshi` and the plugins bundle their own copies.
 */
const REPORTED = Symbol.for('gunshi.reported')

/**
 * Mark an error as reported to the user, in the set that the core keeps for the run of the context.
 *
 * @param ctx - The command context of the run
 * @param error - The error that has been reported
 * @returns `true` if the error is marked, `false` if the core keeps no set for the run
 */
function markReported(ctx: object, error: object): boolean {
  const registry = (
    globalThis as unknown as Record<symbol, WeakMap<object, WeakSet<object>> | undefined>
  )[REPORTED]
  const reported = registry?.get(ctx)
  if (reported === undefined) {
    return false
  }
  reported.add(error)
  return true
}

/**
 * Set the exit code of the process, where the runtime has one (Node.js and Bun have `process`).
 * The core does not call the APIs of a runtime, so the plugin, which reports the errors, sets it.
 *
 * @param code - The exit code
 */
function setExitCode(code: number): void {
  const proc = (globalThis as { process?: { exitCode?: number | string } }).process
  if (proc != null && typeof proc === 'object') {
    proc.exitCode = code
  }
}

/**
 * Translate the heading of the causes of a {@linkcode CommandError}, with the i18n plugin when it is
 * installed.
 *
 * NOTE(kazupon): the i18n plugin depends on this plugin, so this plugin cannot depend on it, and reads
 * its extension as the renderer plugin does. The i18n plugin translates a built-in key that the
 * resources of the app lack in English, and an older one returns the key itself: then the heading is
 * the English one of this plugin.
 *
 * @param extensions - The extensions of the command context
 * @returns The heading
 */
function translateCausedBy(extensions: object): string {
  const i18n = (extensions as Record<string, { translate?: (key: string) => string } | undefined>)[
    I18n
  ]
  const heading = i18n?.translate?.(CAUSED_BY)
  return heading && heading !== CAUSED_BY ? heading : DefaultResource.CAUSEDBY
}

/**
 * Get the message of a cause of a {@linkcode CommandError}. A cause may be any value: a value without a
 * message, such as a string, is converted to a string.
 *
 * @param cause - The cause
 * @returns The message of the cause
 */
function messageOf(cause: unknown): string {
  const message = (cause as { message?: unknown }).message
  if (typeof message === 'string' && message !== '') {
    return message
  }
  try {
    return String(cause)
  } catch {
    // an object without a prototype has no `toString`
    return Object.prototype.toString.call(cause)
  }
}

/**
 * Render a {@linkcode CommandError} for the user: its message, followed by a `Caused by:` line for each
 * cause in the chain. The stack traces and the code are not rendered.
 *
 * @param error - The error
 * @param extensions - The extensions of the command context, to translate the heading of the causes
 * @returns The rendered error
 */
function renderCommandError(error: CommandError, extensions: object): string {
  const lines = [error.message]
  let cause: unknown = error.cause
  if (cause != null) {
    const heading = translateCausedBy(extensions)
    // a cause may point back to an error in the chain
    const seen = new Set<unknown>([error])
    // a cause may be any value, with a getter that throws: the chain ends there, and the error is
    // still reported
    while (cause != null && !seen.has(cause)) {
      seen.add(cause)
      try {
        lines.push(`${heading}: ${messageOf(cause)}`)
        cause = typeof cause === 'object' ? (cause as { cause?: unknown }).cause : undefined
      } catch {
        break
      }
    }
  }
  return lines.join('\n')
}

/**
 * Decorator function to extend the command with global options.
 *
 * @param baseRunner - The base command runner
 * @returns A command decorator that adds global options handling
 */
const decorator: CommandDecorator<{
  args: DefaultGunshiParams['args']
  extensions: Record<PluginId, GlobalExtension>
}> = baseRunner => async ctx => {
  /**
   * NOTE(kazupon): the core puts the globals still in effect on `env.globalOptions`. A command that
   * declares the same name — even with an identical schema — is not in that map, so `--version` /
   * `--help` belong to the command.
   */
  const {
    values,
    validationError,
    env: { globalOptions },
    extensions: {
      [Global]: { showVersion, showUsage, showValidationErrors }
    }
  } = ctx

  /**
   * NOTE(kazupon): when the plugin has shown the validation errors to the user, they have been
   * reported: the exit code is 1, and `cli()` ends without rejecting, as the other CLI libraries end
   * without a stack trace. They are still thrown, so that the `onErrorCommand` hook sees them. When
   * nothing was shown (`renderValidationErrors: null`, an empty message, or `usageSilent`), `cli()`
   * rejects with them, for the app to report them. So it does when the core keeps no set of reported
   * errors for the run, and then the exit code is left alone.
   *
   * @param error - The aggregate error of the validation errors
   */
  const report = async (error: AggregateError): Promise<never> => {
    const message = await showValidationErrors(error)
    if (message && !ctx.env.usageSilent && markReported(ctx, error)) {
      setExitCode(1)
    }
    throw error
  }

  if (hasPriorityValidationError(validationError)) {
    return await report(validationError!)
  }

  if (values.version && globalOptions?.has('version')) {
    return showVersion()
  }

  if (values.help && globalOptions?.has('help')) {
    return await showUsage()
  }

  // check for validation errors before executing command
  if (validationError) {
    return await report(validationError)
  }

  // normal command execution
  try {
    return await baseRunner(ctx)
  } catch (error: unknown) {
    /**
     * NOTE(kazupon): a `CommandError` thrown from the command, or from a decorator of another plugin, is
     * a failure that the command expects. It is reported as the validation errors are: the message is
     * printed to stderr without a stack trace, the exit code is the one of the error, and `cli()` ends
     * without rejecting. It is still thrown, so that the `onErrorCommand` hook sees it after the exit
     * code is set. With `usageSilent`, nothing is printed, and `cli()` rejects with it, for the app to
     * report it. Any other error is thrown as before, and `cli()` rejects with it.
     */
    if (isCommandError(error) && !ctx.env.usageSilent) {
      console.error(renderCommandError(error, ctx.extensions))
      if (markReported(ctx, error)) {
        setExitCode(error.exitCode)
      }
    }
    throw error
  }
}

export default decorator
