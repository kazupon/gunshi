import { plugin } from 'gunshi/plugin'
import { pluginId } from './constants.ts'
import { commandDecorator, headerRendererDecorator } from './decorators.ts'

import type { PluginId } from './constants.ts'
import type { MyPluginExtension, MyPluginOptions } from './types.ts'

export function myPlugin(options: MyPluginOptions = {}) {
  const DEFAULT_CONFIG = { apiUrl: 'http://localhost:3000', timeout: 3000 }

  return plugin<{}, PluginId, [], MyPluginExtension>({
    id: pluginId,
    name: 'My Plugin',
    setup(pluginCtx) {
      pluginCtx.decorateCommand(commandDecorator)
      pluginCtx.decorateHeaderRenderer(headerRendererDecorator)
    },
    extension: async (ctx, cmd) => {
      let config = DEFAULT_CONFIG
      try {
        config = { ...DEFAULT_CONFIG, ...(await options.loadConfig?.()) }
      } catch (error) {
        console.warn('Failed to load config:', error)
      }

      return {
        greet: (name: string) => `Hello, ${name}!`,
        someMethod: () => 'expected value',
        showVersion: () => ctx.env.version || 'unknown',
        showHeader: async () => {
          if (ctx.env.renderHeader) {
            const header = await ctx.env.renderHeader(ctx)
            if (header) {
              return header
            }
          }
          return ''
        },
        getConfig: () => ({ ...config })
      }
    }
  })
}

export function myValidatingPlugin(options: { locale: string; timeout?: number }) {
  if (options.locale && !/^[a-z]{2}-[A-Z]{2}$/.test(options.locale)) {
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

interface TrackerState {
  initialized: boolean
  initTime?: number | undefined
  commandName?: string | undefined
}

export function trackerPlugin() {
  const sharedState: TrackerState = {
    initialized: false
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
