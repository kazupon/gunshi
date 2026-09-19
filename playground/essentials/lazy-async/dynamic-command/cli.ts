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
        console.log('Verbose:', ctx.values.verbose)
      }
    }
  })
}

// The definition (2nd parameter) is used without calling the loader, e.g. for the command list.
// Once loaded, the loaded command takes precedence, and the definition is the fallback
const config = lazy(configLoader, {
  name: 'config',
  description: 'Dynamically configured command'
})

await cli(
  process.argv.slice(2),
  { description: 'CLI with dynamic commands', run: () => {} },
  { name: 'my-cli', version: '1.0.0', subCommands: { config } }
)
