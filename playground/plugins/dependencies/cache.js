import { plugin } from 'gunshi/plugin'

// Plugin with one required dependency
export default plugin({
  id: 'cache',
  dependencies: ['logger'],
  setup: ctx => {
    console.log('2. Cache plugin loaded (depends on logger)')
  },
  extension: ctx => ({
    get: key => {
      ctx.extensions.logger.log(`Cache get: ${key}`)
      return null
    }
  })
})
