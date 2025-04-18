/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type { ArgOptions, ArgToken, ArgValues } from 'args-tokens'

import { BUILT_IN_KEY_SEPARATOR, BUILT_IN_PREFIX, OPTION_PREFIX } from './constants.ts'

type Awaitable<T> = T | Promise<T>

type RemoveIndexSignature<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K]
}

/**
 * Remove index signature from object or record type.
 */
export type RemovedIndex<T> = RemoveIndexSignature<{
  [K in keyof T]: T[K]
}>

/**
 * Generate a namespaced key.
 */
export type GenerateNamespacedKey<
  Key extends string,
  Prefixed extends string = typeof BUILT_IN_PREFIX
> = `${Prefixed}${typeof BUILT_IN_KEY_SEPARATOR}${Key}`

/**
 * Command i18n built-in options keys.
 */
export type CommandBuiltinOptionsKeys = keyof (typeof import('./constants.ts'))['COMMON_OPTIONS']

/**
 * Command i18n built-in resource keys.
 */
export type CommandBuiltinResourceKeys =
  (typeof import('./constants.ts'))['COMMAND_BUILTIN_RESOURCE_KEYS'][number]

/**
 * Command i18n built-in keys.
 * The command i18n built-in keys are used to {@link CommandContext.translate | translate} function.
 */
export type CommandBuiltinKeys =
  | GenerateNamespacedKey<CommandBuiltinOptionsKeys>
  | GenerateNamespacedKey<CommandBuiltinResourceKeys>
  | 'description'
  | 'examples'

/**
 * Command i18n option keys.
 * The command i18n option keys are used to {@link CommandContext.translate | translate} function.
 */
export type CommandOptionKeys<Options extends ArgOptions> = GenerateNamespacedKey<
  keyof RemovedIndex<Options>,
  typeof OPTION_PREFIX
>

/**
 * Command environment.
 */
export interface CommandEnvironment<Options extends ArgOptions = ArgOptions> {
  /**
   * Current working directory.
   * @see {@link CommandOptions.cwd}
   */
  cwd: string | undefined
  /**
   * Command name.
   * @see {@link CommandOptions.name}
   */
  name: string | undefined
  /**
   * Command description.
   * @see {@link CommandOptions.description}
   *
   */
  description: string | undefined
  /**
   * Command version.
   * @see {@link CommandOptions.version}
   */
  version: string | undefined
  /**
   * Left margin of the command output.
   * @default 2
   * @see {@link CommandOptions.leftMargin}
   */
  leftMargin: number
  /**
   * Middle margin of the command output.
   * @default 10
   * @see {@link CommandOptions.middleMargin}
   */
  middleMargin: number
  /**
   * Whether to display the usage option type.
   * @default false
   * @see {@link CommandOptions.usageOptionType}
   */
  usageOptionType: boolean
  /**
   * Whether to display the command usage.
   * @default false
   * @see {@link}
   */
  usageSilent: boolean
  /**
   * Sub commands.
   * @see {@link CommandOptions.subCommands}
   */
  subCommands: Map<string, Command<any> | LazyCommand<any>> | undefined // eslint-disable-line @typescript-eslint/no-explicit-any
  /**
   * Render function the command usage.
   */
  renderUsage: ((ctx: CommandContext<Options>) => Promise<string>) | null | undefined
  /**
   * Render function the header section in the command usage.
   */
  renderHeader: ((ctx: CommandContext<Options>) => Promise<string>) | null | undefined
  /**
   * Render function the validation errors.
   */
  renderValidationErrors:
    | ((ctx: CommandContext<Options>, error: AggregateError) => Promise<string>)
    | null
    | undefined
}

/**
 * Command options.
 */
