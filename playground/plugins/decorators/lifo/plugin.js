import { plugin } from 'gunshi/plugin'

// The decorators print with `console.log` to show the order. A real plugin prints with `ctx.log`,
// which gunshi silences when a command prints JSON with `--json`
export default plugin({
  id: 'my-plugin',
  setup(ctx) {
    // Registered first
    ctx.decorateCommand(runner => async ctx => {
      console.log('Decorator A: before')
      const result = await runner(ctx)
      console.log('Decorator A: after')
      return result
    })

    // Registered second
    ctx.decorateCommand(runner => async ctx => {
      console.log('Decorator B: before')
      const result = await runner(ctx)
      console.log('Decorator B: after')
      return result
    })

    // Registered third (executes first!)
    ctx.decorateCommand(runner => async ctx => {
      console.log('Decorator C: before')
      const result = await runner(ctx)
      console.log('Decorator C: after')
      return result
    })
  }
})
