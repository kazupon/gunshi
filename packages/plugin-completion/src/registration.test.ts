import { RootCommand } from '@bomb.sh/tab'
import { createCommandContext } from '@gunshi/plugin'
import i18n from '@gunshi/plugin-i18n'
import { getCommandSubCommands, namespacedId } from '@gunshi/shared'
import { cli, lazy } from 'gunshi'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import completion from './index.ts'
import { COMPLETE_COMMAND_NAME, registerCompletion, registerForCompletion } from './registration.ts'

import type { Command, LazyCommand } from '@gunshi/plugin'
import type { I18nCommand, I18nExtension } from '@gunshi/plugin-i18n'
import type { MockInstance } from 'vitest'
import type { CompletionOptions } from './types.ts'

const NOOP = () => {}

afterEach(() => {
  vi.restoreAllMocks()
})

const i18nPluginId = namespacedId('i18n')

function defineCommand(command: I18nCommand): Command {
  return command
}

function resource(description: string, args: Record<string, string> = {}) {
  return () =>
    Promise.resolve({
      description,
      ...Object.fromEntries(Object.entries(args).map(([key, value]) => [`arg:${key}`, value]))
    })
}

// ---------------------------------------------------------------------------
// the command tree under test
// ---------------------------------------------------------------------------

const entryCommand = defineCommand({
  name: 'root',
  description: 'Root command',
  args: {
    config: { type: 'string', short: 'c', description: 'Config file' },
    mode: { type: 'string', short: 'm', description: 'Mode' },
    debug: { type: 'boolean', short: 'd', description: 'Debug' }
  },
  resource: resource('ルートコマンド', {
    config: '設定ファイル',
    mode: 'モード',
    debug: 'デバッグ'
  }),
  run: NOOP
})

const remote = defineCommand({
  name: 'remote',
  description: 'Manage remotes',
  args: { verbose: { type: 'boolean', short: 'v', description: 'Verbose' } },
  resource: resource('リモートを管理', { verbose: '詳細' }),
  subCommands: {
    add: defineCommand({
      name: 'add',
      description: 'Add a remote',
      args: {
        url: { type: 'string', short: 'u', description: 'Remote URL' },
        force: { type: 'boolean', short: 'f', negatable: true, description: 'Force' },
        name: { type: 'positional', description: 'Remote name' }
      },
      resource: resource('リモートを追加', { url: 'リモートの URL', force: '強制' }),
      run: NOOP
    }),
    remove: defineCommand({
      name: 'remove',
      description: 'Remove a remote',
      args: { name: { type: 'positional', description: 'Remote name' } },
      run: NOOP
    }),
    // three levels deep, with sub-commands as a Map
    prune: defineCommand({
      name: 'prune',
      description: 'Prune remotes',
      subCommands: new Map([
        [
          'stale',
          defineCommand({
            name: 'stale',
            description: 'Prune stale',
            args: { dry: { type: 'boolean', description: 'Dry run' } },
            run: NOOP
          })
        ],
        ['all', defineCommand({ name: 'all', description: 'Prune all', run: NOOP })]
      ]),
      run: NOOP
    }),
    secret: defineCommand({ name: 'secret', description: 'Internal', internal: true, run: NOOP }),
    // a user command that happens to be named like the command this plugin adds
    complete: defineCommand({ name: 'complete', description: 'Nested complete', run: NOOP })
  },
  run: NOOP
})

