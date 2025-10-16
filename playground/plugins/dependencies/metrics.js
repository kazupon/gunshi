import { plugin } from 'gunshi/plugin'

// Plugin with optional dependency
export default plugin({
  id: 'metrics',
  dependencies: ['logger', { id: 'cache', optional: true }],
  setup: ctx => {
    console.log('4. Metrics plugin loaded (depends on logger, optionally cache)')
  },
  extension: ctx => ({
    track: event => {
      ctx.extensions.logger.log(`Tracking: ${event}`)
      // Use cache if available
      if (ctx.extensions.cache) {
        ctx.extensions.cache.get(`metrics:${event}`)
      }
    }
  })
})
