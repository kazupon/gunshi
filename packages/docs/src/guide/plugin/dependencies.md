# Plugin Dependencies

Gunshi's plugin system includes a sophisticated dependency management system that ensures plugins load in the correct order and can safely interact with each other.

This guide covers everything you need to know about plugin dependencies.

## Understanding Plugin Dependencies

Plugin dependencies allow you to:

- Ensure required plugins are loaded before your plugin
- Access functionality from other plugins
- Build composable plugin ecosystems
- Handle optional features gracefully

## Why Declare Dependencies?

Declaring dependencies explicitly provides several benefits:

1. **Load Order Guarantee**: Ensures your plugin's dependencies are initialized before your plugin runs
2. **Runtime Safety**: Prevents runtime errors from missing required functionality
3. **Clear Documentation**: Makes plugin relationships explicit and discoverable
4. **Type Safety**: Enables TypeScript to validate extension availability at compile time (see [Type-Safe Dependencies](./type-system.md#plugin-with-dependencies))
5. **Error Prevention**: Gunshi can detect missing dependencies and provide helpful error messages

## Dependency Resolution Process

Gunshi uses **topological sorting** to resolve plugin dependencies, ensuring that:

1. Plugins with no dependencies load first
2. Dependent plugins load after their dependencies
3. Circular dependencies are detected and prevented

### Example Dependency Graph

Consider the following plugin dependency relationships:

```mermaid
graph LR
    A[Logger Plugin]
    B[Cache Plugin] --> A
    C[Auth Plugin] --> A
    C --> B
    D[API Plugin] --> C

    style A fill:#4A90E2,stroke:#2E5A8E,stroke-width:2px,color:#fff
    style B fill:#9B59B6,stroke:#633974,stroke-width:2px,color:#fff
    style C fill:#468c56,stroke:#2e5936,stroke-width:2px,color:#fff
    style D fill:#E67E22,stroke:#935014,stroke-width:2px,color:#fff
```

In this dependency graph:

- **Logger Plugin** has no dependencies (it's a base plugin)
- **Cache Plugin** depends on Logger Plugin (needs logging functionality)
- **Auth Plugin** depends on both Logger Plugin and Cache Plugin (needs logging and caching)
- **API Plugin** depends on Auth Plugin (requires authenticated users)

### Resolution Order

Based on the dependency graph above, Gunshi's topological sorting algorithm determines the following loading order:

**Loading order: Logger → Cache → Auth → API**

This ensures that:

1. **Logger** loads first (no dependencies)
2. **Cache** loads after Logger (its dependency is satisfied)
3. **Auth** loads after both Logger and Cache (both dependencies are satisfied)
4. **API** loads last after Auth (its dependency is satisfied)

Note that Logger and Cache must both be loaded before Auth can initialize, as Auth depends on both of them.

## Declaring Dependencies

Plugin dependencies are declared in the plugin configuration using the `dependencies` property.

This property accepts an array of dependency specifications that tell Gunshi which other plugins must be loaded before your plugin can function correctly.

### Dependency Declaration Syntax

Dependencies can be declared in two ways:

```js
// Simple string format for required dependencies
dependencies: ['logger', 'auth']

// Object format for optional dependencies
dependencies: [
  'logger', // Required dependency
  { id: 'cache', optional: true } // Optional dependency
]
```

### Required Dependencies

Required dependencies must be present for your plugin to load. If a required dependency is missing, Gunshi will throw an error during initialization.

> [!WARNING]
> If you register multiple plugins with the same ID, Gunshi will emit a warning: `Duplicate plugin id detected`. While the plugins will still load, having duplicate IDs can lead to unexpected behavior when accessing extensions or resolving dependencies. Always ensure each plugin has a unique ID.

Declare required dependencies using the `dependencies` array:

```js
import { plugin } from 'gunshi/plugin'

// Simple string dependency
const authPlugin = plugin({
  id: 'auth',
  dependencies: ['logger'], // Requires 'logger' plugin
  setup: ctx => {
    // Logger plugin is guaranteed to be loaded
  }
})

// Multiple dependencies
const apiPlugin = plugin({
  id: 'api',
  dependencies: ['auth', 'cache', 'logger'],
  setup: ctx => {
    // All three plugins are loaded
  }
})
```

### Optional Dependencies

Optional dependencies allow your plugin to enhance its functionality when certain plugins are available, while still functioning correctly when they're not.

This enables graceful degradation and flexible plugin ecosystems.

#### When to Use Optional Dependencies

Use optional dependencies when:

- Your plugin can provide additional features with another plugin, but doesn't require it
- You want to support multiple plugin configurations
- You're building plugins that adapt to different environments
- You need to maintain backward compatibility

#### Declaring Optional Dependencies

Mark dependencies as optional using the object format:

```js
import { plugin } from 'gunshi/plugin'

const enhancedPlugin = plugin({
  id: 'enhanced',
  dependencies: [
    'core', // Required
    { id: 'cache', optional: true }, // Optional
    { id: 'metrics', optional: true } // Optional
  ],
  setup: ctx => {
    // 'core' is guaranteed
    // 'cache' and 'metrics' might not be present
  }
})
```

## Circular Dependencies

A circular dependency occurs when two or more plugins depend on each other, creating a dependency loop that cannot be resolved.

Gunshi's dependency resolution system detects these cycles and prevents them to ensure a stable plugin initialization order.

### Understanding Circular Dependencies

Circular dependencies create logical paradoxes in the loading order:

- Plugin A requires Plugin B to be loaded first
- Plugin B requires Plugin A to be loaded first
- Neither can be loaded before the other

This situation makes it impossible to determine a valid initialization sequence and indicates architectural issues such as tight coupling and reduced reusability.

### Detection and Prevention

Gunshi automatically detects circular dependencies during the resolution phase and will throw an error:

```js
import { plugin } from 'gunshi/plugin'

// This will fail!
const pluginA = plugin({
  id: 'A',
  dependencies: ['B'],
  setup: ctx => {}
})

const pluginB = plugin({
  id: 'B',
  dependencies: ['A'], // Circular!
  setup: ctx => {}
})

// Circular dependency detected: `a -> b -> a`
```

Circular dependencies can also occur in longer chains:

```js
import { plugin } from 'gunshi/plugin'

// Three-way circular dependency
const pluginX = plugin({
  id: 'X',
  dependencies: ['Y'],
  setup: ctx => {}
})

const pluginY = plugin({
  id: 'Y',
  dependencies: ['Z'],
  setup: ctx => {}
})

const pluginZ = plugin({
  id: 'Z',
  dependencies: ['X'], // Creates cycle: X → Y → Z → X
  setup: ctx => {}
})

// Circular dependency detected: `x -> y -> z -> x`
```

### Resolving Circular Dependencies

The most practical and recommended approach to resolve circular dependencies is to extract common functionality into a separate plugin.

This creates a clean architecture where both plugins can depend on the shared functionality without depending on each other.

When two plugins need to share functionality, extract that functionality into a base plugin that both can depend on:

**Problem: Circular dependency between two plugins**

```js
import { plugin } from 'gunshi/plugin'

// ❌ Circular dependency - This will fail!
const pluginA = plugin({
  id: 'plugin-a',
  dependencies: ['plugin-b'], // A needs B
  extension: ctx => ({
    methodA: () => {
      // Uses B's functionality
      return ctx.extensions['plugin-b'].methodB() + ' from A'
    }
  })
})

const pluginB = plugin({
  id: 'plugin-b',
  dependencies: ['plugin-a'], // B needs A
  extension: ctx => ({
    methodB: () => {
      // Uses A's functionality
      return ctx.extensions['plugin-a'].methodA() + ' from B'
    }
  })
})
// Circular dependency detected: `plugin-a -> plugin-b -> plugin-a`
```

**Solution: Extract shared functionality into a common plugin**

```js
import { plugin, cli } from 'gunshi/plugin'

// ✅ Create a common base plugin with shared functionality
const shared = plugin({
  id: 'shared',
  extension: () => ({
    // Shared state and functionality
    data: { value: 0 },
    increment: function () {
      this.data.value++
    },
    getValue: function () {
      return this.data.value
    }
  })
})

// Plugin A now depends only on shared
const pluginA = plugin({
  id: 'plugin-a',
  dependencies: ['shared'],
  extension: ctx => ({
    methodA: () => {
      ctx.extensions.shared.increment()
      return `A: value is ${ctx.extensions.shared.getValue()}`
    }
  })
})

// Plugin B also depends only on shared
const pluginB = plugin({
  id: 'plugin-b',
  dependencies: ['shared'],
  extension: ctx => ({
    methodB: () => {
      const value = ctx.extensions.shared.getValue()
      return `B: current value is ${value}`
    }
  })
})

// Usage - no circular dependency!
await cli(args, command, {
  plugins: [
    shared, // Loads first
    pluginA, // Loads second (depends on shared)
    pluginB // Loads third (depends on shared)
  ]
})
```

This approach offers several benefits:

1. **Clear dependency hierarchy**: shared → pluginA/pluginB (no cycles)
2. **Single responsibility**: Each plugin has a focused purpose
3. **Reusability**: The shared plugin can be used by other plugins
4. **Testability**: Each plugin can be tested independently
5. **Maintainability**: Changes to shared logic are centralized

## Complete Dependency Resolution Example

Here's a complete example demonstrating dependency resolution order with complex dependencies:

logger plugin:

```js [logger.js]
import { plugin } from 'gunshi/plugin'

// Base plugin with no dependencies
export default plugin({
  id: 'logger',
  setup: ctx => {
    console.log('1. Logger plugin loaded')
  },
  extension: () => ({
    log: msg => console.log(`[LOG] ${msg}`)
  })
})
```

cache plugin:

```js [cache.js]
import { plugin } from 'gunshi/plugin'

// Plugin with one required dependency
export default plugin({
  id: 'cache',
  dependencies: ['logger'],
  setup: ctx => {
    console.log('2. Cache plugin loaded (depends on logger)')
  },
  extension: ctx => ({
    get: key => {
      ctx.extensions.logger.log(`Cache get: ${key}`)
      return null
    }
  })
})
```

auth plugin:

```js [auth.js]
import { plugin } from 'gunshi/plugin'

// Plugin with multiple dependencies
export default plugin({
  id: 'auth',
  dependencies: ['logger', 'cache'],
  setup: ctx => {
    console.log('3. Auth plugin loaded (depends on logger, cache)')
  },
  extension: ctx => ({
    isAuthenticated: () => {
      ctx.extensions.logger.log('Checking authentication')
      ctx.extensions.cache.get('auth-token')
      return true
    }
  })
})
```

metrics plugin:

```js [metrics.js]
import { plugin } from 'gunshi/plugin'

// Plugin with optional dependency
export default plugin({
  id: 'metrics',
  dependencies: ['logger', { id: 'cache', optional: true }],
  setup: ctx => {
    console.log('4. Metrics plugin loaded (depends on logger, optionally cache)')
  },
  extension: ctx => ({
    track: event => {
      ctx.extensions.logger.log(`Tracking: ${event}`)
      // Use cache if available
      if (ctx.extensions.cache) {
        ctx.extensions.cache.get(`metrics:${event}`)
      }
    }
  })
})
```

api plugin:

```js [api.js]
import { plugin } from 'gunshi/plugin'

// Plugin that depends on other dependent plugins
export default plugin({
  id: 'api',
  dependencies: ['auth', 'metrics'],
  setup: ctx => {
    console.log('5. API plugin loaded (depends on auth, metrics)')
  },
  extension: ctx => ({
    request: endpoint => {
      if (ctx.extensions.auth.isAuthenticated()) {
        ctx.extensions.metrics.track(`api:${endpoint}`)
        return { success: true }
      }
      return { success: false }
    }
  })
})
```

Last, install all plugins on CLI application:

```js [cli.js]
import { cli, define } from 'gunshi'
import logger from './logger.js'
import cache from './cache.js'
import auth from './auth.js'
import metrics from './metrics.js'
import api from './api.js'

// Command to demonstrate plugin loading
const command = define({
  name: 'demo',
  run: ctx => {
    console.log('\n=== Command execution starts ===')

    // Use various plugin extensions
    ctx.extensions.logger.log('Command running')
    ctx.extensions.api.request('/users')

    console.log('=== Command execution ends ===')
  }
})

// Run with plugins in random order - Gunshi will resolve correct order
await cli(process.argv.slice(2), command, {
  plugins: [
    // Intentionally provide in wrong order
    api, // Depends on auth, metrics
    auth, // Depends on logger, cache
    metrics, // Depends on logger, optionally cache
    logger, // No dependencies
    cache // Depends on logger
  ]
})
```

Run your application with plugin:

```sh
node cli.js
1. Logger plugin loaded
2. Cache plugin loaded (depends on logger)
3. Auth plugin loaded (depends on logger, cache)
4. Metrics plugin loaded (depends on logger, optionally cache)
5. API plugin loaded (depends on auth, metrics)

=== Command execution starts ===
[LOG] Command running
[LOG] Checking authentication
[LOG] Cache get: auth-token
[LOG] Tracking: api:/users
[LOG] Cache get: metrics:api:/users
=== Command execution ends ===
```

This example demonstrates:

1. **Topological sorting**: Despite plugins being provided in wrong order, Gunshi resolves them correctly
2. **Dependency chain**: `api` → `auth` → `cache` → `logger` shows multi-level dependencies
3. **Optional dependencies**: `metrics` plugin works with or without `cache`
4. **Load order verification**: Setup messages show the actual resolution order
5. **Runtime interaction**: Extensions can access their dependencies safely

## Next Steps

You've learned how to manage plugin dependencies, including topological sorting, optional dependencies, and runtime interaction patterns. This knowledge enables you to build sophisticated plugin ecosystems where plugins collaborate effectively.

Next, dive into [Plugin Decorators](./decorators.md) to learn how plugins can wrap and enhance existing functionality, adding behaviors like authentication, logging, and caching to commands without modifying their core implementation.
