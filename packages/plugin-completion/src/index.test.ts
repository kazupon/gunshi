import jaJPResource from '@gunshi/resources/ja-JP' with { type: 'json' }
import i18n from '@gunshi/plugin-i18n'
import { cli, define, plugin } from 'gunshi'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vite-plus/test'
import completion from './index.ts'

type Env = Record<string, string>

// runs an example in this process, as `<example> complete -- ...args` would, and returns what it
// prints to stdout. The modules are loaded again for each run, like in a new process.
async function runExample(load: () => Promise<unknown>, args: string[], env: Env): Promise<string> {
  const argv = process.argv
  const lines: string[] = []
  const log = vi.spyOn(console, 'log').mockImplementation((...values: unknown[]) => {
    lines.push(values.map(value => String(value)).join(' '))
  })
  for (const [name, value] of Object.entries(env)) {
    vi.stubEnv(name, value)
  }
  process.argv = ['node', 'example', 'complete', '--', ...args]
  vi.resetModules()

  let exitCode: typeof process.exitCode
  try {
    await load()
  } finally {
    exitCode = process.exitCode
    process.exitCode = undefined
    process.argv = argv
    vi.unstubAllEnvs()
    log.mockRestore()
  }

  // a process that fails has no output to compare
  expect(exitCode ?? 0).toBe(0)
  return lines.map(line => `${line}\n`).join('')
}

function defineRunner(load: () => Promise<unknown>, defaultEnv: Env = {}) {
  return (args: string[] = [], env: Env = {}) => runExample(load, args, { ...defaultEnv, ...env })
}

const JA_JP = { MY_LOCALE: 'ja-JP' }

const runBasic = defineRunner(() => import('../examples/basic.node.ts'))
const runNoSubCommands = defineRunner(() => import('../examples/no-subcommands.node.ts'))
const runNested = defineRunner(() => import('../examples/nested.node.ts'))
const runEntrySubCommands = defineRunner(() => import('../examples/entry-subcommands.node.ts'))
const runNestedI18n = defineRunner(() => import('../examples/nested-i18n.node.ts'), JA_JP)
const runI18n = defineRunner(() => import('../examples/i18n.node.ts'), JA_JP)

test('no input', async () => {
  const output = await runBasic()
  expect(output).toMatchSnapshot()
})

describe('default command', () => {
  test('suggest for inputting', async () => {
    const output = await runBasic(['--'])
    expect(output).toMatchSnapshot()
  })

  test('suggest for long option', async () => {
    const output = await runBasic(['--config'])
    expect(output).toMatchSnapshot()
  })

  test('suggest duplicate options', async () => {
    const output = await runBasic(['--config', 'vite.config.js', '--'])
    expect(output).toMatchSnapshot()
  })

  test('suggest value if option values correctly', async () => {
    const output = await runBasic(['--config', 'vite.config'])
    expect(output).toMatchSnapshot()
  })

  test('suggest for short option', async () => {
    const output = await runBasic(['-c'])
    expect(output).toMatchSnapshot()
  })

  test('suggest duplicate options for short option', async () => {
    const output = await runBasic(['-c', 'vite.config.js', '--'])
    expect(output).toMatchSnapshot()
  })
})

describe('subcommand', () => {
  test('suggest for command only', async () => {
    const output = await runBasic(['dev'])
    expect(output).toMatchSnapshot()
  })

  test('suggest for option inputting', async () => {
    const output = await runBasic(['dev', '--'])
    expect(output).toMatchSnapshot()
  })

  test('suggest for long option', async () => {
    const output = await runBasic(['dev', '--port'])
    expect(output).toMatchSnapshot()
  })

  test('suggest for short option', async () => {
    const output = await runBasic(['dev', '-H'])
    expect(output).toMatchSnapshot()
  })

  test('not handle if unknown option', async () => {
    const output = await runBasic(['dev', '--unknown'])
    expect(output).toMatchSnapshot()
  })

  test('resolve value if long option and value', async () => {
    const output = await runBasic(['dev', '--port=3'])
    expect(output).toMatchSnapshot()
  })

  test('suggest if user ends with space after `--port`', async () => {
    const output = await runBasic(['dev', '--port', ''])
    expect(output).toMatchSnapshot()
  })

  test(`keep suggesting the --port option if user typed partial but didn't end with space`, async () => {
    const output = await runBasic(['dev', '--po'])
    expect(output).toMatchSnapshot()
  })

  test("user typed `--port=` and hasn't typed a space or value yet", async () => {
    const output = await runBasic(['dev', '--port='])
    expect(output).toMatchSnapshot()
  })

  test('suggest short option with equals sign', async () => {
    const output = await runBasic(['dev', '-p=3'])
    expect(output).toMatchSnapshot()
  })
})

