import { define } from 'gunshi'

export default define({
  name: 'create',
  description: 'Create a new resource',
  args: {
    name: {
      type: 'string',
      short: 'n',
      required: true,
      description: 'Name of the resource'
    },
    type: {
      type: 'string',
      short: 't',
      default: 'default',
      description: 'Type of resource'
    }
  },
  run: ctx => {
    console.log(`Creating ${ctx.values.type} resource: ${ctx.values.name}`)
  }
})
