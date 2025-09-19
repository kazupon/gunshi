# Context Extensions

Plugins in Gunshi extend the command context with additional functionality through the extension system. This guide explains how to leverage these extensions to build more powerful CLI applications.

> [!TIP]
> This guide assumes familiarity with the basic concepts explained in the [Plugin System](../essentials/plugin-system.md). Context extensions are a core feature of the plugin system, providing the mechanism through which plugins deliver functionality to commands.

## Understanding Context Extensions

The command context (`ctx`) is the central object passed to every command runner. Plugins enhance this context by adding new capabilities through the extensions property, allowing your commands to access additional functionality like logging, internationalization, or custom services. Each plugin contributes its own extension under a unique namespace, ensuring clean separation of concerns and preventing conflicts between different plugins.

```ts
// Basic command context
const command = {
  run: ctx => {
    // Default context properties
    ctx.name // Command name
    ctx.version // CLI version
    ctx.values // Parsed argument values
    ctx.args // Raw arguments

    // Plugin extensions
    ctx.extensions // Object containing all plugin extensions
  }
}
```

## How Extensions Work

Each plugin registers its extension under a unique identifier (plugin ID) within the `ctx.extensions` object. This namespacing approach prevents collisions between plugins and makes dependencies explicit. When a plugin is added to your CLI configuration, its extension becomes available to all commands through this standardized interface:

> [!TIP]
> For details on how plugin extensions work, see the [Plugin Extensions](../plugin/extensions.md) guide.

```ts
import { pluginId as globalId } from '@gunshi/plugin-global'

const command = {
  run: ctx => {
    // Access global plugin extension
    const globalExtension = ctx.extensions[globalId]

    // Use extension methods
    globalExtension.showVersion()
    globalExtension.showHeader()
  }
}
```

## Working with Built-in Plugin Extensions

Gunshi provides several official plugins with pre-built extensions that cover common CLI needs. Understanding how to use these extensions effectively will accelerate your CLI development.

### Global Plugin Extension

The global plugin (`@gunshi/plugin-global`) provides methods for displaying CLI information:

```ts
import { pluginId as globalId } from '@gunshi/plugin-global'

const command = {
  run: ctx => {
    const global = ctx.extensions[globalId]

    // Show version information
    global.showVersion()

    // Show command header
    global.showHeader()

    // Show usage information
    global.showUsage()

    // Show validation errors
    if (ctx.validationError) {
      global.showValidationErrors(ctx.validationError)
    }
  }
}
```

> [!NOTE]
> For a complete list of official plugins and their features, see the [Official Plugins](../plugin/official-plugins.md) guide.

### Renderer Plugin Extension

The renderer plugin (`@gunshi/plugin-renderer`) provides text rendering capabilities:

```ts
import { pluginId as rendererId } from '@gunshi/plugin-renderer'

const command = {
  run: async ctx => {
    // Check if renderer extension is available
    const renderer = ctx.extensions[rendererId]

    if (renderer) {
      // Get translated text
      const helpText = await renderer.text('HELP')

      // Load subcommands for display
      const commands = await renderer.loadCommands()
    }
  }
}
```

