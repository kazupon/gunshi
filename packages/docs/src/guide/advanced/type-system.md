# Type System

<!-- TODO(kazupon): Gunshi's type system should be a bit easier to use, if args -->
<!-- NOTE: If `args` is specified, `ctx.values` should be inferred even if only `extensions` is specified in the type params. -->

Gunshi v0.27 introduces a powerful type parameter system that provides comprehensive type safety across all core functions: `cli`, `define`, `lazy`, and `plugin`. This enhancement brings TypeScript's full type-checking capabilities to your CLI applications, ensuring compile-time safety for command arguments and plugin extensions.

This guide focuses on type safety for command definitions and their arguments. If you're creating custom plugins and need to understand the `plugin` function's type system, refer to the [Plugin Type System](../plugin/type-system.md) guide.

## Overview of v0.27 Type System

The v0.27 release fundamentally improves type safety through:

- **Type Parameters for Core Functions**: All main functions (`cli`, `define`, `lazy`, `plugin`) now accept type parameters
- **Enhanced TypeScript Inference**: Automatic type inference reduces boilerplate while maintaining safety
- **Unified Type System (GunshiParams)**: A single, coherent type system for arguments and extensions
- **Plugin Extension Type Safety**: Full compile-time validation of plugin interactions

### Understanding `GunshiParams`

`GunshiParams` is the core type that unifies type safety for command arguments and plugin extensions. At its simplest, it ensures that your command context has properly typed `values` (from args) and `extensions` (from plugins).

Before diving into the implementation details, here's how it works in practice:

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

## The `define` Function Type Parameters

The `define` function uses `GunshiParams` type parameter to provide comprehensive type safety for both command arguments and plugin extensions:

```ts
import { define } from 'gunshi'
import type { GunshiParams } from 'gunshi'

// Comprehensive type definition with args and extensions
type ServerParams = GunshiParams<{
  args: {
    port: { type: 'number'; default: 3000 }
    host: { type: 'string'; default: 'localhost' }
    verbose: { type: 'boolean'; short: 'v' }
  }
  extensions: {
    logger: {
      log: (msg: string) => void
      error: (msg: string) => void
    }
    auth: {
      isAuthenticated: () => boolean
      getUser: () => { id: string; name: string }
    }
  }
}>

const serverCommand = define<ServerParams>({
  name: 'server',
  description: 'Start the development server',
  args: {
    port: { type: 'number', default: 3000 },
    host: { type: 'string', default: 'localhost' },
    verbose: { type: 'boolean', short: 'v' }
  },
  run: ctx => {
    // ctx.values contains typed arguments (port, host, verbose)
    const { port, host, verbose } = ctx.values

    // ctx.extensions contains typed plugin extensions
    // Optional chaining (?.) is used because plugins may not be installed
    // or may fail to load, making their extensions undefined
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

## The `lazy` Function Type Parameters

The `lazy` function maintains type safety through `GunshiParams` even with deferred loading:

```ts
import { lazy } from 'gunshi'
import type { GunshiParams, CommandRunner } from 'gunshi'

// Type definition for build command with performance metrics
type BuildParams = GunshiParams<{
  args: {
    target: { type: 'string'; required: true; choices: ['dev', 'prod'] }
    minify: { type: 'boolean'; default: false }
    watch: { type: 'boolean'; short: 'w' }
  }
  extensions: {
    logger: {
      log: (msg: string) => void
      startSpinner: (msg: string) => () => void
    }
    metrics: {
      recordBuildTime: (target: string, duration: number) => void
      getAverageTime: (target: string) => number
    }
  }
}>

const lazyBuildCommand = lazy<BuildParams>(
  async () => {
    // Heavy dependencies loaded only when needed
    const { build } = await import('./bundler')

    const runner: CommandRunner<BuildParams> = async ctx => {
      const { target, minify, watch } = ctx.values
      const startTime = Date.now()

      // Use typed extensions
      const stopSpinner = ctx.extensions.logger?.startSpinner(`Building for ${target}...`)

      try {
        const result = await build({ target, minify })
        stopSpinner?.()

        // Record and compare build metrics
        const duration = Date.now() - startTime
        ctx.extensions.metrics?.recordBuildTime(target, duration)

        const avgTime = ctx.extensions.metrics?.getAverageTime(target) || 0
        const comparison = avgTime > 0 ? `(avg: ${avgTime}ms)` : ''
        ctx.extensions.logger?.log(`✓ Build complete in ${duration}ms ${comparison}`)

        if (watch) {
          ctx.extensions.logger?.log('Watch mode enabled - monitoring for changes')
        }

        return result
      } catch (error) {
        stopSpinner?.()
        ctx.extensions.logger?.log(`✗ Build failed: ${error}`)
        throw error
      }
    }

    return runner
  },
  {
    name: 'build',
    description: 'Build the project',
    args: {
      target: { type: 'string', required: true, choices: ['dev', 'prod'] },
      minify: { type: 'boolean', default: false },
      watch: { type: 'boolean', short: 'w' }
    }
  }
)
```

## The `cli` Function Type Parameters

The `cli` function provides global type safety for your entire CLI:

```ts
import { cli } from 'gunshi'
import type { GunshiParams } from 'gunshi'

