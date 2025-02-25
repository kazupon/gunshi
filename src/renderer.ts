import {
  generateOptionsUsage,
  getOptionsPairs,
  nullObject,
  resolveCommandUsageRender,
  resolveLazyCommand
} from './utils.js'

import type { ArgOptions } from 'args-tokens'
import type { Command, CommandContext, LazyCommand } from './types'

export function renderHeader<Options extends ArgOptions>(
  ctx: Readonly<CommandContext<Options>>
): Promise<string> {
  const title = ctx.env.description || ctx.env.name || ''
  return Promise.resolve(
    title
      ? `${title} (${ctx.env.name || ''}${ctx.env.version ? ` v${ctx.env.version}` : ''})`
      : title
  )
}

export async function renderUsage<Options extends ArgOptions>(
  ctx: Readonly<CommandContext<Options>>
): Promise<string> {
  const messages: string[] = []

  // render description
  if (ctx.description) {
    messages.push(await resolveCommandUsageRender(ctx, ctx.description), '')
  }

  // render usage
  const usageStr = `${resolveEntry(ctx)} ${ctx.name} ${generateOptionsSymbols(ctx)}`
  messages.push(`USAGE:`, usageStr.padStart(ctx.commandOptions.leftMargin + usageStr.length), '')

  // render options
  if (hasOptions(ctx)) {
    messages.push('OPTIONS:')
    const optionsPairs = getOptionsPairs(ctx)
    messages.push(await generateOptionsUsage(ctx, optionsPairs), '')
  }

  // render examples
  if (ctx.usage.examples) {
    const resolved = await resolveCommandUsageRender(ctx, ctx.usage.examples)
    const examples = resolved
      .split('\n')
      .map(example => example.padStart(ctx.commandOptions.leftMargin + example.length))
    messages.push(`EXAMPLES: `, ...examples, '')
  }

  return messages.join('\n')
}

export async function renderUsageDefault<Options extends ArgOptions>(
  ctx: Readonly<CommandContext<Options>>
): Promise<string> {
  const subCommands =
    ctx.env.subCommands || nullObject<Record<string, Command<Options> | LazyCommand<Options>>>()
  const loadedCommands = await Promise.all(
    Object.entries(subCommands).map(async ([_, cmd]) => await resolveLazyCommand(cmd))
  )

  const hasManyCommands = loadedCommands.length > 1
  const defaultCommand = `${resolveEntry(ctx)}${hasManyCommands ? ` [${ctx.name}]` : ''} ${hasOptions(ctx) ? '<OPTIONS>' : ''} `

  // render usage
  const messages = [
    'USAGE:',
    defaultCommand.padStart(ctx.commandOptions.leftMargin + defaultCommand.length)
  ]

  // render commands
  if (hasManyCommands) {
    const commandsUsage = `${resolveEntry(ctx)} <COMMANDS>`
    messages.push(
      commandsUsage.padStart(ctx.commandOptions.leftMargin + commandsUsage.length),
      '',
      'COMMANDS:'
    )
    const commandMaxLength = Math.max(...loadedCommands.map(cmd => cmd.name.length))
    const commandsStr = await Promise.all(
      loadedCommands.map(async cmd => {
        const key = cmd.name
        const desc = await resolveCommandUsageRender(
          ctx as CommandContext<Options>,
          cmd.description || ''
        )
        const command = `${key.padEnd(commandMaxLength + ctx.commandOptions.middleMargin)}${desc} `
        return `${command.padStart(ctx.commandOptions.leftMargin + command.length)} `
      })
    )
    messages.push(...commandsStr, '', `For more info, run any command with the \`--help\` flag:`)
    // eslint-disable-next-line unicorn/no-array-push-push
    messages.push(
      ...loadedCommands.map(cmd => {
        const commandHelp = `${ctx.env.name} ${cmd.name} --help`
        return `${commandHelp.padStart(ctx.commandOptions.leftMargin + commandHelp.length)}`
      })
    )
  }
  messages.push('')

  // render options
  if (hasOptions(ctx)) {
    messages.push('OPTIONS:')
    const optionsPairs = getOptionsPairs(ctx)
    messages.push(await generateOptionsUsage(ctx, optionsPairs), '')
  }

  // render examples
  if (ctx.usage.examples) {
    const resolved = await resolveCommandUsageRender(ctx, ctx.usage.examples)
    const examples = resolved
      .split('\n')
      .map(example => example.padStart(ctx.commandOptions.leftMargin + example.length))
    messages.push(`EXAMPLES:`, ...examples)
  }
  messages.push('')

  return messages.join('\n')
}

export function renderValidationErrors<Options extends ArgOptions>(
  ctx: CommandContext<Options>,
  error: AggregateError
): Promise<string> {
  const messages = [] as string[]
  for (const err of error.errors as Error[]) {
    messages.push(err.message)
  }
  messages.push('', `For more info, run \`${resolveEntry(ctx)} ${ctx.name} --help\``)
  return Promise.resolve(messages.join('\n'))
}

function resolveEntry<Options extends ArgOptions>(ctx: Readonly<CommandContext<Options>>): string {
  return ctx.env.name || 'COMMAND'
}

function hasOptions<Options extends ArgOptions>(ctx: CommandContext<Options>): boolean {
  return !!(ctx.options && Object.keys(ctx.options).length > 0)
}

function hasAllDefaultOptions<Options extends ArgOptions>(ctx: CommandContext<Options>): boolean {
  return !!(ctx.options && Object.values(ctx.options).every(opt => opt.default))
}

function generateOptionsSymbols<Options extends ArgOptions>(ctx: CommandContext<Options>): string {
  return hasOptions(ctx) ? (hasAllDefaultOptions(ctx) ? '[OPTIONS]' : '<OPTIONS>') : ''
}
