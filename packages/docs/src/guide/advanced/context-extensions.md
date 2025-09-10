# Context Extensions

Plugins in Gunshi extend the command context with additional functionality through the extension system. This guide explains how to leverage these extensions to build more powerful CLI applications.

## Understanding Context Extensions

The command context (`ctx`) is the central object passed to every command runner. With plugins, this context can be extended with new capabilities:

```js
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

Each plugin can add its own extension to the context through a namespaced property:

```js
import i18n, { pluginId as i18nId } from '@gunshi/plugin-i18n'

const command = {
  run: ctx => {
    // Access i18n plugin extension
    const i18nExtension = ctx.extensions[i18nId]

    // Use extension methods
    const message = i18nExtension.translate('welcome')
    const locale = i18nExtension.locale
  }
}
```

## Working with Built-in Plugin Extensions

### Global Plugin Extension

The global plugin (`@gunshi/plugin-global`) provides methods for displaying CLI information:

```js
const command = {
  run: ctx => {
    const global = ctx.extensions['g:global']

    // Show version information
    global.showVersion()

    // Show command header
    global.showHeader()

    // Show usage information
    global.showUsage()

    // Show validation errors
    if (errors.length > 0) {
      global.showValidationErrors(errors)
    }
  }
}
```

### Renderer Plugin Extension

The renderer plugin (`@gunshi/plugin-renderer`) provides text rendering capabilities:

```js
const command = {
  run: async ctx => {
    const renderer = ctx.extensions['g:renderer']

    if (renderer) {
      // Get translated text
      const helpText = await renderer.text('HELP')

      // Load subcommands for display
      const commands = await renderer.loadCommands()
    }
  }
}
```

## Using Optional Plugin Extensions

### I18n Plugin Extension

The i18n plugin provides comprehensive translation capabilities:

```js
import i18n, { pluginId as i18nId, resolveKey, defineI18n } from '@gunshi/plugin-i18n'

const command = defineI18n({
  name: 'server',
  resource: async ctx => ({
    starting: 'Starting server on port {port}...',
    started: 'Server started successfully!',
    error: 'Failed to start: {error}'
  }),
  args: {
    port: { type: 'number', default: 3000 }
  },
  run: ctx => {
    const t = ctx.extensions[i18nId].translate

    // Translate with interpolation using resolveKey for custom keys
    const startingKey = resolveKey('starting', ctx.name)
    console.log(t(startingKey, { port: ctx.values.port }))

    try {
      // Start server logic
      const startedKey = resolveKey('started', ctx.name)
      console.log(t(startedKey))
    } catch (error) {
      // Translate error messages
      const errorKey = resolveKey('error', ctx.name)
      console.error(t(errorKey, { error: error.message }))
    }

    // Access current locale
    const locale = ctx.extensions[i18nId].locale
    console.log(`Running in ${locale.toString()} locale`)
  }
})
```

### Working with Subcommands

In subcommands, use the `resolveKey` helper for proper namespace handling:

```js
import { resolveKey, defineI18n } from '@gunshi/plugin-i18n'

const subCommand = defineI18n({
  name: 'start',
  resource: async ctx => ({
    message: 'Starting subprocess...'
  }),
  run: ctx => {
    const i18n = ctx.extensions[i18nId]

    // Resolve key with proper namespace
    const key = resolveKey('message', ctx.name)
    const message = i18n.translate(key)

    console.log(message)
  }
})
```

## Extension Patterns

### Safe Extension Access

Always check if an extension exists before using it:

```js
const command = {
  run: ctx => {
    // Safe access pattern
    const i18n = ctx.extensions[i18nId]

    if (i18n) {
      // Extension is available
      console.log(i18n.translate('message'))
    } else {
      // Fallback behavior
      console.log('Default message')
    }
  }
}
```

### Extension Composition

Multiple plugin extensions can work together:

```js
const command = {
  run: async ctx => {
    const i18n = ctx.extensions[i18nId]
    const global = ctx.extensions['g:global']

    // Combine extensions for rich functionality
    if (i18n && global) {
      // Show localized header
      const header = i18n.translate('app_header')
      console.log(header)

      // Then show usage in current locale
      global.showUsage()
    }
  }
}
```

### Dynamic Extension Usage

Extensions can be used dynamically based on runtime conditions:

```js
const command = {
  args: {
    verbose: { type: 'boolean' },
    locale: { type: 'string' }
  },
  run: async ctx => {
    const i18n = ctx.extensions[i18nId]

    // Change locale dynamically
    if (ctx.values.locale && i18n) {
      await i18n.loadResource(ctx.values.locale, ctx, command)
    }

    // Conditional extension usage
    if (ctx.values.verbose) {
      const global = ctx.extensions['g:global']
      global?.showHeader()
      global?.showUsage()
    }
  }
}
```

## Type-Safe Extensions

Use TypeScript for compile-time safety with extensions:

```ts
import { define } from 'gunshi'
import i18n, { pluginId as i18nId } from '@gunshi/plugin-i18n'
import global, { pluginId as globalId } from '@gunshi/plugin-global'
import type { I18nExtension, PluginId as I18nId } from '@gunshi/plugin-i18n'
import type { GlobalExtension, PluginId as GlobalId } from '@gunshi/plugin-global'

