import { plugin } from 'gunshi/plugin'

export default plugin({
  id: 'lifecycle',
  dependencies: ['logger'], // Step C: Dependency resolution

  // Step D: Setup execution
  setup: ctx => {
    console.log('1. lifecycle plugin setup phase started')

    // Register global option
    ctx.addGlobalOption('verbose', {
      type: 'boolean',
      alias: 'v',
      description: 'Verbose output'
    })

    // Add sub-command
    ctx.addCommand('status', {
      name: 'status',
      run: ctx => console.log('Status: OK')
    })

    // Register decorators (LIFO order)
    ctx.decorateCommand(runner => async ctx => {
      console.log('5. Command decorator (before)')
      const result = await runner(ctx)
      console.log('7. Command decorator (after)')
      return result
    })

    console.log('2. Setup phase completed')
  },

  // Step I: Extension creation
  extension: (ctx, cmd) => {
    console.log('3. Extension created for:', cmd.name)

    return {
      demo: () => 'Hello from extension',
      cleanup: () => console.log('9. Extension cleanup')
    }
  },

  // Step J: Post-extension callback
  onExtension: (ctx, cmd) => {
    console.log('4. All extensions ready')
  }
})
