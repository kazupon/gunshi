import { cli } from 'gunshi'
import branding from './plugin.js'

await cli(process.argv.slice(2), () => {}, {
  plugins: [branding]
})
