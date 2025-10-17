import { plugin } from 'gunshi/plugin'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

export default plugin({
  id: 'multi-decorator',
  setup(ctx) {
    // First decorator: Logging
    ctx.decorateCommand(runner => async ctx => {
      console.log('[LOG] Command started:', ctx.name)
      const result = await runner(ctx)
      console.log('[LOG] Command completed')
      return result
    })

    // Second decorator: Timing
    ctx.decorateCommand(runner => async ctx => {
      const start = Date.now()
      await sleep(10)
      const result = await runner(ctx)
      // NOTE: Skip timing log in e2e tests to reduce noise
      if (process.env.GUNSHI_E2E) {
        return result
      }
      console.log(`[TIME] Execution: ${Date.now() - start}ms`)
      return result
    })

    // Third decorator: Error wrapper
    ctx.decorateCommand(runner => async ctx => {
      try {
        console.log('[ERROR] Monitoring enabled')
        return await runner(ctx)
      } catch (error) {
        console.error('[ERROR] Command failed:', error.message)
        throw error
      }
    })
  }
})
