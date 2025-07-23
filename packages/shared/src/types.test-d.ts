import { describe, expect, expectTypeOf, test } from 'vitest'

import type { Args } from 'gunshi'
import type {
  CommandArgKeys,
  CommandBuiltinKeys,
  ResolveTranslationKeys,
  Translation
} from './types.ts'

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
      'arg:foo' | 'arg:bar' | 'arg:no-bar' | CommandBuiltinKeys
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
      'test:arg:foo' | 'test:arg:bar' | 'test:arg:no-bar' | CommandBuiltinKeys
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
      'arg:foo' | 'arg:bar' | 'arg:no-bar' | CommandBuiltinKeys
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
