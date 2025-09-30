/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type { ArgExplicitlyProvided, Args, ArgToken, ArgValues } from 'args-tokens'
import type { Plugin } from './plugin/core.ts'

export type { Args, ArgSchema, ArgToken, ArgValues } from 'args-tokens'

/**
 * Awaitable type.
 *
 * @typeParam T - The type of the value that can be awaited.
 */
export type Awaitable<T> = T | Promise<T>

/**
 * Prettify a type by flattening its structure.
 */
export type Prettify<T> = { [K in keyof T]: T[K] } & {}

/**
 * Extend command context type. This type is used to extend the command context with additional properties at {@link CommandContext.extensions}.
 *
 * @since v0.27.0
 */
export type ExtendContext = Record<string, unknown>

/**
 * Gunshi unified parameter type.
 *
 * This type combines both argument definitions and command context extensions.
 *
 * @typeParam P - The type of parameters, which can include `args` and `extensions`.
 *
 * @since v0.27.0
 */
export interface GunshiParams<
  P extends {
    args?: Args
    extensions?: ExtendContext
  } = {
    args: Args
    extensions: {}
  }
> {
  /**
   * Command argument definitions.
   */
  args: P extends { args: infer A extends Args } ? A : Args
  /**
   * Command context extensions.
   */
  extensions: P extends { extensions: infer E extends ExtendContext } ? E : {}
}

/**
 * Default Gunshi parameters.
 *
 * @since v0.27.0
 */
export type DefaultGunshiParams = GunshiParams

/**
 * Generic constraint for command-related types.
 *
 * This type constraint allows both {@link GunshiParams} and objects with extensions.
 *
 * @since v0.27.0
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): GunshiParams is a generic type
export type GunshiParamsConstraint = GunshiParams<any> | { extensions: ExtendContext }

/**
 * Type helper to extract args
 *
 * @typeParam G - The type of {@link GunshiParams} or an object with {@link Args}.
 *
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): GunshiParams is a generic type
export type ExtractArgs<G> = G extends GunshiParams<any> ? G['args'] : Args

/**
 * Type helper to extract explicitly provided argument flags.
 *
 * @typeParam G - The type of {@link GunshiParams}.
 *
 * @internal
 */
export type ExtractArgExplicitlyProvided<G> = ArgExplicitlyProvided<ExtractArgs<G>>

/**
 * Type helper to extract extensions from G
 *
 * @internal
 */
export type ExtractExtensions<G> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): GunshiParams is a generic type
  G extends GunshiParams<any> ? G['extensions'] : G extends { extensions: infer E } ? E : {}

/**
 * Type helper to normalize G to GunshiParams
 *
 * @internal
 */
export type NormalizeToGunshiParams<G> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): GunshiParams is a generic type
  G extends GunshiParams<any>
    ? G
    : G extends { extensions: ExtendContext }
      ? GunshiParams<{ args: Args; extensions: G['extensions'] }>
      : DefaultGunshiParams

/**
 * Command environment.
 */
export interface CommandEnvironment<G extends GunshiParamsConstraint = DefaultGunshiParams> {
  /**
   * Current working directory.
   *
   * @see {@link CliOptions.cwd}
   */
  cwd: string | undefined
  /**
   * Command name.
   *
   * @see {@link CliOptions.name}
   */
  name: string | undefined
  /**
   * Command description.
   *
   * @see {@link CliOptions.description}
   */
  description: string | undefined
  /**
   * Command version.
   *
   * @see {@link CliOptions.version}
   */
  version: string | undefined
  /**
   * Left margin of the command output.
   *
   * @default 2
   * @see {@link CliOptions.leftMargin}
   */
  leftMargin: number
  /**
   * Middle margin of the command output.
   *
   * @default 10
   * @see {@link CliOptions.middleMargin}
   */
  middleMargin: number
  /**
   * Whether to display the usage option type.
   *
   * @default false
   * @see {@link CliOptions.usageOptionType}
   */
  usageOptionType: boolean
  /**
   * Whether to display the option value.
   *
   * @default true
   * @see {@link CliOptions.usageOptionValue}
   */
  usageOptionValue: boolean
  /**
   * Whether to display the command usage.
   *
   * @default false
   * @see {@link CliOptions.usageSilent}
   */
  usageSilent: boolean
  /**
   * Sub commands.
   *
   * @see {@link CliOptions.subCommands}
   */
  subCommands: Map<string, Command<any> | LazyCommand<any>> | undefined // eslint-disable-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): generic type
  /**
   * Render function the command usage.
   */
  renderUsage: ((ctx: Readonly<CommandContext<G>>) => Promise<string>) | null | undefined
  /**
   * Render function the header section in the command usage.
   */
  renderHeader: ((ctx: Readonly<CommandContext<G>>) => Promise<string>) | null | undefined
  /**
   * Render function the validation errors.
   */
  renderValidationErrors:
    | ((ctx: Readonly<CommandContext<G>>, error: AggregateError) => Promise<string>)
    | null
    | undefined
  /**
   * Hook that runs before any command execution
   *
   * @see {@link CliOptions.onBeforeCommand}
   * @since v0.27.0
   */
  onBeforeCommand: ((ctx: Readonly<CommandContext<G>>) => Awaitable<void>) | undefined
  /**
   * Hook that runs after successful command execution
   *
   * @see {@link CliOptions.onAfterCommand}
   * @since v0.27.0
   */
  onAfterCommand:
    | ((ctx: Readonly<CommandContext<G>>, result: string | undefined) => Awaitable<void>)
    | undefined
  /**
   * Hook that runs when a command throws an error
   *
   * @see {@link CliOptions.onErrorCommand}
   * @since v0.27.0
   */
  onErrorCommand: ((ctx: Readonly<CommandContext<G>>, error: Error) => Awaitable<void>) | undefined
}

