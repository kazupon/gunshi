import { cli, define, lazy } from 'gunshi'

import type { CommandRunner } from 'gunshi'

// Command metadata stays in the main bundle
const buildDefinition = define({
  name: 'build',
  description: 'Build the project',
  args: {
    watch: {
      type: 'boolean',
      short: 'w',
      description: 'Watch for changes'
    },
    minify: {
      type: 'boolean',
      short: 'm',
      description: 'Minify output'
    }
  }
})

// Loader uses dynamic import to load the command from a separate file
const buildLoader = async (): Promise<CommandRunner> => {
  // This creates a separate chunk in your bundle
  const { run } = await import('./commands/build.ts')
  return run
}

const lazyBuild = lazy(buildLoader, buildDefinition)

// Add more commands following the same pattern
const deployDefinition = define({
  name: 'deploy',
  description: 'Deploy to production',
  args: {
    environment: {
      type: 'string',
      short: 'e',
      default: 'production'
    }
  }
})

const deployLoader = async (): Promise<CommandRunner> => {
  const { run } = await import('./commands/deploy.ts')
  return run
}

const lazyDeploy = lazy(deployLoader, deployDefinition)

// Register all lazy commands
const subCommands = {
  [lazyBuild.commandName]: lazyBuild,
  [lazyDeploy.commandName]: lazyDeploy
}

await cli(
  process.argv.slice(2),
  {
    description: 'Development tools CLI',
    run: () => console.log('Use --help to see available commands')
  },
  {
    name: 'dev-tools',
    version: '2.0.0',
    subCommands
  }
)
