# Plugin Development Guidelines

This guide provides practical guidelines for developing reliable, maintainable, and performant Gunshi plugins.

While other sections cover implementation details and APIs, this guide focuses on recommended approaches and techniques for production-ready plugins.

> [!TIP]
> We recommend developing Gunshi plugins with TypeScript for enhanced type safety, better IDE support, and compile-time error detection. All examples and code snippets in this guide are written in TypeScript. While JavaScript plugins are supported, TypeScript helps prevent runtime errors and provides a superior developer experience through auto-completion and type checking.

> [!NOTE]
> Some code examples in this guide include TypeScript file extensions (`.ts`) in `import`/`export` statements. If you use this pattern in your plugin, you'll need to enable `allowImportingTsExtensions` in your `tsconfig.json`.

## Design Principles

When developing Gunshi plugins, follow these core principles:

- **Single Responsibility**: Each plugin should have one clear purpose
- **Fail Fast**: Validate configuration early and provide clear error messages
- **Graceful Degradation**: Handle optional dependencies and features gracefully
- **Type Safety**: Export type definitions for all public interfaces
- **Performance Conscious**: Use lazy initialization and avoid blocking operations

These principles work together to create a robust plugin ecosystem. Single responsibility prevents conflicts and simplifies debugging.

Early validation saves time by catching errors at initialization. Graceful degradation ensures compatibility across environments.

Type safety prevents runtime errors and improves developer experience. Performance consciousness ensures responsive CLIs with instant feedback.

## Naming Conventions

### Plugin IDs

Use namespaced IDs to prevent conflicts and clearly identify plugin ownership.

Namespacing prevents ID collisions in large applications where multiple teams might develop plugins independently.

It enables plugin discovery and filtering by namespace, making it easy to identify official plugins versus third-party extensions.

Additionally, this convention clarifies ownership and responsibility, helping users understand a plugin's source, maintenance status, and trustworthiness at a glance.

The following examples demonstrate different namespacing conventions for plugin IDs:

```ts
// Organization namespace
export const pluginId = 'myorg:logger' as const

// Scoped package format
export const pluginId = '@company/auth' as const

// Official Gunshi plugins
export const pluginId = 'g:i18n' as const
```

### Package Names

Follow consistent naming for plugin packages:

- Standalone packages: `gunshi-plugin-{feature}`
- Scoped packages: `@{org}/gunshi-plugin-{feature}` or `@{org}/gunshi-plugin`
- Example: `gunshi-plugin-logger`, `@mycompany/gunshi-plugin-auth`, `@feature/gunshi/plugin`

> [!NOTE]
> Packages following the pattern `@gunshi/plugin-{feature}` (e.g., `@gunshi/plugin-i18n`) are official plugins maintained by the Gunshi team. These are not third-party plugins but are part of the official Gunshi ecosystem. Third-party developers should use their own organization scope or standalone naming as described above.

## Plugin Structure

### `gunshi/plugin` vs `@gunshi/plugin`

When developing Gunshi plugins, you need to import the `plugin` function and related types.

Plugin developers can import from either `gunshi/plugin` or `@gunshi/plugin`. Both provide identical APIs and type definitions.

Use `@gunshi/plugin` when you want to minimize your plugin's dependencies and reduce `node_modules` size, as it's a smaller package that only includes plugin-related functionality.

For plugin development, we recommend using `@gunshi/plugin` to keep your plugin package lightweight.

Here are the two equivalent import options available to plugin developers:

```ts
// Option 1: Import from main gunshi package
import { plugin } from 'gunshi/plugin'

// Option 2: Import from dedicated plugin package
import { plugin } from '@gunshi/plugin'
```

### Factory Function Approach

Create plugins as factory functions to allow configuration at initialization.

This approach enables configuration flexibility by accepting options at plugin creation time, allowing each instance to be configured independently without relying on global state or environment variables.

The factory function should be named after the plugin's primary functionality to make its purpose immediately clear.

**Good naming examples:**

- `logger()` for a logging plugin
- `auth()` for an authentication plugin
- `database()` for a database connection plugin

**Avoid generic names:**

- `createPlugin()` - Too generic
- `setup()` - Unclear purpose
- `init()` - Non-descriptive

