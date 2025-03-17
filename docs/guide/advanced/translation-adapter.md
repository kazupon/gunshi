# Translation Adapter

Gunshi provides built-in internationalization support, but you might want to integrate it with existing translation systems or libraries. This guide explains how to create a translation adapter to connect Gunshi with your preferred i18n solution.

## Why Use a Translation Adapter?

A translation adapter offers several benefits:

- **Integration**: Connect Gunshi with your existing i18n infrastructure
- **Consistency**: Use the same translation system across your entire application
- **Advanced features**: Leverage features of specialized i18n libraries
- **Workflow**: Maintain your existing translation workflow and tools

## Basic Translation Adapter

Here's how to create a basic translation adapter for Gunshi:

```js
import { cli } from 'gunshi'

// Create a translation adapter
function createTranslationAdapter(i18nSystem) {
  return async ctx => {
    // Return a function that translates keys using your i18n system
    return key => {
      // Use your i18n system to translate the key
      return i18nSystem.translate(key, ctx.locale.toString())
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
    formal: {
      type: 'boolean',
      short: 'f'
    }
  },

  // Use the translation adapter
  translation: createTranslationAdapter(myI18nSystem),

  run: ctx => {
    const { name = 'World', formal } = ctx.values

    // Use the translation function
    const greeting = formal
      ? ctx.translation('formal_greeting')
      : ctx.translation('informal_greeting')

    console.log(`${greeting}, ${name}!`)
  }
}

// Run the command
cli(process.argv.slice(2), command, {
  name: 'i18n-example',
  version: '1.0.0',
  locale: new Intl.Locale(process.env.MY_LOCALE || 'en-US')
})
```

## Integrating with Popular i18n Libraries

### i18next

