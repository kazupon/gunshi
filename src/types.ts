import type { ArgOptions, ArgValues } from 'args-tokens'

/**
 * Define a promise type that can be await from T
 */
type Awaitable<T> = T | Promise<T>

/**
 * The command environment
 */
export interface CommandEnvironment<Options extends ArgOptions = ArgOptions> {
  /**
   * The current working directory
   */
  cwd: string
  /**
   * The command name
   */
  name?: string
  /**
   * The command description
   */
  description?: string
  /**
   * The command version
   */
  version?: string
  /**
   * The entry command
   */
  entry?: Command<Options> | string
  /**
   * The sub commands
   */
  subCommands?: Record<string, Command<Options> | LazyCommand<Options>>
}

/**
 * The command options
 */
export interface CommandOptions<Options extends ArgOptions> {
  /**
   * The left margin of the command output
   * @default 2
   */
  leftMargin?: number
  /**
   * The middle margin of the command output
   * @default 10
   */
  middleMargin?: number
  /**
   * Whether to display the usage option type
   * @default false
   */
  usageOptionType?: boolean
  /**
   * Render function the command usage
   * @default if not specified, use the built-in render function
   */
  renderUsage?: ((ctx: CommandContext<Options>) => Promise<string>) | null
  /**
   * Render function the default command usage
   * @description The default command is the command that is executed when no sub command is specified
   * @default if not specified, use the built-in render function of the default command
   */
  renderUsageDefault?: ((ctx: CommandContext<Options>) => Promise<string>) | null
  /**
   * Render function the header
   * @default if not specified, use the built-in render function of the header
   */
  renderHeader?: ((ctx: CommandContext<Options>) => Promise<string>) | null
  /**
   * Render function the validation errors
   * @default if not specified, use the built-in render function of the validation errors
   */
  renderValidationErrors?:
    | ((ctx: CommandContext<Options>, error: AggregateError) => Promise<string>)
    | null
}

/**
 * The command context
 * @description The command context is the context of the command execution
 */
export interface CommandContext<Options extends ArgOptions, Values = ArgValues<Options>> {
  /**
   * The command name, that is the command that is executed
   * @description The command name is same {@link CommandEnvironment.name}
   */
  name: string
  /**
   * The command description, that is the description of the command that is executed
   * @description The command description is same {@link CommandEnvironment.description}
   */
  description?: CommandUsageRender<Options>
  /**
   * The command locale, that is the locale of the command that is executed
   */
  locale: Intl.Locale
  /**
   * The command environment, that is the environment of the command that is executed
   * @description The command environment is same {@link CommandEnvironment}
   */
  env: CommandEnvironment<Options>
  /**
   * The command options, that is the options of the command that is executed
   * @description The command options is same {@link Command.options}
   */
  options?: Options
  /**
   * The command values, that is the values of the command that is executed
   * @description Resolve values with `resolveArgs` from command arguments and {@link Command.options}
   */
  values: Values
  /**
   * The command positionals, that is the positionals of the command that is executed
   * @description Resolve positionals with `resolveArgs` from command arguments
   */
  positionals: string[]
  /**
   * The usage of the command
   * @description The usage of the command is same {@link Command.usage}, and more has `--help` and `--version` options
   */
  usage: CommandUsage<Options>
  /**
   * The command options
   * @description The command options is same {@link CommandOptions}
   */
  commandOptions: Required<CommandOptions<Options>>
}

/**
 * The command usage render
 * @description if the render function is async, it should return a promise
 */
export type CommandUsageRender<Options extends ArgOptions> =
  | ((ctx: CommandContext<Options>) => Promise<string>)
  | string

/**
 * The command usage
 */
interface CommandUsage<Options extends ArgOptions> {
  /**
   * The options usage
   */
  options?: {
    [Option in keyof Options]: CommandUsageRender<Options>
  }
  /**
   * The examples usage
   */
  examples?: CommandUsageRender<Options>
}

/**
 * The command interface
 */
export interface Command<Options extends ArgOptions> {
  /**
   * The command name
   */
  name: string
  /**
   * The command description
   */
  description?: CommandUsageRender<Options>
  /**
   * whether the command is default or not
   * @description if the command is default, it is executed when no sub-command is specified
   */
  default?: boolean
  /**
   * The command options
   */
  options?: Options
  /**
   * The command usage
   */
  usage?: CommandUsage<Options>
  /**
   * The command implementation, that is the command to be executed
   * @param ctx - The command context
   */
  run(ctx: CommandContext<Options>): Awaitable<void>
}

/**
 * The lazy command interface
 * @description The lazy command that's not loaded until it is executed
 */
export type LazyCommand<Options extends ArgOptions> = () => Awaitable<Command<Options>>
