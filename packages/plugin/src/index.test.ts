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

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  /**
   * define a plugin that measures command performance
   */
  const perf = plugin({
    id: 'perf', // need to define a unique id for the plugin
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
        cmdCtx.extensions.perf.start = performance.now()

        // execute base command runner
        const ret = await baseRunner(cmdCtx)
        await delay(10) // simulate command runner time

        // measure end time
        cmdCtx.extensions.perf.end = performance.now()

        return ret
      })
    }
  })

  /**
   * define entry runner with type parameters
   */
  const entry: CommandRunner<{ extensions: { perf: PerfCommandContext } }> = ctx => {
    // enable type-safe extensions
    return `Execution start time: ${ctx.extensions.perf.start}`
  }

  // run!
  // @ts-expect-error
  const result = await cli([], entry, {
    plugins: [perf] // install a plugin
  })

  expect(result).toContain('Execution start time: ')
})
