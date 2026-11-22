// A CLI with one command, the plugins of gunshi built in
import { cli, define } from 'gunshi'

const command = define({
  name: 'greet',
  description: 'Greet someone',
  args: {
    name: { type: 'string', description: 'The name to greet', default: 'world' },
    count: { type: 'number', description: 'How many times', default: 1 },
    loud: { type: 'boolean', description: 'Shout' }
  },
  run: ctx => {
    for (let i = 0; i < ctx.values.count; i++) console.log(`Hello, ${ctx.values.name}!`)
  }
})
await cli(process.argv.slice(2), command, { name: 'greet', version: '1.0.0' })
