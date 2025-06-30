import { describe, expect, test } from 'vitest'
import { createMockCommandContext } from '../../gunshi/test/utils.ts'
import extension from './extension.ts'

import type { GlobalsCommandContext } from './extension.ts'

describe('showVersion', () => {
  test('basic', async () => {
    const version = '1.0.0'
    const {
      log,
      extensions: { 'g:globals': globals }
    } = await createMockCommandContext<{
      'g:globals': GlobalsCommandContext
    }>({
      version,
      extensions: {
        'g:globals': {
          key: Symbol('g:globals'),
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
      extensions: { 'g:globals': globals }
    } = await createMockCommandContext<{
      'g:globals': GlobalsCommandContext
    }>({
      version: null,
      extensions: {
        'g:globals': {
          key: Symbol('g:globals'),
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
      extensions: { 'g:globals': globals }
    } = await createMockCommandContext<{
      'g:globals': GlobalsCommandContext
    }>({
      version,
      usageSilent: true,
      extensions: {
        'g:globals': {
          key: Symbol('g:globals'),
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
      extensions: { 'g:globals': globals }
    } = await createMockCommandContext<{
      'g:globals': GlobalsCommandContext
    }>({
      renderHeader: async () => header,
      extensions: {
        'g:globals': {
          key: Symbol('g:globals'),
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
      extensions: { 'g:globals': globals }
    } = await createMockCommandContext<{
      'g:globals': GlobalsCommandContext
    }>({
      renderHeader: null,
      extensions: {
        'g:globals': {
          key: Symbol('g:globals'),
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
      extensions: { 'g:globals': globals }
    } = await createMockCommandContext<{
      'g:globals': GlobalsCommandContext
    }>({
      renderUsage: async () => usage,
      extensions: {
        'g:globals': {
          key: Symbol('g:globals'),
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
      extensions: { 'g:globals': globals }
    } = await createMockCommandContext<{
      'g:globals': GlobalsCommandContext
    }>({
      renderUsage: null,
      extensions: {
        'g:globals': {
          key: Symbol('g:globals'),
          factory: extension
        }
      }
    })
    const rendered = await globals.showUsage()

    expect(rendered).toBeUndefined()
  })
})
