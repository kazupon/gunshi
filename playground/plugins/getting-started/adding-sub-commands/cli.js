import { cli, define } from 'gunshi'
import tools from './plugin.js'

// Main command
const command = define({
  name: 'build',
  run: ctx => console.log('Building project...')
})

await cli(process.argv.slice(2), command, {
  plugins: [tools]
})
