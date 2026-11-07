import { cli, CommandError, define, jsonArgs } from 'gunshi'

const PROJECTS = [
  { name: 'acme-web', url: 'https://acme-web.example.com' },
  { name: 'acme-api', url: 'https://acme-api.example.com' }
]

// `list` spreads `jsonArgs` into its arguments, to support `--json`
const list = define({
  name: 'list',
  description: 'List the projects',
  args: {
    ...jsonArgs,
    limit: { type: 'number', default: 10, description: 'How many projects to list' }
  },
  run: ctx => {
    const projects = PROJECTS.slice(0, ctx.values.limit)

    // The human output, printed only without `--json`
    for (const project of projects) {
      ctx.log(`${project.name}\t${project.url}`)
    }

    // The result, printed as one JSON document with `--json`: an object keyed by a noun
    return { projects }
  }
})

const show = define({
  name: 'show',
  description: 'Show a project',
  args: {
    ...jsonArgs,
    name: { type: 'positional', description: 'Name of the project' }
  },
  run: ctx => {
    const project = PROJECTS.find(project => project.name === ctx.values.name)
    if (!project) {
      // With `--json`, gunshi prints the error as one line of JSON to stderr, with the code as the reason
      throw new CommandError(`Project ${ctx.values.name} not found`, { code: 'not_found' })
    }

    ctx.log(`${project.name}\t${project.url}`)
    return { project }
  }
})

await cli(process.argv.slice(2), list, {
  name: 'projects',
  version: '1.0.0',
  description: 'A CLI that prints its results as JSON with --json',
  subCommands: { list, show }
})
