# Type System

Gunshi v0.27 introduces a comprehensive type system that provides full TypeScript support across all core functions: `define`, `lazy`, `cli`, and `plugin`. This enhanced type system ensures type safety for command arguments, plugin extensions, and their interactions throughout your CLI application.

## Overview of v0.27 Type System Improvements

The v0.27 release brings significant enhancements to type safety:

1. **Unified Type Parameters**: All core functions now accept flexible type parameters for both arguments and extensions
2. **Multiple Overloads**: Each function provides specialized overloads for different use cases
3. **Automatic Type Inference**: TypeScript automatically infers types from your configurations
4. **Plugin Extension Support**: Full type safety for plugin-provided functionality
5. **Composable Types**: Easy composition of multiple plugin extensions

## Understanding GunshiParams

The `GunshiParams` interface is the foundation of Gunshi's type system:

```ts
interface GunshiParams<P = { args: Args; extensions: {} }> {
  args: P extends { args: infer A extends Args } ? A : Args
  extensions: P extends { extensions: infer E extends ExtendContext } ? E : {}
}
```

This unified interface enables:

- Type-safe command definitions with argument validation
- Plugin extension type inference and composition
- Compile-time validation of command arguments
- Seamless integration with TypeScript's type system

## The `define` Function

The `define` function creates type-safe command definitions with three flexible type parameter patterns:

### Type Parameter Overloads

```ts
// 1. Arguments-only type parameter
define<A extends Args>(definition: Command<{ args: A; extensions: {} }>)

// 2. Extensions-only type parameter
define<E extends ExtendContext>(definition: Command<{ args: Args; extensions: E }>)

// 3. Full GunshiParams type parameter
define<G extends GunshiParamsConstraint>(definition: Command<G>)
```

### Pattern 1: Defining Arguments Only

When you only need to define command arguments without plugin extensions:

```ts
import { define } from 'gunshi'

// Let TypeScript infer the argument types
const basicCommand = define({
  name: 'convert',
  args: {
    input: { type: 'string', required: true },
    format: { type: 'enum', choices: ['json', 'yaml', 'toml'], default: 'json' },
    pretty: { type: 'boolean', default: false }
  },
  run: ctx => {
    // Types are automatically inferred:
    // input: string
    // format: 'json' | 'yaml' | 'toml'
    // pretty: boolean
    console.log(`Converting ${ctx.values.input} to ${ctx.values.format}`)
  }
})

// Or explicitly specify argument types for stricter control
import type { Args } from 'gunshi'

const strictArgs = {
  port: { type: 'number', required: true },
  host: { type: 'string', default: 'localhost' }
} as const satisfies Args

const strictCommand = define<typeof strictArgs>({
  name: 'server',
  args: strictArgs,
  run: ctx => {
    // TypeScript knows exact types from strictArgs
    console.log(`Server running on ${ctx.values.host}:${ctx.values.port}`)
  }
})
```

### Pattern 2: Defining with Plugin Extensions

When your command requires plugin functionality:

```ts
import { define } from 'gunshi'
import type { DatabaseExtension, PluginId as DbId } from '@company/plugin-database'
import type { LoggerExtension, PluginId as LogId } from '@company/plugin-logger'

// Define extension requirements
type RequiredExtensions = Record<DbId, DatabaseExtension> & Record<LogId, LoggerExtension>

const dataCommand = define<RequiredExtensions>({
  name: 'migrate',
  args: {
    version: { type: 'string', required: true },
    dryRun: { type: 'boolean', default: false }
  },
  run: async ctx => {
    const db = ctx.extensions['company:database']
    const logger = ctx.extensions['company:logger']

    // Both extensions are fully typed
    logger?.info(`Starting migration to version ${ctx.values.version}`)

    if (!ctx.values.dryRun) {
      await db?.migrate(ctx.values.version)
    }
  }
})
```

### Pattern 3: Full GunshiParams Control

For maximum control over both arguments and extensions:

