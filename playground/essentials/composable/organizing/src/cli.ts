import { cli } from 'gunshi'
import create from './commands/create.ts'
import list from './commands/list.ts'
import main from './main.ts'

await cli(process.argv.slice(2), main, {
  name: 'resource-manager',
  version: '1.0.0',
  fallbackToEntry: true,
  subCommands: {
    create,
    list
  }
})
