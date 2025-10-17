# Plugin Testing

Testing is crucial for ensuring plugin reliability and maintainability. This guide covers practical testing approaches for Gunshi plugins.

> [!IMPORTANT]
> The code examples in this guide focus on demonstrating testing patterns and techniques. For clarity and brevity, some examples may not include extensive explanations that would normally be present in Gunshi's documentation. The emphasis is on showing practical testing approaches rather than following all documentation style guidelines.

> [!NOTE]
> This guide uses [Vitest](https://vitest.dev/) as the testing framework. The concepts can be adapted to other testing frameworks.

> [!NOTE]
> Some code examples include TypeScript file extensions (`.ts`) in `import`/`export` statements. If you use this pattern, enable `allowImportingTsExtensions` in your `tsconfig.json`.

## Plugin Testing Fundamentals

Every Gunshi plugin requires thorough testing to ensure it integrates correctly with the CLI framework and behaves reliably across different scenarios. This section covers the essential concepts and basic testing approaches that form the foundation of plugin testing. You'll learn how to structure tests for plugins, use the testing utilities provided by Gunshi, and establish a solid testing foundation that scales with your plugin's complexity.

### Basic Plugin Structure

The following example demonstrates a minimal plugin structure that serves as our testing subject:

```ts [src/plugin.ts]
import { plugin } from 'gunshi/plugin'

export function myPlugin(options = {}) {
  return plugin({
    id: 'my-plugin',
    name: 'My Plugin',
    extension: (ctx, cmd) => ({
      greet: (name: string) => `Hello, ${name}!`
    })
  })
}
```

### Writing Your First Test

The following test file demonstrates basic plugin testing, including initialization and extension factory verification:

```ts [src/plugin.test.ts]
import { createCommandContext } from 'gunshi/plugin'
import { describe, expect, test, vi } from 'vitest'
import { myPlugin } from './plugin.ts'

describe('plugin initialization', () => {
  test('create plugin with default options', () => {
    const plugin = myPlugin()

    expect(plugin.id).toBe('my-plugin')
    expect(plugin.name).toBe('My Plugin')
    expect(plugin.extension.factory).toBeDefined()
  })

  test('plugin extension factory creates correct methods', async () => {
    const plugin = myPlugin()
    const mockCommand = {
      name: 'test',
      description: 'Test command',
      run: vi.fn()
    }

    const mockContext = await createCommandContext({
      command: mockCommand
    })

    const extension = await plugin.extension.factory(mockContext, mockCommand)

    expect(extension.greet).toBeDefined()
    expect(typeof extension.greet).toBe('function')
    expect(extension.greet('World')).toBe('Hello, World!')
  })
})
```

### Moving Beyond Basic Tests

The example above demonstrates fundamental plugin testing. As your plugins grow more complex, you'll need to test additional aspects to ensure reliability and maintainability. The following sections cover comprehensive testing approaches for:

- Plugin configuration - Validating options and handling invalid inputs
- Extension behaviors - Testing complex extension methods and async operations
- Lifecycle management - Verifying setup functions and onExtension callbacks
- Decorator patterns - Testing command and renderer decorators
- Integration scenarios - Ensuring plugins work correctly with real CLI instances

Each section includes practical examples and testing techniques you can adapt to your plugins. To run your tests after implementing them, use:

```sh
# Run all tests
vitest run
```

Let's start by exploring how to test plugin configuration validation.

## Testing Plugin Configuration

Plugins often accept configuration options that modify their behavior, validate input, or declare dependencies on other plugins. Robust configuration testing ensures your plugin handles both valid and invalid inputs gracefully, properly validates options at creation time, and correctly declares its dependencies. This section demonstrates comprehensive approaches to testing all aspects of plugin configuration, from basic validation to complex dependency scenarios.

### Configuration Validation

Plugins should validate configuration during creation:

```ts [src/plugin.ts]
import { plugin } from 'gunshi/plugin'

export function myValidatingPlugin(options: { locale: string; timeout?: number }) {
  if (options.locale && !options.locale.match(/^[a-z]{2}-[A-Z]{2}$/)) {
    throw new Error('Invalid locale format')
  }
  if (options.timeout !== undefined && options.timeout < 0) {
    throw new Error('Timeout must be positive')
  }

  return plugin({
    id: 'validating-plugin',
    name: 'Validating Plugin',
    extension: (ctx, cmd) => ({
      validate: () => true,
      config: options
    })
  })
}
```

### Testing Configuration Behavior

Test your configuration validation logic with these testing approaches:

```ts [src/plugin.test.ts]
import { createCommandContext } from 'gunshi/plugin'
import { describe, expect, test, vi } from 'vitest'
import { myValidatingPlugin } from './plugin.ts'

describe('configuration validation', () => {
  test('validates configuration at creation time', () => {
    expect(() => myValidatingPlugin({ locale: 'invalid' })).toThrow('Invalid locale format')
    expect(() => myValidatingPlugin({ locale: 'en-US', timeout: -1 })).toThrow(
      'Timeout must be positive'
    )
  })

  test('plugin uses configuration in extension', async () => {
    const plugin = myValidatingPlugin({ locale: 'ja-JP', timeout: 5000 })
    const mockCommand = { name: 'test', description: 'Test', run: vi.fn() }

    const ctx = await createCommandContext({ command: mockCommand })
    const extension = await plugin.extension.factory(ctx, mockCommand)

    expect(extension.config.locale).toBe('ja-JP')
    expect(extension.config.timeout).toBe(5000)
  })
})
```

### Dependency Declaration

Define a plugin with dependencies using the following structure:

```ts [src/plugin.ts]
import { plugin } from 'gunshi/plugin'

export function myPluginWithDependencies() {
  return plugin({
    id: 'dependent-plugin',
    name: 'Dependent Plugin',
    dependencies: ['plugin-renderer', { id: 'plugin-i18n', optional: true }],
    extension: (ctx, cmd) => ({
      render: () => 'rendered'
    })
  })
}
```

Test dependency declarations:

```ts [src/plugin.test.ts]
import { describe, expect, test } from 'vitest'
import { myPluginWithDependencies } from './plugin.ts'

describe('dependency declaration', () => {
  test('declares dependencies correctly', () => {
    const plugin = myPluginWithDependencies()

    expect(plugin.dependencies).toContain('plugin-renderer')
    const optionalDep = plugin.dependencies?.find(dep => typeof dep === 'object' && dep.optional)
    expect(optionalDep).toEqual({ id: 'plugin-i18n', optional: true })
  })
})
```

## Testing Extensions

Extensions are the heart of Gunshi plugins, providing the actual functionality that commands can use. Testing extensions requires special attention to their interaction with the command context, handling of asynchronous operations, and proper state management. This section explores various patterns for testing extensions using the `createCommandContext` helper, covering both simple synchronous methods and complex asynchronous workflows that interact with external resources.

### Testing with `createCommandContext`

The `createCommandContext` helper provides a complete context for testing extensions:

```ts [src/plugin.test.ts]
import { createCommandContext } from 'gunshi/plugin'
import { expect, test } from 'vitest'
import { myPlugin } from './plugin.ts'

test('extension factory creates correct extension', async () => {
  const plugin = myPlugin({ debug: true })

  const command = { name: 'test', description: 'Test', run: vi.fn() }
  const ctx = await createCommandContext({
    command,
    values: { verbose: true },
    cliOptions: {
      version: '1.0.0'
    }
  })

  const extension = await plugin.extension.factory(ctx, command)

  expect(extension.someMethod).toBeDefined()
  const result = extension.someMethod()
  expect(result).toBe('expected value')
})
```

### Testing Complex Extension Methods

The following example demonstrates how to test extension methods that interact with the command context:

```ts [src/plugin.test.ts]
import { createCommandContext } from 'gunshi/plugin'
import { describe, expect, test, vi } from 'vitest'
import { myPlugin } from './plugin.ts'

describe('extension methods', () => {
  test('showVersion displays version correctly', async () => {
    const plugin = myPlugin()

    const command = { name: 'app', description: 'App', run: vi.fn() }
    const ctx = await createCommandContext({
      command,
      cliOptions: { version: '2.0.0', name: 'test-app' }
    })

    const extension = await plugin.extension.factory(ctx, command)
    const result = extension.showVersion()

    expect(result).toBe('2.0.0')
  })

  test('handles missing version', async () => {
    const plugin = myPlugin()

    const command = { name: 'app', description: 'App', run: vi.fn() }
    const ctx = await createCommandContext({
      command,
      cliOptions: { version: undefined, name: 'test-app' }
    })

    const extension = await plugin.extension.factory(ctx, command)
    const result = extension.showVersion()

    expect(result).toBe('unknown')
  })
})
```

### Testing Async Extensions

The following examples show how to test asynchronous extension factories that load configuration and handle errors:

```ts [src/plugin.test.ts]
import { createCommandContext } from 'gunshi/plugin'
import { describe, expect, test, vi } from 'vitest'
import myPlugin from './plugin.ts'

describe('async extension', () => {
  test('extension factory loads configuration', async () => {
    const loadConfig = vi.fn().mockReturnValue({
      apiUrl: 'https://api.example.com',
      timeout: 5000
    })
    const plugin = myPlugin({ loadConfig })
    const command = { name: 'test', description: 'Test', run: vi.fn() }
    const ctx = await createCommandContext({ command })
    const extension = await plugin.extension.factory(ctx, command)

    expect(loadConfig).toHaveBeenCalled()
    expect(extension.getConfig()).toEqual({
      apiUrl: 'https://api.example.com',
      timeout: 5000
    })
  })

  test('handles initialization errors gracefully', async () => {
    const warnMock = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const loadConfig = vi.fn().mockRejectedValue(new Error('Config not found'))
    const plugin = myPlugin({ loadConfig })
    const command = { name: 'test', description: 'Test', run: vi.fn() }
    const ctx = await createCommandContext({ command })
    const extension = await plugin.extension.factory(ctx, command)

    expect(extension.getConfig()).toEqual({
      apiUrl: 'http://localhost:3000',
      timeout: 3000
    })
    expect(warnMock).toHaveBeenCalledWith('Failed to load config:', expect.any(Error))
  })
})
```

## Testing Lifecycle

Gunshi plugins follow a specific lifecycle with distinct phases: initialization through the setup function and post-creation callbacks via onExtension. Understanding and testing these lifecycle hooks is essential for plugins that modify the CLI structure, add global options, or maintain shared state across commands.

This section covers strategies for testing each lifecycle phase and ensuring your plugin integrates seamlessly with the CLI initialization process.

### Testing the `setup` Function

The `setup` function runs when the plugin is registered:

```ts [src/plugin.ts]
import { plugin } from 'gunshi/plugin'

export interface DebuggablePluginOptions {
  enable?: boolean
}

export function debuggablePlugin({ enable = true }: DebuggablePluginOptions) {
  return plugin({
    id: 'debuggable-plugin',
    name: 'Debuggable Plugin',
    setup: ctx => {
      if (enable) {
        ctx.addGlobalOption('debug', {
          type: 'boolean',
          description: 'Enable debug mode',
          default: false
        })
      }
    }
  })
}
```

Test `setup` behavior:

```ts [src/plugin.test.ts]
import { createCommandContext } from 'gunshi/plugin'
import { describe, expect, test, vi } from 'vitest'
import { debuggablePlugin } from './plugin.ts'

// Mockup PluginContext
function mockPluginContext(): PluginContext {
  return {
    subCommands: new Map(),
    globalOptions: new Map(),
    addGlobalOption: vi.fn(),
    addCommand: vi.fn(),
    hasCommand: vi.fn(),
    decorateCommand: vi.fn(),
    decorateUsageRenderer: vi.fn(),
    decorateHeaderRenderer: vi.fn(),
    decorateValidationErrorsRenderer: vi.fn()
  }
}

describe('debuggable plugin', () => {
  test('enable debug option', async () => {
    const mockPluginCtx = mockPluginContext()
    const plugin = debuggablePlugin({ enable: true })

    // Run the plugin setup
    plugin(mockPluginCtx)

    expect(mockPluginCtx.addGlobalOption).toHaveBeenCalledWith(
      'debug',
      expect.objectContaining({ type: 'boolean', description: 'Enable debug mode', default: false })
    )
  })

  test('disable debug option', () => {
    const mockPluginCtx = mockPluginContext()
    const plugin = debuggablePlugin({ enable: false })

    plugin(mockPluginCtx)

    expect(mockPluginCtx.addGlobalOption).not.toHaveBeenCalledWith(
      'debug',
      expect.objectContaining({ type: 'boolean', description: 'Enable debug mode', default: false })
    )
  })
})
```

### Testing the `onExtension` Callback

The `onExtension` callback runs after extensions are created:

```ts [src/plugin.ts]
import { plugin } from 'gunshi/plugin'

interface TrackerState {
  initialized: boolean
  initTime?: number | undefined
  commandName?: string | undefined
}

export function trackerPlugin() {
  const sharedState = {
    initialized: false,
    initTime: null as number | null,
    commandName: null as string | null
  }

  return plugin({
    id: 'tracker-plugin',
    name: 'Tracker Plugin',

    extension: (ctx, cmd) => ({
      get isInitialized() {
        return sharedState.initialized
      },
      getInitTime: () => sharedState.initTime,
      getCommandName: () => sharedState.commandName
    }),

    onExtension: (ctx, cmd) => {
      sharedState.initialized = true
      sharedState.initTime = Date.now()
      sharedState.commandName = cmd.name
    }
  })
}
```

Test `onExtension` behavior:

```ts [src/plugin.test.ts]
import { createCommandContext } from 'gunshi/plugin'
import { describe, expect, test, vi } from 'vitest'
import { trackerPlugin } from './init-tracker.ts'

describe('onExtension callback', () => {
  test('extension not initialized before onExtension', async () => {
    const plugin = trackerPlugin()
    const command = { name: 'test', description: 'Test', run: vi.fn() }
    const ctx = await createCommandContext({ command })
    const extension = await plugin.extension.factory(ctx, command)

    expect(extension.isInitialized).toBe(false)
    expect(extension.getInitTime()).toBeUndefined()
  })

  test('onExtension initializes extension', async () => {
    const plugin = trackerPlugin()
    const command = { name: 'deploy', description: 'Deploy', run: vi.fn() }
    const ctx = await createCommandContext({ command })
    const extension = await plugin.extension.factory(ctx, command)
    await plugin.extension.onFactory?.(ctx, command)

    expect(extension.isInitialized).toBe(true)
    expect(extension.getInitTime()).toBeGreaterThan(0)
    expect(extension.getCommandName()).toBe('deploy')
  })
})
```

## Testing Decorators

Decorators allow plugins to wrap and enhance existing command runners and renderers, adding functionality like logging, error handling, or output formatting. Testing decorators requires verifying both their enhancement behavior and their ability to properly delegate to the underlying functions. This section demonstrates techniques for testing command and renderer decorators, ensuring they intercept correctly when needed and pass through transparently when appropriate.

### Command Decorator Testing

Test decorators that wrap command runners:

```ts [src/decorator.test.ts]
import { createCommandContext } from 'gunshi/plugin'
import { describe, expect, test, vi } from 'vitest'
import { commandDecorator } from './decorators.ts'

describe('command decorator', () => {
  test('intercepts help option', async () => {
    const usage = 'Usage: test [options]'

    const ctx = await createCommandContext({
      command: { name: 'test', description: 'Test', run: vi.fn() },
      values: { help: true },
      cliOptions: {
        renderUsage: async () => usage
      }
    })

    const baseRunner = vi.fn(() => 'command executed')
    const decoratedRunner = commandDecorator(baseRunner)
    const result = await decoratedRunner(ctx)

    expect(result).toBe(usage)
    expect(baseRunner).not.toHaveBeenCalled()
  })

  test('passes through normally', async () => {
    const ctx = await createCommandContext({
      command: { name: 'test', description: 'Test', run: vi.fn() }
    })

    const baseRunner = vi.fn(() => 'command executed')
    const decoratedRunner = commandDecorator(baseRunner)
    const result = await decoratedRunner(ctx)

    expect(result).toBe('command executed')
    expect(baseRunner).toHaveBeenCalledWith(ctx)
  })
})
```

### Testing Renderer Decorators

The following example shows how to test extensions that interact with renderer decorators:

```ts [src/renderer.test.ts]
import { createCommandContext } from 'gunshi/plugin'
import { expect, test, vi } from 'vitest'
import myPlugin from './plugin.ts'
import { headerRendererDecorator } from './decorators.ts'

import type { PluginId } from './constants.ts'
import type { MyPluginExtension } from './types.ts'

describe('renderer decorators: decorateHeaderRenderer', async () => {
  test('render header with renderHeader option', async () => {
    const plugin = myPlugin()
    const header = 'Test Application v1.0.0'
    const ctx = await createCommandContext<{ extensions: Record<PluginId, MyPluginExtension> }>({
      command: { name: 'app', description: 'App', run: vi.fn() },
      extensions: {
        [plugin.id]: plugin.extension
      },
      cliOptions: {
        renderHeader: async () => header
      }
    })

    const baseRunner = vi.fn<Parameters<typeof headerRendererDecorator>[0]>(
      async () => 'header rendered'
    )
    const rendered = await headerRendererDecorator(baseRunner, ctx)
    expect(rendered).toBe(header)
    expect(baseRunner).not.toHaveBeenCalled()
  })

  test('not render Header without renderHeader option', async () => {
    const plugin = myPlugin()
    const ctx = await createCommandContext<{ extensions: Record<PluginId, MyPluginExtension> }>({
      command: { name: 'app', description: 'App', run: vi.fn() },
      extensions: {
        [plugin.id]: plugin.extension
      }
    })

    const baseRunner = vi.fn<Parameters<typeof headerRendererDecorator>[0]>(
      async () => 'header rendered'
    )
    const rendered = await headerRendererDecorator(baseRunner, ctx)
    expect(rendered).toBe('header rendered')
  })
})
```

## Integration Testing

While unit tests verify individual plugin components, integration tests ensure your plugin works correctly within a complete CLI environment with real command instances and potentially multiple interacting plugins. These tests validate the entire plugin lifecycle from registration through execution, including dependency resolution and inter-plugin communication. This section provides patterns for comprehensive integration testing that catches issues unit tests might miss.

### Testing Complete Plugin Flow

Integration tests verify the entire plugin lifecycle. The following example shows a logging plugin that we'll use for integration testing:

```ts [src/plugin.ts]
import { plugin } from 'gunshi/plugin'

export interface LoggingExtension {
  log: (message: string) => void
}

export function loggingPlugin() {
  return plugin({
    id: 'logging-plugin',
    name: 'Logging Plugin',

    extension: (ctx, cmd) => ({
      log: (message: string) => {
        if (ctx.values.verbose) {
          console.log(`[${cmd.name}] ${message}`)
        }
      }
    }),

    setup(ctx) {
      ctx.addGlobalOption('verbose', {
        type: 'boolean',
        short: 'V',
        description: 'Enable verbose logging'
      })
    }
  })
}
```

Test with real CLI instance:

```ts [src/plugin.test.ts]
import { describe, expect, test, vi } from 'vitest'
import { cli, define } from 'gunshi'
import { loggingPlugin } from './plugin.ts'

describe('plugin integration', () => {
  test('plugin adds global options to CLI', async () => {
    const plugin = loggingPlugin()
    const mockRun = vi.fn(() => 'success')
    const command = define({
      name: 'test-command',
      description: 'Test command',
      run: mockRun
    })
    await cli(['--verbose'], command, {
      plugins: [plugin]
    })

    expect(mockRun).toHaveBeenCalledWith(
      expect.objectContaining({
        values: {
          verbose: true
        }
      })
    )
  })
})
```

### Testing Multiple Plugins

Test plugin interactions with dependencies:

```ts [src/plugin.ts]
import { plugin } from 'gunshi/plugin'

export interface NotificationExtension {
  notify: (message: string) => void
}

const notificationDependencies = [{ id: 'logging-plugin', optional: true }] as const

export function notificationPlugin() {
  return plugin<
    Record<'logging-plugin', LoggingExtension>,
    'notification-plugin',
    typeof notificationDependencies
  >({
    id: 'notification-plugin',
    name: 'Notification Plugin',
    dependencies: notificationDependencies,
    extension: (ctx, cmd) => {
      const logger = ctx.extensions['logging-plugin']?.log
      return {
        notify(message: string) {
          if (logger) {
            logger(`[DEBUG] ${message}`)
          } else {
            console.log(message)
          }
        }
      }
    }
  })
}
```

Test plugin discovery and fallback:

```ts [src/plugin.test.ts]
import { createCommandContext } from 'gunshi/plugin'
import { describe, expect, test, vi } from 'vitest'
import { loggingPlugin, notificationPlugin } from './plugin.ts'

import type { LoggingExtension, NotificationExtension } from './plugin.ts'

describe('plugin interactions', () => {
  test('uses logger when available', async () => {
    const command = { name: 'test', description: 'Test', run: vi.fn() }

    const logging = loggingPlugin()
    const notification = notificationPlugin()

    const logSpy = vi.fn()
    vi.spyOn(logging.extension, 'factory').mockImplementation(async () => {
      return { log: logSpy }
    })
    const ctx = await createCommandContext<{
      extensions: Record<'logging-plugin', LoggingExtension> &
        Record<'notification-plugin', NotificationExtension>
    }>({
      command,
      extensions: {
        [logging.id]: logging.extension,
        [notification.id]: notification.extension
      }
    })

    ctx.extensions['notification-plugin'].notify('Hello')
    expect(logSpy).toHaveBeenCalledWith('[DEBUG] Hello')
  })

  test('falls back when logger missing', async () => {
    const command = { name: 'test', description: 'Test', run: vi.fn() }
    const notification = notificationPlugin()

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const ctx = await createCommandContext<{
      extensions: Record<'notification-plugin', NotificationExtension>
    }>({
      command,
      extensions: {
        [notification.id]: notification.extension
      }
    })

    ctx.extensions['notification-plugin'].notify('Hello')
    expect(logSpy).toHaveBeenCalledWith('Hello')
  })
})
```

## Testing Techniques Reference

This reference section consolidates the key testing techniques and principles covered throughout this guide into a quick-access format. Use these techniques as templates for your own plugin tests, adapting them to your specific requirements while maintaining the core testing principles that ensure plugin reliability and maintainability.

### Quick Reference

The following code snippets provide quick examples of common testing approaches:

```ts
// Structure validation
expect(plugin.id).toBe('plugin-id')
expect(plugin.dependencies).toContain('dependency-id')

// Configuration validation
expect(() => plugin({ invalid: true })).toThrow()

// Extension testing with createCommandContext
const ctx = await createCommandContext({ command, values, cliOptions })
const extension = await plugin.extension.factory(ctx, command)

// Async extension testing
const loadConfig = vi.fn().mockReturnValue(config)
const plugin = myPlugin({ loadConfig })

// Lifecycle testing
plugin(mockPluginContext)
plugin.extension.onFactory?.(ctx, command)

// Command decorator testing
const commandDecorated = commandDecorator(baseRunner)
const result = await commandDecorated(ctx)

// Renderer decorators testing
const rendered = await rendererDecorator(baseRunner, ctx)

// Integration testing
await cli(['--option'], command, { plugins: [plugin] })

// Multiple plugins
const ctx = await createCommandContext({
  extensions: {
    plugin1: plugin1.extension,
    plugin2: plugin2.extension
  }
})
```

### Key Testing Principles

1. Test behavior, not implementation: Focus on what the plugin does, not how
2. Use createCommandContext: Provides complete type-safe context for testing
3. Test edge cases: Invalid config, missing dependencies, async failures
4. Isolate tests: Each test should be independent and deterministic
5. Mock external dependencies: File system, network calls, timers
6. Test lifecycle hooks: setup, onExtension, decorators
7. Verify integration: Test plugins working together in real CLI

### Common Testing Scenarios

- Plugin initialization with various configurations
- Extension method behavior with different context states
- Async operations and error handling
- Dependency resolution and fallback behavior
- Decorator application and pass-through
- Global option and command registration
- Multi-plugin interactions and discovery

### Type-Safe Testing

The following example demonstrates creating a fully type-safe plugin with compile-time dependency checking:

```ts
import { plugin } from 'gunshi/plugin'
import type { LoggerExtension } from './plugins/logger.ts'
import type { MyExtension } from './types.ts'

const typedPlugin = plugin<{ logger: LoggerExtension }, 'my-plugin', ['logger'], MyExtension>({
  id: 'my-plugin',
  dependencies: ['logger'],
  extension: (ctx, cmd) => ({
    doSomething: () => {
      ctx.extensions.logger.debug('Working')
      return 'done'
    }
  })
})
```

This ensures compile-time type safety for dependencies and extensions.

> [!TIP]
> The example fully code is [here](https://github.com/kazupon/gunshi/tree/main/playground/plugins/testing).

## Next Steps

Now that you've mastered testing strategies for Gunshi plugins—from unit testing individual components to integration testing with real CLI contexts—you're ready to apply professional development practices.

The next chapter, [Plugin Development Guidelines](./guidelines.md), provides comprehensive guidelines for building production-ready plugins, including performance optimization, error handling strategies, and documentation standards that will help you create robust and maintainable plugins for the Gunshi ecosystem.
