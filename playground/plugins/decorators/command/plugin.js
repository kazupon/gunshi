import { plugin } from 'gunshi/plugin'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

// The decorators print with `ctx.log`, which gunshi silences when a command prints JSON with `--json`
export default plugin({
  id: 'multi-decorator',
  setup(ctx) {
    // First decorator: Logging
    ctx.decorateCommand(runner => async ctx => {
      ctx.log('[LOG] Command started:', ctx.name)
      const result = await runner(ctx)
      ctx.log('[LOG] Command completed')
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
      ctx.log(`[TIME] Execution: ${Date.now() - start}ms`)
      return result
    })

    // Third decorator: Error wrapper
    ctx.decorateCommand(runner => async ctx => {
      try {
        ctx.log('[ERROR] Monitoring enabled')
        return await runner(ctx)
      } catch (error) {
        // with --json, gunshi prints the error as JSON
        if (!ctx.values.json) {
          console.error('[ERROR] Command failed:', error.message)
        }
        throw error
      }
    })
  }
})
