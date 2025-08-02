/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type { GunshiParams } from '../types.ts'
import type { Plugin } from './core.ts'

/**
 * Resolve plugin dependencies using topological sort
 *
 * @param plugins - Array of plugins to resolve
 * @returns Array of plugins sorted by dependencies
 * @throws Error if circular dependency is detected or required dependency is missing
 */
export function resolveDependencies<E extends GunshiParams['extensions']>(
  plugins: Plugin<E>[]
): Plugin<E>[] {
  const sorted: Plugin<E>[] = []
  const visited = new Set<string>()
  const visiting = new Set<string>()
  const pluginMap = new Map<string, Plugin<E>>()

  // build a map for quick lookup
  for (const plugin of plugins) {
    if (plugin.id) {
      if (pluginMap.has(plugin.id)) {
        console.warn(`Duplicate plugin id detected: \`${plugin.id}\``)
      }
      pluginMap.set(plugin.id, plugin)
    }
  }

  function visit(plugin: Plugin<E>) {
    if (!plugin.id) {
      return
    }
    if (visited.has(plugin.id)) {
      return
    }
    if (visiting.has(plugin.id)) {
      throw new Error(
        `Circular dependency detected: \`${[...visiting].join(` -> `) + ' -> ' + plugin.id}\``
      )
    }

    visiting.add(plugin.id)

    // process dependencies first
    const deps = plugin.dependencies || []
    for (const dep of deps) {
      const depId = typeof dep === 'string' ? dep : dep.id
      const isOptional = typeof dep === 'string' ? false : dep.optional || false

      const depPlugin = pluginMap.get(depId)
      if (!depPlugin && !isOptional) {
        throw new Error(`Missing required dependency: \`${depId}\` on \`${plugin.id}\``)
      }
      if (depPlugin) {
        visit(depPlugin)
      }
    }

    visiting.delete(plugin.id)
    visited.add(plugin.id)
    sorted.push(plugin)
  }

  // visit all plugins
  for (const plugin of plugins) {
    visit(plugin)
  }

  return sorted
}
