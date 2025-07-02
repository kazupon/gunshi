import {
  createCoreContext,
  getLocaleMessage,
  NOT_RESOLVED,
  setLocaleMessage,
  translate
} from '@intlify/core'
import { MessageFormat } from 'messageformat'
import { DefaultTranslation } from '../src/translation.ts'

import type { CoreContext, LocaleMessage, LocaleMessageValue } from '@intlify/core'
import type { TranslationAdapter, TranslationAdapterFactoryOptions } from '../src/types.ts'

export function createTranslationAdapterForMessageFormat2(
  options: TranslationAdapterFactoryOptions
): TranslationAdapter {
  return new MessageFormat2Translation(options)
}

class MessageFormat2Translation extends DefaultTranslation {
  #messageFormatCaches: Map<
    string,
    (values: Record<string, unknown>, onError: (err: Error) => void) => string | undefined
  >

  #options: TranslationAdapterFactoryOptions

  constructor(options: TranslationAdapterFactoryOptions) {
    super(options)
    this.#messageFormatCaches = new Map()
    this.#options = options
  }

  override translate(
    locale: string,
    key: string,
    values: Record<string, unknown>
  ): string | undefined {
    // Get the raw message without interpolation
    let message = this.getMessage(locale, key)

    // Fall back to the fallback locale if needed
    if (message === undefined && locale !== this.#options.fallbackLocale) {
      message = this.getMessage(this.#options.fallbackLocale, key)
    }

    if (message === undefined) {
      return
    }

    const cacheKey = `${locale}:${key}:${message}`
    let detectError = false
    const onError = (err: Error) => {
      console.error('[gunshi] message format2 error', err.message)
      detectError = true
    }

    if (this.#messageFormatCaches.has(cacheKey)) {
      const format = this.#messageFormatCaches.get(cacheKey)!
      const formatted = format(values, onError)
      return detectError ? undefined : formatted
    }

    const messageFormat = new MessageFormat(locale, message)
    const format = (values: Record<string, unknown>, onError: (err: Error) => void) => {
      return messageFormat.format(values, err => {
        onError(err as Error)
      })
    }
    this.#messageFormatCaches.set(cacheKey, format)

    const formatted = format(values, onError)
    return detectError ? undefined : formatted
  }
}

export function createTranslationAdapterForIntlifyMessageFormat(
  options: TranslationAdapterFactoryOptions
): TranslationAdapter {
  return new IntlifyMessageFormatTranslation(options)
}

class IntlifyMessageFormatTranslation implements TranslationAdapter {
  options: TranslationAdapterFactoryOptions
  #context: CoreContext<string, LocaleMessage, {}>
  constructor(options: TranslationAdapterFactoryOptions) {
    this.options = options

    const { locale, fallbackLocale } = options
    const messages: LocaleMessage = {
      [locale]: {}
    }

    if (locale !== fallbackLocale) {
      messages[fallbackLocale] = {}
    }

    this.#context = createCoreContext<string, {}, typeof messages>({
      locale,
      fallbackLocale,
      messages
    })
  }

  getResource(locale: string): Record<string, string> | undefined {
    return getLocaleMessage(this.#context, locale)
  }

  setResource(locale: string, resource: Record<string, string>): void {
    setLocaleMessage(this.#context, locale, resource as LocaleMessageValue)
  }

  getMessage(locale: string, key: string): string | undefined {
    const resource = this.getResource(locale)
    if (resource) {
      return resource[key]
    }
    return undefined
  }

  translate(locale: string, key: string, values: Record<string, unknown>): string | undefined {
    const message =
      this.getMessage(locale, key) || this.getMessage(this.options.fallbackLocale, key)
    if (message == null) {
      return undefined
    }

    const ret = translate(this.#context, key, values)
    return typeof ret === 'number' && ret === NOT_RESOLVED ? undefined : (ret as string)
  }
}
