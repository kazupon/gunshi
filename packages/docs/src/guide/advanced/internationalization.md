# Internationalization

Gunshi provides comprehensive internationalization (i18n) support through the official `@gunshi/plugin-i18n` plugin, allowing you to create command-line interfaces that can be used in multiple languages.

## Why Use Internationalization?

Internationalization offers several benefits:

- **Broader audience**: Make your CLI accessible to users who speak different languages
- **Better user experience**: Users can interact with your CLI in their preferred language
- **Consistency**: Maintain a consistent approach to translations across your application
- **Type safety**: Full TypeScript support for translation keys and interpolation

## Getting Started with i18n Plugin

First, install the i18n plugin and optional resource packages:

```bash
npm install @gunshi/plugin-i18n @gunshi/resources
```

## Basic Internationalization

Here's how to implement basic internationalization using the i18n plugin:

```js
import { cli } from 'gunshi'
import i18n, { pluginId as i18nId, resolveKey, defineI18n } from '@gunshi/plugin-i18n'

// Define a command with i18n support
const command = defineI18n({
  name: 'greeter',
  args: {
    name: {
      type: 'string',
      short: 'n',
      description: 'Name to greet'
    },
    formal: {
      type: 'boolean',
      short: 'f',
      description: 'Use formal greeting'
    }
  },

  // Define translation resources for the command
  resource: async ctx => {
    const locale = ctx.extensions[i18nId].locale.toString()

    if (locale === 'ja-JP') {
      return {
        description: '挨拶アプリケーション',
        'arg:name': '挨拶する相手の名前',
        'arg:formal': '丁寧な挨拶を使用する',
        informal_greeting: 'こんにちは',
        formal_greeting: 'はじめまして'
      }
    }

    // Default to English
    return {
      description: 'Greeting application',
      'arg:name': 'Name to greet',
      'arg:formal': 'Use formal greeting',
      informal_greeting: 'Hello',
      formal_greeting: 'Good day'
    }
  },

  // Command execution function
  run: ctx => {
    const { name = 'World', formal } = ctx.values
    const t = ctx.extensions[i18nId].translate

    // Use resolveKey for custom keys with proper namespacing
    const greetingKey = formal
      ? resolveKey('formal_greeting', ctx.name)
      : resolveKey('informal_greeting', ctx.name)

    const greeting = t(greetingKey)
    console.log(`${greeting}, ${name}!`)

    // Show translation information
    const locale = ctx.extensions[i18nId].locale
    console.log(`\nCurrent locale: ${locale}`)

    // Use resolveKey for description as well
    const descKey = resolveKey('description', ctx.name)
    console.log(`Command Description: ${t(descKey)}`)
  }
})

// Run the command with i18n plugin
await cli(process.argv.slice(2), command, {
  name: 'i18n-example',
  version: '1.0.0',
  plugins: [
    i18n({
      // Set locale from environment or default to en-US
      locale: process.env.LANG || 'en-US'
    })
  ]
})
```

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!TIP]
> **About the helper functions used in this example:**
>
> - `defineI18n`: A type-safe helper for creating commands with i18n support. It ensures proper TypeScript inference for translation keys. [Learn more](#definei18n)
> - `resolveKey`: A utility that handles namespace resolution for custom translation keys in commands and subcommands. Always use this for custom keys to ensure proper namespacing. [Learn more](#resolvekey)

<!-- eslint-enable markdown/no-missing-label-refs -->

To run this example with different locales:

```sh
# English (default)
node index.js --name John

# i18n-example (i18n-example v1.0.0)
#
# Hello, John!
#
# Current locale: en-US
# Command Description: Greeting application

# Japanese
LANG=ja-JP node index.js --name 田中 --formal

# i18n-example (i18n-example v1.0.0)
#
# はじめまして, 田中!
#
# Current locale: ja-JP
# Command Description: 挨拶アプリケーション
```

## Using Built-in Resources

The `@gunshi/resources` package provides pre-translated resources for common CLI terms:

```js
import { cli } from 'gunshi'
import i18n from '@gunshi/plugin-i18n'
import enUS from '@gunshi/resources/en-US.json' with { type: 'json' }
import jaJP from '@gunshi/resources/ja-JP.json' with { type: 'json' }

const command = {
  name: 'app',
  run: ctx => {
    console.log('Application running')
  }
}

await cli(process.argv.slice(2), command, {
  name: 'my-app',
  version: '1.0.0',
  plugins: [
    i18n({
      locale: 'en-US',
      // Provide built-in translations for common terms
      builtinResources: {
        'en-US': enUS,
        'ja-JP': jaJP
      }
    })
  ]
})

// This automatically translates built-in messages like:
// - USAGE, OPTIONS, COMMANDS
// - Help and version descriptions
// - Error messages
```

## Loading Translations from Files

For better organization, load translations from separate files:

```js
import { cli } from 'gunshi'
import i18n, { pluginId as i18nId, resolveKey, defineI18n } from '@gunshi/plugin-i18n'

const command = defineI18n({
  name: 'greeter',
  args: {
    name: { type: 'string', short: 'n' },
    formal: { type: 'boolean', short: 'f' }
  },

  // Load translations from files
  resource: async ctx => {
    const locale = ctx.extensions[i18nId].locale.toString()

    if (locale === 'ja-JP') {
      // Dynamic import for lazy loading
      const resource = await import('./locales/ja-JP.json', {
        with: { type: 'json' }
      })
      return resource.default
    }

    // Default to English
    const enUS = await import('./locales/en-US.json', {
      with: { type: 'json' }
    })
    return enUS.default
  },

  run: ctx => {
    const { name = 'World', formal } = ctx.values
    const t = ctx.extensions[i18nId].translate

    // Always use resolveKey for custom keys
    const greetingKey = formal
      ? resolveKey('formal_greeting', ctx)
      : resolveKey('informal_greeting', ctx)

    const greeting = t(greetingKey)
    console.log(`${greeting}, ${name}!`)
  }
})

await cli(process.argv.slice(2), command, {
  name: 'i18n-example',
  version: '1.0.0',
  plugins: [
    i18n({
      locale: process.env.LANG || 'en-US'
    })
  ]
})
```

Example locale files:

`locales/en-US.json`:

```json
{
  "description": "Greeting application",
  "arg:name": "Name to greet",
  "arg:formal": "Use formal greeting",
  "informal_greeting": "Hello",
  "formal_greeting": "Good day"
}
```

`locales/ja-JP.json`:

```json
{
  "description": "挨拶アプリケーション",
  "arg:name": "挨拶する相手の名前",
  "arg:formal": "丁寧な挨拶を使用する",
  "informal_greeting": "こんにちは",
  "formal_greeting": "はじめまして"
}
```

## Translation with Interpolation

The i18n plugin supports message interpolation for dynamic content:

```js
import i18n, { pluginId as i18nId, resolveKey, defineI18n } from '@gunshi/plugin-i18n'

const command = defineI18n({
  name: 'deploy',
  resource: async ctx => ({
    deploying: 'Deploying {$app} to {$environment}...',
    success: 'Successfully deployed {$app} to {$environment}!',
    error: 'Failed to deploy: {$message}'
  }),
  args: {
    app: { type: 'string', required: true },
    environment: { type: 'string', required: true }
  },
  run: ctx => {
    const t = ctx.extensions[i18nId].translate
    const { app, environment } = ctx.values

    // Use resolveKey for all custom keys
    const deployingKey = resolveKey('deploying', ctx)
    const successKey = resolveKey('success', ctx)
    const errorKey = resolveKey('error', ctx)

    console.log(t(deployingKey, { app, environment }))

    try {
      // Deployment logic
      console.log(t(successKey, { app, environment }))
    } catch (error) {
      console.error(t(errorKey, { message: error.message }))
    }
  }
})
```

Note: Interpolation placeholders use the format `{$variableName}` in the i18n plugin.

## Internationalization with Sub-commands

When working with sub-commands, each command has its own namespace for translations:

```js
import { cli } from 'gunshi'
import i18n, { pluginId as i18nId, resolveKey, defineI18n } from '@gunshi/plugin-i18n'
import enUS from '@gunshi/resources/en-US.json' with { type: 'json' }
import jaJP from '@gunshi/resources/ja-JP.json' with { type: 'json' }

// Sub-command with its own translations
const createCommand = defineI18n({
  name: 'create',
  args: {
    name: { type: 'string', required: true }
  },
  resource: async ctx => {
    const locale = ctx.extensions[i18nId].locale.toString()

    return locale === 'ja-JP'
      ? {
          description: 'リソースを作成',
          'arg:name': 'リソース名',
          creating: '作成中: {$name}',
          success: '作成完了！'
        }
      : {
          description: 'Create a resource',
          'arg:name': 'Resource name',
          creating: 'Creating: {$name}',
          success: 'Created successfully!'
        }
  },
  run: ctx => {
    const t = ctx.extensions[i18nId].translate
    const { name } = ctx.values

    // For custom keys in subcommands, always use resolveKey helper
    const creatingKey = resolveKey('creating', ctx)
    const successKey = resolveKey('success', ctx)

    console.log(t(creatingKey, { name }))
    console.log(t(successKey))
  }
})

// Main command
const mainCommand = defineI18n({
  name: 'resource-manager',
  resource: async ctx => ({
    description: 'Resource management tool',
    usage_hint: 'Use a sub-command to manage resources'
  }),
  run: ctx => {
    const t = ctx.extensions[i18nId].translate

    // Use resolveKey for main command's custom keys too
    const hintKey = resolveKey('usage_hint', ctx)
    console.log(t(hintKey))
  }
})

// Run with i18n plugin
await cli(process.argv.slice(2), mainCommand, {
  name: 'resource-cli',
  version: '1.0.0',
  subCommands: {
    create: createCommand
  },
  plugins: [
    i18n({
      locale: process.env.LANG || 'en-US',
      builtinResources: {
        'en-US': enUS,
        'ja-JP': jaJP
      }
    })
  ]
})
```

## Helper Functions

The i18n plugin provides helpful utilities for working with translations:

### defineI18n

Create type-safe commands with i18n support:

```js
import { defineI18n, resolveKey } from '@gunshi/plugin-i18n'

const command = defineI18n({
  name: 'app',
  resource: async ctx => ({
    welcome: 'Welcome to the app!'
  }),
  run: ctx => {
    // TypeScript knows about available translation keys
    const welcomeKey = resolveKey('welcome', ctx)
    console.log(ctx.extensions['g:i18n'].translate(welcomeKey))
  }
})
```

### withI18nResource

Add i18n resources to existing commands:

```js
import { withI18nResource, resolveKey, pluginId as i18nId } from '@gunshi/plugin-i18n'

const existingCommand = {
  name: 'app',
  run: ctx => {
    const t = ctx.extensions[i18nId]?.translate
    if (t) {
      const messageKey = resolveKey('message', ctx)
      console.log(t(messageKey))
    }
  }
}

const i18nCommand = withI18nResource(existingCommand, {
  resource: async ctx => ({
    message: 'Hello from i18n!'
  })
})
```

### resolveKey

The `resolveKey` helper ensures proper namespace handling for custom translation keys:

```js
import { resolveKey } from '@gunshi/plugin-i18n'

// For a command named 'build'
const key = resolveKey('starting', ctx)
// Returns: 'build:starting'

// In subcommands, it creates proper namespacing
const subKey = resolveKey('message', ctx)
// Returns: 'create:message'
```

## Resource Key Naming Conventions

When defining translation resources, follow these conventions:

- **Command Description**: Use the key `description`
- **Examples**: Use the key `examples`
- **Argument Descriptions**: Prefix with `arg:` (e.g., `arg:name`)
- **Negatable Arguments**: Use `arg:no-<option>` for custom negation descriptions
- **Built-in Keys**: Keys like `_:USAGE`, `_:OPTIONS` are handled by built-in resources
- **Custom Keys**: Free naming for your application-specific messages, but always use `resolveKey()` when accessing them

Example:

```js
{
  // Command metadata (accessed with resolveKey)
  "description": "File processor",
  "examples": "$ process --input file.txt",

  // Argument descriptions (must use arg: prefix)
  "arg:input": "Input file path",
  "arg:verbose": "Enable verbose output",
  "arg:no-verbose": "Disable verbose output",

  // Custom application messages (accessed with resolveKey)
  "processing": "Processing file...",
  "complete": "Processing complete!",
  "error_not_found": "File not found: {$path}"
}
```

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!IMPORTANT]
> The resource object returned by the `resource` function (or loaded from external files like JSON) **must** be a flat key-value structure. Nested objects are not supported for translations using `translate()`. Keep your translation keys simple and at the top level.

<!-- eslint-enable markdown/no-missing-label-refs -->

Good Flat structure:

```json
{
  "greeting": "Hello",
  "farewell": "Goodbye"
}
```

Bad Nested structure (won't work with `translate('messages.greeting')`:

```json
{
  "messages": {
    "greeting": "Hello",
    "farewell": "Goodbye"
  }
}
```

## Detecting User Locale

The i18n plugin can automatically detect the user's locale:

```js
import i18n from '@gunshi/plugin-i18n'

// Use various detection methods
await cli(process.argv.slice(2), command, {
  plugins: [
    i18n({
      // From environment variable
      locale: process.env.LANG || 'en-US',

      // Or using Intl.Locale for advanced locale handling
      locale: new Intl.Locale(process.env.LANG || 'en-US')
    })
  ]
})

// For Node.js v21+, use navigator.language
const locale = typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'en-US'
```

## Custom Translation Adapters

For advanced scenarios, create custom translation adapters by implementing the TranslationAdapter interface:

```js
import i18n from '@gunshi/plugin-i18n'

// Custom translation adapter implementation
class CustomTranslationAdapter {
  constructor(options) {
    this.locale = options.locale
    this.fallbackLocale = options.fallbackLocale
    this.resources = new Map()
  }

  // Get resource for a locale
  getResource(locale) {
    return this.resources.get(locale)
  }

  // Set resource for a locale
  setResource(locale, resource) {
    this.resources.set(locale, resource)
  }

  // Get a specific message
  getMessage(locale, key) {
    const resource = this.getResource(locale)
    return resource?.[key]
  }

  // Translate with custom logic
  translate(locale, key, values = {}) {
    let message = this.getMessage(locale, key)

    // Fallback logic
    if (!message && locale !== this.fallbackLocale) {
      message = this.getMessage(this.fallbackLocale, key)
    }

    if (!message) return undefined

    // Custom interpolation logic (e.g., different placeholder format)
    return message.replace(/{(\w+)}/g, (_, name) => {
      return values[name]?.toString() || ''
    })
  }
}

// Use the custom adapter
await cli(process.argv.slice(2), command, {
  plugins: [
    i18n({
      locale: 'en-US',
      translationAdapterFactory: options => new CustomTranslationAdapter(options)
    })
  ]
})
```

## Complete Example

Here's a comprehensive example combining multiple i18n features:

```js
import { cli } from 'gunshi'
import i18n, { pluginId as i18nId, defineI18n, resolveKey } from '@gunshi/plugin-i18n'
import enUS from '@gunshi/resources/en-US.json' with { type: 'json' }
import jaJP from '@gunshi/resources/ja-JP.json' with { type: 'json' }

// Use defineI18n for type-safe command definition
const command = defineI18n({
  name: 'task-manager',
  args: {
    action: {
      type: 'string',
      required: true,
      description: 'Action to perform'
    },
    target: {
      type: 'string',
      description: 'Target resource'
    },
    verbose: {
      type: 'boolean',
      short: 'v',
      description: 'Verbose output'
    }
  },

  resource: async ctx => {
    const locale = ctx.extensions[i18nId].locale.toString()

    if (locale === 'ja-JP') {
      return {
        description: 'タスク管理ツール',
        'arg:action': '実行するアクション',
        'arg:target': 'ターゲットリソース',
        'arg:verbose': '詳細出力',
        processing: '{$action}を実行中: {$target}',
        success: '完了しました！',
        error: 'エラー: {$message}'
      }
    }

    return {
      description: 'Task management tool',
      'arg:action': 'Action to perform',
      'arg:target': 'Target resource',
      'arg:verbose': 'Verbose output',
      processing: 'Processing {$action}: {$target}',
      success: 'Completed successfully!',
      error: 'Error: {$message}'
    }
  },

  run: ctx => {
    const t = ctx.extensions[i18nId].translate
    const { action, target, verbose } = ctx.values

    if (verbose) {
      const locale = ctx.extensions[i18nId].locale
      console.log(`Locale: ${locale}`)
    }

    // Always use resolveKey for custom keys
    const processingKey = resolveKey('processing', ctx)
    const successKey = resolveKey('success', ctx)
    const errorKey = resolveKey('error', ctx)

    console.log(t(processingKey, { action, target: target || 'default' }))

    try {
      // Perform action
      console.log(t(successKey))
    } catch (error) {
      console.error(t(errorKey, { message: error.message }))
    }
  }
})

// Run with i18n plugin
await cli(process.argv.slice(2), command, {
  name: 'task-cli',
  version: '2.0.0',
  plugins: [
    i18n({
      locale: process.env.LANG || 'en-US',
      builtinResources: {
        'en-US': enUS,
        'ja-JP': jaJP
      }
    })
  ]
})
```

## Translating Help Messages

The i18n plugin automatically uses your translations for help messages. When users run `--help` with different locales, they'll see help messages in their language:

English:

```sh
USAGE:
  COMMAND <OPTIONS>

OPTIONS:
  -n, --name <name>      Name to greet
  -f, --formal           Use formal greeting
  -h, --help             Display this help message
  -v, --version          Display version
```

Japanese (with proper locale):

```sh
使用法:
  COMMAND <オプション>

オプション:
  -n, --name <name>     挨拶する相手の名前
  -f, --formal          丁寧な挨拶を使用する
  -h, --help            このヘルプメッセージを表示
  -v, --version         バージョンを表示
```

## Important Notes on Custom Keys

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!IMPORTANT]
> **Always use `resolveKey()` for custom translation keys!** This ensures proper namespace handling, especially in sub-commands. Without `resolveKey()`, your translations may not be found.

<!-- eslint-enable markdown/no-missing-label-refs -->

```js
// ❌ Wrong - Don't access custom keys directly
const message = t('welcome')

// ✅ Correct - Always use resolveKey for custom keys
const welcomeKey = resolveKey('welcome', ctx)
const message = t(welcomeKey)
```

## Migration from v0.26

If you're migrating from Gunshi v0.26 where i18n was built into the CLI options, see the [v0.27 Release Notes](/gunshi-v027-release-notes#internationalization-migration) for detailed migration instructions.
