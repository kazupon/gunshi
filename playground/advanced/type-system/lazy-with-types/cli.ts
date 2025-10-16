import { cli } from 'gunshi'
import { buildCommand as build } from './commands/build.ts'
import { logger } from './plugin.ts'

function entry() {
  console.log('Entry command executed')
}

await cli(process.argv.slice(2), entry, {
  name: 'mycli',
  version: '1.0.0',
  plugins: [logger()],
  subCommands: {
    build
  }
})
