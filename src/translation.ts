import { create } from './utils.js'

import type { TranslationAdapter, TranslationAdapterFactoryOptions } from './types'

export function createTranslationAdapter(
  options: TranslationAdapterFactoryOptions
): TranslationAdapter {
  return new DefaultTranslation(options)
}

export class DefaultTranslation implements TranslationAdapter {
  #resources: Map<string, Record<string, string>> = new Map()
  options: TranslationAdapterFactoryOptions

  constructor(options: TranslationAdapterFactoryOptions) {
    this.options = options
    this.#resources = new Map()
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
    _values: Record<string, unknown> = create<Record<string, unknown>>()
  ): string | undefined {
    /**
     * NOTE:
     * DefaultTranslation support static message only
     * If you want to resolve message with values and use the complex message format,
     * you should inherit this class or implement your own translation adapter.
     */
    return this.getMessage(locale, key) || this.getMessage(this.options.fallbackLocale, key)
  }
}