/**
 * CLI options of `cli` function.
 */
export interface CliOptions<G extends GunshiParamsConstraint = DefaultGunshiParams> {
  /**
   * Current working directory.
   */
  cwd?: string
  /**
   * Command program name.
   */
  name?: string
  /**
   * Command program description.
   *
   */
  description?: string
  /**
   * Command program version.
   */
  version?: string
  /**
   * Sub commands.
   */
  subCommands?:
    | Record<string, Command<any> | LazyCommand<any>> // eslint-disable-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): generic type
    | Map<string, Command<any> | LazyCommand<any>> // eslint-disable-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): generic type
  /**
   * Left margin of the command output.
   */
  leftMargin?: number
  /**
   * Middle margin of the command output.
   */
  middleMargin?: number
  /**
   * Whether to display the usage optional argument type.
   */
  usageOptionType?: boolean
  /**
   * Whether to display the optional argument value.
   */
  usageOptionValue?: boolean
  /**
   * Whether to display the command usage.
   */
  usageSilent?: boolean
  /**
   * Render function the command usage.
   */
  renderUsage?: ((ctx: Readonly<CommandContext<G>>) => Promise<string>) | null
  /**
   * Render function the header section in the command usage.
   */
  renderHeader?: ((ctx: Readonly<CommandContext<G>>) => Promise<string>) | null
  /**
   * Render function the validation errors.
   */
  renderValidationErrors?:
    | ((ctx: Readonly<CommandContext<G>>, error: AggregateError) => Promise<string>)
    | null
  /**
   * Whether to fallback to entry command when the sub-command is not found.
   *
   * @default false
   * @since v0.27.0
   */
  fallbackToEntry?: boolean
  /**
   * User plugins.
   *
   * @since v0.27.0
   */
  plugins?: Plugin[]
  /**
   * Hook that runs before any command execution
   *
   * @param ctx - The command context
   * @since v0.27.0
   */
  onBeforeCommand?: (ctx: Readonly<CommandContext<G>>) => Awaitable<void>
  /**
   * Hook that runs after successful command execution
   *
   * @param ctx - The command context
   * @param result - The command execution result
   * @since v0.27.0
   */
  onAfterCommand?: (ctx: Readonly<CommandContext<G>>, result: string | undefined) => Awaitable<void>
  /**
   * Hook that runs when a command throws an error
   *
   * @param ctx - The command context
   * @param error - The error thrown during execution
   * @since v0.27.0
   */
  onErrorCommand?: (ctx: Readonly<CommandContext<G>>, error: Error) => Awaitable<void>
}

/**
 * Command call mode.
 */
export type CommandCallMode = 'entry' | 'subCommand' | 'unexpected'

/**
 * Command context.
 * Command context is the context of the command execution.
 */
export interface CommandContext<G extends GunshiParamsConstraint = DefaultGunshiParams> {
  /**
   * Command name, that is the command that is executed.
   * The command name is same {@link CommandEnvironment.name}.
   */
  name: string | undefined
  /**
   * Command description, that is the description of the command that is executed.
   * The command description is same {@link CommandEnvironment.description}.
   */
  description: string | undefined
  /**
   * Command environment, that is the environment of the command that is executed.
   * The command environment is same {@link CommandEnvironment}.
   */
  env: Readonly<CommandEnvironment<G>>
  /**
   * Command arguments, that is the arguments of the command that is executed.
   * The command arguments is same {@link Command.args}.
   */
  args: ExtractArgs<G>

