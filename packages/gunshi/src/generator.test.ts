import { describe, expect, test, vi } from 'vitest'
import register from '../test/fixtures/register.ts'
import show from '../test/fixtures/show.ts'
import { define } from './definition.ts'
import { generate } from './generator.ts'
import { plugin } from './plugin/core.ts'

import type { GenerateOptions } from './generator.ts'
import type { ArgSchema, Args, CommandRunner } from './types.ts'

const meta = {
  name: 'generator',
  description: 'This is a generator',
  version: '1.0.0'
}

test('single', async () => {
  const result = await generate(null, show, { ...meta })

  expect(result).toMatchSnapshot()
})

test('subcomments', async () => {
  const subCommands = new Map()
  subCommands.set('register', register)

  // can find subcommand
  const result1 = await generate('show', show, { subCommands, ...meta })
  expect(result1).toMatchSnapshot()

  // cannot find subcommand
  await expect(async () => {
    await generate('create', show, { subCommands, ...meta })
  }).rejects.toThrowError(/create/)
})

test('#768 includes the entry when a plugin adds commands', async () => {
  const entryRun = vi.fn<CommandRunner>()
  const cleanRun = vi.fn<CommandRunner>()
  const entry = define({
    name: 'build',
    description: 'Build the project',
    args: { target: { type: 'positional', description: 'Build target' } },
    run: entryRun
  })
  const clean = define({ name: 'clean', description: 'Clean artifacts', run: cleanRun })
  const tools = plugin({
    id: 'issue-768-generator',
    setup: ctx => ctx.addCommand('clean', clean)
  })

  const usage = await generate(null, entry, {
    name: 'mycli',
    plugins: [tools]
  })

  expect(usage).toContain('  [build] <target>')
  expect(usage).toContain('  clean')
  expect(entryRun).not.toHaveBeenCalled()
  expect(cleanRun).not.toHaveBeenCalled()
})

describe('a command that declares an argument of its own', () => {
  const entry = define({ name: 'main', description: 'Entry', run: () => {} })

  function createCli(args: Args) {
    const run = vi.fn<CommandRunner>()
    const docs = define({ name: 'docs', description: 'Docs command', args, run })
    return {
      run,
      generate: (options: GenerateOptions = {}) =>
        generate('docs', entry, {
          name: 'my-cli',
          version: '9.9.9',
          subCommands: { docs },
          ...options
        })
    }
  }

  const declaredHelp: [string, ArgSchema][] = [
    ['a boolean with a short name', { type: 'boolean', short: 'h', description: 'Show help' }],
    ['a boolean', { type: 'boolean', description: 'Show help' }],
    ['a value', { type: 'string', description: 'Help topic' }]
  ]

  test.each(declaredHelp)('named `help` still gets a usage (%s)', async (_, schema) => {
    // the usage is asked for by the generator, not by an argument that the command can own (#729)
    const cli = createCli({ help: schema })

    const usage = await cli.generate()

    expect(usage).toContain('USAGE:')
    expect(usage).toContain('my-cli docs')
    expect(cli.run).not.toHaveBeenCalled()
  })

  test('the usage of a command that owns `help` describes its own argument', async () => {
    const cli = createCli({ help: { type: 'string', description: 'Help topic' } })

    const usage = await cli.generate()

    expect(usage).toContain('--help <help>          Help topic')
    expect(usage).not.toContain('Display this help message')
    expect(usage).toContain('-v, --version')
  })

  test('a schema identical to the global one keeps the built-in description', async () => {
    const cli = createCli({
      help: { type: 'boolean', short: 'h', description: 'Display this help message' }
    })

    const usage = await cli.generate()

    expect(usage).toContain('-h, --help             Display this help message')
    expect(cli.run).not.toHaveBeenCalled()
  })

  test('named `version` gets a usage too, not the version', async () => {
    const cli = createCli({ version: { type: 'string', description: 'Version to release' } })

    const usage = await cli.generate()

    expect(usage).toContain('USAGE:')
    expect(usage).toContain('--version <version>')
    expect(cli.run).not.toHaveBeenCalled()
  })

  test('the header is part of the usage, and `renderHeader: null` leaves it out', async () => {
    const cli = createCli({ help: { type: 'boolean', description: 'Show help' } })

    expect(await cli.generate()).toMatch(/^my-cli \(my-cli v9\.9\.9\)/)
    expect(await cli.generate({ renderHeader: null })).toMatch(/^Docs command/)
  })

  test('`strict` does not turn the usage into an unknown option error', async () => {
    // nothing is added to the arguments to ask for the usage, so there is nothing for `strict` to
    // report: a `-h` that the command does not declare would be an unknown option
    const cli = createCli({ help: { type: 'string', description: 'Help topic' } })

    const usage = await cli.generate({ strict: true })

    expect(usage).toContain('USAGE:')
    expect(cli.run).not.toHaveBeenCalled()
  })

  test('the lifecycle hooks are called, as they are today', async () => {
    // NOTE(kazupon): pinned as it is, because rendering a usage still goes through the command
    // execution of the core, and only the runner of the command is left out of it
    const calls: string[] = []
    const cli = createCli({ help: { type: 'boolean', description: 'Show help' } })

    await cli.generate({
      onBeforeCommand: () => {
        calls.push('before')
      },
      onAfterCommand: () => {
        calls.push('after')
      }
    })

    expect(calls).toEqual(['before', 'after'])
    expect(cli.run).not.toHaveBeenCalled()
  })
})
