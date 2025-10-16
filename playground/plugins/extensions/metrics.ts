import { plugin } from 'gunshi/plugin'

export default plugin({
  id: 'metrics',

  extension: (ctx, cmd) => {
    // Called during Step I: Create Extensions
    // Fresh instance for each command execution

    const startTime = Date.now()
    const commandName = cmd.name || 'root'

    // Access parsed command-line arguments
    const verbose = ctx.values.verbose === true

    // Return the extension object (can be sync or async)
    return {
      recordMetric: (name: string, value: number) => {
        if (verbose) {
          console.log(`[${commandName}] ${name}: ${value}`)
        }
      },
      getElapsedTime: () => Date.now() - startTime
    }
  }
})
