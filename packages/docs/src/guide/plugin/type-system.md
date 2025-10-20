# Plugin Type System

Gunshi's plugin system leverages TypeScript's advanced type system to provide complete type safety.

This guide explains how to create type-safe plugins with proper type definitions.

## Introduction

Gunshi is designed with a **TypeScript-first** philosophy, providing:

- **Type inference** for plugin extensions and dependencies
- **Compile-time validation** of plugin interactions
- **IntelliSense support** throughout development
- **Type-safe plugin communication** between plugins

This guide focuses on TypeScript's type system for plugin development.

## Basic Type Definitions

Every type-safe plugin starts with two fundamental type definitions:

### Plugin ID and Extension Interface

The following code shows how to define and export a plugin's ID and extension interface in a separate types file:

```ts [types.ts]
// Define and export your plugin's types
export const pluginId = 'mycompany:logger' as const
export type PluginId = typeof pluginId

export interface LoggerExtension {
  log: (message: string) => void
  error: (message: string) => void
  warn: (message: string) => void
  debug: (message: string) => void
}
```

**Key principles:**

- Literal types (`as const`) enable TypeScript to track specific plugin IDs
  - Without `as const`, TypeScript widens the type to `string`, losing the specific ID value
  - Literal types allow TypeScript to infer the exact key when accessing `ctx.extensions['mycompany:logger']`
  - This enables autocomplete for available extensions and compile-time validation of plugin ID references
- Exported types allow other plugins and commands to reference your plugin
- Well-defined interfaces provide IntelliSense and compile-time validation

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!TIP]
> Plugin consumers can use these exported interfaces to type their command context's extensions, enabling type-safe access to plugin functionality in their command runners. For detailed usage patterns of type-safe command definitions with plugin extensions, see [Advanced Type System](../advanced/type-system.md).

<!-- eslint-enable markdown/no-missing-label-refs -->

## The `plugin` Function Type Parameters

The `plugin` function uses TypeScript's generics to ensure complete type safety through four type parameters:

```ts
plugin<
  DependencyExtensions, // Extensions from dependencies
  PluginId, // Literal plugin ID
  Dependencies, // Dependency array type
  Extension // This plugin's extension type
>(options)
```

Each parameter serves a specific purpose:

- **DependencyExtensions**: Types of extensions this plugin depends on
- **PluginId**: The literal type of this plugin's ID
- **Dependencies**: The literal type of the dependencies array
- **Extension**: The type of extension this plugin provides

### Why These Type Parameters Are Necessary

While TypeScript can infer some types automatically, explicitly specifying all four type parameters provides several critical benefits:

1. **Complete Type Safety**: Ensures that dependency access in your extension is fully typed
2. **Compile-time Validation**: Catches plugin ID mismatches and missing dependencies before runtime
3. **Better IntelliSense**: Provides accurate autocompletion for `ctx.extensions` access
4. **Clear API Contracts**: Makes plugin dependencies and provided extensions explicit

### What Happens When Type Parameters Are Omitted

If you omit type parameters, TypeScript falls back to default or inferred types:

```ts
import { plugin } from 'gunshi/plugin'

// Without type parameters - loses type safety
const plugin1 = plugin({
  id: 'my-plugin',
  dependencies: ['other-plugin'],
  extension: ctx => ({
    method: () => {
      // ctx.extensions['other-plugin'] is typed as 'any'
      const other = ctx.extensions['other-plugin'] // No type checking!
      return other.someMethod() // No IntelliSense, no error if method doesn't exist
    }
  })
})

// With type parameters - full type safety
const plugin2 = plugin<
  { 'other-plugin': OtherExtension },
  'my-plugin',
  ['other-plugin'],
  MyExtension
>({
  id: 'my-plugin',
  dependencies: ['other-plugin'],
  extension: ctx => ({
    method: () => {
      // ctx.extensions['other-plugin'] is typed as OtherExtension
      const other = ctx.extensions['other-plugin'] // Fully typed!
      return other.someMethod() // IntelliSense works, compile error if method doesn't exist
    }
  })
})
```

Without explicit type parameters:

- Dependencies are not type-checked against actual usage
- Extension access returns `any` type, losing all type safety
- Plugin IDs are treated as generic strings rather than literal types
- No compile-time validation of plugin interactions

## Progressive Type Safety Examples

Let's explore these type parameters through increasingly complex examples:

### 1. Simple Plugin (No Dependencies)

This example demonstrates a basic plugin without any dependencies, using only the essential type parameters:

```ts
import { plugin } from 'gunshi/plugin'
import { pluginId } from './types.ts'

import type { PluginId, LoggerExtension } from './types.ts'

export default function logger() {
  return plugin<{}, PluginId, [], LoggerExtension>({
    id: pluginId,
    name: 'Logger Plugin',

    extension: (): LoggerExtension => ({
      log: msg => console.log(`[LOG] ${msg}`),
      error: msg => console.error(`[ERROR] ${msg}`),
      warn: msg => console.warn(`[WARN] ${msg}`),
      debug: msg => console.debug(`[DEBUG] ${msg}`)
    })
  })
}
```

