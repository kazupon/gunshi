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
  Command,
  CommandContext,
  CommandContextExtension,
  CommandEnvironment,
  DefaultGunshiParams,
  ExtendContext,
  GunshiParams,
  TranslationAdapter,
  TranslationAdapterFactoryOptions
} from '../src/types.ts'

type NoExt = Record<never, never>

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
    return typeof ret === 'number' && ret === NOT_REOSLVED ? undefined : (ret as string)
  }
}

type CreateMockCommandContext<G extends GunshiParams = DefaultGunshiParams> = Partial<
  Omit<CommandContext, 'extensions'> &
    Omit<CommandEnvironment, 'name' | 'description' | 'version'> & {
      extensions?: Record<string, CommandContextExtension<G['extensions']>>
      command?: Command<G>
      version?: string | null
    }
>

export async function createMockCommandContext<E extends ExtendContext = NoExt>(
  options: CreateMockCommandContext = {}
): Promise<CommandContext<GunshiParams<{ args: Args; extensions: E }>>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let ctx: any = {
    name: options.name || 'mock-command',
    description: options.description || 'Mock command',
    locale: new Intl.Locale('en-US'),
    env: {
      cwd: options.cwd,
      name: 'test-app',
      description: 'Test application',
      version: options.version == null ? undefined : options.version || '1.0.0',
      leftMargin: options.leftMargin || 2,
      middleMargin: options.middleMargin || 10,
      usageOptionType: options.usageOptionType || false,
      usageOptionValue: options.usageOptionValue || true,
      usageSilent: options.usageSilent ?? false,
      subCommands: options.subCommands ?? undefined,
      renderUsage: options.renderUsage || undefined,
      renderHeader: options.renderHeader || undefined,
      renderValidationErrors: options.renderValidationErrors || undefined
    },
    args: options.args || {},
    values: options.values || {},
    positionals: options.positionals || [],
    rest: options.rest || [],
    _: options._ || [],
    tokens: options.tokens || [],
    omitted: options.omitted || false,
    callMode: options.callMode || 'entry',
    log: options.log || vi.fn()
  }

  if (options.extensions) {
    const extensionsObj = create(null) as any // eslint-disable-line @typescript-eslint/no-explicit-any
    for (const [key, extension] of Object.entries(options.extensions)) {
      extensionsObj[key] = await (extension as CommandContextExtension).factory(
        ctx,
        options.command as Command
      )
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ctx = Object.assign(create<any>(), ctx, { extensions: extensionsObj })
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ctx = Object.assign(create<any>(), ctx, { extensions: {} })
  }

  return ctx as CommandContext<GunshiParams<{ args: Args; extensions: E }>>
}
