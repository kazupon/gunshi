/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { createCommandContext } from '@gunshi/plugin'
import { localizable, resolveArgKey, resolveKey, resolveLazyCommand } from '@gunshi/shared'

import type { Complete, Completion, RootCommand } from '@bomb.sh/tab'
import type {
  Args,
  Command,
  CommandContextExtension,
  LazyCommand,
  PluginContext
} from '@gunshi/plugin'
import type { I18nExtension } from '@gunshi/plugin-i18n'
import type { CompletionConfig } from './types.ts'

const NOOP_HANDLER = () => {
  return [] as Completion[]
}

/**
 * Register a command, its options and its positional arguments for completion.
 *
 * @param params - Registration parameters
 * @param params.name - The completion name of the command (`'entry'`, or the command path such as `'remote add'`)
 * @param params.cmd - A {@linkcode Command} to register
 * @param params.config - The {@linkcode CompletionConfig | completion configurations}, keyed by completion name
 * @param params.i18nPluginId - The i18n plugin id, used as the extension key
 * @param params.i18n - An {@linkcode I18nExtension}, when the i18n plugin is installed
 * @param params.t - The completion root command
 * @param params.isBombshellRoot - Whether the command is registered as the completion root
 */
export async function registerCompletion({
  name,
  cmd,
  config,
  i18nPluginId,
  i18n,
  t,
  isBombshellRoot = false
}: {
  name: string
  cmd: Command | LazyCommand
  config: Record<string, CompletionConfig>
  i18nPluginId: string
  i18n?: I18nExtension
  t: RootCommand
  isBombshellRoot?: boolean
}): Promise<void> {
  const resolvedCmd = await resolveLazyCommand(cmd)
  const extensions: Record<string, CommandContextExtension> = Object.create(null) as Record<
    string,
    CommandContextExtension
  >
  if (i18n) {
    extensions[i18nPluginId] = {
      key: Symbol(i18nPluginId),
      factory: () => i18n
    }
  }
  const ctx = await createCommandContext({
    args: resolvedCmd.args || (Object.create(null) as Args),
    command: resolvedCmd,
    callMode: resolvedCmd.entry ? 'entry' : 'subCommand',
    extensions
  })
  if (i18n) {
    const ret = await i18n.loadResource(i18n.locale, ctx, resolvedCmd)
    if (!ret) {
      console.warn(`Failed to load i18n resources for command: ${name} (${i18n.locale.toString()})`)
    }
  }
  const localizeDescription = localizable(ctx, resolvedCmd, i18n ? i18n.translate : undefined)

  const commandTab = isBombshellRoot
    ? t
    : t.command(
        name,
        (await localizeDescription(resolveKey('description', ctx.name))) ||
          resolvedCmd.description ||
          ''
      )

  const args = resolvedCmd.args || (Object.create(null) as Args)
  for (const [key, schema] of Object.entries(args)) {
    if (schema.type === 'positional') {
      commandTab.argument(key, resolveCompletionHandler(name, key, config, i18n), schema.multiple)
    } else {
      commandTab.option(
        key,
        (await localizeDescription(resolveArgKey(key, ctx.name))) || schema.description || '',
        resolveCompletionHandler(name, key, config, i18n),
        schema.short
      )
    }
  }
}

function resolveCompletionHandler(
  name: string,
  optionOrArgKey: string,
  config: Record<string, CompletionConfig>,
  i18n?: I18nExtension
) {
  return function (complete: Complete) {
    const handler = config[name]?.args?.[optionOrArgKey]?.handler || NOOP_HANDLER
    for (const item of handler({ locale: i18n?.locale })) {
      complete(item.value, item.description || '')
    }
  }
}

/**
 * Register sub-commands, and their nested sub-commands, for completion.
 *
 * @param t - The completion root command
 * @param subCommands - The sub-commands of the current level
 * @param i18nPluginId - The i18n plugin id, used as the extension key
 * @param config - The {@linkcode CompletionConfig | completion configurations} of sub-commands, keyed by command path
 * @param i18n - An {@linkcode I18nExtension}, when the i18n plugin is installed
 * @param parentPath - The command path of the parent command
 */
export async function handleSubCommands(
  t: RootCommand,
  subCommands: PluginContext['subCommands'],
  i18nPluginId: string,
  config: Record<string, CompletionConfig> = {},
  i18n?: I18nExtension,
  parentPath: string = ''
): Promise<void> {
  for (const [name, cmd] of subCommands) {
    if (cmd.internal || cmd.entry || name === 'complete') {
      continue // skip entry / internal command / completion command itself
    }
    const fullName = parentPath ? `${parentPath} ${name}` : name
    await registerCompletion({ name: fullName, cmd, config, i18nPluginId, i18n, t })

    // recursively register nested sub-commands
    const nestedSubCommands = getNestedSubCommands(cmd)
    if (nestedSubCommands && nestedSubCommands.size > 0) {
      await handleSubCommands(t, nestedSubCommands, i18nPluginId, config, i18n, fullName)
    }
  }
}

function getNestedSubCommands(
  cmd: Command | LazyCommand
): Map<string, Command | LazyCommand> | undefined {
  const subCommands =
    typeof cmd === 'function' ? (cmd as any).subCommands : (cmd as Command).subCommands
  if (!subCommands) {
    return undefined
  }
  if (subCommands instanceof Map) {
    return subCommands.size > 0 ? (subCommands as Map<string, Command | LazyCommand>) : undefined
  }
  if (typeof subCommands === 'object') {
    const entries = Object.entries(subCommands)
    if (entries.length === 0) {
      return undefined
    }
    const map = new Map<string, Command | LazyCommand>()
    for (const [name, c] of entries) {
      map.set(name, c as Command | LazyCommand)
    }
    return map
  }
  return undefined
}
