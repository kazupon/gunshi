# @gunshi/plugin-i18n

> internationalization (i18n) plugin for gunshi.

This plugin provides multi-language support for your CLI applications, allowing you to create commands that can display messages in different languages based on user locale.

## 💿 Installation

```sh
# npm
npm install --save @gunshi/plugin-i18n

# pnpm
pnpm add @gunshi/plugin-i18n

# yarn
yarn add @gunshi/plugin-i18n

# deno
deno add jsr:@gunshi/plugin-i18n

# bun
bun add @gunshi/plugin-i18n
```

## 🚀 Usage

```ts
import { cli } from 'gunshi'
import i18n, { defineI18n } from '@gunshi/plugin-i18n'

/**
 * You can define a command with `defineI18n`, which is compatible with the `define` function.
 * This provides full type safety for i18n commands - TypeScript will suggest the 'resource' option
 * and ensure your resource keys match the expected structure.
 */

// Define a command
const greetCommand = defineI18n({
  name: 'greet',
  description: 'Greet someone',

  args: {
    name: {
      type: 'string',
      description: 'Name to greet'
    }
  },

  // Define resource fetcher for translations
  resource: async ctx => ({
    description: 'Greet someone in their language',
    'arg:name': "The person's name",
    greeting: 'Hello, {$name}!'
  }),

  run: async ctx => {
    const { name } = ctx.values
    // Use translate function from context
    console.log(ctx.extensions['g:i18n'].translate('greeting', { name }))
  }
})

// Run CLI with i18n plugin
await cli(process.argv.slice(2), greetCommand, {
  plugins: [
    i18n({
      locale: 'en-US' // or use process.env.LANG, navigator.language, etc.
    })
  ]
})
```

## ⚙️ Plugin Options

### `locale`

- Type: `string | Intl.Locale`
- Default: `'en-US'`
- Description: The locale to use for translations. Can be a BCP 47 language tag string or an `Intl.Locale` object.

### `builtinResources`

