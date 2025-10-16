import { plugin } from 'gunshi/plugin'

// Plugin that depends on other dependent plugins
export default plugin({
  id: 'api',
  dependencies: ['auth', 'metrics'],
  setup: ctx => {
    console.log('5. API plugin loaded (depends on auth, metrics)')
  },
  extension: ctx => ({
    request: endpoint => {
      if (ctx.extensions.auth.isAuthenticated()) {
        ctx.extensions.metrics.track(`api:${endpoint}`)
        return { success: true }
      }
      return { success: false }
    }
  })
})
