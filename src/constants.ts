import type { ArgOptions } from 'args-tokens'
import type { CommandOptions } from './types'

/**
 * The default locale string, which format is BCP 47 language tag
 */
export const DEFAULT_LOCALE = 'en-US'

export const BUILT_IN_PREFIX = '_'

export const BUILT_IN_KEY_SEPARATOR = ':'

type CommonOptionType = {
  readonly help: {
    readonly type: 'boolean'
    readonly short: 'h'
  }
  readonly version: {
    readonly type: 'boolean'
    readonly short: 'v'
  }
}

export const COMMON_OPTIONS: CommonOptionType = {
  help: {
    type: 'boolean',
    short: 'h'
  },
  version: {
    type: 'boolean',
    short: 'v'
  }
}

export const COMMAND_OPTIONS_DEFAULT: CommandOptions<ArgOptions> = {
  name: undefined,
  description: undefined,
  version: undefined,
  cwd: undefined,
  subCommands: undefined,
  leftMargin: 2,
  middleMargin: 10,
  usageOptionType: false,
  renderHeader: undefined,
  renderUsage: undefined,
  renderValidationErrors: undefined,
  translationAdapterFactory: undefined
}

export const COMMAND_BUILTIN_RESOURCE_KEYS = [
  'USAGE',
  'COMMAND',
  'SUBCOMMAND',
  'COMMANDS',
  'OPTIONS',
  'EXAMPLES',
  'FORMORE'
] as const