```ts
import { define } from 'gunshi'
import type { GunshiParams } from 'gunshi'

// Define complete parameter structure
type AppParams = GunshiParams<{
  args: {
    config: { type: 'string'; required: true }
    verbose: { type: 'boolean' }
  }
  extensions: {
    'app:config': ConfigExtension
    'app:logger': LoggerExtension
  }
}>

const appCommand = define<AppParams>({
  name: 'app',
  args: {
    config: { type: 'string', required: true },
    verbose: { type: 'boolean' }
  },
  run: ctx => {
    // Full type safety for both args and extensions
    const config = ctx.extensions['app:config']
    if (ctx.values.verbose) {
      ctx.extensions['app:logger']?.setLevel('debug')
    }
    config?.load(ctx.values.config)
  }
})
```

## The `lazy` Function

The `lazy` function provides the same type safety as `define` with deferred loading for better performance. It shares the same type parameter patterns:

### Type Parameter Overloads

```ts
// 1. Arguments-only type parameter
lazy<A extends Args>(
  loader: CommandLoader<{ args: A; extensions: {} }>,
  definition?: Command<{ args: A; extensions: {} }>
)

// 2. Extensions-only type parameter
lazy<E extends ExtendContext>(
  loader: CommandLoader<{ args: Args; extensions: E }>,
  definition?: Command<{ args: Args; extensions: E }>
)

// 3. Full GunshiParams type parameter
lazy<G extends GunshiParamsConstraint>(
  loader: CommandLoader<G>,
  definition?: Command<G>
)
```

### Pattern 1: Basic Lazy Loading

Defer command loading until it's actually needed:

```ts
import { lazy } from 'gunshi'

// Simple lazy loading without type parameters
const lazyBuildCommand = lazy(async () => {
  const { buildCommand } = await import('./commands/build')
  return buildCommand
})

// With explicit argument types
const lazyDeployCommand = lazy<{
  environment: { type: 'string'; required: true }
  dryRun: { type: 'boolean' }
}>(async () => {
  const { deployCommand } = await import('./commands/deploy')
  return deployCommand
})
```

### Pattern 2: Lazy Loading with Metadata

Provide command metadata for help display without loading the full command:

```ts
import { lazy } from 'gunshi'
import type { Args } from 'gunshi'

const buildArgs = {
  target: { type: 'enum', choices: ['development', 'production'], default: 'development' },
  watch: { type: 'boolean', description: 'Watch for changes' }
} as const satisfies Args

const lazyBuildWithMeta = lazy<typeof buildArgs>(
  async () => {
    const { buildCommand } = await import('./commands/build')
    return buildCommand
  },
  {
    // Metadata available without loading the command
    name: 'build',
    description: 'Build the project',
    args: buildArgs,
    examples: 'Build for production:\n$ cli build --target production'
  }
)
```

### Pattern 3: Lazy Loading with Plugin Extensions

Type-safe lazy loading for commands that require plugins:

```ts
import { lazy } from 'gunshi'
import type { DatabaseExtension, PluginId as DbId } from '@company/plugin-database'
import type { CacheExtension, PluginId as CacheId } from '@company/plugin-cache'

type DataExtensions = Record<DbId, DatabaseExtension> & Record<CacheId, CacheExtension>

const lazyDataCommand = lazy<DataExtensions>(
  async () => {
    // Heavy command implementation loaded on demand
    const { dataProcessingCommand } = await import('./commands/data-processing')
    return dataProcessingCommand
  },
  {
    name: 'process-data',
    description: 'Process large datasets',
    args: {
      dataset: { type: 'string', required: true },
      useCache: { type: 'boolean', default: true }
    }
  }
)

// The loaded command will have full type safety
// for both arguments and extensions
```

## Complex Argument Types

Gunshi supports various argument types with full type inference:

