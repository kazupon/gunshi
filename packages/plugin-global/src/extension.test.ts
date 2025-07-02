import { describe, expect, test } from 'vitest'
import { createMockCommandContext } from '../../gunshi/test/utils.ts'
import extension from './extension.ts'

import type { GlobalCommandContext } from './extension.ts'

describe('showVersion', () => {
  test('basic', async () => {
    const version = '1.0.0'
    const {
      log,
      extensions: { 'g:global': globals }
    } = await createMockCommandContext<{
      'g:global': GlobalCommandContext
    }>({
      version,
      extensions: {
        'g:global': {
          key: Symbol('g:global'),
          factory: extension
        }
      }
    })
    const rendered = globals.showVersion()

    expect(rendered).toEqual(version)
    expect(log).toHaveBeenCalledWith(version)
  })

  test('no version', async () => {
    const {
      log,
      extensions: { 'g:global': globals }
    } = await createMockCommandContext<{
      'g:global': GlobalCommandContext
    }>({
      version: null,
      extensions: {
        'g:global': {
          key: Symbol('g:global'),
          factory: extension
        }
      }
    })
    const rendered = await globals.showVersion()

    expect(rendered).toBe('unknown')
    expect(log).toHaveBeenCalledWith('unknown')
  })

  test('usageSilent', async () => {
    const version = '1.0.0'
    const {
      log,
      extensions: { 'g:global': globals }
    } = await createMockCommandContext<{
      'g:global': GlobalCommandContext
    }>({
      version,
      usageSilent: true,
      extensions: {
        'g:global': {
          key: Symbol('g:global'),
          factory: extension
        }
      }
    })
    const rendered = await globals.showVersion()

    expect(rendered).toEqual(version)
    expect(log).not.toHaveBeenCalled()
  })
})

describe('showHeader', () => {
  test('basic', async () => {
    const header = 'Welcome to the Test Application'
    const {
      log,
      extensions: { 'g:global': globals }
    } = await createMockCommandContext<{
      'g:global': GlobalCommandContext
    }>({
      renderHeader: async () => header,
      extensions: {
        'g:global': {
          key: Symbol('g:global'),
          factory: extension
        }
      }
    })
    const rendered = await globals.showHeader()

    expect(rendered).toEqual(header)
    expect(log).toHaveBeenCalledWith(header)
    expect(log).toHaveBeenCalledWith()
  })

  test('no header', async () => {
    const {
      extensions: { 'g:global': globals }
    } = await createMockCommandContext<{
      'g:global': GlobalCommandContext
    }>({
      renderHeader: null,
      extensions: {
        'g:global': {
          key: Symbol('g:global'),
          factory: extension
        }
      }
    })
    const rendered = await globals.showHeader()

    expect(rendered).toBeUndefined()
  })
})

describe('showUsage', () => {
  test('basic', async () => {
    const usage = 'Usage: test-app [options]'
    const {
      log,
      extensions: { 'g:global': globals }
    } = await createMockCommandContext<{
      'g:global': GlobalCommandContext
    }>({
      renderUsage: async () => usage,
      extensions: {
        'g:global': {
          key: Symbol('g:global'),
          factory: extension
        }
      }
    })
    const rendered = await globals.showUsage()

    expect(rendered).toEqual(usage)
    expect(log).toHaveBeenCalledWith(usage)
  })

  test('no usage', async () => {
    const {
      extensions: { 'g:global': globals }
    } = await createMockCommandContext<{
      'g:global': GlobalCommandContext
    }>({
      renderUsage: null,
      extensions: {
        'g:global': {
          key: Symbol('g:global'),
          factory: extension
        }
      }
    })
    const rendered = await globals.showUsage()

    expect(rendered).toBeUndefined()
  })
})
