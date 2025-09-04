# Type System

Gunshi v0.27 introduces a powerful type parameter system that provides comprehensive type safety across all core functions: `cli`, `define`, `lazy`, and `plugin`. This enhancement brings TypeScript's full type-checking capabilities to your CLI applications, ensuring compile-time safety for command arguments and plugin extensions.

## Overview of v0.27 Type System

The v0.27 release fundamentally improves type safety through:

- **Type Parameters for Core Functions**: All main functions (`cli`, `define`, `lazy`, `plugin`) now accept type parameters
- **Enhanced TypeScript Inference**: Automatic type inference reduces boilerplate while maintaining safety
- **Unified Type System (GunshiParams)**: A single, coherent type system for arguments and extensions
- **Plugin Extension Type Safety**: Full compile-time validation of plugin interactions

### Understanding GunshiParams

`GunshiParams` is a utility type that provides complete type safety for both command arguments and plugin extensions:

```ts
type GunshiParams<{
  args: Args         // Command arguments definition
  extensions: Ext    // Plugin extensions
}>
```

This unified type system ensures that your command context (`ctx`) has properly typed `values` (from args) and `extensions` (from plugins).

## The `define` Function Type Parameters

The `define` function offers multiple type parameter patterns for maximum flexibility:

### Type-safe Extensions

The most common pattern ensures type safety for plugin extensions:

```ts
import { define } from 'gunshi'

interface AuthExtension {
  user: { id: string; name: string }
  isAuthenticated: () => boolean
}

const deployCommand = define<AuthExtension>({
  name: 'deploy',
  description: 'Deploy the application',
  args: {
    environment: {
      type: 'string',
      required: true
    }
  },
  run: ctx => {
    // ctx.extensions is fully typed as AuthExtension
    if (!ctx.extensions.auth?.isAuthenticated()) {
      throw new Error('Authentication required')
    }

    console.log(`Deploying as ${ctx.extensions.auth?.user.name}`)
    console.log(`Target: ${ctx.values.environment}`)
  }
})
```

### Type-safe Arguments

For commands without extensions, focus on argument type safety:

```ts
const args = {
  file: {
    type: 'string' as const,
    description: 'File to process'
  },
  verbose: {
    type: 'boolean' as const,
    short: 'v'
  }
} satisfies Args

const processCommand = define<typeof args>({
  name: 'process',
  args,
  run: ctx => {
    // ctx.values is typed as { file?: string; verbose?: boolean }
    if (ctx.values.verbose) {
      console.log(`Processing ${ctx.values.file}`)
    }
  }
})
```

### Type-safe with `GunshiParams`

When you need to type both arguments and extensions together, use the `GunshiParams` utility type explained above:

```ts
import type { GunshiParams } from 'gunshi'

type MyCommandParams = GunshiParams<{
  args: {
    port: { type: 'number'; default: 3000 }
    host: { type: 'string'; default: 'localhost' }
  }
  extensions: {
    logger: LoggerExtension
    auth: AuthExtension
  }
}>

const serverCommand = define<MyCommandParams>({
  name: 'server',
  args: {
    port: { type: 'number', default: 3000 },
    host: { type: 'string', default: 'localhost' }
  },
  run: ctx => {
    ctx.extensions.logger?.log(`Starting server on ${ctx.values.host}:${ctx.values.port}`)
    // Both args and extensions are fully typed
  }
})
```

## The `lazy` Function Type Parameters

The `lazy` function maintains type safety even with deferred loading:

### Basic Lazy Loading with Types

```ts
import { lazy } from 'gunshi'
import type { CommandRunner } from 'gunshi'

// Define extension interface
interface AuthExtension {
  isAuthenticated: () => boolean
  getUser: () => { id: string; name: string }
}

// Create lazy-loaded command
const lazyDeployCommand = lazy<{ auth: AuthExtension }>(
  async () => {
    // This function runs only when the command is executed
    const { deployLogic } = await import('./deploy-logic')

    const runner: CommandRunner = async ctx => {
      // Type-safe access to extensions
      if (!ctx.extensions.auth?.isAuthenticated()) {
        throw new Error('Authentication required')
      }

      const user = ctx.extensions.auth.getUser()
      console.log(`Deploying as ${user.name}...`)

      return await deployLogic()
    }

    return runner
  },
  {
    name: 'deploy',
    description: 'Deploy application (lazy-loaded)'
  }
)
```

### Lazy Loading with Arguments

```ts
import type { Args, GunshiParams } from 'gunshi'

const buildArgs = {
  target: {
    type: 'string' as const,
    required: true,
    choices: ['development', 'production'] as const
  },
  minify: {
    type: 'boolean' as const,
    default: false
  }
} satisfies Args

type BuildParams = GunshiParams<{
  args: typeof buildArgs
  extensions: {
    logger: { log: (msg: string) => void }
  }
}>

const lazyBuildCommand = lazy<BuildParams>(
  async () => {
    // Heavy build dependencies loaded only when needed
    const { buildProject } = await import('./build-system')

    return async ctx => {
      ctx.extensions.logger?.log(`Building for ${ctx.values.target}`)

      await buildProject({
        target: ctx.values.target,
        minify: ctx.values.minify
      })

      return 'Build complete'
    }
  },
  {
    name: 'build',
    description: 'Build the project',
    args: buildArgs
  }
)
```

## The `cli` Function Type Parameters

The `cli` function provides global type safety for your entire CLI:

### Type-safe with `GunshiParams`

Use `GunshiParams` to type the entire CLI context:

```ts
import { cli } from 'gunshi'
import type { GunshiParams } from 'gunshi'

type GlobalParams = GunshiParams<{
  args: Args
  extensions: {
    logger: LoggerExtension
    auth: AuthExtension
    db: DatabaseExtension
  }
}>

await cli<GlobalParams>(
  process.argv.slice(2),
  {
    name: 'main',
    run: ctx => {
      // All extensions are available and typed
      ctx.extensions.logger?.log('Starting CLI')

      if (!ctx.extensions.auth?.isAuthenticated()) {
        throw new Error('Please login first')
      }

      ctx.extensions.db?.connect()
    }
  },
  {
    name: 'my-cli',
    version: '1.0.0',
    plugins: [logger(), auth(), db()]
  }
)
```

### Type-safe Extensions Only

When you only need to type extensions without arguments:

```ts
type Extensions = {
  renderer: RendererExtension
  i18n: I18nExtension
}

await cli<Extensions>(args, mainCommand, {
  plugins: [rendererPlugin(), i18nPlugin()]
})
```

## Using Plugin Extensions in Commands

When using plugins in your commands, you can leverage their exported types for full type safety:

```ts
import { define } from 'gunshi'
import { pluginId as apiId, type ApiExtension } from './plugins/api'
import { pluginId as authId, type AuthExtension } from './plugins/auth'

// Use plugin extensions in command definition
const deployCommand = define<{
  [apiId]: ApiExtension
  [authId]: AuthExtension
}>({
  name: 'deploy',
  run: async ctx => {
    // Access plugin extensions with full type safety
    if (!ctx.extensions[authId].isAuthenticated()) {
      throw new Error('Please login first')
    }

    const result = await ctx.extensions[apiId].post('/deployments', {
      environment: 'production'
    })

    console.log('Deployment successful:', result)
  }
})
```

> [!NOTE]
> For information on developing type-safe plugins with the `plugin` function, see the [Plugin Type System](../plugin/type-system.md) guide.
