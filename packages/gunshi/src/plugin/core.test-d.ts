import { describe, expectTypeOf, test } from 'vitest'
import { plugin } from './core.ts'

import type { Args, CommandContextExtension } from '../types.ts'
import type {
  ExtractDependencyId,
  InferDependencyExtensions,
  IsOptionalDependency,
  OnPluginExtension,
  PluginDependency,
  PluginExtension,
  PluginFunction,
  PluginOptions,
  PluginWithExtension,
  PluginWithoutExtension
} from './core.ts'

describe('ExtractDependencyId', () => {
  test('PluginDependency', () => {
    type T = ExtractDependencyId<PluginDependency>
    expectTypeOf<T>().toEqualTypeOf<string>()
  })

  test('object with id', () => {
    type T = ExtractDependencyId<{ id: 'foo' }>
    expectTypeOf<T>().toEqualTypeOf<'foo'>()
  })

  test('object with id and optional', () => {
    type T = ExtractDependencyId<{ id: 'foo'; optional: true }>
    expectTypeOf<T>().toEqualTypeOf<'foo'>()
  })
})

const loggerPluginId = 'logger' as const
const authPluginId = 'auth' as const
const apiPluginId = 'api' as const
const optionalApiPluginId = 'optional-api' as const

type LoggerExtension = {
  log: (message: string) => void
}

type AuthExtension = {
  userId: string
}

type ApiExtension = {
  request: (path: string) => Promise<string>
}

describe('plugin()', () => {
  test('infers extension return type', () => {
    const logger = plugin({
      id: loggerPluginId,
      name: 'logger',
      extension: (): LoggerExtension => ({
        log: (_message: string) => {}
      })
    })

    expectTypeOf(logger).toMatchTypeOf<PluginWithExtension<LoggerExtension>>()
    expectTypeOf(logger.extension).toEqualTypeOf<CommandContextExtension<LoggerExtension>>()
  })

  test('applies own extension type to setup decorators', () => {
    plugin({
      id: loggerPluginId,
      name: 'logger',
      extension: (): LoggerExtension => ({
        log: (_message: string) => {}
      }),
      setup: ctx => {
        ctx.decorateCommand(baseRunner => {
          return commandCtx => {
            expectTypeOf(commandCtx.extensions[loggerPluginId]).toEqualTypeOf<LoggerExtension>()
            // @ts-expect-error unknown plugin extension should not be available
            commandCtx.extensions.missing
            return baseRunner(commandCtx)
          }
        })
      }
    })
  })

  test('applies dependency extensions to extension factory and setup decorators', () => {
    plugin<
      Record<typeof authPluginId, AuthExtension>,
      typeof apiPluginId,
      readonly [typeof authPluginId],
      ApiExtension
    >({
      id: apiPluginId,
      name: 'api',
      dependencies: [authPluginId] as const,
      extension: ctx => {
        expectTypeOf(ctx.extensions[authPluginId]).toEqualTypeOf<AuthExtension>()

        return {
          request: async (_path: string) => 'ok'
        }
      },
      setup: ctx => {
        ctx.decorateCommand(baseRunner => {
          return commandCtx => {
            expectTypeOf(commandCtx.extensions[authPluginId]).toEqualTypeOf<AuthExtension>()
            expectTypeOf(commandCtx.extensions[apiPluginId]).toEqualTypeOf<ApiExtension>()
            return baseRunner(commandCtx)
          }
        })
      }
    })
  })

  test('marks optional dependency extensions as possibly undefined', () => {
    plugin<
      Record<typeof authPluginId, AuthExtension>,
      typeof optionalApiPluginId,
      readonly [{ readonly id: typeof authPluginId; readonly optional: true }],
      ApiExtension
    >({
      id: optionalApiPluginId,
      name: 'optional api',
      dependencies: [{ id: authPluginId, optional: true }] as const,
      extension: ctx => {
        expectTypeOf(ctx.extensions[authPluginId]).toEqualTypeOf<AuthExtension | undefined>()

        return {
          request: async (_path: string) => 'ok'
        }
      },
      setup: ctx => {
        ctx.decorateCommand(baseRunner => {
          return commandCtx => {
            expectTypeOf(commandCtx.extensions[authPluginId]).toEqualTypeOf<
              AuthExtension | undefined
            >()
            expectTypeOf(commandCtx.extensions[optionalApiPluginId]).toEqualTypeOf<ApiExtension>()
            return baseRunner(commandCtx)
          }
        })
      }
    })
  })

  test('returns plugin type without extension', () => {
    const meta = plugin({
      id: 'meta',
      name: 'meta',
      setup: () => {}
    })

    expectTypeOf(meta).toMatchTypeOf<PluginWithoutExtension>()
    expectTypeOf(meta.extension).toEqualTypeOf<CommandContextExtension<{}> | undefined>()
  })
})

