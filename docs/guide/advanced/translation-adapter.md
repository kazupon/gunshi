# Translation Adapter

Gunshi provides built-in internationalization support, but you might want to integrate it with existing translation systems or libraries. This guide explains how to create a translation adapter to connect Gunshi with your preferred i18n solution.

## Why Use a Translation Adapter?

A translation adapter offers several benefits:

- **Integration**: Connect Gunshi with your existing i18n infrastructure
- **Consistency**: Use the same translation system across your entire application
- **Advanced features**: Leverage features of specialized i18n libraries like message formatting
- **Resource management**: Let your i18n library manage translation resources directly

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
function createTranslationAdapterFactory() {
  return options => {
    // options contains locale and fallbackLocale
    return new MyTranslationAdapter(options)
  }
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

    // Simple interpolation for demonstration
    return message.replaceAll(/\{\{(\w+)\}\}/g, (_, name) => {
      return values[name] === undefined ? `{{${name}}}` : values[name]
    })
  }
}

// Define your command
const command = {
  name: 'greeter',
  options: {
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
        options: {
          name: '挨拶する相手の名前'
        },
        greeting: 'こんにちは、{{name}}さん！'
      }
    }

    return {
      description: 'Greeting application',
      options: {
        name: 'Name to greet'
      },
      greeting: 'Hello, {{name}}!'
    }
  },

  run: ctx => {
    const { name = 'World' } = ctx.values

    // Use the translation function
    const message = ctx.translation('greeting', { name })

    console.log(message)
  }
}

// Run the command with the custom translation adapter
cli(process.argv.slice(2), command, {
  name: 'translation-adapter-example',
  version: '1.0.0',
  locale: new Intl.Locale(process.env.MY_LOCALE || 'en-US'),
  translationAdapterFactory: createTranslationAdapterFactory()
})
```

## Integrating with MessageFormat

[MessageFormat](https://messageformat.github.io/) is a library for handling pluralization, gender, and other complex message formatting. Here's how to create a translation adapter for MessageFormat:

```js
import { cli } from 'gunshi'
import { MessageFormat } from 'messageformat'

// Create a MessageFormat translation adapter factory
function createMessageFormatAdapterFactory() {
  return options => new MessageFormatTranslation(options)
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
    if (!this.#formatters.has(cacheKey)) {
      try {
        const messageFormat = new MessageFormat(locale)
        const formatter = messageFormat.compile(message)
        this.#formatters.set(cacheKey, formatter)
      } catch (error) {
        console.error(`[gunshi] MessageFormat error: ${error.message}`)
        return
      }
    }

    // Format the message with the values
    try {
      const formatter = this.#formatters.get(cacheKey)
      return formatter(values)
    } catch (error) {
      console.error(`[gunshi] MessageFormat error: ${error.message}`)
      return
    }
  }
}

// Define your command
const command = {
  name: 'greeter',
  options: {
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
        options: {
          name: '挨拶する相手の名前',
          count: '挨拶の回数'
        },
        greeting:
          '{count, plural, one{こんにちは、{name}さん！} other{こんにちは、{name}さん！({count}回)}}'
      }
    }

    return {
      description: 'Greeting application',
      options: {
        name: 'Name to greet',
        count: 'Number of greetings'
      },
      greeting: '{count, plural, one{Hello, {name}!} other{Hello, {name}! ({count} times)}}'
    }
  },

  run: ctx => {
    const { name = 'World', count } = ctx.values

    // Use the translation function with MessageFormat
    const message = ctx.translation('greeting', { name, count })

    console.log(message)
  }
}

// Run the command with the MessageFormat translation adapter
cli(process.argv.slice(2), command, {
  name: 'messageformat-example',
  version: '1.0.0',
  locale: new Intl.Locale(process.env.MY_LOCALE || 'en-US'),
  translationAdapterFactory: createMessageFormatAdapterFactory()
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
} from '@intlify/core'

// Create an Intlify translation adapter factory
function createIntlifyAdapterFactory() {
  return options => new IntlifyTranslation(options)
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
  options: {
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
        options: {
          name: '挨拶する相手の名前'
        },
        greeting: 'こんにちは、{name}さん！'
      }
    }

    return {
      description: 'Greeting application',
      options: {
        name: 'Name to greet'
      },
      greeting: 'Hello, {name}!'
    }
  },

  run: ctx => {
    const { name = 'World' } = ctx.values

    // Use the translation function with Intlify
    const message = ctx.translation('greeting', { name })

    console.log(message)
  }
}

