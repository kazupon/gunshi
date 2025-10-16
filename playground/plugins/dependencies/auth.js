import { plugin } from 'gunshi/plugin'

// Plugin with multiple dependencies
export default plugin({
  id: 'auth',
  dependencies: ['logger', 'cache'],
  setup: ctx => {
    console.log('3. Auth plugin loaded (depends on logger, cache)')
  },
  extension: ctx => ({
    isAuthenticated: () => {
      ctx.extensions.logger.log('Checking authentication')
      ctx.extensions.cache.get('auth-token')
      return true
    }
  })
})
