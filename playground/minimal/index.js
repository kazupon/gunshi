import { cli } from 'gunshi'

// Minimal API example
// This demonstrates how to run a command with the minimum API
cli(process.argv.slice(2), ctx => {
  console.log('Hello from minimal example!')
  console.log('Command line arguments:', ctx.positionals)
  console.log('Command values:', ctx.values)
})
