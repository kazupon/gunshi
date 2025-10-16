import { cli, define } from 'gunshi'
import api from './api.js'
import auth from './auth.js'
import cache from './cache.js'
import logger from './logger.js'
import metrics from './metrics.js'

// Command to demonstrate plugin loading
const command = define({
  name: 'demo',
  run: ctx => {
    console.log('\n=== Command execution starts ===')

    // Use various plugin extensions
    ctx.extensions.logger.log('Command running')
    ctx.extensions.api.request('/users')

    console.log('=== Command execution ends ===')
  }
})

// Run with plugins in random order - Gunshi will resolve correct order
await cli(process.argv.slice(2), command, {
  plugins: [
    // Intentionally provide in wrong order
    api, // Depends on auth, metrics
    auth, // Depends on logger, cache
    metrics, // Depends on logger, optionally cache
    logger, // No dependencies
    cache // Depends on logger
  ]
})
