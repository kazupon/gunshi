// A CLI of @gunshi/bone, the distribution without the plugins
import { cli } from '@gunshi/bone'

await cli(process.argv.slice(2), {
  name: 'greet',
  args: { name: { type: 'string', default: 'world' } },
  run: ctx => console.log(`Hello, ${ctx.values.name}!`)
})