const subCommands = new Map<string, Command | LazyCommand>([
  [
    'dev',
    defineCommand({
      name: 'dev',
      description: 'Start dev server',
      args: {
        port: { type: 'number', short: 'p', description: 'Port' },
        host: { type: 'string', short: 'H', description: 'Host' },
        open: { type: 'boolean', description: 'Open browser' }
      },
      resource: resource('開発サーバーを起動', { port: 'ポート', host: 'ホスト' }),
      run: NOOP
    })
  ],
  [
    'lint',
    defineCommand({
      name: 'lint',
      description: 'Lint files',
      args: {
        files: { type: 'positional', multiple: true, description: 'Files' },
        fix: { type: 'boolean', description: 'Fix' }
      },
      run: NOOP
    })
  ],
  ['remote', remote],
  [
    'deploy',
    lazy(() => Promise.resolve({ run: NOOP }), {
      name: 'deploy',
      description: 'Deploy (lazy)',
      args: { env: { type: 'string', short: 'e', description: 'Environment' } },
      subCommands: {
        status: defineCommand({ name: 'status', description: 'Deploy status', run: NOOP })
      }
    })
  ],
  ['devtools', defineCommand({ name: 'devtools', description: 'Dev tools', run: NOOP })],
  ['hidden', defineCommand({ name: 'hidden', description: 'Internal', internal: true, run: NOOP })],
  // gunshi puts a copy of the entry command into the sub-commands
  ['root', { ...entryCommand, entry: true }]
])

const config: NonNullable<CompletionOptions['config']> = {
  entry: {
    args: {
      config: {
        handler: () => [
          { value: 'vite.config.ts', description: 'Config' },
          { value: 'vite.config.js', description: 'Config' }
        ]
      },
      mode: { handler: () => [{ value: 'development' }, { value: 'production' }] }
    }
  },
  subCommands: {
    dev: {
      args: {
        port: { handler: () => [{ value: '3000', description: 'default' }, { value: '8080' }] },
        host: { handler: () => [{ value: 'localhost' }] }
      }
    },
    lint: {
      args: {
        files: {
          handler: () => [
            { value: 'main.ts', description: 'Main' },
            { value: 'index.ts', description: 'Index' }
          ]
        }
      }
    },
    'remote add': {
      args: {
        url: { handler: () => [{ value: 'https://github.com' }] },
        name: { handler: () => [{ value: 'origin' }, { value: 'upstream' }] }
      }
    },
    'remote remove': { args: { name: { handler: () => [{ value: 'origin' }] } } },
    deploy: { args: { env: { handler: () => [{ value: 'prod' }, { value: 'staging' }] } } }
  }
}

// ---------------------------------------------------------------------------
// registration under test, and the full registration it has to agree with
// ---------------------------------------------------------------------------

async function createI18nExtension(): Promise<I18nExtension> {
  const plugin = i18n({ locale: 'ja-JP' })
  const ctx = await createCommandContext({})
  return await plugin.extension.factory(ctx, {} as Command)
}

// registers the whole command tree, as the plugin did before it registered
// only what a single completion request needs
async function registerAll(t: RootCommand, extension?: I18nExtension): Promise<void> {
  const entry = [...subCommands.values()].find(cmd => cmd.entry)!
  await registerCompletion({
    t,
    name: 'entry',
    cmd: entry,
    config,
    i18nPluginId,
    i18n: extension,
    isBombshellRoot: true
  })
  await registerAllSubCommands(t, subCommands, extension)
}

async function registerAllSubCommands(
  t: RootCommand,
  level: ReadonlyMap<string, Command | LazyCommand>,
  extension?: I18nExtension,
  parentPath = ''
): Promise<void> {
  for (const [name, cmd] of level) {
    if (cmd.internal || cmd.entry || name === COMPLETE_COMMAND_NAME) {
      continue
    }
    const fullName = parentPath ? `${parentPath} ${name}` : name
    await registerCompletion({
      t,
      name: fullName,
      cmd,
      config: config.subCommands ?? {},
      i18nPluginId,
      i18n: extension
    })
    const nested = getCommandSubCommands(cmd)
    if (nested && nested.size > 0) {
      await registerAllSubCommands(t, nested, extension, fullName)
    }
  }
}

