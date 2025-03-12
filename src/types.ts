import type { ArgOptions, ArgValues } from 'args-tokens'

/**
 * Define a promise type that can be await from T
 */
type Awaitable<T> = T | Promise<T>

/**
 * Command i18n built-in options keys
 * @experimental
 */
export type CommandBuiltinOptionsKeys = keyof (typeof import('./constants'))['COMMON_OPTIONS']

/**
 * Command i18n built-in resource keys
 * @experimental
 */
export type CommandBuiltinResourceKeys =
  (typeof import('./constants'))['COMMAND_I18N_RESOURCE_KEYS'][number]

/**
 * Command i18n built-in keys
 * @description The command i18n built-in keys are used to {@link CommandContext.translation | translate} function
 * @experimental
 */
export type CommandBuiltinKeys =
  | CommandBuiltinOptionsKeys
  | CommandBuiltinResourceKeys
  | 'description'
  | 'examples'

/**
 * Command environment
 */
export interface CommandEnvironment<Options extends ArgOptions = ArgOptions> {
  /**
   * Current working directory
   * @see {@link CommandOptions.cwd}
   */
  cwd: string | undefined
  /**
   * Command name
   * @see {@link CommandOptions.name}
   */
  name: string | undefined
  /**
   * Command description
   * @see {@link CommandOptions.description}
   *
   */
  description: string | undefined
  /**
   * Command version
   * @see {@link CommandOptions.version}
   */
  version: string | undefined
  /**
   * Left margin of the command output
   * @default 2
   * @see {@link CommandOptions.leftMargin}
   */
  leftMargin: number
  /**
   * Middle margin of the command output
   * @default 10
   * @see {@link CommandOptions.middleMargin}
   */
  middleMargin: number
  /**
   * Whether to display the usage option type
   * @default false
   * @see {@link CommandOptions.usageOptionType}
   */
  usageOptionType: boolean
  /**
   * Sub commands
   * @see {@link CommandOptions.subCommands}
   */
  subCommands: Map<string, Command<Options> | LazyCommand<Options>> | undefined
  /**
   * Render function the command usage
   */
  renderUsage: ((ctx: CommandContext<Options>) => Promise<string>) | null | undefined
  /**
   * Render function the header section in the command usage
   */
  renderHeader: ((ctx: CommandContext<Options>) => Promise<string>) | null | undefined
  /**
   * Render function the validation errors
   */
  renderValidationErrors:
    | ((ctx: CommandContext<Options>, error: AggregateError) => Promise<string>)
    | null
    | undefined
}

/**
 * Command options
 */
export interface CommandOptions<Options extends ArgOptions = ArgOptions> {
  /**
   * Current working directory
   */
  cwd?: string
  /**
   * Command program name
   */
  name?: string
  /**
   * Command program description
   *
   */
  description?: string
  /**
   * Command program version
   */
  version?: string
  /**
   * Command program locale
   */
  locale?: string | Intl.Locale
  /**
   * Sub commands
   */
  subCommands?: Map<string, Command<Options> | LazyCommand<Options>>
  /**
   * Left margin of the command output
   */
  leftMargin?: number
  /**
   * Middle margin of the command output
   */
  middleMargin?: number
  /**
   * Whether to display the usage option type
   */
  usageOptionType?: boolean
  /**
   * Render function the command usage
   */
  renderUsage?: ((ctx: Readonly<CommandContext<Options>>) => Promise<string>) | null
  /**
   * Render function the header section in the command usage
   */
  renderHeader?: ((ctx: Readonly<CommandContext<Options>>) => Promise<string>) | null
  /**
   * Render function the validation errors
   */
  renderValidationErrors?:
    | ((ctx: Readonly<CommandContext<Options>>, error: AggregateError) => Promise<string>)
    | null
}

/**
 * Command context
 * @description Command context is the context of the command execution
 */
export interface CommandContext<
  Options extends ArgOptions = ArgOptions,
  Values = ArgValues<Options>
