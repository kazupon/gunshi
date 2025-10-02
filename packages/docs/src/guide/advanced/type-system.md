# Type System

Gunshi v0.27 introduces a powerful type parameter system that provides comprehensive type safety across all core functions: `cli`, `define`, `lazy`, and `plugin`.

This enhancement brings TypeScript's full type-checking capabilities to your CLI applications, ensuring compile-time safety for command arguments and plugin extensions.

This guide focuses on type safety for command definitions and their arguments. If you're creating custom plugins and need to understand the `plugin` function's type system, refer to the [Plugin Type System](../plugin/type-system.md) guide.

## Overview of v0.27 Type System

The v0.27 release provides comprehensive type safety through:

- **Core Functions**: `define` and `lazy` provide excellent type inference for standard commands
- **Plugin Extension Support**: `defineWithTypes` and `lazyWithTypes` enable type declarations for plugin extensions
- **Unified Type System (GunshiParams)**: A coherent type system for arguments and extensions
- **CLI Entry Point Types**: Type parameters for the `cli` function's entry command
- **Enhanced TypeScript Inference**: Automatic type inference reduces boilerplate while maintaining safety

## Understanding `GunshiParams`

`GunshiParams` is the core type that unifies type safety for command arguments and plugin extensions. At its simplest, it ensures that your command context has properly typed `values` (from args) and `extensions` (from plugins).

Before diving into the implementation details, let's start with a simple example that demonstrates how `GunshiParams` provides type safety for command arguments:

```ts
// Simple usage - just arguments
type SimpleParams = GunshiParams<{
  args: { port: { type: 'number' } }
}>

// With extensions from plugins
type FullParams = GunshiParams<{
  args: { port: { type: 'number' } }
  extensions: { logger: Logger }
}>
```

The actual type definition uses TypeScript's conditional types to provide flexibility:

```ts
interface GunshiParams<
  P extends {
    args?: Args
    extensions?: ExtendContext
  } = {
    args: Args
    extensions: {}
  }
> {
  args: P extends { args: infer A extends Args } ? A : Args
  extensions: P extends { extensions: infer E extends ExtendContext } ? E : {}
}
```

## Core Functions: `define` and `lazy`

### The `define` Function

The `define` function is the primary way to create commands in Gunshi. It provides excellent type inference for command arguments without requiring any explicit type parameters:

```ts
import { define } from 'gunshi'

// Standard command definition with automatic type inference
const serverCommand = define({
  name: 'server',
  description: 'Start the development server',
  args: {
    port: { type: 'number', default: 3000 },
    host: { type: 'string', default: 'localhost' },
    verbose: { type: 'boolean', short: 'v' }
  },
  run: ctx => {
    // ctx.values is automatically inferred as { port?: number; host?: string; verbose?: boolean }
    const { port, host, verbose } = ctx.values

    console.log(`Starting server on ${host}:${port}`)
    if (verbose) {
      console.log('Verbose mode enabled')
    }
  }
})
```

#### Advanced Usage with Type Parameters

When you need explicit type control, `define` also accepts a `GunshiParams` type parameter:

```ts
import { define, type GunshiParams } from 'gunshi'

// Define args separately
const serverArgs = {
  port: { type: 'number' as const, default: 3000 },
  host: { type: 'string' as const, default: 'localhost' }
} as const

// Use type parameter for explicit type control
type ServerParams = GunshiParams<{ args: typeof serverArgs }>

const serverCommand = define<ServerParams>({
  name: 'server',
  args: serverArgs,
  run: ctx => {
    // ctx.values is typed based on ServerParams
    console.log(`Server: ${ctx.values.host}:${ctx.values.port}`)
  }
})
```

### The `lazy` Function

The `lazy` function enables code-splitting while maintaining type safety. Like `define`, it provides automatic type inference for arguments:

```ts
import { lazy } from 'gunshi'

// Lazy-loaded command with automatic type inference
const buildCommand = lazy(
  async () => {
    // Heavy dependencies can be loaded here when needed
    const { buildProject } = await import('./build-utils')

    return async ctx => {
      // ctx.values is automatically inferred from args definition below
      const { target, minify } = ctx.values

      console.log(`Building for ${target}...`)
      if (minify) {
        console.log('Minification enabled')
      }

      return buildProject({ target, minify })
    }
  },
  {
    name: 'build',
    description: 'Build the project',
    args: {
      target: { type: 'string', required: true, choices: ['dev', 'prod'] },
      minify: { type: 'boolean', default: false }
    }
  }
)
```

#### Advanced Usage with Type Parameters

For explicit type control with lazy loading:

