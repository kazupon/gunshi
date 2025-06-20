/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type { Args, ArgToken, ArgValues } from 'args-tokens'

import { ARG_PREFIX, BUILT_IN_KEY_SEPARATOR, BUILT_IN_PREFIX } from './constants.ts'

export type Awaitable<T> = T | Promise<T>

/**
 * Extend command context type. This type is used to extend the command context with additional properties at {@link CommandContext.extensions}.
 */
export type ExtendContext = Record<string, unknown>

/**
 * Gunshi unified parameter type.
 * This type combines both argument definitions and command context extensions.
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
   * Command argument definitions
   */
  args: P extends { args: infer A extends Args } ? A : Args
  /**
   * Command context extensions
   */
  extensions: P extends { extensions: infer E extends ExtendContext } ? E : {}
}

/**
 * Default Gunshi parameters
 */
export type DefaultGunshiParams = GunshiParams

type RemoveIndexSignature<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K]
}

/**
 * Remove index signature from object or record type.
 * @internal
 */
export type RemovedIndex<T> = RemoveIndexSignature<{
  [K in keyof T]: T[K]
}>

/** @internal */
export type KeyOfArgs<A extends Args> =
  | keyof A
  | {
      [K in keyof A]: A[K]['type'] extends 'boolean'
        ? A[K]['negatable'] extends true
          ? `no-${Extract<K, string>}`
          : never
        : never
    }[keyof A]

/**
 * Generate a namespaced key.
 * @internal
 */
export type GenerateNamespacedKey<
  Key extends string,
  Prefixed extends string = typeof BUILT_IN_PREFIX
> = `${Prefixed}${typeof BUILT_IN_KEY_SEPARATOR}${Key}`

/**
 * Command i18n built-in arguments keys.
 * @internal
 */
export type CommandBuiltinArgsKeys = keyof (typeof import('./constants.ts'))['COMMON_ARGS']

/**
 * Command i18n built-in resource keys.
 * @internal
 */
export type CommandBuiltinResourceKeys =
  (typeof import('./constants.ts'))['COMMAND_BUILTIN_RESOURCE_KEYS'][number]

/**
 * Command i18n built-in keys.
 * The command i18n built-in keys are used to {@link CommandContext.translate | translate} function.
 * @internal
 */
export type CommandBuiltinKeys =
  | GenerateNamespacedKey<CommandBuiltinArgsKeys>
  | GenerateNamespacedKey<CommandBuiltinResourceKeys>
  | 'description'
  | 'examples'

/**
 * Command i18n option keys.
 * The command i18n option keys are used to {@link CommandContext.translate | translate} function.
 * @internal
 */
export type CommandArgKeys<A extends Args> = GenerateNamespacedKey<
  KeyOfArgs<RemovedIndex<A>>,
  typeof ARG_PREFIX
>

/**
 * Command environment.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface CommandEnvironment<G extends GunshiParams<any> = DefaultGunshiParams> {
  /**
   * Current working directory.
   * @see {@link CliOptions.cwd}
   */
  cwd: string | undefined
  /**
   * Command name.
   * @see {@link CliOptions.name}
   */
  name: string | undefined
  /**
   * Command description.
   * @see {@link CliOptions.description}
   *
   */
  description: string | undefined
  /**
   * Command version.
   * @see {@link CliOptions.version}
   */
  version: string | undefined
  /**
   * Left margin of the command output.
   * @default 2
   * @see {@link CliOptions.leftMargin}
   */
  leftMargin: number
  /**
   * Middle margin of the command output.
   * @default 10
   * @see {@link CliOptions.middleMargin}
   */
  middleMargin: number
  /**
   * Whether to display the usage option type.
   * @default false
   * @see {@link CliOptions.usageOptionType}
   */
  usageOptionType: boolean
  /**
   * Whether to display the option value.
   * @default true
   * @see {@link CliOptions.usageOptionValue}
   */
  usageOptionValue: boolean
  /**
   * Whether to display the command usage.
   * @default false
   * @see {@link CliOptions.usageSilent}
   */
  usageSilent: boolean
  /**
   * Sub commands.
   * @see {@link CliOptions.subCommands}
   */
  subCommands: Map<string, Command<any> | LazyCommand<any>> | undefined // eslint-disable-line @typescript-eslint/no-explicit-any
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
}