- Type: `Record<string, Record<BuiltinResourceKeys, string>>`
- Default: `{}`
- Description:
  - Built-in resource translations for different locales. Used for translating gunshi built-in level messages like "USAGE", "OPTIONS", "COMMANDS", etc.
  - for details, see [Resource Key Naming Conventions](#-resource-key-naming-conventions)

### `translationAdapterFactory`

- Type: `(options: TranslationAdapterFactoryOptions) => TranslationAdapter`
- Default: `createTranslationAdapter`
- Description: Factory function to create a custom translation adapter. Useful for integrating with existing i18n libraries.

## 🔗 Plugin Dependencies

The i18n plugin has an optional dependency on the `g:global` plugin:

- **Plugin ID**: `g:global` (optional)
- **Purpose**: Provides global options support for `--help` and `--version`
- **Effect**: When the globals plugin is present, the i18n plugin automatically sets up translations for the `help` and `version` built-in resources

This means:

- If you're using the globals plugin (which adds `--help` and `--version` options), the i18n plugin will automatically handle their translations
- The translations for "Display this help message" and "Display this version" will be available in your configured locale
- You can override these translations by providing your own `help` and `version` keys in your built-in resources

Example with globals plugin:

```ts
import { cli } from 'gunshi'
import i18n from '@gunshi/plugin-i18n'
import globals from '@gunshi/plugin-global' // need install `@gunshi/plugin-global`
import jsJPResource from '@gunshi/resources/ja-JP' with { type: 'json' } // need install `@gunshi/resources`

await cli(args, command, {
  plugins: [
    globals(), // Adds --help and --version options
    i18n({
      locale: 'ja-JP',
      builtinResources: {
        'ja-JP': jsJPResource // Set from with providing gunshi built-in resources
      }
    })
  ]
})
```

## 🛠️ Helper Functions

### `defineI18n`

Type-safe helper to define an i18n-aware command.

```ts
import { defineI18n } from '@gunshi/plugin-i18n'

const command = defineI18n({
  name: 'hello',
  args: {
    name: { type: 'string' }
  },
  resource: async ctx => ({
    description: 'Say hello',
    'arg:name': 'Your name'
  }),
  run: async ctx => {
    console.log(`Hello, ${ctx.values.name}!`)
  }
})
```

### `withI18nResource`

Add i18n resource to an existing command. This helper is useful for extending an already defined command.

```ts
import { define } from 'gunshi' // alternative 'gunshi/definition', or '@gunshi/definition'
import { withI18nResource } from '@gunshi/plugin-i18n'

const basicCommand = define({
  name: 'test',
  args: {
    target: {
      type: 'string',
      description: 'The test target file',
      required: true
    }
  },
  run: ctx => console.log(`test: ${ctx.values.target}`)
})

const i18nCommand = withI18nResource(basicCommand, async ctx => {
  const resource = await import(
    `./path/to/resources/test/${ctx.extensions['g:i18n'].locale.toString()}.json`,
    { with: { type: 'json' } }
  ).then(l => l.default || l)
  return resource
})
```

### Key Resolution Helpers

The i18n plugin exports key resolution helper functions that handle the internal key structure, so you don't need to manually prefix your keys:

- `resolveKey(key: string, ctx: CommandContext): string` - Resolves a custom key with command namespace if applicable
- `resolveArgKey(key: string, ctx: CommandContext): string` - Resolves an argument key with `arg:` prefix and namespace
- `resolveBuiltInKey(key: string): string` - Resolves a built-in key with `_:` prefix

```ts
import { resolveKey, resolveArgKey, resolveBuiltInKey } from '@gunshi/plugin-i18n'

// These helpers automatically add the correct prefixes
resolveKey('description', ctx) // Returns namespaced key for description
resolveArgKey('verbose', ctx) // Returns 'arg:verbose' or 'command:arg:verbose' based on context
resolveBuiltInKey('USAGE') // Returns '_:USAGE'
```

#### Why Use Key Resolution Helpers?

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!NOTE]
> See also the [Resource Key Naming Conventions](#-resource-key-naming-conventions) section for details on how keys should be structured in your resource definitions.

<!-- eslint-enable markdown/no-missing-label-refs -->

The i18n plugin internally uses different key prefixes to organize translations:

- Built-in keys use `_:` prefix (e.g., `_:USAGE`, `_:OPTIONS`)
- Argument keys use `arg:` prefix (e.g., `arg:file`, `arg:verbose`)
- Command-specific keys can be namespaced with command name

While the `translate` function accepts keys without prefixes in most cases, using these helpers ensures:

- Consistent key resolution across your application
- Proper namespacing when using sub-commands
- Compatibility with future plugin updates
- Type-safe key generation

#### Example Usage

```ts
import { defineI18n, resolveKey, resolveArgKey, resolveBuiltInKey } from '@gunshi/plugin-i18n'

const command = defineI18n({
  name: 'deploy',
  args: {
    environment: { type: 'string', short: 'e' },
    force: { type: 'boolean', short: 'f' }
  },
  resource: async ctx => ({
    description: 'Deploy application',
    'arg:environment': 'Target environment',
    'arg:force': 'Force deployment',
    deploy_start: 'Starting deployment...',
    deploy_success: 'Deployment completed successfully!'
  }),
  run: async ctx => {
    const { translate } = ctx.extensions['g:i18n']

    // Direct usage (need to prefix with command name)
    console.log(translate('deploy:deploy_start'))

    // Using helpers for explicit control
    const envKey = resolveArgKey('environment', ctx)
    console.log(translate(envKey)) // Same as translate('arg:environment')

    // Useful when building dynamic keys
    const args = ['environment', 'force']
    for (const arg of args) {
      const key = resolveArgKey(arg, ctx)
      const description = translate(key)
      console.log(`${arg}: ${description}`)
    }

    // For built-in messages
    const usageKey = resolveBuiltInKey('USAGE')
    console.log(translate(usageKey)) // Translates the "USAGE" header
  }
})
```

## 🧩 Context Extensions

When using the i18n plugin, your command context is extended via `ctx.extensions['g:i18n']`.

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!IMPORTANT]
> This plugin extension is namespaced in `CommandContext.extensions` using this plugin ID `g:i18n` by the gunshi plugin system.

<!-- eslint-enable markdown/no-missing-label-refs -->

Available extensions:

- `locale: Intl.Locale`: The current locale
- `translate<T>(key: T, values?: Record<string, unknown>): string`: Translation function
- `loadResource(locale: string | Intl.Locale, ctx: CommandContext, command: Command): Promise<boolean>`: Manually load resources for a specific locale and command

