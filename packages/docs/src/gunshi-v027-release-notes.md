# Gunshi v0.27 Release Notes

## 🌟 Features

### Plugin System

Gunshi v0.27 introduces a powerful plugin system that enables modular CLI architecture. Plugins can extend command functionality, add global options, and provide cross-cutting concerns like internationalization and completion.

```js
import { cli, define } from 'gunshi'
import i18n, { pluginId as i18nId } from '@gunshi/plugin-i18n'
import completion from '@gunshi/plugin-completion'

// Type-safe command definition with plugin extensions
const command = define({
  name: 'app',
  // Provide translation resources for i18n plugin
  resource: async ctx => {
    const locale = ctx.extensions[i18nId].locale.toString()
    if (locale === 'ja-JP') {
      return { greeting: 'こんにちは' }
    }
    return { greeting: 'Hello' }
  },
  run: ctx => {
    // Plugins automatically extend the context
    console.log(ctx.extensions[i18nId].translate('greeting'))
  }
})

await cli(process.argv.slice(2), command, {
  name: 'my-app',
  version: '1.0.0',
  plugins: [i18n(), completion()]
})
```

Plugins can extend the `CommandContext` by adding their own properties to `ctx.extensions`. Each plugin's extension is namespaced using its plugin ID, preventing conflicts and ensuring type safety:

- Extensions are accessed via `ctx.extensions[pluginId]`
- Plugin IDs should be imported to avoid hardcoding strings
- TypeScript provides full type inference for extensions when using `define<Record<PluginId, Extension>>()`
- Multiple plugins can coexist, each providing their own extensions

In the example above, the i18n plugin extends `ctx.extensions` with internationalization functionality accessible via `ctx.extensions[i18nId]`. This provides methods like `translate()` and properties like `locale` to all commands, enabling consistent internationalization across your CLI application.

### Subcommand Object Style

Subcommands can now be defined as plain objects (Record) in addition to Map, providing better organization for complex CLIs:

```js
// Define subcommands
const addCommand = {
  name: 'add',
  description: 'Add file contents to the index',
  run: ctx => console.log('Adding files...')
}

const commitCommand = {
  name: 'commit',
  description: 'Record changes to the repository',
  run: ctx => console.log('Committing...')
}

// Pass subcommands as object to CLI options
await cli(process.argv.slice(2), mainCommand, {
  name: 'git',
  version: '1.0.0',
  subCommands: {
    add: addCommand,
    commit: commitCommand
  }
})
```

### Explicit Argument Detection

New feature to detect whether arguments were explicitly provided by the user or using default values:

```js
const command = {
  name: 'deploy',
  args: {
    verbose: {
      type: 'boolean',
      default: false,
      description: 'Enable verbose output'
    },
    output: {
      type: 'string',
      default: 'output.txt',
      description: 'Output file path'
    }
  },
  run: ctx => {
    // Check if arguments were explicitly provided
    if (ctx.explicit.output) {
      console.log('Output file explicitly specified:', ctx.values.output)
    } else {
      console.log('Using default output file:', ctx.values.output)
    }

    // Useful for configuration overrides
    if (!ctx.explicit.verbose && ctx.values.verbose) {
      console.log('Verbose mode enabled by config file')
    }
  }
}
```

The `ctx.explicit` object indicates for each argument:

- `true`: The argument was explicitly provided via command line
- `false`: The argument uses a default value or is undefined

### Command Lifecycle Hooks

New hooks for fine-grained control over command execution, available in CLI options:

```js
const command = {
  name: 'backup',
  run: ctx => {
    // Main backup logic
    console.log('Running backup...')
  }
}

await cli(process.argv.slice(2), command, {
  name: 'backup-tool',
  version: '1.0.0',
  onBeforeCommand: async ctx => {
    console.log('Preparing backup...')
  },
  onAfterCommand: async (ctx, result) => {
    console.log('Backup completed!')
    if (result) console.log('Result:', result)
  },
  onErrorCommand: async (ctx, error) => {
    console.error('Backup failed:', error)
    // Custom error handling logic
  }
})
```

### Custom Rendering Control

New rendering options allow fine-grained control over how commands display their output. Each command can customize or disable specific parts of the UI:

