# Internationalization

Gunshi provides built-in internationalization (i18n) support, allowing you to create command-line interfaces that can be used in multiple languages. This feature is particularly useful for global applications or projects that need to support users from different regions.

## Why Use Internationalization?

Internationalization offers several benefits:

- **Broader audience**: Make your CLI accessible to users who speak different languages
- **Better user experience**: Users can interact with your CLI in their preferred language
- **Consistency**: Maintain a consistent approach to translations across your application

## Basic Internationalization

Here's how to implement basic internationalization in Gunshi:

```js
import { cli } from 'gunshi'

// Define a command with i18n support
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

  // Define a resource fetcher for translations
  resource: async ctx => {
    // Check the locale and return appropriate translations
    if (ctx.locale.toString() === 'ja-JP') {
      return {
        description: '挨拶アプリケーション',
        name: '挨拶する相手の名前',
        formal: '丁寧な挨拶を使用する',
        informal_greeting: 'こんにちは',
        formal_greeting: 'はじめまして'
      }
    }

    // Default to English
    return {
      description: 'Greeting application',
      name: 'Name to greet',
      formal: 'Use formal greeting',
      informal_greeting: 'Hello',
      formal_greeting: 'Good day'
    }
  },

  // Command execution function
  run: ctx => {
    const { name = 'World', formal } = ctx.values

    // Use translated greeting based on the formal option
    const greeting = formal ? ctx.translate('formal_greeting') : ctx.translate('informal_greeting')

    console.log(`${greeting}, ${name}!`)

    // Show translation information
    console.log('\nTranslation Information:')
    console.log(`Current locale: ${ctx.locale}`)
    console.log(`Command Description: ${ctx.translate('description')}`)
  }
}

// Run the command with i18n support
cli(process.argv.slice(2), command, {
  name: 'i18n-example',
  version: '1.0.0',
  // Set the locale via an environment variable
  locale: new Intl.Locale(process.env.MY_LOCALE || 'en-US')
})
```

To run this example with different locales:

```sh
# English (default)
node index.js --name John

# i18n-example (i18n-example v1.0.0)
#
# Hello, John!
#
# Translation Information:
# Current locale: en-US
# Command Description: Greeting application

# Japanese
MY_LOCALE=ja-JP node index.js --name 田中 --formal

# i18n-example (i18n-example v1.0.0)
#
# こんにちは, John!
#
# Translation Information:
# Current locale: ja-JP
# Command Description: 挨拶アプリケーション
```

## Translations with loading resources

For better organization, you can load translations from separate JSON files:

```js
import { cli } from 'gunshi'
import enUS from './locales/en-US.json' with { type: 'json' }

const command = {
  name: 'greeter',
  options: {
    name: { type: 'string', short: 'n' },
    formal: { type: 'boolean', short: 'f' }
  },

  // Resource fetcher for translations
  resource: async ctx => {
    if (ctx.locale.toString() === 'ja-JP') {
      // Dynamic import for lazy loading
      const resource = await import('./locales/ja-JP.json', { with: { type: 'json' } })
      return resource.default
    }

    // Default to English
    return enUS
  },

  run: ctx => {
    const { name = 'World', formal } = ctx.values
    const greeting = formal ? ctx.translate('formal_greeting') : ctx.translate('informal_greeting')
    console.log(`${greeting}, ${name}!`)
  }
}

cli(process.argv.slice(2), command, {
  name: 'i18n-example',
  version: '1.0.0',
  locale: new Intl.Locale(process.env.MY_LOCALE || 'en-US')
})
```

Example locale files:

`locales/en-US.json`:

```json
{
  "description": "Greeting application",
  "name": "Name to greet",
  "formal": "Use formal greeting",
  "informal_greeting": "Hello",
  "formal_greeting": "Good day"
}
```

`locales/ja-JP.json`:

```json
{
  "description": "挨拶アプリケーション",
  "name": "挨拶する相手の名前",
  "formal": "丁寧な挨拶を使用する",
  "informal_greeting": "こんにちは",
  "formal_greeting": "はじめまして"
}
```

## Translating Help Messages

Gunshi automatically uses your translations for help messages:

```js
const command = {
  name: 'greeter',
  options: {
    name: { type: 'string', short: 'n' },
    formal: { type: 'boolean', short: 'f' }
  },

  resource: async ctx => {
    // Return translations based on locale
    // ...
  },

  run: ctx => {
    // Command implementation
  }
}
```

When users run `node index.js --help` with different locales, they'll see help messages in their language:

English:

```
USAGE:
  COMMAND <OPTIONS>

OPTIONS:
  -n, --name <name>      Name to greet
  -f, --formal           Use formal greeting
  -h, --help             Display this help message
  -v, --version          Display this version
```