export interface CommandOptions<Options extends ArgOptions = ArgOptions> {
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
   * Whether to display the usage option type.
   */
  usageOptionType?: boolean
  /**
   * Whether to display the command usage.
   */
  usageSilent?: boolean
  /**
   * Render function the command usage.
   */
  renderUsage?: ((ctx: Readonly<CommandContext<Options>>) => Promise<string>) | null
  /**
   * Render function the header section in the command usage.
   */
  renderHeader?: ((ctx: Readonly<CommandContext<Options>>) => Promise<string>) | null
  /**
   * Render function the validation errors.
   */
  renderValidationErrors?:
    | ((ctx: Readonly<CommandContext<Options>>, error: AggregateError) => Promise<string>)
    | null
  /**
   * Translation adapter factory.
   */
  translationAdapterFactory?: TranslationAdapterFactory
}

/**
 * Command context.
 * Command context is the context of the command execution.
 */
export interface CommandContext<
  Options extends ArgOptions = ArgOptions,
  Values = ArgValues<Options>
> {
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
  env: Readonly<CommandEnvironment<Options>>
  /**
   * Command options, that is the options of the command that is executed.
   * The command options is same {@link Command.options}.
   */
  options: Options
  /**
   * Command values, that is the values of the command that is executed.
   * Resolve values with `resolveArgs` from command arguments and {@link Command.options}.
   */
  values: Values
  /**
   * Command positionals arguments, that is the positionals of the command that is executed.
   * Resolve positionals with `resolveArgs` from command arguments.
   */
  positionals: string[]
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
   * Output a message.
   * If {@link CommandEnvironment.usageSilent} is true, the message is not output.
   * @param message an output message, @see {@link console.log}
   * @param optionalParams an optional parameters, @see {@link console.log}
   */
  log: (message?: any, ...optionalParams: any[]) => void // eslint-disable-line @typescript-eslint/no-explicit-any
  /**
   * Load sub-commands.
   * The loaded commands are cached and returned when called again.
   * @returns loaded commands.
   */
  loadCommands: () => Promise<Command<Options>[]>
  /**
   * Translate function.
   * @param key the key to be translated
   * @param values the values to be formatted
   * @returns A translated string.
   */
  translate: <
    T extends string = CommandBuiltinKeys,
    O = CommandOptionKeys<Options>,
    Key = CommandBuiltinKeys | O | T
  >(
    key: Key,
    values?: Record<string, unknown>
  ) => string
}

/**
 * Command interface.
 */
export interface Command<Options extends ArgOptions = ArgOptions> {
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
   * Command options.
   * Each option can include a description property to describe the option in usage.
   */
  options?: Options
  /**
   * Command examples.
   * examples of how to use the command.
   */
  examples?: string
  /**
   * Command runner. it's the command to be executed
   */
  run: CommandRunner<Options>
  /**
   * Command resource fetcher.
   */
  resource?: CommandResourceFetcher<Options>
}

/**
 * Command resource.
 */
export type CommandResource<Options extends ArgOptions = ArgOptions> = {
  /**
   * Command description.
   */
  description: string
  /**
   * Examples usage.
   */
  examples: string
} & {
  [Option in GenerateNamespacedKey<keyof RemovedIndex<Options>, typeof OPTION_PREFIX>]: string
} & { [key: string]: string } // Infer the options usage, Define the user resources

/**
 * Command resource fetcher.
 * @param ctx A {@link CommandContext | command context}
 * @returns A fetched {@link CommandResource | command resource}.
 */
export type CommandResourceFetcher<
  Options extends ArgOptions = ArgOptions,
  Values = ArgValues<Options>
> = (ctx: Readonly<CommandContext<Options, Values>>) => Promise<CommandResource<Options>>

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
 */
export type CommandRunner<Options extends ArgOptions = ArgOptions> = (
  ctx: Readonly<CommandContext<Options>>
) => Awaitable<void>

/**
 * Lazy command interface.
 * Lazy command that's not loaded until it is executed.
 */
export type LazyCommand<Options extends ArgOptions = ArgOptions> = () => Awaitable<Command<Options>>

/**
 * Define a command type.
 */
export type Commandable<Options extends ArgOptions> = Command<Options> | LazyCommand<Options>
