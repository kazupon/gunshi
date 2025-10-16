import { lazyWithTypes } from 'gunshi'
import type { LoggerExtension } from '../plugin.ts'

export const buildArgs = {
  target: { type: 'enum', required: true, choices: ['dev', 'prod'] },
  minify: { type: 'boolean', default: false }
} as const

// Define extensions for the command
type BuildExtensions = {
  logger: LoggerExtension
}

// Use lazyWithTypes with extensions - args are automatically inferred
export const buildCommand = lazyWithTypes<{
  args: typeof buildArgs
  extensions: BuildExtensions
}>()(
  async () => {
    // Heavy dependencies can be loaded here when needed
    return async ctx => {
      // ctx.values is automatically inferred from args definition below
      const { target, minify } = ctx.values

      // Use typed extensions
      ctx.extensions.logger?.log(`Building for ${target}...`)

      if (minify) {
        ctx.extensions.logger?.log('Minification enabled')
      }
    }
  },
  {
    name: 'build',
    description: 'Build the project',
    args: buildArgs
  }
)