  /**
   * Whether arguments were explicitly provided by the user.
   *
   * - `true`: The argument was explicitly provided via command line
   * - `false`: The argument was not explicitly provided. This means either:
   *   - The value comes from a default value defined in the argument schema
   *   - The value is `undefined` (no explicit input and no default value)
   */
  explicit: ExtractArgExplicitlyProvided<G>

  /**
   * Command values, that is the values of the command that is executed.
   * Resolve values with `resolveArgs` from command arguments and {@link Command.args}.
   */
  values: ArgValues<ExtractArgs<G>>
  /**
   * Command positionals arguments, that is the positionals of the command that is executed.
   * Resolve positionals with `resolveArgs` from command arguments.
   */
  positionals: string[]
  /**
   * Command rest arguments, that is the remaining argument not resolved by the optional command option delimiter `--`.
   */
  rest: string[]
  /**
   * Original command line arguments.
   * This argument is passed from `cli` function.
   */
  _: string[]
  /**
   * Argument tokens, that is parsed by `parseArgs` function.
   */
  tokens: ArgToken[]
  /**
   * Whether the currently executing command has been executed with the sub-command name omitted.
   */
  omitted: boolean
  /**
   * Command call mode.
   * The command call mode is `entry` when the command is executed as an entry command, and `subCommand` when the command is executed as a sub-command.
   */
  callMode: CommandCallMode
  /**
   * Whether to convert the camel-case style argument name to kebab-case.
   * This context value is set from {@link Command.toKebab} option.
   */
  toKebab?: boolean
  /**
   * Output a message.
   * If {@link CommandEnvironment.usageSilent} is true, the message is not output.
   *
   * @param message - an output message, @see {@link console.log}
   * @param optionalParams - an optional parameters, @see {@link console.log}
   */
  log: (message?: any, ...optionalParams: any[]) => void // eslint-disable-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): generic optional parameters
  /**
   * Command context extensions.
   *
   * @since v0.27.0
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): generic type
  extensions: keyof ExtractExtensions<G> extends never ? any : ExtractExtensions<G>
  /**
   * Validation error from argument parsing.
   * This will be set if argument validation fails during CLI execution.
   */
  validationError?: AggregateError
}

/**
 * CommandContextCore type (base type without extensions)
 *
 * @since v0.27.0
 */
export type CommandContextCore<G extends GunshiParamsConstraint = DefaultGunshiParams> = Readonly<
  CommandContext<G>
>

/**
 * Command context extension
 *
 * @since v0.27.0
 */
export interface CommandContextExtension<
  E extends GunshiParams['extensions'] = DefaultGunshiParams['extensions']
> {
  /**
   * Plugin identifier
   */
  readonly key: symbol
  /**
   * Plugin extension factory
   */
  readonly factory: (ctx: CommandContextCore, cmd: Command) => Awaitable<E>
  /**
   * Plugin extension factory after hook
   */
  readonly onFactory?: (ctx: Readonly<CommandContext>, cmd: Readonly<Command>) => Awaitable<void>
}

/**
 * Rendering control options
 *
 * @since v0.27.0
 */
export interface RenderingOptions<G extends GunshiParamsConstraint = DefaultGunshiParams> {
  /**
   * Header rendering configuration
   * - `null`: Disable rendering
   * - `function`: Use custom renderer
   * - `undefined` (when omitted): Use default renderer
   */
  header?: ((ctx: Readonly<CommandContext<G>>) => Promise<string>) | null

  /**
   * Usage rendering configuration
   * - `null`: Disable rendering
   * - `function`: Use custom renderer
   * - `undefined` (when omitted): Use default renderer
   */
  usage?: ((ctx: Readonly<CommandContext<G>>) => Promise<string>) | null

  /**
   * Validation errors rendering configuration
   * - `null`: Disable rendering
   * - `function`: Use custom renderer
   * - `undefined` (when omitted): Use default renderer
   */
  validationErrors?:
    | ((ctx: Readonly<CommandContext<G>>, error: AggregateError) => Promise<string>)
    | null
}

/**
 * Command interface.
 */
