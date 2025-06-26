/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

/**
 * The default locale string, which format is BCP 47 language tag.
 */
export const DEFAULT_LOCALE = 'en-US' // TODO(kazupon): should be removed, if built-in plugnin is self-hosted

export const BUILT_IN_PREFIX = '_'

export const ARG_PREFIX = 'arg'

export const BUILT_IN_KEY_SEPARATOR = ':'

export const BUILD_IN_PREFIX_AND_KEY_SEPARATOR: string = `${BUILT_IN_PREFIX}${BUILT_IN_KEY_SEPARATOR}`

export const ARG_PREFIX_AND_KEY_SEPARATOR: string = `${ARG_PREFIX}${BUILT_IN_KEY_SEPARATOR}`

export const ARG_NEGATABLE_PREFIX = 'no-'

export const ANONYMOUS_COMMAND_NAME = '(anonymous)'

export const NOOP: () => void = () => {}

type CommonArgType = {
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

export const COMMON_ARGS: CommonArgType = {
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

export const COMMAND_BUILTIN_RESOURCE_KEYS = [
  'USAGE',
  'COMMAND',
  'SUBCOMMAND',
  'COMMANDS',
  'ARGUMENTS',
  'OPTIONS',
  'EXAMPLES',
  'FORMORE',
  'NEGATABLE',
  'DEFAULT',
  'CHOICES'
] as const
