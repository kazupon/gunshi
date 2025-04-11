import { parseArgs, resolveArgs } from 'args-tokens'
import { COMMAND_OPTIONS_DEFAULT, COMMON_OPTIONS } from './constants.ts'
import { createCommandContext } from './context.ts'
import { renderHeader, renderUsage, renderValidationErrors } from './renderer.ts'
import { create, resolveLazyCommand } from './utils.ts'

import type { ArgOptions, ArgToken } from 'args-tokens'
import type { Command, CommandContext, CommandOptions, CommandRunner } from './types.ts'

/**
 * Run the command.
 * @param args Command line arguments
 * @param entry A {@link Command | entry command} or an {@link CommandRunner | inline command runner}
 * @param opts A {@link CommandOptions | command options}
 * @returns A rendered usage or undefined. if you will use {@link CommandOptions.usageSilent} option, it will return rendered usage string.
 */
export async function cli<Options extends ArgOptions = ArgOptions>(
  args: string[],
  entry: Command<Options> | CommandRunner<Options>,
  opts: CommandOptions<Options> = {}
): Promise<string | undefined> {
  const tokens = parseArgs(args)

  const subCommand = getSubCommand(tokens)
  const resolvedCommandOptions = resolveCommandOptions(opts, entry)
  const [name, command] = await resolveCommand(subCommand, entry, resolvedCommandOptions)
  if (!command) {
    throw new Error(`Command not found: ${name || ''}`)
  }

  const options = resolveArgOptions(command.options)

  const { values, positionals, error } = resolveArgs(options, tokens)
  const omitted = !subCommand
  const ctx = await createCommandContext({
    options,
    values,
    positionals,
    args,
    tokens,
    omitted,
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

  await command.run(ctx)
}

function resolveArgOptions<Options extends ArgOptions>(options?: Options): Options {
  return Object.assign(create<Options>(), options, COMMON_OPTIONS)
}

function resolveCommandOptions<Options extends ArgOptions>(
  options: CommandOptions<Options>,
  entry: Command<Options> | CommandRunner<Options>
): CommandOptions<Options> {
  const subCommands = new Map(options.subCommands)
  if (typeof entry === 'object' && entry.name) {
    subCommands.set(entry.name, entry)
  }
  const resolvedOptions = Object.assign(
    create<CommandOptions<Options>>(),
    COMMAND_OPTIONS_DEFAULT,
    options,
    {
      subCommands
    }
  ) as CommandOptions<Options>

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

async function showUsage<Options extends ArgOptions>(
  ctx: CommandContext<Options>
): Promise<string | undefined> {
  if (ctx.env.renderUsage === null) {
    return
  }
  const usage = await (ctx.env.renderUsage || renderUsage)(ctx)
  if (usage) {
    ctx.log(usage)
    return usage
  }
}

function showVersion<Options extends ArgOptions>(ctx: CommandContext<Options>): void {
  ctx.log(ctx.env.version)
}

async function showHeader<Options extends ArgOptions>(
  ctx: CommandContext<Options>
): Promise<string | undefined> {
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

async function showValidationErrors<Options extends ArgOptions>(
  ctx: CommandContext<Options>,
  error: AggregateError
): Promise<void> {
  if (ctx.env.renderValidationErrors === null) {
    return
  }
  const render = ctx.env.renderValidationErrors || renderValidationErrors
  ctx.log(await render(ctx, error))
}

async function resolveCommand<Options extends ArgOptions>(
  sub: string,
  entry: Command<Options> | CommandRunner<Options>,
  options: CommandOptions<Options>
): Promise<[string | undefined, Command<Options> | undefined]> {
  const omitted = !sub
  if (typeof entry === 'function') {
    return [undefined, { run: entry }]
  } else {
    if (omitted) {
      return typeof entry === 'object'
        ? [entry.name, await resolveLazyCommand(entry)]
        : [undefined, undefined]
    } else {
      if (options.subCommands == null) {
        return [sub, undefined]
      }

      const cmd = options.subCommands?.get(sub)

      if (cmd == null) {
        return [sub, undefined]
      }

      return [sub, await resolveLazyCommand(cmd, sub)]
    }
  }
}
