import { plugin } from 'gunshi/plugin'

export default plugin({
  id: 'timing',
  name: 'Timing Plugin',

  setup: ctx => {
    ctx.decorateCommand(baseRunner => async ctx => {
      const start = Date.now()

      ctx.log(`⏱️ Starting ${ctx.name}...`)

      try {
        const result = await baseRunner(ctx)
        const duration = Date.now() - start
        ctx.log(`✅ Completed in ${duration}ms`)
        return result
      } catch (error) {
        const duration = Date.now() - start
        ctx.log(`❌ Failed after ${duration}ms`)
        throw error
      }
    })
  }
})
