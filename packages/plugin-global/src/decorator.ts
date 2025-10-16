/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { pluginId as Global } from './types.ts'

import type { CommandDecorator, DefaultGunshiParams } from '@gunshi/plugin'
import type { GlobalExtension } from './extension.ts'
import type { PluginId } from './types.ts'

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
    values,
    validationError,
    extensions: {
      [Global]: { showVersion, showHeader, showUsage, showValidationErrors }
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
}

export default decorator
