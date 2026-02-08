/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { parseArgs, resolveArgs } from 'args-tokens'
import { ANONYMOUS_COMMAND_NAME, CLI_OPTIONS_DEFAULT, NOOP } from '../constants.ts'
import { createCommandContext } from '../context.ts'
import { createDecorators } from '../decorators.ts'
import { createPluginContext } from '../plugin/context.ts'
import { resolveDependencies } from '../plugin/dependency.ts'
import { create, getCommandSubCommands, isLazyCommand, resolveLazyCommand } from '../utils.ts'

import type { Decorators } from '../decorators.ts'
import type { Plugin, PluginContext } from '../plugin.ts'
import type {
  ArgToken,
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
 * @returns A rendered usage or undefined. if you will use {@link CliOptions.usageSilent} option, it will return rendered usage string.
 */
export async function cliCore<G extends GunshiParamsConstraint = DefaultGunshiParams>(
  argv: string[],
  entry: Command<G> | CommandRunner<G> | LazyCommand<G>,
  options: CliOptions<G>,
  plugins: Plugin[]
): Promise<string | undefined> {
  const decorators = createDecorators<G>()

  const initialSubCommands = createInitialSubCommands(options, entry)

  const pluginContext = createPluginContext<G>(decorators, initialSubCommands)

  const resolvedPlugins = await applyPlugins(pluginContext, [
    ...plugins,
    ...(options.plugins || [])
  ])

  const cliOptions = normalizeCliOptions(options, decorators, pluginContext)

  const tokens = parseArgs(argv)

  const resolved = resolveCommandTree(tokens, entry, cliOptions)
  const { commandName: name, command, callMode, commandPath, depth, levelSubCommands } = resolved
  if (!command) {
    throw new Error(`Command not found: ${name || ''}`)
  }

  const args = resolveArguments(pluginContext, getCommandArgs(command))

  // skipPositional: how many leading positionals to skip (they're consumed as command names)
  // depth=0 → -1 (no skip), depth=1 → 0 (skip 1, existing behavior), depth=2 → 1 (skip 2), etc.
  const skipPositional = depth > 0 ? depth - 1 : -1

  const { explicit, values, positionals, rest, error } = resolveArgs(args, tokens, {
    shortGrouping: true,
    toKebab: command.toKebab,
    skipPositional
  })
  const omitted = resolved.omitted

  // override subCommands with level-specific sub-commands for rendering
  if (levelSubCommands) {
    cliOptions.subCommands = levelSubCommands
  }

  const resolvedCommand = isLazyCommand<G>(command)
    ? await resolveLazyCommand<G>(command, name, true)
    : command

  const commandContext = await createCommandContext({
    args,
    explicit,
    values,
    positionals,
    rest,
    argv,
    tokens,
    omitted,
    callMode,
    commandPath,
    command: resolvedCommand,
    extensions: getPluginExtensions(resolvedPlugins),
    validationError: error,
    cliOptions: cliOptions
  })

  return await executeCommand(resolvedCommand, commandContext, decorators.commandDecorators)
}

async function applyPlugins<G extends GunshiParamsConstraint>(
  pluginContext: PluginContext<G>,
  plugins: Plugin[]
): Promise<Plugin[]> {
  const sortedPlugins = resolveDependencies(plugins)
  try {
    for (const plugin of sortedPlugins) {
      /**
       * NOTE(kazupon):
       * strictly `Args` are not required for plugin installation.
       * because the strictly `Args` required by each plugin are unknown,
       * and the plugin side can not know what the user will specify.
       */
      await plugin(pluginContext as unknown as PluginContext<DefaultGunshiParams>)
    }
  } catch (error: unknown) {
    console.error('Error loading plugin:', (error as Error).message)
  }

  return sortedPlugins
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

function resolveArguments<G extends GunshiParamsConstraint>(
  pluginContext: PluginContext<G>,
  args?: ExtractArgs<G>
): ExtractArgs<G> {
  return Object.assign(
    create<ExtractArgs<G>>(),
    Object.fromEntries(pluginContext.globalOptions),
    args
  )
}

const isObject = (val: unknown): val is Record<any, any> => val !== null && typeof val === 'object'

function createInitialSubCommands<G extends GunshiParamsConstraint>(
  options: CliOptions<G>,
  entryCmd: Command<G> | CommandRunner<G> | LazyCommand<G>
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
  if (hasSubCommands) {
    if (isLazyCommand(entryCmd)) {
      // for lazy command - copy properties onto a new function to avoid mutating the original
      const entryCopy = Object.assign(
        (...args: unknown[]) => (entryCmd as Function)(...args),
        entryCmd,
        { entry: true }
      ) as unknown as LazyCommand<G>
      subCommands.set(resolveEntryName(entryCopy), entryCopy)
    } else if (typeof entryCmd === 'object') {
      // for command object - shallow copy to avoid mutating the user-provided object
      const entryCopy = Object.assign(create<Command<G>>(), entryCmd, {
        entry: true
      }) as Command<G>
      subCommands.set(resolveEntryName(entryCopy), entryCopy)
    } else if (typeof entryCmd === 'function') {
      // for command runner
      const name = entryCmd.name || ANONYMOUS_COMMAND_NAME
      subCommands.set(name, {
        run: entryCmd as CommandRunner<G>,
        name,
        entry: true
      })
    }
  }

  return subCommands
}

function normalizeCliOptions<G extends GunshiParamsConstraint>(
  options: CliOptions<G>,
  decorators: Decorators<G>,
  pluginContext: PluginContext<G>
): InternalCliOptions<G> {
  // get the latest sub commands from plugin context (already includes entry command)
  const subCommands = new Map(pluginContext.subCommands)

  const resolvedOptions = Object.assign(create<CliOptions<G>>(), CLI_OPTIONS_DEFAULT, options, {
    subCommands
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
}

function resolveCommandTree<G extends GunshiParamsConstraint>(
  tokens: ArgToken[],
  entry: Command<G> | CommandRunner<G> | LazyCommand<G>,
  options: InternalCliOptions<G>
): ResolveCommandContext<G> {
  const positionals = getPositionalTokens(tokens)

  function resolveAsEntry(): ResolveCommandContext<G> {
    if (typeof entry === 'function') {
      if ('commandName' in entry && entry.commandName) {
        // lazy command
        return {
          commandName: entry.commandName,
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
        return {
          commandName: token,
          callMode: 'unexpected',
          commandPath: [],
          depth: 0,
          omitted: false,
          levelSubCommands: undefined
        }
      }
      // depth > 0: stop exploring, remaining tokens are positional args
      break
    }

    // resolve command name if missing - shallow copy to avoid mutating user objects
    let resolved: Command<G> | LazyCommand<G> = cmd
    if (typeof cmd === 'function' && (cmd as any).commandName == null) {
      const copy = Object.assign(() => {}, cmd) as LazyCommand<G>
      copy.commandName = token
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
    const entryCopy = Object.assign(create<Command<G>>(), resolvedCommand, {
      entry: true
    }) as Command<G> | LazyCommand<G>
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
  const baseRunner = cmd.run || NOOP

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