// Run the command with the Intlify translation adapter
cli(process.argv.slice(2), command, {
  name: 'intlify-example',
  version: '1.0.0',
  locale: new Intl.Locale(process.env.MY_LOCALE || 'en-US'),
  translationAdapterFactory: createIntlifyAdapterFactory()
})
```

## Complete Example with MessageFormat

Here's a complete example of a CLI with a MessageFormat translation adapter:

```js
import { cli } from 'gunshi'
import { MessageFormat } from 'messageformat'

// Create a MessageFormat translation adapter factory
function createMessageFormatAdapterFactory() {
  return options => new MessageFormatTranslation(options)
}

class MessageFormatTranslation {
  #resources = new Map()
  #options
  #formatters = new Map()

  constructor(options) {
    this.#options = options
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
    let message = this.getMessage(locale, key)

    if (message === undefined && locale !== this.#options.fallbackLocale) {
      message = this.getMessage(this.#options.fallbackLocale, key)
    }

    if (message === undefined) {
      return
    }

    const cacheKey = `${locale}:${key}:${message}`
    if (!this.#formatters.has(cacheKey)) {
      try {
        const messageFormat = new MessageFormat(locale)
        const formatter = messageFormat.compile(message)
        this.#formatters.set(cacheKey, formatter)
      } catch (error) {
        console.error(`[gunshi] MessageFormat error: ${error.message}`)
        return
      }
    }

    try {
      const formatter = this.#formatters.get(cacheKey)
      return formatter(values)
    } catch (error) {
      console.error(`[gunshi] MessageFormat error: ${error.message}`)
      return
    }
  }
}

// Define a task manager command
const command = {
  name: 'task-manager',
  options: {
    action: {
      type: 'string',
      short: 'a',
      description: 'Action to perform (add, list, complete)'
    },
    task: {
      type: 'string',
      short: 't',
      description: 'Task description'
    },
    count: {
      type: 'number',
      short: 'c',
      default: 0,
      description: 'Number of tasks'
    }
  },

  // Define resources with MessageFormat syntax
  resource: async ctx => {
    if (ctx.locale.toString() === 'ja-JP') {
      return {
        description: 'タスク管理アプリケーション',
        options: {
          action: '実行するアクション（add, list, complete）',
          task: 'タスクの説明',
          count: 'タスクの数'
        },
        add_success: 'タスク「{task}」を追加しました',
        list_tasks:
          '{count, plural, =0{タスクはありません} one{1つのタスクがあります} other{{count}つのタスクがあります}}',
        complete_success: 'タスク「{task}」を完了しました',
        unknown_action: '不明なアクション: {action}'
      }
    }

    return {
      description: 'Task management application',
      options: {
        action: 'Action to perform (add, list, complete)',
        task: 'Task description',
        count: 'Number of tasks'
      },
      add_success: 'Added task: "{task}"',
      list_tasks: '{count, plural, =0{No tasks} one{1 task} other{{count} tasks}}',
      complete_success: 'Completed task: "{task}"',
      unknown_action: 'Unknown action: {action}'
    }
  },

  run: ctx => {
    const { action, task, count } = ctx.values

    console.log(`Current locale: ${ctx.locale}`)

    switch (action) {
      case 'add': {
        if (task) {
          console.log(ctx.translation('add_success', { task }))
        }
        break
      }
      case 'list': {
        console.log(ctx.translation('list_tasks', { count }))
        break
      }
      case 'complete': {
        if (task) {
          console.log(ctx.translation('complete_success', { task }))
        }
        break
      }
      default: {
        console.log(ctx.translation('unknown_action', { action: action || 'none' }))
      }
    }
  }
}

// Run the command with the MessageFormat translation adapter
cli(process.argv.slice(2), command, {
  name: 'task-manager',
  version: '1.0.0',
  description: ctx => ctx.translation('description'),
  locale: new Intl.Locale(process.env.MY_LOCALE || 'en-US'),
  translationAdapterFactory: createMessageFormatAdapterFactory()
})
```

## How It Works

Here's how the translation adapter works with Gunshi:

1. You provide a `translationAdapterFactory` function in the CLI options
2. Gunshi calls this factory with locale information to create a translation adapter
3. When a command has a `resource` function, Gunshi fetches the resources and passes them to the translation adapter using `setResource`
4. When `ctx.translation(key, values)` is called in your command, Gunshi uses the translation adapter to translate the key with the values

This architecture allows you to:

- Use any i18n library with Gunshi
- Let the i18n library manage resources directly
- Use advanced features like pluralization and formatting
- Share translation adapters across your projects

## Next Steps

Now that you understand how to create translation adapters for Gunshi, you can:

- [Customize usage generation](/guide/advanced/custom-usage-generation) for more control over help messages
- [Generate documentation](/guide/advanced/documentation-generation) for your CLI in multiple languages
- Explore other i18n libraries and create adapters for them
