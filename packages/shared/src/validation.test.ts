import { createCommandContext } from 'gunshi/context'
import { describe, expect, test } from 'vitest'
import { resolveBuiltInKey } from './utils.ts'
import { localizeBuiltinResource } from './validation.ts'

/**
 * Create a command context, with an i18n plugin that translates with the texts, when they are given.
 *
 * @param texts - The translated texts, keyed by the keys
 * @returns The command context
 */
async function createContext(texts?: Record<string, string>) {
  return await createCommandContext({
    extensions:
      texts === undefined
        ? {}
        : {
            'g:i18n': {
              key: Symbol('g:i18n'),
              factory: () => ({ translate: (key: string) => texts[key] ?? key })
            }
          }
  })
}

describe('localizeBuiltinResource', () => {
  test('takes the English text without the i18n plugin', async () => {
    const ctx = await createContext()

    expect(await localizeBuiltinResource(ctx, 'err:json:not-supported')).toBe(
      'This command does not support --json'
    )
    expect(
      await localizeBuiltinResource(ctx, resolveBuiltInKey('json:invalid-arguments'), { count: 2 })
    ).toBe('2 arguments are invalid')
  })

  test('takes the translation of the i18n plugin', async () => {
    const ctx = await createContext({ '_:json:next:help': 'コマンドの引数を確認する' })

    expect(await localizeBuiltinResource(ctx, resolveBuiltInKey('json:next:help'))).toBe(
      'コマンドの引数を確認する'
    )
  })

  test('takes the English text when the i18n plugin returns the key, as an older one does', async () => {
    const ctx = await createContext({})

    expect(await localizeBuiltinResource(ctx, resolveBuiltInKey('json:next:help'))).toBe(
      'See the arguments of the command'
    )
  })

  test('returns the key that no resource has', async () => {
    const ctx = await createContext()

    expect(await localizeBuiltinResource(ctx, 'err:json:nope')).toBe('err:json:nope')
  })
})
