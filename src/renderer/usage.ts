/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { COMMON_ARGS } from '../constants.ts'
import { create, resolveArgKey, resolveBuiltInKey } from '../utils.ts'

import type { Args, ArgSchema } from 'args-tokens'
import type { Command, CommandContext } from '../types.ts'

const COMMON_ARGS_KEYS = Object.keys(COMMON_ARGS)

/**
 * Render the usage.
 * @param ctx A {@link CommandContext | command context}
 * @returns A rendered usage.
 */
export async function renderUsage<A extends Args = Args>(
  ctx: Readonly<CommandContext<A>>
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

  // render positional arguments section
  if (hasPositionalArgs(ctx)) {
    messages.push(...(await renderPositionalArgsSection(ctx)), '')
  }

  // render optional arguments section
  if (hasOptionalArgs(ctx)) {
    messages.push(...(await renderOptionalArgsSection(ctx)), '')
  }

  // render examples section
  const examples = renderExamplesSection(ctx)
  if (examples.length > 0) {
    messages.push(...examples, '')
  }

  return messages.join('\n')
}

/**
 * Render the positional arguments section
 * @param ctx A {@link CommandContext | command context}
 * @returns A rendered arguments section
 */
async function renderPositionalArgsSection<A extends Args>(
  ctx: Readonly<CommandContext<A>>
): Promise<string[]> {
  const messages: string[] = []
  messages.push(`${ctx.translate(resolveBuiltInKey('ARGUMENTS'))}:`)
  messages.push(await generatePositionalArgsUsage(ctx))
  return messages
}

/**
 * Render the optional arguments section
 * @param ctx A {@link CommandContext | command context}
 * @returns A rendered options section
 */
async function renderOptionalArgsSection<A extends Args>(
  ctx: Readonly<CommandContext<A>>
): Promise<string[]> {
  const messages: string[] = []
  messages.push(`${ctx.translate(resolveBuiltInKey('OPTIONS'))}:`)
  messages.push(await generateOptionalArgsUsage(ctx, getOptionalArgsPairs(ctx)))
  return messages
}

/**
 * Render the examples section
 * @param ctx A {@link CommandContext | command context}
 * @returns A rendered examples section
 */