describe('positional arguments', () => {
  test('suggest positional arguments when ending with space', async () => {
    const output = await runBasic(['lint', ''])
    expect(output).toMatchSnapshot()
  })

  test('positional arguments when ending with part of the value', async () => {
    const output = await runBasic(['lint', 'ind'])
    expect(output).toMatchSnapshot()
  })

  test('multiple positional argument when ending with space', async () => {
    const output = await runBasic(['lint', 'main.ts', ''], { G_COMPLETION_TEST_MULTIPLE: '1' })
    expect(output).toMatchSnapshot()
  })
})

describe('no sub-commands', () => {
  test('no input', async () => {
    const output = await runNoSubCommands()
    expect(output).toMatchSnapshot()
  })

  test('suggest for inputting', async () => {
    const output = await runNoSubCommands(['--'])
    expect(output).toMatchSnapshot()
  })

  test('suggest for long option', async () => {
    const output = await runNoSubCommands(['--config'])
    expect(output).toMatchSnapshot()
  })

  test('suggest for short option', async () => {
    const output = await runNoSubCommands(['-c'])
    expect(output).toMatchSnapshot()
  })

  test('suggest value if option values correctly', async () => {
    const output = await runNoSubCommands(['--config', 'prod'])
    expect(output).toMatchSnapshot()
  })
})

describe('nested sub-commands', () => {
  test('suggest top-level commands', async () => {
    const output = await runNested()
    expect(output).toMatchSnapshot()
  })

  test('suggest nested sub-commands for remote', async () => {
    const output = await runNested(['remote'])
    expect(output).toMatchSnapshot()
  })

  test('suggest options for nested remote add', async () => {
    const output = await runNested(['remote', 'add', '--'])
    expect(output).toMatchSnapshot()
  })

  test('suggest option value for remote add --url', async () => {
    const output = await runNested(['remote', 'add', '--url'])
    expect(output).toMatchSnapshot()
  })

  test('suggest positional for remote remove', async () => {
    const output = await runNested(['remote', 'remove', ''])
    expect(output).toMatchSnapshot()
  })

  test('suggest options for top-level status', async () => {
    const output = await runNested(['status', '--'])
    expect(output).toMatchSnapshot()
  })
})

describe('sub-commands on the entry command, given as arrays', () => {
  test('suggest the sub-commands of the entry', async () => {
    const output = await runEntrySubCommands()
    expect(output).toMatchSnapshot()
  })

  test('suggest the nested sub-commands of an array', async () => {
    const output = await runEntrySubCommands(['remote', ''])
    expect(output).toMatchSnapshot()
  })

  test('suggest the options of a sub-command', async () => {
    const output = await runEntrySubCommands(['status', '--'])
    expect(output).toMatchSnapshot()
  })
})

describe('nested sub-commands with i18n', () => {
  test('suggest top-level commands with localized descriptions', async () => {
    const output = await runNestedI18n()
    expect(output).toMatchSnapshot()
  })

  test('suggest nested sub-commands for remote with localized description', async () => {
    const output = await runNestedI18n(['remote'])
    expect(output).toMatchSnapshot()
  })

  test('suggest options for nested remote add with localized description', async () => {
    const output = await runNestedI18n(['remote', 'add', '--'])
    expect(output).toMatchSnapshot()
  })

  test('suggest localized option value for remote add --url', async () => {
    const output = await runNestedI18n(['remote', 'add', '--url'])
    expect(output).toMatchSnapshot()
  })

  test('suggest localized positional for remote remove', async () => {
    const output = await runNestedI18n(['remote', 'remove', ''])
    expect(output).toMatchSnapshot()
  })

  test('suggest options for top-level status with localized description', async () => {
    const output = await runNestedI18n(['status', '--'])
    expect(output).toMatchSnapshot()
  })
})