[i18next](https://www.i18next.com/) is a popular internationalization framework for JavaScript. Here's how to integrate it with Gunshi:

```js
import { cli } from 'gunshi'
import i18next from 'i18next'
import Backend from 'i18next-fs-backend'

// Initialize i18next
i18next.use(Backend).init({
  lng: 'en',
  fallbackLng: 'en',
  ns: ['translation'],
  defaultNS: 'translation',
  backend: {
    loadPath: './locales/{{lng}}/{{ns}}.json'
  }
})

// Create an i18next adapter
function createI18nextAdapter() {
  return async ctx => {
    // Change the language based on the context locale
    await i18next.changeLanguage(ctx.locale.toString())

    // Return a function that translates keys using i18next
    return (key, options) => {
      return i18next.t(key, options)
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
    formal: {
      type: 'boolean',
      short: 'f'
    }
  },

  // Use the i18next adapter
  translation: createI18nextAdapter(),

  run: ctx => {
    const { name = 'World', formal } = ctx.values

    // Use the translation function with i18next features
    const greeting = ctx.translation(formal ? 'formal_greeting' : 'informal_greeting')

    // You can also use i18next's interpolation
    const message = ctx.translation('greeting_message', { name, greeting })

    console.log(message)
  }
}

// Run the command
cli(process.argv.slice(2), command, {
  name: 'i18next-example',
  version: '1.0.0',
  locale: new Intl.Locale(process.env.MY_LOCALE || 'en-US')
})
```

Example i18next locale files:

`locales/en/translation.json`:

```json
{
  "description": "Greeting application",
  "options": {
    "name": "Name to greet",
    "formal": "Use formal greeting"
  },
  "informal_greeting": "Hello",
  "formal_greeting": "Good day",
  "greeting_message": "{{greeting}}, {{name}}!"
}
```

`locales/ja/translation.json`:

```json
{
  "description": "挨拶アプリケーション",
  "options": {
    "name": "挨拶する相手の名前",
    "formal": "丁寧な挨拶を使用する"
  },
  "informal_greeting": "こんにちは",
  "formal_greeting": "はじめまして",
  "greeting_message": "{{greeting}}、{{name}}さん！"
}
```

### vue-i18n

If you're using Vue.js with [vue-i18n](https://vue-i18n.intlify.dev/), you can integrate it with Gunshi:

```js
import { cli } from 'gunshi'
import { createI18n } from 'vue-i18n'

// Create vue-i18n instance
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: {
      description: 'Greeting application',
      options: {
        name: 'Name to greet',
        formal: 'Use formal greeting'
      },
      informal_greeting: 'Hello',
      formal_greeting: 'Good day',
      greeting_message: '{greeting}, {name}!'
    },
    ja: {
      description: '挨拶アプリケーション',
      options: {
        name: '挨拶する相手の名前',
        formal: '丁寧な挨拶を使用する'
      },
      informal_greeting: 'こんにちは',
      formal_greeting: 'はじめまして',
      greeting_message: '{greeting}、{name}さん！'
    }
  }
})

// Create a vue-i18n adapter
function createVueI18nAdapter() {
  return async ctx => {
    // Set the locale based on the context locale
    i18n.global.locale.value = ctx.locale.toString()

    // Return a function that translates keys using vue-i18n
    return (key, options) => {
      return i18n.global.t(key, options)
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
    formal: {
      type: 'boolean',
      short: 'f'
    }
  },

  // Use the vue-i18n adapter
  translation: createVueI18nAdapter(),

  run: ctx => {
    const { name = 'World', formal } = ctx.values

    // Use the translation function with vue-i18n features
    const greeting = ctx.translation(formal ? 'formal_greeting' : 'informal_greeting')

    // You can also use vue-i18n's named interpolation
    const message = ctx.translation('greeting_message', { name, greeting })

    console.log(message)
  }
}

// Run the command
cli(process.argv.slice(2), command, {
  name: 'vue-i18n-example',
  version: '1.0.0',
  locale: new Intl.Locale(process.env.MY_LOCALE || 'en-US')
})
```

## Advanced Translation Adapter

For more complex scenarios, you can create an advanced translation adapter that handles nested keys, pluralization, and other features:

```js
import { cli } from 'gunshi'

// Create an advanced translation adapter
function createAdvancedAdapter(i18nSystem) {
  return async ctx => {
    // Initialize the i18n system with the current locale
    await i18nSystem.init(ctx.locale.toString())

    // Return a function that translates keys with advanced features
    return (key, options = {}) => {
      // Handle nested keys (e.g., 'options.name')
      if (key.includes('.')) {
        const keys = key.split('.')
        let value = i18nSystem.translations

        for (const k of keys) {
          if (value && typeof value === 'object' && k in value) {
            value = value[k]
          } else {
            return key
          }
        }

        return typeof value === 'string' ? value : key
      }

      // Handle pluralization
      if ('count' in options) {
        return i18nSystem.plural(key, options.count, options)
      }

      // Handle simple translation
      return i18nSystem.translate(key, options)
    }
  }
}

// Example i18n system
const myI18nSystem = {
  translations: {},

  async init(locale) {
    // Load translations for the specified locale
    try {
      this.translations = await import(`./locales/${locale}.json`)
    } catch (error) {
      console.error(`Failed to load translations for ${locale}:`, error)
      // Fall back to English
      this.translations = await import('./locales/en-US.json')
    }
  },

  translate(key, options = {}) {
    const translation = this.translations[key]

    if (!translation) {
      return key
    }

    // Handle interpolation
    if (typeof translation === 'string' && Object.keys(options).length > 0) {
      return translation.replaceAll(/\{\{(\w+)\}\}/g, (_, name) => {
        return options[name] === undefined ? `{{${name}}}` : options[name]
      })
    }

    return translation
  },

  plural(key, count, options = {}) {
    const pluralForms = this.translations[`${key}_plural`]

    if (!pluralForms) {
      return this.translate(key, options)
    }

    // Simple English-style pluralization for demonstration
    const form = count === 1 ? key : `${key}_plural`
    return this.translate(form, { ...options, count })
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

  // Use the advanced adapter
  translation: createAdvancedAdapter(myI18nSystem),

  run: ctx => {
    const { name = 'World', count } = ctx.values

    // Use nested key translation
    const nameLabel = ctx.translation('options.name')

    // Use pluralization
    const message = ctx.translation('greeting', { name, count })

    console.log(`${nameLabel}: ${name}`)
    console.log(message)
  }
}

// Run the command
cli(process.argv.slice(2), command, {
  name: 'advanced-i18n-example',
  version: '1.0.0',
  locale: new Intl.Locale(process.env.MY_LOCALE || 'en-US')
})
```

Example locale files for the advanced adapter:

`locales/en-US.json`:

```json
{
  "description": "Greeting application",
  "options": {
    "name": "Name to greet",
    "count": "Number of greetings"
  },
  "greeting": "Hello, {{name}}!",
  "greeting_plural": "Hello, {{name}}! ({{count}} times)"
}
```

`locales/ja-JP.json`:

```json
{
  "description": "挨拶アプリケーション",
  "options": {
    "name": "挨拶する相手の名前",
    "count": "挨拶の回数"
  },
  "greeting": "こんにちは、{{name}}さん！",
  "greeting_plural": "こんにちは、{{name}}さん！({{count}}回)"
}
```

## Sharing Translation Adapters

You can create reusable translation adapters and share them across your projects:

```js
// translation-adapters.js
export function createI18nextAdapter(i18next) {
  return async ctx => {
    await i18next.changeLanguage(ctx.locale.toString())
    return (key, options) => i18next.t(key, options)
  }
}

export function createVueI18nAdapter(i18n) {
  return async ctx => {
    i18n.global.locale.value = ctx.locale.toString()
    return (key, options) => i18n.global.t(key, options)
  }
}

// Other adapters...
```

Then use them in your commands:

```js
import { cli } from 'gunshi'
import i18next from 'i18next'
import { createI18nextAdapter } from './translation-adapters.js'

// Initialize i18next
i18next.init({
  lng: 'en',
  resources: {
    en: {
      translation: {
        /* translations */
      }
    },
    ja: {
      translation: {
        /* translations */
      }
    }
  }
})

// Define your command
const command = {
  name: 'greeter',
  // Use the shared adapter
  translation: createI18nextAdapter(i18next)
  // Command implementation...
}

// Run the command
cli(process.argv.slice(2), command, {
  locale: new Intl.Locale(process.env.MY_LOCALE || 'en-US')
})
```

## Complete Example

Here's a complete example of a CLI with a translation adapter for i18next:

```js
import { cli } from 'gunshi'
import i18next from 'i18next'
import Backend from 'i18next-fs-backend'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Initialize i18next
await i18next.use(Backend).init({
  lng: 'en',
  fallbackLng: 'en',
  ns: ['translation'],
  defaultNS: 'translation',
  backend: {
    loadPath: path.join(__dirname, 'locales/{{lng}}/{{ns}}.json')
  }
})

// Create an i18next adapter
function createI18nextAdapter() {
  return async ctx => {
    // Change the language based on the context locale
    await i18next.changeLanguage(ctx.locale.toString())

    // Return a function that translates keys using i18next
    return (key, options) => {
      return i18next.t(key, options)
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
    formal: {
      type: 'boolean',
      short: 'f'
    },
    count: {
      type: 'number',
      short: 'c',
      default: 1
    }
  },

  // Use the i18next adapter
  translation: createI18nextAdapter(),

  run: ctx => {
    const { name = 'World', formal, count } = ctx.values

    // Get the current locale
    const locale = ctx.locale.toString()
    console.log(`Current locale: ${locale}`)

    // Use i18next's translation features
    const greeting = ctx.translation(formal ? 'formal_greeting' : 'informal_greeting')

    // Use i18next's pluralization
    const message = ctx.translation('greeting', {
      name,
      greeting,
      count
    })

    console.log(message)

    // Show translation information
    console.log('\nTranslation Information:')
    console.log(`Command Description: ${ctx.translation('description')}`)
    console.log(`Name Option: ${ctx.translation('options.name')}`)
    console.log(`Formal Option: ${ctx.translation('options.formal')}`)
    console.log(`Count Option: ${ctx.translation('options.count')}`)
  }
}

// Run the command
cli(process.argv.slice(2), command, {
  name: 'i18next-example',
  version: '1.0.0',
  description: ctx => ctx.translation('description'),
  locale: new Intl.Locale(process.env.MY_LOCALE || 'en-US')
})
```

Example i18next locale files:

`locales/en/translation.json`:

```json
{
  "description": "Greeting application with i18next integration",
  "options": {
    "name": "Name to greet",
    "formal": "Use formal greeting",
    "count": "Number of greetings"
  },
  "informal_greeting": "Hello",
  "formal_greeting": "Good day",
  "greeting": "{{greeting}}, {{name}}!",
  "greeting_plural": "{{greeting}}, {{name}}! ({{count}} times)"
}
```

`locales/ja/translation.json`:

```json
{
  "description": "i18next統合の挨拶アプリケーション",
  "options": {
    "name": "挨拶する相手の名前",
    "formal": "丁寧な挨拶を使用する",
    "count": "挨拶の回数"
  },
  "informal_greeting": "こんにちは",
  "formal_greeting": "はじめまして",
  "greeting": "{{greeting}}、{{name}}さん！",
  "greeting_plural": "{{greeting}}、{{name}}さん！({{count}}回)"
}
```

## Next Steps

Now that you understand how to create translation adapters for Gunshi, you can:

- [Customize usage generation](/guide/advanced/custom-usage-generation) for more control over help messages
- [Generate documentation](/guide/advanced/documentation-generation) for your CLI in multiple languages
- Explore other i18n libraries and create adapters for them
