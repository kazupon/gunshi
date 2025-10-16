import { define } from 'gunshi'

export default define({
  name: 'list',
  description: 'List all resources',
  args: {
    filter: {
      type: 'string',
      short: 'f',
      description: 'Filter resources'
    }
  },
  run: ctx => {
    const filter = ctx.values.filter || 'all'
    console.log(`Listing resources with filter: ${filter}`)
  }
})
