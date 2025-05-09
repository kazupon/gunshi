/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { parseArgs, resolveArgs } from 'args-tokens'
import { COMMAND_OPTIONS_DEFAULT, COMMON_ARGS } from './constants.ts'
import { createCommandContext } from './context.ts'
import { renderHeader, renderUsage, renderValidationErrors } from './renderer.ts'
import { create, resolveLazyCommand } from './utils.ts'

import type { Args, ArgToken } from 'args-tokens'
import type {
  Command,
  CommandCallMode,
  CommandContext,
  CommandOptions,
  CommandRunner,
  LazyCommand
} from './types.ts'

/**
 * Run the command.
 * @param args Command line arguments
 * @param entry A {@link Command | entry command} or an {@link CommandRunner | inline command runner}
 * @param opts A {@link CommandOptions | command options}
 * @returns A rendered usage or undefined. if you will use {@link CommandOptions.usageSilent} option, it will return rendered usage string.
 */
export async function cli<A extends Args = Args>(
  argv: string[],
  entry: Command<A> | CommandRunner<A> | LazyCommand<A>,
  opts: CommandOptions<A> = {}
): Promise<string | undefined> {
  const tokens = parseArgs(argv)

  const subCommand = getSubCommand(tokens)
  const resolvedCommandOptions = resolveCommandOptions(opts, entry)
  const [name, command, callMode] = await resolveCommand(
    subCommand,
    entry,
    resolvedCommandOptions,
    true
  )
  if (!command) {
    throw new Error(`Command not found: ${name || ''}`)
  }

  const args = resolveArguments(command.args)

  const { values, positionals, rest, error } = resolveArgs(args, tokens, {
    optionGrouping: true,
    skipPositional: resolvedCommandOptions.subCommands!.size > 0 ? 0 : -1
  })
  const omitted = !subCommand
  const ctx = await createCommandContext({
    args,
    values,
    positionals,
    rest,
    argv,
    tokens,
    omitted,
    callMode,
    command,
    commandOptions: resolvedCommandOptions
  })

  if (values.version) {
    showVersion(ctx)
    return
  }

  const usageBuffer: string[] = []

  const header = await showHeader(ctx)
  if (header) {
    usageBuffer.push(header)
  }

  if (values.help) {
    const usage = await showUsage(ctx)
    if (usage) {
      usageBuffer.push(usage)
    }
    return usageBuffer.join('\n')
  }

  if (error) {
    await showValidationErrors(ctx, error)
    return
  }

  if (!command.run) {
    throw new Error(`'run' not found on Command \`${name || ''}\``)
  }

  await command.run(ctx)
}

function resolveArguments<A extends Args>(options?: A): A {
  return Object.assign(create<A>(), options, COMMON_ARGS)
}

function resolveCommandOptions<A extends Args>(
  options: CommandOptions<A>,
  entry: Command<A> | CommandRunner<A> | LazyCommand<A>
): CommandOptions<A> {
  const subCommands = new Map(options.subCommands)
  if (options.subCommands) {
    if (typeof entry === 'function' && 'commandName' in entry) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      subCommands.set(entry.commandName!, entry as LazyCommand<any>)
    } else if (typeof entry === 'object' && entry.name) {
      subCommands.set(entry.name, entry)
    }
  }
  const resolvedOptions = Object.assign(
    create<CommandOptions<A>>(),
    COMMAND_OPTIONS_DEFAULT,
    options,
    {
      subCommands
    }
  ) as CommandOptions<A>

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

const CANNOT_RESOLVE_COMMAND = [undefined, undefined, 'unexpected']

async function resolveCommand<A extends Args>(
  sub: string,
  entry: Command<A> | CommandRunner<A> | LazyCommand<A>,
  options: CommandOptions<A>,
  needRunResolving: boolean = false
): Promise<[string | undefined, Command<A> | undefined, CommandCallMode]> {
  const omitted = !sub

  async function doResolveCommand(): Promise<
    [string | undefined, Command<A> | undefined, CommandCallMode]
  > {
    if (typeof entry === 'function') {
      // eslint-disable-next-line unicorn/prefer-ternary
      if ('commandName' in entry) {
        // lazy command
        return [entry.commandName, await resolveLazyCommand(entry, '', needRunResolving), 'entry']
      } else {
        // inline command (command runner)
        return [undefined, { run: entry as CommandRunner<A> }, 'entry']
      }
    } else if (typeof entry === 'object') {
      // command object
      return [
        resolveEntryName(entry),
        await resolveLazyCommand(entry, '', needRunResolving),
        'entry'
      ]
    } else {
      return CANNOT_RESOLVE_COMMAND as [string | undefined, Command<A> | undefined, CommandCallMode]
    }
  }

  if (omitted) {
    return doResolveCommand()
  } else {
    if (options.subCommands == null || options.subCommands.size === 0) {
      return doResolveCommand()
    } else {
      const cmd = options.subCommands?.get(sub)
      if (cmd == null) {
        return [sub, undefined, 'unexpected']
      }
      return [sub, await resolveLazyCommand(cmd, sub, needRunResolving), 'subCommand']
    }
  }
}

function resolveEntryName<A extends Args>(entry: Command<A>): string {
  return entry.name || '(anonymous)'
}
