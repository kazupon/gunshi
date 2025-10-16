import { cli } from 'gunshi'
import debug from './debug.js' // prepare previous your plugin
import logger from './logger.js'

const command = {
  name: 'deploy',
  run: ctx => {
    ctx.extensions.logger.log('Starting deployment')
    ctx.extensions.logger.debug('Checking environment')

    try {
      // Deployment logic
      ctx.extensions.logger.log('Deployment successful')
    } catch {
      ctx.extensions.logger.error('Deployment failed')
    }
  }
}

await cli(process.argv.slice(2), command, {
  // install plugins
  plugins: [debug, logger]
})
