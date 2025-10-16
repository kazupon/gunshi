import { plugin } from 'gunshi/plugin'

export default plugin({
  id: 'logger',
  name: 'Logger Plugin',

  setup: ctx => {
    console.log('logger plugin setup phase started')
  },

  extension: (ctx, cmd) => {
    const prefix = `[${cmd.name || 'CLI'}]`

    return {
      log: message => {
        console.log(`${prefix} ${message}`)
      },
      error: message => {
        console.error(`${prefix} ERROR: ${message}`)
      },
      debug: message => {
        if (ctx.values.debug) {
          console.log(`${prefix} DEBUG: ${message}`)
        }
      }
    }
  }
})