function renderExamplesSection<A extends Args>(ctx: Readonly<CommandContext<A>>): string[] {
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
async function renderUsageSection<A extends Args>(
  ctx: Readonly<CommandContext<A>>
): Promise<string[]> {
  const messages: string[] = [`${ctx.translate(resolveBuiltInKey('USAGE'))}:`]
  if (ctx.omitted) {
    const defaultCommand = `${resolveEntry(ctx)}${(await hasCommands(ctx)) ? ` [${resolveSubCommand(ctx)}]` : ''} ${[generateOptionsSymbols(ctx), generatePositionalSymbols(ctx)].filter(Boolean).join(' ')}`
    messages.push(defaultCommand.padStart(ctx.env.leftMargin + defaultCommand.length))
    if (await hasCommands(ctx)) {
      const commandsUsage = `${resolveEntry(ctx)} <${ctx.translate(resolveBuiltInKey('COMMANDS'))}>`
      messages.push(commandsUsage.padStart(ctx.env.leftMargin + commandsUsage.length))
    }
  } else {
    const usageStr = `${resolveEntry(ctx)} ${resolveSubCommand(ctx)} ${[generateOptionsSymbols(ctx), generatePositionalSymbols(ctx)].filter(Boolean).join(' ')}`
    messages.push(usageStr.padStart(ctx.env.leftMargin + usageStr.length))
  }
  return messages
}

/**
 * Render the commands section
 * @param ctx A {@link CommandContext | command context}
 * @returns A rendered commands section
 */
async function renderCommandsSection<A extends Args>(
  ctx: Readonly<CommandContext<A>>
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
function resolveEntry<A extends Args>(ctx: CommandContext<A>): string {
  return ctx.env.name || ctx.translate(resolveBuiltInKey('COMMAND'))
}

/**
 * Resolve the sub command name
 * @param ctx A {@link CommandContext | command context}
 * @returns The sub command name
 */
function resolveSubCommand<A extends Args>(ctx: Readonly<CommandContext<A>>): string {
  return ctx.name || ctx.translate(resolveBuiltInKey('SUBCOMMAND'))
}

/**
 * Resolve the command description
 * @param ctx A {@link CommandContext | command context}
 * @returns resolved command description
 */
function resolveDescription<A extends Args>(ctx: CommandContext<A>): string {
  return ctx.translate('description') || ctx.description || ''
}

/**
 * Resolve the command examples
 * @param ctx A {@link CommandContext | command context}
 * @returns resolved command examples, if not resolved, return empty string
 */
function resolveExamples<A extends Args>(ctx: CommandContext<A>): string {
  const ret = ctx.translate('examples')
  if (ret) {
    return ret
  }
  const command = ctx.env.subCommands?.get(ctx.name || '') as Command<A> | undefined
  return command?.examples ?? ''
}

/**
 * Check if the command has sub commands
 * @param ctx A {@link CommandContext | command context}
 * @returns True if the command has sub commands
 */
async function hasCommands<A extends Args>(ctx: CommandContext<A>): Promise<boolean> {
  const loadedCommands = await ctx.loadCommands()
  return loadedCommands.length > 1
}

/**
 * Check if the command has optional arguments
 * @param ctx A {@link CommandContext | command context}
 * @returns True if the command has options
 */
function hasOptionalArgs<A extends Args>(ctx: CommandContext<A>): boolean {
  return !!(ctx.args && Object.values(ctx.args).some(arg => arg.type !== 'positional'))
}

/**
 * Check if the command has positional arguments
 * @param ctx A {@link CommandContext | command context}
 * @returns True if the command has options
 */
function hasPositionalArgs<A extends Args>(ctx: CommandContext<A>): boolean {
  return !!(ctx.args && Object.values(ctx.args).some(arg => arg.type === 'positional'))
}

/**
 * Check if all options have default values
 * @param ctx A {@link CommandContext | command context}
 * @returns True if all options have default values
 */
function hasAllDefaultOptions<A extends Args>(ctx: CommandContext<A>): boolean {
  return !!(ctx.args && Object.values(ctx.args).every(arg => arg.default))
}

/**
 * Generate options symbols for usage
 * @param ctx A {@link CommandContext | command context}
 * @returns Options symbols for usage
 */
function generateOptionsSymbols<A extends Args>(ctx: CommandContext<A>): string {
  return hasOptionalArgs(ctx)
    ? hasAllDefaultOptions(ctx)
      ? `[${ctx.translate(resolveBuiltInKey('OPTIONS'))}]`
      : `<${ctx.translate(resolveBuiltInKey('OPTIONS'))}>`
    : ''
}

function makeShortLongOptionPair(schema: ArgSchema, name: string): string {
  let key = `--${name}`
  if (schema.short) {
    key = `-${schema.short}, ${key}`
  }
  return key
}

/**
 * Get optional arguments pairs for usage
 * @param ctx A {@link CommandContext | command context}
 * @returns Options pairs for usage
 */
function getOptionalArgsPairs<A extends Args>(ctx: CommandContext<A>): Record<string, string> {
  return Object.entries(ctx.args).reduce((acc, [name, value]) => {
    if (value.type === 'positional') {
      return acc
    }
    let key = makeShortLongOptionPair(value, name)
    if (value.type !== 'boolean') {
      key = value.default ? `${key} [${name}]` : `${key} <${name}>`
    }
    acc[name] = key
    if (value.type === 'boolean' && value.negatable && !COMMON_ARGS_KEYS.includes(name)) {
      acc[`no-${name}`] = `--no-${name}`
    }
    return acc
  }, create<Record<string, string>>())
}

const resolveNegatableKey = (key: string): string => key.split('no-')[1]

function resolveNegatableType<A extends Args>(key: string, ctx: Readonly<CommandContext<A>>) {
  return ctx.args[key.startsWith('no-') ? resolveNegatableKey(key) : key].type
}

function generateDefaultDisplayValue<A extends Args>(
  ctx: Readonly<CommandContext<A>>,
  schema: ArgSchema
): string {
  return `${ctx.translate(resolveBuiltInKey('DEFAULT'))}: ${schema.default}`
}

function resolveDisplayValue<A extends Args>(
  ctx: Readonly<CommandContext<A>>,
  key: string
): string {
  if (COMMON_ARGS_KEYS.includes(key)) {
    return ''
  }

  const schema = ctx.args[key]
  if (
    (schema.type === 'boolean' || schema.type === 'number' || schema.type === 'string') &&
    schema.default !== undefined
  ) {
    return `(${generateDefaultDisplayValue(ctx, schema)})`
  }
  if (schema.type === 'enum') {
    const _default =
      schema.default !== undefined // eslint-disable-line unicorn/no-negated-condition
        ? generateDefaultDisplayValue(ctx, schema)
        : ''
    const choices = `${ctx.translate(resolveBuiltInKey('CHOICES'))}: ${schema.choices!.join(' | ')}`
    return `(${_default ? `${_default}, ${choices}` : choices})`
  }

  return ''
}

/**
 * Generate optional arguments usage
 * @param ctx A {@link CommandContext | command context}
 * @param optionsPairs Options pairs for usage
 * @returns Generated options usage
 */
async function generateOptionalArgsUsage<A extends Args>(
  ctx: CommandContext<A>,
  optionsPairs: Record<string, string>
): Promise<string> {
  const optionsMaxLength = Math.max(
    ...Object.entries(optionsPairs).map(([_, value]) => value.length)
  )

  const optionSchemaMaxLength = ctx.env.usageOptionType
    ? Math.max(
        ...Object.entries(optionsPairs).map(([key, _]) => resolveNegatableType(key, ctx).length)
      )
    : 0

  const usages = await Promise.all(
    Object.entries(optionsPairs).map(([key, value]) => {
      let rawDesc = ctx.translate(resolveArgKey(key))
      if (!rawDesc && key.startsWith('no-')) {
        const name = resolveNegatableKey(key)
        const schema = ctx.args[name]
        const optionKey = makeShortLongOptionPair(schema, name)
        rawDesc = `${ctx.translate(resolveBuiltInKey('NEGATABLE'))} ${optionKey}`
      }
      const optionsSchema = ctx.env.usageOptionType ? `[${resolveNegatableType(key, ctx)}] ` : ''
      const valueDesc = key.startsWith('no-') ? '' : resolveDisplayValue(ctx, key)
      // padEnd is used to align the `[]` symbols
      const desc = `${optionsSchema ? optionsSchema.padEnd(optionSchemaMaxLength + 3) : ''}${rawDesc}`
      const option = `${value.padEnd(optionsMaxLength + ctx.env.middleMargin)}${desc}${valueDesc ? ` ${valueDesc}` : ''}`
      return `${option.padStart(ctx.env.leftMargin + option.length)}`
    })
  )

  return usages.join('\n')
}

async function generatePositionalArgsUsage<A extends Args>(
  ctx: CommandContext<A>
): Promise<string> {
  const positionals = getPositionalArgs(ctx)
  const argsMaxLength = Math.max(...positionals.map(([name, _]) => name.length))

  const usages = await Promise.all(
    positionals.map(([name, _]) => {
      const desc =
        ctx.translate(resolveArgKey(name)) ||
        (ctx.args[name] as ArgSchema & { description?: string }).description ||
        ''
      const arg = `${name.padEnd(argsMaxLength + ctx.env.middleMargin)} ${desc}`
      return `${arg.padStart(ctx.env.leftMargin + arg.length)}`
    })
  )

  return usages.join('\n')
}

function generatePositionalSymbols<A extends Args>(ctx: CommandContext<A>): string {
  return hasPositionalArgs(ctx)
    ? `${getPositionalArgs(ctx)
        .map(([name, _], __) => `<${name}>`)
        .join(' ')}`
    : ''
}
