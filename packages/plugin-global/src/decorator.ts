/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { pluginId as Global } from './types.ts'

import { hasPriorityValidationError } from '@gunshi/plugin'

import type { CommandDecorator, DefaultGunshiParams } from '@gunshi/plugin'
import type { GlobalExtension } from './extension.ts'
import type { PluginId } from './types.ts'

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
  return baseRunner(ctx)
}

export default decorator
