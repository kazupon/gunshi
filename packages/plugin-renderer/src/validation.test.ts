import i18n from '@gunshi/plugin-i18n'
import {
  ArgsValidationError,
  ArgsValidationErrorKeys,
  CommandNotFoundError,
  CommandNotFoundErrorKeys,
  CommandResolutionError,
  CommandResolutionErrorKeys
} from '@gunshi/plugin'
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

test('command not found error keeps fallback message without i18n', async () => {
  const ctx = await createCommandContext({
    cliOptions: {
      cwd: '/path/to/cmd1',
      version: '0.0.0',
      name: 'cmd1'
    }
  })
  const error = new AggregateError([
    new CommandNotFoundError('Command not found: deployx', {
      code: CommandNotFoundErrorKeys.notFound,
      values: {
        commandName: 'deployx'
      },
      commandName: 'deployx',
      candidates: ['deploy']
    })
  ])

  await expect(renderValidationErrors(ctx, error)).resolves.toEqual('Command not found: deployx')
})

test('command not found error uses i18n resource', async () => {
  const i18nPlugin = i18n({
    locale: 'ja-JP',
    builtinResources: {
      'ja-JP': {
        'err:cmd:not-found': '不明なコマンド: {$commandName}'
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
    new CommandNotFoundError('Command not found: deployx', {
      code: CommandNotFoundErrorKeys.notFound,
      values: {
        commandName: 'deployx'
      },
      commandName: 'deployx',
      candidates: ['deploy']
    })
  ])

  await expect(renderValidationErrors(ctx, error)).resolves.toEqual('不明なコマンド: deployx')
})

test('command resolution error keeps the English fallback without i18n', async () => {
  const ctx = await createCommandContext({
    cliOptions: {
      cwd: '/path/to/cmd1',
      version: '0.0.0',
      name: 'cmd1'
    }
  })
  const error = new AggregateError([
    new CommandResolutionError('Move options after the command name.', {
      code: CommandResolutionErrorKeys.inconsistentOptions,
      values: {},
      commandPath: [],
      candidatePaths: [['clean'], ['deploy']]
    })
  ])

  await expect(renderValidationErrors(ctx, error)).resolves.toBe(
    'Move options after the command name.'
  )
})

test('command resolution error uses the localized resource', async () => {
  const i18nPlugin = i18n({
    locale: 'ja-JP',
    builtinResources: {
      'ja-JP': {
        [CommandResolutionErrorKeys.inconsistentOptions]: 'オプションの解決に失敗しました'
      }
    }
  })
  const rendererPlugin = renderer()
  const ctx = await createCommandContext({
    command: { name: 'test', run: async () => {} },
    extensions: {
      [i18nPlugin.id]: i18nPlugin.extension,
      [rendererPlugin.id]: rendererPlugin.extension
    }
  })
  const error = new AggregateError([
    new CommandResolutionError('The options do not identify a consistent command.', {
      code: CommandResolutionErrorKeys.inconsistentOptions,
      values: {},
      commandPath: [],
      candidatePaths: []
    })
  ])

  await expect(renderValidationErrors(ctx, error)).resolves.toBe('オプションの解決に失敗しました')
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

async function createI18nContext(locale: string, resource?: Record<string, string>) {
  const i18nPlugin = i18n({
    locale,
    builtinResources: resource ? { [locale]: resource } : undefined
  })
  const rendererPlugin = renderer()
  return await createCommandContext({
    command: { name: 'test', run: async () => {} } as Command,
    extensions: {
      [i18nPlugin.id]: i18nPlugin.extension,
      [rendererPlugin.id]: rendererPlugin.extension
    }
  })
}

// what args-tokens gives for `--port -5`, and for `--port` at the end
function createMissingValueError(withHint: boolean): AggregateError {
  return new AggregateError([
    new ArgsValidationError(
      `Optional argument '--port' or '-p' requires a value${withHint ? " (to pass '-5' as its value, write '--port=-5')" : ''}`,
      {
        code: ArgsValidationErrorKeys.missingValue,
        values: {
          displayName: "'--port' or '-p'",
          name: 'port',
          expected: 'number',
          ...(withHint ? { next: '-5', suggestion: '--port=-5' } : {})
        }
      }
    )
  ])
}

const jaMissingValue = {
  'err:arg:missing-value': 'オプション {$displayName} には値が必要です',
  'err:arg:missing-value:hint': "('{$next}' を値として渡すには '{$suggestion}' と書いてください)"
}

test('a translated missing value keeps the hint of args-tokens', async () => {
  // the translation replaces the whole message, hint included (#791)
  const ctx = await createI18nContext('ja-JP', jaMissingValue)

  await expect(renderValidationErrors(ctx, createMissingValueError(true))).resolves.toBe(
    "オプション '--port' or '-p' には値が必要です ('-5' を値として渡すには '--port=-5' と書いてください)"
  )
})

test('a missing value in en-US reads as the message of args-tokens', async () => {
  const ctx = await createI18nContext('en-US')
  const error = createMissingValueError(true)

  await expect(renderValidationErrors(ctx, error)).resolves.toBe((error.errors[0] as Error).message)
})

test('a missing value without a hint is translated without one', async () => {
  const ctx = await createI18nContext('ja-JP', jaMissingValue)

  await expect(renderValidationErrors(ctx, createMissingValueError(false))).resolves.toBe(
    "オプション '--port' or '-p' には値が必要です"
  )
})

test('the hint falls back to en-US when the locale does not translate it', async () => {
  // as for any built-in key, a resource that lacks the key gets the text of en-US
  const ctx = await createI18nContext('ja-JP', {
    'err:arg:missing-value': 'オプション {$displayName} には値が必要です'
  })

  await expect(renderValidationErrors(ctx, createMissingValueError(true))).resolves.toBe(
    "オプション '--port' or '-p' には値が必要です (to pass '-5' as its value, write '--port=-5')"
  )
})

test('only a missing value gets the hint', async () => {
  const ctx = await createI18nContext('ja-JP', {
    'err:arg:invalid-type': '{$displayName} の値が不正です'
  })
  const error = new AggregateError([
    new ArgsValidationError(`Optional argument '--port' should be 'number'`, {
      code: ArgsValidationErrorKeys.invalidType,
      values: { displayName: "'--port'", next: '-5', suggestion: '--port=-5' }
    })
  ])

  await expect(renderValidationErrors(ctx, error)).resolves.toBe("'--port' の値が不正です")
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
