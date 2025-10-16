import { cli, define } from 'gunshi'
import api, { pluginId as apiId } from './api.ts'
import auth from './auth.ts'
import logger from './logger.ts'

import type { Args, GunshiParams } from 'gunshi'
import type { ApiExtension } from './api.ts'

const fetchArgs = {
  endpoint: {
    type: 'string',
    required: true,
    description: 'API endpoint to fetch'
  }
} as const satisfies Args

// Define a command that uses the API plugin
const fetchCommand = define<
  GunshiParams<{
    args: typeof fetchArgs
    extensions: { [apiId]: ApiExtension }
  }>
>({
  name: 'fetch',
  description: 'Fetch data from API',
  args: fetchArgs,
  run: async ctx => {
    const api = ctx.extensions[apiId]
    const data = await api.get(ctx.values.endpoint)
    console.log(JSON.stringify(data, null, 2))
  }
})

// Configure and run CLI
await cli(process.argv.slice(2), fetchCommand, {
  name: 'my-cli',
  version: '1.0.0',
  plugins: [
    // Dependencies must be registered first
    logger(),
    auth({ token: process.env.API_TOKEN }),
    api('https://api.example.com')
  ]
})
