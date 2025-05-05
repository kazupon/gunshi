# Translation Adapter

Gunshi provides built-in internationalization support, but you might want to integrate it with existing translation systems or libraries. This guide explains how to create a translation adapter to connect Gunshi with your preferred i18n solution.

## Why Use a Translation Adapter?

A translation adapter offers several benefits:

- **Integration**: Connect Gunshi with your existing i18n infrastructure
- **Consistency**: Use the same translation system across your entire application
- **Advanced features**: Leverage features of specialized i18n libraries like message formatting
- **Resource management**: Let your i18n library manage translation resources directly

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!IMPORTANT]
> Gunshi has a [built-in translation adapter](../../api/default/classes/DefaultTranslation.md) that supports simple interpolation. It does not support complex forms such as plurals.

<!-- eslint-enable markdown/no-missing-label-refs -->

## Understanding the TranslationAdapter Interface

Gunshi defines a `TranslationAdapter` interface that allows you to integrate with any i18n library. The interface is designed to let the i18n library manage resources directly:

```typescript
interface TranslationAdapter<MessageResource = string> {
  /**
   * Get a resource of locale
   * @param locale A Locale at the time of command execution (BCP 47)
   * @returns A resource of locale. if resource not found, return `undefined`
   */
  getResource(locale: string): Record<string, string> | undefined

  /**
   * Set a resource of locale
   * @param locale A Locale at the time of command execution (BCP 47)
   * @param resource A resource of locale
   */
  setResource(locale: string, resource: Record<string, string>): void

  /**
   * Get a message of locale
   * @param locale A Locale at the time of command execution (BCP 47)
   * @param key A key of message resource
   * @returns A message of locale. if message not found, return `undefined`
   */
  getMessage(locale: string, key: string): MessageResource | undefined

  /**
   * Translate a message
   * @param locale A Locale at the time of command execution (BCP 47)
   * @param key A key of message resource
   * @param values A values to be resolved in the message
   * @returns A translated message, if message is not translated, return `undefined`
   */
  translate(locale: string, key: string, values?: Record<string, unknown>): string | undefined
}
```

## Creating a Translation Adapter Factory

To use a custom translation adapter with Gunshi, you need to create a translation adapter factory function that returns an implementation of the `TranslationAdapter` interface:

```js
import { cli } from 'gunshi'

// Create a translation adapter factory
function createTranslationAdapterFactory(options) {
  // options contains locale and fallbackLocale
  return new MyTranslationAdapter(options)
}

// Implement the TranslationAdapter interface
class MyTranslationAdapter {
  #resources = new Map()
  #options

  constructor(options) {
    this.#options = options
    // Initialize with empty resources for the locale and fallback locale
    this.#resources.set(options.locale, {})
    if (options.locale !== options.fallbackLocale) {
      this.#resources.set(options.fallbackLocale, {})
    }
  }

  getResource(locale) {
    return this.#resources.get(locale)
  }

  setResource(locale, resource) {
    this.#resources.set(locale, resource)
  }

  getMessage(locale, key) {
    const resource = this.getResource(locale)
    if (resource) {
      return resource[key]
    }
    return
  }

  translate(locale, key, values = {}) {
    // Try to get the message from the specified locale
    let message = this.getMessage(locale, key)

    // Fall back to the fallback locale if needed
    if (message === undefined && locale !== this.#options.fallbackLocale) {
      message = this.getMessage(this.#options.fallbackLocale, key)
    }

    if (message === undefined) {
      return
    }

    // Simple interpolation for example
    return message.replaceAll(/\{\{(\w+)\}\}/g, (_, name) => {
      return values[name] === undefined ? `{{${name}}}` : values[name]
    })
  }
}

// Define your command
const command = {
  name: 'greeter',
  args: {
    name: {
      type: 'string',
      short: 'n'
    }
  },

  // Define a resource fetcher to provide translations
  resource: async ctx => {
    if (ctx.locale.toString() === 'ja-JP') {
      return {
        description: '挨拶アプリケーション',
        name: '挨拶する相手の名前',
        greeting: 'こんにちは、{{name}}さん！'
      }
    }

    return {
      description: 'Greeting application',
      name: 'Name to greet',
      greeting: 'Hello, {{name}}!'
    }
  },

  run: ctx => {
    const { name = 'World' } = ctx.values

    // Use the translation function
    const message = ctx.translate('greeting', { name })

    console.log(message)
  }
}

// Run the command with the custom translation adapter
await cli(process.argv.slice(2), command, {
  name: 'translation-adapter-example',
  version: '1.0.0',
  locale: new Intl.Locale(process.env.MY_LOCALE || 'en-US'),
  translationAdapterFactory: createTranslationAdapterFactory
})
```