```ts
import { lazy, type GunshiParams, type CommandRunner } from 'gunshi'

const buildArgs = {
  target: { type: 'string' as const, required: true },
  minify: { type: 'boolean' as const, default: false }
} as const

type BuildParams = GunshiParams<{ args: typeof buildArgs }>

const buildCommand = lazy<BuildParams>(
  async () => {
    const runner: CommandRunner<BuildParams> = async ctx => {
      const { target, minify } = ctx.values
      // Implementation
      return { success: true, target }
    }
    return runner
  },
  {
    name: 'build',
    args: buildArgs
  }
)
```

## Plugin Extensions and Architectural Constraints

### Understanding the Timing Constraint

Gunshi's architecture intentionally separates command definition from plugin installation:

1. **Command Definition Time**: When you call `define()` or `lazy()` in your code, plugins haven't been installed yet
2. **CLI Execution Time**: When `cli()` runs, plugins are installed and extensions become available
3. **The Gap**: Commands can't know what extensions will be available at definition time

This architectural design enables flexible command configuration but creates a challenge: how can commands safely use plugin extensions that don't exist yet?

### The Solution: Type Declaration Functions

`defineWithTypes` and `lazyWithTypes` solve this by allowing you to declare expected extensions at command definition time. These functions provide type safety for plugin extensions that will be available when the command actually runs.

This separation is crucial because:

- It maintains modularity - commands don't depend on specific plugin implementations
- It allows flexible plugin configuration - different CLI instances can use different plugins
- It enables type safety - TypeScript knows what extensions to expect even though they're not yet available

## Functions for Plugin Extensions: `defineWithTypes` and `lazyWithTypes`

When your command needs to use plugin extensions, use these specialized functions that allow you to declare expected extension types.

### The `defineWithTypes` Function

Use `defineWithTypes` when your command needs plugin extensions. It uses a currying approach where you specify the extensions type, and args are automatically inferred:

```ts
import { defineWithTypes } from 'gunshi'

// Define your extensions type
type ServerExtensions = {
  logger: {
    log: (msg: string) => void
    error: (msg: string) => void
  }
  auth: {
    isAuthenticated: () => boolean
    getUser: () => { id: string; name: string }
  }
}

// Use defineWithTypes - specify only extensions, args are inferred!
const serverCommand = defineWithTypes<{ extensions: ServerExtensions }>()({
  name: 'server',
  description: 'Start the development server',
  args: {
    port: { type: 'number', default: 3000 },
    host: { type: 'string', default: 'localhost' },
    verbose: { type: 'boolean', short: 'v' }
  },
  run: ctx => {
    // ctx.values is automatically inferred as { port?: number; host?: string; verbose?: boolean }
    const { port, host, verbose } = ctx.values

    // ctx.extensions is typed as ServerExtensions
    // Optional chaining (?.) is used because plugins may not be installed
    if (!ctx.extensions.auth?.isAuthenticated()) {
      ctx.extensions.logger?.error('Authentication required')
      throw new Error('Please login first')
    }

    const user = ctx.extensions.auth.getUser()
    ctx.extensions.logger?.log(`Server started by ${user.name} on ${host}:${port}`)

    if (verbose) {
      ctx.extensions.logger?.log('Verbose mode enabled')
    }
  }
})
```

#### Flexible Type Parameters

`defineWithTypes` supports multiple scenarios for different use cases:

```ts
// Case 1: Extensions only (most common)
// You want to use plugin extensions in your CommandRunner implementation.
// Args are automatically inferred from the inline definition
const cmd1 = defineWithTypes<{ extensions: MyExtensions }>()({
  name: 'server',
  args: { port: { type: 'number' } }, // args types are inferred
  run: ctx => {
    // ctx.extensions is typed, ctx.values is inferred from args
    /* ... */
  }
})

// Case 2: Args only (when using pre-defined args)
// Your args are defined in a variable, not inline in the define function.
// Pre-defined args variables need explicit type specification for proper inference
const myArgs = {
  port: { type: 'number' as const },
  host: { type: 'string' as const }
} as const

const cmd2 = defineWithTypes<{ args: typeof myArgs }>()({
  name: 'process',
  args: myArgs, // Using pre-defined args variable
  run: ctx => {
    // ctx.values is typed based on myArgs
    /* ... */
  }
})

// Case 3: Both args and extensions (special case)
// You need plugin extensions AND you're using pre-defined args variables
const cmd3 = defineWithTypes<{
  args: typeof myArgs
  extensions: MyExtensions
}>()({
  name: 'hybrid',
  args: myArgs, // Using pre-defined args variable
  run: ctx => {
    // Both ctx.values and ctx.extensions are typed
    /* ... */
  }
})
```

