import { describe, expect, test } from 'vitest'
import { defineMockLog } from '../test/utils.ts'
import { cli } from './cli.ts'
import { define } from './definition.ts'
import { plugin } from './plugin/core.ts'

import type { Command } from './types.ts'

describe('Command rendering options', () => {
  describe('header rendering', () => {
    test('should disable header when header is null', async () => {
      const utils = await import('./utils.ts')
      const log = defineMockLog(utils)

      const cmd: Command = define({
        name: 'test',
        description: 'Test command',
        rendering: {
          header: null
        },
        run: ctx => {
          ctx.log('Command executed')
        }
      })

      await cli([], cmd, { name: 'test-cli', renderHeader: async () => 'Default header' })

      const stdout = log()
      expect(stdout).toBe('Command executed')
    })

    test('should use custom header renderer', async () => {
      const utils = await import('./utils.ts')
      const log = defineMockLog(utils)

      const cmd: Command = define({
        name: 'test',
        description: 'Test command',
        rendering: {
          header: async ctx => `=== ${ctx.name?.toUpperCase()} ===`
        },
        run: ctx => {
          ctx.log('Command executed')
        }
      })

      await cli([], cmd, { name: 'test-cli' })

      const stdout = log()
      expect(stdout).toContain('=== TEST ===')
      expect(stdout).toContain('Command executed')
    })

    test('should use default renderer when header is undefined', async () => {
      const utils = await import('./utils.ts')
      const log = defineMockLog(utils)

      const cmd: Command = define({
        name: 'test',
        description: 'Test command',
        rendering: {}, // header property doesn't exist
        run: ctx => {
          ctx.log('Command executed')
        }
      })

      await cli([], cmd, { name: 'test-cli', renderHeader: async () => 'Default header' })

      const stdout = log()
      expect(stdout).toContain('Default header')
      expect(stdout).toContain('Command executed')
    })
  })

  describe('usage rendering', () => {
    test('should disable usage when usage is null', async () => {
      const utils = await import('./utils.ts')
      const log = defineMockLog(utils)

      const cmd: Command = define({
        name: 'test',
        description: 'Test command',
        args: {
          help: {
            type: 'boolean',
            short: 'h',
            description: 'Show help'
          }
        },
        rendering: {
          header: null, // Also disable header to test usage only
          usage: null
        }
      })

      await cli(['--help'], cmd, { name: 'test-cli' })

      const stdout = log()
      expect(stdout).toBe('')
    })

    test('should use custom usage renderer', async () => {
      const utils = await import('./utils.ts')
      const log = defineMockLog(utils)

      const cmd: Command = define({
        name: 'test',
        description: 'Test command',
        args: {
          help: {
            type: 'boolean',
            short: 'h',
            description: 'Show help'
          }
        },
        rendering: {
          usage: async ctx => `Usage: ${ctx.env.name} ${ctx.name} [options]`
        }
      })

      await cli(['--help'], cmd, { name: 'test-cli' })

      const stdout = log()
      expect(stdout).toContain('Usage: test-cli test [options]')
    })
  })

  describe('validation errors rendering', () => {
    test('should disable validation errors when validationErrors is null', async () => {
      const utils = await import('./utils.ts')
      const log = defineMockLog(utils)

      const cmd: Command = define({
        name: 'test',
        description: 'Test command',
        args: {
          required: {
            type: 'string',
            required: true,
            description: 'Required argument'
          }
        },
        rendering: {
          header: null, // Also disable header to test validationErrors only
          validationErrors: null
        }
      })

      await cli([], cmd, { name: 'test-cli' })

      const stdout = log()
      expect(stdout).toBe('')
    })

    test('should use custom validation errors renderer', async () => {
      const utils = await import('./utils.ts')
      const log = defineMockLog(utils)

      const cmd: Command = define({
        name: 'test',
        description: 'Test command',
        args: {
          required: {
            type: 'string',
            required: true,
            description: 'Required argument'
          }
        },
        rendering: {
          validationErrors: async (_ctx, error) => {
            return `ERROR: ${error.errors.map(e => e.message).join(', ')}`
          }
        }
      })

      await cli([], cmd, { name: 'test-cli' })

      const stdout = log()
      expect(stdout).toContain('ERROR: ')
    })
  })

  describe('integration with plugin-renderer', () => {
    test('Command rendering option should take precedence over plugin decorators', async () => {
      const utils = await import('./utils.ts')
      const log = defineMockLog(utils)

      const rendererPlugin = plugin({
        id: 'test-renderer',
        name: 'test-renderer',
        setup: ctx => {
          ctx.decorateHeaderRenderer(async () => 'Plugin header')
        }
      })

      const cmd: Command = define({
        name: 'test',
        description: 'Test command',
        rendering: {
          header: null // Should disable header despite plugin
        },
        run: ctx => {
          ctx.log('Command executed')
        }
      })

      await cli([], cmd, { name: 'test-cli', plugins: [rendererPlugin] })

      const stdout = log()
      expect(stdout).toBe('Command executed')
      expect(stdout).not.toContain('Plugin header')
    })
  })

  describe('partial rendering customization', () => {
    test('should customize only specified renderers', async () => {
      const utils = await import('./utils.ts')
      const log = defineMockLog(utils)

      const cmd: Command = define({
        name: 'test',
        description: 'Test command',
        args: {
          help: {
            type: 'boolean',
            short: 'h',
            description: 'Show help'
          }
        },
        rendering: {
          header: null // Disable only header
          // usage and validationErrors use defaults
        }
      })

      await cli(['--help'], cmd, { name: 'test-cli', renderHeader: async () => 'Default header' })

      const stdout = log()
      expect(stdout).not.toContain('Default header')
      // Usage should still be rendered
      expect(stdout).toContain('OPTIONS')
    })
  })
})
