import { plugin } from 'gunshi/plugin'
import { pluginId as authId } from './auth.ts'
import { pluginId as loggerId } from './logger.ts'
import { pluginId } from './types.ts'

import type { AuthExtension } from './auth.ts'
import type { LoggerExtension } from './logger.ts'
import type { ApiExtension, PluginId } from './types.ts'

// Re-export for consumers
export * from './types.ts'

// Define dependency types
type DependencyExtensions = {
  [loggerId]: LoggerExtension // Required
  [authId]: AuthExtension // Required
}

// Define dependencies array
const dependencies = [loggerId, authId] as const
type Dependencies = typeof dependencies

// Mock API implementation for demonstration
async function simulateApiCall(
  method: string,
  endpoint: string,
  data: Record<string, unknown>,
  token: string
) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100))

  // Validate token
  if (!token) {
    throw new Error('Unauthorized')
  }

  // Mock responses based on endpoint
  if (endpoint === '/users' && method === 'GET') {
    return [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ]
  }

  if (endpoint.startsWith('/users/') && method === 'GET') {
    const id = Number.parseInt(endpoint.split('/')[2])
    return { id, name: id === 1 ? 'Alice' : 'Bob' }
  }

  if (method === 'POST') {
    return { ...data, id: Date.now() }
  }

  if (method === 'DELETE') {
    return null
  }

  throw new Error(`Unknown endpoint: ${method} ${endpoint}`)
}

// Export the plugin factory
/**
 *
 * @param baseUrl
 */
export default function api(baseUrl: string) {
  return plugin<DependencyExtensions, PluginId, Dependencies, ApiExtension>({
    id: pluginId,
    name: 'API Plugin',
    dependencies,

    extension: ctx => {
      const logger = ctx.extensions[loggerId]
      const auth = ctx.extensions[authId]

      async function request<T = unknown>(
        method: string,
        endpoint: string,
        data?: Record<string, unknown>
      ) {
        const url = `${baseUrl}${endpoint}`

        // Make request
        logger.log(`${method} ${url}`)
        const token = auth.getToken()

        // Simulate API call (replace with actual fetch in production)
        const result = await simulateApiCall(method, endpoint, data || {}, token)

        return result as T
      }

      return {
        get: endpoint => request('GET', endpoint),
        post: (endpoint, data) => request('POST', endpoint, data),
        delete: async endpoint => {
          await request('DELETE', endpoint)
        }
      }
    }
  })
}