// Define command with typed extensions
const command = define<{
  extensions: Record<I18nId, I18nExtension> & Record<GlobalId, GlobalExtension>
}>({
  name: 'app',
  run: ctx => {
    // TypeScript knows about available extensions
    // Use imported plugin IDs instead of hardcoded strings
    const message = ctx.extensions[i18nId].translate('key')
    ctx.extensions[globalId].showVersion()

    // Type errors for unknown extensions
    // ctx.extensions['unknown'].method() // Error!
  }
})
```

## Custom Extension Patterns

### Extension as Service Layer

Use extensions as a service layer for your CLI:

```js
// With a hypothetical database plugin
const command = {
  run: async ctx => {
    const db = ctx.extensions['db']
    const cache = ctx.extensions['cache']

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

Extensions are perfect for cross-cutting concerns like logging, monitoring, or authentication:

```js
const command = {
  run: async ctx => {
    const logger = ctx.extensions['logger']
    const auth = ctx.extensions['auth']
    const metrics = ctx.extensions['metrics']

    // Start timing
    const startTime = Date.now()

    // Log command start
    logger?.info('Command started', { command: ctx.name })

    // Check authentication
    if (!auth?.isAuthenticated()) {
      logger?.error('Authentication required')
      throw new Error('Please login first')
    }

    try {
      // Command logic here
      const result = await performAction()

      // Track metrics
      metrics?.track('command.success', {
        command: ctx.name,
        duration: Date.now() - startTime
      })

      return result
    } catch (error) {
      // Log errors
      logger?.error('Command failed', { error: error.message })

      // Track failure metrics
      metrics?.track('command.failure', {
        command: ctx.name,
        error: error.message
      })

      throw error
    }
  }
}
```

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
const command = define<{
  extensions: Record<PluginId, YourExtension>
}>({
  // Command definition
})
```

### Extension Method Not Working

Check the plugin documentation for correct usage:

```js
// Wrong: Direct method call
ctx.extensions[i18nId].translate('key') // May fail

// Right: Store reference first
const i18n = ctx.extensions[i18nId]
if (i18n) {
  i18n.translate('key')
}
```

## Guidelines

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
import i18n, { pluginId as i18nId, resolveKey } from '@gunshi/plugin-i18n'

run: ctx => {
  // Safe access with optional chaining
  const message = ctx.extensions[i18nId]?.translate(resolveKey('welcome', ctx)) || 'Welcome'

  // Or explicit checking for complex logic
  const i18nExt = ctx.extensions[i18nId]
  if (i18nExt) {
    // Plugin is available - use full features
    console.log(i18nExt.translate(resolveKey('greeting', ctx), { name: ctx.values.name }))
  } else {
    // Graceful fallback
    console.log(`Hello, ${ctx.values.name}!`)
  }
}
```

### 3. Use Type-Safe Command Definitions

Leverage TypeScript for compile-time safety with plugin extensions:

```ts
import { define } from 'gunshi'
import i18n, { pluginId as i18nId, resolveKey } from '@gunshi/plugin-i18n'
import global, { pluginId as globalId } from '@gunshi/plugin-global'
import type { I18nExtension, PluginId as I18nId } from '@gunshi/plugin-i18n'
import type { GlobalExtension, PluginId as GlobalId } from '@gunshi/plugin-global'

// Single plugin extension
const command = define<Record<I18nId, I18nExtension>>({
  name: 'deploy',
  run: ctx => {
    // TypeScript knows i18n extension exists
    ctx.extensions[i18nId].translate(resolveKey('deploy_start', ctx))
  }
})

// Multiple plugin extensions - use & to combine Records
const commandWithMultiple = define<
  Record<I18nId, I18nExtension> & Record<GlobalId, GlobalExtension>
>({
  name: 'deploy',
  run: ctx => {
    // TypeScript knows both extensions exist
    ctx.extensions[i18nId].translate(resolveKey('deploy_start', ctx))
    ctx.extensions[globalId].showVersion()
  }
})
```
