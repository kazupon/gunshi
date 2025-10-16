import { cli } from 'gunshi'

await cli(
  process.argv.slice(2),
  {
    name: 'server',
    run: () => {
      console.log('Starting server...')
    }
  },
  {
    name: 'my-app',
    version: '1.0.0',

    // Define lifecycle hooks
    onBeforeCommand: ctx => {
      console.log(`About to run: ${ctx.name}`)
    },

    onAfterCommand: (ctx, _result) => {
      console.log(`Command ${ctx.name} completed successfully`)
    },

    onErrorCommand: (ctx, error) => {
      console.error(`Command ${ctx.name} failed:`, error)
    }
  }
)