> [!NOTE]
> The renderer plugin is typically added by the global plugin when used together. For detailed information about the renderer plugin API, see the [Renderer Plugin documentation](https://github.com/kazupon/gunshi/tree/main/packages/plugin-renderer)

## Using Optional Plugin Extensions

Beyond the core plugins, Gunshi's ecosystem includes optional plugins for specialized functionality. These extensions follow the same patterns but may not be present in all CLI configurations.

### I18n Plugin Extension

The i18n plugin provides translation capabilities through context extensions:

```ts
import { pluginId as i18nId } from '@gunshi/plugin-i18n'

const command = {
  run: ctx => {
    const i18n = ctx.extensions[i18nId]

    if (i18n) {
      // Access current locale
      console.log(`Running in ${i18n.locale} locale`)

      // Use translation function
      const message = i18n.translate('welcome')
      console.log(message)
    }
  }
}
```

> [!NOTE]
> For comprehensive i18n usage including `resolveKey`, `defineI18n`, resource management, and working with subcommands, see the [Internationalization guide](./internationalization.md)

## Extension Techniques

The following techniques demonstrate code for working effectively with extensions in various scenarios. These approaches ensure your commands remain flexible, maintainable, and resilient.

### Safe Extension Access

Extensions may not always be available depending on your CLI configuration and which plugins are installed. Commands should defensively check for extension existence to prevent runtime errors and provide graceful fallbacks. This defensive programming approach ensures your CLI remains robust even when optional plugins are not configured:

```ts
import { pluginId as globalId } from '@gunshi/plugin-global'

const command = {
  run: ctx => {
    // Safe access technique
    const global = ctx.extensions[globalId]

    if (global) {
      // Extension is available
      global.showUsage()
    } else {
      // Fallback behavior
      console.log('Usage information not available')
    }
  }
}
```

### Extension Composition

Commands often benefit from combining multiple plugin extensions to create richer functionality. Extensions are designed to work together harmoniously, allowing you to compose complex behaviors from simple building blocks. The following example demonstrates how global display features can be enhanced with dynamic content loading from the renderer extension:

```ts
import { pluginId as globalId } from '@gunshi/plugin-global'
import { pluginId as rendererId } from '@gunshi/plugin-renderer'

const command = {
  run: async ctx => {
    const global = ctx.extensions[globalId]
    const renderer = ctx.extensions[rendererId]

    // Combine extensions for rich functionality
    if (global && renderer) {
      // Show header using global extension
      global.showHeader()

      // Load and display commands if renderer is available
      const commands = await renderer.loadCommands()
      console.log('Available commands:', commands)
    }
  }
}
```

### Dynamic Extension Usage

Extensions can be conditionally utilized based on command arguments, environment variables, or other runtime conditions. This dynamic approach allows your CLI to adapt its behavior to different contexts and user preferences. The following code shows how to selectively engage extensions based on command flags:

```ts
import { pluginId as globalId } from '@gunshi/plugin-global'
import { pluginId as loggerId } from '@my/plugin-logger'

const command = {
  args: {
    verbose: { type: 'boolean' },
    debug: { type: 'boolean' },
    help: { type: 'boolean' }
  },
  run: ctx => {
    // Use extensions based on command flags
    if (ctx.values.help) {
      ctx.extensions[globalId]?.showUsage()
      return
    }

    // Conditional extension usage for verbose mode
    if (ctx.values.verbose) {
      const global = ctx.extensions[globalId]
      global?.showHeader()
      console.log('Running in verbose mode...')
    }

    // Enable debug features if available
    if (ctx.values.debug) {
      // Check if a hypothetical logger extension exists
      if (ctx.extensions[loggerId]) {
        ctx.extensions[loggerId].setLevel('debug')
      }
    }

    // Your command logic here
    console.log('Command executed')
  }
}
```

## Type-Safe Extensions

Use TypeScript for compile-time safety with extensions:

```ts
import { define } from 'gunshi'
import { pluginId as globalId } from '@gunshi/plugin-global'
import type { GlobalExtension, PluginId as GlobalId } from '@gunshi/plugin-global'

// Define command with typed extensions
const command = define<Record<GlobalId, GlobalExtension>>({
  name: 'app',
  run: ctx => {
    // TypeScript knows about the global extension
    ctx.extensions[globalId].showVersion()
    ctx.extensions[globalId].showUsage()

    // Type errors for unknown extensions
    // ctx.extensions['unknown'].method() // Compile-time error!
  }
})
```

> [!NOTE]
> For comprehensive type parameter usage including `GunshiParams`, combining multiple plugin types with the intersection (`&`), and advanced type safety techniques, see the [Type System guide](./type-system.md)

## Custom Extension Techniques

Extensions can serve as a foundation for building sophisticated CLI architectures. The following advanced patterns showcase how to leverage extensions for service layers and architectural concerns.

### Extension as Service Layer

Extensions can act as a service abstraction layer, providing consistent interfaces to external systems like databases, caches, or APIs. This pattern decouples your command logic from infrastructure concerns and simplifies testing through mockable extensions:

```ts
// Note: These are hypothetical example plugins for illustration purposes
// You would need to create or install actual plugins with these capabilities
import { pluginId as dbId } from '@my/plugin-db' // Example custom plugin
import { pluginId as cacheId } from '@my/plugin-cache' // Example custom plugin

// With hypothetical database and cache plugins
const command = {
  run: async ctx => {
    const db = ctx.extensions[dbId]
    const cache = ctx.extensions[cacheId]

    // Check cache first
    const cached = await cache?.get('users')
    if (cached) {
      return cached
    }

    // Fetch from database
    const users = await db?.query('SELECT * FROM users')

    // Cache the result
    await cache?.set('users', users, { ttl: 3600 })

    return users
  }
}
```

### Extension for Cross-Cutting Concerns

Cross-cutting concerns are aspects of your application that affect multiple commands, such as logging, authentication, monitoring, or error tracking. Extensions provide an ideal mechanism for implementing these concerns consistently across your entire CLI. By centralizing these capabilities in plugin extensions, you ensure uniform behavior and simplify maintenance. The following example demonstrates a comprehensive approach to handling logging, authentication, and metrics collection:

```ts
// Note: These are hypothetical example plugins for illustration purposes
import { pluginId as loggerId } from '@my/plugin-logger'
import { pluginId as authId } from '@my/plugin-auth'
import { pluginId as metricsId } from '@my/plugin-metrics'

const command = {
  run: async ctx => {
    const logger = ctx.extensions[loggerId]
    const auth = ctx.extensions[authId]
    const metrics = ctx.extensions[metricsId]

    const startTime = Date.now()
    logger?.info('Command started', { command: ctx.name })

    // Check authentication
    if (!auth?.isAuthenticated()) {
      logger?.error('Authentication required')
      throw new Error('Please login first')
    }

    try {
      // Your actual command logic
      // processData is a placeholder for your data processing logic
      const result = await processData(ctx.values)

      // Track success metrics
      metrics?.track('command.success', {
        command: ctx.name,
        duration: Date.now() - startTime
      })

      logger?.info('Command completed successfully')
      return result
    } catch (error) {
      logger?.error('Command failed', { error: error.message })
      metrics?.track('command.failure', {
        command: ctx.name,
        error: error.message
      })
      throw error
    }
  }
}
```

> [!TIP]
> Learn how to create your own plugins with custom extensions in the [Plugin Development](../plugin/introduction.md) guide.

## Guidelines for Plugin using users

### 1. Always Import Plugin IDs

Never hardcode plugin ID strings. Always import and use the exported constants to avoid typos and ensure type safety:

```js
// ✅ Good: Import and use plugin ID constants
import i18n, { pluginId as i18nId } from '@gunshi/plugin-i18n'
import global, { pluginId as globalId } from '@gunshi/plugin-global'

// Use the imported IDs
const i18nExt = ctx.extensions[i18nId]
const globalExt = ctx.extensions[globalId]

// ❌ Bad: Hardcoded strings are fragile and error-prone
const i18nExt = ctx.extensions['g:i18n'] // Don't do this!
```

### 2. Handle Optional Plugin Extensions Gracefully

When plugins might not be available, always check for extension existence to avoid runtime errors:

```js
import { pluginId as globalId } from '@gunshi/plugin-global'

run: ctx => {
  // Safe access with optional chaining
  const version = ctx.extensions[globalId]?.showVersion() || 'Version unknown'

  // Or explicit checking for complex logic
  const globalExt = ctx.extensions[globalId]
  if (globalExt) {
    // Plugin is available - use full features
    globalExt.showHeader()
    globalExt.showUsage()
  } else {
    // Graceful fallback
    console.log('Help not available')
  }
}
```

### 3. Use TypeScript for Safety

When using TypeScript, leverage type definitions for compile-time safety:

```ts
import { define } from 'gunshi'
import { pluginId as globalId } from '@gunshi/plugin-global'
import type { GlobalExtension, PluginId as GlobalId } from '@gunshi/plugin-global'

// Type-safe command with extension
const command = define<Record<GlobalId, GlobalExtension>>({
  name: 'deploy',
  run: ctx => {
    // TypeScript ensures type safety
    ctx.extensions[globalId].showVersion()
  }
})
```

> [!NOTE]
> For advanced TypeScript techniques including combining multiple plugin types and using `GunshiParams`, see the [Type System guide](./type-system.md).

## Troubleshooting

### Extension Not Found

If an extension is not available:

```js
// Debug which extensions are available
console.log('Available extensions:', Object.keys(ctx.extensions))

// Check if plugin was added
if (!ctx.extensions[pluginId]) {
  console.error(`Plugin ${pluginId} not installed`)
  console.error('Add it to your CLI plugins:')
  console.error('plugins: [yourPlugin()]')
}
```

### Type Errors with Extensions

For TypeScript users, ensure proper type definitions:

```ts
// Import types
import type { YourExtension, PluginId } from 'your-plugin'

// Define with proper types
const command = define<Record<PluginId, YourExtension>>({
  // Command definition
})
```

### Extension Method Not Working

Check the plugin documentation for correct usage:

```js
import { pluginId as globalId } from '@gunshi/plugin-global'

// Wrong: Direct method call without checking
ctx.extensions[globalId].showVersion() // May fail if plugin not available

// Right: Store reference and check existence first
const global = ctx.extensions[globalId]
if (global) {
  global.showVersion()
}
```
