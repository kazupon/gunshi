import fs from 'node:fs/promises'
import { assert, test } from 'vitest'
import master from '../locales/en-US.json' with { type: 'json' }

test('validate keys', async () => {
  const keys = Object.keys(master)
  const localeFiles = await fs.readdir(new URL('../locales', import.meta.url))
  const locales = localeFiles
    .filter(file => file.endsWith('.json') && file !== 'en-US.json')
    .map(file => file.replace('.json', ''))
  for (const locale of locales) {
    const data = await import(`../locales/${locale}.json`, { with: { type: 'json' } }).then(
      m => m.default || m
    )
    assert.deepEqual(keys, Object.keys(data), `Keys mismatch in locale: ${locale}`)
  }
})
