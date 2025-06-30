import { describe, expect, test, vi } from 'vitest'
import { plugin } from './core.ts'
import { resolveDependencies } from './dependency.ts'

import type { Plugin } from './core.ts'

describe('resolveDependencies', () => {
  test('return plugins in correct order with no dependencies', () => {
    const pluginA = plugin({ id: 'a', name: 'a' })
    const pluginB = plugin({ id: 'b', name: 'b' })
    const pluginC = plugin({ id: 'c', name: 'c' })
    const result = resolveDependencies([pluginA, pluginB, pluginC])

    expect(result).toEqual([pluginA, pluginB, pluginC])
  })

  test('resolve simple dependencies', () => {
    const pluginA = plugin({ id: 'a', name: 'a' })
    const pluginB = plugin({ id: 'b', name: 'b', dependencies: ['a'] })
    const pluginC = plugin({ id: 'c', name: 'c', dependencies: ['b'] })
    const result = resolveDependencies([pluginC, pluginB, pluginA])

    expect(result.map(p => p.id)).toEqual(['a', 'b', 'c'])
  })

  test('resolve complex dependencies', () => {
    const pluginA = plugin({ id: 'a', name: 'a' })
    const pluginB = plugin({ id: 'b', name: 'b', dependencies: ['a'] })
    const pluginC = plugin({ id: 'c', name: 'c', dependencies: ['a'] })
    const pluginD = plugin({ id: 'd', name: 'd', dependencies: ['b', 'c'] })
    const result = resolveDependencies([pluginD, pluginC, pluginB, pluginA])
    const ids = result.map(p => p.id)

    expect(ids[0]).toBe('a')
    expect(ids.indexOf('b')).toBeGreaterThan(ids.indexOf('a'))
    expect(ids.indexOf('c')).toBeGreaterThan(ids.indexOf('a'))
    expect(ids.indexOf('d')).toBeGreaterThan(ids.indexOf('b'))
    expect(ids.indexOf('d')).toBeGreaterThan(ids.indexOf('c'))
  })

  test('handle plugins with PluginDependency objects', () => {
    const pluginA = plugin({ id: 'a', name: 'a' })
    const pluginB = plugin({
      id: 'b',
      name: 'b',
      dependencies: [{ id: 'a', optional: false }]
    })
    const result = resolveDependencies([pluginB, pluginA])

    expect(result.map(p => p.id)).toEqual(['a', 'b'])
  })

  test('handle optional dependencies when plugin is missing', () => {
    const pluginA = plugin({ id: 'a', name: 'a' })
    const pluginB = plugin({
      id: 'b',
      name: 'b',
      dependencies: [{ id: 'missing', optional: true }]
    })
    const result = resolveDependencies([pluginB, pluginA])

    expect(result.map(p => p.id)).toEqual(['b', 'a'])
  })

  test('handle optional dependencies when plugin exists', () => {
    const pluginA = plugin({ id: 'a', name: 'a' })
    const pluginB = plugin({
      id: 'b',
      name: 'b',
      dependencies: [{ id: 'a', optional: true }]
    })
    const result = resolveDependencies([pluginB, pluginA])

    expect(result.map(p => p.id)).toEqual(['a', 'b'])
  })

  test('throw error for missing required dependency', () => {
    const pluginB = plugin({ id: 'b', name: 'b', dependencies: ['a'] })

    expect(() => resolveDependencies([pluginB])).toThrow('Missing required dependency: `a` on `b`')
  })

  test('throw error for circular dependency', () => {
    const pluginA = plugin({ id: 'a', name: 'a', dependencies: ['b'] })
    const pluginB = plugin({ id: 'b', name: 'b', dependencies: ['a'] })

    expect(() => resolveDependencies([pluginA, pluginB])).toThrow(
      'Circular dependency detected: `a -> b -> a`'
    )
  })

  test('throw error for self-dependency', () => {
    const pluginA = plugin({ id: 'a', name: 'a', dependencies: ['a'] })

    expect(() => resolveDependencies([pluginA])).toThrow('Circular dependency detected: `a -> a`')
  })

  test('handle plugins without ids', () => {
    const pluginA = plugin({ id: 'a', name: 'a' })
    const pluginB = { id: '', name: '' } as Plugin
    const pluginC = plugin({ id: 'c', name: 'c', dependencies: ['a'] })
    const result = resolveDependencies([pluginB, pluginC, pluginA])

    expect(result.filter(p => p.id).map(p => p.id)).toEqual(['a', 'c'])
  })

  test('handle PluginDependency objects array', () => {
    const pluginA = plugin({ id: 'a', name: 'a' })
    const pluginB = plugin({ id: 'b', name: 'b' })
    const pluginC = plugin({
      id: 'c',
      name: 'c',
      dependencies: ['a', { id: 'b', optional: false }, { id: 'missing', optional: true }]
    })
    const result = resolveDependencies([pluginC, pluginB, pluginA])

    expect(result.map(p => p.id)).toEqual(['a', 'b', 'c'])
  })

  test('handle duplicate plugins in the list', () => {
    const mockWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const pluginA = plugin({ id: 'a', name: 'a' })
    const pluginB = plugin({ id: 'b', name: 'b', dependencies: ['a'] })
    const result = resolveDependencies([pluginA, pluginB, pluginA])

    expect(result.map(p => p.id)).toEqual(['a', 'b'])
    expect(mockWarn).toHaveBeenCalledWith('Duplicate plugin id detected: `a`')
  })

  test('handle empty plugin array', () => {
    const result = resolveDependencies([])

    expect(result).toEqual([])
  })

  test('resolve complex circular dependency correctly', () => {
    const pluginA = plugin({ id: 'a', name: 'a', dependencies: ['c'] })
    const pluginB = plugin({ id: 'b', name: 'b', dependencies: ['a'] })
    const pluginC = plugin({ id: 'c', name: 'c', dependencies: ['b'] })

    expect(() => resolveDependencies([pluginA, pluginB, pluginC])).toThrow(
      'Circular dependency detected: `a -> c -> b -> a'
    )
  })
})