function registerActivePath(args: string[]) {
  return async (t: RootCommand, extension?: I18nExtension): Promise<void> => {
    await registerForCompletion({
      t,
      args,
      subCommands,
      fallbackEntry: { name: COMPLETE_COMMAND_NAME },
      config,
      i18nPluginId,
      i18n: extension
    })
  }
}

async function complete(
  register: (t: RootCommand, extension?: I18nExtension) => Promise<void>,
  args: string[],
  useI18n: boolean,
  output: string[]
): Promise<[string, RootCommand]> {
  const t = new RootCommand()
  await register(t, useI18n ? await createI18nExtension() : undefined)
  output.length = 0
  t.parse([...args])
  return [output.join('\n'), t]
}

function hasOption(t: RootCommand, arg: string, booleanOnly = false): boolean {
  const name = arg.replace(/^-+/, '')
  return [t, ...t.commands.values()].some(command =>
    [...command.options.values()].some(
      option =>
        (option.value === name || option.alias === name) && (!booleanOnly || !!option.isBoolean)
    )
  )
}

// `RootCommand#parse` looks an option up in every registered command, so the full command tree
// knows the boolean options of the commands off the typed path, and the active path does not.
// Such an option is not valid where it is typed, and the active path takes it as an unknown option.
function usesOptionOffThePath(args: string[], full: RootCommand, activePath: RootCommand): boolean {
  return args.some(
    arg => arg.startsWith('-') && hasOption(full, arg, true) && !hasOption(activePath, arg)
  )
}

// ---------------------------------------------------------------------------
// the inputs both registrations have to agree on
// ---------------------------------------------------------------------------

const PATHS = [
  [],
  ['dev'],
  ['lint'],
  ['remote'],
  ['remote', 'add'],
  ['remote', 'remove'],
  ['remote', 'prune'],
  ['remote', 'prune', 'stale'],
  ['remote', 'secret'],
  ['remote', 'complete'],
  ['deploy'],
  ['deploy', 'status'],
  ['devtools'],
  ['hidden'],
  ['unknown'],
  ['remote', 'unknown'],
  ['dev', 'extra'],
  // a single quoted word that holds a whole command path
  ['remote add'],
  ['remote prune'],
  ['remote unknown']
]

const TAILS = [
  [''],
  ['d'],
  ['de'],
  ['r'],
  ['re'],
  ['a'],
  ['s'],
  ['-'],
  ['--'],
  ['--p'],
  ['--port'],
  ['--port', ''],
  ['--port', '3'],
  ['--port='],
  ['--port=80'],
  ['-p'],
  ['-p', ''],
  ['-c', ''],
  ['--config', ''],
  ['--config', 'vite.config'],
  ['--config=vite'],
  ['--config', 'vite.config.ts', ''],
  ['--config', 'vite.config.ts', '--'],
  ['--debug', ''],
  ['--debug', 'de'],
  ['-d', ''],
  ['--open', ''],
  ['--force', ''],
  ['--no-force', ''],
  ['--no-'],
  ['--url', ''],
  ['--url', 'https://x', ''],
  ['-u', ''],
  ['--env', ''],
  ['--unknown', ''],
  ['--unknown', 'value', ''],
  ['main.ts', ''],
  ['main.ts', 'i'],
  ['origin', ''],
  ['origin', '--']
]

// options typed before the command path
const PREFIXES = [[], ['--config', 'x'], ['--debug'], ['--port', '3000'], ['--config=x'], ['-d']]

const INPUTS: string[][] = []
for (const prefix of PREFIXES) {
  for (const path of PATHS) {
    for (const tail of TAILS) {
      INPUTS.push([...prefix, ...path, ...tail])
    }
  }
}
// an option between command names
for (const tail of TAILS) {
  INPUTS.push(['remote', '--verbose', 'add', ...tail], ['remote', '--url', 'x', 'add', ...tail])
}

function formatInput(args: string[]): string {
  return args.map(arg => (arg === '' ? "''" : arg)).join(' ')
}