> {
  /**
   * Command name, that is the command that is executed
   * @description The command name is same {@link CommandEnvironment.name}
   */
  name: string | undefined
  /**
   * Command description, that is the description of the command that is executed
   * @description The command description is same {@link CommandEnvironment.description}
   */
  description: string | undefined
  /**
   * Command locale, that is the locale of the command that is executed
   */
  locale: Intl.Locale
  /**
   * Command environment, that is the environment of the command that is executed
   * @description The command environment is same {@link CommandEnvironment}
   */
  env: CommandEnvironment<Options>
  /**
   * Command options, that is the options of the command that is executed
   * @description The command options is same {@link Command.options}
   */
  options: Options | undefined
  /**
   * Command values, that is the values of the command that is executed
   * @description Resolve values with `resolveArgs` from command arguments and {@link Command.options}
   */
  values: Values
  /**
   * Command positionals arguments, that is the positionals of the command that is executed
   * @description Resolve positionals with `resolveArgs` from command arguments
   */
  positionals: string[]
  /**
   * Whether the currently executing command has been executed with the sub-command name omitted
   */
  omitted: boolean
  /**
   * Command usage
   * @description Usage of the command is same {@link Command.usage}, and more has `--help` and `--version` options
   */
  usage: CommandUsage<Options>
  /**
   * Load sub-commands
   * @description The loaded commands are cached and returned when called again
   * @returns loaded commands
   */
  loadCommands: () => Promise<Command<Options>[]>
  /**
   * Translation function
   * @param key the key to be translated
   * @returns A translated string
   * @experimental
   */
  translation: <T = CommandBuiltinKeys, Key = CommandBuiltinKeys | T>(key: Key) => string
}

/**
 * Command usage
 */
interface CommandUsage<Options extends ArgOptions = ArgOptions> {
  /**
   * Options usage
   */
  options?: {
    [Option in keyof Options]: string
  }
  /**
   * Examples usage
   */
  examples?: string
}

/**
 * Command interface
 */
export interface Command<Options extends ArgOptions = ArgOptions> {
  /**
   * Command name
   * @description
   * Command name is used to find command line arguments to execute from sub commands, so it's recommended to specify.
   */
  name?: string
  /**
   * Command description
   * @description
   * Command description is used to describe the command in usage, so it's recommended to specify.
   */
  description?: string
  /**
   * whether the command is default or not
   * @description if the command is default, it is executed when no sub-command is specified
   */
  default?: boolean
  /**
   * Command options
   */
  options?: Options
  /**
   * Command usage
   * @description
   * Command usage is used to describe the command in usage, so it's recommended to specify.
   */
  usage?: CommandUsage<Options>
  /**
   * Command runner, that's the command to be executed
   */
  run: CommandRunner<Options>
  /**
   * Command resource fetcher
   * @experimental
   */
  resource?: CommandResourceFetcher<Options>
}

/**
 * Command resource
 * @experimental
 */
export interface CommandResource<Options extends ArgOptions = ArgOptions> {
  /**
   * Command description
   */
  description: string
  /**
   * Options usage
   */
  options: {
    [Option in keyof Options]: string
  }
  /**
   * Examples usage
   */
  examples: string
}

/**
 * Command resource fetcher
 * @param ctx A {@link CommandContext | command context}
 * @returns A fetched {@link CommandResource | command resource}
 * @experimental
 */
export type CommandResourceFetcher<Options extends ArgOptions = ArgOptions> = (
  ctx: Readonly<CommandContext<Options>>
) => Promise<CommandResource<Options>>

/**
 * Command runner
 * @param ctx A {@link CommandContext | command context}
 */
export type CommandRunner<Options extends ArgOptions = ArgOptions> = (
  ctx: Readonly<CommandContext<Options>>
) => Awaitable<void>

/**
 * Lazy command interface
 * @description lazy command that's not loaded until it is executed
 */
export type LazyCommand<Options extends ArgOptions = ArgOptions> = () => Awaitable<Command<Options>>