describe('i18n support', () => {
  test('no input', async () => {
    const output = await runI18n()
    expect(output).toMatchSnapshot()
  })

  describe('default command', () => {
    test('suggest for inputting', async () => {
      const output = await runI18n(['--'])
      expect(output).toMatchSnapshot()
    })

    test('suggest for long option', async () => {
      const output = await runI18n(['--config'])
      expect(output).toMatchSnapshot()
    })

    test('suggest duplicate options', async () => {
      const output = await runI18n(['--config', 'vite.config.js', '--'])
      expect(output).toMatchSnapshot()
    })

    test('suggest value if option values correctly', async () => {
      const output = await runI18n(['--config', 'vite.config'])
      expect(output).toMatchSnapshot()
    })

    test('suggest for short option', async () => {
      const output = await runI18n(['-c'])
      expect(output).toMatchSnapshot()
    })

    test('suggest duplicate options for short option', async () => {
      const output = await runI18n(['-c', 'vite.config.js', '--'])
      expect(output).toMatchSnapshot()
    })
  })

  describe('subcommand', () => {
    test('suggest for command only', async () => {
      const output = await runI18n(['dev'])
      expect(output).toMatchSnapshot()
    })

    test('suggest for option inputting', async () => {
      const output = await runI18n(['dev', '--'])
      expect(output).toMatchSnapshot()
    })

    test('suggest for long option', async () => {
      const output = await runI18n(['dev', '--port'])
      expect(output).toMatchSnapshot()
    })

    test('suggest for short option', async () => {
      const output = await runI18n(['dev', '-H'])
      expect(output).toMatchSnapshot()
    })

    test('not handle if unknown option', async () => {
      const output = await runI18n(['dev', '--unknown'])
      expect(output).toMatchSnapshot()
    })

    test('resolve value if long option and value', async () => {
      const output = await runI18n(['dev', '--port=3'])
      expect(output).toMatchSnapshot()
    })

    test('suggest if user ends with space after `--port`', async () => {
      const output = await runI18n(['dev', '--port', ''])
      expect(output).toMatchSnapshot()
    })

    test(`keep suggesting the --port option if user typed partial but didn't end with space`, async () => {
      const output = await runI18n(['dev', '--po'])
      expect(output).toMatchSnapshot()
    })

    test("user typed `--port=` and hasn't typed a space or value yet", async () => {
      const output = await runI18n(['dev', '--port='])
      expect(output).toMatchSnapshot()
    })

    test('suggest short option with equals sign', async () => {
      const output = await runI18n(['dev', '-p=3'])
      expect(output).toMatchSnapshot()
    })
  })

  describe('positional arguments', () => {
    test('suggest positional arguments when ending with space', async () => {
      const output = await runI18n(['lint', ''])
      expect(output).toMatchSnapshot()
    })

    test('positional arguments when ending with part of the value', async () => {
      const output = await runI18n(['lint', 'ind'])
      expect(output).toMatchSnapshot()
    })

    test('multiple positional argument when ending with space', async () => {
      const output = await runI18n(['lint', 'main.ts', ''], { G_COMPLETION_TEST_MULTIPLE: '1' })
      expect(output).toMatchSnapshot()
    })
  })
})

