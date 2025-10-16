import { plugin } from 'gunshi/plugin'

export default plugin({
  id: 'custom-b',
  setup(ctx) {
    ctx.decorateUsageRenderer(async (baseRenderer, ctx) => {
      const usage = await baseRenderer(ctx) // Call next decorator first
      console.log('[custom-b] Decorating usage')
      return `${usage}\n🎨 Styled by Plugin B`
    })
  }
})
