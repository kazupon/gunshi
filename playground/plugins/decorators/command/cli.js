import { cli, define } from 'gunshi'
import multi from './plugin.js'

const command = define({
  name: 'process',
  run: ctx => {
    console.log('>>> Executing actual command <<<')
    return 'Command result'
  }
})

await cli(process.argv.slice(2), command, {
  plugins: [multi]
})
