import { cli } from 'gunshi'
import { serverCommand as server } from './commands/server.ts'

function entry() {
  console.log('Entry command executed')
}

await cli(process.argv.slice(2), entry, {
  name: 'mycli',
  version: '1.0.0',
  subCommands: {
    server
  }
})
