import { namespacedId, resolveArgKey, resolveBuiltInKey, resolveKey } from '@gunshi/shared'
import { MessageFormat } from 'messageformat'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { createCommandContext } from '../../gunshi/src/context.ts'
import { createMockCommandContext } from '../../gunshi/test/utils.ts'
import {
  createTranslationAdapterForIntlifyMessageFormat,
  createTranslationAdapterForMessageFormat2
} from '../test/helper.ts'
import i18n, { defineI18n, pluginId } from './index.ts'

import type { Args, Command, CommandContext, GunshiParams } from '@gunshi/plugin'
import type {
  CommandResource,
  CommandResourceFetcher,
  I18nExtension,
  TranslationAdapter
} from './types.ts'

afterEach(() => {
  vi.resetAllMocks()
})

describe('extension: locale', () => {
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
})

describe('extension: translate', () => {
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
      const jaJPResource = await import('@gunshi/resources/ja-JP', { with: { type: 'json' } }).then(
        m => m.default || m
      )
      const plugin = i18n({ locale: 'ja-JP', builtinResources: { 'ja-JP': jaJPResource } })
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

    // test non-existent key
    expect(extension.translate('non-existent-key')).toBe('')
  })
})

describe('translation adapter', () => {
  test('Intl.MessageFormat (MF2)', async () => {
    const args = {
      foo: {
        type: 'string',
        short: 'f',
        description: 'this is foo option'
      }
    } satisfies Args

    const jaJPResource = {
      description: 'これはコマンド1です',
      'arg:foo': 'これは foo オプションです',
      examples: 'これはコマンド1の例です',
      user: 'こんにちは、{$user}'
    } satisfies CommandResource<GunshiParams<{ args: typeof args }>>

    const loadLocale = 'ja-JP'

    const plugin = i18n({
      translationAdapterFactory: createTranslationAdapterForMessageFormat2,
      locale: loadLocale
    })

    const id = namespacedId('i18n')
    using mockResource = vi
      .fn<
        CommandResourceFetcher<{
          extensions: { [K in typeof id]: I18nExtension }
        }>
      >()
      .mockImplementation(ctx => {
        if (ctx.extensions[pluginId].locale.toString() === loadLocale) {
          return Promise.resolve(jaJPResource)
        } else {
          throw new Error('not found')
        }
      })

    const command = defineI18n<{
      extensions: { [id]: I18nExtension }
    }>({
      name: 'cmd1',
      args,
      examples: 'this is an cmd1 example',
      run: vi.fn(),
      resource: mockResource
    })

    const ctx = await createCommandContext<{
      extensions: { [K in typeof id]: I18nExtension }
    }>({
      args,
      explicit: { foo: true },
      values: { foo: 'foo' },
      positionals: ['bar'],
      rest: [],
      argv: ['bar'],
      tokens: [],
      command,
      extensions: { [plugin.id]: plugin.extension },
      omitted: false,
      callMode: 'entry',
      cliOptions: {
        description: 'this is cmd1'
      }
    })

    const ext = ctx.extensions[id]
    const mf1 = new MessageFormat('ja-JP', jaJPResource['arg:foo'])
    expect(
      ext.translate(resolveArgKey<typeof args>('foo', ctx as unknown as CommandContext))
    ).toEqual(mf1.format())
    const mf2 = new MessageFormat('ja-JP', jaJPResource.user)
    expect(
      ext.translate(resolveKey<{ user: string }>('user', ctx as unknown as CommandContext), {
        user: 'kazupon'
      })
    ).toEqual(mf2.format({ user: 'kazupon' }))
  })

  test('Intlify Message Format', async () => {
    const args = {
      foo: {
        type: 'string',
        short: 'f',
        description: 'this is foo option'
      }
    } satisfies Args

    const jaJPResource = {
      description: 'これはコマンド1です',
      'arg:foo': 'これは foo オプションです',
      examples: 'これはコマンド1の例です',
      user: 'こんにちは、{user}'
    } satisfies CommandResource<GunshiParams<{ args: typeof args }>>

    const loadLocale = 'ja-JP'

    const plugin = i18n({
      translationAdapterFactory: createTranslationAdapterForIntlifyMessageFormat,
      locale: loadLocale
    })

    const id = namespacedId('i18n')
    using mockResource = vi
      .fn<
        CommandResourceFetcher<{
          extensions: { [K in typeof id]: I18nExtension }
        }>
      >()
      .mockImplementation(ctx => {
        if (ctx.extensions[pluginId].locale.toString() === loadLocale) {
          return Promise.resolve(jaJPResource)
        } else {
          throw new Error('not found')
        }
      })

    const command = defineI18n<{
      extensions: { [id]: I18nExtension }
    }>({
      name: 'cmd1',
      args,
      examples: 'this is an cmd1 example',
      run: vi.fn(),
      resource: mockResource
    })

    const ctx = await createCommandContext<{
      extensions: { [K in typeof id]: I18nExtension }
    }>({
      args,
      explicit: { foo: true },
      values: { foo: 'foo' },
      positionals: ['bar'],
      rest: [],
      argv: ['bar'],
      tokens: [],
      command,
      extensions: { [plugin.id]: plugin.extension },
      omitted: false,
      callMode: 'entry',
      cliOptions: {
        description: 'this is cmd1'
      }
    })

    const ext = ctx.extensions[id]
    expect(ext.translate(resolveArgKey('foo', ctx as unknown as CommandContext))).toEqual(
      jaJPResource['arg:foo']
    )
    expect(
      ext.translate(resolveKey('user', ctx as unknown as CommandContext), { user: 'kazupon' })
    ).toEqual(`こんにちは、kazupon`)
  })
})
