/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { createCommandContext } from '@gunshi/plugin'
import {
  ARG_NEGATABLE_PREFIX,
  getCommandSubCommands,
  kebabnize,
  localizable,
  resolveArgKey,
  resolveCommandArgs,
  resolveKey,
  resolveLazyCommand
} from '@gunshi/shared'

import type { Command as TabCommand, Complete, Completion, Option, RootCommand } from '@bomb.sh/tab'
import type { Args, ArgSchema, Command, CommandContextExtension, LazyCommand } from '@gunshi/plugin'
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
 * The name of the command that holds the options of `hidden` arguments.
 *
 * `@bomb.sh/tab` has no notion of a hidden option, and an option that it does not know is taken
 * for one that takes a value, so it swallows the word after it (#710). A command whose name is
 * the empty string is skipped when the candidates are listed, while the arity of an option is
 * looked up in every registered command. Registering a hidden option there keeps it out of the
 * candidates without losing its arity.
 */
const HIDDEN_HOLDER_NAME = ''

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
  /**
   * Whether to run the loader of a lazy command whose definition has no `args`,
   * so that the arguments of the command that the loader returns are registered.
   */
  load?: boolean
  /**
   * The global options, which gunshi merges into the arguments of the command that it runs.
   */
  globalOptions?: ReadonlyMap<string, ArgSchema>
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
  /**
   * The global options, which gunshi merges into the arguments of the command that it runs.
   */
  globalOptions?: ReadonlyMap<string, ArgSchema>
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
 * @returns The request as it was registered, which is what {@linkcode RootCommand.parse} has to be
 *          given so that it matches the same command
 */
export async function registerForCompletion({
  t,
  args,
  subCommands,
  fallbackEntry,
  config,
  i18nPluginId,
  i18n,
  globalOptions
}: RegisterForCompletionParams): Promise<string[]> {
  const resolvedArgs = stripLeadingEmptyWords(args)
  // mirror the preamble of `RootCommand#parse`, which splits the arguments into
  // the word being completed and the words before it
  const rest = [...resolvedArgs]
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
      isBombshellRoot: true,
      load: !isFollowedBySubCommand(previousArgs[0], subCommands, true),
      globalOptions
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
        !isBooleanOption(t, registered, arg) &&
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
    const cmd = resolveCommandPath(level, arg.split(' '), path.length === 0)
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
        i18n,
        load: !isFollowedBySubCommand(previousArgs[i + 1], getCommandSubCommands(cmd), false),
        globalOptions
      })
    )
    level = getCommandSubCommands(cmd)
    i++
  }

  // 3. the commands that can be completed at the cursor, with their names and descriptions only
  const lastArg = previousArgs.at(-1)
  const completesFlags =
    toComplete.startsWith('-') ||
    (!!lastArg?.startsWith('-') && !isBooleanOption(t, registered, lastArg))
  if (walked && !completesFlags && level) {
    for (const [name, cmd] of level) {
      if (isSkipped(name, cmd, path.length === 0) || !name.startsWith(toComplete)) {
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

  return resolvedArgs
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
  shallow = false,
  load = false,
  globalOptions
}: RegisterCompletionParams): Promise<TabCommand> {
  const resolvedCmd = await resolveCommand(
    cmd,
    // the completion root is not registered under its own name
    isBombshellRoot ? undefined : name.split(' ').at(-1),
    load && !shallow
  )
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
  // the arguments as gunshi resolves them to run the command, with the global options merged in
  const args: Args = resolveCommandArgs(globalOptions, resolvedCmd.args)
  const ctx = await createCommandContext({
    args,
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

  for (const [key, schema] of Object.entries(args)) {
    const hidden = schema.hidden === true
    if (schema.type === 'positional') {
      /**
       * NOTE(kazupon): the argument keeps its place, so that the positions of the arguments after it
       * do not shift, but a hidden one completes no values.
       */
      commandTab.argument(
        key,
        hidden ? undefined : resolveCompletionHandler(name, key, config, i18n),
        schema.multiple
      )
    } else {
      /**
       * NOTE(kazupon): the option is registered with the name that gunshi parses and renders,
       * which is kebab-cased with `toKebab`. The key of the argument still looks up everything else:
       * the description, the i18n resource and the completion handler of the user's configuration.
       */
      const optionName = ctx.toKebab || schema.toKebab ? kebabnize(key) : key
      const target = hidden ? resolveHiddenHolder(t) : commandTab
      const description = hidden
        ? ''
        : (await localizeDescription(resolveArgKey(key, ctx.name))) || schema.description || ''
      if (schema.type === 'boolean') {
        // no handler, which is how `Command#option` tells that the option takes no value
        target.option(optionName, description, schema.short)
        if (schema.negatable) {
          target.option(
            `${ARG_NEGATABLE_PREFIX}${optionName}`,
            hidden
              ? ''
              : (await localizeDescription(
                  resolveArgKey(`${ARG_NEGATABLE_PREFIX}${key}`, ctx.name)
                )) || ''
          )
        }
      } else {
        target.option(
          optionName,
          description,
          resolveCompletionHandler(name, key, config, i18n),
          schema.short
        )
      }
    }
  }

  return commandTab
}

/**
 * Resolve a command for completion.
 *
 * A lazy command is resolved from the definition that is given to `lazy`, without running its loader.
 * When the definition has no `args`, they can only come from the command that the loader returns,
 * which is what gunshi resolves to run the command and to render its usage, so the loader runs if `load` is set.
 *
 * @param cmd - A command to resolve
 * @param key - The name that the command is registered with in its parent, if any
 * @param load - Whether to run the loader of a lazy command whose definition has no `args`
 * @returns The resolved command
 */
async function resolveCommand(
  cmd: Command | LazyCommand,
  key: string | undefined,
  load: boolean
): Promise<Command> {
  if (load && typeof cmd === 'function' && cmd.args == undefined) {
    // a lazy command without a definition is named after its key, like gunshi does to run it
    const commandName = cmd.commandName || key
    const lazyCmd = cmd.commandName
      ? cmd
      : (Object.assign((...args: unknown[]) => (cmd as Function)(...args), cmd, {
          commandName
        }) as unknown as LazyCommand)
    try {
      return await resolveLazyCommand(lazyCmd, commandName, true)
    } catch {
      /**
       * NOTE(kazupon): a loader that fails is reported when the command runs.
       * A completion request falls back to the definition, and stays quiet, because not every shell discards stderr.
       */
    }
  }
  return await resolveLazyCommand(cmd)
}

/**
 * Whether the word after a command is one of its sub-commands.
 * The arguments of such a command cannot change the result: it is not the command that is completed,
 * and no option that would have to be looked up in it comes before the sub-command.
 *
 * @param next - The word after the command, if any
 * @param level - The sub-commands of the command
 * @param topLevel - Whether `level` is the top level of the CLI, where the completion command lives
 * @returns `true` if the word resolves to a sub-command
 */
function isFollowedBySubCommand(
  next: string | undefined,
  level: ReadonlyMap<string, Command | LazyCommand> | undefined,
  topLevel: boolean
): boolean {
  return (
    next != undefined &&
    !next.startsWith('-') &&
    resolveCommandPath(level, next.split(' '), topLevel) != undefined
  )
}

/**
 * Resolve the command that holds the options of `hidden` arguments, creating it if needed.
 *
 * @param t - The completion root command
 * @returns The {@linkcode HIDDEN_HOLDER_NAME | holder} command
 */
function resolveHiddenHolder(t: RootCommand): TabCommand {
  return t.commands.get(HIDDEN_HOLDER_NAME) || t.command(HIDDEN_HOLDER_NAME, '')
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
 * @param topLevel - Whether `level` is the top level of the CLI, where the completion command lives
 * @returns The command, or `undefined` if any of the names does not resolve
 */
function resolveCommandPath(
  level: ReadonlyMap<string, Command | LazyCommand> | undefined,
  names: string[],
  topLevel: boolean
): Command | LazyCommand | undefined {
  let current: Command | LazyCommand | undefined
  let currentLevel = level
  for (const [index, name] of names.entries()) {
    const cmd = currentLevel?.get(name)
    if (cmd == undefined || isSkipped(name, cmd, topLevel && index === 0)) {
      return undefined
    }
    current = cmd
    currentLevel = getCommandSubCommands(cmd)
  }
  return current
}

function isSkipped(name: string, cmd: Command | LazyCommand, topLevel: boolean): boolean {
  // skip entry / internal command, and the completion command itself, which only lives at the top level
  return !!cmd.internal || !!cmd.entry || (topLevel && name === COMPLETE_COMMAND_NAME)
}

/**
 * Drop the empty words that a completion request starts with.
 *
 * `RootCommand#matchCommand` joins the words it has matched with a space and looks the result up
 * among the registered commands, so a request whose first word is empty resolves to the command that
 * holds the options of `hidden` arguments, and those options become the only thing completed.
 * An empty word is never a command name. The word the cursor is on is always kept.
 *
 * @param args - The words of a completion request
 * @returns The words without the empty ones they start with
 */
function stripLeadingEmptyWords(args: string[]): string[] {
  let index = 0
  while (index < args.length - 1 && args[index] === '') {
    index++
  }
  return index === 0 ? args : args.slice(index)
}

/**
 * Whether an option is known to take no value, as `RootCommand#stripOptions` decides it:
 * the completion root first, then the commands registered so far. An unknown option takes a value.
 *
 * @param t - The completion root command, which holds the options of `hidden` arguments
 * @param commands - The completion commands registered so far, the completion root first
 * @param arg - An option as it was typed, such as `--verbose` or `-v`
 * @returns `true` if the option takes no value
 */
function isBooleanOption(t: RootCommand, commands: TabCommand[], arg: string): boolean {
  for (const command of commands) {
    const option = findOption(command, arg)
    if (option) {
      return option.isBoolean ?? false
    }
  }
  /**
   * NOTE(kazupon): the options of `hidden` arguments live on the holder, which is not one of the
   * commands that are registered along the typed path. `RootCommand#stripOptions` finds them all
   * the same, so this walk has to as well: a hidden boolean option that reads as taking a value
   * swallows the word after it, and the command behind it is never registered (#710).
   */
  const holder = t.commands.get(HIDDEN_HOLDER_NAME)
  const hiddenOption = holder && findOption(holder, arg)
  return hiddenOption ? (hiddenOption.isBoolean ?? false) : false
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