## Integrating with MessageFormat2 (`Intl.MessageFormat`)

[MessageFormat2](https://messageformat.dev/) is a Unicode standard for localizable dynamic message strings, designed to make it simple to create natural sounding localized messages. Here's how to create a translation adapter for MessageFormat:

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!WARNING]
> MessageFormat2 is **work in progress**.
> MessageFormat2 is currently being standardized and can be provided as an `Intl.MessageFormat` in the future. About see [TC39 proposal](https://github.com/tc39/proposal-intl-messageformat)

<!-- eslint-enable markdown/no-missing-label-refs -->

```js
import { cli } from 'gunshi'
import { MessageFormat } from 'messageformat' // need to install `npm install --save messageformat@next`

// Create a MessageFormat translation adapter factory
function createMessageFormatAdapterFactory(options) {
  return new MessageFormatTranslation(options)
}

class MessageFormatTranslation {
  #resources = new Map()
  #options
  #formatters = new Map()

  constructor(options) {
    this.#options = options
    // Initialize with empty resources
    this.#resources.set(options.locale, {})
    if (options.locale !== options.fallbackLocale) {
      this.#resources.set(options.fallbackLocale, {})
    }
  }

  getResource(locale) {
    return this.#resources.get(locale)
  }

  setResource(locale, resource) {
    this.#resources.set(locale, resource)
  }

  getMessage(locale, key) {
    const resource = this.getResource(locale)
    if (resource) {
      return resource[key]
    }
    return
  }

  translate(locale, key, values = {}) {
    // Try to get the message from the specified locale
    let message = this.getMessage(locale, key)

    // Fall back to the fallback locale if needed
    if (message === undefined && locale !== this.#options.fallbackLocale) {
      message = this.getMessage(this.#options.fallbackLocale, key)
    }

    if (message === undefined) {
      return
    }

    // Create a formatter for this message if it doesn't exist
    const cacheKey = `${locale}:${key}:${message}`
    let detectError = false
    const onError = err => {
      console.error('[gunshi] messageformat2 error', err.message)
      detectError = true
    }

    if (this.#formatters.has(cacheKey)) {
      const format = this.#formatters.get(cacheKey)
      const formatted = format(values, onError)
      return detectError ? undefined : formatted
    }

    const messageFormat = new MessageFormat(locale, message)
    const format = (values, onError) => {
      return messageFormat.format(values, err => {
        onError(err)
      })
    }
    this.#formatters.set(cacheKey, format)

    const formatted = format(values, onError)
    return detectError ? undefined : formatted
  }
}

// Define your command
const command = {
  name: 'greeter',
  args: {
    name: {
      type: 'string',
      short: 'n'
    },
    count: {
      type: 'number',
      short: 'c',
      default: 1
    }
  },

  // Define a resource fetcher with MessageFormat syntax
  resource: async ctx => {
    if (ctx.locale.toString() === 'ja-JP') {
      return {
        description: '挨拶アプリケーション',
        name: '挨拶する相手の名前',
        count: '挨拶の回数',
        greeting: `.input {$count :number}
.input {$name :string}
.match $count
one {{こんにちは、{$name}さん！}}
*   {{こんにちは、{$name}さん！({$count}回)}}`
      }
    }

    return {
      description: 'Greeting application',
      name: 'Name to greet',
      count: 'Number of greetings',
      greeting: `.input {$count :number}
.input {$name :string}
.match $count
one {{Hello, {$name}!}}
*   {{Hello, {$name}! ({$count} times)}}`
    }
  },

  run: ctx => {
    const { name = 'World', count } = ctx.values

    // Use the translation function with MessageFormat
    const message = ctx.translate('greeting', { name, count })

    console.log(message)
  }
}

// Run the command with the MessageFormat translation adapter
await cli(process.argv.slice(2), command, {
  name: 'messageformat-example',
  version: '1.0.0',
  locale: new Intl.Locale(process.env.MY_LOCALE || 'en-US'),
  translationAdapterFactory: createMessageFormatAdapterFactory
})
```

## Integrating with Intlify (Vue I18n Core)

[Intlify](https://github.com/intlify/core) is the core of Vue I18n, but it can be used independently. Here's how to create a translation adapter for Intlify:

```js
import { cli } from 'gunshi'
import {
  createCoreContext,
  getLocaleMessage,
  NOT_REOSLVED,
  setLocaleMessage,
  translate as intlifyTranslate
} from '@intlify/core' // need to install `npm install --save @intlify/core@next`

// Create an Intlify translation adapter factory
function createIntlifyAdapterFactory(options) {
  return new IntlifyTranslation(options)
}

class IntlifyTranslation {
  #options
  #context

  constructor(options) {
    this.#options = options

    const { locale, fallbackLocale } = options
    const messages = {
      [locale]: {}
    }

    if (locale !== fallbackLocale) {
      messages[fallbackLocale] = {}
    }

    // Create the Intlify core context
    this.#context = createCoreContext({
      locale,
      fallbackLocale,
      messages
    })
  }

  getResource(locale) {
    return getLocaleMessage(this.#context, locale)
  }

  setResource(locale, resource) {
    setLocaleMessage(this.#context, locale, resource)
  }

  getMessage(locale, key) {
    const resource = this.getResource(locale)
    if (resource) {
      return resource[key]
    }
    return
  }

  translate(locale, key, values = {}) {
    // Check if the message exists in the specified locale or fallback locale
    const message =
      this.getMessage(locale, key) || this.getMessage(this.#options.fallbackLocale, key)
    if (message === undefined) {
      return
    }

    // Use Intlify's translate function
    const result = intlifyTranslate(this.#context, key, values)
    return typeof result === 'number' && result === NOT_REOSLVED ? undefined : result
  }
}

// Define your command
const command = {
  name: 'greeter',
  args: {
    name: {
      type: 'string',
      short: 'n'
    }
  },

  // Define a resource fetcher with Intlify syntax
  resource: async ctx => {
    if (ctx.locale.toString() === 'ja-JP') {
      return {
        description: '挨拶アプリケーション',
        name: '挨拶する相手の名前',
        greeting: 'こんにちは、{name}さん！'
      }
    }

    return {
      description: 'Greeting application',
      name: 'Name to greet',
      greeting: 'Hello, {name}!'
    }
  },

  run: ctx => {
    const { name = 'World' } = ctx.values

    // Use the translation function with Intlify
    const message = ctx.translate('greeting', { name })

    console.log(message)
  }
}

// Run the command with the Intlify translation adapter
await cli(process.argv.slice(2), command, {
  name: 'intlify-example',
  version: '1.0.0',
  locale: new Intl.Locale(process.env.MY_LOCALE || 'en-US'),
  translationAdapterFactory: createIntlifyAdapterFactory
})
```

## How It Works

Here's how the translation adapter works with Gunshi:

1. You provide a `translationAdapterFactory` function in the CLI options
2. Gunshi calls this factory with locale information to create a translation adapter
3. When a command has a `resource` function, Gunshi fetches the resources and passes them to the translation adapter using `setResource`
4. When `ctx.translate(key, values)` is called in your command, Gunshi uses the translation adapter to translate the key with the values

This architecture allows you to:

- Use any i18n library with Gunshi
- Let the i18n library manage resources directly
- Use advanced features like pluralization and formatting
- Share translation adapters across your projects
