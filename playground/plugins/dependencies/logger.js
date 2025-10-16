import { plugin } from 'gunshi/plugin'

// Base plugin with no dependencies
export default plugin({
  id: 'logger',
  setup: ctx => {
    console.log('1. Logger plugin loaded')
  },
  extension: () => ({
    log: msg => console.log(`[LOG] ${msg}`)
  })
})
