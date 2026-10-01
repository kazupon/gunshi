import { describe, expect, expectTypeOf, test } from 'vitest'

import type { Args, ArgsValidationErrorCode } from 'gunshi'
import type {
  ArgErrorHintResourceKeys,
  ArgErrorResourceKeys,
  BuiltinResourceKeys,
  CommandArgKeys,
  CommandBuiltinKeys,
  ErrorResourceKeys,
  ResolveTranslationKeys,
  Translation
} from './types.ts'

test('ArgErrorResourceKeys has a key for every args validation error code', () => {
  // args-tokens adds a code in a minor release (four of them from 0.29.0 to 1.0.0),
  // and nothing else tells that `ARG_ERROR_RESOURCE_KEYS` has fallen behind
  expectTypeOf<ArgErrorResourceKeys>().toEqualTypeOf<ArgsValidationErrorCode>()
})

test('the hint of a missing value is a built-in resource key, not an error code', () => {
  expectTypeOf<ArgErrorHintResourceKeys>().toEqualTypeOf<'err:arg:missing-value:hint'>()
  expectTypeOf<
    Extract<BuiltinResourceKeys, ArgErrorHintResourceKeys>
  >().toEqualTypeOf<'err:arg:missing-value:hint'>()
  expectTypeOf<Extract<ArgsValidationErrorCode, ArgErrorHintResourceKeys>>().toEqualTypeOf<never>()
})

test('CommandArgKeys', () => {
  const _args = {
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
  } satisfies Args

  expectTypeOf<CommandArgKeys<typeof _args>>().toEqualTypeOf<'arg:foo' | 'arg:bar' | 'arg:no-bar'>()

  const _ctx = {
    name: 'test'
  } as const satisfies { name: string }

  expectTypeOf<CommandArgKeys<typeof _args, typeof _ctx>>().toEqualTypeOf<
    'test:arg:foo' | 'test:arg:bar' | 'test:arg:no-bar'
  >()
})

describe('ResolveTranslationKeys', () => {
  test('with Args', () => {
    const _args = {
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
    } satisfies Args

    expectTypeOf<ResolveTranslationKeys<typeof _args>>().toEqualTypeOf<
      'arg:foo' | 'arg:bar' | 'arg:no-bar' | ErrorResourceKeys | CommandBuiltinKeys
    >()
  })

  test('with Args and CommandContext, which has name', () => {
    const _args = {
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
    } satisfies Args

    const _ctx = {
      name: 'test'
    } as const

    expectTypeOf<ResolveTranslationKeys<typeof _args, typeof _ctx>>().toEqualTypeOf<
      'test:arg:foo' | 'test:arg:bar' | 'test:arg:no-bar' | ErrorResourceKeys | CommandBuiltinKeys
    >()
  })

  test('with Args and CommandContext, which has no name', () => {
    const _args = {
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
    } satisfies Args

    const _ctx = {} as const

    expectTypeOf<ResolveTranslationKeys<typeof _args, typeof _ctx>>().toEqualTypeOf<
      'arg:foo' | 'arg:bar' | 'arg:no-bar' | ErrorResourceKeys | CommandBuiltinKeys
    >()
  })

  test('with Args, CommandContext, and custom resources', () => {
    const _args = {
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
    } satisfies Args

    const _ctx = {
      name: 'test'
    } as const

    const _resources = {
      customResource: 'Custom Resource'
    } as const

    expectTypeOf<
      ResolveTranslationKeys<typeof _args, typeof _ctx, typeof _resources>
    >().toEqualTypeOf<
      | 'test:arg:foo'
      | 'test:arg:bar'
      | 'test:arg:no-bar'
      | ErrorResourceKeys
      | CommandBuiltinKeys
      | 'test:customResource'
    >()
  })
})

describe('Translation', () => {
  test('command context has name', () => {
    const _args = {
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
    } satisfies Args

    const _ctx = {
      name: 'test'
    } as const

    const t = (key => key) as Translation<typeof _args, typeof _ctx, { dest: string }>
    expect(t('test:arg:bar')).toBe('test:arg:bar')
    expect(t('test:dest')).toBe('test:dest')
  })

  test('command context has no name', () => {
    const _args = {
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
    } satisfies Args

    const _ctx = {} as const

    const t = (key => key) as Translation<typeof _args, typeof _ctx, { dest: string }>
    expect(t('arg:bar')).toBe('arg:bar')
    expect(t('dest')).toBe('dest')
  })
})
