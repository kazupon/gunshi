# Plugin System

Gunshi v0.27 introduces a powerful plugin system that enables modular CLI architecture. This guide explores the official plugin ecosystem and demonstrates how to leverage built-in and optional plugins to create feature-rich CLI applications.

## Understanding the Plugin System

The plugin system in Gunshi provides a structured way to extend CLI functionality through:

- **Modular Architecture**: Each plugin encapsulates specific functionality
- **Type-Safe Extensions**: Full TypeScript support for plugin extensions
- **Dependency Management**: Automatic resolution of plugin dependencies
- **Lifecycle Integration**: Plugins integrate seamlessly with CLI lifecycle

## Built-in Plugins

When you use the standard `cli()` function from Gunshi, two essential plugins are automatically included:

### @gunshi/plugin-global

This plugin adds standard `--help` and `--version` options to all commands:

```js
import { cli } from 'gunshi'

const command = {
  name: 'app',
  run: ctx => {
    console.log('Running application')
  }
}

// Automatically includes --help and --version
await cli(process.argv.slice(2), command, {
  name: 'my-app',
  version: '1.0.0'
})

// Usage:
// my-app --help     # Shows help information
// my-app --version  # Shows version
```

The global plugin provides these extension methods:

```js
// In your command runner
run: ctx => {
  // Available through global plugin
  ctx.extensions['g:global'].showVersion()
  ctx.extensions['g:global'].showHeader()
  ctx.extensions['g:global'].showUsage()
  ctx.extensions['g:global'].showValidationErrors(errors)
}
```

### @gunshi/plugin-renderer

Automatically renders usage information, help text, and validation errors with proper formatting:

```js
const command = {
  name: 'deploy',
  description: 'Deploy application to cloud',
  args: {
    environment: {
      type: 'string',
      required: true,
      description: 'Target environment'
    }
  },
  run: ctx => {
    // Renderer plugin automatically formats help output
  }
}

// Automatically renders formatted help when --help is used
// Automatically shows validation errors with proper formatting
```

## Optional Plugins

Install and configure these plugins based on your needs:

### Internationalization with @gunshi/plugin-i18n

Add comprehensive multi-language support to your CLI:

```bash
npm install @gunshi/plugin-i18n @gunshi/resources
```

```js
import { cli } from 'gunshi'
import i18n, { pluginId as i18nId, resolveKey, defineI18n } from '@gunshi/plugin-i18n'
import enUS from '@gunshi/resources/en-US.json' with { type: 'json' }
import jaJP from '@gunshi/resources/ja-JP.json' with { type: 'json' }

// Type-safe command with i18n
const command = defineI18n({
  name: 'greet',
  resource: async ctx => {
    const locale = ctx.extensions[i18nId].locale.toString()
    return locale === 'ja-JP'
      ? { greeting: 'こんにちは、{$name}さん！' }
      : { greeting: 'Hello, {$name}!' }
  },
  args: {
    name: { type: 'string', required: true }
  },
  run: ctx => {
    const greetingKey = resolveKey('greeting', ctx)
    const message = ctx.extensions[i18nId].translate(greetingKey, {
      name: ctx.values.name
    })
    console.log(message)
  }
})

await cli(process.argv.slice(2), command, {
  name: 'greet-cli',
  version: '1.0.0',
  plugins: [
    i18n({
      locale: 'en-US',
      builtinResources: {
        'en-US': enUS,
        'ja-JP': jaJP
      }
    })
  ]
})
```

### Shell Completion with @gunshi/plugin-completion

Enable tab completion for your CLI across multiple shells:

```bash
npm install @gunshi/plugin-completion
```

```js
import { cli } from 'gunshi'
import completion from '@gunshi/plugin-completion'

const command = {
  name: 'deploy',
  args: {
    environment: {
      type: 'string',
      required: true,
      description: 'Deployment environment'
    },
    region: {
      type: 'string',
      description: 'AWS region'
    }
  },
  run: ctx => {
    console.log(`Deploying to ${ctx.values.environment}`)
  }
}

await cli(process.argv.slice(2), command, {
  name: 'deploy-cli',
  version: '1.0.0',
  plugins: [
    completion({
      config: {
        entry: {
          args: {
            environment: {
              handler: () => [
                { value: 'production', description: 'Production environment' },
                { value: 'staging', description: 'Staging environment' },
                { value: 'development', description: 'Development environment' }
              ]
            },
            region: {
              handler: async ({ previousArgs }) => {
                // Dynamic completion based on environment
                if (previousArgs.environment === 'production') {
                  return [
                    { value: 'us-east-1', description: 'US East (Virginia)' },
                    { value: 'eu-west-1', description: 'EU West (Ireland)' }
                  ]
                }
                return [{ value: 'us-west-2', description: 'US West (Oregon)' }]
              }
            }
          }
        }
      }
    })
  ]
})

// Generate completion script:
// deploy-cli complete bash > /etc/bash_completion.d/deploy-cli
// deploy-cli complete zsh > ~/.zsh/completions/_deploy-cli
```

## Combining Multiple Plugins

Plugins work together seamlessly to create powerful CLI applications:

