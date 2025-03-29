import { cli } from './cli.ts'
import { create } from './utils.ts'

import { ArgOptions } from 'args-tokens'
import type { Command, CommandOptions } from './types.ts'

/**
 * Generate the command usage
 * @param command - usage generate command, if you want to generate the usage of the default command where there are target commands and sub-commands, specify `null`.
 * @param entry - A {@link Command | entry command}
 * @param opts - A {@link CommandOptions | command options}
 * @returns A rendered usage
 */
export async function generate<Options extends ArgOptions = ArgOptions>(
  command: string | null,
  entry: Command<Options>,
  opts: CommandOptions<Options> = {}
): Promise<string> {
  const args = ['-h']
  if (command != null) {
    args.unshift(command)
  }
  return (
    (await cli(
      args,
      entry,
      Object.assign(create<CommandOptions>(), opts, { usageSilent: true, __proto__: null })
    )) || ''
  )
}