/**
 * CLI options of `cli` function.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface CliOptions<G extends GunshiParams<any> = DefaultGunshiParams> {
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
   * Command program locale.
   */
  locale?: string | Intl.Locale
  /**
   * Sub commands.
   */
  subCommands?: Map<string, Command<any> | LazyCommand<any>> // eslint-disable-line @typescript-eslint/no-explicit-any
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
   * Translation adapter factory.
   */
  translationAdapterFactory?: TranslationAdapterFactory
}

/**
 * Command call mode.
 */
export type CommandCallMode = 'entry' | 'subCommand' | 'unexpected'

/**
 * Command context.
 * Command context is the context of the command execution.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface CommandContext<G extends GunshiParams<any> = DefaultGunshiParams> {
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
   * Command locale, that is the locale of the command that is executed.
   */
  locale: Intl.Locale
  /**
   * Command environment, that is the environment of the command that is executed.
   * The command environment is same {@link CommandEnvironment}.
   */
  env: Readonly<CommandEnvironment<G>>
  /**
   * Command arguments, that is the arguments of the command that is executed.
   * The command arguments is same {@link Command.args}.
   */
  args: G['args']
  /**
   * Command values, that is the values of the command that is executed.
   * Resolve values with `resolveArgs` from command arguments and {@link Command.args}.
   */
  values: ArgValues<G['args']>
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
   * @param message an output message, @see {@link console.log}
   * @param optionalParams an optional parameters, @see {@link console.log}
   * @internal
   */
  log: (message?: any, ...optionalParams: any[]) => void // eslint-disable-line @typescript-eslint/no-explicit-any
  /**
   * Translate function.
   * @param key the key to be translated
   * @param values the values to be formatted
   * @returns A translated string.
   */
  translate: <
    T extends string = CommandBuiltinKeys,
    O = CommandArgKeys<G['args']>,
    K = CommandBuiltinKeys | O | T
  >(
    key: K,
    values?: Record<string, unknown>
  ) => string
  /**
   *  Command context extensions.
   */
  extensions: keyof G['extensions'] extends never ? undefined : G['extensions']
  /**
   * Validation error from argument parsing.
   * This will be set if argument validation fails during CLI execution.
   */
  validationError?: AggregateError
}

/**
 * CommandContextCore type (base type without extensions)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CommandContextCore<G extends GunshiParams<any> = DefaultGunshiParams> = Readonly<
  CommandContext<G>
>

/**
 * Command context extension
 */
export interface CommandContextExtension<
  E extends GunshiParams['extensions'] = DefaultGunshiParams['extensions']
> {
  readonly key: symbol
  readonly factory: (core: CommandContextCore) => E
}

/**
 * Command interface.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Command<G extends GunshiParams<any> = DefaultGunshiParams> {
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
  args?: G['args']
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
   * Command resource fetcher.
   */
  resource?: CommandResourceFetcher<G>
  /**
   * Whether to convert the camel-case style argument name to kebab-case.
   * If you will set to `true`, All {@link Command.args} names will be converted to kebab-case.
   */
  toKebab?: boolean
}

/**
 * Extract command context extension
 * @internal
 */
export type ExtractCommandContextExtension<E extends Record<string, CommandContextExtension>> = {
  [K in keyof E]: ReturnType<E[K]['factory']>
}

/**
 * Lazy command interface.
 * Lazy command that's not loaded until it is executed.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LazyCommand<G extends GunshiParams<any> = DefaultGunshiParams> = {
  /**
   * Command load function
   */
  (): Awaitable<Command<G> | CommandRunner<G>>
  /**
   * Command name
   */
  commandName?: string
} & Omit<Command<G>, 'run' | 'name'>

/**
 * Define a command type.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Commandable<G extends GunshiParams<any> = DefaultGunshiParams> =
  | Command<G>
  | LazyCommand<G>

/**
 * Command resource.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CommandResource<G extends GunshiParams<any> = DefaultGunshiParams> = {
  /**
   * Command description.
   */
  description: string
  /**
   * Examples usage.
   */
  examples: string | CommandExamplesFetcher<G>
} & {
  [Arg in GenerateNamespacedKey<KeyOfArgs<RemovedIndex<G['args']>>, typeof ARG_PREFIX>]: string
} & { [key: string]: string } // Infer the arguments usage, Define the user resources

