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

```sh
npm install @gunshi/plugin-i18n @gunshi/resources
```

## Basic Internationalization

Here's how to implement basic internationalization using the i18n plugin:

```ts [cli.ts]
import { cli } from 'gunshi'
import resources from '@gunshi/resources'
import i18n, { defineI18nWithTypes, pluginId as i18nId, resolveKey } from '@gunshi/plugin-i18n'

import type { I18nExtension } from '@gunshi/plugin-i18n'

// Define a command with i18n support
const command = defineI18nWithTypes<{ extensions: { [i18nId]: I18nExtension } }>()({
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
  resource: locale => {
    if (locale.toString() === 'ja-JP') {
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
      locale: process.env.MY_LANG || 'en-US',
      // Provide built-in translations for common terms.
      // See the support locales: https://github.com/kazupon/gunshi/tree/main/packages/resources#-supported-locales
      builtinResources: resources
    })
  ]
})
```

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!TIP]
> **About the helper functions used in this example:**
>
> - `defineI18nWithTypes`: A type-safe helper for creating commands with i18n support. It ensures proper TypeScript inference for translation keys. [Learn more](#defineI18nWithTypes)
> - `resolveKey`: A utility that handles namespace resolution for custom translation keys in commands and subcommands. Always use this for custom keys to ensure proper namespacing. [Learn more](#resolvekey)

<!-- eslint-enable markdown/no-missing-label-refs -->

To run this example with different locales:

```sh
# English (default)
node cli.ts --name John

# i18n-example (i18n-example v1.0.0)
#
# Hello, John!
#
# Current locale: en-US
# Command Description: Greeting application

# Japanese
MY_LANG=ja-JP node cli.ts --name 田中 --formal

# i18n-example (i18n-example v1.0.0)
#
# はじめまして, 田中!
#
# Current locale: ja-JP
# Command Description: 挨拶アプリケーション
```

## Using Built-in Resources

The `@gunshi/resources` package provides pre-translated resources for common CLI terms:

```ts
import { cli } from 'gunshi'
import i18n from '@gunshi/plugin-i18n'
import resources from '@gunshi/resources'

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
      // Provide built-in translations for common terms.
      // See the support locales: https://github.com/kazupon/gunshi/tree/main/packages/resources#-supported-locales
      builtinResources: resources
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

```ts [cli.ts]
import i18n, { defineI18nWithTypes, pluginId as i18nId, resolveKey } from '@gunshi/plugin-i18n'
import resources from '@gunshi/resources'
import { cli } from 'gunshi'

import type { I18nExtension } from '@gunshi/plugin-i18n'

const command = defineI18nWithTypes<{ extensions: { [i18nId]: I18nExtension } }>()({
  name: 'greeter',
  args: {
    name: { type: 'string', short: 'n' },
    formal: { type: 'boolean', short: 'f' }
  },

  // Load translations from files
  resource: locale => {
    if (locale.toString() === 'ja-JP') {
      // Dynamic import for lazy loading
      const jaJP = await import('./locales/ja-JP.json', {
        with: { type: 'json' }
      })
      return jaJP.default
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
      ? resolveKey('formal_greeting', ctx.name)
      : resolveKey('informal_greeting', ctx.name)

    const greeting = t(greetingKey)
    console.log(`${greeting}, ${name}!`)
  }
})

await cli(process.argv.slice(2), command, {
  name: 'i18n-example',
  version: '1.0.0',
  plugins: [
    i18n({
      locale: process.env.MY_LANG || 'en-US',
      builtinResources: resources
    })
  ]
})
```

Example locale files:

```json [locales/en-US.json]
{
  "description": "Greeting application",
  "arg:name": "Name to greet",
  "arg:formal": "Use formal greeting",
  "informal_greeting": "Hello",
  "formal_greeting": "Good day"
}
```

```json [locales/ja-JP.json]
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

```ts
import i18n, { defineI18nWithTypes, pluginId as i18nId, resolveKey } from '@gunshi/plugin-i18n'

import type { I18nExtension } from '@gunshi/plugin-i18n'

const command = defineI18nWithTypes<{ extensions: { [i18nId]: I18nExtension } }>()({
  name: 'deploy',
  args: {
    app: { type: 'string', required: true },
    environment: { type: 'string', required: true }
  },
  resource: () => ({
    deploying: 'Deploying {$app} to {$environment}...',
    success: 'Successfully deployed {$app} to {$environment}!',
    error: 'Failed to deploy: {$message}'
  }),
  run: ctx => {
    const t = ctx.extensions[i18nId].translate
    const { app, environment } = ctx.values

    // Use resolveKey for all custom keys
    const deployingKey = resolveKey('deploying', ctx.name)
    const successKey = resolveKey('success', ctx.name)
    const errorKey = resolveKey('error', ctx.name)

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

```ts [cli.ts]
import i18n, { defineI18nWithTypes, pluginId as i18nId, resolveKey } from '@gunshi/plugin-i18n'
import resources from '@gunshi/resources'
import { cli } from 'gunshi'

import type { I18nExtension } from '@gunshi/plugin-i18n'

// Sub-command with its own translations
const createCommand = defineI18nWithTypes<{ extensions: { [i18nId]: I18nExtension } }>()({
  name: 'create',
  args: {
    name: { type: 'string', required: true }
  },
  resource: locale => {
    return locale.toString() === 'ja-JP'
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
    const creatingKey = resolveKey('creating', ctx.name)
    const successKey = resolveKey('success', ctx.name)

    console.log(t(creatingKey, { name }))
    console.log(t(successKey))
  }
})

// Main command
const mainCommand = defineI18nWithTypes<{ extensions: { [i18nId]: I18nExtension } }>()({
  name: 'resource-manager',
  resource: () => ({
    description: 'Resource management tool',
    usage_hint: 'Use a sub-command to manage resources'
  }),
  run: ctx => {
    const t = ctx.extensions[i18nId].translate

    // Use resolveKey for main command's custom keys too
    const hintKey = resolveKey('usage_hint', ctx.name)
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
      locale: process.env.MY_LANG || 'en-US',
      builtinResources: resources
    })
  ]
})
```

## Helper Functions

The i18n plugin provides helpful utilities for working with translations:

### `defineI18n`

Define an i18n-aware command.

```ts
import { defineI18n } from '@gunshi/plugin-i18n'

const greetCommand = defineI18n({
  name: 'greet',
  description: 'Greet someone',
  args: {
    name: {
      type: 'string',
      description: 'Name to greet'
    }
  },
  resource: locale => {
    switch (locale.toString()) {
      case 'ja-jP': {
        return {
          description: '誰かにあいさつ',
          'arg:name': 'あいさつするための名前'
        }
      }
      // other locales ...
    }
  },
  run: ctx => {
    console.log(`Hello, ${ctx.values.name}!`)
  }
})
```

The difference from the `define` function is that you can define a `resource` option that can load a locale.

### `defineI18nWithTypes`

Define an i18n-aware command with types

This helper function allows specifying the type parameter of `GunshiParams` while inferring the `Args` type, `ExtendContext` type from the definition.

```ts
import { defineI18nWithTypes } from '@gunshi/plugin-i18n'

// Define a command with specific extensions type
type MyExtensions = { logger: { log: (message: string) => void } }

const greetCommand = defineI18nWithTypes<{ extensions: MyExtensions }>()({
  name: 'greet',
  args: {
    name: { type: 'string', description: 'Name to greet' }
  },
  resource: locale => {
    switch (locale.toString()) {
      case 'ja-jP': {
        return {
          description: '誰かにあいさつ',
          'arg:name': 'あいさつするための名前'
        }
      }
      // other locales ...
    }
  },
  run: ctx => {
    // ctx.values is inferred as { name?: string }
    // ctx.extensions is MyExtensions
  }
})
```

### `withI18nResource`

Add i18n resources to existing commands:

```ts
import { define } from 'gunshi'
import { withI18nResource, resolveKey, pluginId as i18nId } from '@gunshi/plugin-i18n'

const existingCommand = define({
  name: 'app',
  run: ctx => {
    const t = ctx.extensions[i18nId]?.translate
    if (t) {
      const messageKey = resolveKey('message', ctx.name)
      console.log(t(messageKey))
    }
  }
})

const existingLocalizableCommand = withI18nResource(existingCommand, locale => ({
  message: 'Hello from i18n!'
}))
```

### `resolveKey`

The `resolveKey` helper ensures proper command namespace handling for custom translation keys:

```ts
import { resolveKey } from '@gunshi/plugin-i18n'

// For a command named 'build'
const key = resolveKey('starting', ctx.name)
// Returns: 'build:starting'
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

Bad Nested structure (won't work with `translate('messages.greeting')`):

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
      locale: process.env.MY_LANG || 'en-US',

      // Or using Intl.Locale for advanced locale handling
      locale: new Intl.Locale(process.env.MY_LANG || 'en-US')
    })
  ]
})
```

In Node.js v21 and later, you can also detect locale using the navigator API:

```ts
// In browser or Node.js v21.2.0+ (experimental global navigator), use navigator.language
// Otherwise, fall back to environment- or Intl-based detection
const locale = (() => {
  // Experimental global navigator in Node 21.2.0+
  if (typeof globalThis.navigator !== 'undefined' && navigator.language) {
    return navigator.language
  }
  // Fallback: read locale from environment variables
  const env = process.env.LC_ALL || process.env.LC_MESSAGES || process.env.LANG || 'en-US'
  const base = env.split('.')[0].replace('_', '-')
  try {
    // Normalize and validate with Intl.Locale
    return new Intl.Locale(base).toString()
  } catch {
    return 'en-US'
  }
})()
```

## Custom Translation Adapters

For advanced scenarios requiring custom interpolation syntax or translation logic, you can create custom translation adapters by implementing the TranslationAdapter interface.

This allows full control over how translations are stored, retrieved, and interpolated.

For detailed implementation guidance and examples, see the [Custom Translation Adapter documentation](https://github.com/kazupon/gunshi/tree/main/packages/plugin-i18n#-custom-translation-adapter) in the `@gunshi/plugin-i18n` package.

## Translating Help Messages

The i18n plugin automatically uses your translations for help messages.

When users run `--help` with different locales, they'll see help messages in their language:

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

```ts
// ❌ Wrong - Don't access custom keys directly
const message = t('welcome')

// ✅ Correct - Always use resolveKey for custom keys
const welcomeKey = resolveKey('welcome', ctx.name)
const message = t(welcomeKey)
```

## Migration from v0.26

If you're migrating from Gunshi v0.26 where i18n was built into the CLI options, see the [v0.27 Release Notes](../../release/v0.27.md#internationalization-migration) for detailed migration instructions.