### 2. Plugin with Dependencies

This example shows how to declare and use dependencies with proper type definitions:

```ts [api.ts]
import { plugin } from 'gunshi/plugin'
import { pluginId as loggerId } from '@mycompany/plugin-logger'
import { pluginId as authId } from '@mycompany/plugin-auth'

import type { LoggerExtension } from '@mycompany/plugin-logger'
import type { AuthExtension } from '@mycompany/plugin-auth'

export const pluginId = 'mycompany:api' as const
export type PluginId = typeof pluginId

export interface ApiExtension {
  get: <T = unknown>(endpoint: string) => Promise<T>
  post: <T = unknown>(endpoint: string, data: unknown) => Promise<T>
}

// Define dependency types using object notation
type DependencyExtensions = {
  [loggerId]: LoggerExtension
  [authId]: AuthExtension
}

// Define dependencies array
const dependencies = [loggerId, authId] as const
type Dependencies = typeof dependencies

export default function api() {
  return plugin<DependencyExtensions, PluginId, Dependencies, ApiExtension>({
    id: pluginId,
    dependencies,

    extension: ctx => {
      const logger = ctx.extensions[loggerId] // Fully typed!
      const auth = ctx.extensions[authId] // Fully typed!

      return {
        get: async endpoint => {
          logger.log(`GET ${endpoint}`)
          const token = auth.getToken()
          // Implementation...
        },
        post: async (endpoint, data) => {
          logger.log(`POST ${endpoint}`)
          // Implementation...
        }
      }
    }
  })
}
```

### 3. Plugin with Optional Dependencies

Gunshi supports both required and optional plugin dependencies with full type safety.

The following example shows how to define both required and optional dependencies with their corresponding TypeScript types:

```ts [metrics.ts]
import { plugin } from 'gunshi/plugin'
import { pluginId as loggerId } from './logger.ts'
import { pluginId as cacheId } from './cache.ts'

import type { LoggerExtension } from './logger.ts'
import type { CacheExtension } from './cache.ts'

// Type definition: cache is optional
type DependencyExtensions = {
  [loggerId]: LoggerExtension
  [cacheId]?: CacheExtension // Optional with ?
}

// Runtime declaration: must match types
const dependencies = [
  loggerId, // Required
  { id: cacheId, optional: true } // Optional
] as const

export const pluginId = 'mycompany:metrics' as const
export type PluginId = typeof pluginId

export interface MetricsExtension {
  // ...
}

export default function metrics() {
  return plugin<DependencyExtensions, typeof pluginId, typeof dependencies, MetricsExtension>({
    id: pluginId,
    dependencies,

    extension: ctx => {
      const logger = ctx.extensions[loggerId] // Always defined
      const cache = ctx.extensions[cacheId] // Possibly undefined

      return {
        track: (event: string) => {
          logger.log(`Event: ${event}`)

          // Safe optional access
          if (cache) {
            cache.set(`event:${event}`, Date.now())
          }
        }
      }
    }
  })
}
```

### 4. Dependency Chain

Plugins can depend on other plugins that have their own dependencies.

This example demonstrates a three-level dependency chain where each plugin builds on the previous ones:

```ts [base.ts]
// No dependencies
export const baseId = 'base' as const
export interface BaseExtension {
  getConfig: () => Config
}
```

```ts [logger.ts]
import { plugin } from 'gunshi/plugin'
import { baseId } from './base.ts'

import type { BaseExtension } from './base.ts'

// Depends on base
export const loggerId = 'logger' as const
export interface LoggerExtension {
  log: (msg: string) => void
}

const loggerDeps = [baseId] as const

export default plugin<
  { [baseId]: BaseExtension },
  typeof loggerId,
  typeof loggerDeps,
  LoggerExtension
>({
  id: loggerId,
  dependencies: loggerDeps,
  extension: ctx => {
    const config = ctx.extensions[baseId].getConfig()
    return {
      log: msg => {
        if (config.verbose) console.log(msg)
      }
    }
  }
})
```

```ts [api.ts]
import { plugin } from 'gunshi/plugin'
import { baseId } from './base.ts'
import { loggerId } from './logger.ts'

import type { BaseExtension } from './base.ts'
import type { LoggerExtension } from './logger.ts'

export const apiId = 'api' as const

export interface ApiExtension {
  request: (url: string) => Promise<void> | void
}

// Depends on both
const apiDeps = [baseId, loggerId] as const

export default plugin<
  {
    [baseId]: BaseExtension
    [loggerId]: LoggerExtension
  },
  typeof apiId,
  typeof apiDeps,
  ApiExtension
>({
  id: apiId,
  dependencies: apiDeps,
  extension: ctx => {
    const logger = ctx.extensions[loggerId]
    const config = ctx.extensions[baseId].getConfig()

    return {
      request: async (url: string) => {
        logger.log(`API Request: ${url}`)
        // Implementation...
      }
    }
  }
})
```