describe('IsOptionalDependency', () => {
  test('PluginDependency', () => {
    type T = IsOptionalDependency<PluginDependency>
    expectTypeOf<T>().toEqualTypeOf<false>()
  })

  test('object with id', () => {
    type T = IsOptionalDependency<{ id: 'foo' }>
    expectTypeOf<T>().toEqualTypeOf<false>()
  })

  test('object with id and optional', () => {
    type T1 = IsOptionalDependency<{ id: 'foo'; optional: true }>
    expectTypeOf<T1>().toEqualTypeOf<true>()
    type T2 = IsOptionalDependency<{ id: 'foo'; optional: false }>
    expectTypeOf<T2>().toEqualTypeOf<false>()
  })
})

type Ext1 = { foo: number }
type Ext2 = { bar: string }
type Ext3 = { baz: boolean }
type Ext4 = { qux: symbol }

describe('InferDependencyExtensions', () => {
  test('required and optional dependencies', () => {
    type T = InferDependencyExtensions<
      [{ id: 'ext1' }, { id: 'ext2'; optional: true }],
      { ext1: Ext1; ext2: Ext2 }
    >
    expectTypeOf<T>().toEqualTypeOf<
      {
        ext1: Ext1
      } & {
        ext2: Ext2 | undefined
      }
    >()
  })

  test('un available dependencies', () => {
    type T = InferDependencyExtensions<
      [{ id: 'ext1'; optional: true }, { id: 'ext2' }],
      { ext3: Ext3; ext4: Ext4 }
    >
    expectTypeOf<T>().toMatchObjectType<{}>()
  })

  test('empty dependencies', () => {
    type T = InferDependencyExtensions<[], { ext1: Ext1; ext2: Ext2 }>
    expectTypeOf<T>().toMatchObjectType<{}>()
  })

  test('mixed dependencies', () => {
    type T = InferDependencyExtensions<
      ['ext1', { id: 'ext2'; optional: false }],
      { ext1: Ext1 } & { ext2: Ext2 }
    >
    expectTypeOf<T>().toEqualTypeOf<
      {
        ext1: Ext1
      } & {
        ext2: Ext2
      }
    >()
  })

  test('long dependencies with mixed types', () => {
    type T = InferDependencyExtensions<
      [{ id: 'ext1'; optional: true }, 'ext2', { id: 'ext3' }, { id: 'ext4'; optional: false }],
      { ext1: Ext1; ext2: Ext2; ext3: Ext3; ext4: Ext4 }
    >
    expectTypeOf<T>().toEqualTypeOf<
      {
        ext1: Ext1 | undefined
      } & {
        ext2: Ext2
      } & {
        ext3: Ext3
      } & {
        ext4: Ext4
      }
    >()
  })
})

