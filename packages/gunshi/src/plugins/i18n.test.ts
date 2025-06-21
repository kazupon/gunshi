import { expect, test } from 'vitest'
import { createMockCommandContext } from '../../test/utils.ts'
import i18n from './i18n.ts'

import type { Command } from '../types.ts'

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

test('translate built-in keys', async () => {
  const plugin = i18n()
  const ctx = await createMockCommandContext()
  const extension = await plugin.extension.factory(ctx, {} as Command)

  // Test built-in key translation
  const helpText = extension.translate('_:help')
  expect(helpText).toBe('Display this help message')
})

test('handle missing translations gracefully', async () => {
  const plugin = i18n()
  const ctx = await createMockCommandContext()
  const extension = await plugin.extension.factory(ctx, {} as Command)

  // Test non-existent key
  expect(extension.translate('non-existent-key')).toBe('')
})
