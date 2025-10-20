import path from 'node:path'
import { expect, test } from 'vitest'
import { runCommand } from '../scripts/utils.ts'

test('bun', async () => {
  // install dependencies
  await runCommand('bun install', {
    cwd: path.resolve(import.meta.dirname, '../playground/bun')
  })
  const output = await runCommand('bun cli.ts', {
    cwd: path.resolve(import.meta.dirname, '../playground/bun')
  })
  expect(output).include(`Hello, Gunshi with Bun!`)
})
