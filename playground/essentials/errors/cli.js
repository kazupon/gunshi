import { readFile } from 'node:fs/promises'
import { cli, CommandError, define } from 'gunshi'

// The projects that the command knows, unless `--file` gives others
const PROJECTS = {
  acme: 'The website of Acme'
}

/**
 * Read the projects from a JSON file.
 *
 * @param {string} file - The path of the file
 * @returns {Promise<Record<string, string>>} The descriptions of the projects, keyed by their names
 */
async function readProjects(file) {
  try {
    return JSON.parse(await readFile(file, 'utf8'))
  } catch (error) {
    // The error of `readFile` is the cause: gunshi prints its message on a `Caused by:` line
    throw new CommandError(`Could not read the projects from ${file}`, { cause: error })
  }
}

const command = define({
  name: 'show',
  description: 'Show the description of a project',

  args: {
    project: {
      type: 'positional',
      description: 'Name of the project'
    },
    file: {
      type: 'string',
      short: 'f',
      description: 'JSON file to read the projects from'
    }
  },

  examples: `
# Show a project
$ node cli.js acme

# Read the projects from a file
$ node cli.js acme --file projects.json
`,

  run: async ctx => {
    const { project, file } = ctx.values
    const projects = file ? await readProjects(file) : PROJECTS

    if (!Object.hasOwn(projects, project)) {
      // An expected failure: gunshi prints the message to stderr without a stack trace,
      // and the process ends with the exit code of the error
      throw new CommandError(`Project ${project} not found`, { code: 'not_found', exitCode: 2 })
    }

    console.log(projects[project])
  }
})

await cli(process.argv.slice(2), command, {
  name: 'projects',
  version: '1.0.0',
  description: 'A CLI that reports the failures it expects'
})
