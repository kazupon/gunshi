import { plugin } from 'gunshi/plugin'

export interface CacheExtension {
  get: <T>(key: string) => T | undefined
  set: <T>(key: string, value: T) => void
  clear: () => void
  size: () => number
}

export default plugin({
  id: 'cache',

  extension: (ctx, cmd) => {
    // Create command-specific cache
    const cache = new Map<string, unknown>()
    const commandName = cmd.name || 'global'
    const debug = ctx.values.debug === true

    return {
      get: <T>(key: string): T | undefined => {
        const value = cache.get(key) as T | undefined
        if (debug && value !== undefined) {
          console.log(`[${commandName}] Cache hit: ${key}`)
        }
        return value
      },

      set: <T>(key: string, value: T) => {
        cache.set(key, value)
        if (debug) {
          console.log(`[${commandName}] Cache set: ${key}`)
        }
      },

      clear: () => cache.clear(),
      size: () => cache.size
    }
  }
})
