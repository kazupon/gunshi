// A CLI with the i18n plugin, its built-in resources and the completion plugin
import { cli, define } from 'gunshi'
import completion from '@gunshi/plugin-completion'
import i18n from '@gunshi/plugin-i18n'
import resources from '@gunshi/resources'

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
await cli(process.argv.slice(2), command, {
  name: 'greet',
  version: '1.0.0',
  plugins: [i18n({ locale: 'en-US', builtinResources: resources }), completion()]
})
