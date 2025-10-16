import { cli } from 'gunshi'
import hello from './plugin.js'

const entry = () => {}

await cli(process.argv.slice(2), entry, {
  plugins: [hello]
})
