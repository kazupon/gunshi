import { cli, define } from 'gunshi'
import customRenderer from './plugin.js'

await cli(
  process.argv.slice(2),
  define({
    name: 'build',
    args: {
      output: { type: 'string', required: true }
    },
    run: ctx => console.log(`Building to ${ctx.values.output}`)
  }),
  {
    name: 'my-cli',
    version: '1.0.0',
    plugins: [customRenderer]
  }
)
