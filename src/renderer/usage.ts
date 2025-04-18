/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { create, resolveBuiltInKey, resolveOptionKey } from '../utils.ts'

import type { ArgOptions } from 'args-tokens'
import type { Command, CommandContext } from '../types.ts'

/**
 * Render the usage.
 * @param ctx A {@link CommandContext | command context}
 * @returns A rendered usage.
 */
export async function renderUsage<Options extends ArgOptions = ArgOptions>(
  ctx: Readonly<CommandContext<Options>>
): Promise<string> {
  const messages: string[] = []

  // render description section (sub command executed only)
  if (!ctx.omitted) {
    const description = resolveDescription(ctx)
    if (description) {
      messages.push(description, '')
    }
  }

  // render usage section
  messages.push(...(await renderUsageSection(ctx)), '')

  // render commands section
  if (ctx.omitted && (await hasCommands(ctx))) {
    messages.push(...(await renderCommandsSection(ctx)), '')
  }

  // render options section
  if (hasOptions(ctx)) {
    messages.push(...(await renderOptionsSection(ctx)), '')
  }

  // render examples section
  const examples = renderExamplesSection(ctx)
  if (examples.length > 0) {
    messages.push(...examples, '')
  }

  return messages.join('\n')
}

/**
 * Render the options section
 * @param ctx A {@link CommandContext | command context}
 * @returns A rendered options section
 */
async function renderOptionsSection<Options extends ArgOptions>(
  ctx: Readonly<CommandContext<Options>>
): Promise<string[]> {
  const messages: string[] = []
  messages.push(`${ctx.translate(resolveBuiltInKey('OPTIONS'))}:`)
  messages.push(await generateOptionsUsage(ctx, getOptionsPairs(ctx)))
  return messages
}

/**
 * Render the examples section
 * @param ctx A {@link CommandContext | command context}
 * @returns A rendered examples section
 */
function renderExamplesSection<Options extends ArgOptions>(
  ctx: Readonly<CommandContext<Options>>
): string[] {
  const messages: string[] = []

  const resolvedExamples = resolveExamples(ctx)
  if (resolvedExamples) {
    const examples = resolvedExamples
      .split('\n')
      .map((example: string) => example.padStart(ctx.env.leftMargin + example.length))
    messages.push(`${ctx.translate(resolveBuiltInKey('EXAMPLES'))}:`, ...examples)
  }

  return messages
}

/**
 * Render the usage section
 * @param ctx A {@link CommandContext | command context}
 * @returns A rendered usage section
 */
async function renderUsageSection<Options extends ArgOptions>(
  ctx: Readonly<CommandContext<Options>>
): Promise<string[]> {
  const messages: string[] = [`${ctx.translate(resolveBuiltInKey('USAGE'))}:`]
  if (ctx.omitted) {
    const defaultCommand = `${resolveEntry(ctx)}${(await hasCommands(ctx)) ? ` [${resolveSubCommand(ctx)}]` : ''} ${hasOptions(ctx) ? `<${ctx.translate(resolveBuiltInKey('OPTIONS'))}>` : ''} `
    messages.push(defaultCommand.padStart(ctx.env.leftMargin + defaultCommand.length))
    if (await hasCommands(ctx)) {
      const commandsUsage = `${resolveEntry(ctx)} <${ctx.translate(resolveBuiltInKey('COMMANDS'))}>`
      messages.push(commandsUsage.padStart(ctx.env.leftMargin + commandsUsage.length))
    }
  } else {
    const usageStr = `${resolveEntry(ctx)} ${resolveSubCommand(ctx)} ${generateOptionsSymbols(ctx)}`
    messages.push(usageStr.padStart(ctx.env.leftMargin + usageStr.length))
  }
  return messages
}

/**
 * Render the commands section
 * @param ctx A {@link CommandContext | command context}
 * @returns A rendered commands section
 */
async function renderCommandsSection<Options extends ArgOptions>(
  ctx: Readonly<CommandContext<Options>>
): Promise<string[]> {
  const messages: string[] = [`${ctx.translate(resolveBuiltInKey('COMMANDS'))}:`]
  const loadedCommands = await ctx.loadCommands()
  const commandMaxLength = Math.max(...loadedCommands.map(cmd => (cmd.name || '').length))
  const commandsStr = await Promise.all(
    loadedCommands.map(cmd => {
      const key = cmd.name || ''
      const desc = cmd.description || ''
      const command = `${key.padEnd(commandMaxLength + ctx.env.middleMargin)}${desc} `
      return `${command.padStart(ctx.env.leftMargin + command.length)} `
    })
  )
  messages.push(...commandsStr, '', ctx.translate(resolveBuiltInKey('FORMORE')))
  messages.push(
    ...loadedCommands.map(cmd => {
      const commandHelp = `${ctx.env.name} ${cmd.name} --help`
      return `${commandHelp.padStart(ctx.env.leftMargin + commandHelp.length)}`
    })
  )
  return messages
}

