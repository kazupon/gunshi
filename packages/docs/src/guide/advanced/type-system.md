# Type System

Gunshi v0.27 introduces a powerful type parameter system that revolutionizes type safety across all core functions: `cli`, `define`, `lazy`, and `plugin`. This enhancement brings TypeScript's full type-checking capabilities to your CLI applications, ensuring compile-time safety for command arguments and plugin extensions.

## Overview of v0.27 Type System

The v0.27 release fundamentally improves type safety through:

- **Type Parameters for Core Functions**: All main functions (`cli`, `define`, `lazy`, `plugin`) now accept type parameters
- **Enhanced TypeScript Inference**: Automatic type inference reduces boilerplate while maintaining safety
- **Unified Type System (GunshiParams)**: A single, coherent type system for arguments and extensions
- **Plugin Extension Type Safety**: Full compile-time validation of plugin interactions

## `define` Function Type Parameters

The `define` function offers multiple type parameter patterns for maximum flexibility:

### Type-safe with Extension

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

### Type-safe for Arguments

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

For complete control over both arguments and extensions:

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

### Type-safe with Extension Type

```ts
type AuthExt = {
  auth: {
    authenticated: boolean
  }
}

const loader = async () => {
  const runner: CommandRunner<{ args: Args; extensions: AuthExt }> = async ctx => {
    // ctx.extensions.auth.authenticated is typed as boolean
    if (!ctx.extensions.auth?.authenticated) {
      throw new Error('Authentication required')
    }
    return 'deployed'
  }
  return runner
}

const lazyCmd = lazy<AuthExt>(loader, {
  name: 'lazy-deploy',
  description: 'Lazy deploy command'
})
```

### Type-Safe Command Loading

The lazy function preserves type information from the loaded command:

```ts
interface TestExt {
  existing: { test: boolean }
}

const loader = async () => {
  const runner: CommandRunner<{ extensions: { test: TestExt } }> = async ctx => {
    // Type-safe access to extensions
    if (ctx.extensions.test?.existing.test) {
      console.log('Test mode enabled')
    }
    return 'done'
  }
  return runner
}

const lazyCmd = lazy(loader, {
  name: 'test'
})
```

## The `cli` Function Type Parameters

The `cli` function provides global type safety for your entire CLI:

### Type-safe with `GunshiParams`

```ts
import { cli } from 'gunshi'
import type { GunshiParams } from 'gunshi'

type GlobalExtensions = GunshiParams<{
  args: Args
  extensions: {
    logger: LoggerExtension
    auth: AuthExtension
    db: DatabaseExtension
  }
}>

await cli<GlobalExtensions>(
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

### Type-safe for Extensions

```ts
type Extensions = {
  renderer: RendererExtension
  i18n: I18nExtension
}

await cli<Extensions>(args, mainCommand, {
  plugins: [rendererPlugin(), i18nPlugin()]
})
```

## The `plugin` Function Type Parameters

The `plugin` function has the most sophisticated type system for managing dependencies:

### Complex Type Signature

```ts
plugin<DependencyExtensions, PluginId, Dependencies, Extension>(options)
```

### Type-safe Plugin with Extension

```ts
import { plugin } from 'gunshi/plugin'

export const pluginId = 'g:completion' as const
export type PluginId = typeof pluginId

export interface CompletionExtension {
  getCompletions: (input: string) => string[]
  addCompletion: (value: string) => void
}

export default function completion() {
  return plugin<{}, PluginId, [], CompletionExtension>({
    id: pluginId,
    name: 'Completion Plugin',

    extension: () => {
      const completions = new Set<string>()

      return {
        getCompletions: (input: string) => {
          return Array.from(completions).filter(c => c.startsWith(input))
        },
        addCompletion: (value: string) => {
          completions.add(value)
        }
      }
    }
  })
}
```

### Type-safe Plugin with Dependencies

```ts
import { pluginId as i18nId, type I18nExtension } from '@gunshi/plugin-i18n'

type DependencyExtensions = {
  [i18nId]: I18nExtension
}

const dependencies = [{ id: i18nId, optional: true }] as const

export default function completionWithI18n() {
  return plugin<DependencyExtensions, PluginId, typeof dependencies, CompletionExtension>({
    id: pluginId,
    dependencies,

    extension: (ctx, cmd) => {
      // Access i18n if available
      const i18n = ctx.extensions[i18nId]

      return {
        getCompletions: (input: string) => {
          const completions = ['deploy', 'build', 'test']

          if (i18n) {
            // Localize completions if i18n is available
            return completions.map(c => i18n.translate(c))
          }

          return completions
        }
      }
    }
  })
}
```