## 📝 Resource Key Naming Conventions

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!TIP]
> The plugin provides [Key Resolution Helpers](#key-resolution-helpers) (`resolveKey`, `resolveArgKey`, `resolveBuiltInKey`) to automatically handle these naming conventions programmatically.

<!-- eslint-enable markdown/no-missing-label-refs -->

When defining your localization resources (either directly in the `resource` function or in separate files), there are specific naming conventions to follow for the keys:

- **Command Description**: Use the key `description` for the main description of the command.
- **Examples**: Use the key `examples` for usage examples.
- **Argument and Option Descriptions**: Keys for the descriptions of both command arguments (positional args) and options **must** be prefixed with `arg:`. For example:
  - For an argument named `file`: use `arg:file`
  - For an option named `verbose`: use `arg:verbose`
  - **Negatable Argument Descriptions**: For boolean options (e.g., `--verbose`), Gunshi automatically generates a description for the negatable version (e.g., `--no-verbose`) using the built-in `NEGATABLE` key (e.g., "Negatable of --verbose"). To provide a custom translation for a specific negatable option, use the pattern `arg:no-<optionName>`, for example, `arg:no-verbose`.
- **Custom Keys**: Any other keys you define for custom translation messages (like greetings, error messages, etc.) do not require a prefix and can be named freely (e.g., `informal_greeting`, `error_file_not_found`).
- **Built-in Keys**: Keys for built-in functionalities are handled by Gunshi's default locales. The complete list includes:
  - `USAGE` - Usage section header
  - `OPTIONS` - Options section header
  - `ARGUMENTS` - Arguments section header
  - `COMMANDS` - Commands section header
  - `EXAMPLES` - Examples section header
  - `FORMORE` - Footer text for additional help
  - `NEGATABLE` - Prefix for negatable options (e.g., "Negatable of --verbose")
  - `DEFAULT` - Prefix for default values (e.g., "default: 5")
  - `CHOICES` - Prefix for available choices (e.g., "choices: red, green, blue")
  - `help` - Description for the help option ("Display this help message")
  - `version` - Description for the version option ("Display this version")

  Internally, these keys are prefixed with `_:` (e.g., `_:USAGE`, `_:OPTIONS`), but you don't need to use this prefix directly. When overriding built-in translations in your resources, use the key names without the prefix (e.g., providing your own translation for `NEGATABLE`, not `_:NEGATABLE`). Additionally, custom keys are automatically namespaced with the command name in sub-command contexts (e.g., `deploy:informal_greeting` for a 'deploy' command).

Here's an example illustrating the convention:

```ts
import { defineI18n } from '@gunshi/plugin-i18n'

const command = defineI18n({
  name: 'my-command',
  args: {
    target: { type: 'string' },
    verbose: { type: 'boolean' }
  },
  resource: async ctx => {
    // Example for 'en-US' locale
    return {
      description: 'This is my command.', // built-in key, No prefix
      'arg:target': 'The target file to process.', // argument key, 'arg:' prefix
      'arg:verbose': 'Enable verbose output.', // argument key, 'arg:' prefix
      'arg:no-verbose': 'Disable verbose logging specifically.', // Optional custom translation for the negatable option
      processing_message: 'Processing target...' // custom keys, No prefix
    }
  },
  run: ctx => {
    /* ... */
  }
})
```

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!IMPORTANT]
> When defining resources, argument and option descriptions **must** be prefixed with `arg:` (e.g., `arg:target`, `arg:verbose`). All other keys like `description`, `examples`, and custom keys do not require prefixes.

<!-- eslint-enable markdown/no-missing-label-refs -->

Adhering to these conventions ensures that Gunshi correctly identifies and uses your translations for descriptions, help messages, and within your command's logic via `ctx.extensions['g:i18n'].translate()`.

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!IMPORTANT]
> The resource object returned by the `resource` function (or loaded from external files like JSON) **must** be a flat key-value structure. Nested objects are not supported for translations using `ctx.extensions['g:i18n'].translate()`. Keep your translation keys simple and at the top level.

<!-- eslint-enable markdown/no-missing-label-refs -->

Good Flat structure:

```json
{
  "greeting": "Hello",
  "farewell": "Goodbye"
}
```

