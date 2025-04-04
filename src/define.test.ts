import { expectTypeOf, test } from 'vitest'
import { cli } from './cli.ts'
import { define } from './define.ts'

// eslint-disable-next-line vitest/expect-expect
test('define', async () => {
  const command = define({
    name: 'test',
    description: 'A test command',
    options: {
      foo: {
        type: 'string',
        description: 'A string option'
      }
    },
    run: ctx => {
      expectTypeOf(ctx.values.foo).toEqualTypeOf<string | undefined>()
    }
  })

  await cli(['test', '--foo', 'bar'], command)
})