```js
const command = {
  name: 'wizard',
  rendering: {
    // Custom header with emoji and version
    header: async ctx => `🚀 ${ctx.name} v${ctx.version}`,

    // Disable default usage (set to null)
    usage: null,

    // Custom error formatting
    validationErrors: async (ctx, error) => `❌ Error: ${error.message}`
  },
  run: ctx => {
    // Command logic
  }
}
```

This feature enables:

- **Per-command customization**: Each command can have its own UI style
- **Selective rendering**: Disable specific parts (header, usage, errors) by setting them to `null`
- **Async rendering**: Support for async functions to fetch dynamic content
- **Full context access**: Renderers receive the complete command context for flexible output generation

## ⚡ Improvement Features

### Type Safety Enhancements

v0.27 brings comprehensive type safety improvements to all core APIs through generic type parameters, enabling full TypeScript inference for arguments and plugin extensions.

#### Enhanced `define()` API

The `define` function now accepts type parameters for type-safe command definitions with plugin extensions:

```ts
import { define } from 'gunshi'
import logger, { pluginId as loggerId } from '@your-company/plugin-logger'
import auth, { pluginId as authId } from '@your-company/plugin-auth'

import type { LoggerExtension, PluginId as LoggerId } from '@your-company/plugin-logger'
import type { AuthExtension, PluginId as AuthId } from '@your-company/plugin-auth'

// Type-safe command with plugin extensions
const deployCommand = define<{
  extensions: Record<LoggerId, LoggerExtension> & Record<AuthId, AuthExtension>
}>({
  name: 'deploy',
  run: ctx => {
    // Plugin extensions are fully typed
    ctx.extensions[loggerId]?.log('Starting deployment...')

    if (!ctx.extensions[authId]?.isAuthenticated()) {
      throw new Error('Authentication required')
    }

    const user = ctx.extensions[authId]?.getUser()
    ctx.extensions[loggerId]?.info(`Deploying as ${user?.name}`)
  }
})
```

#### Enhanced `lazy()` API

The `lazy` function supports type parameters for lazy-loaded commands with extensions:

```ts
import { lazy } from 'gunshi'
import { pluginId as dbId } from '@your-company/plugin-database'
import { pluginId as cacheId } from '@your-company/plugin-cache'

import type { DatabaseExtension, PluginId as DbId } from '@your-company/plugin-database'
import type { CacheExtension, PluginId as CacheId } from '@your-company/plugin-cache'

// Type-safe lazy loading with plugin extensions
const heavyCommand = lazy<{
  extensions: Record<DbId, DatabaseExtension> & Record<CacheId, CacheExtension>
}>(async () => {
  // Command is loaded only when needed
  return {
    name: 'process',
    run: async ctx => {
      // Extensions are typed even in lazy-loaded commands
      const cached = await ctx.extensions[cacheId]?.get('data')
      if (cached) return cached

      const result = await ctx.extensions[dbId]?.query('SELECT * FROM data')
      await ctx.extensions[cacheId]?.set('data', result)
      return result
    }
  }
})
```

#### Enhanced `cli()` API

The `cli` function accepts type parameters for the entire CLI application's extensions:

```ts
import { cli } from 'gunshi'
import i18n, { pluginId as i18nId } from '@gunshi/plugin-i18n'
import metrics, { pluginId as metricsId } from '@your-company/plugin-metrics'

import type { I18nExtension, PluginId as I18nId } from '@gunshi/plugin-i18n'
import type { MetricsExtension, PluginId as MetricsId } from '@your-company/plugin-metrics'

// Type-safe CLI with multiple plugin extensions
await cli<{ extensions: Record<I18nId, I18nExtension> & Record<MetricsId, MetricsExtension> }>(
  process.argv.slice(2),
  async ctx => {
    // All plugin extensions are available and typed
    const greeting = ctx.extensions[i18nId]?.translate('welcome')
    console.log(greeting)

    // Track CLI usage
    ctx.extensions[metricsId]?.track('cli.started', {
      command: ctx.name,
      locale: ctx.extensions[i18nId]?.locale.toString()
    })
  },
  {
    name: 'my-cli',
    plugins: [i18n(), metrics()]
  }
)
```

These type safety improvements ensure that:

