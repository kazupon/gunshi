import {
  createCoreContext,
  getLocaleMessage,
  NOT_REOSLVED,
  setLocaleMessage,
  translate
} from '@intlify/core'
import { MessageFormat } from 'messageformat'
import { vi } from 'vitest'
import { DefaultTranslation } from '../src/translation.ts'
import { create } from '../src/utils.ts'

import type { CoreContext, LocaleMessage, LocaleMessageValue } from '@intlify/core'
import type { Args } from 'args-tokens'
import type {
  CommandContext,
  CommandContextExtension,
  ExtendContext,
  TranslationAdapter,
  TranslationAdapterFactoryOptions
} from '../src/types.ts'

export function defineMockLog(utils: typeof import('../src/utils.ts')) {
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

  override translate(
    locale: string,
    key: string,
    values: Record<string, unknown>
  ): string | undefined {
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
    return typeof ret === 'number' && ret === NOT_REOSLVED ? undefined : (ret as string)
  }
}

export function createMockCommandContext<E extends ExtendContext = {}>(
  extensions?: Record<string, CommandContextExtension>
): CommandContext<Args, E> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let ctx: any = {
    name: 'mock-command',
    description: 'Mock command',
    locale: new Intl.Locale('en-US'),
    env: {
      cwd: undefined,
      name: 'test-app',
      description: 'Test application',
      version: '1.0.0',
      leftMargin: 2,
      middleMargin: 10,
      usageOptionType: false,
      usageOptionValue: true,
      usageSilent: false,
      subCommands: undefined,
      renderUsage: undefined,
      renderHeader: undefined,
      renderValidationErrors: undefined
    },
    args: {},
    values: {},
    positionals: [],
    rest: [],
    _: [],
    tokens: [],
    omitted: false,
    callMode: 'entry',
    log: vi.fn(),
    loadCommands: vi.fn().mockResolvedValue([]),
    // eslint-disable-next-line unicorn/prefer-native-coercion-functions, @typescript-eslint/no-explicit-any
    translate: ((key: any) => String(key)) as CommandContext['translate']
  }

  if (extensions) {
    const extensions = create(null) as any // eslint-disable-line @typescript-eslint/no-explicit-any
    for (const [key, extension] of Object.entries(extensions)) {
      extensions[key] = (extension as CommandContextExtension).factory(ctx)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ctx = Object.assign(create<any>(), ctx, { extensions })
  }

  return ctx as CommandContext<Args, E>
}