```ts
import { define } from 'gunshi'

const command = define({
  name: 'config',
  args: {
    // String argument
    name: {
      type: 'string',
      required: true
    },
    // Number argument
    timeout: {
      type: 'number',
      default: 5000
    },
    // Boolean argument
    verbose: {
      type: 'boolean',
      negatable: true // Allows --no-verbose
    },
    // String array
    tags: {
      type: 'string',
      multiple: true // string[]
    },
    // Number array
    ports: {
      type: 'number',
      multiple: true // number[]
    },
    // Positional argument
    files: {
      type: 'string',
      positional: true,
      multiple: true
    }
  },
  run: ctx => {
    // All types are correctly inferred
    const name: string = ctx.values.name
    const timeout: number = ctx.values.timeout
    const verbose: boolean | undefined = ctx.values.verbose
    const tags: string[] | undefined = ctx.values.tags
    const ports: number[] | undefined = ctx.values.ports
    const files: string[] | undefined = ctx.values.files
  }
})
```

## The `plugin` Function

The `plugin` function creates type-safe plugins with complex type parameters for dependencies and extensions:

### Type Parameter Signature

```ts
plugin<
  Context extends ExtendContext,     // Dependency extensions context
  Id extends string,                  // Plugin ID literal type
  Deps extends ReadonlyArray<...>,    // Dependencies array
  Extension extends {},                // Extension type this plugin provides
  ResolvedDepExtensions,               // Resolved dependency extensions
  PluginExt,                          // Plugin extension function type
  MergedExtensions                    // Final merged extensions
>(options: PluginOptions)
```

### Pattern 1: Simple Plugin without Dependencies

Create a basic plugin that provides functionality:

```ts
import { plugin } from 'gunshi/plugin'

// Define the extension interface
export interface LoggerExtension {
  info: (message: string) => void
  error: (message: string, error?: Error) => void
  setLevel: (level: 'debug' | 'info' | 'warn' | 'error') => void
}

// Export plugin ID for type safety
export const pluginId = 'company:logger' as const
export type PluginId = typeof pluginId

// Create the plugin function
export default function logger(config = { level: 'info' }) {
  return plugin<
    {}, // No dependency extensions
    PluginId, // Plugin ID type
    [], // No dependencies
    LoggerExtension // Extension type
  >({
    id: pluginId,
    name: 'Logger Plugin',

    // Provide the extension
    extension: (ctx, cmd) => {
      let currentLevel = config.level

      return {
        info: (message: string) => {
          if (shouldLog('info', currentLevel)) {
            console.log(`[INFO] ${message}`)
          }
        },
        error: (message: string, error?: Error) => {
          console.error(`[ERROR] ${message}`, error)
        },
        setLevel: level => {
          currentLevel = level
        }
      }
    },

    // Optional: setup function
    setup: ctx => {
      console.log('Logger plugin initialized')
    }
  })
}
```

### Pattern 2: Plugin with Dependencies

Create a plugin that depends on other plugins:

```ts
import { plugin } from 'gunshi/plugin'
import type { LoggerExtension, PluginId as LoggerId } from '@company/plugin-logger'
import type { ConfigExtension, PluginId as ConfigId } from '@company/plugin-config'

export interface MetricsExtension {
  track: (event: string, properties?: Record<string, any>) => void
  startTimer: () => () => number
  flush: () => Promise<void>
}

export const pluginId = 'company:metrics' as const
export type PluginId = typeof pluginId

// Define dependency context
type DependencyContext = Record<LoggerId, LoggerExtension> & Record<ConfigId, ConfigExtension>

export default function metrics() {
  return plugin<
    DependencyContext, // Dependencies required
    PluginId,
    [LoggerId, ConfigId], // Dependency IDs
    MetricsExtension // Extension provided
  >({
    id: pluginId,
    name: 'Metrics Plugin',

    // Declare dependencies
    dependencies: ['company:logger', 'company:config'],

    // Extension can access dependencies through context
    extension: async (ctx, cmd) => {
      // Access dependency extensions (type-safe)
      const logger = ctx.extensions['company:logger']
      const config = ctx.extensions['company:config']

      const endpoint = await config?.get('metrics.endpoint')
      logger?.info(`Metrics endpoint: ${endpoint}`)

      const events: any[] = []

      return {
        track: (event, properties) => {
          events.push({ event, properties, timestamp: Date.now() })
          logger?.info(`Tracked event: ${event}`)
        },

        startTimer: () => {
          const start = Date.now()
          return () => Date.now() - start
        },

        flush: async () => {
          // Send events to metrics service
          await fetch(endpoint, {
            method: 'POST',
            body: JSON.stringify(events)
          })
          events.length = 0
        }
      }
    }
  })
}
```

