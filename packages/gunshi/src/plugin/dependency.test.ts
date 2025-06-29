import { describe, expect, test, vi } from 'vitest'
import { plugin } from './core.ts'
import { resolveDependencies } from './dependency.ts'

import type { Plugin } from './core.ts'

describe('resolveDependencies', () => {
  test('return plugins in correct order with no dependencies', () => {
    const pluginA = plugin({ name: 'a' })
    const pluginB = plugin({ name: 'b' })
    const pluginC = plugin({ name: 'c' })
    const result = resolveDependencies([pluginA, pluginB, pluginC])

    expect(result).toEqual([pluginA, pluginB, pluginC])
  })

  test('resolve simple dependencies', () => {
    const pluginA = plugin({ name: 'a' })
    const pluginB = plugin({ name: 'b', dependencies: ['a'] })
    const pluginC = plugin({ name: 'c', dependencies: ['b'] })
    const result = resolveDependencies([pluginC, pluginB, pluginA])

    expect(result.map(p => p.name)).toEqual(['a', 'b', 'c'])
  })

  test('resolve complex dependencies', () => {
    const pluginA = plugin({ name: 'a' })
    const pluginB = plugin({ name: 'b', dependencies: ['a'] })
    const pluginC = plugin({ name: 'c', dependencies: ['a'] })
    const pluginD = plugin({ name: 'd', dependencies: ['b', 'c'] })
    const result = resolveDependencies([pluginD, pluginC, pluginB, pluginA])
    const names = result.map(p => p.name)

    expect(names[0]).toBe('a')
    expect(names.indexOf('b')).toBeGreaterThan(names.indexOf('a'))
    expect(names.indexOf('c')).toBeGreaterThan(names.indexOf('a'))
    expect(names.indexOf('d')).toBeGreaterThan(names.indexOf('b'))
    expect(names.indexOf('d')).toBeGreaterThan(names.indexOf('c'))
  })

  test('handle plugins with PluginDependency objects', () => {
    const pluginA = plugin({ name: 'a' })
    const pluginB = plugin({
      name: 'b',
      dependencies: [{ name: 'a', optional: false }]
    })
    const result = resolveDependencies([pluginB, pluginA])

    expect(result.map(p => p.name)).toEqual(['a', 'b'])
  })

  test('handle optional dependencies when plugin is missing', () => {
    const pluginA = plugin({ name: 'a' })
    const pluginB = plugin({
      name: 'b',
      dependencies: [{ name: 'missing', optional: true }]
    })
    const result = resolveDependencies([pluginB, pluginA])

    expect(result.map(p => p.name)).toEqual(['b', 'a'])
  })

  test('handle optional dependencies when plugin exists', () => {
    const pluginA = plugin({ name: 'a' })
    const pluginB = plugin({
      name: 'b',
      dependencies: [{ name: 'a', optional: true }]
    })
    const result = resolveDependencies([pluginB, pluginA])

    expect(result.map(p => p.name)).toEqual(['a', 'b'])
  })

  test('throw error for missing required dependency', () => {
    const pluginB = plugin({ name: 'b', dependencies: ['a'] })

    expect(() => resolveDependencies([pluginB])).toThrow('Missing required dependency: `a` on `b`')
  })

  test('throw error for circular dependency', () => {
    const pluginA = plugin({ name: 'a', dependencies: ['b'] })
    const pluginB = plugin({ name: 'b', dependencies: ['a'] })

    expect(() => resolveDependencies([pluginA, pluginB])).toThrow(
      'Circular dependency detected: `a -> b -> a`'
    )
  })

  test('throw error for self-dependency', () => {
    const pluginA = plugin({ name: 'a', dependencies: ['a'] })

    expect(() => resolveDependencies([pluginA])).toThrow('Circular dependency detected: `a -> a`')
  })

  test('handle plugins without names', () => {
    const pluginA = plugin({ name: 'a' })
    const pluginB = {} as Plugin
    const pluginC = plugin({ name: 'c', dependencies: ['a'] })
    const result = resolveDependencies([pluginB, pluginC, pluginA])

    expect(result.filter(p => p.name).map(p => p.name)).toEqual(['a', 'c'])
  })

  test('handle PluginDependency objects array', () => {
    const pluginA = plugin({ name: 'a' })
    const pluginB = plugin({ name: 'b' })
    const pluginC = plugin({
      name: 'c',
      dependencies: ['a', { name: 'b', optional: false }, { name: 'missing', optional: true }]
    })
    const result = resolveDependencies([pluginC, pluginB, pluginA])

    expect(result.map(p => p.name)).toEqual(['a', 'b', 'c'])
  })

  test('handle duplicate plugins in the list', () => {
    const mockWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const pluginA = plugin({ name: 'a' })
    const pluginB = plugin({ name: 'b', dependencies: ['a'] })
    const result = resolveDependencies([pluginA, pluginB, pluginA])

    expect(result.map(p => p.name)).toEqual(['a', 'b'])
    expect(mockWarn).toHaveBeenCalledWith('Duplicate plugin name detected: `a`')
  })

  test('handle empty plugin array', () => {
    const result = resolveDependencies([])

    expect(result).toEqual([])
  })

  test('resolve complex circular dependency correctly', () => {
    const pluginA = plugin({ name: 'a', dependencies: ['c'] })
    const pluginB = plugin({ name: 'b', dependencies: ['a'] })
    const pluginC = plugin({ name: 'c', dependencies: ['b'] })

    expect(() => resolveDependencies([pluginA, pluginB, pluginC])).toThrow(
      'Circular dependency detected: `a -> c -> b -> a'
    )
  })
})