Bad Nested structure (won't work with `ctx.extensions['g:i18n'].translate('messages.greeting')`):

```json
{
  "messages": {
    "greeting": "Hello",
    "farewell": "Goodbye"
  }
}
```

## 🔧 Implementation Details

This section covers important implementation details that can help you better understand and use the i18n plugin.

### Translation Return Values

The `translate` function has different behaviors depending on the key type:

- **Custom keys**: Returns an empty string (`''`) if the key is not found
- **Built-in keys** (internally prefixed with `_:`): Returns the key itself if not found

This difference is important for error handling and fallback displays:

```ts
const { translate } = ctx.extensions['g:i18n']

// Custom key not found
translate('nonexistent_key') // Returns: ''

// Built-in key not found (if not overridden)
translate('USAGE') // Returns: 'USAGE'
```

### Resource Loading Behavior

When loading command resources, the plugin automatically:

1. Extracts option descriptions from command args definitions
2. Creates default resources in English
3. Merges built-in resources with command-specific resources
4. Handles errors gracefully (logs to console.error but continues execution)

### Extending DefaultTranslation

The default translation adapter is exported and can be extended:

```ts
import { DefaultTranslation } from '@gunshi/plugin-i18n'

class MyCustomTranslation extends DefaultTranslation {
  translate(locale: string, key: string, values?: Record<string, unknown>): string | undefined {
    const result = super.translate(locale, key, values)
    // Add custom post-processing
    return result?.toUpperCase()
  }
}

// Use in plugin options
await cli(args, command, {
  plugins: [
    i18n({
      translationAdapterFactory: options => new MyCustomTranslation(options)
    })
  ]
})
```

### Internal Key Prefixing

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!IMPORTANT]
> Understanding these prefixes is essential for using the [Key Resolution Helpers](#key-resolution-helpers) effectively and following the [Resource Key Naming Conventions](#-resource-key-naming-conventions).

<!-- eslint-enable markdown/no-missing-label-refs -->

- Built-in resource keys are internally prefixed with `_:` (e.g., `_:USAGE`, `_:OPTIONS`)
- This prefix is handled automatically - you don't need to use it when overriding built-in translations
- Argument keys use the `arg:` prefix as documented
- Custom keys can be namespaced with the command name when in sub-command context (e.g., `deploy:custom_message` for a 'deploy' command)
- Use the exported helper functions (`resolveKey`, `resolveArgKey`, `resolveBuiltInKey`) to generate properly prefixed keys programmatically

## 🔤 Translation Interpolation

The default translation adapter supports simple interpolation using `{$key}` syntax:

```ts
// In your resource
const resource = {
  welcome: 'Welcome, {$name}!',
  'items.count': 'You have {$count} items',
  file_deleted: 'Deleted {$path}',
  error_message: 'Error: {$error}'
}
// In your command
const { translate } = ctx.extensions['g:i18n']
translate(resolveKey('welcome'), { name: 'John' }) // "Welcome, John!"
translate(resolveKey('items.count'), { count: 5 }) // "You have 5 items"
translate(resolveKey('file_deleted'), { path: '/tmp/file.txt' }) // "Deleted /tmp/file.txt"
translate(resolveKey('error_message'), { error: 'File not found' }) // "Error: File not found"
```

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!NOTE]
> The default adapter only supports simple string interpolation. For more advanced features like pluralization or formatting, you can provide a custom translation adapter.

<!-- eslint-enable markdown/no-missing-label-refs -->

## 🎨 Custom Translation Adapter

The default translation adapter provides basic string interpolation, but you might want to integrate with more powerful i18n libraries for features like:

- **Pluralization**: Different messages based on count values
- **Date/Time formatting**: Locale-aware formatting
- **Number formatting**: Currency, percentages, etc.
- **Complex interpolation**: Nested values, conditional messages
- **Message linking**: Reference other translations
- **Custom formatters**: Domain-specific formatting logic

### Creating a Translation Adapter

To create a custom translation adapter, you need to implement the `TranslationAdapter` interface:

```ts
interface TranslationAdapter {
  // Get all resources for a locale
  getResource(locale: string): Record<string, string> | undefined

  // Set resources for a locale
  setResource(locale: string, resource: Record<string, string>): void

  // Get a single message
  getMessage(locale: string, key: string): string | undefined

  // Translate a message with interpolation
  translate(locale: string, key: string, values?: Record<string, unknown>): string | undefined
}
```

The adapter factory receives options with locale information:

