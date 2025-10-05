import { describe, expectTypeOf, test } from 'vitest'

import type { Awaitable, Command, CommandContext, Prettify } from '@gunshi/plugin'
import type { CommandResource, CommandResourceFetcher, I18nCommand } from './types.ts'

const _args = {
  force: { type: 'boolean' },
  timeout: { type: 'number' }
} as const

const _extensions = {
  i18n: { locale: Intl.Locale, translate: (key: string) => key }
} as const

describe('CommandResource', () => {
  test('default', () => {
    type Actual = Prettify<CommandResource>
    type Expected = Prettify<{ description: string } & {} & { [key: string]: string }>
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })

  test('with args', () => {
    type Actual = Prettify<CommandResource<{ args: typeof _args }>>
    type Expected = Prettify<CommandResource<{ description: string; args: typeof _args }>>
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })

  test('with extensions', () => {
    type Actual = Prettify<CommandResource<{ extensions: typeof _extensions }>>
    type Expected = Prettify<
      CommandResource<{ description: string; extensions: typeof _extensions }>
    >
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })

  test('with args and extensions', () => {
    type Actual = Prettify<CommandResource<{ args: typeof _args; extensions: typeof _extensions }>>
    type Expected = Prettify<
      CommandResource<{ description: string; args: typeof _args; extensions: typeof _extensions }>
    >
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })
})

describe('CommandResourceFetcher', () => {
  test('default', () => {
    type Actual = CommandResourceFetcher
    type Expected = (ctx: Readonly<CommandContext>) => Awaitable<CommandResource>
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })

  test('with args', () => {
    type Actual = CommandResourceFetcher<{ args: typeof _args }>
    type Expected = (
      ctx: Readonly<CommandContext<{ args: typeof _args }>>
    ) => Awaitable<CommandResource<{ args: typeof _args }>>
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })

  test('with extensions', () => {
    type Actual = CommandResourceFetcher<{ extensions: typeof _extensions }>
    type Expected = (
      ctx: Readonly<CommandContext<{ extensions: typeof _extensions }>>
    ) => Awaitable<CommandResource<{ extensions: typeof _extensions }>>
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })
})

describe('I18nCommand', () => {
  test('default', () => {
    type Actual = Prettify<I18nCommand>
    type Expected = Prettify<Command & { resource?: CommandResourceFetcher }>
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })

  test('with args', () => {
    type Actual = Prettify<I18nCommand<{ args: typeof _args }>>
    type Expected = Prettify<
      Command<{ args: typeof _args }> & {
        resource?: CommandResourceFetcher<{ args: typeof _args }>
      }
    >
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })

  test('with extensions', () => {
    type Actual = Prettify<I18nCommand<{ extensions: typeof _extensions }>>
    type Expected = Prettify<
      Command<{ extensions: typeof _extensions }> & {
        resource?: CommandResourceFetcher<{ extensions: typeof _extensions }>
      }
    >
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })

  test('with args and extensions', () => {
    type Actual = Prettify<I18nCommand<{ args: typeof _args; extensions: typeof _extensions }>>
    type Expected = Prettify<
      Command<{ args: typeof _args; extensions: typeof _extensions }> & {
        resource?: CommandResourceFetcher<{ args: typeof _args; extensions: typeof _extensions }>
      }
    >
    expectTypeOf<Actual>().toEqualTypeOf<Expected>()
  })
})
