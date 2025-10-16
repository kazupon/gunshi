import { pluginId as authId } from '../plugins/auth.ts'
import { pluginId as databaseId } from '../plugins/database.ts'
import { pluginId as loggerId } from '../plugins/logger.ts'

import { defineWithTypes } from 'gunshi'
import type { AuthExtension, PluginId as AuthId } from '../plugins/auth.ts'
import type { DatabaseExtension, PluginId as DatabaseId } from '../plugins/database.ts'
import type { LoggerExtension, PluginId as LoggerId } from '../plugins/logger.ts'

type CombinedExtensions = Record<LoggerId, LoggerExtension> &
  Record<AuthId, AuthExtension> &
  Record<DatabaseId, DatabaseExtension>

export default defineWithTypes<{ extensions: CombinedExtensions }>()({
  name: 'query',
  description: 'Query database tables',
  args: {
    table: { type: 'string', required: true }
  },
  run: async ctx => {
    // All extensions and arguments are fully typed
    ctx.extensions[loggerId]?.log(`Querying ${ctx.values.table}`)

    // Check read permissions for the specific table
    if (!ctx.extensions[authId]?.hasPermission('read', ctx.values.table)) {
      throw new Error(`No read access to table: ${ctx.values.table}`)
    }

    // Perform the query using the database extension
    const dataset = await ctx.extensions[databaseId]?.query(ctx.values.table)
    console.log(`Retrieved records from ${ctx.values.table}`, dataset)
  }
})
