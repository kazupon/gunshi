import { describe, expect, test } from 'vitest'
import { defineMockLog } from '../test/utils.ts'
import { cli } from './cli.ts'
import { define, lazy } from './definition.ts'
import { plugin } from './plugin/core.ts'

import type { Args, Command, CommandRunner, RenderingOptions } from './types.ts'

describe('Command rendering options', () => {
  describe('header rendering', () => {
    test('disable header when header is null', async () => {
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

      await cli([], cmd, {
        name: 'test-cli',
        renderHeader: () => Promise.resolve('Default header')
      })

      const stdout = log()
      expect(stdout).toBe('Command executed')
    })

    test('use custom header renderer', async () => {
      const utils = await import('./utils.ts')
      const log = defineMockLog(utils)

      const cmd: Command = define({
        name: 'test',
        description: 'Test command',
        rendering: {
          header: ctx => Promise.resolve(`=== ${ctx.name?.toUpperCase()} ===`)
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

    test('use default renderer when header is undefined', async () => {
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

      await cli([], cmd, {
        name: 'test-cli',
        renderHeader: () => Promise.resolve('Default header')
      })

      const stdout = log()
      expect(stdout).toContain('Default header')
      expect(stdout).toContain('Command executed')
    })
  })

  describe('usage rendering', () => {
    test('disable usage when usage is null', async () => {
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

    test('use custom usage renderer', async () => {
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
          usage: ctx => Promise.resolve(`Usage: ${ctx.env.name} ${ctx.name} [options]`)
        }
      })

      await cli(['--help'], cmd, { name: 'test-cli' })

      const stdout = log()
      expect(stdout).toContain('Usage: test-cli test [options]')
    })
  })

  describe('validation errors rendering', () => {
    test('disable validation errors when validationErrors is null', async () => {
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

      await expect(cli([], cmd, { name: 'test-cli' })).rejects.toBeInstanceOf(AggregateError)

      const stdout = log()
      expect(stdout).toBe('')
    })

    test('use custom validation errors renderer', async () => {
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
          validationErrors: (_ctx, error) => {
            return Promise.resolve(`ERROR: ${error.errors.map((e: Error) => e.message).join(', ')}`)
          }
        }
      })

      await expect(cli([], cmd, { name: 'test-cli' })).rejects.toBeInstanceOf(AggregateError)

      const stdout = log()
      expect(stdout).toContain('ERROR: ')
    })
  })

  describe('integration with plugin-renderer', () => {
    test('command rendering option should take precedence over plugin decorators', async () => {
      const utils = await import('./utils.ts')
      const log = defineMockLog(utils)

      const rendererPlugin = plugin({
        id: 'test-renderer',
        name: 'test-renderer',
        setup: ctx => {
          ctx.decorateHeaderRenderer(() => Promise.resolve('Plugin header'))
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
    test('customize only specified renderers', async () => {
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

      await cli(['--help'], cmd, {
        name: 'test-cli',
        renderHeader: () => Promise.resolve('Default header')
      })

      const stdout = log()
      expect(stdout).not.toContain('Default header')
      // Usage should still be rendered
      expect(stdout).toContain('OPTIONS')
    })
  })

  describe('lazy command', () => {
    const args = {
      env: { type: 'string', required: true, description: 'Target environment' }
    } satisfies Args

    const rendering: RenderingOptions = {
      header: null,
      usage: () => Promise.resolve('Custom usage'),
      validationErrors: () => Promise.resolve('Custom validation errors')
    }

    const run: CommandRunner = ctx => {
      ctx.log('Command executed')
    }

    // where the rendering options of a lazy command come from
    const commands = {
      'the definition that is given to `lazy`': () =>
        lazy(() => run, { name: 'test', args, rendering }),
      'the command that the loader returns': () =>
        lazy(() => define({ name: 'test', args, rendering, run }), { name: 'test' })
    }
    const sources = Object.keys(commands) as (keyof typeof commands)[]

    function createOptions(source: keyof typeof commands) {
      return {
        name: 'test-cli',
        subCommands: { test: commands[source]() },
        renderHeader: () => Promise.resolve('Default header')
      }
    }

    const entry = define({ run: () => {} })

    test.each(sources)('header by %s', async source => {
      const utils = await import('./utils.ts')
      const log = defineMockLog(utils)

      await cli(['test', '--env', 'prod'], entry, createOptions(source))

      expect(log()).toBe('Command executed')
    })

    test.each(sources)('usage by %s', async source => {
      const utils = await import('./utils.ts')
      const log = defineMockLog(utils)

      await cli(['test', '--help'], entry, createOptions(source))

      expect(log()).toBe('Custom usage')
    })

    test.each(sources)('validation errors by %s', async source => {
      const utils = await import('./utils.ts')
      const log = defineMockLog(utils)

      await expect(cli(['test'], entry, createOptions(source))).rejects.toBeInstanceOf(
        AggregateError
      )

      expect(log()).toBe('Custom validation errors')
    })
  })
})
