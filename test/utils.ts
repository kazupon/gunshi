import { MessageFormat } from 'messageformat'
import { vi } from 'vitest'
import { DefaultTranslation } from '../src/translation.js'

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
    console.log('MF2 formatted', formatted)
    return detectError ? undefined : formatted
  }
}
