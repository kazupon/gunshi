import { cli } from 'gunshi'
import cache from './cache.ts'
import database from './database.ts'
import logger from './logger.ts'
import metrics from './metrics.ts'

import type { LoggerExtension, PluginId as LoggerId } from './logger.ts'

await cli<Record<LoggerId, LoggerExtension>>(
  process.argv.slice(2),
  ({ extensions: { logger } }) => {
    logger.log('Starting application with extensions...')
  },
  {
    plugins: [metrics, logger, database, cache]
  }
)
