/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import {
  ARG_NEGATABLE_PREFIX,
  COMMON_ARGS,
  resolveExamples as _resolvedExamples,
  kebabnize,
  resolveArgKey,
  resolveBuiltInKey
} from '@gunshi/shared'

import type {
  ArgSchema,
  Args,
  Command,
  CommandContext,
  DefaultGunshiParams,
  GunshiParams
} from '@gunshi/plugin'
import type { UsageRendererCommandContext } from './types.ts'

const COMMON_ARGS_KEYS = Object.keys(COMMON_ARGS)

/**
 * Render the usage.
 * @param ctx A {@link CommandContext | command context}
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
  if (hasPositionalArgs(ctx)) {
    messages.push(...(await renderPositionalArgsSection(ctx)), '')
  }

  // render optional arguments section
  if (hasOptionalArgs(ctx)) {
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
 * @param ctx A {@link CommandContext | command context}
 * @returns A rendered arguments section
 */
async function renderPositionalArgsSection<
  G extends GunshiParams<{ args: Args; extensions: { renderer: UsageRendererCommandContext } }>
>(ctx: Readonly<CommandContext<G>>): Promise<string[]> {
  const messages: string[] = []
  messages.push(`${await ctx.extensions!.renderer.text(resolveBuiltInKey('ARGUMENTS'))}:`)
  messages.push(await generatePositionalArgsUsage(ctx))
  return messages
}

/**
 * Render the optional arguments section
 * @param ctx A {@link CommandContext | command context}
 * @returns A rendered options section
 */
async function renderOptionalArgsSection<
  G extends GunshiParams<{ args: Args; extensions: { renderer: UsageRendererCommandContext } }>
>(ctx: Readonly<CommandContext<G>>): Promise<string[]> {
  const messages: string[] = []
  messages.push(`${await ctx.extensions!.renderer.text(resolveBuiltInKey('OPTIONS'))}:`)
  messages.push(await generateOptionalArgsUsage(ctx, getOptionalArgsPairs(ctx)))
  return messages
}

/**
 * Render the examples section
 * @param ctx A {@link CommandContext | command context}
 * @returns A rendered examples section
 */
async function renderExamplesSection<
  G extends GunshiParams<{ args: Args; extensions: { renderer: UsageRendererCommandContext } }>
>(ctx: Readonly<CommandContext<G>>): Promise<string[]> {
  const messages: string[] = []

  const resolvedExamples = await resolveExamples(ctx)
  if (resolvedExamples) {
    const examples = resolvedExamples
      .split('\n')
      .map((example: string) => example.padStart(ctx.env.leftMargin + example.length))
    messages.push(
      `${await ctx.extensions!.renderer.text(resolveBuiltInKey('EXAMPLES'))}:`,
      ...examples
    )
  }

  return messages
}

/**
 * Render the usage section
 * @param ctx A {@link CommandContext | command context}
 * @returns A rendered usage section
 */
async function renderUsageSection<
  G extends GunshiParams<{ args: Args; extensions: { renderer: UsageRendererCommandContext } }>
>(ctx: Readonly<CommandContext<G>>): Promise<string[]> {
  const messages: string[] = [`${await ctx.extensions!.renderer.text(resolveBuiltInKey('USAGE'))}:`]
  if (ctx.omitted) {
    const defaultCommand = `${await resolveEntry(ctx)}${(await hasCommands(ctx)) ? ` [${await resolveSubCommand(ctx)}]` : ''} ${[await generateOptionsSymbols(ctx), generatePositionalSymbols(ctx)].filter(Boolean).join(' ')}`
    messages.push(defaultCommand.padStart(ctx.env.leftMargin + defaultCommand.length))
    if (await hasCommands(ctx)) {
      const commandsUsage = `${await resolveEntry(ctx)} <${await ctx.extensions!.renderer.text(resolveBuiltInKey('COMMANDS'))}>`
      messages.push(commandsUsage.padStart(ctx.env.leftMargin + commandsUsage.length))
    }
  } else {
    const usageStr = `${await resolveEntry(ctx)} ${await resolveSubCommand(ctx)} ${[await generateOptionsSymbols(ctx), generatePositionalSymbols(ctx)].filter(Boolean).join(' ')}`
    messages.push(usageStr.padStart(ctx.env.leftMargin + usageStr.length))
  }
  return messages
}

/**
 * Render the commands section
 * @param ctx A {@link CommandContext | command context}
 * @returns A rendered commands section
 */
async function renderCommandsSection<
  G extends GunshiParams<{
    args: Args
    extensions: {
      renderer: UsageRendererCommandContext
    }
  }>
