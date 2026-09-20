/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { ArgsValidationError, ArgsValidationErrorKeys, parseArgs, resolveArgs } from 'args-tokens'
import { ANONYMOUS_COMMAND_NAME, CLI_OPTIONS_DEFAULT, NOOP } from '../constants.ts'
import { createCommandContext } from '../context.ts'
import { createDecorators } from '../decorators.ts'
import {
  CommandNotFoundError,
  CommandNotFoundErrorKeys,
  hasPriorityValidationError
} from '../error.ts'
import { createPluginContext } from '../plugin/context.ts'
import { resolveDependencies } from '../plugin/dependency.ts'
import {
  create,
  getCommandSubCommands,
  isLazyCommand,
  kebabnize,
  resolveCommandArgs,
  resolveLazyCommand
} from '../utils.ts'

import type { Decorators } from '../decorators.ts'
import type { Plugin, PluginContext } from '../plugin.ts'
import type {
  ArgToken,
  Args,
  ArgSchema,
  CliOptions,
  Command,
  CommandCallMode,
  CommandContext,
  CommandContextExtension,
  CommandDecorator,
  CommandRunner,
  DefaultGunshiParams,
  ExtractArgs,
  GunshiParamsConstraint,
  LazyCommand
} from '../types.ts'

type InternalCliOptions<G extends GunshiParamsConstraint> = Omit<CliOptions<G>, 'subCommands'> & {
  // Internal type uses Command<G> | LazyCommand<G> for proper type safety within the implementation
  subCommands: Map<string, Command<G> | LazyCommand<G>>
  // The entry command, which is exposed as `CommandEnvironment.entryCommand`
  entryCommand: Command<G> | LazyCommand<G> | undefined
  // The global options in effect, which are exposed as `CommandEnvironment.globalOptions`
  globalOptions?: ReadonlyMap<string, ArgSchema>
}

/**
 * Run the command.
 *
 * @typeParam G - A type extending {@linkcode GunshiParams} to specify the shape of command and cli options.
 *
 * @param argv - Command line arguments
 * @param entry - A {@link Command | entry command}, an {@link CommandRunner | inline command runner}, or a {@link LazyCommand | lazily-loaded command}
 * @param options - A {@link CliOptions | CLI options}
 * @param plugins - An array of {@link Plugin | plugins} to be applied
 * @param usageOnly - Whether to render the usage of the command instead of running it, which is what `generate` of `gunshi/generator` asks for
 * @returns A rendered usage or undefined. if you will use {@link CliOptions.usageSilent} option, it will return rendered usage string.
 */
