import { cli } from 'gunshi'
import lifo from './plugin.js'

await cli(
  process.argv.slice(2),
  () => {
    console.log('Original command execution')
  },
  {
    plugins: [lifo]
  }
)
