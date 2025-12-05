/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { ANONYMOUS_COMMAND_NAME } from '@gunshi/plugin'
import {
  ARG_NEGATABLE_PREFIX,
  COMMON_ARGS,
  resolveExamples as _resolvedExamples,
  kebabnize,
  makeShortLongOptionPair,
  resolveArgKey,
  resolveBuiltInKey,
  resolveKey
} from '@gunshi/shared'
import { pluginId } from './types.ts'

import type {
  ArgSchema,
  Args,
  Command,
  CommandContext,
  DefaultGunshiParams,
  GunshiParams
} from '@gunshi/plugin'
import type { PluginId, UsageRendererExtension } from './types.ts'

type Extensions = Record<PluginId, UsageRendererExtension>

const COMMON_ARGS_KEYS = Object.keys(COMMON_ARGS)

/**
 * Render the usage.
 *
 * @param ctx - A {@link CommandContext | command context}
 * @returns A rendered usage.
 */
export async function renderUsage<G extends GunshiParams = DefaultGunshiParams>(
  ctx: Readonly<CommandContext<G>>
): Promise<string> {
  const messages: string[] = []

  // render description section (sub command executed only)
  if (!ctx.omitted) {
    const description = await resolveDescription(ctx)
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

  // render positional arguments section
  if (hasPositionalArgs(ctx.args)) {
    messages.push(...(await renderPositionalArgsSection(ctx)), '')
  }

  // render optional arguments section
  if (hasOptionalArgs(ctx.args)) {
    messages.push(...(await renderOptionalArgsSection(ctx)), '')
  }

  // render examples section
  const examples = await renderExamplesSection(ctx)
  if (examples.length > 0) {
    messages.push(...examples, '')
  }

  return messages.join('\n')
}

/**
 * Render the positional arguments section
 *
 * @param ctx - A {@link CommandContext | command context}
 * @returns A rendered arguments section
 */
async function renderPositionalArgsSection<
  G extends GunshiParams<{
    args: Args
    extensions: Extensions
  }>
>(ctx: Readonly<CommandContext<G>>): Promise<string[]> {
  const messages: string[] = []
  messages.push(`${await ctx.extensions[pluginId].text(resolveBuiltInKey('ARGUMENTS'))}:`)
  messages.push(await generatePositionalArgsUsage(ctx))
  return messages
}

/**
 * Render the optional arguments section
 *
 * @param ctx - A {@link CommandContext | command context}
 * @returns A rendered options section
 */
async function renderOptionalArgsSection<
  G extends GunshiParams<{
    args: Args
    extensions: Extensions
  }>
>(ctx: Readonly<CommandContext<G>>): Promise<string[]> {
  const messages: string[] = []
  messages.push(`${await ctx.extensions[pluginId].text(resolveBuiltInKey('OPTIONS'))}:`)
  messages.push(await generateOptionalArgsUsage(ctx, getOptionalArgsPairs(ctx)))
  return messages
}

/**
 * Render the examples section
 *
 * @param ctx - A {@link CommandContext | command context}
 * @returns A rendered examples section
 */
async function renderExamplesSection<
  G extends GunshiParams<{
    args: Args
    extensions: Extensions
  }>
>(ctx: Readonly<CommandContext<G>>): Promise<string[]> {
  const messages: string[] = []

  const resolvedExamples = await resolveExamples(ctx)
  if (resolvedExamples) {
    const examples = resolvedExamples
      .split('\n')
      .map((example: string) => example.padStart(ctx.env.leftMargin + example.length))
    messages.push(
      `${await ctx.extensions[pluginId].text(resolveBuiltInKey('EXAMPLES'))}:`,
      ...examples
    )
  }

  return messages
}

/**
 * Render the usage section
 *
 * @param ctx - A {@link CommandContext | command context}
 * @returns A rendered usage section
 */
async function renderUsageSection<
  G extends GunshiParams<{
    args: Args
    extensions: Extensions
  }>
>(ctx: Readonly<CommandContext<G>>): Promise<string[]> {
  const messages: string[] = [`${await ctx.extensions[pluginId].text(resolveBuiltInKey('USAGE'))}:`]
  const usageStr = await makeUsageSymbols(ctx)
  messages.push(usageStr.padStart(ctx.env.leftMargin + usageStr.length))
  return messages
}

async function makeUsageSymbols<
  G extends GunshiParams<{
    args: Args
    extensions: Extensions
  }>
>(ctx: Readonly<CommandContext<G>>): Promise<string> {
  const messages = [await resolveEntry(ctx)]
  if (ctx.omitted) {
    if (await hasCommands(ctx)) {
      messages.push(` [${await ctx.extensions[pluginId].text(resolveBuiltInKey('COMMANDS'))}]`)
    } else {
      messages.push(`${ctx.callMode === 'subCommand' ? ` ${await resolveSubCommand(ctx)}` : ''}`)
    }
  } else {
    messages.push(`${ctx.callMode === 'subCommand' ? ` ${await resolveSubCommand(ctx)}` : ''}`)
  }
  const optionsSymbols = await generateOptionsSymbols(ctx, ctx.args)
  if (optionsSymbols) {
    messages.push(' ', optionsSymbols)
  }
  const positionalSymbols = generatePositionalSymbols(ctx.args)
  if (positionalSymbols) {
    messages.push(' ', positionalSymbols)
  }
  return messages.join('')
}

/**
 * Render the commands section
 *
 * @param ctx - A {@link CommandContext | command context}
 * @returns A rendered commands section
 */
async function renderCommandsSection<
  G extends GunshiParams<{
    args: Args
    extensions: Extensions
  }>
>(ctx: Readonly<CommandContext<G>>): Promise<string[]> {
  const messages: string[] = [
    `${await ctx.extensions[pluginId].text(resolveBuiltInKey('COMMANDS'))}:`
  ]
  const loadedCommands = (await ctx.extensions?.[pluginId].loadCommands<G>()) || []
  const commandMaxLength = Math.max(...loadedCommands.map(cmd => (cmd.name || '').length))
  const commandsStr = await Promise.all(
    loadedCommands.map(async cmd => {
      const desc = cmd.description || ''
      const optionSymbol = await generateOptionsSymbols(ctx, ctx.args)
      const positionalSymbol = generatePositionalSymbols(ctx.args)
      const commandStr = await makeCommandSymbol(ctx, cmd)
      const symbolLength =
        desc.length > 0 ? commandMaxLength + optionSymbol.length + positionalSymbol.length : 0
      const command = `${commandStr.padEnd(symbolLength + ctx.env.middleMargin)}${desc}`
      return `${command.padStart(ctx.env.leftMargin + command.length)}`
    })
  )
  messages.push(
    ...commandsStr,
    '',
    `${await ctx.extensions[pluginId].text(resolveBuiltInKey('FORMORE'))}:`
  )
  messages.push(
    ...loadedCommands.map(cmd => {
      let commandStr = cmd.entry ? '' : cmd.name || ''
      if (commandStr) {
        commandStr += ' '
      }
      const commandHelp = `${ctx.env.name} ${commandStr}--help`
      return `${commandHelp.padStart(ctx.env.leftMargin + commandHelp.length)}`
    })
  )
  return messages
}

async function makeCommandSymbol<
  G extends GunshiParams<{
    args: Args
    extensions: Extensions
  }>
>(ctx: CommandContext<G>, cmd: Command): Promise<string> {
  const optionSymbol = await generateOptionsSymbols(ctx, ctx.args)
  const positionalSymbol = generatePositionalSymbols(ctx.args)
  let commandStr = cmd.entry
    ? cmd.name === undefined || cmd.name === ANONYMOUS_COMMAND_NAME
      ? ''
      : `[${cmd.name}]`
    : cmd.name || ''
  if (optionSymbol) {
    if (commandStr) {
      commandStr += ' '
    }
    commandStr += `${optionSymbol}`
  }
  if (positionalSymbol) {
    if (commandStr) {
      commandStr += ' '
    }
    commandStr += `${positionalSymbol}`
  }
  return commandStr
}

/**
 * Resolve the entry command name
 *
 * @param ctx - A {@link CommandContext | command context}
 * @returns The entry command name
 */
async function resolveEntry<
  G extends GunshiParams<{
    args: Args
    extensions: Extensions
  }>
>(ctx: CommandContext<G>): Promise<string> {
  return ctx.env.name || (await ctx.extensions[pluginId].text(resolveBuiltInKey('COMMAND')))
}

/**
 * Resolve the sub command name
 *
 * @param ctx - A {@link CommandContext | command context}
 * @returns The sub command name
 */
async function resolveSubCommand<
  G extends GunshiParams<{
    args: Args
    extensions: Extensions
  }>
>(ctx: Readonly<CommandContext<G>>): Promise<string> {
  return ctx.name || (await ctx.extensions[pluginId].text(resolveBuiltInKey('SUBCOMMAND')))
}

/**
 * Resolve the command description
 *
 * @param ctx - A {@link CommandContext | command context}
 * @returns resolved command description
 */
async function resolveDescription<
  G extends GunshiParams<{
    args: Args
    extensions: Extensions
  }>
>(ctx: CommandContext<G>): Promise<string> {
  return (
    (await ctx.extensions[pluginId].text(resolveKey('description', ctx.name))) ||
    ctx.description ||
    ''
  )
}

/**
 * Resolve the command examples
 *
 * @param ctx - A {@link CommandContext | command context}
 * @returns resolved command examples, if not resolved, return empty string
 */
async function resolveExamples<
  G extends GunshiParams<{
    args: Args
    extensions: Extensions
  }>
>(ctx: CommandContext<G>): Promise<string> {
  const ret = await ctx.extensions[pluginId].text(resolveKey('examples', ctx.name))
  if (ret) {
    return ret
  }
  const command = ctx.env.subCommands?.get(ctx.name || '') as Command<G> | undefined
  return await _resolvedExamples(ctx, command?.examples)
}

/**
 * Check if the command has sub commands
 *
 * @param ctx - A {@link CommandContext | command context}
 * @returns True if the command has sub commands
 */
async function hasCommands<
  G extends GunshiParams<{
    args: Args
    extensions: Extensions
  }>
>(ctx: CommandContext<G>): Promise<boolean> {
  const loadedCommands = (await ctx.extensions?.[pluginId].loadCommands<G>()) || []
  return loadedCommands.length > 1
}

/**
 * Check if the command has optional arguments
 *
 * @param args - A {@link Args | command optional arguments}
 * @returns True if the command has options
 */
function hasOptionalArgs(args: Args): boolean {
  return Object.values(args).some(arg => arg.type !== 'positional')
}

/**
 * Check if the command has positional arguments
 *
 * @param args - A {@link Args | command positional arguments}
 * @returns True if the command has options
 */
function hasPositionalArgs(args: Args): boolean {
  return Object.values(args).some(arg => arg.type === 'positional')
}

/**
 * Check if all options have default values
 *
 * @param args - An {@link Args | command argument}
 * @returns True if all options have default values
 */
function hasAllDefaultOptions(args: Args): boolean {
  return !!(args && Object.values(args).every(arg => arg.default))
}

/**
 * Generate options symbols for usage
 *
 * @param ctx - A {@link CommandContext | command context}
 * @param args - {@link Args | command arguments}
 * @returns Options symbols for usage
 */
async function generateOptionsSymbols<
  G extends GunshiParams<{
    args: Args
    extensions: Extensions
  }>
>(ctx: CommandContext<G>, args: Args): Promise<string> {
  return hasOptionalArgs(args)
    ? hasAllDefaultOptions(args)
      ? `[${await ctx.extensions[pluginId].text(resolveBuiltInKey('OPTIONS'))}]`
      : `<${await ctx.extensions[pluginId].text(resolveBuiltInKey('OPTIONS'))}>`
    : ''
}

/**
 * Get optional arguments pairs for usage
 *
 * @param ctx - A {@link CommandContext | command context}
 * @returns Options pairs for usage
 */
function getOptionalArgsPairs<G extends GunshiParams>(
  ctx: CommandContext<G>
): Record<string, string> {
  return Object.entries(ctx.args).reduce(
    (acc, [name, schema]) => {
      if (schema.type === 'positional') {
        return acc
      }
      let key = makeShortLongOptionPair(schema, name, ctx.toKebab)
      if (schema.type !== 'boolean') {
        // Convert parameter placeholders to kebab-case format when toKebab is enabled
        const displayName = ctx.toKebab || schema.toKebab ? kebabnize(name) : name
        key = schema.default ? `${key} [${displayName}]` : `${key} <${displayName}>`
      }
      acc[name] = key
      if (schema.type === 'boolean' && schema.negatable && !COMMON_ARGS_KEYS.includes(name)) {
        // Convert parameter placeholders to kebab-case format when toKebab is enabled
        const displayName = ctx.toKebab || schema.toKebab ? kebabnize(name) : name
        acc[`${ARG_NEGATABLE_PREFIX}${name}`] = `--${ARG_NEGATABLE_PREFIX}${displayName}`
      }
      return acc
    },
    Object.create(null) as Record<string, string>
  )
}

const resolveNegatableKey = (key: string): string => key.split(ARG_NEGATABLE_PREFIX)[1]

function resolveNegatableType<G extends GunshiParams>(
  key: string,
  ctx: Readonly<CommandContext<G>>
) {
  return ctx.args[key.startsWith(ARG_NEGATABLE_PREFIX) ? resolveNegatableKey(key) : key].type
}

async function generateDefaultDisplayValue<
  G extends GunshiParams<{
    args: Args
    extensions: Extensions
  }>
>(ctx: Readonly<CommandContext<G>>, schema: ArgSchema): Promise<string> {
  return `${await ctx.extensions[pluginId].text(resolveBuiltInKey('DEFAULT'))}: ${schema.default}`
}

async function resolveDisplayValue<
  G extends GunshiParams<{
    args: Args
    extensions: Extensions
  }>
>(ctx: Readonly<CommandContext<G>>, key: string): Promise<string> {
  if (COMMON_ARGS_KEYS.includes(key)) {
    return ''
  }

  const schema = ctx.args[key]
  if (
    (schema.type === 'boolean' ||
      schema.type === 'number' ||
      schema.type === 'string' ||
      schema.type === 'custom') &&
    schema.default !== undefined
  ) {
    return `(${await generateDefaultDisplayValue(ctx, schema)})`
  }
  if (schema.type === 'enum') {
    const _default =
      schema.default === undefined ? '' : await generateDefaultDisplayValue(ctx, schema)
    const choices = `${await ctx.extensions[pluginId].text(resolveBuiltInKey('CHOICES'))}: ${schema.choices!.join(' | ')}`
    return `(${_default ? `${_default}, ${choices}` : choices})`
  }

  return ''
}

/**
 * Generate optional arguments usage
 *
 * @param ctx - A {@link CommandContext | command context}
 * @param optionsPairs - Options pairs for usage
 * @returns Generated options usage
 */
async function generateOptionalArgsUsage<
  G extends GunshiParams<{
    args: Args
    extensions: Extensions
  }>
>(ctx: CommandContext<G>, optionsPairs: Record<string, string>): Promise<string> {
  const optionsMaxLength = Math.max(
    ...Object.entries(optionsPairs).map(([_, value]) => value.length)
  )

  const optionSchemaMaxLength = ctx.env.usageOptionType
    ? Math.max(
        ...Object.entries(optionsPairs).map(([key]) => resolveNegatableType(key, ctx).length)
      )
    : 0

  const usages = await Promise.all(
    Object.entries(optionsPairs).map(async ([key, value]) => {
      let rawDesc = await ctx.extensions[pluginId].text(resolveArgKey(key, ctx.name))
      if (!rawDesc && key.startsWith(ARG_NEGATABLE_PREFIX)) {
        const name = resolveNegatableKey(key)
        const schema = ctx.args[name]
        const optionKey = makeShortLongOptionPair(schema, name, ctx.toKebab)
        rawDesc = `${await ctx.extensions[pluginId].text(resolveBuiltInKey('NEGATABLE'))} ${optionKey}`
      }
      const optionsSchema = ctx.env.usageOptionType ? `[${resolveNegatableType(key, ctx)}] ` : ''
      const valueDesc = key.startsWith(ARG_NEGATABLE_PREFIX)
        ? ''
        : await resolveDisplayValue(ctx, key)
      // padEnd is used to align the `[]` symbols
      const desc = `${optionsSchema ? optionsSchema.padEnd(optionSchemaMaxLength + 3) : ''}${rawDesc}`
      const descLength = desc.length + valueDesc.length
      const option = `${value.padEnd((descLength > 0 ? optionsMaxLength : 0) + ctx.env.middleMargin)}${desc}${valueDesc ? ` ${valueDesc}` : ''}`
      return `${option.padStart(ctx.env.leftMargin + option.length)}`
    })
  )

  return usages.join('\n')
}

function getPositionalArgs(args: Args): [string, ArgSchema][] {
  return Object.entries(args).filter(([_, schema]) => schema.type === 'positional')
}

async function generatePositionalArgsUsage<
  G extends GunshiParams<{
    args: Args
    extensions: Extensions
  }>
>(ctx: CommandContext<G>): Promise<string> {
  const positionals = getPositionalArgs(ctx.args)
  const argsMaxLength = Math.max(...positionals.map(([name]) => name.length))

  const usages = await Promise.all(
    positionals.map(async ([name]) => {
      const desc =
        (await ctx.extensions[pluginId].text(resolveArgKey(name, ctx.name))) ||
        (ctx.args[name] as ArgSchema & { description?: string }).description ||
        ''
      const arg = `${name.padEnd(argsMaxLength + ctx.env.middleMargin)} ${desc}`
      return `${arg.padStart(ctx.env.leftMargin + arg.length)}`
    })
  )

  return usages.join('\n')
}

function generatePositionalSymbols(args: Args): string {
  return hasPositionalArgs(args)
    ? getPositionalArgs(args)
        .map(([name]) => `<${name}>`)
        .join(' ')
    : ''
}
