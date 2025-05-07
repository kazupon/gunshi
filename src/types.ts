/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type { Args, ArgToken, ArgValues } from 'args-tokens'

import { ARG_PREFIX, BUILT_IN_KEY_SEPARATOR, BUILT_IN_PREFIX } from './constants.ts'

type Awaitable<T> = T | Promise<T>

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
export interface CommandEnvironment<A extends Args = Args> {
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
   * Whether to display the option value.
   * @default true
   * @see {@link CommandOptions.usageOptionValue}
   */
  usageOptionValue: boolean
  /**
   * Whether to display the command usage.
   * @default false
   * @see {@link CommandOptions.usageSilent}
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
  renderUsage: ((ctx: CommandContext<A>) => Promise<string>) | null | undefined
  /**
   * Render function the header section in the command usage.
   */
  renderHeader: ((ctx: CommandContext<A>) => Promise<string>) | null | undefined
  /**
   * Render function the validation errors.
   */
  renderValidationErrors:
    | ((ctx: CommandContext<A>, error: AggregateError) => Promise<string>)
    | null
    | undefined
}

/**
 * Command options.
 */
export interface CommandOptions<A extends Args = Args> {
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
  renderUsage?: ((ctx: Readonly<CommandContext<A>>) => Promise<string>) | null
  /**
   * Render function the header section in the command usage.
   */
  renderHeader?: ((ctx: Readonly<CommandContext<A>>) => Promise<string>) | null
  /**
   * Render function the validation errors.
   */
  renderValidationErrors?:
    | ((ctx: Readonly<CommandContext<A>>, error: AggregateError) => Promise<string>)
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
export interface CommandContext<A extends Args = Args, V = ArgValues<A>> {
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
  env: Readonly<CommandEnvironment<A>>
  /**
   * Command arguments, that is the arguments of the command that is executed.
   * The command arguments is same {@link Command.args}.
   */
  args: A
  /**
   * Command values, that is the values of the command that is executed.
   * Resolve values with `resolveArgs` from command arguments and {@link Command.args}.
   */
  values: V
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
  loadCommands: () => Promise<Command<A>[]>
  /**
   * Translate function.
   * @param key the key to be translated
   * @param values the values to be formatted
   * @returns A translated string.
   */
  translate: <
    T extends string = CommandBuiltinKeys,
    O = CommandArgKeys<A>,
    K = CommandBuiltinKeys | O | T
  >(
    key: K,
    values?: Record<string, unknown>
  ) => string
}

/**
 * Command interface.
 */
export interface Command<A extends Args = Args> {
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
  args?: A
  /**
   * Command examples.
   * examples of how to use the command.
   */
  examples?: string | CommandExamplesFetcher<A>
  /**
   * Command runner. it's the command to be executed
   */
  run?: CommandRunner<A>
  /**
   * Command resource fetcher.
   */
  resource?: CommandResourceFetcher<A>
}

/**
 * Command resource.
 */
export type CommandResource<A extends Args = Args> = {
  /**
   * Command description.
   */
  description: string
  /**
   * Examples usage.
   */
  examples: string | CommandExamplesFetcher<A>
} & {
  [Arg in GenerateNamespacedKey<KeyOfArgs<RemovedIndex<A>>, typeof ARG_PREFIX>]: string
} & { [key: string]: string } // Infer the arguments usage, Define the user resources

/**
 * Command examples fetcher.
 * @param ctx A {@link CommandContext | command context}
 * @returns A fetched command examples.
 */
export type CommandExamplesFetcher<A extends Args = Args, V = ArgValues<A>> = (
  ctx: Readonly<CommandContext<A, V>>
) => Promise<string>

/**
 * Command resource fetcher.
 * @param ctx A {@link CommandContext | command context}
 * @returns A fetched {@link CommandResource | command resource}.
 */
export type CommandResourceFetcher<A extends Args = Args, V = ArgValues<A>> = (
  ctx: Readonly<CommandContext<A, V>>
) => Promise<CommandResource<A>>

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
export type CommandRunner<A extends Args = Args> = (
  ctx: Readonly<CommandContext<A>>
) => Awaitable<void>

export type CommandLoader<A extends Args = Args> = () => Awaitable<Command<A> | CommandRunner<A>>

/**
 * Lazy command interface.
 * Lazy command that's not loaded until it is executed.
 */
export type LazyCommand<A extends Args = Args> = {
  /**
   * Command load function
   */
  (): Awaitable<Command<A> | CommandRunner<A>>
  /**
   * Command name
   */
  commandName?: string
} & Omit<Command<A>, 'run' | 'name'>

/**
 * Define a command type.
 */
export type Commandable<A extends Args> = Command<A> | LazyCommand<A>
