import { expectTypeOf, test } from 'vitest'
import type {
  Args,
  Command,
  CommandContext,
  DefaultGunshiParams,
  GunshiParams,
  RenderingOptions
} from './types.ts'

const _args1 = {
  say: {
    type: 'string',
    description: 'say something',
    default: 'hello!'
  }
} satisfies Args

type Extension1 = {
  foo: string
  getFoo(): string
}

interface Extension2 {
  bar: number
  getBar(): number
}

test('GunshiParams', () => {
  // default
  expectTypeOf<GunshiParams>().toEqualTypeOf<{ args: Args; extensions: {} }>()

  // specify args
  expectTypeOf<GunshiParams<{ args: typeof _args1 }>>().toEqualTypeOf<
    GunshiParams<{ args: typeof _args1 }>
  >()

  // specify extensions
  expectTypeOf<GunshiParams<{ extensions: { foo: Extension1 } }>>().toEqualTypeOf<
    GunshiParams<{ extensions: { foo: Extension1 } }>
  >()

  // for interface extensions
  expectTypeOf<GunshiParams<{ extensions: { foo: Extension2 } }>>().toEqualTypeOf<
    GunshiParams<{ extensions: { foo: Extension2 } }>
  >()

  // specify args and extensions
  expectTypeOf<
    GunshiParams<{ args: typeof _args1; extensions: { foo: Extension1 } }>
  >().toEqualTypeOf<GunshiParams<{ args: typeof _args1; extensions: { foo: Extension1 } }>>()
})

test('DefaultGunshiParams', () => {
  expectTypeOf<DefaultGunshiParams>().toEqualTypeOf<GunshiParams>()
  expectTypeOf<DefaultGunshiParams>().not.toEqualTypeOf<{
    args: typeof _args1
    extensions: { foo: Extension1 }
  }>()
})

test('CommandContext extensions', () => {
  // default
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- default is any
  expectTypeOf<CommandContext['extensions']>().toEqualTypeOf<any>()

  // with extensions only
  type t1 = CommandContext<{ extensions: { foo: Extension1 } }>
  expectTypeOf<t1['extensions']>().toEqualTypeOf<{ foo: Extension1 }>()

  // for interface extensions
  type t2 = CommandContext<{ extensions: { foo: Extension2 } }>
  expectTypeOf<t2['extensions']>().toEqualTypeOf<{ foo: Extension2 }>()

  // with args and extensions
  type t3 = CommandContext<{ args: typeof _args1; extensions: { foo: Extension1 } }>
  expectTypeOf<t3['extensions']>().toEqualTypeOf<{ foo: Extension1 }>()
})

test('RenderingOptions', () => {
  // header
  type RenderingOptionsHeader = RenderingOptions['header']
  expectTypeOf<RenderingOptionsHeader>().toMatchTypeOf<
    ((ctx: Readonly<CommandContext>) => Promise<string>) | null | undefined
  >()

  // usage
  type RenderingOptionsUsage = RenderingOptions['usage']
  expectTypeOf<RenderingOptionsUsage>().toMatchTypeOf<
    ((ctx: Readonly<CommandContext>) => Promise<string>) | null | undefined
  >()

  // validationErrors
  type RenderingOptionsValidationErrors = RenderingOptions['validationErrors']
  expectTypeOf<RenderingOptionsValidationErrors>().toMatchTypeOf<
    ((ctx: Readonly<CommandContext>, error: AggregateError) => Promise<string>) | null | undefined
  >()

  // complete RenderingOptions
  const renderingOptions: RenderingOptions = {
    header: null,
    usage: async ctx => `Usage: ${ctx.name}`,
    validationErrors: async (_ctx, error) => `Error: ${error.message}`
  }
  expectTypeOf(renderingOptions).toMatchTypeOf<RenderingOptions>()
})

test('Command with rendering', () => {
  // Command without rendering
  const commandWithoutRendering: Command = {
    name: 'test',
    description: 'Test command'
  }
  expectTypeOf(commandWithoutRendering).toMatchTypeOf<Command>()

  // Command with rendering
  const commandWithRendering: Command = {
    name: 'test',
    description: 'Test command',
    rendering: {
      header: null,
      usage: async ctx => `Usage: ${ctx.name}`,
      validationErrors: null
    }
  }
  expectTypeOf(commandWithRendering).toMatchTypeOf<Command>()
  expectTypeOf(commandWithRendering.rendering).toMatchTypeOf<RenderingOptions | undefined>()

  // Command with partial rendering
  const commandWithPartialRendering: Command = {
    name: 'test',
    description: 'Test command',
    rendering: {
      header: null
    }
  }
  expectTypeOf(commandWithPartialRendering).toMatchTypeOf<Command>()
})
