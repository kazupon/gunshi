import { parseArgs, resolveArgs } from 'args-tokens'
import { COMMAND_OPTIONS_DEFAULT, COMMON_OPTIONS } from './constants.js'
import { createCommandContext } from './context.js'
import { renderHeader, renderUsage, renderValidationErrors } from './renderer/index.js'
import { create, log, resolveLazyCommand } from './utils.js'

import type { ArgOptions, ArgToken } from 'args-tokens'
import type { Command, CommandContext, CommandOptions, CommandRunner, LazyCommand } from './types'

/**
 * Run the command
 * @param args - command line arguments
 * @param entry - A {@link Command | entry command} or an {@link CommandRunner | inline command runner}
 * @param opts - A {@link CommandOptions | command options}
 */
export async function cli<Options extends ArgOptions>(
  args: string[],
  entry: Command<Options> | CommandRunner<Options>,
  opts: CommandOptions<Options> = {}
): Promise<void> {
  const tokens = parseArgs(args)

  const subCommand = getSubCommand(tokens)
  const resolvedCommandOptions = resolveCommandOptions(opts)
  const [name, command] = await resolveCommand(subCommand, entry, resolvedCommandOptions)
  if (!command) {
    throw new Error(`Command not found: ${name || ''}`)
  }

  if (command.name && !resolvedCommandOptions.subCommands!.has(command.name)) {
    resolvedCommandOptions.subCommands!.set(command.name, command)
  }

  const options = resolveArgOptions(command.options)

  const { values, positionals, error } = resolveArgs(options, tokens)
  const omitted = !subCommand
  const ctx = await createCommandContext({
    options,
    values,
    positionals,
    omitted,
    command,
    commandOptions: opts
  })

  if (values.version) {
    showVersion(ctx)
    return
  }

  await showHeader(ctx)

  if (values.help) {
    await showUsage(ctx)
    return
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
  options: CommandOptions<Options>
): CommandOptions<Options> {
  const subCommands = new Map<string, Command<Options> | LazyCommand<Options>>(options.subCommands) // shallow copy
  return Object.assign(
    create<CommandOptions<Options>>(),
    COMMAND_OPTIONS_DEFAULT,
    { subCommands },
    options
  ) as CommandOptions<Options>
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

async function showUsage<Options extends ArgOptions>(ctx: CommandContext<Options>): Promise<void> {
  if (ctx.env.renderUsage === null) {
    return
  }
  const render = ctx.env.renderUsage || renderUsage
  log(await render(ctx))
}

function showVersion<Options extends ArgOptions>(ctx: CommandContext<Options>): void {
  log(ctx.env.version)
}

async function showHeader<Options extends ArgOptions>(ctx: CommandContext<Options>): Promise<void> {
  if (ctx.env.renderHeader === null) {
    return
  }
  const header = await (ctx.env.renderHeader || renderHeader)(ctx)
  if (header) {
    log(header)
    log()
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
  log(await render(ctx, error))
}

async function resolveCommand<Options extends ArgOptions>(
  sub: string,
  entry: Command<Options> | CommandRunner<Options>,
  options: CommandOptions<Options>
): Promise<[string | undefined, Command<Options> | undefined]> {
  const omitted = !sub
  if (typeof entry === 'function') {
    return [undefined, { run: entry, default: true }]
  } else {
    if (omitted) {
      return typeof entry === 'object'
        ? [entry.name, await resolveLazyCommand(entry, undefined, true)]
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