### The `lazyWithTypes` Function

The `lazyWithTypes` function maintains type safety for lazy-loaded commands that use plugin extensions:

```ts
import { lazyWithTypes } from 'gunshi'
import type { CommandRunner } from 'gunshi'

// Define extensions for the command
type BuildExtensions = {
  logger: {
    log: (msg: string) => void
    warn: (msg: string) => void
  }
}

// Use lazyWithTypes with extensions - args are automatically inferred
const lazyBuildCommand = lazyWithTypes<{ extensions: BuildExtensions }>()(
  async () => {
    // Heavy dependencies can be loaded here when needed
    const runner: CommandRunner<{ extensions: BuildExtensions }> = async ctx => {
      // ctx.values is automatically inferred from args definition below
      const { target, minify } = ctx.values

      // Use typed extensions
      ctx.extensions.logger?.log(`Building for ${target}...`)

      if (minify) {
        ctx.extensions.logger?.log('Minification enabled')
      }

      // Your command logic here
      return { success: true, target }
    }

    return runner
  },
  {
    name: 'build',
    description: 'Build the project',
    args: {
      target: { type: 'string', required: true, choices: ['dev', 'prod'] },
      minify: { type: 'boolean', default: false }
    }
  }
)
```

#### Flexible Type Parameters

Similar to `defineWithTypes`, `lazyWithTypes` supports flexible type parameters:

```ts
// Most common: specify only extensions
lazyWithTypes<{ extensions: BuildExtensions }>()( ... )

// When using pre-defined args: specify args explicitly
lazyWithTypes<{ args: typeof buildArgs }>()( ... )

// Full control: specify both (when using pre-defined args AND extensions)
lazyWithTypes<{ args: typeof buildArgs; extensions: BuildExtensions }>()( ... )
```

## The `cli` Function Type Parameters

The `cli` function provides type safety for your entry command. The type parameter defines the type for the entry command's context, determining the types of `ctx.values` and `ctx.extensions` that the entry command's runner function receives:

```ts
import { cli } from 'gunshi'
import logger from '@your-gunshi/plugin-logger'

import type { GunshiParams } from 'gunshi'
import type { LoggerExtension } from '@your-gunshi/plugin-logger'

// Entry command type definition with extensions
type EntryParams = GunshiParams<{
  args: {
    verbose: { type: 'boolean'; short: 'v' }
    output: { type: 'string'; default: 'json' }
  }
  extensions: {
    logger: LoggerExtension
  }
}>

await cli<EntryParams>(
  process.argv.slice(2),
  {
    name: 'main',
    description: 'CLI with type-safe extensions',
    args: {
      verbose: { type: 'boolean', short: 'v' },
      output: { type: 'string', default: 'json' }
    },
    run: async ctx => {
      ctx.extensions.logger?.log('Processing...', ctx.values.verbose)
      console.log(`Output format: ${ctx.values.output}`)
    }
  },
  {
    name: 'mycli',
    version: '1.0.0',
    plugins: [logger()]
  }
)
```

## Using Plugin Extensions in Commands

When using plugins in your commands, leverage `defineWithTypes` for type-safe access to plugin extensions:

```ts
import { defineWithTypes } from 'gunshi'
import type { FileSystemExtension } from './plugins/filesystem'
import type { ValidationExtension } from './plugins/validation'

// Define extensions type
type SyncExtensions = {
  fs: FileSystemExtension
  validator: ValidationExtension
}

// Use defineWithTypes - args are inferred from definition
const syncCommand = defineWithTypes<{ extensions: SyncExtensions }>()({
  name: 'sync',
  description: 'Synchronize files between directories',
  args: {
    source: { type: 'string', required: true },
    destination: { type: 'string', required: true },
    dryRun: { type: 'boolean', default: false }
  },
  run: async ctx => {
    // ctx.values is automatically inferred
    // Validate paths and permissions
    const canWrite = await ctx.extensions.validator?.hasWritePermission(ctx.values.destination)
    if (!canWrite) {
      throw new Error(`No write permission for ${ctx.values.destination}`)
    }

    // Perform file synchronization with type safety
    const files = await ctx.extensions.fs?.listFiles(ctx.values.source)
    const changes = await ctx.extensions.fs?.compareDirectories(
      ctx.values.source,
      ctx.values.destination
    )

    if (ctx.values.dryRun) {
      console.log('Dry run - no changes made:', changes)
    } else {
      const result = await ctx.extensions.fs?.sync(ctx.values.source, ctx.values.destination)
      console.log('Sync complete:', result)
    }
  }
})
```

## Combining Multiple Plugin Types

