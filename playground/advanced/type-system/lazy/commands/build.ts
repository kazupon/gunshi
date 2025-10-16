import { lazy } from 'gunshi'

// Pre-defined arguments
export const buildArgs = {
  target: { type: 'enum', required: true, choices: ['dev', 'prod'] },
  minify: { type: 'boolean', default: false }
} as const

// Create the lazy command with explicit typing
export const buildCommand = lazy<{ args: typeof buildArgs }>(
  async () => {
    // Heavy dependencies can be loaded here when needed
    const { bundle } = await import('./utils.ts')

    return async ctx => {
      // Inference of args values
      const { target, minify } = ctx.values
      // Implementation
      return bundle({ target, minify })
    }
  },
  {
    name: 'build',
    args: buildArgs
  }
)