### Pattern 3: Plugin with Optional Dependencies

Handle optional plugin dependencies:

```ts
import { plugin } from 'gunshi/plugin'
import type { CacheExtension, PluginId as CacheId } from '@company/plugin-cache'

export interface DatabaseExtension {
  query: <T>(sql: string) => Promise<T[]>
  execute: (sql: string) => Promise<void>
  transaction: <T>(fn: () => Promise<T>) => Promise<T>
}

export const pluginId = 'company:database' as const
export type PluginId = typeof pluginId

type OptionalDeps = Record<CacheId, CacheExtension | undefined>

export default function database(config: { connectionString: string }) {
  return (
    plugin < OptionalDeps,
    PluginId,
    [{ id: 'company:cache' as CacheId, optional: true }],
    DatabaseExtension >
      {
        id: pluginId,
        name: 'Database Plugin',

        // Optional dependency
        dependencies: [{ id: 'company:cache', optional: true }],

        extension: async (ctx, cmd) => {
          // Cache might be undefined if not installed
          const cache = ctx.extensions['company:cache']

          const connection = await createConnection(config.connectionString)

          return {
            query: async <T>(sql: string) => {
              // Use cache if available
              if (cache) {
                const cached = await cache.get<T[]>(sql)
                if (cached) return cached
              }

              const result = await connection.query<T>(sql)

              // Cache the result if cache is available
              if (cache) {
                await cache.set(sql, result, 300) // 5 minutes
              }

              return result
            },

            execute: async (sql: string) => {
              await connection.execute(sql)
              // Invalidate cache if available
              if (cache) {
                await cache.clear()
              }
            },

            transaction: async <T>(fn: () => Promise<T>) => {
              return connection.transaction(fn)
            }
          }
        }
      }
  )
}
```

### Pattern 4: Plugin with Extension Callback

Use the `onExtension` callback for initialization after extensions are created:

```ts
import { plugin } from 'gunshi/plugin'

export interface FeatureExtension {
  isEnabled: (feature: string) => boolean
  toggle: (feature: string, enabled: boolean) => void
}

export const pluginId = 'company:features' as const
export type PluginId = typeof pluginId

export default function features() {
  return plugin<{}, PluginId, [], FeatureExtension>({
    id: pluginId,
    name: 'Feature Flags',

    extension: (ctx, cmd) => {
      const flags = new Map<string, boolean>()

      return {
        isEnabled: feature => flags.get(feature) ?? false,
        toggle: (feature, enabled) => flags.set(feature, enabled)
      }
    },

    // Called after extension is created and available
    onExtension: async (ctx, cmd) => {
      const features = ctx.extensions[pluginId]

      // Initialize default features
      features?.toggle('new-ui', true)
      features?.toggle('beta-features', false)

      console.log('Feature flags initialized')
    }
  })
}
```

## Explicit Argument Tracking

The type system tracks which arguments were explicitly provided:

```ts
const command = define({
  name: 'build',
  args: {
    output: {
      type: 'string',
      default: 'dist'
    },
    minify: {
      type: 'boolean',
      default: false
    }
  },
  run: ctx => {
    // Check if arguments were explicitly provided
    if (ctx.explicit.output) {
      console.log(`Output explicitly set to: ${ctx.values.output}`)
    } else {
      console.log(`Using default output: ${ctx.values.output}`)
    }

    // Type of ctx.explicit matches ctx.values structure
    const explicitMinify: boolean = ctx.explicit.minify
  }
})
```

## Next Steps

- Learn about [Command Hooks](./command-hooks.md) for lifecycle management
- Explore [Rendering Customization](./rendering-customization.md) for UI control
- See [Plugin Development](/guide/plugin/types.md) for plugin-specific type patterns
