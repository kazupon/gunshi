/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type { GunshiParams } from '../types.ts'
import type { Plugin } from './core.ts'

/**
 * Resolve plugin dependencies using topological sort
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
    if (plugin.name) {
      if (pluginMap.has(plugin.name)) {
        console.warn(`Duplicate plugin name detected: \`${plugin.name}\``)
      }
      pluginMap.set(plugin.name, plugin)
    }
  }

  function visit(plugin: Plugin<E>) {
    if (!plugin.name) {
      return
    }
    if (visited.has(plugin.name)) {
      return
    }
    if (visiting.has(plugin.name)) {
      throw new Error(
        `Circular dependency detected: \`${[...visiting].join(` -> `) + ' -> ' + plugin.name}\``
      )
    }

    visiting.add(plugin.name)

    // process dependencies first
    const deps = plugin.dependencies || []
    for (const dep of deps) {
      const depName = typeof dep === 'string' ? dep : dep.name
      const isOptional = typeof dep === 'string' ? false : dep.optional || false

      const depPlugin = pluginMap.get(depName)
      if (!depPlugin && !isOptional) {
        throw new Error(`Missing required dependency: \`${depName}\` on \`${plugin.name}\``)
      }
      if (depPlugin) {
        visit(depPlugin)
      }
    }

    visiting.delete(plugin.name)
    visited.add(plugin.name)
    sorted.push(plugin)
  }

  // visit all plugins
  for (const plugin of plugins) {
    visit(plugin)
  }

  return sorted
}
