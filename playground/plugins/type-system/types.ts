// Type definitions for the API plugin
export const pluginId = 'mycompany:api' as const
/**
 *
 */
export type PluginId = typeof pluginId

/**
 *
 */
export interface ApiExtension {
  /**
   *
   */
  get: <T = unknown>(endpoint: string) => Promise<T>
  /**
   *
   */
  post: <T = unknown>(endpoint: string, data: Record<string, unknown>) => Promise<T>
  /**
   *
   */
  delete: (endpoint: string) => Promise<void>
}