// ---------------------------------------------------------------------------

describe('registerForCompletion', () => {
  let output: string[] = []

  beforeEach(() => {
    output = []
    vi.spyOn(console, 'log').mockImplementation((...values: unknown[]) => {
      output.push(values.map(value => String(value)).join(' '))
    })
    vi.spyOn(console, 'warn').mockImplementation(NOOP)
  })

  test('registers the candidates at the cursor without their options', async () => {
    const t = new RootCommand()
    await registerActivePath(['remote', ''])(t)

    // a command on the typed path is registered with its options and positional arguments
    const onPath = t.commands.get('remote')
    expect(onPath?.options.size).toBeGreaterThan(0)

    // a candidate at the cursor only has to be offered by name, with its description
    const candidate = t.commands.get('remote add')
    expect(candidate?.description).toEqual('Add a remote')
    expect(candidate?.options.size).toEqual(0)
    expect(candidate?.arguments.size).toEqual(0)
  })

  test('a boolean option takes no value', async () => {
    const t = new RootCommand()
    await registerActivePath(['remote', 'add', ''])(t)

    expect(t.options.get('debug')?.isBoolean).toEqual(true)
    expect(t.options.get('config')?.isBoolean).toEqual(false)
    expect(t.commands.get('remote add')?.options.get('force')?.isBoolean).toEqual(true)
    expect(t.commands.get('remote add')?.options.get('no-force')?.isBoolean).toEqual(true)
  })

  test.each([
    [['--debug', ''], 'dev\tStart dev server'],
    [['-d', 'rem'], 'remote\tManage remotes'],
    [['remote', '--verbose', ''], 'add\tAdd a remote'],
    [['remote', 'add', '--force', ''], 'origin\t'],
    [['remote', 'add', '--no-force', ''], 'origin\t'],
    [['remote', 'add', '--no-'], '--no-force\tNegatable of -f, --force']
  ])('completes after a boolean option: %j', async (args, expected) => {
    const [actual] = await complete(registerActivePath(args), args, false, output)
    expect(actual.split('\n')).toContain(expected)
  })

  describe.each([
    ['without i18n', false],
    ['with i18n', true]
  ])('%s', (_label, useI18n) => {
    test('completes exactly like the full command tree', async () => {
      const mismatches: string[] = []
      let withCandidates = 0
      let compared = 0

      for (const args of INPUTS) {
        const [expected, full] = await complete(registerAll, args, useI18n, output)
        const [actual, activePath] = await complete(registerActivePath(args), args, useI18n, output)
        if (usesOptionOffThePath(args, full, activePath)) {
          continue
        }
        compared++
        if (expected !== ':4') {
          withCandidates++
        }
        if (expected !== actual) {
          mismatches.push(
            `${formatInput(args)}: full ${JSON.stringify(expected)}, active path ${JSON.stringify(actual)}`
          )
        }
      }

      expect(mismatches).toEqual([])
      // guard against an all-empty corpus, which would compare nothing
      expect(compared).toBeGreaterThan(INPUTS.length * 0.9)
      expect(withCandidates).toBeGreaterThan(compared / 5)
    })
  })
})

// ---------------------------------------------------------------------------
// what a run actually touches, measured by the resources it loads
// ---------------------------------------------------------------------------

