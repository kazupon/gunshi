/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type { CliOptions, DefaultGunshiParams } from './types.ts'

export const BUILT_IN_PREFIX = '_'

export const ARG_PREFIX = 'arg'

export const BUILT_IN_KEY_SEPARATOR = ':'

export const BUILD_IN_PREFIX_AND_KEY_SEPARATOR: string = `${BUILT_IN_PREFIX}${BUILT_IN_KEY_SEPARATOR}`

export const ARG_PREFIX_AND_KEY_SEPARATOR: string = `${ARG_PREFIX}${BUILT_IN_KEY_SEPARATOR}`

export const ANONYMOUS_COMMAND_NAME = '(anonymous)'

export const NOOP: () => void = () => {}

export const COMMAND_OPTIONS_DEFAULT: CliOptions<DefaultGunshiParams> = {
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
  translationAdapterFactory: undefined,
  plugins: undefined
}
