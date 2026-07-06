import i18n from '@gunshi/plugin-i18n'
import { ArgsValidationError, ArgsValidationErrorKeys } from 'args-tokens'
import { expect, test } from 'vitest'
import { createCommandContext } from '../../gunshi/src/context.ts'
import renderer from './index.ts'
import { renderValidationErrors } from './validation.ts'

import type { Command, CommandContext } from '@gunshi/plugin'

test('basic', async () => {
  const ctx = await createCommandContext({
    cliOptions: {
      cwd: '/path/to/cmd1',
      version: '0.0.0',
      name: 'cmd1'
    }
  })
  const error = new AggregateError([
    new Error(`Optional argument '--dependency' or '-d' is required`),
    new Error(`Optional argument '--alias' or '-a' is required`)
  ])

  await expect(renderValidationErrors(ctx, error)).resolves.toEqual(
    [
      `Optional argument '--dependency' or '-d' is required`,
      `Optional argument '--alias' or '-a' is required`
    ].join('\n')
  )
})

test('args validation error keeps fallback message without i18n', async () => {
  const ctx = await createCommandContext({
    cliOptions: {
      cwd: '/path/to/cmd1',
      version: '0.0.0',
      name: 'cmd1'
    }
  })
  const error = new AggregateError([
    new ArgsValidationError('fallback required option message', {
      code: ArgsValidationErrorKeys.requiredOption,
      values: {
        displayName: "'--id'"
      }
    })
  ])

  await expect(renderValidationErrors(ctx, error)).resolves.toEqual(
    'fallback required option message'
  )
})

test('args validation error falls back to message for unknown code', async () => {
  const ctx = await createCommandContext({
    cliOptions: {
      cwd: '/path/to/cmd1',
      version: '0.0.0',
      name: 'cmd1'
    }
  })
  const error = new AggregateError([
    new ArgsValidationError('fallback message', {
      code: 'err:arg:unknown-test' as typeof ArgsValidationErrorKeys.requiredOption
    })
  ])

  await expect(renderValidationErrors(ctx, error)).resolves.toEqual('fallback message')
})

test('args validation error uses i18n resource', async () => {
  const i18nPlugin = i18n({
    locale: 'ja-JP',
    builtinResources: {
      'ja-JP': {
        'err:arg:required-option': '必須オプション: {$displayName}'
      }
    }
  })
  const rendererPlugin = renderer()
  const command = {
    name: 'test',
    run: async () => {}
  } as Command
  const ctx = await createCommandContext({
    command,
    extensions: {
      [i18nPlugin.id]: i18nPlugin.extension,
      [rendererPlugin.id]: rendererPlugin.extension
    }
  })
  const error = new AggregateError([
    new ArgsValidationError(`Optional argument '--id' is required`, {
      code: ArgsValidationErrorKeys.requiredOption,
      values: {
        displayName: "'--id'"
      }
    })
  ])

  await expect(renderValidationErrors(ctx, error)).resolves.toEqual("必須オプション: '--id'")
})

test('custom parse reasonKey uses command resource', async () => {
  const i18nPlugin = i18n({
    locale: 'ja-JP',
    builtinResources: {
      'ja-JP': {
        'err:arg:custom-parse': '{$displayName} の値が不正です: {$reason}'
      }
    }
  })
  const rendererPlugin = renderer()
  const command = {
    name: 'test',
    resource: () => ({
      'errors.invalidDateFormat': '日付形式が不正です。{$expected} 形式で指定してください'
    }),
    run: async () => {}
  } as Command
  const ctx = await createCommandContext({
    command,
    extensions: {
      [i18nPlugin.id]: i18nPlugin.extension,
      [rendererPlugin.id]: rendererPlugin.extension
    }
  })
  await ctx.extensions[i18nPlugin.id].loadResource('ja-JP', ctx as CommandContext, command)

  const error = new AggregateError([
    new ArgsValidationError('Invalid value for --date: Invalid date format', {
      code: ArgsValidationErrorKeys.customParse,
      values: {
        displayName: '--date',
        reason: 'Invalid date format',
        reasonKey: 'errors.invalidDateFormat',
        reasonValues: {
          expected: 'YYYY-MM-DD'
        }
      }
    })
  ])

  await expect(renderValidationErrors(ctx, error)).resolves.toEqual(
    '--date の値が不正です: 日付形式が不正です。YYYY-MM-DD 形式で指定してください'
  )
})
