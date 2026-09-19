/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { pluginId as Global } from './types.ts'

import { hasPriorityValidationError } from '@gunshi/plugin'
import { COMMON_ARGS } from '@gunshi/shared'

import type { ArgSchema, Args, CommandDecorator, DefaultGunshiParams } from '@gunshi/plugin'
import type { GlobalExtension } from './extension.ts'
import type { PluginId } from './types.ts'

/**
 * Whether the command that is running declares an argument of its own under the name of one of the
 * global options.
 *
 * NOTE(kazupon): gunshi merges the arguments of the command over the global options, so the schema
 * that arrives under the name is the command's whenever it declares one, and `--version` then means
 * what the command says it means. The two cannot be told apart by identity, because the command
 * context copies every schema, so they are compared field by field. A command that declares a schema
 * identical to the global one is indistinguishable from it, and is left to the global option.
 *
 * @param args - The {@linkcode Args | arguments} of the command context, global options included
 * @param name - The name of a global option of this plugin
 * @returns `true` if the command declares an argument of its own under the name
 */
function isShadowedByCommand(args: Args, name: keyof typeof COMMON_ARGS): boolean {
  const schema = args[name] as ArgSchema | undefined
  if (schema === undefined) {
    return false
  }

  const globalOption = COMMON_ARGS[name] as unknown as Record<string, unknown>
  const current = schema as unknown as Record<string, unknown>
  const keys = Object.keys(globalOption)

  return (
    Object.keys(current).length !== keys.length ||
    keys.some(key => !Object.is(current[key], globalOption[key]))
  )
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
  const {
    args,
    values,
    validationError,
    extensions: {
      [Global]: { showVersion, showHeader, showUsage, showValidationErrors }
    }
  } = ctx

  if (hasPriorityValidationError(validationError)) {
    await showValidationErrors(validationError!)
    throw validationError
  }

  if (values.version && !isShadowedByCommand(args, 'version')) {
    return showVersion()
  }

  const buf: string[] = []
  const header = await showHeader()
  if (header) {
    buf.push(header)
  }

  if (values.help && !isShadowedByCommand(args, 'help')) {
    const usage = await showUsage()
    if (usage) {
      buf.push(usage)
      return buf.join('\n')
    }
    return
  }

  // check for validation errors before executing command
  if (validationError) {
    await showValidationErrors(validationError)
    throw validationError
  }

  // normal command execution
  return baseRunner(ctx)
}

export default decorator
