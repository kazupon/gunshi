# Testing Gunshi Plugins

Testing is a crucial part of plugin development to ensure reliability and maintainability. This guide covers comprehensive testing approaches for Gunshi plugins, demonstrating techniques through practical examples.

> [!NOTE]
> This guide uses [Vitest](https://vitest.dev/) as the testing framework. The concepts can be adapted to other testing frameworks.

> [!IMPORTANT]
> The code examples in this guide focus on demonstrating testing patterns and techniques. For clarity and brevity, some examples may not include extensive explanations that would normally be present in Gunshi's documentation. The emphasis is on showing practical testing approaches rather than following all documentation style guidelines.

## Table of Contents

- [Your First Plugin Test](#your-first-plugin-test)
  - [Creating a Minimal Plugin to Test](#creating-a-minimal-plugin-to-test)
  - [Writing Your First Test](#writing-your-first-test)
- [Testing Extension Methods](#testing-extension-methods)
- [Setting Up Test Utilities](#setting-up-test-utilities)
  - [Why Test Helpers?](#why-test-helpers)
  - [Creating Test Helpers](#creating-test-helpers)
- [Testing Plugin Initialization](#testing-plugin-initialization)
  - [Structure Validation Tests](#structure-validation-tests)
  - [Dependency Declaration Tests](#dependency-declaration-tests)
  - [Configuration Validation Tests](#configuration-validation-tests)
  - [Initialization State Tests](#initialization-state-tests)
- [Testing Extensions with Mock Context](#testing-extensions-with-mock-context)
  - [Using createMockCommandContext](#using-createmockcommandcontext)
  - [Testing Complex Extension Methods](#testing-complex-extension-methods)
  - [Testing Configuration-Driven Behavior](#testing-configuration-driven-behavior)
  - [Testing Dependency Runtime Behavior](#testing-dependency-runtime-behavior)
- [Testing Decorators](#testing-decorators)
  - [Command Decorator Testing](#command-decorator-testing)
  - [Testing with Renderers](#testing-with-renderers)
- [Testing Type-Safe Plugins](#testing-type-safe-plugins)
  - [Using Type Parameters for Full Type Safety](#using-type-parameters-for-full-type-safety)
  - [Testing Async Extensions](#testing-async-extensions)
- [Testing Plugin Lifecycle Callbacks](#testing-plugin-lifecycle-callbacks)
  - [The setup Function](#the-setup-function)
  - [The onExtension Callback](#the-onextension-callback)
- [Integration Testing](#integration-testing)
  - [Testing Complete Plugin Flow](#testing-complete-plugin-flow)
  - [Testing with Multiple Plugins](#testing-with-multiple-plugins)

## Your First Plugin Test

Before writing tests for a plugin, you need a plugin to test. Let's build a minimal plugin and its corresponding test step by step.

### Creating a Minimal Plugin to Test

First, create a simple plugin that provides a greeting function:

```typescript
// src/index.ts
import { plugin } from 'gunshi/plugin'

export default function myPlugin(options = {}) {
  return plugin({
    id: 'my-plugin',
    name: 'My Plugin',
    extension: (ctx, cmd) => ({
      greet: (name: string) => `Hello, ${name}!`
    })
  })
}
```

This minimal plugin:

- Has a unique identifier (`my-plugin`)
- Provides a descriptive name
- Creates an extension with a `greet` method

### Writing Your First Test

Now let's write tests for this plugin:

```typescript
// src/index.test.ts
import { describe, expect, test, vi } from 'vitest'
import myPlugin from './index'

describe('plugin initialization', () => {
  test('create plugin with default options', () => {
    const plugin = myPlugin()

    expect(plugin.id).toBe('my-plugin')
    expect(plugin.name).toBe('My Plugin')
    expect(plugin.extension).toBeDefined()
  })

  test('plugin extension factory creates correct methods', async () => {
    const plugin = myPlugin()

    // Create minimal mock context and command for factory
    const mockContext = {
      name: 'test-command',
      description: 'Test command',
      args: {},
      explicit: {},
      values: {},
      positionals: [],
      rest: [],
      tokens: [],
      omitted: false,
      callMode: 'entry' as const,
      log: vi.fn(),
      extensions: {}
    }

    const mockCommand = {
      name: 'test',
      description: 'Test command',
      run: vi.fn()
    }

    const extension = await plugin.extension(mockContext, mockCommand)

    expect(extension.greet).toBeDefined()
    expect(typeof extension.greet).toBe('function')
    expect(extension.greet('World')).toBe('Hello, World!')
  })
})
```

These tests verify:

- **Plugin metadata**: The plugin has the correct ID and name
- **Extension structure**: The extension factory is properly defined
- **Extension functionality**: The factory creates the expected methods with correct behavior

Run the tests with:

```bash
pnpm test
```

This approach gives you a working foundation that you can expand as your plugin grows more complex.

## Testing Extension Methods

Extension methods are the core functionality that plugins provide to commands. Testing these methods ensures that your plugin behaves correctly when commands use its features. The following example demonstrates how to test extension methods by creating a minimal mock context manually:

```typescript
import { describe, expect, test, vi } from 'vitest'
import myPlugin from './index'

describe('extension methods', () => {
  test('extension method works', async () => {
    const plugin = myPlugin()

    // Create a minimal mock context manually
    const mockContext = {
      name: 'test-command',
      description: 'Test command',
      args: {},
      explicit: {},
      values: {},
      positionals: [],
      rest: [],
      tokens: [],
      omitted: false,
      callMode: 'entry' as const,
      log: vi.fn(),
      extensions: {},
      // Add only the properties your extension needs
      env: {
        version: '1.0.0'
      }
    }

    // Create mock command for factory
    const mockCommand = {
      name: 'test',
      description: 'Test command',
      run: vi.fn()
    }

    // Create the extension
    const extension = await plugin.extension(mockContext, mockCommand)

    // Test the extension method
    const result = extension.greet('World')
    expect(result).toBe('Hello, World!')
  })
})
```

This approach works well for simple tests, but as your plugin grows more complex, you'll find yourself repeatedly creating similar mock contexts.

## Setting Up Test Utilities

### Why Test Helpers?

As your plugin testing needs grow, you'll encounter several challenges:

- **Repetitive mock creation**: Creating mock contexts manually for each test becomes tedious
- **Type safety**: Ensuring your mocks have the correct TypeScript types can be error-prone
- **Consistency**: Different tests might create slightly different mocks, leading to inconsistent behavior
- **Maintenance**: When Gunshi's context structure changes, you'd need to update mocks in many places

Test helpers solve these problems by providing reusable, type-safe utility functions that simplify your test code.

### Creating Test Helpers

Create a `test/helper.ts` file in your plugin root directory with reusable test utilities:

```typescript
// test/helper.ts
import { vi } from 'vitest'
import { plugin } from 'gunshi/plugin'
import type {
  CommandContext,
  CommandContextExtension,
  CommandEnvironment,
  GunshiParams,
  Args,
  ExtendContext,
  Command,
  DefaultGunshiParams,
  PluginContext
} from 'gunshi'

type CreateMockCommandContextOptions<G extends GunshiParams = DefaultGunshiParams> = Partial<
  Omit<CommandContext, 'extensions'> &
    Omit<CommandEnvironment, 'name' | 'description' | 'version'> & {
      extensions?: Record<string, CommandContextExtension<G['extensions']>>
      command?: Command<G>
      version?: string | null
    }
>

/**
 * Create a type-safe mock command context with optional extensions.
 * Extensions must be CommandContextExtension objects with a factory method.
 *
 * @param options - Partial context properties to override defaults
 * @returns A fully typed CommandContext instance
 */
export async function createMockCommandContext<E extends ExtendContext = {}>(
  options: CreateMockCommandContextOptions = {}
): Promise<CommandContext<GunshiParams<{ args: Args; extensions: E }>>> {
  let ctx: any = {
    name: options.name || 'mock-command',
    description: options.description || 'Mock command',
    env: {
      cwd: options.cwd,
      name: 'test-app',
      description: 'Test application',
      version: options.version == null ? undefined : options.version || '1.0.0',
      leftMargin: options.leftMargin || 2,
      middleMargin: options.middleMargin || 10,
      usageOptionType: options.usageOptionType || false,
      usageOptionValue: options.usageOptionValue || true,
      usageSilent: options.usageSilent ?? false,
      subCommands: options.subCommands ?? undefined,
      renderUsage: options.renderUsage || undefined,
      renderHeader: options.renderHeader || undefined,
      renderValidationErrors: options.renderValidationErrors || undefined
    },
    args: options.args || {},
    explicit: options.explicit || {},
    values: options.values || {},
    positionals: options.positionals || [],
    rest: options.rest || [],
    _: options._ || [],
    tokens: options.tokens || [],
    omitted: options.omitted || false,
    callMode: options.callMode || 'entry',
    log: options.log || vi.fn()
  }

  if (options.extensions) {
    const ext = {} as any
    Object.defineProperty(ctx, 'extensions', {
      value: ext,
      writable: false,
      enumerable: true,
      configurable: true
    })
    for (const [key, extension] of Object.entries(options.extensions)) {
      ext[key] = await (extension as CommandContextExtension).factory(
        ctx,
        options.command as Command
      )
      if (extension.onFactory) {
        await extension.onFactory(ctx as CommandContext, options.command as Command)
      }
    }
    ctx = Object.assign({}, ctx, { extensions: ext })
  } else {
    ctx = Object.assign({}, ctx, { extensions: {} })
  }

  return ctx as CommandContext<GunshiParams<{ args: Args; extensions: E }>>
}

/**
 * Create a mock plugin context with spy functions
 *
 * @returns A PluginContext instance with all methods mocked
 */
export function createMockPluginContext(): PluginContext {
  return {
    globalOptions: new Map(),
    subCommands: new Map(),
    addGlobalOption: vi.fn(),
    addCommand: vi.fn(),
    hasCommand: vi.fn(() => false),
    decorateCommand: vi.fn(),
    decorateHeaderRenderer: vi.fn(),
    decorateUsageRenderer: vi.fn(),
    decorateValidationErrorsRenderer: vi.fn()
  }
}
```

With these helper functions in place, you can now write more sophisticated tests with less boilerplate code.

## Testing Plugin Initialization

Plugin initialization testing verifies that your plugin is correctly constructed, has proper metadata, declares dependencies appropriately, and creates valid extension factories. These tests ensure your plugin integrates properly with the Gunshi framework before testing its actual functionality.

### Structure Validation Tests

The following tests verify that plugins have the correct structure with required metadata and valid extension functions.

#### Plugin Implementation for Structure Tests

Gunshi plugins are created using factory functions that return configured plugin objects. The following example shows a plugin factory that accepts configuration options and creates a plugin with an extension function. The extension function receives the command context (ctx) and command definition (cmd) and returns an object containing the plugin's functionality:

```typescript
import { plugin } from 'gunshi/plugin'

// Plugin factory function with optional configuration
function createMyPlugin(
  options: {
    debug?: boolean // Enables debug logging when true
    locale?: string // Sets the plugin's locale (e.g., 'en-US', 'ja-JP')
    timeout?: number // Sets operation timeout in milliseconds
  } = {}
) {
  return plugin({
    id: 'my-plugin', // Unique identifier for this plugin
    name: 'My Plugin', // Human-readable name
    extension: (ctx, cmd) => ({
      // Extension methods that will be available to commands
      greet: (name: string) => `Hello, ${name}!`,
      process: (data: string) => {
        if (options.debug) {
          ctx.log('[DEBUG]', data) // Uses command context for logging
        }
        return data.toUpperCase()
      },
      config: options // Expose configuration for testing
    })
  })
}
```

#### Structure Tests

The following tests verify that plugins are created with the correct structure and behavior:

```typescript
describe('structure validation', () => {
  test('creates plugin with minimal configuration', () => {
    const plugin = createMyPlugin({ debug: false, locale: 'en-US' })

    // Verify required properties
    expect(plugin.id).toBe('my-plugin')
    expect(plugin.name).toBe('My Plugin')
    expect(typeof plugin).toBe('function') // Plugin is a function
    expect(plugin.id).toBeDefined() // with properties attached

    // Verify extension exists
    expect(plugin.extension).toBeDefined()
    expect(typeof plugin.extension).toBe('function')
  })

  test('plugin factory creates valid structure', () => {
    // Test multiple instantiations create separate instances
    const plugin1 = createMyPlugin()
    const plugin2 = createMyPlugin()

    expect(plugin1.id).toBe(plugin2.id) // Same ID

    // Each plugin factory call creates a new plugin instance
    // The extension property itself is the same function reference
    expect(plugin1).not.toBe(plugin2) // Different plugin instances
    expect(plugin1.extension).toBe(plugin2.extension) // Same extension function
  })

  test('creates plugin with default options', () => {
    const plugin = createMyPlugin() // Works with default empty options
    expect(plugin.id).toBe('my-plugin')
    expect(plugin.name).toBe('My Plugin')
  })
})
```

### Dependency Declaration Tests

Plugins can declare dependencies on other plugins. Dependencies can be required (string format) or optional (object format with `optional: true`). Gunshi ensures dependencies are loaded before the plugin that requires them:

These tests ensure that plugin dependencies are properly declared with the correct format.

#### Plugin Implementation for Dependency Tests

```typescript
function createPluginWithDependencies() {
  return plugin({
    id: 'dependent-plugin',
    name: 'Dependent Plugin',
    dependencies: [
      'plugin-renderer', // Required dependency
      { id: 'plugin-i18n', optional: true } // Optional dependency
    ],
    extension: (ctx, cmd) => ({
      render: () => 'rendered'
    })
  })
}
```

#### Dependency Tests

The following test verifies that dependencies are correctly declared in the plugin metadata:

```typescript
describe('dependency declaration', () => {
  test('declares dependencies correctly', () => {
    const plugin = createPluginWithDependencies()

    expect(plugin.dependencies).toBeDefined()
    expect(plugin.dependencies).toContain('plugin-renderer')

    // Check for optional dependency
    const optionalDep = plugin.dependencies?.find(dep => typeof dep === 'object' && dep.optional)
    expect(optionalDep).toEqual({ id: 'plugin-i18n', optional: true })
  })
})
```

### Configuration Validation Tests

Plugins often need to validate their configuration options. Validation should happen in the factory function before creating the plugin, allowing early failure with clear error messages. Here are two patterns for configuration validation:

Configuration validation tests verify that plugins properly validate their options during creation.

#### Plugin Implementations for Configuration Tests

```typescript
// Plugin that validates configuration at creation time
function createValidatingPlugin(options: { locale: string; timeout?: number }) {
  // Validation happens in the factory function before creating the plugin
  // Validate locale format (e.g., 'en-US', 'ja-JP' - ISO language-country format)
  if (options.locale && !options.locale.match(/^[a-z]{2}-[A-Z]{2}$/)) {
    throw new Error('Invalid locale format')
  }
  if (options.timeout !== undefined && options.timeout < 0) {
    throw new Error('Timeout must be positive')
  }

  return plugin({
    id: 'validating-plugin',
    name: 'Validating Plugin',
    extension: (ctx, cmd) => ({ validate: () => true })
  })
}

// Plugin with strict required options
function createStrictPlugin(options: { apiKey: string }) {
  if (!options.apiKey) {
    throw new Error('API key is required')
  }

  return plugin({
    id: 'strict-plugin',
    name: 'Strict Plugin',
    extension: (ctx, cmd) => ({ connect: () => true })
  })
}
```

#### Configuration Tests

The following tests verify that plugins properly validate their configuration:

```typescript
describe('configuration validation', () => {
  test('validates configuration at creation time', () => {
    // Test that invalid options prevent plugin creation
    expect(() => createValidatingPlugin({ locale: 'invalid' })).toThrow('Invalid locale format')

    expect(() => createValidatingPlugin({ locale: 'en-US', timeout: -1 })).toThrow(
      'Timeout must be positive'
    )
  })

  test('handles missing optional configuration', () => {
    // Should not throw when optional config is missing
    const plugin = createMyPlugin({ locale: 'en-US' }) // timeout is optional
    expect(plugin).toBeDefined()
    expect(plugin.id).toBe('my-plugin')
  })

  test('plugin factory throws on invalid required options', () => {
    // Missing required option prevents initialization
    expect(() => createStrictPlugin({ apiKey: '' })).toThrow('API key is required')
  })
})
```

### Initialization State Tests

Plugins often need to initialize state when they're created, such as loading configuration files or restoring cached data. These tests verify that plugins handle initialization correctly, including error scenarios.

The following example demonstrates a file cache plugin that loads persisted data during initialization. Note that while plugin creation itself is synchronous, the extension factory function can be asynchronous when needed for operations like loading configuration files or connecting to services. In this example, we use synchronous file operations for simplicity:

These tests verify how plugins handle internal state initialization, including loading persisted state during plugin creation.

#### Plugin Implementation for Initialization Tests

```typescript
// File cache plugin that loads existing cache during initialization
import { readFileSync, existsSync, writeFileSync } from 'node:fs'
import { plugin } from 'gunshi/plugin'

export function createFileCachePlugin(options?: { cacheFile?: string }) {
  const cacheFile = options?.cacheFile ?? '.cache.json'

  // Initialize cache by loading from file if it exists
  // Using Map for O(1) key lookups
  const cache = new Map<string, string>()

  if (existsSync(cacheFile)) {
    try {
      const data = readFileSync(cacheFile, 'utf-8')
      const entries: Array<[string, string]> = JSON.parse(data)

      // Restore all cached entries from the persisted file
      for (const [key, value] of entries) {
        cache.set(key, value)
      }
    } catch (error) {
      // If cache file is corrupted or unreadable, start with empty cache
      // This ensures the plugin can still initialize successfully
      console.warn(`Failed to load cache from ${cacheFile}:`, error)
    }
  }

  return plugin({
    id: 'file-cache',
    name: 'File Cache Plugin',
    extension: (ctx, cmd) => ({
      get(key: string): string | undefined {
        return cache.get(key)
      },

      set(key: string, value: string): void {
        cache.set(key, value)
      },

      getCacheSize(): number {
        return cache.size
      },

      saveCache(): void {
        const entries = Array.from(cache.entries())
        writeFileSync(cacheFile, JSON.stringify(entries, null, 2))
      }
    })
  })
}
```

#### Initialization Tests

The following tests demonstrate various initialization scenarios. We mock the file system to test different conditions without creating actual files:

```typescript
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { createFileCachePlugin } from './plugins'
import { readFileSync, existsSync } from 'node:fs'

// Mock the fs module to control file system behavior in tests
// This allows us to simulate different scenarios (missing files, corrupted data, etc.)
vi.mock('node:fs', () => ({
  readFileSync: vi.fn(),
  existsSync: vi.fn(),
  writeFileSync: vi.fn()
}))

describe('initialization state', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Test 1: Plugin should initialize with empty cache when no file exists
  test('initializes with empty cache when no cache file exists', () => {
    const mockExistsSync = vi.mocked(existsSync)
    mockExistsSync.mockReturnValue(false)

    const plugin = createFileCachePlugin()

    // Plugin initializes successfully without cache file
    expect(plugin.id).toBe('file-cache')
    expect(plugin.name).toBe('File Cache Plugin')
    expect(mockExistsSync).toHaveBeenCalledWith('.cache.json')
    expect(readFileSync).not.toHaveBeenCalled()
  })

  // Test 2: Plugin should load and parse existing cache data from file
  test('loads existing cache during initialization', () => {
    const mockExistsSync = vi.mocked(existsSync)
    const mockReadFileSync = vi.mocked(readFileSync)

    const cacheData = [
      ['user-123', 'John Doe'],
      ['session-456', 'active'],
      ['config-789', '{"theme":"dark"}']
    ]

    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockReturnValue(JSON.stringify(cacheData))

    const plugin = createFileCachePlugin()

    // Verify cache was loaded during initialization
    expect(mockExistsSync).toHaveBeenCalledWith('.cache.json')
    expect(mockReadFileSync).toHaveBeenCalledWith('.cache.json', 'utf-8')
    expect(plugin.id).toBe('file-cache')
  })

  // Test 3: Plugin should handle corrupted cache files gracefully
  test('handles corrupted cache file gracefully', () => {
    const mockExistsSync = vi.mocked(existsSync)
    const mockReadFileSync = vi.mocked(readFileSync)
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation()

    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockReturnValue('invalid json {]')

    const plugin = createFileCachePlugin()

    // Plugin initializes despite corrupted cache
    expect(plugin.id).toBe('file-cache')
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Failed to load cache from .cache.json:',
      expect.any(Error)
    )

    consoleWarnSpy.mockRestore()
  })

  test('uses custom cache file location', () => {
    const mockExistsSync = vi.mocked(existsSync)
    mockExistsSync.mockReturnValue(false)

    const plugin = createFileCachePlugin({ cacheFile: '/tmp/my-cache.json' })

    expect(mockExistsSync).toHaveBeenCalledWith('/tmp/my-cache.json')
    expect(plugin.id).toBe('file-cache')
  })

  test('plugin creation is synchronous despite file operations', () => {
    const mockExistsSync = vi.mocked(existsSync)
    const mockReadFileSync = vi.mocked(readFileSync)

    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockReturnValue('[]')

    // No await needed - plugin creation is synchronous
    const plugin = createFileCachePlugin()

    expect(plugin).toBeDefined()
    expect(plugin.extension).toBeDefined()
    // File operations use sync versions during initialization
  })

  test('empty cache file results in empty cache state', () => {
    const mockExistsSync = vi.mocked(existsSync)
    const mockReadFileSync = vi.mocked(readFileSync)

    mockExistsSync.mockReturnValue(true)
    mockReadFileSync.mockReturnValue('[]') // Empty array

    const plugin = createFileCachePlugin()

    expect(mockReadFileSync).toHaveBeenCalledWith('.cache.json', 'utf-8')
    expect(plugin.id).toBe('file-cache')
    // Cache is initialized but empty
  })
})
```

### Key Testing Patterns for Gunshi Plugins

When testing Gunshi plugins, focus on:

- **Structure validation**: Test that your plugin exports the correct structure
- **Extension behavior**: Verify extensions work with mock contexts
- **Lifecycle events**: Test setup and onExtension callbacks
- **Integration**: Test plugins with real CLI instances

## Testing Extensions with Mock Context

### Using createMockCommandContext

The `createMockCommandContext` helper simplifies testing by providing a complete mock context with all required properties and type safety. This eliminates boilerplate code and ensures consistency across tests. Here's how to use it to test extension factories:

```typescript
import { expect, test } from 'vitest'
import { createMockCommandContext } from '../test/helper'
import myPlugin from './index'

import type { MyExtension } from './types'

test('extension factory creates correct extension', async () => {
  // Create plugin instance
  const plugin = myPlugin()

  // Create mock context with the plugin's extension
  const mockContext = await createMockCommandContext<{
    ['my-plugin']: MyExtension
  }>({
    extensions: {
      ['my-plugin']: plugin.extension
    }
  })

  // Verify extension structure
  expect(mockContext.extensions['my-plugin']).toBeDefined()
  expect(typeof mockContext.extensions['my-plugin'].someMethod).toBe('function')

  // Test extension functionality
  const result = mockContext.extensions['my-plugin'].someMethod()
  expect(result).toBe('expected value')
})
```

### Testing Complex Extension Methods

Complex extension methods often interact with multiple parts of the command context, such as environment variables, command arguments, and other extensions. The test helpers provide a complete context that allows you to verify these interactions thoroughly. The following tests demonstrate how to test methods that depend on various context properties:

```typescript
import { describe, expect, test, vi } from 'vitest'
import { createMockCommandContext } from '../test/helper'
import myPlugin from './index'

import type { MyExtension } from './types'

describe('extension methods', () => {
  test('showVersion displays version correctly', async () => {
    const plugin = myPlugin()
    const mockContext = await createMockCommandContext<{
      ['my-plugin']: MyExtension
    }>({
      env: {
        version: '2.0.0',
        name: 'test-app',
        description: 'Test application',
        cwd: process.cwd(),
        leftMargin: 2,
        middleMargin: 10
      },
      extensions: {
        ['my-plugin']: plugin.extension
      }
    })

    // Test extension method
    const result = mockContext.extensions['my-plugin'].showVersion()

    expect(result).toBe('2.0.0')
    expect(mockContext.log).toHaveBeenCalledWith('2.0.0')
  })

  test('showVersion handles missing version', async () => {
    const plugin = myPlugin()
    const mockContext = await createMockCommandContext<{
      ['my-plugin']: MyExtension
    }>({
      env: {
        version: undefined,
        name: 'test-app',
        description: 'Test application',
        cwd: process.cwd(),
        leftMargin: 2,
        middleMargin: 10
      },
      extensions: {
        ['my-plugin']: plugin.extension
      }
    })

    // Test fallback behavior
    const result = mockContext.extensions['my-plugin'].showVersion()

    expect(result).toBe('unknown')
    expect(mockContext.log).toHaveBeenCalledWith('unknown')
  })
})
```

### Testing Configuration-Driven Behavior

Plugin options affect how the plugin behaves at runtime. Rather than testing the options directly (which are internal to the plugin factory), test the actual behavior changes that result from different configurations:

```typescript
import { describe, expect, test, vi } from 'vitest'
import { createMockCommandContext } from '../test/helper'
import myPlugin from './index'

describe('plugin configuration behavior', () => {
  test('plugin uses debug mode when configured', async () => {
    // Create plugin with debug enabled
    const debugPlugin = myPlugin({ debug: true })

    // Create mock context with the plugin's extension
    const ctx = await createMockCommandContext({
      extensions: {
        'my-plugin': debugPlugin.extension
      },
      command: { name: 'test', description: 'Test command', run: vi.fn() }
    })

    // Execute a method that should behave differently in debug mode
    ctx.extensions['my-plugin'].process()

    // Verify that debug mode affects behavior
    expect(ctx.log).toHaveBeenCalledWith('[DEBUG]', expect.any(String))
  })

  test('plugin uses specified locale for messages', async () => {
    // Test that locale affects message output
    const japanesePlugin = myPlugin({ locale: 'ja-JP' })

    // Create mock context with the plugin's extension
    const ctx = await createMockCommandContext({
      extensions: {
        'my-plugin': japanesePlugin.extension
      },
      command: { name: 'test', description: 'Test command', run: vi.fn() }
    })

    // Verify locale-specific behavior
    const message = ctx.extensions['my-plugin'].getMessage('greeting')
    expect(message).toBe('こんにちは') // Japanese greeting
  })

  test('plugin uses default configuration when not specified', async () => {
    // Create plugin without options
    const defaultPlugin = myPlugin()

    // Create mock context with the plugin's extension
    const ctx = await createMockCommandContext({
      extensions: {
        'my-plugin': defaultPlugin.extension
      },
      command: { name: 'test', description: 'Test command', run: vi.fn() }
    })

    // Verify default behavior (no debug output)
    ctx.extensions['my-plugin'].process()
    expect(ctx.log).not.toHaveBeenCalledWith(expect.stringContaining('[DEBUG]'))

    // Verify default locale
    const message = ctx.extensions['my-plugin'].getMessage('greeting')
    expect(message).toBe('Hello') // English greeting
  })
})
```

### Testing Dependency Runtime Behavior

When your plugin has dependencies, test the runtime behavior when dependencies are available or missing:

```typescript
import { describe, expect, test, vi } from 'vitest'
import { createMockCommandContext } from '../test/helper'
import myPlugin from './index'

describe('plugin dependency runtime behavior', () => {
  test('plugin provides fallback when optional dependency is missing', async () => {
    const plugin = myPlugin()

    // Create mock context with the plugin's extension
    // Note: Not including the optional dependency in extensions
    const ctx = await createMockCommandContext({
      extensions: {
        'my-plugin': plugin.extension
      },
      command: { name: 'test', description: 'Test command', run: vi.fn() }
    })

    // Should work without the optional dependency
    const result = ctx.extensions['my-plugin'].getMessage()
    expect(result).toBe('Default message')
  })
})
```

> [!NOTE]
> **Circular Dependency Detection**
>
> Circular dependencies are detected by Gunshi at runtime when plugins are loaded. In integration tests with the full CLI:
>
> ```typescript
> expect(() => cli({ plugins: [pluginA, pluginB] })).toThrow(
>   'Circular dependency detected: `a -> b -> a`'
> )
> ```

## Testing Decorators

### Command Decorator Testing

Decorators are higher-order functions that wrap command runners to add functionality like logging, validation, or conditional execution. Testing decorators is crucial to ensure they correctly intercept and modify command execution. Here's how to test that decorators properly handle different scenarios:

```typescript
import { expect, test, vi } from 'vitest'
import { createMockCommandContext } from '../test/helper'
import decorator from './decorator'
import myPlugin from './index'

import type { MyExtension } from './types'

test('decorator intercepts help option', async () => {
  const usage = 'Usage: test [options]'
  const plugin = myPlugin()

  const ctx = await createMockCommandContext<{
    ['my-plugin']: MyExtension
  }>({
    values: { help: true },
    renderUsage: async () => usage,
    extensions: {
      ['my-plugin']: plugin.extension
    }
  })

  const baseRunner = vi.fn(() => 'command executed')
  const decoratedRunner = decorator(baseRunner)
  const result = await decoratedRunner(ctx)

  expect(result).toBe(usage)
  expect(baseRunner).not.toHaveBeenCalled()
})

test('decorator passes through when no special options', async () => {
  const plugin = myPlugin()

  const ctx = await createMockCommandContext<{
    ['my-plugin']: MyExtension
  }>({
    values: {},
    extensions: {
      ['my-plugin']: plugin.extension
    }
  })

  const baseRunner = vi.fn(() => 'command executed')
  const decoratedRunner = decorator(baseRunner)
  const result = await decoratedRunner(ctx)

  expect(result).toBe('command executed')
  expect(baseRunner).toHaveBeenCalledWith(ctx)
})
```

### Testing with Renderers

This example demonstrates testing a plugin that uses Gunshi's renderer functions to display formatted output. The test verifies both the rendered content and that the plugin correctly interacts with the command context:

```typescript
import { expect, test } from 'vitest'
import { createMockCommandContext } from '../test/helper'
import myPlugin from './index'

import type { MyExtension } from './types'

test('extension renders header correctly', async () => {
  const header = 'Test Application v1.0.0' // The expected output that will be rendered
  const plugin = myPlugin()

  // Create context with extension and renderer
  const ctx = await createMockCommandContext<{
    ['my-plugin']: MyExtension
  }>({
    // Mock context includes a renderHeader function that simulates rendering behavior
    // Attach the plugin's extension to the mock context
    renderHeader: async () => header,
    extensions: {
      ['my-plugin']: plugin.extension
    }
  })

  // Call the extension method that should trigger rendering
  const result = await ctx.extensions['my-plugin'].showHeader(ctx)

  // Verify the method returns the rendered content
  expect(result).toBe(header)
  // Verify the plugin called ctx.log to display the header
  expect(ctx.log).toHaveBeenCalledWith(header)
})
```

This test verifies that the plugin's `showHeader` method correctly uses the renderer function and outputs the result through the context's logging mechanism. Both the return value and the side effects (logging) are validated.

## Testing Type-Safe Plugins

### Using Type Parameters for Full Type Safety

Gunshi's plugin system uses four type parameters to ensure complete type safety. Here's how to test plugins with proper type definitions:

```typescript
import { describe, expect, test, vi } from 'vitest'
import { plugin } from 'gunshi/plugin'
import type { LoggerExtension } from './logger'
import type { MyExtension } from './types'

describe('type-safe plugin', () => {
  test('plugin with typed dependencies', () => {
    // Create a plugin with all four type parameters
    const typedPlugin = plugin<
      { logger: LoggerExtension }, // DependencyExtensions
      'my-plugin', // PluginId
      ['logger'], // Dependencies array
      MyExtension // Extension type
    >({
      id: 'my-plugin',
      dependencies: ['logger'],
      extension: (ctx, cmd) => ({
        // ctx.extensions.logger is fully typed
        doSomething: () => {
          ctx.extensions.logger.debug('Doing something')
          return 'done'
        },
        getLogInfo: () => {
          // Example method that works with the logger interface
          return 'Logger is available'
        }
      })
    })

    expect(typedPlugin.id).toBe('my-plugin')
    expect(typedPlugin.dependencies).toEqual(['logger'])
  })

  test('type checking prevents invalid dependency access', () => {
    // This test demonstrates compile-time type safety
    // The following would cause a TypeScript error:
    // ctx.extensions.nonexistent.method() // Error: Property 'nonexistent' does not exist
  })
})
```

### Testing Async Extensions

Async extension factories are used when plugins need to perform asynchronous operations during initialization, such as loading configuration files, connecting to external services, or fetching remote resources. Unlike synchronous factories that return extensions immediately, async factories return promises that resolve to the extension instance. The `createMockCommandContext` helper automatically handles async extension factories by calling them and awaiting the results, so testing async extensions is straightforward.

#### Testing Successful Async Initialization

This test demonstrates how to verify that an async extension factory correctly loads configuration during initialization. The key aspects are mocking the async configuration loader and awaiting the factory call:

```typescript
import { describe, expect, test, vi } from 'vitest'
import { createMockCommandContext } from '../test/helper'
import myPlugin from './index'

describe('async extension', () => {
  test('extension factory loads configuration', async () => {
    // Mock function simulates async config loading (e.g., from file or API)
    const loadConfig = vi.fn().mockResolvedValue({
      apiUrl: 'https://api.example.com',
      timeout: 5000
    })

    const plugin = myPlugin({ loadConfig })

    // Use helper to create context WITH the extension
    // The helper automatically calls the factory and awaits it
    const ctx = await createMockCommandContext({
      extensions: {
        'my-plugin': plugin.extension
      },
      command: { name: 'test', description: 'Test command', run: vi.fn() }
    })

    // Extension is already created and available
    // Verify the async operation was called during factory execution
    expect(loadConfig).toHaveBeenCalled()
    expect(ctx.extensions['my-plugin'].getConfig()).toEqual({
      apiUrl: 'https://api.example.com',
      timeout: 5000
    })
  })
})
```

#### Testing Error Handling and Fallbacks

Async operations can fail, so plugins should handle initialization errors gracefully. This test verifies that the extension provides sensible fallback values when configuration loading fails:

```typescript
// Still inside the 'async extension' describe block
test('extension handles initialization errors gracefully', async () => {
  // Simulate a failed configuration load (file missing, network error, etc.)
  const loadConfig = vi.fn().mockRejectedValue(new Error('Config file not found'))

  const plugin = myPlugin({ loadConfig })

  // Helper handles the async factory call, including error scenarios
  const ctx = await createMockCommandContext({
    extensions: {
      'my-plugin': plugin.extension
    },
    command: { name: 'test', description: 'Test command', run: vi.fn() }
  })

  // Extension should provide fallback values despite config error
  // Verify fallback configuration is used instead of crashing
  expect(ctx.extensions['my-plugin'].getConfig()).toEqual({
    apiUrl: 'http://localhost:3000',
    timeout: 3000
  })
})
```

The `createMockCommandContext` helper simplifies testing async extensions by automatically handling factory calls and promise resolution. When you pass extensions in the options, the helper calls each factory (with await if needed) and attaches the resolved extensions to the context. This lets you focus on testing the initialization behavior and error handling rather than the mechanics of async factory calls.

> [!TIP]
> **Why This Works**
>
> The `createMockCommandContext` helper automatically handles async extension factories. When you pass extensions in the options, it:
>
> - Calls each extension's factory method with the context and command
> - Awaits the result if the factory returns a Promise
> - Attaches the resolved extension to the context's extensions object
>
> This means you don't need to manually call factories or handle the async flow - focus on testing the behavior after initialization.

## Testing Plugin Lifecycle Callbacks

### The setup Function

The `setup` function runs when the plugin is registered with the CLI system via the PluginContext. Testing the setup function verifies that your plugin correctly configures global options, commands, and decorators. The following example demonstrates how to implement and test all aspects of plugin setup functionality.

#### Plugin Setup Example

The following plugin demonstrates registering a global option, command, and decorators:

```typescript
// src/plugins/cli-enhancer-plugin.ts
import { plugin } from 'gunshi/plugin'
import { define } from 'gunshi'

export const cliEnhancerPlugin = plugin({
  id: 'cli-enhancer',
  name: 'CLI Enhancer Plugin',
  setup: ctx => {
    // Register global option for output formatting
    ctx.addGlobalOption('format', {
      type: 'string',
      description: 'Output format',
      choices: ['json', 'yaml', 'table'],
      default: 'json'
    })

    // Add deploy command
    ctx.addCommand(
      'deploy',
      define({
        name: 'deploy',
        description: 'Deploy the application',
        run: async cmdCtx => {
          const format = cmdCtx.values.format || 'json'
          return `Deployed successfully (format: ${format})`
        }
      })
    )

    // Enhance CLI appearance with decorators
    ctx.decorateHeaderRenderer(async (base, cmdCtx) => {
      const header = await base(cmdCtx)
      const formatIndicator = cmdCtx.values.format === 'table' ? '📊' : '📝'
      return `${formatIndicator} ${header}`
    })

    ctx.decorateUsageRenderer(async (base, cmdCtx) => {
      const usage = await base(cmdCtx)
      return `${usage}\n\nExamples:\n  $ myapp deploy --format=yaml\n  $ myapp --help`
    })

    ctx.decorateValidationErrorsRenderer(async (base, cmdCtx, error) => {
      const rendered = await base(cmdCtx, error)
      return `⚠️  Validation Issues:\n${rendered}\nRun with --help for usage information.`
    })
  }
})
```

This plugin provides these features:

- **Global Option**: Adds a `format` option with choices and default value available to all commands
- **Command**: Registers a `deploy` command that uses the global option
- **Decorators**: Enhances header with format indicator, adds examples to usage, and improves validation error messages

Here's how to test all aspects of this plugin setup:

```typescript
// test/plugins/cli-enhancer-plugin.test.ts
import { describe, expect, test, vi } from 'vitest'
import { cliEnhancerPlugin } from '../../src/plugins/cli-enhancer-plugin'
import { createMockPluginContext, createMockCommandContext } from '../helper'

describe('cliEnhancerPlugin setup', () => {
  test('registers global option, command, and decorators', async () => {
    const pluginContext = createMockPluginContext()

    // Execute the plugin function directly with the plugin context
    await cliEnhancerPlugin(pluginContext)

    // Verify global option was registered
    expect(pluginContext.addGlobalOption).toHaveBeenCalledWith(
      'format',
      expect.objectContaining({
        type: 'string',
        choices: ['json', 'yaml', 'table'],
        default: 'json',
        description: 'Output format'
      })
    )

    // Verify command was registered
    expect(pluginContext.addCommand).toHaveBeenCalledWith(
      'deploy',
      expect.objectContaining({
        name: 'deploy',
        description: 'Deploy the application'
      })
    )

    // Verify decorators were registered
    expect(pluginContext.decorateHeaderRenderer).toHaveBeenCalledTimes(1)
    expect(pluginContext.decorateUsageRenderer).toHaveBeenCalledTimes(1)
    expect(pluginContext.decorateValidationErrorsRenderer).toHaveBeenCalledTimes(1)
  })

  test('decorator functionality works correctly', async () => {
    const pluginContext = createMockPluginContext()

    // Execute the plugin function directly with the plugin context
    await cliEnhancerPlugin(pluginContext)

    // Test header decorator with format value
    const headerDecorator = pluginContext.decorateHeaderRenderer.mock.calls[0][0]
    const mockHeaderBase = async () => 'MyApp v1.0.0'
    const mockContext = await createMockCommandContext({
      name: 'myapp',
      values: { format: 'table' }
    })
    const headerResult = await headerDecorator(mockHeaderBase, mockContext)
    expect(headerResult).toBe('📊 MyApp v1.0.0')

    // Test with default format
    const defaultContext = await createMockCommandContext({
      name: 'myapp',
      values: { format: 'json' }
    })
    const defaultHeaderResult = await headerDecorator(mockHeaderBase, defaultContext)
    expect(defaultHeaderResult).toBe('📝 MyApp v1.0.0')

    // Test usage decorator
    const usageDecorator = pluginContext.decorateUsageRenderer.mock.calls[0][0]
    const mockUsageBase = async () => 'Usage: myapp [options]'
    const usageResult = await usageDecorator(mockUsageBase, mockContext)
    expect(usageResult).toContain('Examples:')
    expect(usageResult).toContain('$ myapp deploy --format=yaml')

    // Test validation errors decorator
    const errorDecorator = pluginContext.decorateValidationErrorsRenderer.mock.calls[0][0]
    const mockErrorBase = async (ctx, error) => 'Invalid option value'
    const mockError = new AggregateError([], 'Validation failed')
    const errorResult = await errorDecorator(mockErrorBase, mockContext, mockError)
    expect(errorResult).toContain('⚠️  Validation Issues:')
    expect(errorResult).toContain('Run with --help for usage information.')
  })

  test('command uses global option', async () => {
    const pluginContext = createMockPluginContext()

    // Execute the plugin function directly with the plugin context
    await cliEnhancerPlugin(pluginContext)

    // Get the deploy command that was registered (second argument of addCommand)
    const deployCommand = pluginContext.addCommand.mock.calls[0][1]

    // Create a mock context with the global option value
    const cmdContext = await createMockCommandContext({
      name: 'deploy',
      values: {
        format: 'yaml'
      }
    })

    // Execute the command
    const result = await deployCommand.run(cmdContext)

    expect(result).toBe('Deployed successfully (format: yaml)')
  })
})
```

This test suite verifies that the plugin:

1. **Registers components**: Confirms that the global option, command, and all three decorators are properly registered
2. **Decorator functionality**: Tests that each decorator correctly transforms its input, including format-specific behavior
3. **Command integration**: Verifies that the command can access and use the global option

### The onExtension Callback

The `onExtension` callback is a lifecycle hook that runs after all plugin extensions have been created but before command execution. This allows plugins to perform cross-extension initialization, validate dependencies, or set up shared state.

#### Plugin Implementation Example

```typescript
// src/plugins/initialization-tracker-plugin.ts
import { plugin } from 'gunshi/plugin'

export interface InitializationTrackerExtension {
  isInitialized: boolean
  getInitTime: () => number | null
  getCommandName: () => string | null
}

/**
 * A simple plugin that tracks initialization state using the onExtension callback.
 * Demonstrates the lifecycle separation between extension creation and initialization.
 */
export default function initializationTracker() {
  // Shared state accessible to both extension and onExtension
  const sharedState = {
    initialized: false,
    initTime: null as number | null,
    commandName: null as string | null
  }

  return plugin({
    id: 'init-tracker',
    name: 'Initialization Tracker Plugin',

    extension: (ctx, cmd) => {
      // Extension is created but not yet initialized
      return {
        // Use getter to expose initialization state
        get isInitialized() {
          return sharedState.initialized
        },

        getInitTime: () => sharedState.initTime,

        getCommandName: () => sharedState.commandName
      }
    },

    onExtension: (ctx, cmd) => {
      // This runs after all extensions are created
      // Update shared state to mark as initialized
      sharedState.initialized = true
      sharedState.initTime = Date.now()
      sharedState.commandName = cmd.name

      // Could perform any post-creation initialization here
      // For example: validate environment, set up resources, etc.
    }
  })
}
```

This plugin demonstrates:

- **Lifecycle separation**: Extension creation happens first, initialization happens in onExtension
- **Shared state pattern**: Uses factory function scope to share state between callbacks
- **Initialization tracking**: Shows how to track when the plugin has been fully initialized
- **Command context access**: Both callbacks receive the command context for initialization

#### Testing the onExtension Callback

```typescript
// test/plugins/initialization-tracker-plugin.test.ts
import { describe, expect, test, vi } from 'vitest'
import initializationTracker from '../../src/plugins/initialization-tracker-plugin'
import { createMockCommandContext } from '../helper'

describe('onExtension callback', () => {
  test('extension is created but not initialized before onExtension runs', async () => {
    const plugin = initializationTracker()
    const command = {
      name: 'test',
      description: 'Test command',
      run: vi.fn()
    }

    // Create extension directly without calling onExtension
    const extension = plugin.extension({} as any, command)

    // Before onExtension runs, the extension should not be initialized
    expect(extension.isInitialized).toBe(false)
    expect(extension.getInitTime()).toBe(null)
    expect(extension.getCommandName()).toBe(null)
  })

  test('onExtension properly initializes the extension', async () => {
    const plugin = initializationTracker()
    const command = {
      name: 'deploy',
      description: 'Deploy command',
      run: vi.fn()
    }

    // Create mock context with the extension factory
    const ctx = await createMockCommandContext({
      extensions: {
        'init-tracker': plugin.extension
      },
      command
    })

    // After onExtension runs, the extension should be initialized
    expect(ctx.extensions['init-tracker'].isInitialized).toBe(true)
    expect(ctx.extensions['init-tracker'].getInitTime()).toBeGreaterThan(0)
    expect(ctx.extensions['init-tracker'].getCommandName()).toBe('deploy')
  })
})
```

This test suite verifies:

1. **Pre-initialization state**: Extensions are created but not initialized before onExtension runs
2. **Initialization effects**: The onExtension callback properly initializes the extension

> [!NOTE]
> **Key Testing Insights**
>
> - The `createMockCommandContext` helper automatically handles the plugin lifecycle, including calling onExtension
> - Focus tests specifically on the onExtension behavior rather than complex interactions
> - Verify both pre-initialization state and post-initialization effects

## Integration Testing

### Testing Complete Plugin Flow

Integration tests verify the entire plugin lifecycle with a real CLI instance:

```typescript
// Example plugin implementation for integration tests
import { plugin } from 'gunshi/plugin'

function createLoggingPlugin() {
  return plugin({
    id: 'logging-plugin',
    name: 'Logging Plugin',

    // Plugin extension - adds logging capabilities to command context
    extension: (ctx, cmd) => ({
      log: (message: string) => {
        if (ctx.values.verbose) {
          console.log(`[${cmd.name || 'anonymous'}] ${message}`)
        }
      },
      getExecutionTime: () => Date.now()
    }),

    // Plugin setup - adds global verbose option
    setup(ctx) {
      // Add global verbose option
      ctx.addGlobalOption('verbose', {
        type: 'boolean',
        short: 'v',
        description: 'Enable verbose logging'
      })

      // Decorate command execution
      ctx.decorateCommand(cmd => ({
        ...cmd,
        run: async ctx => {
          const startTime = Date.now()
          const result = await cmd.run?.(ctx)
          const duration = Date.now() - startTime

          if (ctx.values.verbose) {
            console.log(`Command executed in ${duration}ms`)
          }

          return result
        }
      }))
    }
  })
}
```

Now let's write integration tests for this plugin:

```typescript
import { describe, expect, test, vi } from 'vitest'
import { cli, define } from 'gunshi'
import { createLoggingPlugin } from './logging-plugin'

describe('plugin integration', () => {
  test('plugin adds global options to CLI', async () => {
    const plugin = createLoggingPlugin()
    const mockRun = vi.fn(() => 'success')

    // Create a command definition
    const command = define({
      name: 'test-command',
      description: 'Test command',
      run: mockRun
    })

    // Run CLI with plugin and verbose option
    await cli(['--verbose'], command, {
      plugins: [plugin]
    })

    expect(mockRun).toHaveBeenCalled()
    const ctx = mockRun.mock.calls[0][0]
    expect(ctx.values.verbose).toBe(true)
  })

  test('plugin decorates command execution', async () => {
    const plugin = createLoggingPlugin()
    const consoleSpy = vi.spyOn(console, 'log')

    const command = define({
      name: 'decorated',
      description: 'Decorated command',
      run: () => 'original result'
    })

    // Run with verbose flag to trigger decoration
    await cli(['--verbose'], command, {
      plugins: [plugin]
    })

    // Verify decoration was applied
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/Command executed in \d+ms/))

    consoleSpy.mockRestore()
  })
})
```

### Testing with Multiple Plugins

Testing plugin interactions requires careful consideration of dependencies and how plugins discover and use each other. The following example demonstrates a practical scenario with a logger plugin and a notification plugin that optionally depends on it.

#### Creating a Logger Plugin

First, let's create a simple logger plugin with debug and error methods:

```typescript
// Simplified logger plugin with just debug and error methods
export interface LoggerExtension {
  debug: (message: string) => void
  error: (message: string) => void
}

export function createLoggerPlugin() {
  return plugin<{}, 'logger', [], LoggerExtension>({
    id: 'logger',
    name: 'Logger Plugin',

    extension: (ctx, cmd) => {
      return {
        debug(message: string) {
          ctx.log(`[DEBUG] ${message}`)
        },
        error(message: string) {
          ctx.log(`[ERROR] ${message}`)
        }
      }
    }
  })
}
```

#### Creating a Notification Plugin with Dependencies

Now let's create a notification plugin that optionally uses the logger plugin:

```typescript
// Notification plugin that optionally uses logger for output
export interface NotificationExtension {
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
}

export function createNotificationPlugin() {
  return plugin<
    { logger?: LoggerExtension },
    'notification',
    [{ id: 'logger'; optional: true }],
    NotificationExtension
  >({
    id: 'notification',
    name: 'Notification Plugin',
    dependencies: [{ id: 'logger', optional: true }],

    extension: (ctx, cmd) => {
      // Discover logger at runtime
      const logger = ctx.extensions?.logger as LoggerExtension | undefined

      function notify(level: 'success' | 'error', icon: string, title: string, message?: string) {
        const output = message ? `${icon} ${title}: ${message}` : `${icon} ${title}`

        if (logger) {
          // Use logger when available
          level === 'success' ? logger.debug(output) : logger.error(output)
        } else {
          // Fallback to direct output
          ctx.log(output)
        }
      }

      return {
        success(title: string, message?: string) {
          notify('success', '✓', title, message)
        },
        error(title: string, message?: string) {
          notify('error', '✗', title, message)
        }
      }
    }
  })
}
```

#### Testing Plugin Interactions

Now let's write tests showing essential plugin interaction patterns:

```typescript
// plugins/notification.test.ts
import { describe, expect, test, vi, beforeEach } from 'vitest'
import { createLoggerPlugin } from './logger'
import { createNotificationPlugin } from './notification'
import { createMockCommandContext } from '../test/helper'

describe('Plugin Interactions', () => {
  let logSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    logSpy = vi.fn()
  })

  describe('notification with logger dependency', () => {
    test('uses logger when available', async () => {
      // Create both plugins
      const loggerPlugin = createLoggerPlugin()
      const notificationPlugin = createNotificationPlugin()

      const cmd = {
        name: 'test',
        description: 'Test command',
        run: vi.fn()
      }

      // Create context with logger extension
      const loggerCtx = {
        log: logSpy,
        extensions: {}
      }

      // Initialize logger extension
      const loggerExtension = loggerPlugin.extension(loggerCtx, cmd)

      // Create context with both extensions
      const ctx = await createMockCommandContext({
        command: cmd,
        extensions: {
          logger: loggerExtension,
          notification: notificationPlugin.extension
        },
        log: logSpy
      })

      // Test that notification uses logger
      ctx.extensions.notification.success('Operation completed')
      ctx.extensions.notification.error('Connection failed', 'Unable to reach server')

      // Verify logger was called with appropriate methods
      expect(logSpy).toHaveBeenCalledWith('[DEBUG] ✓ Operation completed')
      expect(logSpy).toHaveBeenCalledWith('[ERROR] ✗ Connection failed: Unable to reach server')
    })
  })

  describe('notification without logger (fallback behavior)', () => {
    test('falls back to direct output when logger is not available', async () => {
      const notificationPlugin = createNotificationPlugin()

      const cmd = {
        name: 'test',
        description: 'Test command',
        run: vi.fn()
      }

      // Create context without logger extension
      const ctx = await createMockCommandContext({
        command: cmd,
        extensions: {
          notification: notificationPlugin.extension
        },
        log: logSpy
      })

      // Test fallback behavior
      ctx.extensions.notification.success('Operation completed')
      ctx.extensions.notification.error('Something failed', 'Check your connection')

      // Should use direct ctx.log without logger formatting
      expect(logSpy).toHaveBeenCalledWith('✓ Operation completed')
      expect(logSpy).toHaveBeenCalledWith('✗ Something failed: Check your connection')
    })
  })

  describe('runtime plugin discovery', () => {
    test('dynamically detects available plugins', async () => {
      const notificationPlugin = createNotificationPlugin()

      const cmd = {
        name: 'test',
        description: 'Test command',
        run: vi.fn()
      }

      // First, create context without logger
      let ctx = await createMockCommandContext({
        command: cmd,
        extensions: {
          notification: notificationPlugin.extension
        },
        log: logSpy
      })

      ctx.extensions.notification.success('Starting without logger')
      expect(logSpy).toHaveBeenLastCalledWith('✓ Starting without logger')

      // Now create context with logger added
      const loggerPlugin = createLoggerPlugin()
      const loggerExtension = loggerPlugin.extension({ log: logSpy, extensions: {} }, cmd)

      ctx = await createMockCommandContext({
        command: cmd,
        extensions: {
          logger: loggerExtension,
          notification: notificationPlugin.extension
        },
        log: logSpy
      })

      ctx.extensions.notification.success('Now with logger')
      expect(logSpy).toHaveBeenLastCalledWith('[DEBUG] ✓ Now with logger')
    })
  })
})
```

Key testing patterns for multiple plugins:

- **Dependency Declaration**: Plugins declare their dependencies with optional flags to enable graceful degradation
- **Runtime Discovery**: Plugins discover available extensions through `ctx.extensions` at runtime
- **Fallback Behavior**: Always provide sensible defaults when optional dependencies are unavailable
- **Isolation Testing**: Test each plugin combination separately to verify integration boundaries
