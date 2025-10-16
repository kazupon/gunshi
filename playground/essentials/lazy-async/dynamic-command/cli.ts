import { cli, define, lazy } from 'gunshi'

const configLoader = async () => {
  // Simulate loading configuration (in practice, read from file/API)
  const isDebug = process.env.DEBUG === 'true'

  return define({
    description: `Config command (debug: ${isDebug})`,
    args: {
      verbose: {
        type: 'boolean',
        description: isDebug ? 'Verbose output (DEBUG mode)' : 'Verbose output'
      }
    },
    run: ctx => {
      console.log(isDebug ? 'Running in DEBUG mode' : 'Running in normal mode')
      if (ctx.values.verbose) {
        console.log('Verbose:', ctx.values)
      }
    }
  })
}

// Override command meta info with 2nd parameters
const config = lazy(configLoader, {
  name: 'config',
  description: 'Dynamically configured command'
})

await cli(
  process.argv.slice(2),
  { description: 'CLI with dynamic commands', run: () => {} },
  { name: 'my-cli', version: '1.0.0', subCommands: { config } }
)
