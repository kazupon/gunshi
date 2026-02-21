import { cli, define } from 'gunshi'
import {
  args,
  boolean,
  choice,
  integer,
  merge,
  required,
  short,
  string,
  withDefault
} from 'gunshi/combinators'

// Define reusable schema groups with args()
const common = args({
  verbose: short(boolean(), 'v')
})

const network = args({
  host: withDefault(string({ description: 'Host to bind' }), 'localhost'),
  port: withDefault(integer({ min: 1, max: 65535, description: 'Port number' }), 3000)
})

// Compose schemas with merge()
const command = define({
  name: 'serve',
  description: 'Start a development server',
  args: merge(
    common,
    network,
    args({
      mode: choice(['development', 'production'] as const),
      entry: required(string({ description: 'Entry file' }))
    })
  ),
  run: ctx => {
    // ctx.values is fully typed with proper inference:
    // - host: string (always defined due to withDefault)
    // - port: number (always defined due to withDefault)
    // - verbose: boolean | undefined
    // - mode: 'development' | 'production' | undefined
    // - entry: string (always defined due to required)
    const { host, port, verbose, mode, entry } = ctx.values

    console.log(`Starting server at ${host}:${port}`)
    console.log(`Entry: ${entry}`)
    console.log(`Mode: ${mode ?? 'development'}`)

    if (verbose) {
      console.log('Verbose mode enabled.')
      console.log('Parsed values:', ctx.values)
    }
  }
})

// Execute the command
await cli(process.argv.slice(2), command, {
  name: 'serve-app',
  version: '1.0.0'
})
