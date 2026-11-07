import fs from 'node:fs/promises'
import { assert, expect, test } from 'vitest'
import master from '../locales/en-US.json' with { type: 'json' }
import resources from './index.ts'

test('has the heading of the causes of a CommandError', () => {
  expect(resources['en-US'].CAUSEDBY).toBe('Caused by')
  expect(resources['ja-JP'].CAUSEDBY).toBe('原因')
})

test('has the texts of the JSON output', () => {
  for (const locale of ['en-US', 'ja-JP'] as const) {
    for (const key of [
      'json',
      'json:invalid-arguments',
      'json:next:help',
      'json:next:help-placeholder',
      'err:json:not-supported',
      'err:json:invalid-result',
      'err:json:unserializable-result'
    ] as const) {
      expect(resources[locale][key], `${locale}: ${key}`).toBeTypeOf('string')
    }
  }
  // the placeholder of the name of the CLI stays as it is in every locale
  expect(resources['ja-JP']['json:next:help-placeholder']).toContain('<COMMAND>')
})

test('validate keys', async () => {
  const keys = Object.keys(master)
  const localeFiles = await fs.readdir(new URL('../locales', import.meta.url))
  const locales = localeFiles
    .filter(file => file.endsWith('.json') && file !== 'en-US.json')
    .map(file => file.replace('.json', ''))
  for (const locale of locales) {
    const data = await import(`../locales/${locale}.json`, { with: { type: 'json' } }).then(
      (m: { default: Record<string, unknown> }) => m.default
    )
    assert.deepEqual(keys, Object.keys(data), `Keys mismatch in locale: ${locale}`)
  }
})
