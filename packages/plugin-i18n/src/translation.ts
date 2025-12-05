/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type { TranslationAdapter, TranslationAdapterFactoryOptions } from './types.ts'

/**
 * Create a translation adapter.
 *
 * @param options - Options for the translation adapter, see {@linkcode TranslationAdapterFactoryOptions}
 * @returns A translation adapter instance
 */
export function createTranslationAdapter(
  options: TranslationAdapterFactoryOptions
): TranslationAdapter {
  return new DefaultTranslation(options)
}

/**
 * Default implementation of {@linkcode TranslationAdapter}.
 */
export class DefaultTranslation implements TranslationAdapter {
  #resources: Map<string, Record<string, string>> = new Map()
  #options: TranslationAdapterFactoryOptions

  /**
   * Creates a new instance of DefaultTranslation.
   *
   * @param options - Options for the translation adapter, see {@linkcode TranslationAdapterFactoryOptions}
   */
  constructor(options: TranslationAdapterFactoryOptions) {
    this.#options = options
    this.#resources.set(options.locale, Object.create(null) as Record<string, string>)
    if (options.locale !== options.fallbackLocale) {
      this.#resources.set(options.fallbackLocale, Object.create(null) as Record<string, string>)
    }
  }

  /**
   * Get a resource of locale.
   *
   * @param locale - A locale of resource (BCP 47 language tag)
   * @returns A resource of locale. If resource not found, return `undefined`.
   */
  getResource(locale: string): Record<string, string> | undefined {
    return this.#resources.get(locale)
  }

  /**
   * Set a resource of locale.
   *
   * @param locale - A locale of resource (BCP 47 language tag)
   * @param resource - A resource of locale
   */
  setResource(locale: string, resource: Record<string, string>): void {
    this.#resources.set(locale, resource)
  }

  /**
   * Get a message of locale.
   *
   * @param locale - A locale of message (BCP 47 language tag)
   * @param key - A key of message resource
   * @returns A message of locale. If message not found, return `undefined`.
   */
  getMessage(locale: string, key: string): string | undefined {
    const resource = this.getResource(locale)
    if (resource) {
      return resource[key]
    }
    return undefined
  }

  /**
   * Translate a message.
   *
   * @param locale - A locale of message (BCP 47 language tag)
   * @param key - A key of message resource
   * @param values - A values to interpolate in the message
   * @returns A translated message, if message is not translated, return `undefined`.
   */
  translate(
    locale: string,
    key: string,
    values: Record<string, unknown> = Object.create(null) as Record<string, unknown>
  ): string | undefined {
    // Try to get the message from the specified locale
    let message = this.getMessage(locale, key)

    // Fall back to the fallback locale if needed
    if (message === undefined && locale !== this.#options.fallbackLocale) {
      message = this.getMessage(this.#options.fallbackLocale, key)
    }

    if (message === undefined) {
      return
    }

    return message.replaceAll(/\{\$(\w+)\}/g, (_: string | RegExp, name: string): string => {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string -- NOTE(kazupon): for safety
      return values[name] == null ? '' : values[name].toString()
    })
  }
}
