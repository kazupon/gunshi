# Plugin System

## What's a Plugin?

A plugin in Gunshi is a modular extension that adds functionality to your CLI application without modifying its core code. Think of plugins as building blocks that you can snap together to create powerful command-line tools.

### Why Use Plugins?

Plugins solve common CLI development challenges:

**Separation of Concerns**: Plugins keep your command logic clean by handling cross-cutting functionality like logging, authentication, or database connections separately. Your commands focus on their primary task while plugins handle the supporting infrastructure.

**Reusability**: Write functionality once, use it everywhere. A plugin created for one command can be reused across your entire CLI or even in different projects, saving development time and ensuring consistency.

**Composability**: Plugins work together seamlessly. You can combine multiple plugins—an authentication plugin with a logging plugin and a database plugin—and they'll integrate naturally into your CLI's lifecycle.

### How Plugins Work

Plugins integrate at specific points in your CLI's execution:

1. **Registration**: When your CLI starts, plugins register themselves and declare their dependencies
2. **Setup**: Plugins initialize and configure themselves before commands run
3. **Extension**: Plugins add new capabilities that your commands can access
4. **Execution**: Your commands run with all plugin functionality available

This lifecycle integration means plugins can:

- Add global options available to all commands (like `--debug` or `--verbose`)
- Provide utilities accessible in any command (like API clients or database connections)
- Modify how your CLI displays help text or handles errors
- Intercept command execution for logging or validation

The beauty of Gunshi's plugin system is that it handles all the complexity behind the scenes. You simply declare which plugins you want to use, and they automatically become part of your CLI's capabilities.

Now that you understand how plugins work, let's explore the plugins that come with Gunshi. These built-in plugins provide essential CLI functionality out of the box.

## Built-in Plugins

When you use the standard `cli()` function from Gunshi, two essential plugins are automatically included to provide standard CLI behavior.

### @gunshi/plugin-global

This plugin adds `--help` and `--version` options to all your commands automatically:

```js
import { cli } from 'gunshi'

const command = {
  name: 'app',
  description: 'My CLI application',
  run: ctx => {
    console.log('Running application')
  }
}

await cli(process.argv.slice(2), command, {
  name: 'my-app',
  version: '1.0.0'
})
```

Now your CLI automatically supports:

- `my-app --help` shows usage information
- `my-app --version` displays the version number

### @gunshi/plugin-renderer

The renderer plugin automatically formats help text, usage information, and validation errors. It works behind the scenes to ensure consistent, readable output across your entire CLI.

## Using Optional Plugins

Optional plugins add specialized features to your CLI. Install them separately and configure them based on your needs.

### Internationalization

Add multi-language support with the i18n plugin:

```bash
npm install @gunshi/plugin-i18n
```

Here's a simple example using the `defineI18n` helper:

```js
import { cli } from 'gunshi'
import i18n, { defineI18n, resolveKey } from '@gunshi/plugin-i18n'

// Define resources inline for each locale
const resources = {
  'en-US': {
    greeting: 'Hello, {$name}!',
    farewell: 'Goodbye!'
  },
  'ja-JP': {
    greeting: 'こんにちは、{$name}さん！',
    farewell: 'さようなら！'
  },
  'es-ES': {
    greeting: '¡Hola, {$name}!',
    farewell: '¡Adiós!'
  }
}

const command = defineI18n({
  name: 'greet',
  description: 'Greet someone in their language',
  // Resource function returns translations for the current locale
  resource: async ctx => {
    const locale = ctx.extensions['g:i18n'].locale
    return resources[locale] || resources['en-US']
  },
  args: {
    name: {
      type: 'string',
      required: true,
      description: 'Name to greet'
    }
  },
  run: ctx => {
    const t = ctx.extensions['g:i18n'].translate
    console.log(t(resolveKey('greeting', ctx), { name: ctx.values.name }))
    console.log(t(resolveKey('farewell', ctx)))
  }
})

await cli(process.argv.slice(2), command, {
  name: 'greet-cli',
  version: '1.0.0',
  plugins: [
    i18n({
      locale: process.env.LANG || 'en-US'
    })
  ]
})
```

Key benefits:

- The `defineI18n` helper simplifies i18n setup for commands
- Automatic locale detection from system settings
- Simple interpolation syntax for dynamic values
- Fallback to default locale when translation is missing
- Plugin functionality is accessible via `ctx.extensions` in your command runners

> [!NOTE]
> The `ctx.extensions` object is how plugins extend your command context with additional functionality. The i18n plugin adds translation capabilities through `ctx.extensions['g:i18n']`. To learn more about working with plugin extensions and best practices for accessing them, see the [Context Extensions guide](../advanced/context-extensions.md).

