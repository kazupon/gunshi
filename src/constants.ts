/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type { Args } from 'args-tokens'
import type { CommandOptions } from './types.ts'

/**
 * The default locale string, which format is BCP 47 language tag.
 */
export const DEFAULT_LOCALE = 'en-US'

export const BUILT_IN_PREFIX = '_'

export const OPTION_PREFIX = 'arg'

export const BUILT_IN_KEY_SEPARATOR = ':'

export const NOOP: () => void = () => {}

type CommonOptionType = {
  readonly help: {
    readonly type: 'boolean'
    readonly short: 'h'
    readonly description: string
  }
  readonly version: {
    readonly type: 'boolean'
    readonly short: 'v'
    readonly description: string
  }
}

export const COMMON_OPTIONS: CommonOptionType = {
  help: {
    type: 'boolean',
    short: 'h',
    description: 'Display this help message'
  },
  version: {
    type: 'boolean',
    short: 'v',
    description: 'Display this version'
  }
}

export const COMMAND_OPTIONS_DEFAULT: CommandOptions<Args> = {
  name: undefined,
  description: undefined,
  version: undefined,
  cwd: undefined,
  usageSilent: false,
  subCommands: undefined,
  leftMargin: 2,
  middleMargin: 10,
  usageOptionType: false,
  usageOptionValue: true,
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
  'FORMORE',
  'NEGATABLE',
  'DEFAULT',
  'CHOICES'
] as const
