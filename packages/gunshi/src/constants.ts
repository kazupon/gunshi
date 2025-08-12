/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type { CliOptions, DefaultGunshiParams } from './types.ts'

export const ANONYMOUS_COMMAND_NAME = '(anonymous)'

/**
 * A no-operation function.
 */
export const NOOP: () => void = () => {}

export const CLI_OPTIONS_DEFAULT: CliOptions<DefaultGunshiParams> = {
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
  plugins: undefined,
  fallbackToEntry: false
}