Here's a complete factory function implementation:

```ts
export interface LoggerOptions {
  level?: 'debug' | 'info' | 'warn' | 'error'
  format?: 'json' | 'text'
}

export default function logger(options: LoggerOptions = {}) {
  const { level = 'info', format = 'text' } = options

  return plugin({
    id: 'logger',
    extension: () => ({
      log: (message: string) => {
        // Use options to configure behavior
        if (format === 'json') {
          console.log(JSON.stringify({ level, message }))
        } else {
          console.log(`[${level}] ${message}`)
        }
      }
    })
  })
}
```

### Export Types and Constants

Exporting types enables TypeScript consumers to properly type their code, preventing runtime type mismatches in production.

This practice improves IDE autocomplete and IntelliSense, allowing developers to discover your plugin's API more easily.

It also enables compile-time verification of correct plugin usage, catching integration errors during development rather than after deployment.

The following example shows how to properly export types and constants from your plugin:

```ts [types.ts]
export const pluginId = 'myorg:feature' as const
export type PluginId = typeof pluginId

export interface FeatureExtension {
  process: (data: Data) => Promise<Result>
}
```

```ts [index.ts]
export * from './types.ts'
export { default } from './plugin.ts'
```

For detailed type system usage, see [Plugin Type System](./type-system.md).

## Error Handling

### Validate Early, Fail Fast

Early validation helps avoid runtime issues that could occur deep in execution, potentially after performing partial operations or consuming computational resources.

By validating in the factory function, you can provide clearer error messages with full context about invalid configuration and specific steps to fix it.

This approach helps with debugging by catching errors at initialization rather than during command execution, when the source of the problem may be less clear.

The following example demonstrates early validation in the factory function:

```ts
export default function api(endpoint: string) {
  // Validate immediately
  if (!endpoint || !endpoint.startsWith('http')) {
    throw new Error('API plugin requires valid HTTP(S) endpoint URL')
  }

  return plugin({
    id: 'api',
    extension: () => ({
      fetch: async (path: string) => {
        // Endpoint is already validated
        return await fetch(`${endpoint}${path}`)
      }
    })
  })
}
```

### Provide Actionable Error Messages

Clear, actionable error messages reduce debugging time by pointing developers to the root cause and solution.

When errors provide specific context, possible causes, and concrete next steps, developers can more easily diagnose and fix issues independently.

This example shows how to provide helpful error messages with context and solutions:

```ts
extension: ctx => ({
  connect: async (url: string) => {
    try {
      return await establishConnection(url)
    } catch (error) {
      // Provide context and solution
      throw new Error(
        `Failed to connect to ${url}.\n` +
          `Possible causes:\n` +
          `  - Network connectivity issues\n` +
          `  - Invalid URL format\n` +
          `  - Server is not responding\n` +
          `Try: Verify the URL and your network connection`
      )
    }
  }
})
```

### Handle Optional Dependencies Gracefully

Check for optional dependencies before using them.

Graceful dependency handling ensures your plugin works across different environments and configurations, preventing cascading failures when optional plugins are not available.

Choose the appropriate approach based on your needs.

The following example demonstrates different patterns for handling optional dependencies:

```ts
extension: ctx => {
  // Optional dependencies from other plugins
  const logger = ctx.extensions.logger
  const cache = ctx.extensions.cache

  return {
    processData: async (data: Data) => {
      // Use optional chaining (?.) for single operations
      logger?.info(`Processing data: ${data.id}`)

      // Use if statements for complex logic or multiple operations
      if (cache) {
        const cached = await cache.get(data.id)
        if (cached) {
          logger?.info('Cache hit') // Mix patterns when appropriate
          return cached
        }
      }

      // Process the data
      try {
        const result = await doProcessing(data)

        // Conditional block for related operations
        if (cache && result) {
          await cache.set(data.id, result)
          await cache.setExpiry(data.id, 3600)
        }

        logger?.info('Processing completed')
        return result
      } catch (error) {
        logger?.error(`Failed: ${error.message}`)
        throw error
      }
    }
  }
}
```

## Resource Management

After establishing proper error handling, the next important aspect is managing resources effectively.