>(ctx: Readonly<CommandContext<G>>): Promise<string[]> {
  const messages: string[] = [
    `${await ctx.extensions!.renderer.text(resolveBuiltInKey('COMMANDS'))}:`
  ]
  const loadedCommands = (await ctx.extensions?.renderer.loadCommands<G>()) || []
  const commandMaxLength = Math.max(...loadedCommands.map(cmd => (cmd.name || '').length))
  const commandsStr = await Promise.all(
    loadedCommands.map(cmd => {
      const key = cmd.name || ''
      const desc = cmd.description || ''
      const command = `${key.padEnd(commandMaxLength + ctx.env.middleMargin)}${desc} `
      return `${command.padStart(ctx.env.leftMargin + command.length)} `
    })
  )
  messages.push(
    ...commandsStr,
    '',
    `${await ctx.extensions!.renderer.text(resolveBuiltInKey('FORMORE'))}:`
  )
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
async function resolveEntry<
  G extends GunshiParams<{ args: Args; extensions: { renderer: UsageRendererCommandContext } }>
>(ctx: CommandContext<G>): Promise<string> {
  return ctx.env.name || (await ctx.extensions!.renderer.text(resolveBuiltInKey('COMMAND')))
}

/**
 * Resolve the sub command name
 * @param ctx A {@link CommandContext | command context}
 * @returns The sub command name
 */
async function resolveSubCommand<
  G extends GunshiParams<{ args: Args; extensions: { renderer: UsageRendererCommandContext } }>
>(ctx: Readonly<CommandContext<G>>): Promise<string> {
  return ctx.name || (await ctx.extensions!.renderer.text(resolveBuiltInKey('SUBCOMMAND')))
}

/**
 * Resolve the command description
 * @param ctx A {@link CommandContext | command context}
 * @returns resolved command description
 */
async function resolveDescription<
  G extends GunshiParams<{ args: Args; extensions: { renderer: UsageRendererCommandContext } }>
>(ctx: CommandContext<G>): Promise<string> {
  return (await ctx.extensions!.renderer.text('description')) || ctx.description || ''
}

/**
 * Resolve the command examples
 * @param ctx A {@link CommandContext | command context}
 * @returns resolved command examples, if not resolved, return empty string
 */
async function resolveExamples<
  G extends GunshiParams<{ args: Args; extensions: { renderer: UsageRendererCommandContext } }>
>(ctx: CommandContext<G>): Promise<string> {
  const ret = await ctx.extensions!.renderer.text('examples')
  if (ret) {
    return ret
  }
  const command = ctx.env.subCommands?.get(ctx.name || '') as Command<G> | undefined
  return await _resolvedExamples(ctx, command?.examples)
}

/**
 * Check if the command has sub commands
 * @param ctx A {@link CommandContext | command context}
 * @returns True if the command has sub commands
 */
async function hasCommands<
  G extends GunshiParams<{
    args: Args
    extensions: {
      renderer: UsageRendererCommandContext
    }
  }>
>(ctx: CommandContext<G>): Promise<boolean> {
  const loadedCommands = (await ctx.extensions?.renderer.loadCommands<G>()) || []
  return loadedCommands.length > 1
}

/**
 * Check if the command has optional arguments
 * @param ctx A {@link CommandContext | command context}
 * @returns True if the command has options
 */
function hasOptionalArgs<G extends GunshiParams>(ctx: CommandContext<G>): boolean {
  return !!(ctx.args && Object.values(ctx.args).some(arg => arg.type !== 'positional'))
}

/**
 * Check if the command has positional arguments
 * @param ctx A {@link CommandContext | command context}
 * @returns True if the command has options
 */
function hasPositionalArgs<G extends GunshiParams>(ctx: CommandContext<G>): boolean {
  return !!(ctx.args && Object.values(ctx.args).some(arg => arg.type === 'positional'))
}

/**
 * Check if all options have default values
 * @param ctx A {@link CommandContext | command context}
 * @returns True if all options have default values
 */
function hasAllDefaultOptions<G extends GunshiParams>(ctx: CommandContext<G>): boolean {
  return !!(ctx.args && Object.values(ctx.args).every(arg => arg.default))
}

/**
 * Generate options symbols for usage
 * @param ctx A {@link CommandContext | command context}
 * @returns Options symbols for usage
 */
async function generateOptionsSymbols<
  G extends GunshiParams<{ args: Args; extensions: { renderer: UsageRendererCommandContext } }>
>(ctx: CommandContext<G>): Promise<string> {
  return hasOptionalArgs(ctx)
    ? hasAllDefaultOptions(ctx)
      ? `[${await ctx.extensions!.renderer.text(resolveBuiltInKey('OPTIONS'))}]`
      : `<${await ctx.extensions!.renderer.text(resolveBuiltInKey('OPTIONS'))}>`
    : ''
}

export function makeShortLongOptionPair(
  schema: ArgSchema,
  name: string,
  toKebab?: boolean
): string {
  // Convert camelCase to kebab-case for display in help text if toKebab is true
  const displayName = toKebab || schema.toKebab ? kebabnize(name) : name
  let key = `--${displayName}`
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
function getOptionalArgsPairs<G extends GunshiParams>(
  ctx: CommandContext<G>
): Record<string, string> {
  return Object.entries(ctx.args).reduce((acc, [name, schema]) => {
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
  }, Object.create(null))
}

const resolveNegatableKey = (key: string): string => key.split(ARG_NEGATABLE_PREFIX)[1]

function resolveNegatableType<G extends GunshiParams>(
  key: string,
  ctx: Readonly<CommandContext<G>>
) {
  return ctx.args[key.startsWith(ARG_NEGATABLE_PREFIX) ? resolveNegatableKey(key) : key].type
}

async function generateDefaultDisplayValue<
  G extends GunshiParams<{ args: Args; extensions: { renderer: UsageRendererCommandContext } }>
>(ctx: Readonly<CommandContext<G>>, schema: ArgSchema): Promise<string> {
  return `${await ctx.extensions!.renderer.text(resolveBuiltInKey('DEFAULT'))}: ${schema.default}`
}

async function resolveDisplayValue<
  G extends GunshiParams<{ args: Args; extensions: { renderer: UsageRendererCommandContext } }>
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
      schema.default !== undefined // eslint-disable-line unicorn/no-negated-condition
        ? await generateDefaultDisplayValue(ctx, schema)
        : ''
    const choices = `${await ctx.extensions!.renderer.text(resolveBuiltInKey('CHOICES'))}: ${schema.choices!.join(' | ')}`
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
async function generateOptionalArgsUsage<
  G extends GunshiParams<{ args: Args; extensions: { renderer: UsageRendererCommandContext } }>
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
      let rawDesc = await ctx.extensions!.renderer.text(resolveArgKey(key))
      if (!rawDesc && key.startsWith(ARG_NEGATABLE_PREFIX)) {
        const name = resolveNegatableKey(key)
        const schema = ctx.args[name]
        const optionKey = makeShortLongOptionPair(schema, name, ctx.toKebab)
        rawDesc = `${await ctx.extensions!.renderer.text(resolveBuiltInKey('NEGATABLE'))} ${optionKey}`
      }
      const optionsSchema = ctx.env.usageOptionType ? `[${resolveNegatableType(key, ctx)}] ` : ''
      const valueDesc = key.startsWith(ARG_NEGATABLE_PREFIX)
        ? ''
        : await resolveDisplayValue(ctx, key)
      // padEnd is used to align the `[]` symbols
      const desc = `${optionsSchema ? optionsSchema.padEnd(optionSchemaMaxLength + 3) : ''}${rawDesc}`
      const option = `${value.padEnd(optionsMaxLength + ctx.env.middleMargin)}${desc}${valueDesc ? ` ${valueDesc}` : ''}`
      return `${option.padStart(ctx.env.leftMargin + option.length)}`
    })
  )

  return usages.join('\n')
}

