/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type {
  Args,
  Awaitable,
  Command,
  CommandContext,
  DefaultGunshiParams,
  ExtractArgs,
  GunshiParams,
  GunshiParamsConstraint
} from '@gunshi/plugin'
import { ARG_PREFIX, namespacedId, PLUGIN_PREFIX } from '@gunshi/shared'

import type {
  BuiltinResourceKeys,
  GenerateNamespacedKey,
  KeyOfArgs,
  RemovedIndex,
  ResolveTranslationKeys
} from '@gunshi/shared'

/**
 * The unique identifier for the i18n plugin.
 */
export const pluginId: GenerateNamespacedKey<'i18n', typeof PLUGIN_PREFIX> = namespacedId('i18n')

/**
 * Type representing the unique identifier for i18n plugin.
 */
export type PluginId = typeof pluginId

/**
 * Extended command context which provides utilities via i18n plugin.
 * These utilities are available via `CommandContext.extensions['g:i18n']`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- NOTE(kazupon): GunshiParams is a generic type
export interface I18nExtension<G extends GunshiParams<any> = DefaultGunshiParams> {
  /**
   * Command locale
   */
  locale: Intl.Locale
  /**
   * Translate a message.
   *
   * @param key - Translation key
   * @param values - Values to interpolate
   * @returns Translated message. If the key is not found:
   *   - For custom keys: returns an empty string ('')
   *   - For built-in keys (prefixed with '_:'): returns the key itself
   */
  translate: <
    A extends Args = G['args'],
    C = {}, // for CommandContext
    E extends Record<string, string> = {}, // for extended resources
    K = ResolveTranslationKeys<A, C, E>
  >(
    key: K,
    values?: Record<string, unknown>
  ) => string
  /**
   * Load command resources.
   *
   * @param ctx - Command context
   * @param command - Command
   * @returns Whether the resources were loaded successfully
   */
  loadResource: (
    locale: string | Intl.Locale,
    ctx: CommandContext,
    command: Command
  ) => Promise<boolean>
}

/**
 * i18n plugin options
 */
export interface I18nPluginOptions {
  /**
   * Locale to use for translations
   */
  locale?: string | Intl.Locale
  /**
   * Translation adapter factory
   */
  translationAdapterFactory?: TranslationAdapterFactory
  /**
   * Built-in localizable resources
   */
  builtinResources?: Record<string, Record<BuiltinResourceKeys, string>>
}

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
   * A locale (BCP 47 language tag).
   */
  locale: string
  /**
   * A fallback locale.
   *
   * @default DEFAULT_LOCALE ('en-US')
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
   *
   * @param locale - A Locale at the time of command execution. That is Unicord locale ID (BCP 47)
   * @returns A resource of locale. if resource not found, return `undefined`.
   */
  getResource(locale: string): Record<string, string> | undefined
  /**
   * Set a resource of locale.
   *
   * @param locale - A Locale at the time of command execution. That is Unicord locale ID (BCP 47)
   * @param resource - A resource of locale
   */
  setResource(locale: string, resource: Record<string, string>): void
  /**
   * Get a message of locale.
   *
   * @param locale - A Locale at the time of command execution. That is Unicord locale ID (BCP 47)
   * @param key - A key of message resource
   * @returns A message of locale. if message not found, return `undefined`.
   */
  getMessage(locale: string, key: string): MessageResource | undefined
  /**
   * Translate a message.
   *
   * @param locale - A Locale at the time of command execution. That is Unicord locale ID (BCP 47)
   * @param key - A key of message resource
   * @param values - A values to be resolved in the message
   * @returns A translated message, if message is not translated, return `undefined`.
   */
  translate(locale: string, key: string, values?: Record<string, unknown>): string | undefined
}

/**
 * Command resource type for i18n plugin.
 */
export type CommandResource<G extends GunshiParamsConstraint = DefaultGunshiParams> = {
  /**
   * Command description.
   */
  description: string
} & {
  [Arg in GenerateNamespacedKey<KeyOfArgs<RemovedIndex<ExtractArgs<G>>>, typeof ARG_PREFIX>]: string
} & { [key: string]: string } // Infer the arguments usage, Define the user resources

/**
 * Command resource fetcher.
 *
 * @param ctx - A {@link CommandContext | command context}
 * @returns A fetched {@link CommandResource | command resource}.
 */
export type CommandResourceFetcher<G extends GunshiParamsConstraint = DefaultGunshiParams> = (
  ctx: Readonly<CommandContext<G>>
) => Awaitable<CommandResource<G>>

/**
 * I18n-aware command interface that extends the base Command with resource support
 */
export interface I18nCommand<G extends GunshiParamsConstraint = DefaultGunshiParams>
  extends Command<G> {
  /**
   * Command resource fetcher for i18n support.
   * This property is specific to i18n-enabled commands.
   */
  resource?: CommandResourceFetcher<G>
}