Proper resource management prevents memory leaks and ensures your plugin releases system resources correctly, especially important when errors occur during execution.

### Clean Up Resources

Proper resource cleanup helps prevent memory leaks in long-running CLI tools.

System resources have practical limits - file handles (typically 1024 per process) and database connections (often 100-200 per server) can be exhausted without proper cleanup.

The following example demonstrates how to implement cleanup mechanisms for managing multiple database connections.

The plugin tracks all created connections in an array and provides a cleanup method that closes them all when the process exits:

```ts
import { createConnection } from './database.ts'
import type { Connection } from './types.ts'

extension: () => {
  const connections: Connection[] = []

  return {
    connect: async () => {
      const conn = await createConnection()
      connections.push(conn)
      return conn
    },

    cleanup: async () => {
      await Promise.all(connections.map(c => c.close()))
      connections.length = 0
    }
  }
}

// Use in `onExtension` or command hooks
onExtension: ctx => {
  process.once('exit', () => ctx.extensions.myPlugin.cleanup())
}
```

### Handle Process Signals

Your plugin should respond to system signals for graceful shutdown. The following code shows how to register cleanup handlers that disconnect from a database when the process receives termination signals (SIGINT from Ctrl+C or SIGTERM from system shutdown):

```ts
onExtension: ctx => {
  const cleanup = async () => {
    await ctx.extensions.database.disconnect()
    process.exit(0)
  }

  process.once('SIGINT', cleanup)
  process.once('SIGTERM', cleanup)
}
```

## Performance Considerations

With proper resource management in place, you can focus on optimizing when and how resources are created and accessed.

The following techniques improve CLI startup time and responsiveness while maintaining the resource cleanup patterns discussed earlier.

### Use Lazy Initialization

Lazy initialization improves CLI startup time by deferring expensive operations until actually needed.

This ensures quick response times for simple commands.

The following example demonstrates how to defer database connection initialization until the first query is executed:

```ts
extension: () => {
  let connection: Database | null = null

  const getConnection = async () => {
    // Only create the connection on first access
    if (!connection) {
      // Expensive operation deferred until actually needed
      connection = await createConnection()
    }
    return connection
  }

  return {
    query: async (sql: string) => {
      // Lazily initialize connection when query is first called
      const conn = await getConnection()
      return conn.execute(sql)
    }
  }
}
```

### Avoid Blocking Operations

Blocking operations freeze the CLI interface and degrade user experience. Use asynchronous operations to maintain interactivity, especially during initialization and command execution.

The following examples contrast blocking and non-blocking approaches to file operations and data processing:

```ts
extension: () => ({
  // Bad: Blocks the entire CLI during initialization
  loadConfig: () => {
    const data = fs.readFileSync('./config.json', 'utf-8') // Blocks!
    return JSON.parse(data)
  },

  // Good: Non-blocking async operation
  loadConfig: async () => {
    const data = await fs.promises.readFile('./config.json', 'utf-8')
    return JSON.parse(data)
  },

  // Better: Non-blocking with progress feedback
  processLargeDataset: async files => {
    const results = []
    for (const [index, file] of files.entries()) {
      // Process file asynchronously
      const data = await processFile(file)
      results.push(data)
      console.log(`Processing: ${index + 1}/${files.length}`)
    }
    console.log() // New line after progress
    return results
  }
})
```

### Optimize Module Loading

Loading heavy dependencies at startup increases CLI initialization time and memory usage. Use dynamic imports to load heavy dependencies only when needed, keeping the initial load minimal for fast command response.

These examples demonstrate how to use dynamic imports to defer loading heavy dependencies:

```ts
// Bad: Module-level import loads dependency at startup
import ExcelJS from 'exceljs' // 4MB loaded at startup!

extension: () => ({
  generateReport: async data => {
    const workbook = new ExcelJS.Workbook()
    // Generate report...
  }
  // Other methods that don't use ExcelJS...
})

// Good: Dynamic import loads dependency only when needed
extension: () => ({
  generateReport: async data => {
    // Load 4MB dependency only when report is actually generated
    const { Workbook } = await import('exceljs')
    const workbook = new Workbook()
    // Generate report...
  },

  // Better: Combine with user feedback for perceived performance
  exportData: async (format, data) => {
    if (format === 'excel') {
      console.log('Loading Excel export module...')
      const { exportToExcel } = await import('./exporters/excel.js')
      return exportToExcel(data)
    } else if (format === 'pdf') {
      console.log('Loading PDF export module...')
      const { exportToPDF } = await import('./exporters/pdf.js')
      return exportToPDF(data)
    }
    // Default lightweight JSON export
    return JSON.stringify(data)
  }
})
```

For more `extension` lifecycle details, see [Plugin Extensions](./extensions.md).

## Security Considerations

### Validate All Inputs

User input should be validated and sanitized before use.

The following example demonstrates how to validate file paths and extensions to prevent directory traversal attacks and restrict file types:

```ts
extension: () => ({
  readFile: async (path: string) => {
    // Prevent path traversal
    if (path.includes('..') || path.startsWith('/')) {
      throw new Error('Invalid file path')
    }

    // Validate file extension
    const allowed = ['.json', '.yaml', '.yml']
    if (!allowed.some(ext => path.endsWith(ext))) {
      throw new Error('Unsupported file type')
    }

    return await fs.readFile(path, 'utf-8')
  }
})
```

### Protect Sensitive Data

Avoid exposing sensitive information in logs or error messages.

This example shows how to handle API keys securely in a plugin, validating them without logging sensitive data:

```ts
export default function auth(apiKey: string) {
  // Validate but don't log the key
  if (!apiKey || apiKey.length < 32) {
    throw new Error('Invalid API key format')
  }

  return plugin({
    id: 'auth',
    extension: () => ({
      request: async (url: string) => {
        try {
          return await fetch(url, {
            headers: { Authorization: `Bearer ${apiKey}` }
          })
        } catch (error) {
          // Don't include the API key in errors
          throw new Error(`Request failed: ${error.message}`)
        }
      }
    })
  })
}
```

### Prevent Prototype Pollution

Prototype pollution occurs when user-controlled data modifies `Object.prototype`, potentially injecting properties that affect all objects in your application.

This vulnerability is particularly dangerous in CLI tools that process configuration files or user-provided options, as attackers can manipulate command behavior through crafted inputs.

Use `Object.create(null)` to create objects without a prototype chain when handling user input:

```ts
extension: () => {
  // Vulnerable: Regular object inherits from Object.prototype
  const userOptions = {} // Can be polluted via __proto__ or constructor

  // Safe: Object without prototype chain
  const safeOptions = Object.create(null)

  return {
    parseConfig: config => {
      // Safe storage for user-provided data
      const settings = Object.create(null)

      // Safely merge user config with defaults
      for (const key in config) {
        // Only copy own properties, not inherited ones
        if (Object.prototype.hasOwnProperty.call(config, key)) {
          // Prevent __proto__ and constructor pollution
          if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
            continue
          }
          settings[key] = config[key]
        }
      }

      return settings
    },

    // Safe command registry without prototype chain
    createCommandMap: commands => {
      const commandMap = Object.create(null)

      for (const cmd of commands) {
        commandMap[cmd] = true
      }

      // Safe to check user input against this map
      return commandMap
    }
  }
}
```

Use `Object.create(null)` specifically when:

- Storing user-provided configuration or options
- Creating lookup maps from external input
- Building registries from dynamic data
- Merging multiple configuration sources

Regular object literals are safe for:

- Internal plugin state
- Hardcoded configurations
- Type-checked interfaces

## Testing Strategies

Focus testing on your plugin's extension factory and how it interacts with the command context.

This ensures your plugin properly integrates with Gunshi's lifecycle and handles command metadata correctly.

The following example demonstrates how to test your plugin's extension factory and its interaction with the command context:

```ts
import { describe, test, expect, vi } from 'vitest'
import myPlugin from './index'

describe('Plugin Extension', () => {
  test('extension factory creates correct methods', async () => {
    const plugin = myPlugin({ debug: true })

    // Mock a command context to simulate Gunshi's runtime environment
    const mockContext = {
      name: 'test-command',
      values: { verbose: true },
      log: vi.fn(),
      extensions: {}
    }

    const mockCommand = { name: 'test', run: vi.fn() }

    // Verify the extension factory returns all required plugin methods
    const extension = await plugin.extension(mockContext, mockCommand)
    expect(extension.process).toBeDefined()
    expect(typeof extension.process).toBe('function')

    // Verify the plugin correctly uses context.log when debug is enabled
    extension.process('data')
    expect(mockContext.log).toHaveBeenCalledWith('[DEBUG]', 'data')
  })
})
```

For test helpers, lifecycle testing, and integration testing strategies, see [Plugin Testing](./testing.md).

## Documentation

Comprehensive documentation is crucial for plugin adoption and maintenance.

This section provides guidelines and real examples from official Gunshi plugins to help you create effective documentation.

### Module-Level Documentation

Start your main plugin file with module-level JSDoc that explains the plugin's purpose and provides a complete usage example.

The following example from `@gunshi/plugin-global` demonstrates this approach:

````ts
/**
 * The entry point of global options plugin
 *
 * @example
 * ```js
 * import global from '@gunshi/plugin-global'
 * import { cli } from 'gunshi'
 *
 * const entry = (ctx) => {
 *   // ...
 * }
 *
 * await cli(process.argv.slice(2), entry, {
 *   // ...
 *
 *   plugins: [
 *     global()
 *   ],
 *
 *   // ...
 * })
 * ```
 *
 * @module
 */
````

### Factory Function Documentation

Document your factory function comprehensively, including all parameters and return types. Here's an example from `@gunshi/plugin-i18n`:

```ts
/**
 * i18n plugin
 *
 * @param options - I18n plugin options
 * @returns A defined plugin as i18n
 */
export default function i18n(
  options: I18nPluginOptions = {}
): PluginWithExtension<I18nExtension<DefaultGunshiParams>> {
  // Implementation
}
```

For plugins with required parameters, include validation guidance:

```ts
/**
 * completion plugin
 *
 * @param options - Completion options
 * @returns A defined plugin as completion
 */
export default function completion(options: CompletionOptions = {}): PluginWithoutExtension {
  const config = options.config || {}
  // Validate and use options
}
```

### Extension Interface Documentation

Document all methods and properties exposed through your plugin's extension.

Here's a concise example:

```ts
/**
 * Extended command context utilities available via `CommandContext.extensions['g:i18n']`.
 */
export interface I18nExtension<G extends GunshiParams<any> = DefaultGunshiParams> {
  /** Command locale */
  locale: Intl.Locale

  /** Translate a message with optional interpolation */
  translate: <K>(key: K, values?: Record<string, unknown>) => string

  /** Load command resources for the specified locale */
  loadResource: (
    locale: string | Intl.Locale,
    ctx: CommandContext,
    command: Command
  ) => Promise<boolean>

  // Additional methods follow similar documentation patterns
}
```

For complete examples, see the official plugins' source code.

### Configuration Options Documentation

Document all configuration options with their types, defaults, and purpose:

```ts
/**
 * i18n plugin options
 */
export interface I18nPluginOptions {
  /** Locale to use for translations */
  locale?: string | Intl.Locale

  /** Translation adapter factory */
  translationAdapterFactory?: TranslationAdapterFactory

  /** Built-in localizable resources */
  builtinResources?: Record<string, Record<BuiltinResourceKeys, string>>
}
```

Nested interfaces follow the same documentation pattern with JSDoc comments for each property.

### Type Documentation Guidelines

Export all public types with clear documentation:

```ts
/** The unique identifier for the i18n plugin */
export const pluginId = namespacedId('i18n')
export type PluginId = typeof pluginId

/** Command resource type with dynamic argument keys */
export type CommandResource<G extends GunshiParamsConstraint = DefaultGunshiParams> = {
  description: string
  // Dynamic properties based on command arguments
} & { [key: string]: string }

/** Async function to fetch command resources */
export type CommandResourceFetcher<G extends GunshiParamsConstraint> = (
  ctx: Readonly<CommandContext<G>>
) => Awaitable<CommandResource<G>>
```

For more complex generic types, see official plugin implementations.

### Plugin Dependencies Documentation

