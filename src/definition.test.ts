import { expect, expectTypeOf, test, vi } from 'vitest'
import { cli } from './cli.ts'
import { define, lazy } from './definition.ts'

// eslint-disable-next-line vitest/expect-expect
test('define', async () => {
  const command = define({
    name: 'test',
    description: 'A test command',
    args: {
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

test('lazy', async () => {
  const subCommands = new Map()
  const test = define({
    name: 'test',
    description: 'A test command',
    toKebab: true,
    args: {
      foo: {
        type: 'string',
        description: 'A string option'
      }
    }
  })

  const mock = vi.fn()
  const testLazy = lazy(() => {
    return Promise.resolve(mock)
  }, test)
  subCommands.set('test', testLazy)

  expect(testLazy).toBeInstanceOf(Function)
  expect(testLazy.commandName).toBe(test.name)
  expect(testLazy.description).toBe(test.description)
  expect(testLazy.args).toEqual(test.args)
  expect(testLazy.toKebab).toBe(test.toKebab)

  await cli(
    ['test', '--foo', 'bar'],
    {
      run: _ctx => {}
    },
    { subCommands }
  )

  expect(mock).toHaveBeenCalled()
})
