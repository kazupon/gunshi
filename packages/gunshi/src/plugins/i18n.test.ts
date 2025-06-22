import { afterEach, describe, expect, test, vi } from 'vitest'
import { createMockCommandContext } from '../../test/utils.ts'
import { resolveBuiltInKey } from '../utils.ts'
import i18n from './i18n.ts'

import type { Command, TranslationAdapter } from '../types.ts'

afterEach(() => {
  vi.resetAllMocks()
})

test('create i18n extension with default locale', async () => {
  const plugin = i18n()
  const ctx = await createMockCommandContext()
  const extension = await plugin.extension.factory(ctx, {} as Command)

  expect(extension).toBeDefined()
  expect(extension.locale.toString()).toBe('en-US')
  expect(typeof extension.translate).toBe('function')
})

test('create i18n extension with custom locale', async () => {
  const plugin = i18n({ locale: 'ja-JP' })
  const ctx = await createMockCommandContext()
  const extension = await plugin.extension.factory(ctx, {} as Command)

  expect(extension.locale.toString()).toBe('ja-JP')
})

describe('translate built-in keys', () => {
  test('default: en-US', async () => {
    const plugin = i18n()
    const ctx = await createMockCommandContext()
    const extension = await plugin.extension.factory(ctx, {} as Command)

    expect(extension.translate(resolveBuiltInKey('ARGUMENTS'))).toEqual('ARGUMENTS')
    expect(extension.translate(resolveBuiltInKey('OPTIONS'))).toEqual('OPTIONS')
    expect(extension.translate(resolveBuiltInKey('COMMANDS'))).toEqual('COMMANDS')
    expect(extension.translate(resolveBuiltInKey('USAGE'))).toEqual('USAGE')
    expect(extension.translate(resolveBuiltInKey('COMMAND'))).toEqual('COMMAND')
    expect(extension.translate(resolveBuiltInKey('EXAMPLES'))).toEqual('EXAMPLES')
    expect(extension.translate(resolveBuiltInKey('SUBCOMMAND'))).toEqual('SUBCOMMAND')
    expect(extension.translate(resolveBuiltInKey('CHOICES'))).toEqual('choices')
    expect(extension.translate(resolveBuiltInKey('DEFAULT'))).toEqual('default')
    expect(extension.translate(resolveBuiltInKey('FORMORE'))).toEqual(
      'For more info, run any command with the `--help` flag'
    )
    expect(extension.translate(resolveBuiltInKey('NEGATABLE'))).toEqual('Negatable of')
    expect(extension.translate(resolveBuiltInKey('help'))).toEqual('Display this help message')
    expect(extension.translate(resolveBuiltInKey('version'))).toEqual('Display this version')
  })

  test('custom locale: ja-JP', async () => {
    const plugin = i18n({ locale: 'ja-JP' })
    const ctx = await createMockCommandContext()
    const extension = await plugin.extension.factory(ctx, {} as Command)

    expect(extension.translate(resolveBuiltInKey('ARGUMENTS'))).toEqual('引数')
    expect(extension.translate(resolveBuiltInKey('OPTIONS'))).toEqual('オプション')
    expect(extension.translate(resolveBuiltInKey('COMMANDS'))).toEqual('コマンド')
    expect(extension.translate(resolveBuiltInKey('USAGE'))).toEqual('使い方')
    expect(extension.translate(resolveBuiltInKey('COMMAND'))).toEqual('コマンド')
    expect(extension.translate(resolveBuiltInKey('EXAMPLES'))).toEqual('例')
    expect(extension.translate(resolveBuiltInKey('SUBCOMMAND'))).toEqual('サブコマンド')
    expect(extension.translate(resolveBuiltInKey('CHOICES'))).toEqual('選択肢')
    expect(extension.translate(resolveBuiltInKey('DEFAULT'))).toEqual('デフォルト')
    expect(extension.translate(resolveBuiltInKey('FORMORE'))).toEqual(
      '詳細は、コマンドと`--help`フラグを実行してください'
    )
    expect(extension.translate(resolveBuiltInKey('NEGATABLE'))).toEqual('否定可能な')
    expect(extension.translate(resolveBuiltInKey('help'))).toEqual('このヘルプメッセージを表示')
    expect(extension.translate(resolveBuiltInKey('version'))).toEqual('このバージョンを表示')
  })
})

describe('translate non-built-in keys', () => {
  test('default: en-US', async () => {
    const translation = {
      getMessage: vi.fn(),
      setResource: vi.fn(),
      getResource: vi.fn(),
      translate: vi.fn().mockImplementation(key => key)
    } as TranslationAdapter
    const plugin = i18n({ translationAdapterFactory: () => translation })
    const ctx = await createMockCommandContext()
    const extension = await plugin.extension.factory(ctx, {} as Command)

    extension.translate(resolveBuiltInKey('ARGUMENTS'))
    extension.translate('description')
    expect(translation.translate).toHaveBeenCalledTimes(1)
    expect(translation.translate).toHaveBeenCalledWith('en-US', 'description', {})
  })

  test('custom locale: ja-JP', async () => {
    const translation = {
      getMessage: vi.fn(),
      setResource: vi.fn(),
      getResource: vi.fn(),
      translate: vi.fn().mockImplementation(key => key)
    } as TranslationAdapter
    const plugin = i18n({ translationAdapterFactory: () => translation, locale: 'ja-JP' })
    const ctx = await createMockCommandContext()
    const extension = await plugin.extension.factory(ctx, {} as Command)

    extension.translate(resolveBuiltInKey('ARGUMENTS'))
    extension.translate('examples', { foo: 'bar' })
    expect(translation.translate).toHaveBeenCalledTimes(1)
    expect(translation.translate).toHaveBeenCalledWith('ja-JP', 'examples', { foo: 'bar' })
  })
})

test('handle missing translations gracefully', async () => {
  const plugin = i18n()
  const ctx = await createMockCommandContext()
  const extension = await plugin.extension.factory(ctx, {} as Command)

  // Test non-existent key
  expect(extension.translate('non-existent-key')).toBe('')
})
