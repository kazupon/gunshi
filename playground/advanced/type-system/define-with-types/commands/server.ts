import { defineWithTypes } from 'gunshi'

import type { AuthExtension } from '../plugin.ts'

// Define your extensions type
type ServerExtensions = {
  auth: AuthExtension
}

// Use defineWithTypes - specify only extensions, args are inferred!
export const serverCommand = defineWithTypes<{ extensions: ServerExtensions }>()({
  name: 'server',
  description: 'Start the development server',
  args: {
    port: { type: 'number', default: 3000 },
    host: { type: 'string', default: 'localhost' },
    verbose: { type: 'boolean', short: 'V' }
  },
  run: ctx => {
    // ctx.values is automatically inferred as { port?: number; host?: string; verbose?: boolean }
    const { port, host, verbose } = ctx.values

    // ctx.extensions is typed as ServerExtensions
    // Optional chaining (?.) is used because plugins may not be installed
    if (!ctx.extensions.auth?.isAuthenticated()) {
      throw new Error('Please login first')
    }

    const user = ctx.extensions.auth.getUser()
    console.log(`Server started by ${user.name} on ${host}:${port}`)

    if (verbose) {
      console.log('Verbose mode enabled')
    }
  }
})
