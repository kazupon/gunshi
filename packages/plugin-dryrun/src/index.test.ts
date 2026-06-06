import { describe, expect, test, vi } from 'vitest'
import { createDecorators } from '../../gunshi/src/decorators.ts'
import { createPluginContext } from '../../gunshi/src/plugin/context.ts'
import dryrun, { pluginId } from './index.ts'

import type { Command, CommandContext, CommandContextCore } from '@gunshi/plugin'
import type { DryRunExtension, DryRunPluginOptions } from './index.ts'

const defaultDescription = 'Show what would be executed without running side effects'

describe('setup', () => {
  test('adds the default dry-run global option', async () => {
    const decorators = createDecorators()
    const ctx = createPluginContext(decorators)

    await dryrun()(ctx)

    expect(ctx.globalOptions.get('dryRun')).toEqual({
      type: 'boolean',
      description: defaultDescription
    })
  })

  test('adds a custom global option name and description', async () => {
    const decorators = createDecorators()
    const ctx = createPluginContext(decorators)

    await dryrun({
      name: 'pretend',
      description: 'Only print planned operations'
    })(ctx)

    expect(ctx.globalOptions.get('pretend')).toEqual({
      type: 'boolean',
      description: 'Only print planned operations'
    })
  })

  test('uses en-US description resource as fallback description', async () => {
    const decorators = createDecorators()
    const ctx = createPluginContext(decorators)

    await dryrun({
      descriptionResources: {
        'en-US': 'Preview operations',
        'ja-JP': '処理をプレビューする'
      }
    })(ctx)

    expect(ctx.globalOptions.get('dryRun')).toEqual({
      type: 'boolean',
      description: 'Preview operations'
    })
  })
})

describe('onExtension', () => {
  test('registers localized global option resources with i18n', async () => {
    const registerGlobalOptionResources =
      vi.fn<(option: string, resources: Record<string, string>) => void>()
    const plugin = dryrun({
      name: 'pretend',
      description: 'Preview operations',
      descriptionResources: {
        'ja-JP': '処理をプレビューする'
      }
    })

    await plugin.extension.onFactory?.(
      {
        extensions: {
          'g:i18n': {
            registerGlobalOptionResources
          }
        }
      } as unknown as CommandContext,
      {} as Command
    )

    expect(registerGlobalOptionResources).toHaveBeenCalledWith('pretend', {
      'en-US': 'Preview operations',
      'ja-JP': '処理をプレビューする'
    })
  })

  test('does nothing without i18n extension', async () => {
    const plugin = dryrun()

    const result = await plugin.extension.onFactory?.(
      {
        extensions: {}
      } as unknown as CommandContext,
      {} as Command
    )

    expect(result).toBeUndefined()
  })
})

describe('extension', () => {
  test('tracks whether dry-run mode is enabled', async () => {
    const disabled = await createDryRunExtension()
    const enabled = await createDryRunExtension({ values: { dryRun: true } })

    expect(disabled.extension.enabled).toBe(false)
    expect(enabled.extension.enabled).toBe(true)
  })

  test('run executes the task when dry-run mode is disabled', async () => {
    const { extension, log } = await createDryRunExtension()
    const task = vi.fn<() => string>(() => 'actual')

    const result = await extension.run(task, { result: 'fallback' })

    expect(result).toBe('actual')
    expect(task).toHaveBeenCalledOnce()
    expect(log).not.toHaveBeenCalled()
  })

  test('run skips a void task when dry-run mode is enabled', async () => {
    const { extension, log } = await createDryRunExtension({ values: { dryRun: true } })
    let called = false
    function publish() {
      called = true
    }

    await extension.run(publish)

    expect(called).toBe(false)
    expect(log).toHaveBeenCalledWith('[dryrun] publish')
  })

  test('run returns a fallback result when dry-run mode is enabled', async () => {
    const { extension, log } = await createDryRunExtension({ values: { dryRun: true } })
    const task = vi.fn<() => string>(() => 'actual')

    const result = await extension.run(task, {
      result: 'fallback',
      message: 'create release'
    })

    expect(result).toBe('fallback')
    expect(task).not.toHaveBeenCalled()
    expect(log).toHaveBeenCalledWith('[dryrun] create release')
  })

  test('run resolves a fallback result when dry-run mode is enabled', async () => {
    const { extension } = await createDryRunExtension({ values: { dryRun: true } })
    const task = vi.fn<() => string>(() => 'actual')

    const result = await extension.run(task, {
      resolve: async () => 'resolved'
    })

    expect(result).toBe('resolved')
    expect(task).not.toHaveBeenCalled()
  })

  test('wrap executes the function when dry-run mode is disabled', async () => {
    const { extension, log } = await createDryRunExtension()
    const write = vi.fn<(file: string) => string>(file => `wrote ${file}`)

    const wrapped = extension.wrap(write, { result: 'skipped' })
    const result = await wrapped('dist/index.js')

    expect(result).toBe('wrote dist/index.js')
    expect(write).toHaveBeenCalledWith('dist/index.js')
    expect(log).not.toHaveBeenCalled()
  })

  test('wrap returns a fallback result when dry-run mode is enabled', async () => {
    const { extension, log } = await createDryRunExtension({ values: { dryRun: true } })
    const write = vi.fn<(file: string) => string>(file => `wrote ${file}`)

    const wrapped = extension.wrap(write, {
      result: 'skipped',
      message: 'write dist/index.js'
    })
    const result = await wrapped('dist/index.js')

    expect(result).toBe('skipped')
    expect(write).not.toHaveBeenCalled()
    expect(log).toHaveBeenCalledWith('[dryrun] write dist/index.js')
  })

  test('wrap resolves a fallback result with call arguments', async () => {
    const { extension } = await createDryRunExtension({ values: { dryRun: true } })
    const copy = vi.fn<(from: string, to: string) => string>((from, to) => `${from} -> ${to}`)

    const wrapped = extension.wrap(copy, {
      resolve: (from, to) => `${to} <= ${from}`
    })
    const result = await wrapped('src', 'dist')

    expect(result).toBe('dist <= src')
    expect(copy).not.toHaveBeenCalled()
  })

  test('uses a custom option name and prefix', async () => {
    const { extension, log } = await createDryRunExtension({
      values: { pretend: true },
      options: {
        name: 'pretend',
        prefix: '[preview]'
      }
    })
    let called = false
    function migrate() {
      called = true
    }

    await extension.run(migrate)

    expect(called).toBe(false)
    expect(log).toHaveBeenCalledWith('[preview] migrate')
  })

  test('falls back to anonymous when a function has no name', async () => {
    const { extension, log } = await createDryRunExtension({ values: { dryRun: true } })
    const task = () => {}
    Object.defineProperty(task, 'name', { value: '' })

    await extension.run(task)

    expect(log).toHaveBeenCalledWith('[dryrun] anonymous')
  })
})

async function createDryRunExtension({
  values = {},
  options = {}
}: {
  values?: Record<string, unknown>
  options?: DryRunPluginOptions
} = {}): Promise<{
  extension: DryRunExtension
  log: ReturnType<typeof vi.fn>
}> {
  const log = vi.fn<(message: string) => void>()
  const core = {
    values,
    log
  } as unknown as CommandContextCore
  const plugin = dryrun(options)
  const extension = await plugin.extension.factory(core, {} as Command)

  expect(plugin.id).toBe(pluginId)

  return { extension, log }
}