export async function cliCore<G extends GunshiParamsConstraint = DefaultGunshiParams>(
  argv: string[],
  entry: Command<G> | CommandRunner<G> | LazyCommand<G>,
  options: CliOptions<G>,
  plugins: Plugin[],
  usageOnly: boolean = false
): Promise<string | undefined> {
  const decorators = createDecorators<G>()

  /**
   * NOTE(kazupon): the decorator goes on before any plugin, which makes it the outermost one, so
   * that the usage is rendered whatever the command declares and the runner is never reached.
   */
  if (usageOnly) {
    decorators.addCommandDecorator(usageOnlyDecorator<G>())
  }

  const entryCommand = createEntryCommand(entry)

  const initialSubCommands = createInitialSubCommands(options, entryCommand)

  const pluginContext = createPluginContext<G>(decorators, initialSubCommands)

  const resolvedPlugins = await applyPlugins(pluginContext, [
    ...plugins,
    ...(options.plugins || [])
  ])

  const cliOptions = normalizeCliOptions(options, decorators, pluginContext, entryCommand)

  /**
   * NOTE(kazupon): a CLI whose user declares no sub-commands has no command tree of its own,
   * so a positional argument must not become a command name just because a plugin added a command.
   * The user can still opt out with an explicit `fallbackToEntry: false`.
   */
  if (
    initialSubCommands.size === 0 &&
    cliOptions.subCommands.size > 0 &&
    options.fallbackToEntry === undefined
  ) {
    cliOptions.fallbackToEntry = true
  }

  const tokens = parseArgs(argv)

  const resolved = resolveCommandTree(tokens, entry, cliOptions)
  const { commandName: name, command, callMode, commandPath, depth, levelSubCommands } = resolved

  let targetCommand = command
  let targetCommandName = name
  let targetCallMode = callMode
  let targetCommandPath = commandPath
  let targetDepth = depth
  let targetOmitted = resolved.omitted
  let targetLevelSubCommands = levelSubCommands
  const additionalValidationErrors: Error[] = []

  if (!targetCommand) {
    if (!resolved.parentCommand || !resolved.unresolvedCommandName) {
      throw new Error(`Command not found: ${name || ''}`)
    }

    targetCommand = resolved.parentCommand
    targetCommandName = resolved.parentCommandName
    targetCommandPath = resolved.parentCommandPath || []
    targetDepth = targetCommandPath.length
    targetCallMode = targetDepth > 0 ? 'subCommand' : 'entry'
    targetOmitted = false
    targetLevelSubCommands = resolved.parentSubCommands
    additionalValidationErrors.push(createCommandNotFoundError(resolved))
  }

  // override subCommands with level-specific sub-commands for rendering
  if (targetLevelSubCommands) {
    cliOptions.subCommands = targetLevelSubCommands
  }

  // resolve lazy commands before parsing so loader-defined args are available
  const resolvedCommand = isLazyCommand<G>(targetCommand)
    ? await resolveLazyCommand<G>(targetCommand, targetCommandName, true)
    : targetCommand

  const commandArgs = getCommandArgs(resolvedCommand)
  const args = resolveCommandArgs<ExtractArgs<G>>(pluginContext.globalOptions, commandArgs)

  /**
   * NOTE(kazupon): a plugin cannot tell on its own whether the global option it registered survived
   * the merge, so the core says which ones are in effect for this command (#745).
   */
  cliOptions.globalOptions = resolveEffectiveGlobalOptions(
    pluginContext.globalOptions,
    commandArgs,
    args
  )

  // skipPositional: how many leading positionals to skip (they're consumed as command names)
  // depth=0 → -1 (no skip), depth=1 → 0 (skip 1, existing behavior), depth=2 → 1 (skip 2), etc.
  const skipPositional = targetDepth > 0 ? targetDepth - 1 : -1

  const { explicit, values, positionals, rest, error } = resolveArgs(args, tokens, {
    shortGrouping: true,
    toKebab: resolvedCommand.toKebab,
    skipPositional
  })
  const validationError = mergeValidationErrors(error, [
    ...additionalValidationErrors,
    ...(cliOptions.strict
      ? createUnknownOptionErrors(
          findUnknownOptions(args, tokens, {
            toKebab: resolvedCommand.toKebab
          })
        )
      : [])
  ])

  const commandContext = await createCommandContext({
    args,
    explicit,
    values,
    positionals,
    rest,
    argv,
    tokens,
    omitted: targetOmitted,
    callMode: targetCallMode,
    commandPath: targetCommandPath,
    command: resolvedCommand,
    extensions: getPluginExtensions(resolvedPlugins),
    validationError,
    cliOptions: cliOptions
  })

  return await executeCommand(resolvedCommand, commandContext, decorators.commandDecorators)
}

/**
 * Create the decorator that renders the usage of the command instead of running it.
 *
 * NOTE(kazupon): `generate()` of `gunshi/generator` asks the core for a usage. It used to ask by
 * adding `-h` to the arguments, which made the answer depend on what the command calls its own
 * arguments: a command that declares one named `help` takes the schema of the global option, and
 * the usage was never rendered. A decorator is not an argument, so no command can take it away.
 *
 * @returns A {@linkcode CommandDecorator | command decorator} that renders the usage
 */
