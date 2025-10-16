import { cli, define } from 'gunshi' // Includes plugin-global and plugin-renderer by default
import pluginA from './plugin-a.js'
import pluginB from './plugin-b.js'

await cli(
  process.argv.slice(2),
  define({
    name: 'demo',
    run: () => console.log('Demo command')
  }),
  {
    name: 'my-cli',
    version: '1.0.0',
    renderHeader: null, // Disable default header rendering
    // Custom plugins are added after default plugins
    plugins: [pluginA, pluginB]
  }
)