// Global type definition for database management CLI
type GlobalParams = GunshiParams<{
  args: {
    verbose: { type: 'boolean'; short: 'v' }
    format: { type: 'string'; choices: ['json', 'csv', 'table']; default: 'table' }
  }
  extensions: {
    database: {
      connect: () => Promise<void>
      disconnect: () => Promise<void>
      isConnected: () => boolean
    }
    logger: {
      setVerbose: (verbose: boolean) => void
      log: (msg: string) => void
    }
    formatter: {
      format: (data: any, format: string) => string
      exportToFile: (data: any, path: string, format: string) => Promise<void>
    }
  }
}>

await cli<GlobalParams>(
  process.argv.slice(2),
  {
    name: 'main',
    description: 'Database management CLI',
    args: {
      verbose: { type: 'boolean', short: 'v' },
      format: { type: 'string', choices: ['json', 'csv', 'table'], default: 'table' }
    },
    run: async ctx => {
      // Configure logging verbosity
      ctx.extensions.logger?.setVerbose(ctx.values.verbose)

      // Check database connection with permission validation
      if (!ctx.extensions.database?.isConnected()) {
        ctx.extensions.logger?.log('Connecting to database...')
        await ctx.extensions.database?.connect()
      }

      // Format and display database status
      const status = {
        connected: ctx.extensions.database?.isConnected(),
        timestamp: new Date().toISOString(),
        format: ctx.values.format
      }
      const formatted = ctx.extensions.formatter?.format(status, ctx.values.format)
      console.log(formatted)
    }
  },
  {
    name: 'dbcli',
    version: '2.0.0',
    plugins: [databasePlugin(), loggerPlugin(), formatterPlugin()]
  }
)
```

## Using Plugin Extensions in Commands

When using plugins in your commands, leverage their exported types with `GunshiParams` for full type safety:

```ts
import { define } from 'gunshi'
import type { GunshiParams } from 'gunshi'
import type { FileSystemExtension } from './plugins/filesystem'
import type { ValidationExtension } from './plugins/validation'

// Define type with GunshiParams for file operations
type SyncParams = GunshiParams<{
  args: {
    source: { type: 'string'; required: true }
    destination: { type: 'string'; required: true }
    dryRun: { type: 'boolean'; default: false }
  }
  extensions: {
    fs: FileSystemExtension
    validator: ValidationExtension
  }
}>

const syncCommand = define<SyncParams>({
  name: 'sync',
  description: 'Synchronize files between directories',
  args: {
    source: { type: 'string', required: true },
    destination: { type: 'string', required: true },
    dryRun: { type: 'boolean', default: false }
  },
  run: async ctx => {
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

When using official Gunshi plugins that provide plugin IDs, combine their extensions using Record types:

```ts
import { pluginId as globalId } from '@gunshi/plugin-global'
import { pluginId as rendererId } from '@gunshi/plugin-renderer'
import { pluginId as i18nId } from '@gunshi/plugin-i18n'

import type { GlobalExtension, PluginId as GlobalId } from '@gunshi/plugin-global'
import type { UsageRendererExtension, PluginId as RendererId } from '@gunshi/plugin-renderer'
import type { I18nExtension, PluginId as I18nId } from '@gunshi/plugin-i18n'

// Combine multiple plugin extension types
type CombinedExtensions = Record<GlobalId, GlobalExtension> &
  Record<RendererId, UsageRendererExtension> &
  Record<I18nId, I18nExtension>

type InternationalParams = GunshiParams<{
  args: {
    name: { type: 'string'; required: true }
  }
  extensions: CombinedExtensions
}>

const internationalCommand = define<InternationalParams>({
  name: 'greet',
  args: {
    name: { type: 'string', required: true }
  },
  run: async ctx => {
    // Access all plugin extensions with full type safety
    const greeting = ctx.extensions[i18nId]?.translate('greeting', { name: ctx.values.name })

    // UsageRendererExtension provides text localization and command loading
    const message = ctx.extensions[rendererId]?.text('welcome')
    const commands = await ctx.extensions[rendererId]?.loadCommands()

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

import type { GunshiParams } from 'gunshi'
import type { LoggerExtension, PluginId as LoggerId } from './plugins/logger'
import type { AuthExtension, PluginId as AuthId } from './plugins/auth'
import type { DatabaseExtension, PluginId as DatabaseId } from './plugins/database'

type CombinedExtensions = Record<LoggerId, LoggerExtension> &
  Record<AuthId, AuthExtension> &
  Record<DatabaseId, DatabaseExtension>

type CommandParams = GunshiParams<{
  args: {
    table: { type: 'string'; required: true }
    limit: { type: 'number'; default: 10 }
  }
  extensions: CombinedExtensions
}>

const queryCommand = define<CommandParams>({
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

Both patterns achieve the same goal: combining multiple plugin extensions with full type safety. Use Record types when working with official plugins that provide plugin IDs, and direct intersection types for custom plugins.