/**
 * Resolve the entry command name
 * @param ctx A {@link CommandContext | command context}
 * @returns The entry command name
 */
function resolveEntry<Options extends ArgOptions>(ctx: CommandContext<Options>): string {
  return ctx.env.name || ctx.translate(resolveBuiltInKey('COMMAND'))
}

/**
 * Resolve the sub command name
 * @param ctx A {@link CommandContext | command context}
 * @returns The sub command name
 */
function resolveSubCommand<Options extends ArgOptions>(
  ctx: Readonly<CommandContext<Options>>
): string {
  return ctx.name || ctx.translate(resolveBuiltInKey('SUBCOMMAND'))
}

/**
 * Resolve the command description
 * @param ctx A {@link CommandContext | command context}
 * @returns resolved command description
 */
function resolveDescription<Options extends ArgOptions>(ctx: CommandContext<Options>): string {
  return ctx.translate('description') || ctx.description || ''
}

/**
 * Resolve the command examples
 * @param ctx A {@link CommandContext | command context}
 * @returns resolved command examples, if not resolved, return empty string
 */
function resolveExamples<Options extends ArgOptions>(ctx: CommandContext<Options>): string {
  const ret = ctx.translate('examples')
  if (ret) {
    return ret
  }
  const command = ctx.env.subCommands?.get(ctx.name || '') as Command<Options> | undefined
  return command?.examples ?? ''
}

/**
 * Check if the command has sub commands
 * @param ctx A {@link CommandContext | command context}
 * @returns True if the command has sub commands
 */
async function hasCommands<Options extends ArgOptions>(
  ctx: CommandContext<Options>
): Promise<boolean> {
  const loadedCommands = await ctx.loadCommands()
  return loadedCommands.length > 1
}

/**
 * Check if the command has options
 * @param ctx A {@link CommandContext | command context}
 * @returns True if the command has options
 */
function hasOptions<Options extends ArgOptions>(ctx: CommandContext<Options>): boolean {
  return !!(ctx.options && Object.keys(ctx.options).length > 0)
}

/**
 * Check if all options have default values
 * @param ctx A {@link CommandContext | command context}
 * @returns True if all options have default values
 */
function hasAllDefaultOptions<Options extends ArgOptions>(ctx: CommandContext<Options>): boolean {
  return !!(ctx.options && Object.values(ctx.options).every(opt => opt.default))
}

/**
 * Generate options symbols for usage
 * @param ctx A {@link CommandContext | command context}
 * @returns Options symbols for usage
 */
function generateOptionsSymbols<Options extends ArgOptions>(ctx: CommandContext<Options>): string {
  return hasOptions(ctx)
    ? hasAllDefaultOptions(ctx)
      ? `[${ctx.translate(resolveBuiltInKey('OPTIONS'))}]`
      : `<${ctx.translate(resolveBuiltInKey('OPTIONS'))}>`
    : ''
}

/**
 * Get options pairs for usage
 * @param ctx A {@link CommandContext | command context}
 * @returns Options pairs for usage
 */
function getOptionsPairs<Options extends ArgOptions>(
  ctx: CommandContext<Options>
): Record<string, string> {
  return Object.entries(ctx.options).reduce((acc, [name, value]) => {
    let key = `--${name}`
    if (value.short) {
      key = `-${value.short}, ${key}`
    }
    if (value.type !== 'boolean') {
      key = value.default ? `${key} [${name}]` : `${key} <${name}>`
    }
    acc[name] = key
    return acc
  }, create<Record<string, string>>())
}

/**
 * Generate options usage
 * @param ctx A {@link CommandContext | command context}
 * @param optionsPairs Options pairs for usage
 * @returns Generated options usage
 */
async function generateOptionsUsage<Options extends ArgOptions>(
  ctx: CommandContext<Options>,
  optionsPairs: Record<string, string>
): Promise<string> {
  const optionsMaxLength = Math.max(
    ...Object.entries(optionsPairs).map(([_, value]) => value.length)
  )

  const optionSchemaMaxLength = ctx.env.usageOptionType
    ? Math.max(...Object.entries(optionsPairs).map(([key, _]) => ctx.options[key].type.length))
    : 0

  const usages = await Promise.all(
    Object.entries(optionsPairs).map(([key, value]) => {
      const rawDesc = ctx.translate(resolveOptionKey(key))
      const optionsSchema = ctx.env.usageOptionType ? `[${ctx.options[key].type}] ` : ''
      // padEnd is used to align the `[]` symbols
      const desc = `${optionsSchema ? optionsSchema.padEnd(optionSchemaMaxLength + 3) : ''}${rawDesc}`
      const option = `${value.padEnd(optionsMaxLength + ctx.env.middleMargin)}${desc}`
      return `${option.padStart(ctx.env.leftMargin + option.length)}`
    })
  )

  return usages.join('\n')
}