describe('registration scope', () => {
  function createTrackedTree(total = 3) {
    const loaded: string[] = []
    const track = (name: string, description: string) => {
      return () => {
        loaded.push(name)
        return Promise.resolve({ description })
      }
    }
    const command = (name: string, description: string) =>
      defineCommand({ name, description, resource: track(name, description), run: NOOP })

    const tracked = new Map<string, Command | LazyCommand>([
      [
        'remote',
        defineCommand({
          name: 'remote',
          description: 'Manage remotes',
          resource: track('remote', 'リモートを管理'),
          subCommands: {
            add: defineCommand({
              name: 'add',
              description: 'Add a remote',
              args: { url: { type: 'string', description: 'Remote URL' } },
              resource: track('add', 'リモートを追加'),
              run: NOOP
            }),
            remove: command('remove', 'リモートを削除')
          },
          run: NOOP
        })
      ],
      ['dev', command('dev', '開発サーバーを起動')],
      ['deploy', command('deploy', 'デプロイ')],
      ['lint', command('lint', 'リント')]
    ])
    for (let i = 0; i < total; i++) {
      tracked.set(`extra${i}`, command(`extra${i}`, `その他 ${i}`))
    }

    return { loaded, subCommands: tracked, entry: command('root', 'ルートコマンド') }
  }

  async function run(argv: string[], tree: ReturnType<typeof createTrackedTree>): Promise<void> {
    await cli(argv, tree.entry, {
      name: 'mycli',
      version: '0.0.0',
      subCommands: tree.subCommands,
      usageSilent: true,
      plugins: [i18n({ locale: 'ja-JP' }), completion()]
    })
  }

  let warnSpy: MockInstance<typeof console.warn>

  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(NOOP)
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(NOOP)
  })

  test('a normal command run loads only the resource of the command it runs', async () => {
    const tree = createTrackedTree()
    await run(['remote', 'add'], tree)

    expect(tree.loaded).toEqual(['add'])
  })

  test('a normal command run does not scale with the number of commands', async () => {
    const tree = createTrackedTree(500)
    await run(['dev'], tree)

    expect(tree.loaded).toEqual(['dev'])
  })

  test('generating a completion script loads no resource', async () => {
    const tree = createTrackedTree()
    await run(['complete', 'bash'], tree)

    expect(tree.loaded).toEqual([])
  })

  test('completing a command loads the entry, the path and the candidates', async () => {
    const tree = createTrackedTree()
    await run(['complete', '--', 'remote', ''], tree)

    expect(tree.loaded).toEqual(['root', 'remote', 'add', 'remove'])
  })

  test('completing options loads the path only', async () => {
    const tree = createTrackedTree()
    await run(['complete', '--', 'remote', 'add', '--'], tree)

    expect(tree.loaded).toEqual(['root', 'remote', 'add'])
  })

  test('completing the options of a command with sub-commands loads the path only', async () => {
    const tree = createTrackedTree()
    await run(['complete', '--', 'remote', '--'], tree)

    // the sub-commands of `remote` cannot be completed here, so they are not loaded
    expect(tree.loaded).toEqual(['root', 'remote'])
  })

  test('completing a prefix loads the candidates that match it', async () => {
    const tree = createTrackedTree()
    await run(['complete', '--', 'de'], tree)

    expect(tree.loaded).toEqual(['root', 'dev', 'deploy'])
  })

  test('a command without an i18n resource does not warn', async () => {
    const entry = defineCommand({ name: 'root', description: 'Root command', run: NOOP })
    const withoutResources = new Map<string, Command | LazyCommand>([
      ['dev', defineCommand({ name: 'dev', description: 'Start dev server', run: NOOP })],
      ['lint', defineCommand({ name: 'lint', description: 'Lint files', run: NOOP })]
    ])

    await cli(['complete', '--', ''], entry, {
      name: 'mycli',
      version: '0.0.0',
      subCommands: withoutResources,
      usageSilent: true,
      plugins: [i18n({ locale: 'ja-JP' }), completion()]
    })

    expect(warnSpy).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// a CLI without sub-commands, where the entry command is not part of `env.subCommands`
// ---------------------------------------------------------------------------

describe('a CLI without sub-commands', () => {
  let output: string[] = []

  beforeEach(() => {
    output = []
    vi.spyOn(console, 'log').mockImplementation((...values: unknown[]) => {
      output.push(values.map(value => String(value)).join(' '))
    })
  })

  const args = {
    environment: { type: 'string', short: 'e', description: 'Target environment' },
    config: { type: 'string', short: 'c', description: 'Config file path' }
  } as const

  const entryConfig: NonNullable<CompletionOptions['config']> = {
    entry: {
      args: {
        config: { handler: () => [{ value: 'prod.json', description: 'Production config' }] }
      }
    }
  }

  test('completes the options of the entry command', async () => {
    const entry = defineCommand({ name: 'deploy', description: 'Deploy the app', args, run: NOOP })

    await cli(['complete', '--', '--'], entry, {
      name: 'mycli',
      version: '0.0.0',
      usageSilent: true,
      plugins: [completion({ config: entryConfig })]
    })

    expect(output).toEqual([
      '--environment\tTarget environment',
      '--config\tConfig file path',
      ':4'
    ])
  })

  test('completes the option values of the entry command', async () => {
    const entry = defineCommand({ name: 'deploy', description: 'Deploy the app', args, run: NOOP })

    await cli(['complete', '--', '--config', ''], entry, {
      name: 'mycli',
      version: '0.0.0',
      usageSilent: true,
      plugins: [completion({ config: entryConfig })]
    })

    expect(output).toEqual(['prod.json\tProduction config', ':4'])
  })

  test('completes the positional arguments of the entry command', async () => {
    const entry = defineCommand({
      name: 'deploy',
      description: 'Deploy the app',
      args: { ...args, target: { type: 'positional', description: 'Deploy target' } },
      run: NOOP
    })

    await cli(['complete', '--', ''], entry, {
      name: 'mycli',
      version: '0.0.0',
      usageSilent: true,
      plugins: [
        completion({
          config: {
            entry: {
              args: { target: { handler: () => [{ value: 'staging', description: 'Staging' }] } }
            }
          }
        })
      ]
    })

    expect(output).toEqual(['staging\tStaging', ':4'])
  })

  test('completes a lazy entry command', async () => {
    const entry = lazy(() => NOOP, { name: 'deploy', description: 'Deploy the app', args })

    await cli(['complete', '--', '--'], entry, {
      name: 'mycli',
      version: '0.0.0',
      usageSilent: true,
      plugins: [completion({ config: entryConfig })]
    })

    expect(output).toEqual([
      '--environment\tTarget environment',
      '--config\tConfig file path',
      ':4'
    ])
  })

  test('localizes the entry command', async () => {
    const loaded: string[] = []
    const entry = defineCommand({
      name: 'deploy',
      description: 'Deploy the app',
      args,
      resource: () => {
        loaded.push('deploy')
        return Promise.resolve({
          description: 'アプリをデプロイ',
          'arg:environment': 'デプロイ先の環境',
          'arg:config': '設定ファイルのパス'
        })
      },
      run: NOOP
    })

    await cli(['complete', '--', '--'], entry, {
      name: 'mycli',
      version: '0.0.0',
      usageSilent: true,
      plugins: [i18n({ locale: 'ja-JP' }), completion({ config: entryConfig })]
    })

    expect(loaded).toEqual(['deploy'])
    expect(output).toEqual([
      '--environment\tデプロイ先の環境',
      '--config\t設定ファイルのパス',
      ':4'
    ])
  })

  test('falls back to the given command when gunshi does not expose the entry command', async () => {
    // gunshi before `env.entryCommand`: the completion root has nothing to complete
    const t = new RootCommand()
    await registerForCompletion({
      t,
      args: ['--'],
      subCommands: new Map<string, Command | LazyCommand>([
        [COMPLETE_COMMAND_NAME, defineCommand({ name: COMPLETE_COMMAND_NAME, run: NOOP })]
      ]),
      fallbackEntry: { name: COMPLETE_COMMAND_NAME },
      config: entryConfig,
      i18nPluginId
    })
    t.parse(['--'])

    expect(output).toEqual([':4'])
  })
})
