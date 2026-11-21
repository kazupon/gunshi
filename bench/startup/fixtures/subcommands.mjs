// A CLI with five sub-commands, whose help lists and sorts them
import { cli, define } from 'gunshi'

const args = {
  name: { type: 'string', description: 'The name', default: 'world' },
  loud: { type: 'boolean', description: 'Shout' }
}
const subCommands = {}
for (const name of ['build', 'dev', 'lint', 'test', 'preview']) {
  subCommands[name] = define({
    name,
    description: `Run ${name}`,
    args,
    run: ctx => console.log(`${name} ${ctx.values.name}`)
  })
}
await cli(
  process.argv.slice(2),
  define({ name: 'main', description: 'Main', args, run: () => {} }),
  {
    name: 'tool',
    version: '1.0.0',
    subCommands
  }
)