describe('the complete command', () => {
  const entry = define({ name: 'todo', run: () => {} })
  const add = define({ name: 'add', description: 'Add a task', run: () => {} })

  let output: string[] = []
  let errors: string[] = []

  beforeEach(() => {
    output = []
    errors = []
    vi.spyOn(console, 'log').mockImplementation((...values: unknown[]) => {
      output.push(values.map(value => String(value)).join(' '))
    })
    vi.spyOn(console, 'error').mockImplementation((...values: unknown[]) => {
      errors.push(values.map(value => String(value)).join(' '))
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    process.exitCode = undefined
  })

  test('reports that the script needs the name of the CLI with one line, without a stack trace', async () => {
    await expect(
      cli(['complete', 'zsh'], entry, { subCommands: { add }, plugins: [completion()] })
    ).resolves.toBeUndefined()

    expect(errors).toEqual([
      "The completion script needs the name of the CLI: give 'name' to cli()"
    ])
    expect(output).toEqual([])
    expect(process.exitCode).toBe(1)
  })

  test('completes a request without the name of the CLI', async () => {
    await cli(['complete', '--', 'a'], entry, { subCommands: { add }, plugins: [completion()] })

    expect(output).toEqual(['add\tAdd a task', ':4'])
    expect(errors).toEqual([])
  })

  test.each([
    { title: 'after the name of the command', argv: ['complete', '--verbose', 'zsh'] },
    { title: 'before the name of the command', argv: ['--verbose', 'complete', 'zsh'] }
  ])('prints the script with a global option $title', async ({ argv }) => {
    const verbose = plugin({
      id: 'verbose',
      setup: ctx => {
        ctx.addGlobalOption('verbose', { type: 'boolean', description: 'Verbose' })
      }
    })
    const options = { name: 'todo', subCommands: { add }, plugins: [verbose, completion()] }

    await cli(['complete', 'zsh'], entry, options)
    const script = [...output]
    output.length = 0
    await cli(argv, entry, options)

    expect(script.join('\n')).toContain('#compdef todo')
    expect(output).toEqual(script)
    expect(process.exitCode ?? 0).toBe(0)
  })

  test('completes a request after a global option before the name of the command', async () => {
    const verbose = plugin({
      id: 'verbose',
      setup: ctx => {
        ctx.addGlobalOption('verbose', { type: 'boolean', description: 'Verbose' })
      }
    })

    await cli(['--verbose', 'complete', '--', 'a'], entry, {
      name: 'todo',
      subCommands: { add },
      plugins: [verbose, completion()]
    })

    expect(output).toEqual(['add\tAdd a task', ':4'])
  })

  test('takes a word after -- for a word to complete, not for the name of a shell', async () => {
    await cli(['complete', '--', 'zsh'], entry, {
      name: 'todo',
      subCommands: { add },
      plugins: [completion()]
    })

    expect(output).toEqual([':4'])
  })

  test('describes a command whose name looks like a built-in key with its description', async () => {
    const subCommands = Object.fromEntries(
      ['_', 'err'].map(name => [
        name,
        define({ name, description: `The command named ${name}`, run: () => {} })
      ])
    )

    await cli(['complete', '--', ''], entry, { subCommands, plugins: [completion()] })

    expect(output).toEqual(['_\tThe command named _', 'err\tThe command named err', ':4'])
    expect(errors).toEqual([])
  })

  test('describes a command whose name looks like a built-in key with its description, with the i18n plugin', async () => {
    const subCommands = Object.fromEntries(
      ['_', '_internal', 'err'].map(name => [
        name,
        define({ name, description: `The command named ${name}`, run: () => {} })
      ])
    )

    await cli(['complete', '--', ''], entry, {
      subCommands,
      plugins: [completion(), i18n({ locale: 'en-US' })]
    })

    expect(output).toEqual([
      '_\tThe command named _',
      '_internal\tThe command named _internal',
      'err\tThe command named err',
      ':4'
    ])
    expect(errors).toEqual([])
  })

  test('reports an unknown shell as an argument error, with the help of the command', async () => {
    await cli(['complete', 'tcsh'], entry, {
      name: 'todo',
      subCommands: { add },
      plugins: [completion()]
    })

    expect(errors.join('\n')).toBe(
      [
        `Invalid value for 'shell': expected one of "bash", "zsh", "fish", "powershell"`,
        '',
        'See the arguments of the command:',
        '  todo complete --help'
      ].join('\n')
    )
    expect(output).toEqual([])
    expect(process.exitCode).toBe(1)
  })

  test('translates the error of an unknown shell', async () => {
    await cli(['complete', 'tcsh'], entry, {
      name: 'todo',
      subCommands: { add },
      plugins: [
        completion(),
        i18n({ locale: 'ja-JP', builtinResources: { 'ja-JP': jaJPResource } })
      ]
    })

    expect(errors.join('\n')).toBe(
      [
        `'shell' の値が不正です。指定可能な値: "bash", "zsh", "fish", "powershell"`,
        '',
        'コマンドの引数を確認する:',
        '  todo complete --help'
      ].join('\n')
    )
  })
})
