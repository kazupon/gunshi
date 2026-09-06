import { generate as generate019 } from 'gunshi019/generator'
import { test } from 'vitest'
import { generate } from '../packages/gunshi/lib/generator.js'
import subCommands from './commands.js'

const options = {
  name: 'vite',
  version: '6.0.0',
  description: 'Vite powered by gunshi',
  usageOptionType: true
}

test('renderer generate', async ({ bench }) => {
  await bench.compare(
    bench('gunshi v0.19', async () => {
      await generate019(
        'dev',
        {},
        {
          subCommands,
          ...options
        }
      )
    }),
    bench('gunshi latest', async () => {
      await generate(
        'dev',
        {},
        {
          subCommands,
          ...options
        }
      )
    })
  )
})
