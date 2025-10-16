import { cli } from 'gunshi'
import query from './commands/query.ts'
import auth from './plugins/auth.ts'
import database from './plugins/database.ts'
import logger from './plugins/logger.ts'

function entry() {
  console.log('Welcome to the advanced type-system combine CLI!')
}

await cli(process.argv.slice(2), entry, {
  plugins: [logger(), auth({ token: 'initial-token' }), database()],
  name: 'advanced-combine',
  description: 'An example CLI demonstrating advanced type system with combined plugins',
  subCommands: {
    query
  }
})