function usageOnlyDecorator<G extends GunshiParamsConstraint>(): CommandDecorator<G> {
  return () => async ctx => {
    if (hasPriorityValidationError(ctx.validationError)) {
      throw ctx.validationError!
    }

    const buf: string[] = []
    if (ctx.env.renderHeader != null) {
      const header = await ctx.env.renderHeader(ctx)
      if (header) {
        buf.push(header)
      }
    }

    if (ctx.env.renderUsage == null) {
      return
    }
    const usage = await ctx.env.renderUsage(ctx)
    if (!usage) {
      return
    }

    buf.push(usage)
    return buf.join('\n')
  }
}

async function applyPlugins<G extends GunshiParamsConstraint>(
  pluginContext: PluginContext<G>,
  plugins: Plugin[]
): Promise<Plugin[]> {
  const sortedPlugins = resolveDependencies(plugins)
  for (const plugin of sortedPlugins) {
    try {
      /**
       * NOTE(kazupon):
       * strictly `Args` are not required for plugin installation.
       * because the strictly `Args` required by each plugin are unknown,
       * and the plugin side can not know what the user will specify.
       */
      await plugin(pluginContext as unknown as PluginContext<DefaultGunshiParams>)
    } catch (error: unknown) {
      /**
       * NOTE(kazupon): a plugin that cannot be installed leaves the CLI without the options, the
       * commands and the decorators it was written to add, and the plugins behind it are not
       * installed either, while their context extensions are handed to the command all the same.
       * `resolveDependencies()` already ends the run for a circular or a missing dependency, so a
       * `setup` that throws ends it too, naming the plugin rather than leaving the failure to
       * surface somewhere else.
       */
      throw new Error(`Failed to install the plugin \`${plugin.id}\``, { cause: error })
    }
  }

  return sortedPlugins
}

/**
 * Resolve the global options that are in effect for the command being executed.
 *
 * A global option is in effect unless the command declares an argument of its own under the same
 * name, which replaces it. The schema is taken from the merged arguments, so it is the one in effect.
 *
 * @param globalOptions - The global options that plugins registered with `addGlobalOption`
 * @param commandArgs - The arguments that the command declares
 * @param args - The merged arguments
 * @returns The global options in effect, keyed by name
 */
function resolveEffectiveGlobalOptions<G extends GunshiParamsConstraint>(
  globalOptions: ReadonlyMap<string, ArgSchema>,
  commandArgs: ExtractArgs<G>,
  args: ExtractArgs<G>
): ReadonlyMap<string, ArgSchema> {
  const effective = new Map<string, ArgSchema>()
  for (const name of globalOptions.keys()) {
    // an own property only: a command declares its arguments, it does not inherit them
    if (!Object.hasOwn(commandArgs, name)) {
      effective.set(name, args[name])
    }
  }
  return effective
}

function getCommandArgs<G extends GunshiParamsConstraint>(
  cmd?: Command<G> | LazyCommand<G>
): ExtractArgs<G> {
  if (isLazyCommand<G>(cmd)) {
    return cmd.args || create<ExtractArgs<G>>()
  } else if (typeof cmd === 'object') {
    return cmd.args || create<ExtractArgs<G>>()
  } else {
    return create<ExtractArgs<G>>()
  }
}

type UnknownOption = {
  rawName: string
  name: string
  candidates: readonly string[]
}

type StrictOptionValidationOptions = {
  toKebab?: boolean
}

const NEGATABLE_OPTION_PREFIX = 'no-'