Document plugin dependencies clearly:

```ts
return plugin<...>({
  id: pluginId,
  name: 'completion',
  dependencies: [{ id: namespacedId('i18n'), optional: true }] as const
  // ...
})
```

In your README, explain:

- Dependency ID and whether it's optional/required
- Purpose and effect when present
- Any automatic behaviors or integration points

### README Template Structure

> [!NOTE]
> Gunshi plans to provide official tooling for plugin authors to automatically generate README templates in future releases. This tooling will help scaffold standard README files with the correct structure, sections, and formatting. Until then, the following template demonstrates the recommended structure for plugin README files.

A comprehensive README should follow this structure:

```markdown [README.md]
# @yourorg/gunshi-plugin-{name}

> Brief description of what your plugin does.

## Installation

\`\`\`sh

# npm

npm install --save @yourorg/gunshi-plugin-{name}
\`\`\`

For other package managers, see [installation guide](./docs/install.md).

## Usage

\`\`\`ts
import { cli } from 'gunshi'
import myPlugin from '@yourorg/gunshi-plugin-{name}'

const command = {
name: 'example',
run: ctx => {
ctx.extensions['yourorg:{name}'].someMethod()
}
}

await cli(process.argv.slice(2), command, {
plugins: [myPlugin({ /* options */ })]
})
\`\`\`

## Plugin Options

See [API documentation](./docs/api.md) for complete options.

## Examples

See the [examples directory](./examples) for usage examples.

## License

[MIT](http://opensource.org/licenses/MIT)
```

### API Documentation Generation

Generate API documentation directly from your JSDoc comments to maintain a single source of truth.

This approach ensures your documentation stays synchronized with your code, as updates to JSDoc comments automatically reflect in generated documentation.

Various tools can generate documentation from JSDoc comments:

- **[TypeDoc](https://typedoc.org/)** - Recommended for TypeScript projects, generates documentation from TypeScript declarations and JSDoc
- **[API Extractor](https://api-extractor.com/)** - Microsoft's tool focusing on API review and documentation for TypeScript libraries

The following example demonstrates configuring `TypeDoc`, a popular choice for TypeScript plugin projects. Create a `typedoc.config.mjs` file:

```js [typedoc.config.mjs]
// @ts-check

export default {
  /**
   * typedoc options
   * ref: https://typedoc.org/documents/Options.html
   */
  entryPoints: ['./src/index.ts'],
  out: 'docs',
  plugin: ['typedoc-plugin-markdown'],
  readme: 'none',
  groupOrder: ['Variables', 'Functions', 'Classes', 'Interfaces', 'Type Aliases'],

  /**
   * typedoc-plugin-markdown options
   * ref: https://typedoc-plugin-markdown.org/docs/options
   */
  entryFileName: 'index',
  hidePageTitle: false,
  useCodeBlocks: true,
  disableSources: true,
  indexFormat: 'table',
  parametersFormat: 'table',
  interfacePropertiesFormat: 'table',
  classPropertiesFormat: 'table',
  propertyMembersFormat: 'table',
  typeAliasPropertiesFormat: 'table',
  enumMembersFormat: 'table'
}
```

Add documentation scripts to your `package.json`:

```json [package.json]
{
  "scripts": {
    "docs": "typedoc",
    "docs:watch": "typedoc --watch",
    "docs:clean": "rm -rf docs"
  },
  "devDependencies": {
    "typedoc": "^0.26.0",
    "typedoc-plugin-markdown": "^4.0.0"
  }
}
```

This configuration extracts documentation from your JSDoc comments and TypeScript types, generating comprehensive API documentation without manual maintenance.

The generated documentation includes all exported functions, interfaces, types, and their associated JSDoc descriptions, ensuring consistency between code and documentation.

## Next Steps

Following these guidelines ensures your plugins are production-ready, maintainable, and provide excellent developer experience. You've learned naming conventions, error handling patterns, performance considerations, and documentation strategies.

Now that you understand how to build high-quality plugins, explore the existing ecosystem to see these principles in action and find plugins that can enhance your CLI.

The next chapter on [Plugin List](./list.md) showcases official plugins maintained by the Gunshi team and community contributions.
