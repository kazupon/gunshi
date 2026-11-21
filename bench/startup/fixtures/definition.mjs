// Commands written with gunshi/definition and run by cli() of gunshi, as the guide shows
import { cli } from 'gunshi'
import { define } from 'gunshi/definition'

const build = define({
  name: 'build',
  description: 'Build the app',
  args: { watch: { type: 'boolean' } },
  run: () => console.log('build')
})
const dev = define({ name: 'dev', description: 'Start the server', run: () => console.log('dev') })
await cli(process.argv.slice(2), define({ name: 'main', description: 'Main', run: () => {} }), {
  name: 'tool',
  version: '1.0.0',
  subCommands: { build, dev }
})
