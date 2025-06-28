/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { parseArgs, resolveArgs } from 'args-tokens'
import { ANONYMOUS_COMMAND_NAME, COMMAND_OPTIONS_DEFAULT, NOOP } from './constants.ts'
import { createCommandContext } from './context.ts'
import { createDecorators } from './decorators.ts'
import { createPluginContext, resolveDependencies } from './plugin.ts'
import completion from './plugins/completion.ts'
import dryRun from './plugins/dryrun.ts'
import globals from './plugins/globals.ts'
import i18n from './plugins/i18n.ts'
import renderer from './plugins/renderer.ts'
import { create, isLazyCommand, resolveLazyCommand } from './utils.ts'

import type { ArgToken } from 'args-tokens'
import type { Decorators } from './decorators.ts'
import type { Plugin, PluginContext } from './plugin.ts'
import type {
  CliOptions,
  Command,
  CommandCallMode,
  CommandContext,
  CommandContextExtension,
  CommandDecorator,
  CommandRunner,
  DefaultGunshiParams,
  GunshiParams,
  LazyCommand
} from './types.ts'

/**
 * Run the command.
 * @param args Command line arguments
 * @param entry A {@link Command | entry command}, an {@link CommandRunner | inline command runner}, or a {@link LazyCommand | lazily-loaded command}
 * @param options A {@link CliOptions | CLI options}
 * @returns A rendered usage or undefined. if you will use {@link CliOptions.usageSilent} option, it will return rendered usage string.
 */
export async function cli<G extends GunshiParams = DefaultGunshiParams>(
  argv: string[],
  entry: Command<G> | CommandRunner<G> | LazyCommand<G>,
  options: CliOptions<G> = {}
): Promise<string | undefined> {
  const decorators = createDecorators<G>()
  const pluginContext = createPluginContext<G>(decorators)

  const builtInPlugins: Plugin[] = [
    globals(),
    i18n({ locale: options.locale, translationAdapterFactory: options.translationAdapterFactory }),
    renderer(),
    completion(),
    dryRun()
  ]
  const plugins = await applyPlugins(pluginContext, [...builtInPlugins, ...(options.plugins || [])])

  const cliOptions = normalizeCliOptions(options, entry, decorators)

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
  const { values, positionals, rest, error } = resolveArgs(args, tokens, {
    shortGrouping: true,
    toKebab: command.toKebab,
    skipPositional: cliOptions.subCommands!.size > 0 ? 0 : -1
  })
  const omitted = !subCommand
  const commandContext = await createCommandContext({
    args,
    values,
    positionals,
    rest,
    argv,
    tokens,
    omitted,
    callMode,
    command,
    extensions: getPluginExtensions(plugins),
    validationError: error,
    cliOptions: cliOptions
  })

  return await executeCommand(command, commandContext, name || '', decorators.commandDecorators)
}

async function applyPlugins<G extends GunshiParams>(
  pluginContext: PluginContext<G>,
  plugins: Plugin[]
): Promise<Plugin[]> {
  const sortedPlugins = resolveDependencies(plugins)
  try {
    // TODO(kazupon): add more user plugins loading logic
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

function getCommandArgs<G extends GunshiParams>(cmd?: Command<G> | LazyCommand<G>): G['args'] {
  if (isLazyCommand<G>(cmd)) {
    return cmd.args || create<G['args']>()
  } else if (typeof cmd === 'object') {
    return cmd.args || create<G['args']>()
  } else {
    return create<G['args']>()
  }
}

function resolveArguments<G extends GunshiParams>(
  pluginContext: PluginContext<G>,
  args?: G['args']
): G['args'] {
  return Object.assign(create<G['args']>(), Object.fromEntries(pluginContext.globalOptions), args)
}

function normalizeCliOptions<G extends GunshiParams>(
  options: CliOptions<G>,
  entry: Command<G> | CommandRunner<G> | LazyCommand<G>,
  decorators: Decorators<G>
): CliOptions<G> {
  const subCommands = new Map(options.subCommands)
  if (options.subCommands) {
    if (isLazyCommand(entry)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      subCommands.set(entry.commandName!, entry as LazyCommand<any>)
    } else if (typeof entry === 'object' && entry.name) {
      subCommands.set(entry.name, entry)
    }
  }

  const resolvedOptions = Object.assign(create<CliOptions<G>>(), COMMAND_OPTIONS_DEFAULT, options, {
    subCommands
  }) as CliOptions<G>

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

type ResolveCommandContext<G extends GunshiParams = DefaultGunshiParams> = {
  commandName?: string | undefined
  command?: Command<G> | LazyCommand<G> | undefined
  callMode: CommandCallMode
}

const CANNOT_RESOLVE_COMMAND = {
  callMode: 'unexpected'
} as const satisfies ResolveCommandContext

async function resolveCommand<G extends GunshiParams>(
  sub: string,
  entry: Command<G> | CommandRunner<G> | LazyCommand<G>,
  options: CliOptions<G>
): Promise<ResolveCommandContext<G>> {
  const omitted = !sub

  async function doResolveCommand(): Promise<ResolveCommandContext<G>> {
    if (typeof entry === 'function') {
      // eslint-disable-next-line unicorn/prefer-ternary
      if ('commandName' in entry && entry.commandName) {
        // lazy command
        return { commandName: entry.commandName, command: entry, callMode: 'entry' }
      } else {
        // inline command (command runner)
        return {
          command: { run: entry as CommandRunner<G> } as Command<G>,
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

function resolveEntryName<G extends GunshiParams>(entry: Command<G>): string {
  return entry.name || ANONYMOUS_COMMAND_NAME
}

function getPluginExtensions(plugins: Plugin[]): Record<string, CommandContextExtension> {
  const extensions = create<Record<string, CommandContextExtension>>()
  const pluginExtensions = plugins
    .map(plugin => plugin.extension)
    .filter(Boolean) as CommandContextExtension[]
  for (const extension of pluginExtensions) {
    const key = extension.key.description
    if (key) {
      if (extensions[key]) {
        console.warn(
          `Plugin "${key}" is already installed. ignore it for command context extending.`
        )
      } else {
        extensions[key] = extension
      }
    }
  }
  return extensions
}

async function executeCommand<G extends GunshiParams = DefaultGunshiParams>(
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

  // execute and return result
  const result = await decoratedRunner(ctx as Parameters<typeof baseRunner>[0])

  // return string if one was returned
  return typeof result === 'string' ? result : undefined
}
