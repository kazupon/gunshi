import { plugin } from 'gunshi/plugin'

// Type definitions for the Logger plugin
export const pluginId = 'mycompany:logger' as const
type PluginId = typeof pluginId

export interface LoggerExtension {
  log: (message: string) => void
  error: (message: string) => void
  warn: (message: string) => void
  debug: (message: string) => void
}

// Logger plugin factory
export default function logger() {
  return plugin<{}, PluginId, [], LoggerExtension>({
    id: pluginId,
    name: 'Logger Plugin',

    extension: (): LoggerExtension => ({
      log: (msg: string) => console.log(`[LOG] ${msg}`),
      error: (msg: string) => console.error(`[ERROR] ${msg}`),
      warn: (msg: string) => console.warn(`[WARN] ${msg}`),
      debug: (msg: string) => console.debug(`[DEBUG] ${msg}`)
    })
  })
}
