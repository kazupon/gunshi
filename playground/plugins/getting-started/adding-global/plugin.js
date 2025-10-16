import { plugin } from 'gunshi/plugin'

export default plugin({
  id: 'debug',
  name: 'Debug Plugin',

  setup: ctx => {
    // Add a global option available to all commands
    ctx.addGlobalOption('debug', {
      type: 'boolean',
      short: 'd',
      description: 'Enable debug output'
    })
  }
})
