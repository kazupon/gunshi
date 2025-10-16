import { plugin } from 'gunshi/plugin'
import { pluginId as loggerId } from './logger.ts'

import type { LoggerExtension, PluginId as LoggerId } from './logger.ts'

function createPool() {
  // Simulate a database connection pool
  return {
    query: <T>(sql: string) => {
      console.log(`Executing query: ${sql}`)
      return Promise.resolve<T>({} as T)
    },
    connect: () => {
      console.log('Connecting to database...')
      return Promise.resolve()
    },
    disconnect: () => {
      console.log('Disconnecting from database...')
      return Promise.resolve()
    }
  }
}

export interface DatabaseExtension {
  query: <T>(sql: string) => Promise<Awaited<T>>
  connect: () => Promise<void>
  disconnect: () => Promise<void>
}

export const pluginId = 'mycompany:database' as const
export type PluginId = typeof pluginId

const dependencies = [
  { id: loggerId, optional: true } // Optional dependency
] as const

export default function database() {
  return plugin<
    Record<LoggerId, LoggerExtension>,
    PluginId,
    typeof dependencies,
    DatabaseExtension
  >({
    id: pluginId,
    dependencies,

    extension: () => {
      // Create the extension object
      const pool = createPool()

      return {
        query: (sql: string) => pool.query(sql),
        connect: () => pool.connect(),
        disconnect: () => pool.disconnect()
      }
    },

    onExtension: async (ctx, cmd) => {
      // Called during Step J: Execute onExtension
      // All extensions are now available

      // Access your own extension
      const db = ctx.extensions[pluginId]

      // Interact with other extensions if available
      if (ctx.extensions[loggerId]) {
        ctx.extensions[loggerId].log('Database plugin initialized')
      }

      // Perform command-specific initialization
      if (cmd.name === 'migrate' || cmd.name === 'seed') {
        await db.connect()

        if (ctx.extensions[loggerId]) {
          ctx.extensions[loggerId].log('Database connected')
        }
      }
    }
  })
}
