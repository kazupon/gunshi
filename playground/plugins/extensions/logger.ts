import { plugin } from 'gunshi/plugin'

// Define the extension interface
export interface LoggerExtension {
  log: (message: string) => void
  error: (message: string) => void
  warn: (message: string) => void
  debug: (message: string) => void
}

// Export for other plugins to use
export const pluginId = 'logger' as const

export type PluginId = typeof pluginId

// Implement the extension
export default plugin({
  id: pluginId,
  extension: (): LoggerExtension => ({
    log: msg => console.log(msg),
    error: msg => console.error(msg),
    warn: msg => console.warn(msg),
    debug: msg => console.debug(msg)
  })
})
