import { cli, define } from 'gunshi'
import debug from './plugin.js'

const command = define({
  name: 'build',
  run: ctx => {
    if (ctx.values.debug) {
      console.log('Debug mode enabled')
      console.log('Context:', ctx)
    }
    console.log('Building...')
  }
})

await cli(process.argv.slice(2), command, {
  plugins: [debug]
})
