import { plugin } from 'gunshi/plugin'

export default plugin({
  id: 'custom-a',
  setup(ctx) {
    ctx.decorateUsageRenderer(async (baseRenderer, ctx) => {
      const usage = await baseRenderer(ctx) // Call next decorator first
      console.log('[custom-a] Decorating usage')
      return `${usage}\n📦 Enhanced by Plugin A`
    })
  }
})