> [!TIP]
> This example demonstrates basic internationalization setup. For comprehensive coverage including external resource files, TypeScript support, dynamic locale switching, and production deployment strategies, see the [Advanced Internationalization Guide](../advanced/internationalization.md).

### Shell Completion

Enable tab completion across different shells:

```sh
npm install @gunshi/plugin-completion
```

Here's how to add completion support:

```js
import { cli } from 'gunshi'
import completion from '@gunshi/plugin-completion'

const command = {
  name: 'deploy',
  args: {
    environment: {
      type: 'string',
      required: true,
      description: 'Target environment'
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
                { value: 'production', description: 'Production' },
                { value: 'staging', description: 'Staging' },
                { value: 'development', description: 'Development' }
              ]
            }
          }
        }
      }
    })
  ]
})
```

The completion plugin adds a special `complete` command to your CLI that generates shell-specific completion scripts. Users need to install these scripts once to enable tab completion for your CLI:

To enable completion in your shell:

```sh
# For bash
deploy-cli complete bash > /etc/bash_completion.d/deploy-cli

# For zsh
deploy-cli complete zsh > ~/.zsh/completions/_deploy-cli
```

## Combining Plugins

Plugins work seamlessly together. Here's an example using both i18n and completion:

```js
import { cli } from 'gunshi'
import i18n, { defineI18n, resolveKey } from '@gunshi/plugin-i18n'
import completion from '@gunshi/plugin-completion'

// Define your resources
const resources = {
  'en-US': {
    start: 'Starting build for {$mode} mode...',
    success: 'Build completed successfully!'
  },
  'ja-JP': {
    start: '{$mode}モードでビルドを開始しています...',
    success: 'ビルドが正常に完了しました！'
  }
}

const buildCommand = defineI18n({
  name: 'build',
  description: 'Build the project',
  resource: async ctx => {
    const locale = ctx.extensions['g:i18n'].locale
    return resources[locale] || resources['en-US']
  },
  args: {
    mode: {
      type: 'string',
      default: 'development',
      description: 'Build mode'
    }
  },
  run: ctx => {
    const t = ctx.extensions['g:i18n'].translate
    console.log(t(resolveKey('start', ctx), { mode: ctx.values.mode }))
    // Build logic here
    console.log(t(resolveKey('success', ctx)))
  }
})

await cli(process.argv.slice(2), buildCommand, {
  name: 'build-tool',
  version: '2.0.0',
  plugins: [
    i18n({
      locale: process.env.LANG || 'en-US'
    }),
    completion({
      config: {
        entry: {
          args: {
            mode: {
              handler: () => [
                { value: 'development', description: 'Development build' },
                { value: 'production', description: 'Production build' }
              ]
            }
          }
        }
      }
    })
  ]
})
```

Both plugins enhance your CLI without interfering with each other - i18n handles translations while completion provides tab suggestions.

## Plugin Configuration

Configure plugins based on your environment or user preferences.

### Environment-based Configuration

Load plugins conditionally:

```js
import { cli } from 'gunshi'

const plugins = []

// Add completion in development only
if (process.env.NODE_ENV === 'development') {
  const completion = await import('@gunshi/plugin-completion')
  plugins.push(completion.default())
}

// Add i18n if locale is set
if (process.env.LANG) {
  const i18n = await import('@gunshi/plugin-i18n')
  plugins.push(i18n.default({ locale: process.env.LANG }))
}

await cli(process.argv.slice(2), command, {
  name: 'my-cli',
  plugins
})
```

This approach keeps your production builds lean while providing developer features during development.

## Minimal Setup

For complete control over which plugins are included, use `@gunshi/bone`:

```sh
npm install @gunshi/bone @gunshi/plugin-global
```

```js
import { cli } from '@gunshi/bone'
import global from '@gunshi/plugin-global'

// Only includes plugins you explicitly add
await cli(process.argv.slice(2), command, {
  name: 'minimal-cli',
  plugins: [global()]
})
```

With `@gunshi/bone`, you start with absolutely no plugins—even basic features like `--help` and `--version` require manual addition. Unlike the standard `cli()` which automatically includes essential plugins, `@gunshi/bone` requires you to explicitly add every plugin you want. This bare-bones approach is ideal for lightweight CLIs or when you need precise control over functionality.

## Next Steps

Now that you understand the plugin system basics, you can explore more advanced topics and start building with Gunshi's plugin ecosystem.

For plugin users looking to extend their Gunshi applications further:

- **Context Extensions**: Understand how plugins extend functionality through [Context Extensions](../advanced/context-extensions.md)
- **TypeScript Support**: Learn about type-safe plugin development in the [Type System Guide](../advanced/type-system.md)

For plugin developers looking to extend their Gunshi applications further:

- **Creating Custom Plugins**: Build your own plugins with the [Plugin Development Guide](../plugin/introduction.md)
