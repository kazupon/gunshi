import { cli } from 'gunshi'

const command = {
  name: 'greeter',
  description: 'A simple greeting CLI',
  args: {
    name: {
      type: 'string',
      short: 'n',
      description: 'Name to greet'
    },
    uppercase: {
      type: 'boolean',
      short: 'u',
      description: 'Convert greeting to uppercase'
    }
  },
  run: ctx => {
    const { name = 'World', uppercase } = ctx.values
    let greeting = `Hello, ${name}!`

    if (uppercase) {
      greeting = greeting.toUpperCase()
    }

    console.log(greeting)
  }
}

await cli(process.argv.slice(2), command)