Japanese:

```
USAGE:
  COMMAND <OPTIONS>

OPTIONS:
  -n, --name <name>     挨拶する相手の名前
  -f, --formal          丁寧な挨拶を使用する
  -h, --help            このヘルプメッセージを表示
  -v, --version         このバージョンを表示"
```

## Detecting the User's Locale

In Node.js v21 or later, you can use the built-in `navigator.language` to detect the user's locale:

```js
cli(process.argv.slice(2), command, {
  name: 'i18n-example',
  version: '1.0.0',
  // Use the system locale if available, otherwise fall back to en-US
  locale:
    typeof navigator !== 'undefined' && navigator.language
      ? new Intl.Locale(navigator.language)
      : new Intl.Locale('en-US')
})
```

For earlier Node.js versions, you can use environment variables or configuration files to determine the locale.

## Resource structure and reserved resource keys

TODO:

## Internationalization with Sub-commands

You can apply internationalization to CLIs with sub-commands:

```js
import { cli } from 'gunshi'
import enUSForCreate from './locales/create/en-US.json' with { type: 'json' }
import enUSForMain from './locales/main/en-US.json' with { type: 'json' }

// Define sub-commands
const createCommand = {
  name: 'create',
  options: {
    name: { type: 'string', short: 'n' }
  },

  // Resource fetcher for the create command
  resource: async ctx => {
    if (ctx.locale.toString() === 'ja-JP') {
      const resource = await import('./locales/create/ja-JP.json', { with: { type: 'json' } })
      return resource.default
    }

    return enUSForCreate
  },

  run: ctx => {
    console.log(`Creating resource: ${ctx.values.name}`)
  }
}

// Define the main command
const mainCommand = {
  name: 'resource-manager',

  // Resource fetcher for the main command
  resource: async ctx => {
    if (ctx.locale.toString() === 'ja-JP') {
      const resource = await import('./locales/main/ja-JP.json', { with: { type: 'json' } })
      return resource.default
    }

    return enUSForMain
  },

  run: () => {
    console.log('Use a sub-command')
  }
}

// Create a Map of sub-commands
const subCommands = new Map()
subCommands.set('create', createCommand)

// Run the CLI with i18n support
cli(process.argv.slice(2), mainCommand, {
  name: 'i18n-example',
  version: '1.0.0',
  locale: new Intl.Locale(process.env.MY_LOCALE || 'en-US'),
  subCommands
})
```

## Complete Example

Here's a complete example of a CLI with internationalization:

```js
import { cli } from 'gunshi'
import enUS from './locales/en-US.json' with { type: 'json' }

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

  // Define a resource fetcher for translations
  resource: async ctx => {
    // Check the locale and return appropriate translations
    if (ctx.locale.toString() === 'ja-JP') {
      const resource = await import('./locales/ja-JP.json', { with: { type: 'json' } })
      return resource.default
    }

    // Default to English
    return enUS
  },

  // Define usage examples
  usage: {
    examples:
      '# Basic greeting\n$ node index.js --name John\n\n# Formal greeting in Japanese\n$ MY_LOCALE=ja-JP node index.js --name 田中 --formal'
  },

  // Command execution function
  run: ctx => {
    const { name = 'World', formal } = ctx.values
    const locale = ctx.locale.toString()

    console.log(`Current locale: ${locale}`)

    // Choose between formal and informal greeting
    const greeting = formal ? ctx.translate('formal_greeting') : ctx.translate('informal_greeting')

    // Display the greeting
    console.log(`${greeting}, ${name}!`)

    // Show translation information
    console.log('\nTranslation Information:')
    console.log(`Command Description: ${ctx.translate('description')}`)
    console.log(`Name Option: ${ctx.translate('name')}`)
    console.log(`Formal Option: ${ctx.translate('formal')}`)
  }
}

// Run the command with i18n support
cli(process.argv.slice(2), command, {
  name: 'i18n-example',
  version: '1.0.0',
  description: 'Example of internationalization support',
  // Set the locale via an environment variable
  locale: new Intl.Locale(process.env.MY_LOCALE || 'en-US')
})
```

With locale files:

`locales/en-US.json`:

```json
{
  "description": "Greeting application",
  "name": "Name to greet",
  "formal": "Use formal greeting",
  "informal_greeting": "Hello",
  "formal_greeting": "Good day"
}
```

`locales/ja-JP.json`:

```json
{
  "description": "挨拶アプリケーション",
  "name": "挨拶する相手の名前",
  "formal": "丁寧な挨拶を使用する",
  "informal_greeting": "こんにちは",
  "formal_greeting": "はじめまして"
}
```
