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
import { create, isLazyCommand, resolveLazyCommand } from '../utils.ts'

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): generic type for subCommands
  subCommands: Exclude<CliOptions['subCommands'], Record<string, Command<any> | LazyCommand<any>>>
}

/**
 * Run the command.
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
  const subCommand = getSubCommand(tokens)

  const {
    commandName: name,
    command,
    callMode
  } = await resolveCommand(subCommand, entry, cliOptions)
  if (!command) {
    throw new Error(`Command not found: ${name || ''}`)
  }

  const args = resolveArguments(pluginContext, getCommandArgs(command))
  const { explicit, values, positionals, rest, error } = resolveArgs(args, tokens, {
    shortGrouping: true,
    toKebab: command.toKebab,
    skipPositional: callMode === 'subCommand' && cliOptions.subCommands!.size > 0 ? 0 : -1
  })
  const omitted = !subCommand
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
    command,
    extensions: getPluginExtensions(resolvedPlugins),
    validationError: error,
    cliOptions: cliOptions
  })

  return await executeCommand(command, commandContext, name || '', decorators.commandDecorators)
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): generic type
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

  const subCommands = new Map(options.subCommands instanceof Map ? options.subCommands : [])
  if (!(options.subCommands instanceof Map) && isObject(options.subCommands)) {
    for (const [name, cmd] of Object.entries(options.subCommands)) {
      subCommands.set(name, cmd)
    }
  }

  // add entry command to sub commands if there are sub commands
  if (hasSubCommands && (isLazyCommand(entryCmd) || typeof entryCmd === 'object')) {
    entryCmd.entry = true
    subCommands.set(resolveEntryName(entryCmd as LazyCommand<G> | Command<G>), entryCmd)
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

function getSubCommand(tokens: ArgToken[]): string {
  const firstToken = tokens[0]
  return firstToken &&
    firstToken.kind === 'positional' &&
    firstToken.index === 0 &&
    firstToken.value
    ? firstToken.value
    : ''
}

type ResolveCommandContext<G extends GunshiParamsConstraint = DefaultGunshiParams> = {
  commandName?: string | undefined
  command?: Command<G> | LazyCommand<G> | undefined
  callMode: CommandCallMode
}

const CANNOT_RESOLVE_COMMAND = {
  callMode: 'unexpected'
} as const satisfies ResolveCommandContext

async function resolveCommand<G extends GunshiParamsConstraint>(
  sub: string,
  entry: Command<G> | CommandRunner<G> | LazyCommand<G>,
  options: InternalCliOptions<G>
): Promise<ResolveCommandContext<G>> {
  const omitted = !sub

  async function doResolveCommand(): Promise<ResolveCommandContext<G>> {
    if (typeof entry === 'function') {
      // eslint-disable-next-line unicorn/prefer-ternary -- NOTE(kazupon): to keep the human-readable codes
      if ('commandName' in entry && entry.commandName) {
        // lazy command
        return { commandName: entry.commandName, command: entry, callMode: 'entry' }
      } else {
        // inline command (command runner)
        return {
          command: { run: entry as CommandRunner<G>, entry: true } as Command<G>,
          callMode: 'entry'
        }
      }
    } else if (typeof entry === 'object') {
      // command object
      return {
        commandName: resolveEntryName(entry),
        command: entry,
        callMode: 'entry'
      }
    } else {
      return CANNOT_RESOLVE_COMMAND
    }
  }

  if (omitted || options.subCommands?.size === 0) {
    return doResolveCommand()
  }

  const cmd = options.subCommands?.get(sub)
  if (cmd == null) {
    if (options.fallbackToEntry) {
      return doResolveCommand()
    }
    return {
      commandName: sub,
      callMode: 'unexpected'
    }
  }

  // resolve command name, if command has not name on subCommand
  if (isLazyCommand<G>(cmd) && cmd.commandName == null) {
    cmd.commandName = sub
  } else if (typeof cmd === 'object' && cmd.name == null) {
    cmd.name = sub
  }

  return {
    commandName: sub,
    command: cmd,
    callMode: 'subCommand'
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
  cmd: Command<G> | LazyCommand<G>,
  ctx: Readonly<CommandContext<G>>,
  name: string,
  decorators: Readonly<CommandDecorator<G>[]>
): Promise<string | undefined> {
  const resolved = isLazyCommand<G>(cmd) ? await resolveLazyCommand<G>(cmd, name, true) : cmd
  const baseRunner = resolved.run || NOOP

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
    const result = await decoratedRunner(ctx as Parameters<typeof baseRunner>[0])

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