function findUnknownOptions(
  args: Args,
  tokens: ArgToken[],
  options: StrictOptionValidationOptions
): UnknownOption[] {
  const knownLongOptions = new Set<string>()
  const knownShortOptions = new Set<string>()
  const knownNegatableOptions = new Set<string>()
  const knownLongOptionCandidates = new Set<string>()
  const longOptionCandidates: string[] = []

  function addLongOptionCandidate(name: string): void {
    const candidate = `--${name}`
    if (knownLongOptionCandidates.has(candidate)) {
      return
    }
    knownLongOptionCandidates.add(candidate)
    longOptionCandidates.push(candidate)
  }

  for (const [name, schema] of Object.entries(args)) {
    if (schema.type === 'positional') {
      continue
    }

    const optionName = resolveOptionName(name, schema, options)
    knownLongOptions.add(optionName)
    /**
     * NOTE(kazupon): a hidden option is still accepted, so it stays a known option. It is left out
     * of the candidates, which are what `@gunshi/plugin-suggestion` offers as "Did you mean".
     */
    if (!schema.hidden) {
      addLongOptionCandidate(optionName)
    }

    if (schema.short) {
      knownShortOptions.add(schema.short)
    }

    if (schema.type === 'boolean' && schema.negatable) {
      const negatableOptionName = `${NEGATABLE_OPTION_PREFIX}${optionName}`
      knownNegatableOptions.add(negatableOptionName)
      if (!schema.hidden) {
        addLongOptionCandidate(negatableOptionName)
      }
    }
  }

  const unknownOptions: UnknownOption[] = []
  for (const token of tokens) {
    if (token.kind === 'option-terminator') {
      break
    }

    if (token.kind !== 'option' || !token.name || !token.rawName) {
      continue
    }

    const isLongOption = token.rawName.startsWith('--')
    if (isLongOption) {
      if (knownLongOptions.has(token.name) || knownNegatableOptions.has(token.name)) {
        continue
      }
    } else if (knownShortOptions.has(token.name)) {
      continue
    }

    unknownOptions.push({
      rawName: token.rawName,
      name: token.name,
      candidates: isLongOption ? longOptionCandidates : []
    })
  }

  return unknownOptions
}

function resolveOptionName(
  name: string,
  schema: ArgSchema,
  options: StrictOptionValidationOptions
): string {
  return options.toKebab || schema.toKebab ? kebabnize(name) : name
}

function createUnknownOptionErrors(unknownOptions: UnknownOption[]): ArgsValidationError[] {
  return unknownOptions.map(({ rawName, name, candidates }) => {
    return new ArgsValidationError(`Unknown option: ${rawName}`, {
      code: ArgsValidationErrorKeys.unknownOption,
      values: {
        rawName,
        name,
        candidates
      }
    })
  })
}

function mergeValidationErrors(
  error: AggregateError | undefined,
  additionalErrors: Error[]
): AggregateError | undefined {
  if (additionalErrors.length === 0) {
    return error
  }

  return new AggregateError(
    error ? [...error.errors, ...additionalErrors] : additionalErrors,
    error?.message || additionalErrors[0]?.message
  )
}

const isObject = (val: unknown): val is Record<any, any> => val !== null && typeof val === 'object'

/**
 * Create the entry command that sub-commands and plugins can see.
 * The user-provided entry is copied, so that marking it with `entry: true` does not mutate it.
 *
 * @param entryCmd - The entry that is passed to `cli`
 * @returns The entry command marked with `entry: true`, or `undefined` if the entry is not a command
 */
function createEntryCommand<G extends GunshiParamsConstraint>(
  entryCmd: Command<G> | CommandRunner<G> | LazyCommand<G>
): Command<G> | LazyCommand<G> | undefined {
  if (isLazyCommand<G>(entryCmd)) {
    // for lazy command - copy properties onto a new function to avoid mutating the original
    return Object.assign((...args: unknown[]) => (entryCmd as Function)(...args), entryCmd, {
      entry: true
    }) as unknown as LazyCommand<G>
  } else if (typeof entryCmd === 'object') {
    // for command object - shallow copy to avoid mutating the user-provided object
    return Object.assign(create<Command<G>>(), entryCmd, { entry: true }) as Command<G>
  } else if (typeof entryCmd === 'function') {
    // for command runner
    return { run: entryCmd, name: entryCmd.name || ANONYMOUS_COMMAND_NAME, entry: true }
  }
  return undefined
}

