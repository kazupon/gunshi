import { COMMAND_OPTIONS_DEFAULT, COMMON_OPTIONS_USAGE } from './constants.js'
import { nullObject } from './utils.js'

import type { ArgOptions, ArgValues } from 'args-tokens'
import type { Command, CommandContext, CommandEnvironment, CommandOptions } from './types'

export function createCommandContext<Options extends ArgOptions, Values = ArgValues<Options>>(
  options: Options | undefined,
  values: Values,
  positionals: string[],
  env: CommandEnvironment<Options>,
  command: Command<Options>,
  commandOptions: Required<CommandOptions<Options>> = COMMAND_OPTIONS_DEFAULT as Required<
    CommandOptions<Options>
  >
): Readonly<CommandContext<Options, Values>> {
  const usage = command.usage || nullObject<Options>()
  usage.options = Object.assign(nullObject<Options>(), usage.options, COMMON_OPTIONS_USAGE)
  return Object.freeze({
    name: command.name,
    description: command.description,
    locale: new Intl.Locale('en'), // TODO: resolve locale on runtime and abstraction
    env,
    options,
    values,
    positionals,
    usage,
    commandOptions
  })
}
