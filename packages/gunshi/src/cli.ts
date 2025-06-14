/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { parseArgs, resolveArgs } from 'args-tokens'
import { ANONYMOUS_COMMAND_NAME, COMMAND_OPTIONS_DEFAULT } from './constants.ts'
import { createCommandContext } from './context.ts'
import { Decorators } from './decorators.ts'
import { PluginContext } from './plugin.ts'
import { plugins } from './plugins/index.ts'
import { create, isLazyCommand, resolveLazyCommand } from './utils.ts'

import type { Args, ArgToken } from 'args-tokens'
import type { Plugin } from './plugin.ts'
import type {
  CliOptions,
  Command,
  CommandCallMode,
  CommandContext,
  CommandDecorator,
  CommandRunner,
  ExtendedCommand,
  LazyCommand
} from './types.ts'

/**
 * Run the command.
 * @param args Command line arguments
 * @param entry A {@link Command | entry command}, an {@link CommandRunner | inline command runner}, or a {@link LazyCommand | lazily-loaded command}
 * @param options A {@link CliOptions | CLI options}
 * @returns A rendered usage or undefined. if you will use {@link CliOptions.usageSilent} option, it will return rendered usage string.
 */
export async function cli<A extends Args = Args>(
  argv: string[],
  entry: Command<A> | CommandRunner<A> | LazyCommand<A>,
  options: CliOptions<A> = {}
): Promise<string | undefined> {
  const cliOptions = resolveCliOptions(options, entry)

  const decorators = new Decorators<A>()
  const pluginContext = new PluginContext<A>(decorators)
  const plugins = await applyPlugins(pluginContext)

  // Set default renderers if not provided via cli options
  if (cliOptions.renderHeader === undefined) {
    cliOptions.renderHeader = decorators.getHeaderRenderer()
  }
  if (cliOptions.renderUsage === undefined) {
    cliOptions.renderUsage = decorators.getUsageRenderer()
  }
  if (cliOptions.renderValidationErrors === undefined) {
    cliOptions.renderValidationErrors = decorators.getValidationErrorsRenderer()
  }

  const tokens = parseArgs(argv)
  const subCommand = getSubCommand(tokens)
  const {
    commandName: name,
    command,
    callMode
  } = await resolveCommand(subCommand, plugins, entry, cliOptions)
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
    cliOptions: cliOptions
  })

  // Skip validation if help or version is requested
  const skipValidation = values.help || values.version

  if (!skipValidation && error) {
    await showValidationErrors(commandContext, error, decorators)
    return
  }

  return await executeCommand(command, commandContext, name || '', decorators.commandDecorators)
}

async function applyPlugins<A extends Args>(pluginContext: PluginContext<A>): Promise<Plugin[]> {
  try {
    // TODO(kazupon): add more user plugins loading logic
    for (const plugin of plugins) {
      /**
       * NOTE(kazupon):
       * strictly `Args` are not required for plugin installation.
       * because the strictly `Args` required by each plugin are unknown,
       * and the plugin side can not know what the user will specify.
       */
      await plugin(pluginContext as unknown as PluginContext<Args>)
    }
  } catch (error: unknown) {
    console.error('Error loading plugin:', (error as Error).message)
  }

  return plugins
}

function getCommandArgs<A extends Args>(cmd?: Command<A> | LazyCommand<A>): A {
  if (isLazyCommand<A>(cmd)) {
    return cmd.args || create<A>()
  } else if (typeof cmd === 'object') {
    return cmd.args || create<A>()
  } else {
    return create<A>()
  }
}

function resolveArguments<A extends Args>(pluginContext: PluginContext<A>, args?: A): A {
  return Object.assign(create<A>(), Object.fromEntries(pluginContext.globalOptions), args)
}

function resolveCliOptions<A extends Args>(
  options: CliOptions<A>,
  entry: Command<A> | CommandRunner<A> | LazyCommand<A>
): CliOptions<A> {
  const subCommands = new Map(options.subCommands)
  if (options.subCommands) {
    if (isLazyCommand(entry)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      subCommands.set(entry.commandName!, entry as LazyCommand<any>)
    } else if (typeof entry === 'object' && entry.name) {
      subCommands.set(entry.name, entry)
    }
  }
  const resolvedOptions = Object.assign(create<CliOptions<A>>(), COMMAND_OPTIONS_DEFAULT, options, {
    subCommands
  }) as CliOptions<A>

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

async function showValidationErrors<A extends Args>(
  ctx: CommandContext<A>,
  error: AggregateError,
  decorators: Decorators<A>
): Promise<void> {
  // TODO(kazupon): deprecate cliOptions.renderValidationErrors
  if (ctx.env.renderValidationErrors === null) {
    return
  }
  const renderer = ctx.env.renderValidationErrors || decorators.getValidationErrorsRenderer()
  ctx.log(await renderer(ctx, error))
}

type ResolveCommandContext<A extends Args = Args> = {
  commandName?: string | undefined
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  c?: ExtendedCommand<A, any>
  command?: Command<A> | LazyCommand<A> | undefined
  callMode: CommandCallMode
}

const CANNOT_RESOLVE_COMMAND = {
  callMode: 'unexpected'
} as const satisfies ResolveCommandContext

async function resolveCommand<A extends Args>(
  sub: string,
  // TODO(kazupon): should apply to command plugin.extensions!
  _plugins: Plugin[],
  entry: Command<A> | CommandRunner<A> | LazyCommand<A>,
  options: CliOptions<A>
): Promise<ResolveCommandContext<A>> {
  const omitted = !sub

  async function doResolveCommand(): Promise<ResolveCommandContext<A>> {
    if (typeof entry === 'function') {
      // eslint-disable-next-line unicorn/prefer-ternary
      if ('commandName' in entry && entry.commandName) {
        // lazy command
        return { commandName: entry.commandName, command: entry, callMode: 'entry' }
      } else {
        // inline command (command runner)
        return {
          command: { run: entry as CommandRunner<A> } as Command<A>,
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
  if (isLazyCommand<A>(cmd) && cmd.commandName == null) {
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

function resolveEntryName<A extends Args>(entry: Command<A>): string {
  return entry.name || ANONYMOUS_COMMAND_NAME
}

async function executeCommand<A extends Args = Args>(
  cmd: Command<A> | LazyCommand<A>,
  ctx: CommandContext<A>,
  name: string,
  decorators: readonly CommandDecorator<A>[]
): Promise<string | undefined> {
  const resolved = isLazyCommand<A>(cmd) ? await resolveLazyCommand<A>(cmd, name, true) : cmd
  const baseRunner = resolved.run || (() => {})

  // apply plugin decorators
  const decoratedRunner = decorators.reduceRight(
    (runner, decorator) => decorator(runner),
    baseRunner
  )

  // execute and return result
  const result = await decoratedRunner(ctx)

  // return string if one was returned
  return typeof result === 'string' ? result : undefined
}