function createInitialSubCommands<G extends GunshiParamsConstraint>(
  options: CliOptions<G>,
  entryCommand: Command<G> | LazyCommand<G> | undefined
): Map<string, Command<G> | LazyCommand<G>> {
  const hasSubCommands = options.subCommands
    ? options.subCommands instanceof Map
      ? options.subCommands.size > 0
      : isObject(options.subCommands) && Object.keys(options.subCommands).length > 0
    : false

  // NOTE(kazupon): SubCommandable is intentionally loose to accept any command type from user code.
  // We cast to Command<G> | LazyCommand<G> here since we know the runtime structure is valid.
  const subCommands = new Map<string, Command<G> | LazyCommand<G>>(
    options.subCommands instanceof Map
      ? (options.subCommands as Map<string, Command<G> | LazyCommand<G>>)
      : []
  )
  if (!(options.subCommands instanceof Map) && isObject(options.subCommands)) {
    for (const [name, cmd] of Object.entries(options.subCommands)) {
      subCommands.set(name, cmd as Command<G> | LazyCommand<G>)
    }
  }

  // add entry command to sub commands if there are sub commands
  if (hasSubCommands && entryCommand) {
    subCommands.set(resolveEntryName(entryCommand), entryCommand)
  }

  return subCommands
}

function normalizeCliOptions<G extends GunshiParamsConstraint>(
  options: CliOptions<G>,
  decorators: Decorators<G>,
  pluginContext: PluginContext<G>,
  entryCommand: Command<G> | LazyCommand<G> | undefined
): InternalCliOptions<G> {
  // get the latest sub commands from plugin context (already includes entry command)
  const subCommands = new Map(pluginContext.subCommands)

  /**
   * NOTE(kazupon): the entry command is part of `subCommands` only when the user passes sub-commands,
   * so it is exposed on its own for the plugins that add commands to a CLI without sub-commands.
   */
  const resolvedOptions = Object.assign(create<CliOptions<G>>(), CLI_OPTIONS_DEFAULT, options, {
    subCommands,
    entryCommand
  }) as InternalCliOptions<G>

  // set default renderers if not provided via cli options
  if (resolvedOptions.renderHeader === undefined) {
    resolvedOptions.renderHeader = decorators.getHeaderRenderer()
  }
  if (resolvedOptions.renderUsage === undefined) {
    resolvedOptions.renderUsage = decorators.getUsageRenderer()
  }
  if (resolvedOptions.renderValidationErrors === undefined) {
    resolvedOptions.renderValidationErrors = decorators.getValidationErrorsRenderer()
  }

  return resolvedOptions
}

function getPositionalTokens(tokens: ArgToken[]): string[] {
  return tokens
    .filter(t => t.kind === 'positional')
    .map(t => t.value)
    .filter((v): v is string => !!v)
}

type ResolveCommandContext<G extends GunshiParamsConstraint = DefaultGunshiParams> = {
  commandName?: string | undefined
  command?: Command<G> | LazyCommand<G> | undefined
  callMode: CommandCallMode
  commandPath: string[]
  depth: number
  omitted: boolean
  levelSubCommands: Map<string, Command<G> | LazyCommand<G>> | undefined
  unresolvedCommandName?: string | undefined
  parentCommand?: Command<G> | LazyCommand<G> | undefined
  parentCommandName?: string | undefined
  parentCommandPath?: string[] | undefined
  parentSubCommands?: Map<string, Command<G> | LazyCommand<G>> | undefined
}