function getPositionalArgs<G extends GunshiParams>(ctx: CommandContext<G>): [string, ArgSchema][] {
  return Object.entries(ctx.args).filter(([_, schema]) => schema.type === 'positional')
}

async function generatePositionalArgsUsage<
  G extends GunshiParams<{ args: Args; extensions: { renderer: UsageRendererCommandContext } }>
>(ctx: CommandContext<G>): Promise<string> {
  const positionals = getPositionalArgs(ctx)
  const argsMaxLength = Math.max(...positionals.map(([name]) => name.length))

  const usages = await Promise.all(
    positionals.map(async ([name]) => {
      const desc =
        (await ctx.extensions!.renderer.text(resolveArgKey(name))) ||
        (ctx.args[name] as ArgSchema & { description?: string }).description ||
        ''
      const arg = `${name.padEnd(argsMaxLength + ctx.env.middleMargin)} ${desc}`
      return `${arg.padStart(ctx.env.leftMargin + arg.length)}`
    })
  )

  return usages.join('\n')
}

function generatePositionalSymbols<G extends GunshiParams>(ctx: CommandContext<G>): string {
  return hasPositionalArgs(ctx)
    ? getPositionalArgs(ctx)
        .map(([name]) => `<${name}>`)
        .join(' ')
    : ''
}