When working with multiple plugins, you often need to combine their extension types to create a comprehensive type definition for your commands. TypeScript's intersection operator (`&`) provides a clean way to merge multiple plugin extension types.

### Using TypeScript's Intersection Operator (&)

The `&` operator creates an intersection type that combines multiple type definitions. This is particularly useful when your command needs to access extensions from multiple plugins.

#### With Official Gunshi Plugins

When using official Gunshi plugins that provide plugin IDs, combine their extensions using Record types. Let's break this down step by step:

**Step 1: Import Plugin IDs and Types**

First, import the plugin IDs and extension types from the official plugins. Each plugin provides a unique identifier and type definition:

```ts
// Import plugin identifiers
import { pluginId as globalId } from '@gunshi/plugin-global'
import { pluginId as rendererId } from '@gunshi/plugin-renderer'
import { pluginId as i18nId } from '@gunshi/plugin-i18n'

// Import type definitions
import type { GlobalExtension, PluginId as GlobalId } from '@gunshi/plugin-global'
import type { UsageRendererExtension, PluginId as RendererId } from '@gunshi/plugin-renderer'
import type { I18nExtension, PluginId as I18nId } from '@gunshi/plugin-i18n'
```

**Step 2: Combine Extension Types**

Next, create a combined type that includes all the plugin extensions your command will use. The Record types map each plugin ID to its corresponding extension:

```ts
// Combine multiple plugin extension types using intersection (&)
type CombinedExtensions = Record<GlobalId, GlobalExtension> &
  Record<RendererId, UsageRendererExtension> &
  Record<I18nId, I18nExtension>
```

**Step 3: Define the Command with Combined Extensions**

Finally, use `defineWithTypes` to create a command that can access all the combined plugin extensions with full type safety:

```ts
// Use defineWithTypes with combined extensions
const internationalCommand = defineWithTypes<{ extensions: CombinedExtensions }>()({
  name: 'greet',
  args: {
    name: { type: 'string', required: true }
  },
  run: async ctx => {
    // Access i18n plugin for translations
    const greeting = ctx.extensions[i18nId]?.translate('greeting', {
      name: ctx.values.name
    })

    // Access renderer plugin for text localization
    const message = ctx.extensions[rendererId]?.text('welcome')

    // Load available commands from renderer
    const commands = await ctx.extensions[rendererId]?.loadCommands()

    // Display the results
    console.log(greeting)
    if (message) console.log(message)

    // Access environment properties directly on context (not through extensions)
    console.log(`Running in ${ctx.env?.name || 'unknown'} environment`)
  }
})
```

#### With Custom Plugins

For custom plugins that don't use plugin IDs, combine the extension types directly:

```ts
import { pluginId as loggerId } from './plugins/logger'
import { pluginId as authId } from './plugins/auth'
import { pluginId as databaseId } from './plugins/database'

import { defineWithTypes } from 'gunshi'
import type { LoggerExtension, PluginId as LoggerId } from './plugins/logger'
import type { AuthExtension, PluginId as AuthId } from './plugins/auth'
import type { DatabaseExtension, PluginId as DatabaseId } from './plugins/database'

type CombinedExtensions = Record<LoggerId, LoggerExtension> &
  Record<AuthId, AuthExtension> &
  Record<DatabaseId, DatabaseExtension>

const queryCommand = defineWithTypes<{ extensions: CombinedExtensions }>()({
  name: 'query',
  description: 'Query database tables',
  args: {
    table: { type: 'string', required: true },
    limit: { type: 'number', default: 10 }
  },
  run: async ctx => {
    // All extensions and arguments are fully typed
    ctx.extensions[loggerId]?.log(`Querying ${ctx.values.table}`)

    // Check read permissions for the specific table
    if (!ctx.extensions[authId]?.hasPermission('read', ctx.values.table)) {
      throw new Error(`No read access to table: ${ctx.values.table}`)
    }

    const results = await ctx.extensions[databaseId]?.query(ctx.values.table, {
      limit: ctx.values.limit
    })

    return results
  }
})
```

Both approaches achieve the same goal: combining multiple plugin extensions with full type safety. Use Record types when working with official plugins that provide plugin IDs, and direct intersection types for custom plugins.

## Choosing the Right Function

### Use `define` or `lazy` when:

- Your command doesn't use plugin extensions
- You only need type safety for command arguments
- This is the most common use case

### Use `defineWithTypes` or `lazyWithTypes` when:

- Your command uses plugin extensions
- You need to declare expected extension types
- You want IntelliSense for plugin APIs

The choice is straightforward: if you need plugin extensions, use the `WithTypes` variants; otherwise, use the standard functions for simpler, cleaner code.
