import { generate as generate019 } from 'gunshi019/generator'
import { bench } from 'vitest'
import { generate } from '../lib/generator.js'
import subCommands from './commands.js'

const options = {
  name: 'vite',
  version: '6.0.0',
  description: 'Vite powered by gunshi',
  usageOptionType: true
}

bench('gunshi v0.19', async () => {
  // const buf =
  await generate019(
    'dev',
    // null,
    {},
    {
      subCommands,
      ...options
    }
  )
})

bench('gunshi latest', async () => {
  // const buf =
  await generate(
    'dev',
    // null,
    {},
    {
      subCommands,
      ...options
    }
  )
})
