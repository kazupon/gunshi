/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { createCommandContext } from '@gunshi/plugin'
import {
  ARG_NEGATABLE_PREFIX,
  getCommandSubCommands,
  localizable,
  resolveArgKey,
  resolveKey,
  resolveLazyCommand
} from '@gunshi/shared'

import type { Command as TabCommand, Complete, Completion, Option, RootCommand } from '@bomb.sh/tab'
import type { Args, Command, CommandContextExtension, LazyCommand } from '@gunshi/plugin'
import type { I18nExtension } from '@gunshi/plugin-i18n'
import type { CompletionConfig, CompletionOptions } from './types.ts'

/**
 * The name of the command that this plugin adds for completion.
 */
export const COMPLETE_COMMAND_NAME = 'complete'

const NOOP_HANDLER = () => {
  return [] as Completion[]
}

/**
 * Parameters of {@linkcode registerCompletion}.
 */
export interface RegisterCompletionParams {
  /**
   * The completion root command.
   */
  t: RootCommand
  /**
   * The completion name of the command: `'entry'`, or the command path such as `'remote add'`.
   */
  name: string
  /**
   * A {@linkcode Command | command} to register.
   */
  cmd: Command | LazyCommand
  /**
   * The {@linkcode CompletionConfig | completion configurations}, keyed by completion name.
   */
  config: Record<string, CompletionConfig>
  /**
   * The i18n plugin id, used as the command context extension key.
   */
  i18nPluginId: string
  /**
   * An {@linkcode I18nExtension}, when the i18n plugin is installed.
   */
  i18n?: I18nExtension
  /**
   * Whether the command is registered as the completion root.
   */
  isBombshellRoot?: boolean
  /**
   * Whether to register the name and the description only, without options and positional arguments.
   */
  shallow?: boolean
}

/**
 * Parameters of {@linkcode registerForCompletion}.
 */
export interface RegisterForCompletionParams {
  /**
   * The completion root command.
   */
  t: RootCommand
  /**
   * The arguments to complete, as passed to `RootCommand#parse`.
   */
  args: string[]
  /**
   * The sub-commands of the CLI.
   */
  subCommands: ReadonlyMap<string, Command | LazyCommand>
  /**
   * A {@linkcode Command | command} to register as the completion root, when no entry command is found.
   */
  fallbackEntry: Command | LazyCommand
  /**
   * The {@linkcode CompletionOptions.config | completion configuration}.
   */
  config: NonNullable<CompletionOptions['config']>
  /**
   * The i18n plugin id, used as the command context extension key.
   */
  i18nPluginId: string
  /**
   * An {@linkcode I18nExtension}, when the i18n plugin is installed.
   */
  i18n?: I18nExtension
}

/**
 * Register everything a single completion request needs.
 *
 * `RootCommand#parse` looks at the completion root, at the command it matches for the arguments
 * that are already typed, and at the direct children of that command. Commands outside of them
 * cannot change the result, so registering the whole command tree would only cost time:
 * every command resolves its arguments and loads its i18n resources.
 *
 * @param params - {@linkcode RegisterForCompletionParams | Registration parameters}
 */
export async function registerForCompletion({
  t,
  args,
  subCommands,
  fallbackEntry,
  config,
  i18nPluginId,
  i18n
}: RegisterForCompletionParams): Promise<void> {
  // mirror the preamble of `RootCommand#parse`, which splits the arguments into
  // the word being completed and the words before it
  const rest = [...args]
  const endsWithSpace = rest.at(-1) === ''
  if (endsWithSpace) {
    rest.pop()
  }
  let toComplete = rest.at(-1) || ''
  const previousArgs = rest.slice(0, -1)
  if (endsWithSpace) {
    if (toComplete !== '') {
      previousArgs.push(toComplete)
    }
    toComplete = ''
  }

  // 1. the entry command, which holds the options of the CLI itself
  const entry = [...subCommands.values()].find(cmd => cmd.entry) || fallbackEntry
  const registered: TabCommand[] = [
    await registerCompletion({
      t,
      name: 'entry',
      cmd: entry,
      config,
      i18nPluginId,
      i18n,
      isBombshellRoot: true
    })
  ]

  // 2. the commands on the path that is already typed, following `RootCommand#matchCommand`:
  // an option consumes the next argument unless it is known as a boolean option
  const subConfig = config.subCommands || {}
  const path: string[] = []
  let level: ReadonlyMap<string, Command | LazyCommand> | undefined = subCommands
  let walked = true
  for (let i = 0; i < previousArgs.length; ) {
    const arg = previousArgs[i]
    if (arg.startsWith('-')) {
      i++
      if (
        !isBooleanOption(registered, arg) &&
        i < previousArgs.length &&
        !previousArgs[i].startsWith('-')
      ) {
        i++
      }
      continue
    }
    /**
     * NOTE(kazupon): `RootCommand#matchCommand` joins the words it has matched with a space
     * before looking them up, so a single quoted word can hold a whole command path.
     */
    const cmd = resolveCommandPath(level, arg.split(' '))
    if (cmd == undefined) {
      walked = false // the rest of the arguments are positional arguments
      break
    }
    path.push(arg)
    registered.push(
      await registerCompletion({
        t,
        name: path.join(' '),
        cmd,
        config: subConfig,
        i18nPluginId,
        i18n
      })
    )
    level = getCommandSubCommands(cmd)
    i++
  }

  // 3. the commands that can be completed at the cursor, with their names and descriptions only
  const lastArg = previousArgs.at(-1)
  const completesFlags =
    toComplete.startsWith('-') ||
    (!!lastArg?.startsWith('-') && !isBooleanOption(registered, lastArg))
  if (walked && !completesFlags && level) {
    for (const [name, cmd] of level) {
      if (isSkipped(name, cmd) || !name.startsWith(toComplete)) {
        continue
      }
      await registerCompletion({
        t,
        name: [...path, name].join(' '),
        cmd,
        config: subConfig,
        i18nPluginId,
        i18n,
        shallow: true
      })
    }
  }
}

