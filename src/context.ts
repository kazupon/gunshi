import { COMMAND_OPTIONS_DEFAULT, COMMON_OPTIONS_USAGE } from './constants.js'
import { create, deepFreeze, resolveLazyCommand } from './utils.js'

import type { ArgOptions, ArgOptionSchema, ArgValues } from 'args-tokens'
import type { Command, CommandContext, CommandEnvironment, CommandOptions } from './types'

export function createCommandContext<Options extends ArgOptions, Values = ArgValues<Options>>({
  options,
  values,
  positionals,
  command,
  commandOptions,
  omitted = false
}: {
  options: Options | undefined
  values: Values
  positionals: string[]
  omitted: boolean
  command: Command<Options>
  commandOptions: CommandOptions<Options>
}): Readonly<CommandContext<Options, Values>> {
  const _options =
    options == undefined
      ? undefined
      : // eslint-disable-next-line unicorn/no-array-reduce
        Object.entries(options as ArgOptions).reduce((acc, [key, value]) => {
          acc[key] = Object.assign(create<ArgOptionSchema>(), value)
          return acc
        }, create<ArgOptions>())
  const _values = Object.assign(create<ArgValues<Options>>(), values)
  const usage = Object.assign(create<Options>(), command.usage)
  usage.options = Object.assign(create<Options>(), usage.options, COMMON_OPTIONS_USAGE)
  const env = Object.assign(
    create<CommandEnvironment<Options>>(),
    COMMAND_OPTIONS_DEFAULT,
    commandOptions
  )

  let cachedCommands: Command<Options>[] | undefined
  async function loadCommands(): Promise<Command<Options>[]> {
    if (cachedCommands) {
      return cachedCommands
    }

    const subCommands = [...(env.subCommands || [])] as [string, Command<Options>][]
    return (cachedCommands = await Promise.all(
      subCommands.map(async ([name, cmd]) => await resolveLazyCommand(cmd, name))
    ))
  }

  return deepFreeze(
    Object.assign(create<CommandContext<Options, Values>>(), {
      name: command.name,
      description: command.description,
      omitted,
      locale: new Intl.Locale('en'), // TODO: resolve locale on runtime and abstraction
      env,
      options: _options,
      values: _values,
      positionals,
      usage,
      loadCommands
    })
  )
}