function resolveCommandTree<G extends GunshiParamsConstraint>(
  tokens: ArgToken[],
  entry: Command<G> | CommandRunner<G> | LazyCommand<G>,
  options: InternalCliOptions<G>
): ResolveCommandContext<G> {
  const positionals = getPositionalTokens(tokens)

  function resolveAsEntry(): ResolveCommandContext<G> {
    if (typeof entry === 'function') {
      if (isLazyCommand<G>(entry)) {
        // lazy command
        return {
          commandName: resolveEntryName(entry),
          command: entry,
          callMode: 'entry',
          commandPath: [],
          depth: 0,
          omitted: options.subCommands.size > 0 && !positionals[0],
          levelSubCommands: options.subCommands.size > 0 ? options.subCommands : undefined
        }
      } else {
        // inline command (command runner)
        return {
          command: { run: entry as CommandRunner<G>, entry: true } as Command<G>,
          callMode: 'entry',
          commandPath: [],
          depth: 0,
          omitted: options.subCommands.size > 0 && !positionals[0],
          levelSubCommands: options.subCommands.size > 0 ? options.subCommands : undefined
        }
      }
    } else if (typeof entry === 'object') {
      // command object
      return {
        commandName: resolveEntryName(entry),
        command: entry,
        callMode: 'entry',
        commandPath: [],
        depth: 0,
        omitted: options.subCommands.size > 0 && !positionals[0],
        levelSubCommands: options.subCommands.size > 0 ? options.subCommands : undefined
      }
    } else {
      return {
        callMode: 'unexpected',
        commandPath: [],
        depth: 0,
        omitted: false,
        levelSubCommands: undefined
      }
    }
  }

  // no positionals or no top-level subCommands → resolve as entry
  if (positionals.length === 0 || options.subCommands.size === 0) {
    return resolveAsEntry()
  }

  // walk the command tree
  let currentSubCommands: Map<string, Command<G> | LazyCommand<G>> = options.subCommands
  let resolvedCommand: Command<G> | LazyCommand<G> | undefined
  let resolvedName: string | undefined
  const commandPath: string[] = []
  let depth = 0

  for (let i = 0; i < positionals.length; i++) {
    const token = positionals[i]
    const cmd = currentSubCommands.get(token)

    if (cmd == null) {
      if (depth === 0) {
        // no match at top level
        if (options.fallbackToEntry) {
          return resolveAsEntry()
        }
        const parent = resolveAsEntry()
        return {
          commandName: token,
          callMode: 'unexpected',
          commandPath: [],
          depth: 0,
          omitted: false,
          levelSubCommands: undefined,
          unresolvedCommandName: token,
          parentCommand: parent.command,
          parentCommandName: parent.commandName,
          parentCommandPath: [],
          parentSubCommands: options.subCommands
        }
      }
      return {
        commandName: token,
        callMode: 'unexpected',
        commandPath: [...commandPath],
        depth,
        omitted: false,
        levelSubCommands: undefined,
        unresolvedCommandName: token,
        parentCommand: resolvedCommand,
        parentCommandName: resolvedName,
        parentCommandPath: [...commandPath],
        parentSubCommands: currentSubCommands
      }
    }

    // resolve command name if missing - shallow copy to avoid mutating user objects
    let resolved: Command<G> | LazyCommand<G> = cmd
    if (typeof cmd === 'function' && (cmd as any).commandName == null) {
      const copy = Object.assign((...args: unknown[]) => (cmd as Function)(...args), cmd, {
        commandName: token
      }) as unknown as LazyCommand<G>
      resolved = copy
    } else if (typeof cmd === 'object' && cmd.name == null) {
      resolved = Object.assign(create<Command<G>>(), cmd, { name: token }) as Command<G>
    }

    resolvedCommand = resolved
    resolvedName = token
    commandPath.push(token)
    depth++

    // check if the matched command has its own nested subCommands
    const nestedSubCommands = getCommandSubCommands<G>(cmd)
    if (nestedSubCommands && nestedSubCommands.size > 0) {
      currentSubCommands = nestedSubCommands
      // continue to next positional to check for deeper nesting
    } else {
      // leaf command, stop exploring
      break
    }
  }

  if (!resolvedCommand) {
    return resolveAsEntry()
  }

  // determine omitted: resolved command has children but no more positional matched any child
  const resolvedSubCommands = getCommandSubCommands<G>(resolvedCommand)
  const omitted = resolvedSubCommands != null && resolvedSubCommands.size > 0

  // build levelSubCommands for the resolved level
  let levelSubCommands: Map<string, Command<G> | LazyCommand<G>> | undefined
  if (omitted && resolvedSubCommands) {
    levelSubCommands = new Map(resolvedSubCommands)
    // add a shallow copy of the resolved command as entry to avoid mutating the original
    let entryCopy: Command<G> | LazyCommand<G>
    if (typeof resolvedCommand === 'function') {
      // lazy command - create a delegating wrapper to preserve callable nature
      entryCopy = Object.assign(
        (...args: unknown[]) => (resolvedCommand as Function)(...args),
        resolvedCommand,
        { entry: true }
      ) as unknown as LazyCommand<G>
    } else {
      // command object
      entryCopy = Object.assign(create<Command<G>>(), resolvedCommand, {
        entry: true
      }) as Command<G>
    }
    levelSubCommands.set(resolvedName || resolveEntryName(entryCopy), entryCopy)
  }

  return {
    commandName: resolvedName,
    command: resolvedCommand,
    callMode: depth > 0 ? 'subCommand' : 'entry',
    commandPath,
    depth,
    omitted,
    levelSubCommands
  }
}

