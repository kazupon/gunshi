/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type { Args, ArgToken, ArgValues } from 'args-tokens'

import { ARG_PREFIX, BUILT_IN_KEY_SEPARATOR, BUILT_IN_PREFIX } from './constants.ts'

export type Awaitable<T> = T | Promise<T>

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
 * CLI options of `cli` function.
 */
export interface CliOptions<A extends Args = Args> {
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
 * Command call mode.
 */
export type CommandCallMode = 'entry' | 'subCommand' | 'unexpected'

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
 * CommandContextCore type (base type without extensions)
 */
export type CommandContextCore<A extends Args = Args, V = ArgValues<A>> = Readonly<
  CommandContext<A, V>
>

/**
 * Context extension type definition
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ContextExtension<T = any> {
  readonly key: symbol
  readonly factory: (core: CommandContextCore) => T
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
  /**
   * Whether to convert the camel-case style argument name to kebab-case.
   * If you will set to `true`, All {@link Command.args} names will be converted to kebab-case.
   */
  toKebab?: boolean
}

/**
 * Extended command type with extension support
 */
export interface ExtendedCommand<
  A extends Args = Args,
  E extends Record<string, ContextExtension> = {}
> extends Omit<Command<A>, 'run'> {
  _extensions?: E
  run?: (
    ctx: CommandContext<A> & {
      ext: { [K in keyof E]: ReturnType<E[K]['factory']> }
    }
  ) => Awaitable<void | string>
}

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
 * @returns void or string (for CLI output)
 */
export type CommandRunner<A extends Args = Args> = (
  ctx: Readonly<CommandContext<A>>
) => Awaitable<void | string>

/**
 * Command decorator.
 * A function that wraps a command runner to add or modify its behavior.
 * @param baseRunner The base command runner to decorate
 * @returns The decorated command runner
 */
export type CommandDecorator<A extends Args = Args> = (
  baseRunner: CommandRunner<A>
) => CommandRunner<A>

export type CommandLoader<A extends Args = Args> = () => Awaitable<Command<A> | CommandRunner<A>>

/**
 * Renderer decorator type.
 * A function that wraps a base renderer to add or modify its behavior.
 * @param baseRenderer The base renderer function to decorate
 * @param ctx The command context
 * @returns The decorated result
 */
export type RendererDecorator<T> = (
  baseRenderer: (ctx: CommandContext) => Promise<T>,
  ctx: CommandContext
) => Promise<T>

/**
 * Validation errors renderer decorator type.
 * A function that wraps a validation errors renderer to add or modify its behavior.
 * @param baseRenderer The base validation errors renderer function to decorate
 * @param ctx The command context
 * @param error The aggregate error containing validation errors
 * @returns The decorated result
 */
export type ValidationErrorsDecorator = (
  baseRenderer: (ctx: CommandContext, error: AggregateError) => Promise<string>,
  ctx: CommandContext,
  error: AggregateError
) => Promise<string>
