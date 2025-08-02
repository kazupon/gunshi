import { cli } from 'gunshi'
import { expect, test } from 'vitest'
import { plugin } from './index.ts'

import type { CommandRunner } from './index.ts'

test('@gunshi/plugin', async () => {
  /**
   * `CommandContext` extending interface
   */
  interface PerfCommandContext {
    start: number
    end: number
  }

  // unique plugin id, recommended to use a namespaced id
  const perfPluginId = 'my:perf'
  type PerfPluginId = typeof perfPluginId
  type Extensions = Record<PerfPluginId, PerfCommandContext>

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  /**
   * define a plugin that measures command performance
   */
  const perf = plugin({
    id: perfPluginId, // need to define a unique id for the plugin
    name: 'Performance Plugin', // optional name

    // extend `CommandContext` with exntension
    extension: () => ({ start: -1, end: -1 }),

    // extend command via setup hook and plugin context
    setup: ctx => {
      /**
       * before & after hooks with command decorator
       */
      ctx.decorateCommand(baseRunner => async cmdCtx => {
        // measure start time
        cmdCtx.extensions[perfPluginId].start = performance.now()

        // execute base command runner
        const ret = await baseRunner(cmdCtx)
        await delay(10) // simulate command runner time

        // measure end time
        cmdCtx.extensions[perfPluginId].end = performance.now()

        return ret
      })
    }
  })

  const entry: CommandRunner<{ extensions: Extensions }> = ctx => {
    // enable type-safe extensions
    return `Execution start time: ${ctx.extensions[perfPluginId].start}`
  }

  // run!
  const result = await cli<Extensions>([], entry, {
    plugins: [perf], // register the plugin
    onAfterCommand(ctx, result) {
      expect(result).toEqual(`Execution start time: ${ctx.extensions[perfPluginId].start}`)
      expect(ctx.extensions[perfPluginId].end).toBeGreaterThanOrEqual(
        ctx.extensions[perfPluginId].start
      )
    }
  })

  expect(result).toContain('Execution start time: ')
})
