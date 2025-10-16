import { plugin } from 'gunshi/plugin'

export default plugin({
  id: 'tools',
  name: 'Developer Tools Plugin',

  setup: ctx => {
    // Add a new sub-command
    ctx.addCommand('clean', {
      name: 'clean',
      description: 'Clean build artifacts',
      args: {
        cache: {
          type: 'boolean',
          description: 'Also clear cache',
          default: false
        }
      },
      run: ctx => {
        console.log('Cleaning build artifacts...')
        if (ctx.values.cache) {
          console.log('Clearing cache...')
        }
        console.log('Clean complete!')
      }
    })

    // Add another sub-command
    ctx.addCommand('lint', {
      name: 'lint',
      description: 'Run linter',
      run: ctx => {
        console.log('Running linter...')
        console.log('No issues found!')
      }
    })
  }
})
