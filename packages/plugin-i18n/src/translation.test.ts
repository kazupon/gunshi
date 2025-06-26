import { expect, test } from 'vitest'
import { DefaultTranslation } from './translation.ts'

test('DefaultTranslation', () => {
  const translation = new DefaultTranslation({
    locale: 'ja-JP',
    fallbackLocale: 'en-US'
  })
  translation.setResource('ja-JP', {
    hello: 'こんにちは、{$name}さん！'
  })
  translation.setResource('en-US', {
    hello: 'Hello, {$last} {$first}!'
  })

  expect(translation.translate('ja-JP', 'hello', { name: '太郎' })).toEqual(
    'こんにちは、太郎さん！'
  )
  expect(translation.translate('en-US', 'hello', { last: 'Dio', first: 'Brando' })).toEqual(
    'Hello, Dio Brando!'
  )
  expect(translation.translate('ja-JP', 'hello')).toEqual('こんにちは、さん！')
  expect(translation.translate('fr-FR', 'foo')).toEqual(undefined)
})
