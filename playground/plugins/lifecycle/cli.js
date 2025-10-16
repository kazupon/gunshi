import { cli, define } from 'gunshi'
import lifecycle from './lifecycle.js'
import logger from './logger.js'

// Command definition
const command = define({
  name: 'build',
  args: {
    fail: {
      type: 'boolean'
    }
  },
  run: ctx => {
    console.log('6. Actual command execution')
    console.log('Extension says:', ctx.extensions['lifecycle'].demo())

    // Simulate an error for demonstration
    if (ctx.values.fail) {
      throw new Error('Build failed!')
    }
  }
})

// Running the CLI with Command Hooks
await cli(process.argv.slice(2), command, {
  // Plugin installation
  plugins: [logger, lifecycle],

  // Command Hooks are defined at CLI level
  onBeforeCommand: ctx => {
    console.log('4.5. onBeforeCommand hook')
  },

  onAfterCommand: ctx => {
    console.log('8. onAfterCommand hook')
    // Cleanup can be done here
    ctx.extensions['lifecycle'].cleanup()
  },

  onErrorCommand: (ctx, error) => {
    console.log('8. onErrorCommand hook:', error.message)
    // Error recovery or cleanup
    ctx.extensions['lifecycle'].cleanup()
  }
})