```ts
interface TranslationAdapterFactoryOptions {
  locale: string // Current locale (BCP 47)
  fallbackLocale: string // Fallback locale (default: 'en-US')
}
```

### How Translation Adapters Work

When you provide a custom translation adapter:

1. **Initialization**: The i18n plugin calls your factory function with locale settings
2. **Resource Loading**: When a command defines a `resource` function, the plugin:
   - Calls the resource function to get translations
   - Passes them to your adapter via `setResource(locale, resource)`
3. **Translation**: When `translate()` is called:
   - The plugin delegates to your adapter's `translate()` method
   - Your adapter handles interpolation and formatting
   - Returns the translated string or `undefined` if not found

### Custom Case: Integrating with Intlify (Vue I18n Core)

[Intlify](https://github.com/intlify/core) is the core of Intlify (Vue I18n), but it can be used independently. Here's how to create a translation adapter for Intlify:

```ts
import { cli } from 'gunshi'
import i18n, { defineI18n } from '@gunshi/plugin-i18n'
import {
  createCoreContext,
  getLocaleMessage,
  NOT_RESOLVED,
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
    return typeof result === 'number' && result === NOT_RESOLVED ? undefined : result
  }
}

// Define your command
const command = defineI18n({
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

  // Define a resource fetcher with Intlify syntax
  resource: async ctx => {
    const locale = ctx.extensions['g:i18n'].locale.toString()

    if (locale === 'ja-JP') {
      return {
        description: '挨拶アプリケーション',
        'arg:name': '挨拶する相手の名前',
        'arg:count': '挨拶の回数',
        greeting: 'こんにちは、{name}さん！',
        greeting_plural: 'こんにちは、{name}さん！({count}回目)'
      }
    }

    return {
      description: 'Greeting application',
      'arg:name': 'Name to greet',
      'arg:count': 'Number of greetings',
      greeting: 'Hello, {name}!',
      greeting_plural: 'Hello, {name}! (greeting #{count})'
    }
  },

  run: ctx => {
    const { name = 'World', count } = ctx.values
    const { translate } = ctx.extensions['g:i18n']

    // Use the translation function with Intlify
    const key = count > 1 ? 'greeting_plural' : 'greeting'
    const message = translate(key, { name, count })

    console.log(message)
  }
})

// Run the command with the Intlify translation adapter
await cli(process.argv.slice(2), command, {
  name: 'intlify-example',
  version: '1.0.0',
  plugins: [
    i18n({
      locale: process.env.MY_LOCALE || 'en-US',
      translationAdapterFactory: createIntlifyAdapterFactory
    })
  ]
})
```

With Intlify, you get advanced features like:

- Named interpolation: `{name}` instead of `{$name}`
- Pluralization support
- Linked messages
- HTML formatting
- Custom modifiers
- And more

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!TIP]
> Intlify uses `{name}` syntax for interpolation (without the `$` prefix), which is different from Gunshi's default adapter that uses `{$name}`.

<!-- eslint-enable markdown/no-missing-label-refs -->

## 🎯 Type-Safe Translation Keys

The i18n plugin provides sophisticated TypeScript type support for translation keys. When using TypeScript, the `translate` function will provide auto-completion and type checking for:

- Built-in keys (`USAGE`, `OPTIONS`, `COMMANDS`, etc.)
- Argument keys based on your command's args definition (`arg:name`, `arg:verbose`, etc.)
- Custom keys defined in your resource

```ts
import { defineI18n } from '@gunshi/plugin-i18n'

const command = defineI18n({
  name: 'example',
  args: {
    file: { type: 'string' },
    verbose: { type: 'boolean' }
  },
  resource: async () => ({
    description: 'Example command',
    'arg:file': 'File to process',
    'arg:verbose': 'Enable verbose output',
    custom_message: 'This is a custom message'
  }),
  run: ctx => {
    const { translate } = ctx.extensions['g:i18n']

    // TypeScript knows these are valid keys
    translate('USAGE') // Built-in key
    translate('arg:file') // Arg key from command definition
    translate('custom_message') // Custom key from resource

    // TypeScript will error on invalid keys
    // translate('invalid_key')  // Type error!
  }
})
```

## 📚 API References

See the [API References](./docs/index.md)

## ©️ License

[MIT](http://opensource.org/licenses/MIT)
