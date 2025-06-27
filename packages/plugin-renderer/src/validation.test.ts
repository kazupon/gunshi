import { createCommandContext } from 'gunshi/context'
import { expect, test } from 'vitest'
import { renderValidationErrors } from './validation.ts'

test('basic', async () => {
  const ctx = await createCommandContext({
    args: {},
    values: {},
    positionals: [],
    rest: [],
    argv: [],
    tokens: [], // dummy, due to test
    omitted: false,
    callMode: 'entry',
    command: {},
    cliOptions: {
      cwd: '/path/to/cmd1',
      version: '0.0.0',
      name: 'cmd1'
    }
  })
  // eslint-disable-next-line unicorn/error-message
  const error = new AggregateError([
    new Error(`Optional argument '--dependency' or '-d' is required`),
    new Error(`Optional argument '--alias' or '-a' is required`)
  ])

  await expect(renderValidationErrors(ctx, error)).resolves.toEqual(
    [
      `Optional argument '--dependency' or '-d' is required`,
      `Optional argument '--alias' or '-a' is required`
    ].join('\n')
  )
})
