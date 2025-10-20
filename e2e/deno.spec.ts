import path from 'node:path'
import { expect, test } from 'vitest'
import { runCommand } from '../scripts/utils.ts'

test('deno', async () => {
  const output = await runCommand('deno cli.ts', {
    cwd: path.resolve(import.meta.dirname, '../playground/deno')
  })
  expect(output).include(`Hello, Gunshi with Deno!`)
})