export interface Command<G extends GunshiParamsConstraint = DefaultGunshiParams> {
  /**
   * Command name.
   * It's used to find command line arguments to execute from sub commands, and it's recommended to specify.
   */
  name?: string
  /**
   * Command description.
   * It's used to describe the command in usage and it's recommended to specify.
   */
  description?: string
  /**
   * Command arguments.
   * Each argument can include a description property to describe the argument in usage.
   */
  args?: ExtractArgs<G>
  /**
   * Command examples.
   * examples of how to use the command.
   */
  examples?: string | CommandExamplesFetcher<G>
  /**
   * Command runner. it's the command to be executed
   */
  run?: CommandRunner<G>
  /**
   * Whether to convert the camel-case style argument name to kebab-case.
   * If you will set to `true`, All {@link Command.args} names will be converted to kebab-case.
   */
  toKebab?: boolean
  /**
   * Whether this is an internal command.
   * Internal commands are not shown in help usage.
   *
   * @default false
   * @since v0.27.0
   */
  internal?: boolean
  /**
   * Whether this command is an entry command.
   *
   * @default undefined
   * @since v0.27.0
   */
  entry?: boolean
  /**
   * Rendering control options
   *
   * @since v0.27.0
   */
  rendering?: RenderingOptions<G>
}

/**
 * Lazy command interface.
 * Lazy command that's not loaded until it is executed.
 *
 * @typeParam G - The Gunshi parameters constraint
 * @typeParam D - The partial command definition provided to lazy function
 */
export type LazyCommand<
  G extends GunshiParamsConstraint = DefaultGunshiParams,
  D extends Partial<Command<G>> = {}
> = {
  /**
   * Command load function
   */
  (): Awaitable<Command<G> | CommandRunner<G>>
} &
  // If definition has name, commandName is required with that type
  (D extends { name: infer N } ? { commandName: N } : { commandName?: string }) &
  // Properties from the definition (if provided inline)
  Omit<D, 'name' | 'run'> &
  // Remaining properties from Command (optional)
  Partial<Omit<Command<G>, keyof D | 'run' | 'name'>>

/**
 * Define a command type.
 */
export type Commandable<G extends GunshiParamsConstraint = DefaultGunshiParams> =
  | Command<G>
  | LazyCommand<G, {}>

/**
 * Command examples fetcher.
 *
 * @param ctx - A {@link CommandContext | command context}
 * @returns A fetched command examples.
 */
export type CommandExamplesFetcher<G extends GunshiParamsConstraint = DefaultGunshiParams> = (
  ctx: Readonly<CommandContext<G>>
) => Awaitable<string>

/**
 * Command runner.
 *
 * @param ctx - A {@link CommandContext | command context}
 * @returns void or string (for CLI output)
 */
export type CommandRunner<G extends GunshiParamsConstraint = DefaultGunshiParams> = (
  ctx: Readonly<CommandContext<G>>
) => Awaitable<string | void>

/**
 * Command loader.
 * A function that returns a command or command runner.
 * This is used to lazily load commands.
 *
 * @returns A command or command runner
 */
export type CommandLoader<G extends GunshiParamsConstraint = DefaultGunshiParams> = () => Awaitable<
  Command<G> | CommandRunner<G>
>

/**
 * Command decorator.
 * A function that wraps a command runner to add or modify its behavior.
 *
 * @param baseRunner - The base command runner to decorate
 * @returns The decorated command runner
 *
 * @since v0.27.0
 */
export type CommandDecorator<G extends GunshiParamsConstraint = DefaultGunshiParams> = (
  baseRunner: (ctx: Readonly<CommandContext<G>>) => Awaitable<string | void>
) => (ctx: Readonly<CommandContext<G>>) => Awaitable<string | void>

/**
 * Renderer decorator type.
 * A function that wraps a base renderer to add or modify its behavior.
 *
 * @param baseRenderer - The base renderer function to decorate
 * @param ctx - The command context
 * @returns The decorated result
 *
 * @since v0.27.0
 */
export type RendererDecorator<T, G extends GunshiParamsConstraint = DefaultGunshiParams> = (
  baseRenderer: (ctx: Readonly<CommandContext<G>>) => Promise<T>,
  ctx: Readonly<CommandContext<G>>
) => Promise<T>

/**
 * Validation errors renderer decorator type.
 * A function that wraps a validation errors renderer to add or modify its behavior.
 *
 * @param baseRenderer - The base validation errors renderer function to decorate
 * @param ctx - The command context
 * @param error - The aggregate error containing validation errors
 * @returns The decorated result
 *
 * @since v0.27.0
 */
export type ValidationErrorsDecorator<G extends GunshiParamsConstraint = DefaultGunshiParams> = (
  baseRenderer: (ctx: Readonly<CommandContext<G>>, error: AggregateError) => Promise<string>,
  ctx: Readonly<CommandContext<G>>,
  error: AggregateError
) => Promise<string>