- Command arguments are validated at compile time
- Plugin extensions are properly typed and accessible
- Typos and incorrect property access are caught before runtime
- IDE autocompletion works seamlessly across your CLI application

## 💥 Breaking Changes

### Internationalization migration

The built-in i18n support in CLI options has been moved to the official i18n plugin:

**Before (v0.26):**

```js
import { cli } from 'gunshi'

const command = {
  name: 'app',
  resource: async ctx => {
    // Return translations based on locale
    if (ctx.locale.toString() === 'ja-JP') {
      return { greeting: 'こんにちは' }
    }
    return { greeting: 'Hello' }
  },
  run: ctx => {
    console.log(ctx.translate('greeting'))
  }
}

// locale and translationAdapterFactory were in CLI options
await cli(process.argv.slice(2), command, {
  name: 'my-app',
  version: '1.0.0',
  locale: new Intl.Locale('en-US'),
  translationAdapterFactory: customAdapter
})
```

**After (v0.27):**

```ts
import { cli, define } from 'gunshi'
import i18n, { pluginId as i18nId } from '@gunshi/plugin-i18n'
import type { I18nExtension, PluginId as I18nPluginId } from '@gunshi/plugin-i18n'

// Type-safe command with i18n plugin extension
const command = define<Record<I18nPluginId, I18nExtension>>({
  name: 'app',
  // resource function is still used with i18n plugin
  resource: async ctx => {
    const locale = ctx.extensions[i18nId].locale.toString()
    if (locale === 'ja-JP') {
      return { greeting: 'こんにちは' }
    }
    return { greeting: 'Hello' }
  },
  run: ctx => {
    // Use the translate() function from i18n plugin extension
    console.log(ctx.extensions[i18nId].translate('greeting'))
  }
})

// locale and translationAdapterFactory removed from CLI options
await cli(process.argv.slice(2), command, {
  name: 'my-app',
  version: '1.0.0',
  plugins: [
    i18n({
      locale: 'en-US', // Moved from CLI options
      translationAdapterFactory: customAdapter // Moved from CLI options
    })
  ]
})
```

**Migration steps:**

1. Install the i18n plugin: `npm install --save @gunshi/plugin-i18n`
2. Import the plugin and its ID: `import i18n, { pluginId as i18nId } from '@gunshi/plugin-i18n'`
3. Move `locale` from CLI options to i18n plugin options
4. Move `translationAdapterFactory` from CLI options to i18n plugin options
5. Change `ctx.translate()` to `ctx.extensions[i18nId].translate()`
6. Keep using `resource` function in commands (no change needed)

## 📚 Documentation

### New Plugin Guides

- **Plugin Ecosystem Guide**: Comprehensive introduction to the plugin system
- **Context Extensions Guide**: Learn how to leverage plugin extensions
- **Plugin Development Guide**: Step-by-step guide for creating custom plugins

### Updated API Reference

- New plugin-related interfaces: `PluginOptions`, `PluginWithExtension`, `PluginWithoutExtension`
- Enhanced type definitions: `GunshiParams`, `CommandContextExtension`
- Rendering options: `RenderingOptions`, `RendererDecorator`

### Example Projects

New playground examples demonstrating:

- Plugin usage patterns
- Context extension scenarios
- Advanced type safety with plugins

## 🧑‍🤝‍🧑 Contributors

We'd like to thank all the contributors who made this release possible:

- [@kazupon](https://github.com/kazupon) - Core maintainer, plugin system architect, i18n extraction, lifecycle hooks
- [@yukukotani](https://github.com/yukukotani) - Fallback to entry command feature (#291)
- [@sushichan044](https://github.com/sushichan044) - Explicit argument detection feature (#232)
- [@43081j](https://github.com/43081j) - Exposed `Plugin` type (#159)
- [@theoephraim](https://github.com/theoephraim) - Documentation improvements (#249)
- [@lukekarrys](https://github.com/lukekarrys) - Documentation updates (#228)

Special thanks to the community for feedback and bug reports that helped shape v0.27!

## 💖 Credits

The completion plugin is powered by:

- [`@bombsh/tab`](https://github.com/bombshell-dev/tab) by [Bombshell](https://github.com/bombshell-dev) - Shell completion library that powers our tab completion functionality
