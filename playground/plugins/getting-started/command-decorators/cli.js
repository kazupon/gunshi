import { cli } from 'gunshi'
import timing from './plugin.js'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

await cli(
  process.argv.slice(2),
  {
    name: 'entry',
    run: async () => {
      await sleep(1000)
    }
  },
  {
    plugins: [timing]
  }
)