```js
import { cli } from 'gunshi'
import i18n, { pluginId as i18nId, resolveKey, defineI18n } from '@gunshi/plugin-i18n'
import completion from '@gunshi/plugin-completion'
import enUS from '@gunshi/resources/en-US.json' with { type: 'json' }
import jaJP from '@gunshi/resources/ja-JP.json' with { type: 'json' }

// Developer-friendly CLI with i18n and completion
const buildCommand = defineI18n({
  name: 'build',
  description: 'Build the project',
  resource: async ctx => {
    const locale = ctx.extensions[i18nId].locale.toString()
    return locale === 'ja-JP'
      ? {
          start: 'ビルドを開始します...',
          success: 'ビルドが完了しました！',
          error: 'ビルドエラー: {$message}'
        }
      : {
          start: 'Starting build...',
          success: 'Build completed!',
          error: 'Build error: {$message}'
        }
  },
  args: {
    mode: {
      type: 'string',
      default: 'development',
      description: 'Build mode'
    },
    watch: {
      type: 'boolean',
      description: 'Watch for changes'
    }
  },
  run: ctx => {
    const t = ctx.extensions[i18nId].translate
    const startKey = resolveKey('start', ctx)
    const successKey = resolveKey('success', ctx)
    const errorKey = resolveKey('error', ctx)

    console.log(t(startKey))

    try {
      // Build logic here
      console.log(t(successKey))
    } catch (error) {
      console.error(t(errorKey, { message: error.message }))
    }
  }
})

await cli(process.argv.slice(2), buildCommand, {
  name: 'build-tool',
  version: '2.0.0',
  plugins: [
    // Plugins work together
    i18n({
      locale: 'en-US',
      builtinResources: {
        'en-US': enUS,
        'ja-JP': jaJP
      }
    }),
    completion({
      config: {
        entry: {
          args: {
            mode: {
              handler: () => [
                { value: 'development', description: 'Development build' },
                { value: 'production', description: 'Production build' },
                { value: 'test', description: 'Test build' }
              ]
            }
          }
        }
      }
    })
  ]
})
```

## Plugin Configuration Patterns

### Conditional Plugin Loading

Load plugins based on environment or configuration:

```js
import { cli } from 'gunshi'
import completion from '@gunshi/plugin-completion'

const plugins = []

// Only add completion in development
if (process.env.NODE_ENV !== 'production') {
  plugins.push(completion())
}

// Add i18n if locale is set
if (process.env.LANG) {
  const i18n = await import('@gunshi/plugin-i18n')
  plugins.push(
    i18n.default({
      locale: process.env.LANG
    })
  )
}

await cli(process.argv.slice(2), command, {
  name: 'my-cli',
  plugins
})
```

### Plugin with Custom Configuration

Many plugins accept configuration options:

```js
import i18n from '@gunshi/plugin-i18n'

// Custom translation adapter
class CustomAdapter {
  constructor(options) {
    this.locale = options.locale
    this.fallbackLocale = options.fallbackLocale
    this.resources = new Map()
  }

  getResource(locale) {
    return this.resources.get(locale)
  }

  setResource(locale, resource) {
    this.resources.set(locale, resource)
  }

  getMessage(locale, key) {
    const resource = this.getResource(locale)
    return resource?.[key]
  }

  translate(locale, key, values = {}) {
    let message = this.getMessage(locale, key)
    if (!message && locale !== this.fallbackLocale) {
      message = this.getMessage(this.fallbackLocale, key)
    }
    if (!message) return undefined

    // Custom interpolation
    return message.replace(/\{\$(\w+)\}/g, (_, name) => {
      return values[name]?.toString() || ''
    })
  }
}

await cli(process.argv.slice(2), command, {
  plugins: [
    i18n({
      locale: 'en-US',
      translationAdapterFactory: options => new CustomAdapter(options),
      builtinResources: {
        // Custom resources
      }
    })
  ]
})
```

## Minimal Setup with @gunshi/bone

For complete control over plugins, use the minimal `@gunshi/bone` package:

```bash
npm install @gunshi/bone @gunshi/plugin-global
```

```js
import { cli } from '@gunshi/bone'
import global from '@gunshi/plugin-global'

// Only includes plugins you explicitly add
await cli(process.argv.slice(2), command, {
  name: 'minimal-cli',
  plugins: [
    global() // Manually add global plugin
    // No renderer plugin by default
  ]
})
```

## Plugin Extension Access

Plugins extend the command context with their functionality. Access extensions using the plugin ID:

```js
import i18n, { pluginId as i18nId } from '@gunshi/plugin-i18n'

const command = {
  run: ctx => {
    // Type-safe access to plugin extensions
    const i18nExtension = ctx.extensions[i18nId]

    if (i18nExtension) {
      // Plugin is available
      const locale = i18nExtension.locale
      const translated = i18nExtension.translate('key')
    }
  }
}
```

## Next Steps

- Learn about [Context Extensions](./context-extensions.md) to understand how plugins extend functionality
- Explore [Plugin Development](/guide/plugin/introduction.md) to create custom plugins
- Check the [API Reference](/api) for detailed plugin documentation
