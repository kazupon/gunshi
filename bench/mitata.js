import { generate as generate019 } from 'gunshi019/generator'
import { barplot, bench, run } from 'mitata'
import { generate } from '../packages/gunshi/lib/generator.js'
import subCommands from './commands.js'

barplot(() => {
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
})

await run()