## Complete Example

This example demonstrates all concepts together: type definitions, all four type parameters, and dependency management.

The following code shows a production-ready API plugin with proper type exports, dependency handling, and complete implementation:

```ts [types.ts]
// Type definitions for the API plugin
export const pluginId = 'mycompany:api' as const
export type PluginId = typeof pluginId

export interface ApiExtension {
  get: <T = unknown>(endpoint: string) => Promise<T>
  post: <T = unknown>(endpoint: string, data: unknown) => Promise<T>
  delete: (endpoint: string) => Promise<void>
}
```

```ts [api.ts]
import { plugin } from 'gunshi/plugin'
import { pluginId } from './types.ts'
import { pluginId as loggerId } from './logger.ts'
import { pluginId as authId } from './auth.ts'

import type { PluginId, ApiExtension } from './types.ts'
import type { LoggerExtension } from './logger.ts'
import type { AuthExtension } from './auth.ts'

// Re-export for consumers
export * from './types.ts'

// Define dependency types
type DependencyExtensions = {
  [loggerId]: LoggerExtension // Required
  [authId]: AuthExtension // Required
}

// Define dependencies array
const dependencies = [loggerId, authId] as const
type Dependencies = typeof dependencies

// Export the plugin factory
export default function api(baseUrl: string) {
  return plugin<DependencyExtensions, PluginId, Dependencies, ApiExtension>({
    id: pluginId,
    name: 'API Plugin',
    dependencies,

    extension: ctx => {
      const logger = ctx.extensions[loggerId]
      const auth = ctx.extensions[authId]

      async function request<T = unknown>(
        method: string,
        endpoint: string,
        data?: Record<string, unknown>
      ) {
        const url = `${baseUrl}${endpoint}`

        // Make request
        logger.log(`${method} ${url}`)
        const token = auth.getToken()

        // Simulate API call (replace with actual fetch in production)
        const result = await simulateApiCall(method, endpoint, data || {}, token)

        return result as T
      }

      return {
        get: endpoint => request('GET', endpoint),
        post: (endpoint, data) => request('POST', endpoint, data),
        delete: async endpoint => {
          await request('DELETE', endpoint)
        }
      }
    }
  })
}
```

Usage in your CLI application:

```ts [cli.ts]
import { cli, define } from 'gunshi'
import api, { pluginId as apiId } from './api.ts'
import auth from './auth.ts'
import logger from './logger.ts'

import type { Args, GunshiParams } from 'gunshi'
import type { ApiExtension } from './api.ts'

const fetchArgs = {
  endpoint: {
    type: 'string',
    required: true,
    description: 'API endpoint to fetch'
  }
} as const satisfies Args

// Define a command that uses the API plugin
const fetchCommand = define<
  GunshiParams<{
    args: typeof fetchArgs
    extensions: { [apiId]: ApiExtension }
  }>
>({
  name: 'fetch',
  description: 'Fetch data from API',
  args: fetchArgs,
  run: async ctx => {
    const api = ctx.extensions[apiId]
    const data = await api.get(ctx.values.endpoint)
    console.log(JSON.stringify(data, null, 2))
  }
})

// Configure and run CLI
await cli(process.argv.slice(2), fetchCommand, {
  name: 'my-cli',
  version: '1.0.0',
  plugins: [
    // Dependencies must be registered first
    logger(),
    auth({ token: process.env.API_TOKEN }),
    api('https://api.example.com')
  ]
})
```

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!TIP]
> The example fully code is [here](https://github.com/kazupon/gunshi/tree/main/playground/plugins/type-system).

<!-- eslint-enable markdown/no-missing-label-refs -->

When executed, the plugins work together seamlessly:

```sh
API_TOKEN=xxx npx tsx cli.ts fetch --endpoint /users
my-cli (my-cli v1.0.0)

[LOG] GET https://api.example.com/users
[
  {
    "id": 1,
    "name": "Alice"
  },
  {
    "id": 2,
    "name": "Bob"
  }
]

API_TOKEN=xxx npx tsx cli.ts fetch --endpoint /users/1
my-cli (my-cli v1.0.0)

[LOG] GET https://api.example.com/users/1
{
  "id": 1,
  "name": "Alice"
}
```

## Next Steps

With a strong foundation in type-safe plugin development, you've learned how to create plugins that provide compile-time guarantees and excellent developer experience through TypeScript's type system.

Before sharing your plugins with others, it's crucial to ensure they work correctly. The next chapter, [Plugin Testing](./testing.md), will guide you through comprehensive testing strategies for plugins, including unit tests, integration tests, and testing plugin interactions.