function createCommandNotFoundError<G extends GunshiParamsConstraint>(
  resolved: ResolveCommandContext<G>
): CommandNotFoundError {
  const commandName = resolved.unresolvedCommandName || resolved.commandName || ''
  return new CommandNotFoundError(`Command not found: ${commandName}`, {
    code: CommandNotFoundErrorKeys.notFound,
    values: {
      commandName
    },
    commandName,
    candidates: [...(resolved.parentSubCommands?.keys() || [])],
    commandPath: resolved.parentCommandPath || []
  })
}

function resolveEntryName<G extends GunshiParamsConstraint>(
  entry: Command<G> | LazyCommand<G>
): string {
  return isLazyCommand<G>(entry)
    ? entry.commandName || ANONYMOUS_COMMAND_NAME
    : entry.name || ANONYMOUS_COMMAND_NAME
}

function getPluginExtensions(plugins: Plugin[]): Record<string, CommandContextExtension> {
  const extensions = create<Record<string, CommandContextExtension>>()
  for (const plugin of plugins) {
    if (plugin.extension) {
      const key = plugin.id
      if (extensions[key]) {
        console.warn(
          `Plugin "${key}" is already installed. Ignore it for command context extending.`
        )
      } else {
        extensions[key] = plugin.extension
      }
    }
  }
  return extensions
}

async function executeCommand<G extends GunshiParamsConstraint = DefaultGunshiParams>(
  cmd: Command<G>,
  ctx: Readonly<CommandContext<G>>,
  decorators: Readonly<CommandDecorator<G>[]>
): Promise<string | undefined> {
  const commandRunner = cmd.run || NOOP
  const baseRunner: CommandRunner<G> = ctx => {
    if (hasPriorityValidationError(ctx.validationError)) {
      throw ctx.validationError
    }
    return commandRunner(ctx)
  }

  // apply plugin decorators
  const decoratedRunner = decorators.reduceRight(
    (runner, decorator) => decorator(runner),
    baseRunner
  )

  try {
    // execute onBeforeCommand hook
    if (ctx.env.onBeforeCommand) {
      await ctx.env.onBeforeCommand(ctx)
    }

    // execute decorated runner
    const result = await decoratedRunner(ctx)

    // execute onAfterCommand hook only on success
    if (ctx.env.onAfterCommand) {
      await ctx.env.onAfterCommand(ctx, result as string | undefined)
    }

    // return string if one was returned
    return typeof result === 'string' ? result : undefined
  } catch (error) {
    // execute onErrorCommand hook
    if (ctx.env.onErrorCommand) {
      try {
        await ctx.env.onErrorCommand(ctx, error as Error)
      } catch (hookError) {
        // log but don't swallow the original error
        console.error('Error in onErrorCommand hook:', hookError)
      }
    }
    throw error
  }
}
