# Plugin System

## What's a Plugin?

A plugin in Gunshi is a modular extension that adds functionality to your CLI application without modifying its core code.

Think of plugins as building blocks that you can snap together to create powerful command-line tools.

### Why Use Plugins?

Plugins solve common CLI development challenges:

- **Separation of Concerns**: Plugins keep your command logic clean by handling cross-cutting functionality like logging, authentication, or database connections separately. Your commands focus on their primary task while plugins handle the supporting infrastructure.
- **Reusability**: Write functionality once, use it everywhere. A plugin created for one command can be reused across your entire CLI or even in different projects, saving development time and ensuring consistency.
- **Composability**: Plugins work together seamlessly. You can combine multiple plugins—an authentication plugin with a logging plugin and a database plugin—and they'll integrate naturally into your CLI's lifecycle.

### How Plugins Work

Plugins integrate at specific points in your CLI's execution:

1. **Registration**: When your CLI starts, plugins are registered and their dependencies are resolved
2. **Setup**: Plugins initialize and configure themselves, adding any global options (like `--debug`)
3. **Extension**: Plugins extend your command context with new functionality (like translation methods or API clients)
4. **Decoration**: Plugins can modify how commands execute or how help text is displayed
5. **Execution**: Your commands run with all plugin enhancements seamlessly integrated

This lifecycle integration means plugins can:

- Add global options available to all commands (like `--debug` or `--verbose`)
- Provide utilities accessible in any command (like API clients or database connections)
- Modify how your CLI displays help text or handles errors
- Intercept command execution for logging or validation

The beauty of Gunshi's plugin system is that it handles all the complexity behind the scenes.

You simply declare which plugins you want to use, and they automatically become part of your CLI's capabilities.

Now that you understand how plugins work, let's explore the plugins that come with Gunshi.

These built-in plugins provide essential CLI functionality out of the box.

## Built-in Plugins

Gunshi provides a standard `cli()` function that comes pre-configured with two essential plugins.

These built-in plugins give your CLI the familiar behavior users expect from command-line tools.

Let's explore what each plugin provides:

### @gunshi/plugin-global

This plugin adds `--help` and `--version` options to all your commands automatically.

When either option is used, the plugin intercepts command execution to display the appropriate information.

The following example demonstrates how the cli() function automatically includes the global plugin:

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

- `my-app --help` displays usage information rendered by the renderer plugin
- `my-app --version` displays the version number
- The plugin decorates command execution to handle these options before your command runs

### @gunshi/plugin-renderer

The renderer plugin automatically formats help text, usage information, and validation errors.

It works behind the scenes to ensure consistent, readable output across your entire CLI.

## Using Optional Plugins

Optional plugins add specialized features to your CLI.

Install them separately and configure them based on your needs.

### Internationalization

Add multi-language support with the i18n plugin:

::: code-group

```sh [npm]
npm install --save @gunshi/plugin-i18n
```

```sh [pnpm]
pnpm add @gunshi/plugin-i18n
```

```sh [yarn]
yarn add @gunshi/plugin-i18n
```

```sh [deno]
# For Deno projects, you can add Gunshi from JSR:
deno add jsr:@gunshi/plugin-i18n
```

```sh [bun]
bun add @gunshi/plugin-i18n
```

:::

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
    // Access the i18n plugin extension via its namespaced ID 'g:i18n'
    // (All Gunshi plugins use the 'g:' prefix to prevent naming conflicts)
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

> [!NOTE]
> Plugin IDs use namespacing to prevent conflicts and identify ownership. Official Gunshi plugins use the `g:` prefix (e.g., `g:i18n`, `g:completion`). When developing your own plugins, use your organization's namespace (e.g., `myorg:logger`) or scoped package format (e.g., `@company/auth`). For detailed naming conventions and guidelines, see the [Plugin ID Guidelines](../plugin/guidelines.md#plugin-ids).

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

::: code-group

```sh [npm]
npm install --save @gunshi/plugin-completion
```

```sh [pnpm]
pnpm add @gunshi/plugin-completion
```

```sh [yarn]
yarn add @gunshi/plugin-completion
```

:::

> [!IMPORTANT]
> Shell completion currently requires Node.js. The completion feature is not available when running your CLI with Deno or Bun runtimes.

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

The completion plugin adds a special `complete` command to your CLI that generates shell-specific completion scripts.

### Installing Completion for End Users

Once you've added the completion plugin to your CLI, your users need to perform a one-time setup to enable tab completion on their system.

#### Basic Setup Example (Bash)

Users generate a completion script for their shell and add it to their shell configuration:

```sh
# Generate completion script and save it
deploy-cli complete bash > ~/.local/share/bash-completion/completions/deploy-cli

# Reload your shell configuration
source ~/.bashrc

# Now tab completion works!
deploy-cli dep<TAB>  # Completes to: deploy-cli deploy
```

> [!TIP]
> For detailed setup instructions for all supported shells (Bash, Zsh, Fish, PowerShell), including directory creation and configuration steps, see the [@gunshi/plugin-completion README](https://github.com/gunshi/gunshi/tree/main/packages/plugin-completion#shell-completion-setup).

#### How It Works

The completion plugin adds a special `complete` command to your CLI that generates shell-specific completion scripts.

Users run this command once to generate the script for their shell, then source it in their shell configuration to enable tab completion.

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

If you need precise control over your CLI's functionality and bundle size, you can use `@gunshi/bone` - Gunshi's bare-bones foundation package.

Unlike the standard `cli()` function which includes plugins automatically, `@gunshi/bone` starts with zero plugins, letting you add only what you need:

::: code-group

```sh [npm]
npm install --save @gunshi/bone @gunshi/plugin-global @gunshi/plugin-renderer
```

```sh [pnpm]
pnpm add @gunshi/bone @gunshi/plugin-global @gunshi/plugin-renderer
```

```sh [yarn]
yarn add @gunshi/bone @gunshi/plugin-global @gunshi/plugin-renderer
```

:::

```js
import { cli } from '@gunshi/bone'
import global from '@gunshi/plugin-global'
import renderer from '@gunshi/plugin-renderer'

// Only includes plugins you explicitly add
await cli(process.argv.slice(2), command, {
  name: 'minimal-cli',
  plugins: [
    global(), // Adds --help and --version options
    renderer() // Adds help text formatting
  ]
})
```

This approach gives you explicit control over every aspect of your CLI, making it ideal for applications where bundle size or specific feature control is critical.

Common use cases for `@gunshi/bone`:

- Embedded CLIs with size constraints
- Custom implementations of help or version handling
- Testing plugin interactions in isolation
- Applications requiring precise control over all CLI behavior

## Next Steps

Now that you understand the plugin system basics, you can explore more advanced topics and start building with Gunshi's plugin ecosystem.

To deepen your understanding of the plugin system:

- **TypeScript Support**: Explore type-safe plugin usage in the [Type System Guide](../advanced/type-system.md)
- **Context Extensions**: Learn how plugins extend functionality through [Context Extensions](../advanced/context-extensions.md)

Ready to create your own plugins?

- **Plugin Development**: Build custom plugins with the [Plugin Development Guide](../plugin/introduction.md)
