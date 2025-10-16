import { cli } from 'gunshi'

// Run a simple command
await cli(process.argv.slice(2), () => {
  console.log('Hello, World!')
})
