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
        'Option:name': '挨拶する相手の名前',
        'Option:formal': '丁寧な挨拶を使用する',
        informal_greeting: 'こんにちは',
        formal_greeting: 'はじめまして'
      }
    }

    // Default to English
    return {
      description: 'Greeting application',
      'Option:name': 'Name to greet',
      'Option:formal': 'Use formal greeting',
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
await cli(process.argv.slice(2), command, {
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
# こんにちは, 田中!
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

await cli(process.argv.slice(2), command, {
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
  "Option:name": "Name to greet",
  "Option:formal": "Use formal greeting",
  "informal_greeting": "Hello",
  "formal_greeting": "Good day"
}
```

`locales/ja-JP.json`:

```json
{
  "description": "挨拶アプリケーション",
  "Option:name": "挨拶する相手の名前",
  "Option:formal": "丁寧な挨拶を使用する",
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

```sh
USAGE:
  COMMAND <OPTIONS>

OPTIONS:
  -n, --name <name>      Name to greet
  -f, --formal           Use formal greeting
  -h, --help             Display this help message
  -v, --version          Display this version
```

Japanese:

```sh
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
await cli(process.argv.slice(2), command, {
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

## Resource Key Naming Conventions

When defining your localization resources (either directly in the `resource` function or in separate files), there are specific naming conventions to follow for the keys:

- **Command Description**: Use the key `description` for the main description of the command.
- **Examples**: Use the key `examples` for usage examples.
- **Option Descriptions**: Keys for the descriptions of command options **must** be prefixed with `Option:`. For example, if you have an option named `target`, its description key must be `Option:target`.
  - **Negatable Option Descriptions**: For boolean options (e.g., `--verbose`), Gunshi automatically generates a description for the negatable version (e.g., `--no-verbose`) using the built-in `NEGATABLE` key (e.g., "Negatable of --verbose"). To provide a custom translation for a specific negatable option, use the pattern `Option:no-<optionName>`, for example, `Option:no-verbose`.
- **Custom Keys**: Any other keys you define for custom translation messages (like greetings, error messages, etc.) do not require a prefix and can be named freely (e.g., `informal_greeting`, `error_file_not_found`).
- **Built-in Keys**: Keys for built-in functionalities like `help`, `version`, `USAGE`, `OPTIONS`, `EXAMPLES`, `FORMORE`, and the new `NEGATABLE` key are handled by Gunshi's default locales (found in `src/locales`). You can override these by defining them in your resource file (e.g., providing your own translation for `NEGATABLE`).

Here's an example illustrating the convention:

```ts
import { define } from 'gunshi'

const command = define({
  name: 'my-command',
  options: {
    target: { type: 'string' },
    verbose: { type: 'boolean' }
  },
  resource: async ctx => {
    // Example for 'en-US' locale
    return {
      description: 'This is my command.', // No prefix
      examples: '$ my-command --target file.txt', // No prefix
      'Option:target': 'The target file to process.', // 'Option:' prefix
      'Option:verbose': 'Enable verbose output.', // 'Option:' prefix
      'Option:no-verbose': 'Disable verbose logging specifically.', // Optional custom translation for the negatable option
      processing_message: 'Processing target...' // No prefix
    }
  },
  run: ctx => {
    /* ... */
  }
})
```

Adhering to these conventions ensures that Gunshi correctly identifies and uses your translations for descriptions, help messages, and within your command's logic via `ctx.translate()`.

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!IMPORTANT]
> The resource object returned by the `resource` function (or loaded from external files like JSON) **must** be a flat key-value structure. Nested objects are not supported for translations using `ctx.translate()`. Keep your translation keys simple and at the top level.

<!-- eslint-enable markdown/no-missing-label-refs -->

Good Flat structure:

```json
{
  "greeting": "Hello",
  "farewell": "Goodbye"
}
```

Bad Nested structure (won't work with `ctx.translate('messages.greeting')`:

```json
{
  "messages": {
    "greeting": "Hello",
    "farewell": "Goodbye"
  }
}
```

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
await cli(process.argv.slice(2), mainCommand, {
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

  // Define examples
  examples:
    '# Basic greeting\n$ node index.js --name John\n\n# Formal greeting in Japanese\n$ MY_LOCALE=ja-JP node index.js --name 田中 --formal',

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
    console.log(`Name Option: ${ctx.translate('Option:name')}`)
    console.log(`Formal Option: ${ctx.translate('Option:formal')}`)
  }
}

// Run the command with i18n support
await cli(process.argv.slice(2), command, {
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
  "Option:name": "Name to greet",
  "Option:formal": "Use formal greeting",
  "informal_greeting": "Hello",
  "formal_greeting": "Good day"
}
```

`locales/ja-JP.json`:

```json
{
  "description": "挨拶アプリケーション",
  "Option:name": "挨拶する相手の名前",
  "Option:formal": "丁寧な挨拶を使用する",
  "informal_greeting": "こんにちは",
  "formal_greeting": "はじめまして"
}
```
