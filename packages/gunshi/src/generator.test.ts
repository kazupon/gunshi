import { expect, test } from 'vitest'
import register from '../test/fixtures/register.ts'
import show from '../test/fixtures/show.ts'
import { generate } from './generator.ts'

const meta = {
  name: 'generator',
  description: 'This is a generator',
  version: '1.0.0'
}

test('single', async () => {
  const result = await generate(null, show, { ...meta })
  expect(result).toMatchSnapshot()
})

test('subcomments', async () => {
  const subCommands = new Map()
  subCommands.set('register', register)

  // can find subcommand
  const result1 = await generate('show', show, { subCommands, ...meta })
  expect(result1).toMatchSnapshot()

  // cannot find subcommand
  await expect(async () => {
    await generate('create', show, { subCommands, ...meta })
  }).rejects.toThrowError()
})
