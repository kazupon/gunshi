import { plugin } from 'gunshi/plugin'
import { pluginId as loggerId } from './logger.ts'

import type { LoggerExtension } from './logger.ts'

// Type definitions for the Auth plugin
export const pluginId = 'mycompany:auth' as const
export type PluginId = typeof pluginId

export interface AuthExtension {
  hasPermission: (action: 'read' | 'write', resource: string) => boolean
  getToken: () => string
  isAuthenticated: () => boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

// Define dependency types
type DependencyExtensions = {
  [loggerId]: LoggerExtension
}

// Define dependencies array
const dependencies = [loggerId] as const
type Dependencies = typeof dependencies

// Auth plugin factory with configuration
export default function auth(config?: { token?: string }) {
  return plugin<DependencyExtensions, PluginId, Dependencies, AuthExtension>({
    id: pluginId,
    dependencies,

    extension: ctx => {
      const logger = ctx.extensions[loggerId]
      let currentToken = config?.token || ''

      return {
        hasPermission: (action: 'read' | 'write', resource: string) => {
          // Simple permission logic for demonstration
          const isAllowed = Boolean(currentToken) && resource !== 'restricted'
          logger.log(
            `Permission check for ${action} on ${resource}: ${isAllowed ? 'allowed' : 'denied'}`
          )
          return isAllowed
        },

        getToken: () => {
          if (!currentToken) {
            logger.warn('No authentication token available')
          }
          return currentToken
        },

        isAuthenticated: () => {
          const isValid = Boolean(currentToken)
          logger.log(`Authentication check: ${isValid ? 'valid' : 'invalid'}`)
          return isValid
        },

        login: async (username: string, password: string) => {
          logger.log(`Attempting login for user: ${username}`)

          // Simulate authentication
          if (username === 'admin' && password === 'password') {
            currentToken = `token-${Date.now()}`
            logger.log('Login successful')
            return true
          } else {
            logger.error('Login failed: Invalid credentials')
            return false
          }
        },

        logout: () => {
          logger.log('User logged out')
          currentToken = ''
        }
      }
    }
  })
}
