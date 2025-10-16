import { plugin } from 'gunshi/plugin'

export default plugin({
  id: 'custom-renderer',
  setup(ctx) {
    // Add branding to header
    ctx.decorateHeaderRenderer(async (baseRenderer, ctx) => {
      const header = await baseRenderer(ctx)
      return `🚀 My CLI v${ctx.env.version}\n${header}`
    })

    // Append timestamp to usage
    ctx.decorateUsageRenderer(async (baseRenderer, ctx) => {
      const usage = await baseRenderer(ctx)
      return `${usage}\n\nGenerated: ${new Date().toISOString()}`
    })

    // Format validation errors with emoji
    ctx.decorateValidationErrorsRenderer(async (baseRenderer, ctx, error) => {
      const errors = await baseRenderer(ctx, error)
      return `❌ Validation Error:\n${errors}`
    })
  }
})
