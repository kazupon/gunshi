import { expect, test } from 'vitest'
import { createCommandContext } from '../../gunshi/src/context.ts'
import { renderValidationErrors } from './validation.ts'

test('basic', async () => {
  const ctx = await createCommandContext({
    cliOptions: {
      cwd: '/path/to/cmd1',
      version: '0.0.0',
      name: 'cmd1'
    }
  })
  // eslint-disable-next-line unicorn/error-message -- NOTE(kazupon): This is a test
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