/**
 * Register a command, and unless `shallow` is set, its options and positional arguments.
 *
 * @param params - {@linkcode RegisterCompletionParams | Registration parameters}
 * @returns The registered completion command
 */
export async function registerCompletion({
  t,
  name,
  cmd,
  config,
  i18nPluginId,
  i18n,
  isBombshellRoot = false,
  shallow = false
}: RegisterCompletionParams): Promise<TabCommand> {
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
    /**
     * NOTE(kazupon): `false` means the command has no resource of its own, which is normal.
     * A resource that fails to load is reported by the i18n plugin itself.
     */
    await i18n.loadResource(i18n.locale, ctx, resolvedCmd)
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
  if (shallow) {
    return commandTab
  }

  const args = resolvedCmd.args || (Object.create(null) as Args)
  for (const [key, schema] of Object.entries(args)) {
    if (schema.type === 'positional') {
      commandTab.argument(key, resolveCompletionHandler(name, key, config, i18n), schema.multiple)
    } else {
      const description =
        (await localizeDescription(resolveArgKey(key, ctx.name))) || schema.description || ''
      if (schema.type === 'boolean') {
        // no handler, which is how `Command#option` tells that the option takes no value
        commandTab.option(key, description, schema.short)
        if (schema.negatable) {
          const negatableKey = `${ARG_NEGATABLE_PREFIX}${key}`
          commandTab.option(
            negatableKey,
            (await localizeDescription(resolveArgKey(negatableKey, ctx.name))) || ''
          )
        }
      } else {
        commandTab.option(
          key,
          description,
          resolveCompletionHandler(name, key, config, i18n),
          schema.short
        )
      }
    }
  }

  return commandTab
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
 * Resolve the command a sequence of command names points at.
 *
 * @param level - The sub-commands the names start from
 * @param names - The command names, from the current level downwards
 * @returns The command, or `undefined` if any of the names does not resolve
 */
function resolveCommandPath(
  level: ReadonlyMap<string, Command | LazyCommand> | undefined,
  names: string[]
): Command | LazyCommand | undefined {
  let current: Command | LazyCommand | undefined
  let currentLevel = level
  for (const name of names) {
    const cmd = currentLevel?.get(name)
    if (cmd == undefined || isSkipped(name, cmd)) {
      return undefined
    }
    current = cmd
    currentLevel = getCommandSubCommands(cmd)
  }
  return current
}

function isSkipped(name: string, cmd: Command | LazyCommand): boolean {
  // skip entry / internal command / completion command itself
  return !!cmd.internal || !!cmd.entry || name === COMPLETE_COMMAND_NAME
}

/**
 * Whether an option is known to take no value, as `RootCommand#stripOptions` decides it:
 * the completion root first, then the commands registered so far. An unknown option takes a value.
 *
 * @param commands - The completion commands registered so far, the completion root first
 * @param arg - An option as it was typed, such as `--verbose` or `-v`
 * @returns `true` if the option takes no value
 */
function isBooleanOption(commands: TabCommand[], arg: string): boolean {
  for (const command of commands) {
    const option = findOption(command, arg)
    if (option) {
      return option.isBoolean ?? false
    }
  }
  return false
}

/**
 * The same lookup as `RootCommand#findOption`, which is private.
 *
 * @param command - A completion command to look in
 * @param arg - An option as it was typed, such as `--verbose` or `-v`
 * @returns The option, or `undefined` if the command does not have it
 */
function findOption(command: TabCommand, arg: string): Option | undefined {
  const option = command.options.get(arg) || command.options.get(arg.replace(/^-+/, ''))
  if (option) {
    return option
  }
  for (const [, candidate] of command.options) {
    if (candidate.alias && `-${candidate.alias}` === arg) {
      return candidate
    }
  }
  return undefined
}