/**
 * Command examples fetcher.
 * @param ctx A {@link CommandContext | command context}
 * @returns A fetched command examples.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CommandExamplesFetcher<G extends GunshiParams<any> = DefaultGunshiParams> = (
  ctx: Readonly<CommandContext<G>>
) => Awaitable<string>

/**
 * Command resource fetcher.
 * @param ctx A {@link CommandContext | command context}
 * @returns A fetched {@link CommandResource | command resource}.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CommandResourceFetcher<G extends GunshiParams<any> = DefaultGunshiParams> = (
  ctx: Readonly<CommandContext<G>>
) => Awaitable<CommandResource<G>>

/**
 * Translation adapter factory.
 */
export type TranslationAdapterFactory = (
  options: TranslationAdapterFactoryOptions
) => TranslationAdapter

/**
 * Translation adapter factory options.
 */
export interface TranslationAdapterFactoryOptions {
  /**
   * A locale.
   */
  locale: string
  /**
   * A fallback locale.
   */
  fallbackLocale: string
}

/**
 * Translation adapter.
 * This adapter is used to custom message formatter like {@link https://github.com/intlify/vue-i18n/blob/master/spec/syntax.ebnf | Intlify message format}, {@link https://github.com/tc39/proposal-intl-messageformat | `Intl.MessageFormat` (MF2)}, and etc.
 * This adapter will support localization with your preferred message format.
 */
export interface TranslationAdapter<MessageResource = string> {
  /**
   * Get a resource of locale.
   * @param locale A Locale at the time of command execution. That is Unicord locale ID (BCP 47)
   * @returns A resource of locale. if resource not found, return `undefined`.
   */
  getResource(locale: string): Record<string, string> | undefined
  /**
   * Set a resource of locale.
   * @param locale A Locale at the time of command execution. That is Unicord locale ID (BCP 47)
   * @param resource A resource of locale
   */
  setResource(locale: string, resource: Record<string, string>): void
  /**
   * Get a message of locale.
   * @param locale A Locale at the time of command execution. That is Unicord locale ID (BCP 47)
   * @param key A key of message resource
   * @returns A message of locale. if message not found, return `undefined`.
   */
  getMessage(locale: string, key: string): MessageResource | undefined
  /**
   * Translate a message.
   * @param locale A Locale at the time of command execution. That is Unicord locale ID (BCP 47)
   * @param key A key of message resource
   * @param values A values to be resolved in the message
   * @returns A translated message, if message is not translated, return `undefined`.
   */
  translate(locale: string, key: string, values?: Record<string, unknown>): string | undefined
}

/**
 * Command runner.
 * @param ctx A {@link CommandContext | command context}
 * @returns void or string (for CLI output)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CommandRunner<G extends GunshiParams<any> = DefaultGunshiParams> = (
  ctx: Readonly<CommandContext<G>>
) => Awaitable<void | string>

/**
 * Command loader.
 * A function that returns a command or command runner.
 * This is used to lazily load commands.
 * @returns A command or command runner
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CommandLoader<G extends GunshiParams<any> = DefaultGunshiParams> = () => Awaitable<
  Command<G> | CommandRunner<G>
>

/**
 * Command decorator.
 * A function that wraps a command runner to add or modify its behavior.
 * @param baseRunner The base command runner to decorate
 * @returns The decorated command runner
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CommandDecorator<G extends GunshiParams<any> = DefaultGunshiParams> = (
  baseRunner: (ctx: Readonly<CommandContext<G>>) => Awaitable<void | string>
) => (ctx: Readonly<CommandContext<G>>) => Awaitable<void | string>

/**
 * Renderer decorator type.
 * A function that wraps a base renderer to add or modify its behavior.
 * @param baseRenderer The base renderer function to decorate
 * @param ctx The command context
 * @returns The decorated result
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RendererDecorator<T, G extends GunshiParams<any> = DefaultGunshiParams> = (
  baseRenderer: (ctx: Readonly<CommandContext<G>>) => Promise<T>,
  ctx: Readonly<CommandContext<G>>
) => Promise<T>

/**
 * Validation errors renderer decorator type.
 * A function that wraps a validation errors renderer to add or modify its behavior.
 * @param baseRenderer The base validation errors renderer function to decorate
 * @param ctx The command context
 * @param error The aggregate error containing validation errors
 * @returns The decorated result
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ValidationErrorsDecorator<G extends GunshiParams<any> = DefaultGunshiParams> = (
  baseRenderer: (ctx: Readonly<CommandContext<G>>, error: AggregateError) => Promise<string>,
  ctx: Readonly<CommandContext<G>>,
  error: AggregateError
) => Promise<string>
