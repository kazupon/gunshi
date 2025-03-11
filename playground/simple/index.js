import { cli } from 'gunshi'

// Simple API example
// This demonstrates how to run a command with the Simple API
cli(process.argv.slice(2), ctx => {
  console.log('Hello from simple example!')
  console.log('Command line arguments:', ctx.positionals)
  console.log('Command values:', ctx.values)
})
