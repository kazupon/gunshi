/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

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
