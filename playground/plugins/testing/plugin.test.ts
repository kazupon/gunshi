import { cli, define } from 'gunshi'
import { createCommandContext } from 'gunshi/plugin'
import { describe, expect, test, vi } from 'vitest'
import { commandDecorator, headerRendererDecorator } from './decorators.ts'
import {
  debuggablePlugin,
  loggingPlugin,
  myPlugin,
  myPluginWithDependencies,
  myValidatingPlugin,
  notificationPlugin,
  trackerPlugin
} from './plugin.ts'

import type { PluginContext } from 'gunshi/plugin'
import type { PluginId } from './constants.ts'
import type { LoggingExtension, NotificationExtension } from './plugin.ts'
import type { MyPluginExtension } from './types.ts'

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

describe('dependency declaration', () => {
  test('declares dependencies correctly', () => {
    const plugin = myPluginWithDependencies()

    expect(plugin.dependencies).toContain('plugin-renderer')
    const optionalDep = plugin.dependencies?.find(dep => typeof dep === 'object' && dep.optional)
    expect(optionalDep).toEqual({ id: 'plugin-i18n', optional: true })
  })
})

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

// Mockup PluginContext
function mockupMockPluginContext(): PluginContext {
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
    const mockPluginContext = mockupMockPluginContext()
    const plugin = debuggablePlugin({ enable: true })

    // Run the plugin setup
    plugin(mockPluginContext)

    expect(mockPluginContext.addGlobalOption).toHaveBeenCalledWith(
      'debug',
      expect.objectContaining({ type: 'boolean', description: 'Enable debug mode', default: false })
    )
  })

  test('disable debug option', () => {
    const mockPluginContext = mockupMockPluginContext()
    const plugin = debuggablePlugin({ enable: false })

    plugin(mockPluginContext)

    expect(mockPluginContext.addGlobalOption).not.toHaveBeenCalledWith(
      'debug',
      expect.objectContaining({ type: 'boolean', description: 'Enable debug mode', default: false })
    )
  })
})

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
    // if we want to test for onExtension, we need to call onFactory manually
    await plugin.extension.onFactory?.(ctx, command)

    expect(extension.isInitialized).toBe(true)
    expect(extension.getInitTime()).toBeGreaterThan(0)
    expect(extension.getCommandName()).toBe('deploy')
  })
})

describe('command decraotor', () => {
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
