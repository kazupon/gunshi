import { define } from 'gunshi'
import { createCommandContext } from 'gunshi/context'
import { describe, expect, test, vi } from 'vitest'
import { localizable } from './localization.ts'
import { resolveArgKey, resolveBuiltInKey } from './utils.ts'

const LANG_RESOURCES = {
  description: 'これはcommand1の説明です',
  foo: 'foo引数の説明'
} as const

const args = {
  foo: {
    type: 'string',
    description: 'Foo argument description',
    short: 'f'
  },
  bar: {
    type: 'boolean',
    description: 'Bar argument description',
    negatable: true
  }
} as const

async function setup() {
  const command1 = define({
    name: 'command1',
    description: 'Command 1 description',
    args,
    examples: () => {
      return `command1 --foo value --no-bar`
    }
  })

  const ctx = await createCommandContext({
    args: command1.args!,
    values: {},
    positionals: [],
    explicit: {},
    rest: [],
    argv: [],
    tokens: [],
    omitted: false,
    callMode: 'subCommand',
    command: command1,
    extensions: {},
    cliOptions: {}
  })

  return { ctx, command1 }
}

test('with translation function', async () => {
  const mockTranslate = vi
    .fn()
    .mockImplementation((key: string, _values: Record<string, unknown>): string => {
      return LANG_RESOURCES[key as keyof typeof LANG_RESOURCES] || key
    })

  const { ctx, command1 } = await setup()
  const localize = localizable(ctx, command1, mockTranslate)

  expect(await localize('description')).toEqual(LANG_RESOURCES['description'])
  expect(await localize('foo')).toEqual(LANG_RESOURCES['foo'])
  expect(await localize('nonexistent_key')).toEqual('nonexistent_key')
})

describe('without translation function', () => {
  test('gunshi built-in keys', async () => {
    const { ctx, command1 } = await setup()
    const localize = localizable(ctx, command1)

    expect(await localize(resolveBuiltInKey('USAGE'))).toEqual('USAGE')
    expect(await localize(resolveBuiltInKey('help'))).toEqual('Display this help message')
  })

  test('gunshi args keys', async () => {
    const { ctx, command1 } = await setup()
    const localize = localizable<
      typeof args,
      { name: 'command1' },
      { description: string; examples: string }
    >(ctx, command1)

    // normal argument
    expect(
      await localize(resolveArgKey<NonNullable<typeof command1.args>>('foo', ctx.name))
    ).toEqual('Foo argument description')
    // negatable argument
    expect(
      await localize(resolveArgKey<NonNullable<typeof command1.args>>('no-bar', ctx.name))
    ).toEqual('Negatable of --bar')
    // non-existent argument
    expect(await localize(resolveArgKey('test', ctx.name))).toEqual('test')
  })

  test('other keys', async () => {
    const { ctx, command1 } = await setup()
    const localize = localizable(ctx, command1)

    // `description` key with command name
    expect(await localize('command1:description')).toEqual('')
    // `description` key
    expect(await localize('description')).toEqual('description')
    // `examples` key with command name
    expect(await localize('command1:examples')).toEqual('command1 --foo value --no-bar')
    // other keys
    expect(await localize('other_key')).toEqual('other_key')
  })
})