describe('PluginOptions', () => {
  test('default type parameters', () => {
    type T = PluginOptions
    expectTypeOf<T['id']>().toEqualTypeOf<string>()
    expectTypeOf<T['name']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<T['dependencies']>().toEqualTypeOf<(PluginDependency | string)[] | undefined>()
    expectTypeOf<T['setup']>().toEqualTypeOf<PluginFunction | undefined>()
    expectTypeOf<T['extension']>().toEqualTypeOf<PluginExtension<{}> | undefined>()
    expectTypeOf<T['onExtension']>().toEqualTypeOf<OnPluginExtension | undefined>()
    // NOTE(kazupon): `toEqualTypeOf` does not work ...
    // expectTypeOf<T>().toEqualTypeOf<{
    //   id: string
    //   name: string | undefined
    //   dependencies: ((PluginDependency | string)[]) | undefined
    //   setup: PluginFunction | undefined
    //   extension: PluginExtension | undefined
    //   onExtension: OnPluginExtension | undefined
    // }>()
  })

  test('type parameters fully', () => {
    type T = PluginOptions<{ ext1: { foo: number } }, 'plugin1', ['ext1'], { bar: string }>
    expectTypeOf<T['id']>().toEqualTypeOf<'plugin1'>()
    expectTypeOf<T['name']>().toEqualTypeOf<string | undefined>()
    expectTypeOf<T['dependencies']>().toEqualTypeOf<['ext1'] | undefined>()
    expectTypeOf<T['setup']>().toEqualTypeOf<
      | PluginFunction<{
          args: Args
          extensions: { ext1: { foo: number } } & { plugin1: { bar: string } }
        }>
      | undefined
    >()
    expectTypeOf<T['extension']>().toEqualTypeOf<
      | PluginExtension<{ bar: string }, { args: Args; extensions: { ext1: { foo: number } } }>
      | undefined
    >()
    expectTypeOf<T['onExtension']>().toEqualTypeOf<
      | OnPluginExtension<{
          args: Args
          extensions: { ext1: { foo: number } } & { plugin1: { bar: string } }
        }>
      | undefined
    >()
  })

  test('required and optional dependencies', () => {
    type T = PluginOptions<
      { ext1: Ext1; ext2: Ext2 },
      'plugin1',
      [{ id: 'ext1' }, { id: 'ext2'; optional: true }],
      { bar: string }
    >
    expectTypeOf<T['dependencies']>().toEqualTypeOf<
      [{ id: 'ext1' }, { id: 'ext2'; optional: true }] | undefined
    >()
    expectTypeOf<T['setup']>().toEqualTypeOf<
      | PluginFunction<{
          args: Args
          extensions: { ext1: Ext1 } & { ext2: Ext2 | undefined } & { plugin1: { bar: string } }
        }>
      | undefined
    >()
    expectTypeOf<T['extension']>().toEqualTypeOf<
      | PluginExtension<
          { bar: string },
          { args: Args; extensions: { ext1: Ext1 } & { ext2: Ext2 | undefined } }
        >
      | undefined
    >()
    expectTypeOf<T['onExtension']>().toEqualTypeOf<
      | OnPluginExtension<{
          args: Args
          extensions: { ext1: Ext1 } & { ext2: Ext2 | undefined } & { plugin1: { bar: string } }
        }>
      | undefined
    >()
  })

  test('unmatch required and optional dependencies', () => {
    type T = PluginOptions<
      { ext1: Ext1; ext2: Ext2 },
      'plugin1',
      [{ id: 'ext3' }, { id: 'ext3'; optional: true }],
      { bar: string }
    >
    expectTypeOf<T['dependencies']>().toEqualTypeOf<
      [{ id: 'ext3' }, { id: 'ext3'; optional: true }] | undefined
    >()
    expectTypeOf<T['setup']>().toEqualTypeOf<
      | PluginFunction<{
          args: Args
          extensions: { plugin1: { bar: string } }
        }>
      | undefined
    >()
    expectTypeOf<T['extension']>().toEqualTypeOf<
      PluginExtension<{ bar: string }, { args: Args; extensions: {} }> | undefined
    >()
    expectTypeOf<T['onExtension']>().toEqualTypeOf<
      | OnPluginExtension<{
          args: Args
          extensions: { plugin1: { bar: string } }
        }>
      | undefined
    >()
  })

  test('no dependencies', () => {
    type T = PluginOptions<{ ext1: Ext1; ext2: Ext2 }, 'plugin1', [], { bar: string }>
    expectTypeOf<T['dependencies']>().toEqualTypeOf<[] | undefined>()
    expectTypeOf<T['setup']>().toEqualTypeOf<
      | PluginFunction<{
          args: Args
          extensions: { plugin1: { bar: string } }
        }>
      | undefined
    >()
    expectTypeOf<T['extension']>().toEqualTypeOf<
      PluginExtension<{ bar: string }, { args: Args; extensions: {} }> | undefined
    >()
    expectTypeOf<T['onExtension']>().toEqualTypeOf<
      | OnPluginExtension<{
          args: Args
          extensions: { plugin1: { bar: string } }
        }>
      | undefined
    >()
  })
})
