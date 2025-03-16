import { createCoreContext, NOT_REOSLVED, translate } from '@intlify/core'
import { MessageFormat } from 'messageformat'
import { vi } from 'vitest'
import { DefaultTranslation } from '../src/translation.js'

import type { CoreContext, LocaleMessages, NamedValue } from '@intlify/core'
import type { TranslationAdapter, TranslationAdapterFactoryOptions } from '../src/types'

export function defineMockLog(utils: typeof import('../src/utils')) {
  const logs: unknown[] = []
  vi.spyOn(utils, 'log').mockImplementation((...args: unknown[]) => {
    logs.push(args)
  })

  return () => logs.join(`\n`)
}

export function hasPrototype(obj: unknown): boolean {
  return Object.getPrototypeOf(obj) !== null
}

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

  constructor(options: TranslationAdapterFactoryOptions) {
    super(options)
    this.#messageFormatCaches = new Map()
  }

  // override
  translate(locale: string, key: string, values: Record<string, unknown>): string | undefined {
    const message = super.translate(locale, key, values)
    if (message == null) {
      return message
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
  #context: CoreContext
  constructor(options: TranslationAdapterFactoryOptions) {
    this.options = options

    const { locale, fallbackLocale } = options
    const messages: LocaleMessages<{}> = {
      [locale]: {}
    }

    if (locale !== fallbackLocale) {
      messages[fallbackLocale] = {}
    }

    this.#context = createCoreContext({
      locale,
      fallbackLocale,

      messages
    })
  }

  getResource(locale: string): Record<string, string> | undefined {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    return (this.#context.messages as any)[locale] as Record<string, string> | undefined
  }

  setResource(locale: string, resource: Record<string, string>): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    ;(this.#context.messages as any)[locale] = resource
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

    const ret = translate(this.#context, key, values as unknown as NamedValue)
    return typeof ret === 'number' && ret === NOT_REOSLVED ? undefined : (ret as string)
  }
}
