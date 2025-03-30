import { create } from './utils.ts'

import type { TranslationAdapter, TranslationAdapterFactoryOptions } from './types.ts'

export function createTranslationAdapter(
  options: TranslationAdapterFactoryOptions
): TranslationAdapter {
  return new DefaultTranslation(options)
}

export class DefaultTranslation implements TranslationAdapter {
  #resources: Map<string, Record<string, string>> = new Map()
  #options: TranslationAdapterFactoryOptions

  constructor(options: TranslationAdapterFactoryOptions) {
    this.#options = options
    this.#resources.set(options.locale, create<Record<string, string>>())
    if (options.locale !== options.fallbackLocale) {
      this.#resources.set(options.fallbackLocale, create<Record<string, string>>())
    }
  }

  getResource(locale: string): Record<string, string> | undefined {
    return this.#resources.get(locale)
  }

  setResource(locale: string, resource: Record<string, string>): void {
    this.#resources.set(locale, resource)
  }

  getMessage(locale: string, key: string): string | undefined {
    const resource = this.getResource(locale)
    if (resource) {
      return resource[key]
    }
    return undefined
  }

  translate(
    locale: string,
    key: string,
    values: Record<string, unknown> = create<Record<string, unknown>>()
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

    return message.replaceAll(/\{\{(\w+)\}\}/g, (_: string | RegExp, name: string): string => {
      return values[name] == null ? '' : values[name].toString()
    })
  }
}
