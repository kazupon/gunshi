/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { parseArgs, resolveArgs } from 'args-tokens'
import { ANONYMOUS_COMMAND_NAME, COMMAND_OPTIONS_DEFAULT } from './constants.ts'
import { createCommandContext } from './context.ts'
import { PluginContext } from './plugin.ts'
import builtins from './plugins/builtins.ts'
import { renderHeader, renderUsage, renderValidationErrors } from './renderer.ts'
import { create, isLazyCommand, resolveLazyCommand } from './utils.ts'

import type { Args, ArgToken } from 'args-tokens'
import type {
  CliOptions,
  Command,
  CommandCallMode,
  CommandContext,
  CommandRunner,
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

  const pluginContext = new PluginContext()
  for (const plugin of [builtins]) {
    await plugin()(pluginContext)
  }

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
    cliOptions: cliOptions
  })

  if (values.version) {
    showVersion(commandContext)
    return
  }

  const usageBuffer: string[] = []

  const header = await showHeader(commandContext)
  if (header) {
    usageBuffer.push(header)
  }

  if (values.help) {
    const usage = await showUsage(commandContext)
    if (usage) {
      usageBuffer.push(usage)
    }
    return usageBuffer.join('\n')
  }

  if (error) {
    await showValidationErrors(commandContext, error)
    return
  }

  await executeCommand(command, commandContext, name || '')
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

function resolveArguments<A extends Args>(pluginContext: PluginContext, args?: A): A {
  return Object.assign(create<A>(), args, Object.fromEntries(pluginContext.globalOptions))
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

async function showUsage<A extends Args>(ctx: CommandContext<A>): Promise<string | undefined> {
  if (ctx.env.renderUsage === null) {
    return
  }
  const usage = await (ctx.env.renderUsage || renderUsage)(ctx)
  if (usage) {
    ctx.log(usage)
    return usage
  }
}

function showVersion<A extends Args>(ctx: CommandContext<A>): void {
  ctx.log(ctx.env.version)
}

async function showHeader<A extends Args>(ctx: CommandContext<A>): Promise<string | undefined> {
  if (ctx.env.renderHeader === null) {
    return
  }
  const header = await (ctx.env.renderHeader || renderHeader)(ctx)
  if (header) {
    ctx.log(header)
    ctx.log()
    return header
  }
}

async function showValidationErrors<A extends Args>(
  ctx: CommandContext<A>,
  error: AggregateError
): Promise<void> {
  if (ctx.env.renderValidationErrors === null) {
    return
  }
  const render = ctx.env.renderValidationErrors || renderValidationErrors
  ctx.log(await render(ctx, error))
}

type ResolveCommandContext<A extends Args = Args> = {
  commandName?: string | undefined
  command?: Command<A> | LazyCommand<A> | undefined
  callMode: CommandCallMode
}

const CANNOT_RESOLVE_COMMAND = {
  callMode: 'unexpected'
} as const satisfies ResolveCommandContext

async function resolveCommand<A extends Args>(
  sub: string,
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
  name: string
): Promise<void> {
  const resolved = isLazyCommand<A>(cmd) ? await resolveLazyCommand<A>(cmd, name, true) : cmd
  if (resolved.run == null) {
    throw new Error(`'run' not found on Command \`${name}\``)
  }
  await resolved.run(ctx)
}
