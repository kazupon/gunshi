import { plugin } from 'gunshi/plugin'

export default plugin({
  id: 'branding',
  name: 'Branding Plugin',

  setup: ctx => {
    // Decorate the header renderer
    ctx.decorateHeaderRenderer(async (baseRenderer, ctx) => {
      const baseHeader = await baseRenderer(ctx)
      return `
╔══════════════════════════════╗
║     My Awesome CLI v1.0      ║
╚══════════════════════════════╝

${baseHeader}
      `.trim()
    })

    // Decorate the usage renderer
    ctx.decorateUsageRenderer(async (baseRenderer, ctx) => {
      const baseUsage = await baseRenderer(ctx)
      return `${baseUsage}

📚 Documentation: https://example.com/docs
🐛 Report bugs: https://example.com/issues`
    })
  }
})
