import jaJPResource from '@gunshi/resources/ja-JP' with { type: 'json' }
import { RootCommand } from '@bomb.sh/tab'
import { createCommandContext, plugin } from '@gunshi/plugin'
import i18n from '@gunshi/plugin-i18n'
import { COMMON_ARGS, getCommandSubCommands, namespacedId } from '@gunshi/shared'
import { cli, lazy } from 'gunshi'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import completion from './index.ts'
import { COMPLETE_COMMAND_NAME, registerCompletion, registerForCompletion } from './registration.ts'

import type { ArgSchema, Args, Command, LazyCommand } from '@gunshi/plugin'
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
  // lazy commands whose arguments are defined by the command that the loader returns.
  // the descriptions and the resources are the same on both sides, because a candidate at the cursor
  // is described by its definition, while the full registration below runs every loader
  [
    'publish',
    lazy(
      () =>
        Promise.resolve(
          defineCommand({
            name: 'publish',
            description: 'Publish packages',
            args: {
              tag: { type: 'string', short: 't', description: 'Tag' },
              dry: { type: 'boolean', description: 'Dry run' },
              pkg: { type: 'positional', description: 'Package' }
            },
            run: NOOP
          })
        ),
      {
        name: 'publish',
        description: 'Publish packages',
        resource: resource('パッケージを公開', { tag: 'タグ' })
      } as I18nCommand
    )
  ],
  [
    'cloud',
    lazy(
      () =>
        Promise.resolve(
          defineCommand({
            name: 'cloud',
            description: 'Manage the cloud',
            args: {
              region: { type: 'string', short: 'r', description: 'Region' },
              quiet: { type: 'boolean', short: 'q', description: 'Quiet' }
            },
            run: NOOP
          })
        ),
      {
        name: 'cloud',
        description: 'Manage the cloud',
        subCommands: {
          login: lazy(
            () =>
              Promise.resolve(
                defineCommand({
                  name: 'login',
                  description: 'Log in',
                  args: {
                    token: { type: 'string', description: 'Token' },
                    profile: { type: 'positional', description: 'Profile' }
                  },
                  run: NOOP
                })
              ),
            { name: 'login', description: 'Log in' }
          )
        }
      }
    )
  ],
  // a lazy command without a definition, which does not even have a name of its own
  [
    'bare',
    lazy(() =>
      Promise.resolve(
        defineCommand({
          name: 'bare',
          args: { output: { type: 'string', short: 'o', description: 'Output' } },
          run: NOOP
        })
      )
    )
  ],
  // a lazy command whose loader fails
  [
    'broken',
    lazy(() => Promise.reject(new Error('cannot load')), { name: 'broken', description: 'Broken' })
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
    deploy: { args: { env: { handler: () => [{ value: 'prod' }, { value: 'staging' }] } } },
    publish: {
      args: {
        tag: { handler: () => [{ value: 'latest' }, { value: 'next' }] },
        pkg: { handler: () => [{ value: 'gunshi', description: 'Core' }] }
      }
    },
    cloud: {
      args: { region: { handler: () => [{ value: 'us-east-1' }, { value: 'eu-west-1' }] } }
    },
    'cloud login': {
      args: {
        token: { handler: () => [{ value: 'env:TOKEN' }] },
        profile: { handler: () => [{ value: 'default' }] }
      }
    },
    bare: { args: { output: { handler: () => [{ value: 'dist' }] } } }
  }
}
// a global option is completed per command, with the handler that the command configures for it
config.entry!.args!.profile = { handler: () => [{ value: 'default' }, { value: 'ci' }] }
config.subCommands!.dev.args!.profile = { handler: () => [{ value: 'dev-profile' }] }
// `release` is not part of the command tree above: it belongs to the test that shadows a global option
config.subCommands!.release = {
  args: { version: { handler: () => [{ value: '1.0.0' }, { value: '2.0.0' }] } }
}

// the options that plugins register with `addGlobalOption`, which gunshi merges into the arguments of
// the command that it runs: the ones of `@gunshi/plugin-global`, one that takes a value, and a negatable one
const globalOptions = new Map<string, ArgSchema>([
  ...Object.entries(COMMON_ARGS),
  ['profile', { type: 'string', short: 'P', description: 'Profile' }],
  ['color', { type: 'boolean', negatable: true, description: 'Colorize output' }]
])

// what `@gunshi/plugin-global`, which `cli` installs, adds to the options of every command
const GLOBAL_OPTION_LINES = ['--help\tDisplay this help message', '--version\tDisplay this version']

// ---------------------------------------------------------------------------
// registration under test, and the full registration it has to agree with
// ---------------------------------------------------------------------------

async function createI18nExtension(): Promise<I18nExtension> {
  const plugin = i18n({ locale: 'ja-JP' })
  const ctx = await createCommandContext({})
  return await plugin.extension.factory(ctx, {} as Command)
}

// registers the whole command tree, as the plugin did before it registered
// only what a single completion request needs, and runs the loader of every lazy command
async function registerAll(t: RootCommand, extension?: I18nExtension): Promise<void> {
  const entry = [...subCommands.values()].find(cmd => cmd.entry)!
  await registerCompletion({
    t,
    name: 'entry',
    cmd: entry,
    config,
    i18nPluginId,
    i18n: extension,
    isBombshellRoot: true,
    load: true,
    globalOptions
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
    if (cmd.internal || cmd.entry || (parentPath === '' && name === COMPLETE_COMMAND_NAME)) {
      continue
    }
    const fullName = parentPath ? `${parentPath} ${name}` : name
    await registerCompletion({
      t,
      name: fullName,
      cmd,
      config: config.subCommands ?? {},
      i18nPluginId,
      i18n: extension,
      load: true,
      globalOptions
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
      i18n: extension,
      globalOptions
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
  ['publish'],
  ['cloud'],
  ['cloud', 'login'],
  ['bare'],
  ['broken'],
  ['devtools'],
  ['hidden'],
  ['unknown'],
  ['remote', 'unknown'],
  ['dev', 'extra'],
  // a single quoted word that holds a whole command path
  ['remote add'],
  ['remote prune'],
  ['remote unknown'],
  ['cloud login']
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
  ['--help', ''],
  ['-h', ''],
  ['--he'],
  ['--profile', ''],
  ['--no-color', ''],
  ['--unknown', ''],
  ['--unknown', 'value', ''],
  ['main.ts', ''],
  ['main.ts', 'i'],
  ['origin', ''],
  ['origin', '--']
]

// options typed before the command path
const PREFIXES = [
  [],
  ['--config', 'x'],
  ['--debug'],
  ['--port', '3000'],
  ['--config=x'],
  ['-d'],
  // global options typed before the command path
  ['--version'],
  ['--profile', 'ci']
]

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
  INPUTS.push(
    ['remote', '--verbose', 'add', ...tail],
    ['remote', '--url', 'x', 'add', ...tail],
    ['cloud', '--quiet', 'login', ...tail],
    ['cloud', '--region', 'x', 'login', ...tail],
    // a boolean option that only the loader of the command before it defines
    ['cloud', '--quiet', ...tail]
  )
}
// the values of the options that only a loader defines
const LOADER_OPTION_INPUTS = [
  ['publish', '--tag', ''],
  ['publish', '-t', 'n'],
  ['publish', '--tag', 'latest', ''],
  ['cloud', '--region', ''],
  ['cloud', '-r', 'eu'],
  ['cloud', 'login', '--token', ''],
  ['bare', '-o', ''],
  ['bare', '--output', 'dist', '']
]
for (const prefix of PREFIXES) {
  for (const input of LOADER_OPTION_INPUTS) {
    INPUTS.push([...prefix, ...input])
  }
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

  test('a nested command named like the completion command is a user command', async () => {
    const args = ['remote', '']
    const [actual] = await complete(registerActivePath(args), args, false, output)
    expect(actual.split('\n')).toContain('complete\tNested complete')

    // the completion command itself lives at the top level, and is not offered
    const tree = new Map(subCommands).set(COMPLETE_COMMAND_NAME, { name: COMPLETE_COMMAND_NAME })
    const t = new RootCommand()
    await registerForCompletion({
      t,
      args: [''],
      subCommands: tree,
      fallbackEntry: { name: COMPLETE_COMMAND_NAME },
      config,
      i18nPluginId
    })
    expect(t.commands.has(COMPLETE_COMMAND_NAME)).toEqual(false)
    expect(t.commands.has('remote')).toEqual(true)
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
// global options, which no command defines: gunshi merges them into the command that it runs
// ---------------------------------------------------------------------------

describe('global options', () => {
  let output: string[] = []

  beforeEach(() => {
    output = []
    vi.spyOn(console, 'log').mockImplementation((...values: unknown[]) => {
      output.push(values.map(value => String(value)).join(' '))
    })
  })

  async function completeWith(
    args: string[],
    tree: ReadonlyMap<string, Command | LazyCommand> = subCommands
  ): Promise<RootCommand> {
    const t = new RootCommand()
    await registerForCompletion({
      t,
      args,
      subCommands: tree,
      fallbackEntry: { name: COMPLETE_COMMAND_NAME },
      config,
      i18nPluginId,
      globalOptions
    })
    output.length = 0
    t.parse([...args])
    return t
  }

  test('are offered before the options of the command, like the usage lists them', async () => {
    await completeWith(['--'])

    expect(output).toEqual([
      '--help\tDisplay this help message',
      '--version\tDisplay this version',
      '--profile\tProfile',
      '--color\tColorize output',
      '--no-color\tNegatable of --color',
      '--config\tConfig file',
      '--mode\tMode',
      '--debug\tDebug',
      ':4'
    ])
  })

  test('are offered by their short names', async () => {
    await completeWith(['-'])

    expect(output).toEqual([
      '-h\tDisplay this help message',
      '-v\tDisplay this version',
      '-P\tProfile',
      '-c\tConfig file',
      '-m\tMode',
      '-d\tDebug',
      ':4'
    ])
  })

  test.each([
    [['remote', 'add', '--'], '--url\tRemote URL'],
    // a lazy command whose arguments are defined by its loader
    [['publish', '--'], '--tag\tTag']
  ])('are offered for a command on the typed path: %j', async (args, own) => {
    await completeWith(args)

    expect(output.slice(0, 2)).toEqual(GLOBAL_OPTION_LINES)
    expect(output).toContain(own)
  })

  test('are not registered for the candidates at the cursor', async () => {
    const t = await completeWith(['remote', ''])

    expect(t.commands.get('remote')?.options.has('help')).toEqual(true)
    expect(t.commands.get('remote add')?.options.size).toEqual(0)
  })

  test.each([
    [['--help', ''], 'dev\tStart dev server'],
    [['-h', 'rem'], 'remote\tManage remotes'],
    [['remote', '--version', ''], 'add\tAdd a remote'],
    [['--no-color', 'remote', 'add', ''], 'origin\t']
  ])('a boolean one takes no value: %j', async (args, expected) => {
    await completeWith(args)

    expect(output).toContain(expected)
  })

  test('one that takes a value is completed with the handler of the command', async () => {
    await completeWith(['--profile', ''])
    expect(output).toEqual(['default\t', 'ci\t', ':4'])

    await completeWith(['dev', '--profile', ''])
    expect(output).toEqual(['dev-profile\t', ':4'])

    // the word after it is its value, not a command
    await completeWith(['--profile', 'remote', ''])
    expect(output).toContain('dev\tStart dev server')
  })

  test('an argument of the command shadows the global option of the same name', async () => {
    const tree = new Map<string, Command | LazyCommand>([
      [
        'release',
        defineCommand({
          name: 'release',
          description: 'Release',
          args: { version: { type: 'string', description: 'Version to release' } },
          run: NOOP
        })
      ]
    ])
    const t = await completeWith(['release', '--'], tree)

    // registered once, with the schema of the command, where the global option was
    expect(output).toEqual([
      '--help\tDisplay this help message',
      '--version\tVersion to release',
      '--profile\tProfile',
      '--color\tColorize output',
      '--no-color\tNegatable of --color',
      ':4'
    ])
    expect(t.commands.get('release')?.options.get('version')?.isBoolean).toEqual(false)

    // the handler of the command is reachable, so the pair below says something
    await completeWith(['release', '--version='], tree)
    expect(output).toEqual(['1.0.0\t', '2.0.0\t', ':4'])

    // but not after a space: `RootCommand#stripOptions` resolves an option's arity from the completion
    // root first, where the global option is a boolean, so the word after it is not taken as its value.
    // Registering the whole command tree behaves the same way.
    await completeWith(['release', '--version', ''], tree)
    expect(output).toEqual([':4'])
  })

  test('registerCompletion registers the arguments of the command only, unless they are given', async () => {
    const t = new RootCommand()
    const params = {
      t,
      name: 'dev',
      cmd: subCommands.get('dev')!,
      config: config.subCommands ?? {},
      i18nPluginId
    }

    expect([...(await registerCompletion(params)).options.keys()]).toEqual(['port', 'host', 'open'])
    expect([...(await registerCompletion({ ...params, globalOptions })).options.keys()]).toEqual([
      'help',
      'version',
      'profile',
      'color',
      'no-color',
      'port',
      'host',
      'open'
    ])
  })

  describe('through the plugin', () => {
    const entry = defineCommand({
      name: 'root',
      description: 'Root command',
      args: { verbose: { type: 'boolean', short: 'V', description: 'Verbose output' } },
      run: NOOP
    })
    const tree = {
      status: defineCommand({ name: 'status', description: 'Show status', run: NOOP })
    }

    // a plugin that is installed after the completion plugin, like `@gunshi/plugin-dryrun` can be
    const lateDependencies = [{ id: i18nPluginId, optional: true }] as const
    const late = plugin<
      Record<typeof i18nPluginId, I18nExtension>,
      'test:late',
      typeof lateDependencies
    >({
      id: 'test:late',
      name: 'late',
      dependencies: lateDependencies,
      setup(ctx) {
        ctx.addGlobalOption('late', { type: 'boolean', description: 'Late option' })
      },
      onExtension(ctx) {
        ctx.extensions[i18nPluginId]?.registerGlobalOptionResources('late', {
          'en-US': 'Late option',
          'ja-JP': '後から登録されたオプション'
        })
      }
    })

    test('reads them when a completion request runs, whatever the install order is', async () => {
      await cli(['complete', '--', 'status', '--'], entry, {
        name: 'mycli',
        version: '0.0.0',
        subCommands: tree,
        usageSilent: true,
        plugins: [completion(), late]
      })

      expect(output).toEqual([...GLOBAL_OPTION_LINES, '--late\tLate option', ':4'])
    })

    test('completes after them', async () => {
      await cli(['complete', '--', '--late', ''], entry, {
        name: 'mycli',
        version: '0.0.0',
        subCommands: tree,
        usageSilent: true,
        plugins: [completion(), late]
      })

      expect(output).toEqual(['status\tShow status', ':4'])
    })

    test('localizes them', async () => {
      await cli(['complete', '--', 'status', '--'], entry, {
        name: 'mycli',
        version: '0.0.0',
        subCommands: tree,
        usageSilent: true,
        plugins: [i18n({ locale: 'ja-JP' }), completion(), late]
      })

      expect(output).toEqual([...GLOBAL_OPTION_LINES, '--late\t後から登録されたオプション', ':4'])
    })
  })
})

// ---------------------------------------------------------------------------
// lazy commands, whose arguments may only be known to the command that the loader returns
// ---------------------------------------------------------------------------

describe('lazy commands', () => {
  function createLazyTree() {
    const loaded: string[] = []
    const track = <T>(name: string, value: T) => {
      return () => {
        loaded.push(name)
        return Promise.resolve(value)
      }
    }

    const add = lazy(
      track(
        'remote add',
        defineCommand({
          name: 'add',
          description: 'Add a remote',
          args: {
            url: { type: 'string', short: 'u', description: 'Remote URL' },
            name: { type: 'positional', description: 'Remote name' }
          },
          run: NOOP
        })
      ),
      { name: 'add', description: 'Add a remote' }
    )

    const tree = new Map<string, Command | LazyCommand>([
      // the arguments are defined by the command that the loader returns
      [
        'deploy',
        lazy(
          track(
            'deploy',
            defineCommand({
              name: 'deploy',
              description: 'Deploy the app (loaded)',
              args: {
                target: { type: 'string', short: 't', description: 'Deploy target' },
                env: { type: 'positional', description: 'Environment' }
              },
              resource: resource('アプリをデプロイ', { target: 'デプロイ先' }),
              run: NOOP
            })
          ),
          { name: 'deploy', description: 'Deploy the app' }
        )
      ],
      // the arguments are defined by the definition, and the loader returns the runner
      [
        'build',
        lazy(track('build', NOOP), {
          name: 'build',
          description: 'Build the project',
          args: { watch: { type: 'boolean', short: 'w', description: 'Watch for changes' } }
        })
      ],
      // no definition at all
      [
        'bare',
        lazy(
          track(
            'bare',
            defineCommand({
              name: 'bare',
              description: 'Bare (loaded)',
              args: { output: { type: 'string', short: 'o', description: 'Output file' } },
              run: NOOP
            })
          )
        )
      ],
      // a lazy command with lazy sub-commands
      [
        'remote',
        lazy(
          track(
            'remote',
            defineCommand({
              name: 'remote',
              description: 'Manage remotes',
              args: { verbose: { type: 'boolean', short: 'v', description: 'Verbose' } },
              run: NOOP
            })
          ),
          { name: 'remote', description: 'Manage remotes', subCommands: { add } }
        )
      ],
      [
        'broken',
        lazy(
          () => {
            loaded.push('broken')
            return Promise.reject(new Error('cannot load the command'))
          },
          { name: 'broken', description: 'Broken loader' }
        )
      ],
      [
        'norun',
        lazy(track('norun', { args: { x: { type: 'string' } } } as unknown as Command), {
          name: 'norun',
          description: 'Loader without a runner'
        })
      ]
    ])

    const entry = lazy(
      track(
        'entry',
        defineCommand({
          name: 'main',
          description: 'Main command',
          args: { config: { type: 'string', short: 'c', description: 'Config file' } },
          run: NOOP
        })
      ),
      { name: 'main', description: 'Main command' }
    )

    return { loaded, subCommands: tree, entry }
  }

  const lazyConfig: NonNullable<CompletionOptions['config']> = {
    subCommands: {
      deploy: {
        args: {
          target: { handler: () => [{ value: 'production' }, { value: 'staging' }] },
          env: { handler: () => [{ value: 'prod', description: 'Production' }] }
        }
      },
      'remote add': { args: { name: { handler: () => [{ value: 'origin' }] } } }
    }
  }

  async function run(
    argv: string[],
    tree: ReturnType<typeof createLazyTree>,
    plugins = [completion({ config: lazyConfig })]
  ): Promise<void> {
    await cli(argv, tree.entry, {
      name: 'mycli',
      version: '0.0.0',
      subCommands: tree.subCommands,
      usageSilent: true,
      plugins
    })
  }

  let output: string[] = []
  let warnSpy: MockInstance<typeof console.warn>
  let errorSpy: MockInstance<typeof console.error>

  beforeEach(() => {
    output = []
    vi.spyOn(console, 'log').mockImplementation((...values: unknown[]) => {
      output.push(values.map(value => String(value)).join(' '))
    })
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(NOOP)
    errorSpy = vi.spyOn(console, 'error').mockImplementation(NOOP)
  })

  test('completes the options that the loader defines', async () => {
    const tree = createLazyTree()
    await run(['complete', '--', 'deploy', '--'], tree)

    expect(output).toEqual([...GLOBAL_OPTION_LINES, '--target\tDeploy target', ':4'])
    expect(tree.loaded).toEqual(['deploy'])
  })

  test('completes the option values and the positional arguments that the loader defines', async () => {
    const tree = createLazyTree()
    await run(['complete', '--', 'deploy', '--target', ''], tree)
    expect(output).toEqual(['production\t', 'staging\t', ':4'])

    output.length = 0
    await run(['complete', '--', 'deploy', ''], tree)
    expect(output).toEqual(['prod\tProduction', ':4'])
  })

  test('localizes the options with the resource that the loader defines', async () => {
    const tree = createLazyTree()
    await run(['complete', '--', 'deploy', '--'], tree, [
      i18n({ locale: 'ja-JP' }),
      completion({ config: lazyConfig })
    ])

    expect(output).toEqual([...GLOBAL_OPTION_LINES, '--target\tデプロイ先', ':4'])
  })

  test('completes a lazy command without a definition', async () => {
    const tree = createLazyTree()
    await run(['complete', '--', 'bare', '--'], tree)

    expect(output).toEqual([...GLOBAL_OPTION_LINES, '--output\tOutput file', ':4'])
    expect(tree.loaded).toEqual(['bare'])
  })

  test('does not run the loader of a command that defines its arguments', async () => {
    const tree = createLazyTree()
    await run(['complete', '--', 'build', '--'], tree)

    expect(output).toEqual([...GLOBAL_OPTION_LINES, '--watch\tWatch for changes', ':4'])
    expect(tree.loaded).toEqual([])
  })

  test('does not run the loaders of the candidates at the cursor', async () => {
    const tree = createLazyTree()
    await run(['complete', '--', 'b'], tree)

    // a candidate is described by its definition, like the commands that the usage lists
    expect(output).toEqual(['build\tBuild the project', 'bare\t', 'broken\tBroken loader', ':4'])
    // the entry command is the one being completed, as it can have positional arguments
    expect(tree.loaded).toEqual(['entry'])
  })

  test('does not run the loader of a command that is followed by its sub-command', async () => {
    const tree = createLazyTree()
    await run(['complete', '--', 'remote', 'add', '--'], tree)

    expect(output).toEqual([...GLOBAL_OPTION_LINES, '--url\tRemote URL', ':4'])
    expect(tree.loaded).toEqual(['remote add'])
  })

  test('runs the loader of a command that is followed by an option', async () => {
    const tree = createLazyTree()
    await run(['complete', '--', 'remote', '--verbose', ''], tree)

    expect(tree.loaded).toEqual(['remote'])
  })

  test('completes the sub-commands and the arguments of a lazy command', async () => {
    const tree = createLazyTree()
    await run(['complete', '--', 'remote', ''], tree)
    expect(output).toEqual(['add\tAdd a remote', ':4'])
    expect(tree.loaded).toEqual(['remote'])

    output.length = 0
    tree.loaded.length = 0
    await run(['complete', '--', 'remote', 'add', ''], tree)
    expect(output).toEqual(['origin\t', ':4'])
    expect(tree.loaded).toEqual(['remote add'])
  })

  test('completes a lazy entry command', async () => {
    const tree = createLazyTree()
    await run(['complete', '--', '--'], tree)

    expect(output).toEqual([...GLOBAL_OPTION_LINES, '--config\tConfig file', ':4'])
    expect(tree.loaded).toEqual(['entry'])
  })

  test.each([
    ['throws', 'broken'],
    ['returns a command without a runner', 'norun']
  ])('falls back to the definition when the loader %s', async (_label, name) => {
    const tree = createLazyTree()
    await run(['complete', '--', name, '--'], tree)

    expect(output).toEqual([...GLOBAL_OPTION_LINES, ':4'])
    expect(tree.loaded).toEqual([name])
    // the shell is the one that receives the output, and not every shell discards stderr
    expect(warnSpy).not.toHaveBeenCalled()
    expect(errorSpy).not.toHaveBeenCalled()
  })

  test('generating a completion script runs no loader', async () => {
    const tree = createLazyTree()
    await run(['complete', 'zsh'], tree)

    expect(tree.loaded).toEqual([])
  })

  test('registerCompletion does not run the loader unless it is asked to', async () => {
    const tree = createLazyTree()
    const t = new RootCommand()
    const params = {
      t,
      name: 'deploy',
      cmd: tree.subCommands.get('deploy')!,
      config: lazyConfig.subCommands ?? {},
      i18nPluginId
    }

    expect((await registerCompletion(params)).options.size).toEqual(0)
    expect(
      (await registerCompletion({ ...params, load: true, shallow: true })).options.size
    ).toEqual(0)
    expect(tree.loaded).toEqual([])

    expect([...(await registerCompletion({ ...params, load: true })).options.keys()]).toEqual([
      'target'
    ])
    expect(tree.loaded).toEqual(['deploy'])
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
      ...GLOBAL_OPTION_LINES,
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

  test('completes after a boolean option of the entry command', async () => {
    const entry = defineCommand({
      name: 'deploy',
      description: 'Deploy the app',
      args: {
        ...args,
        verbose: { type: 'boolean', short: 'V', description: 'Verbose output' },
        force: { type: 'boolean', negatable: true, description: 'Force' },
        target: { type: 'positional', description: 'Deploy target' }
      },
      run: NOOP
    })
    const config: NonNullable<CompletionOptions['config']> = {
      entry: { args: { target: { handler: () => [{ value: 'staging', description: 'Staging' }] } } }
    }

    await cli(['complete', '--', '--verbose', ''], entry, {
      name: 'mycli',
      version: '0.0.0',
      usageSilent: true,
      plugins: [completion({ config })]
    })

    expect(output).toEqual(['staging\tStaging', ':4'])

    // the negatable form takes no value either, and is offered with the other options
    output.length = 0
    await cli(['complete', '--', '--no-force', ''], entry, {
      name: 'mycli',
      version: '0.0.0',
      usageSilent: true,
      plugins: [completion({ config })]
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
      ...GLOBAL_OPTION_LINES,
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
      ...GLOBAL_OPTION_LINES,
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

// ---------------------------------------------------------------------------
// `toKebab`: the option names that gunshi parses and renders are kebab-cased
// ---------------------------------------------------------------------------

describe('toKebab', () => {
  let output: string[] = []

  beforeEach(() => {
    output = []
    vi.spyOn(console, 'log').mockImplementation((...values: unknown[]) => {
      output.push(values.map(value => String(value)).join(' '))
    })
  })

  const args = {
    dryRun: { type: 'boolean', negatable: true, description: 'Dry run' },
    logLevel: { type: 'string', short: 'l', description: 'Log level' },
    target: { type: 'positional', description: 'Deploy target' }
  } as const

  // `toKebab` of the command
  const deploy = defineCommand({
    name: 'deploy',
    description: 'Deploy the app',
    toKebab: true,
    args,
    run: NOOP
  })

  // `toKebab` of the argument schema, which converts that argument only
  const build = defineCommand({
    name: 'build',
    description: 'Build the app',
    args: {
      dryRun: { type: 'boolean', toKebab: true, description: 'Dry run' },
      logLevel: { type: 'string', description: 'Log level' }
    },
    run: NOOP
  })

  const remote = defineCommand({
    name: 'remote',
    description: 'Manage remotes',
    toKebab: true,
    args: { dryRun: { type: 'boolean', description: 'Dry run' } },
    subCommands: {
      add: defineCommand({ name: 'add', description: 'Add a remote', run: NOOP })
    },
    run: NOOP
  })

  // the configuration is keyed by the argument, not by the option name
  const kebabConfig: NonNullable<CompletionOptions['config']> = {
    subCommands: {
      deploy: {
        args: {
          logLevel: { handler: () => [{ value: 'debug', description: 'Debug' }] },
          target: { handler: () => [{ value: 'staging', description: 'Staging' }] }
        }
      }
    }
  }

  // the options that the plugins of `cli` add to every command are not what these tests are about
  const GLOBAL_OPTIONS = /^--(?:help|version)\t/

  async function complete(
    request: string[],
    subCommands: Record<string, Command | LazyCommand> = { deploy, build, remote },
    plugins = [completion({ config: kebabConfig })]
  ): Promise<string[]> {
    output.length = 0
    await cli(['complete', '--', ...request], defineCommand({ name: 'main', run: NOOP }), {
      name: 'mycli',
      version: '0.0.0',
      usageSilent: true,
      subCommands,
      plugins
    })
    return output.filter(line => !GLOBAL_OPTIONS.test(line))
  }

  test('suggests the names that gunshi accepts', async () => {
    expect(await complete(['deploy', '--'])).toEqual([
      '--dry-run\tDry run',
      '--no-dry-run\tNegatable of --dry-run',
      '--log-level\tLog level',
      ':4'
    ])
  })

  test('`toKebab` of an argument converts that argument only', async () => {
    expect(await complete(['build', '--'])).toEqual([
      '--dry-run\tDry run',
      '--logLevel\tLog level',
      ':4'
    ])
  })

  test('completes a prefix that is typed in kebab-case', async () => {
    expect(await complete(['deploy', '--dry-'])).toEqual(['--dry-run\tDry run', ':4'])
    expect(await complete(['deploy', '--no-d'])).toEqual([
      '--no-dry-run\tNegatable of --dry-run',
      ':4'
    ])
  })

  test('completes the value with the handler that is configured by the argument key', async () => {
    expect(await complete(['deploy', '--log-level', ''])).toEqual(['debug\tDebug', ':4'])
    expect(await complete(['deploy', '--log-level='])).toEqual(['debug\tDebug', ':4'])
    expect(await complete(['deploy', '-l', ''])).toEqual(['debug\tDebug', ':4'])
  })

  test('typed boolean option does not consume the next word', async () => {
    // a positional argument of the command
    expect(await complete(['deploy', '--dry-run', ''])).toEqual(['staging\tStaging', ':4'])
    expect(await complete(['deploy', '--no-dry-run', ''])).toEqual(['staging\tStaging', ':4'])
    // a sub-command of the command
    expect(await complete(['remote', '--dry-run', ''])).toEqual(['add\tAdd a remote', ':4'])
  })

  test('localizes the descriptions by the argument key', async () => {
    const localized = defineCommand({
      ...deploy,
      resource: () =>
        Promise.resolve({
          description: 'アプリをデプロイ',
          'arg:dryRun': 'ドライラン',
          'arg:no-dryRun': 'ドライランを無効にする',
          'arg:logLevel': 'ログレベル',
          'arg:target': 'デプロイ先'
        })
    })

    expect(
      await complete(['deploy', '--'], { deploy: localized }, [
        i18n({ locale: 'ja-JP' }),
        completion()
      ])
    ).toEqual([
      '--dry-run\tドライラン',
      '--no-dry-run\tドライランを無効にする',
      '--log-level\tログレベル',
      ':4'
    ])
  })

  test('lazy command follows the `toKebab` that gunshi resolves for it', async () => {
    const lazyDeploy = lazy(() => NOOP, {
      name: 'deploy',
      description: 'Deploy the app',
      toKebab: true,
      args
    })

    expect(await complete(['deploy', '--'], { deploy: lazyDeploy })).toEqual([
      '--dry-run\tDry run',
      '--no-dry-run\tNegatable of --dry-run',
      '--log-level\tLog level',
      ':4'
    ])
    expect(await complete(['deploy', '--log-level', ''], { deploy: lazyDeploy })).toEqual([
      'debug\tDebug',
      ':4'
    ])
  })

  test('every suggested option is an option that gunshi parses', async () => {
    // [the command, the arguments that it requires besides the option]
    const commands = [
      ['deploy', deploy, ['staging']],
      ['build', build, []]
    ] as const

    for (const [name, definition, required] of commands) {
      const candidates = (await complete([name, '--']))
        .map(line => line.split('\t')[0])
        .filter(candidate => candidate.startsWith('--'))
      expect(candidates.length).toBeGreaterThan(0)

      for (const candidate of candidates) {
        let values: Record<string, unknown> | undefined
        const command = defineCommand({
          ...definition,
          run: ctx => {
            values = ctx.values
          }
        })
        const isFlag = candidate.endsWith('dry-run')

        // `strict` rejects an option that the command does not declare
        await cli(
          [name, ...required, ...(isFlag ? [candidate] : [candidate, 'debug'])],
          defineCommand({ name: 'main', run: NOOP }),
          { name: 'mycli', usageSilent: true, strict: true, subCommands: { [name]: command } }
        )

        expect(values, candidate).toHaveProperty(isFlag ? 'dryRun' : 'logLevel')
      }
    }
  })
})

describe('hidden', () => {
  let output: string[] = []

  beforeEach(() => {
    output = []
    vi.spyOn(console, 'log').mockImplementation((...values: unknown[]) => {
      output.push(values.map(value => String(value)).join(' '))
    })
  })

  // a plugin that adds one hidden and one visible global option
  const globals = plugin({
    id: 'test:globals',
    name: 'globals',
    setup: ctx => {
      ctx.addGlobalOption('secretGlobal', {
        type: 'boolean',
        description: 'Secret global',
        hidden: true
      })
      ctx.addGlobalOption('visibleGlobal', { type: 'boolean', description: 'Visible global' })
    }
  })

  const deploy = defineCommand({
    name: 'deploy',
    description: 'Deploy the app',
    args: {
      target: { type: 'positional', description: 'Target' },
      legacyTarget: { type: 'positional', description: 'Legacy target', hidden: true },
      extra: { type: 'positional', description: 'Extra', required: false },
      output: { type: 'string', description: 'Output file' },
      legacyMode: { type: 'boolean', description: 'Deprecated flag', hidden: true },
      legacyQuiet: { type: 'boolean', short: 'Q', description: 'Deprecated quiet', hidden: true },
      legacyLevel: { type: 'string', short: 'L', description: 'Deprecated level', hidden: true },
      legacyForce: {
        type: 'boolean',
        negatable: true,
        description: 'Deprecated force',
        hidden: true
      },
      force: { type: 'boolean', negatable: true, description: 'Force' }
    },
    run: NOOP
  })

  // a command with sub-commands and a hidden boolean option of its own
  const remote = defineCommand({
    name: 'remote',
    description: 'Manage remotes',
    args: {
      legacyMode: { type: 'boolean', description: 'Deprecated flag', hidden: true },
      legacyQuiet: { type: 'boolean', short: 'Q', description: 'Deprecated quiet', hidden: true }
    },
    subCommands: { add: defineCommand({ name: 'add', description: 'Add a remote', run: NOOP }) },
    run: NOOP
  })

  const hiddenConfig: NonNullable<CompletionOptions['config']> = {
    subCommands: {
      deploy: {
        args: {
          target: { handler: () => [{ value: 'prod' }] },
          legacyTarget: { handler: () => [{ value: 'legacy-a' }] },
          extra: { handler: () => [{ value: 'extra-1' }] },
          output: { handler: () => [{ value: 'dist' }] },
          legacyLevel: { handler: () => [{ value: 'trace' }] }
        }
      }
    }
  }

  async function complete(request: string[]): Promise<string[]> {
    output.length = 0
    await cli(['complete', '--', ...request], defineCommand({ name: 'main', run: NOOP }), {
      name: 'mycli',
      version: '0.0.0',
      usageSilent: true,
      subCommands: { deploy, remote },
      plugins: [globals, completion({ config: hiddenConfig })]
    })
    // a copy, so that two requests can be compared with each other
    return [...output]
  }

  test('a hidden option is not among the candidates', async () => {
    const candidates = await complete(['deploy', '--'])
    expect(candidates).toEqual([
      '--help\tDisplay this help message',
      '--version\tDisplay this version',
      '--visibleGlobal\tVisible global',
      '--output\tOutput file',
      '--force\tForce',
      '--no-force\tNegatable of --force',
      ':4'
    ])
  })

  test('a hidden option is not completed from a typed prefix, long or short', async () => {
    expect(await complete(['deploy', '--legacy'])).toEqual([':4'])
    expect(await complete(['deploy', '--no-le'])).toEqual([':4'])
    expect(await complete(['deploy', '-'])).toEqual([
      '-h\tDisplay this help message',
      '-v\tDisplay this version',
      ':4'
    ])
  })

  test('a hidden global option is not among the candidates', async () => {
    expect(await complete(['--'])).toEqual([
      '--help\tDisplay this help message',
      '--version\tDisplay this version',
      '--visibleGlobal\tVisible global',
      ':4'
    ])
  })

  test('a hidden option completes no value', async () => {
    expect(await complete(['deploy', '--legacyLevel', ''])).toEqual([':4'])
    expect(await complete(['deploy', '-L', ''])).toEqual([':4'])
    // the visible one still does
    expect(await complete(['deploy', '--output', ''])).toEqual(['dist\t', ':4'])
  })

  test('a typed hidden boolean option does not consume the next word', async () => {
    // the arity of a hidden option is still known, which is what #710 was about
    expect(await complete(['deploy', '--legacyMode', ''])).toEqual(['prod\t', ':4'])
    expect(await complete(['deploy', '--no-legacyForce', ''])).toEqual(['prod\t', ':4'])
  })

  test('a typed hidden option that takes a value consumes exactly one word', async () => {
    expect(await complete(['deploy', '--legacyLevel', 'trace', ''])).toEqual(['prod\t', ':4'])
    expect(await complete(['deploy', '-L', 'trace', ''])).toEqual(['prod\t', ':4'])
  })

  test('a hidden positional completes no value, and keeps the place of the next one', async () => {
    expect(await complete(['deploy', 'prod', ''])).toEqual([':4'])
    expect(await complete(['deploy', 'prod', 'legacy-a', ''])).toEqual(['extra-1\t', ':4'])
  })

  test('a typed hidden boolean option does not stop the completion of commands', async () => {
    // the walk that decides which commands to register mirrors `RootCommand#stripOptions`,
    // so it has to know the arity of a hidden option too (#710)
    expect(await complete(['remote', '--legacyMode', ''])).toEqual(['add\tAdd a remote', ':4'])
    expect(await complete(['--secretGlobal', ''])).toEqual([
      'deploy\tDeploy the app',
      'remote\tManage remotes',
      ':4'
    ])
  })

  test('a typed hidden boolean option does not hide the options of the command behind it', async () => {
    expect(await complete(['--secretGlobal', 'deploy', '--'])).toEqual(
      await complete(['deploy', '--'])
    )
  })

  test('the short name of a hidden boolean option keeps its arity', async () => {
    // the short name is registered on the holder as well, or `stripOptions` cannot look `-Q` up
    expect(await complete(['deploy', '-Q', ''])).toEqual(['prod\t', ':4'])
    expect(await complete(['deploy', '-Q', 'prod', ''])).toEqual([':4'])
    expect(await complete(['remote', '-Q', ''])).toEqual(['add\tAdd a remote', ':4'])
  })

  test('a request that starts with an empty word does not match the holder', async () => {
    // the holder is named with the empty string, and `RootCommand#matchCommand` would match it
    expect(await complete(['', '--'])).toEqual([
      '--help\tDisplay this help message',
      '--version\tDisplay this version',
      '--visibleGlobal\tVisible global',
      ':4'
    ])
    expect(await complete(['', 'deploy', '--'])).toEqual(await complete(['deploy', '--']))
  })
})

describe("#730 - a command's own short name", () => {
  let output: string[] = []

  beforeEach(() => {
    output = []
    vi.spyOn(console, 'log').mockImplementation((...values: unknown[]) => {
      output.push(values.map(value => String(value)).join(' '))
    })
  })

  const build = defineCommand({
    name: 'build',
    description: 'Build the app',
    args: { verbose: { type: 'boolean', short: 'v', description: 'Verbose output' } },
    run: NOOP
  })
  const serve = defineCommand({
    name: 'serve',
    description: 'Serve the app',
    args: { host: { type: 'string', short: 'h', description: 'Host name' } },
    run: NOOP
  })

  async function complete(request: string[]): Promise<string[]> {
    output.length = 0
    await cli(['complete', '--', ...request], defineCommand({ name: 'main', run: NOOP }), {
      name: 'mycli',
      version: '0.0.0',
      usageSilent: true,
      subCommands: { build, serve },
      plugins: [completion()]
    })
    return output
  }

  test('the short name completes the argument of the command, not the global option', async () => {
    expect(await complete(['build', '-'])).toEqual([
      '-h\tDisplay this help message',
      '-v\tVerbose output',
      ':4'
    ])
    expect(await complete(['serve', '-'])).toEqual([
      '-v\tDisplay this version',
      '-h\tHost name',
      ':4'
    ])
  })

  test('the long names are all still offered', async () => {
    expect(await complete(['build', '--'])).toEqual([
      '--help\tDisplay this help message',
      '--version\tDisplay this version',
      '--verbose\tVerbose output',
      ':4'
    ])
  })

  test('a command that claims no short name leaves the global ones alone', async () => {
    expect(await complete(['-'])).toEqual([
      '-h\tDisplay this help message',
      '-v\tDisplay this version',
      ':4'
    ])
  })
})

describe('#732 - an argument whose name starts with `no-`', () => {
  let output: string[] = []

  beforeEach(() => {
    output = []
    vi.spyOn(console, 'log').mockImplementation((...values: unknown[]) => {
      output.push(values.map(value => String(value)).join(' '))
    })
  })

  async function completeEntry(args: Args): Promise<string[]> {
    const entry = defineCommand({ name: 'main', description: 'Main', args, run: NOOP })
    await cli(['complete', '--', '--'], entry, {
      name: 'mycli',
      version: '0.0.0',
      usageSilent: true,
      plugins: [completion()]
    })
    return output
  }

  test('is offered with its own description', async () => {
    expect(
      await completeEntry({
        emoji: { type: 'string', description: 'Emoji style' },
        'no-emoji': { type: 'boolean', description: 'Disable emoji' }
      })
    ).toEqual([
      '--help\tDisplay this help message',
      '--version\tDisplay this version',
      '--emoji\tEmoji style',
      '--no-emoji\tDisable emoji',
      ':4'
    ])
  })

  test('the negated form of a negatable option is unchanged', async () => {
    expect(
      await completeEntry({
        force: { type: 'boolean', short: 'f', negatable: true, description: 'Force' }
      })
    ).toEqual([
      '--help\tDisplay this help message',
      '--version\tDisplay this version',
      '--force\tForce',
      '--no-force\tNegatable of -f, --force',
      ':4'
    ])
  })
})

describe("#731 - a negatable option's description with the i18n plugin", () => {
  let output: string[] = []

  beforeEach(() => {
    output = []
    vi.spyOn(console, 'log').mockImplementation((...values: unknown[]) => {
      output.push(values.map(value => String(value)).join(' '))
    })
  })

  const args = {
    force: { type: 'boolean', short: 'f', negatable: true, description: 'Force' },
    color: { type: 'boolean', negatable: true, description: 'Colorize output' },
    quiet: { type: 'boolean', description: 'Quiet' },
    target: { type: 'positional', description: 'Target' }
  } satisfies Record<string, ArgSchema>

  const build = defineCommand({
    name: 'build',
    description: 'Build the app',
    args,
    resource: resource('ビルドする', { force: '強制', color: '色を付ける' }),
    run: NOOP
  })

  // the same command, with a resource for the negated form of `force`
  const described = defineCommand({
    ...build,
    resource: resource('ビルドする', {
      force: '強制',
      'no-force': '強制しない',
      color: '色を付ける'
    })
  })

  // `toKebab`, so that the composed text has to be kebab-cased too
  const deploy = defineCommand({
    name: 'deploy',
    description: 'Deploy the app',
    toKebab: true,
    args: {
      dryRun: { type: 'boolean', short: 'd', negatable: true, description: 'Dry run' }
    },
    resource: resource('デプロイする', { dryRun: 'ドライラン' }),
    run: NOOP
  })

  // a plugin that adds a negatable global option, and a hidden one
  const globals = plugin({
    id: 'test:globals',
    name: 'globals',
    setup: ctx => {
      ctx.addGlobalOption('tty', { type: 'boolean', negatable: true, description: 'Use a TTY' })
      ctx.addGlobalOption('telemetry', {
        type: 'boolean',
        negatable: true,
        hidden: true,
        description: 'Send telemetry'
      })
    }
  })

  const config: NonNullable<CompletionOptions['config']> = {
    subCommands: { build: { args: { target: { handler: () => [{ value: 'prod' }] } } } }
  }

  // the built-in resources of a locale reach the CLI only when the user hands them over, which is
  // what makes `--help` and the composed text below speak that locale
  function localized(locale: string) {
    return i18n({ locale, builtinResources: { 'ja-JP': jaJPResource } })
  }

  async function complete(
    request: string[],
    subCommands: Record<string, Command> = { build, deploy },
    plugins = [localized('ja-JP'), completion({ config })]
  ): Promise<string[]> {
    output.length = 0
    await cli(['complete', '--', ...request], defineCommand({ name: 'main', run: NOOP }), {
      name: 'mycli',
      version: '0.0.0',
      usageSilent: true,
      subCommands,
      plugins
    })
    // a copy, so that two results can be compared (the next call clears the shared buffer)
    return [...output]
  }

  test('the negated form is described in the locale of the i18n plugin', async () => {
    expect(await complete(['build', '--'])).toEqual([
      '--help\tこのヘルプメッセージを表示',
      '--version\tこのバージョンを表示',
      '--force\t強制',
      '--no-force\t否定可能な -f, --force',
      '--color\t色を付ける',
      '--no-color\t否定可能な --color',
      '--quiet\tQuiet',
      ':4'
    ])
  })

  test('the built-in resource of the locale is used, not a text of its own', async () => {
    const english = await complete(['build', '--'], { build, deploy }, [
      localized('en-US'),
      completion({ config })
    ])
    const japanese = await complete(['build', '--'])

    expect(english).toContain('--no-force\tNegatable of -f, --force')
    expect(english).toContain('--no-color\tNegatable of --color')
    // the same CLI, and the same argument, described in the other locale
    expect(japanese).toContain('--no-force\t否定可能な -f, --force')
  })

  test('a resource of its own still wins', async () => {
    const candidates = await complete(['build', '--'], { build: described })

    expect(candidates).toContain('--no-force\t強制しない')
    // the one without a resource of its own still falls back to the composed text
    expect(candidates).toContain('--no-color\t否定可能な --color')
  })

  test('the composed text follows `toKebab`', async () => {
    expect(await complete(['deploy', '--'])).toContain('--no-dry-run\t否定可能な -d, --dry-run')
  })

  test('a negatable global option is described too', async () => {
    const candidates = await complete(['build', '--'], { build }, [
      globals,
      localized('ja-JP'),
      completion({ config })
    ])

    expect(candidates).toContain('--no-tty\t否定可能な --tty')
  })

  test('a hidden negatable global option stays hidden, and takes no value', async () => {
    const plugins = [globals, localized('ja-JP'), completion({ config })]

    // by name, because a leaked hidden option would carry an empty description, not this text
    expect(
      (await complete(['build', '--'], { build }, plugins)).some(candidate =>
        candidate.startsWith('--no-telemetry')
      )
    ).toBe(false)
    expect(await complete(['build', '--no-t'], { build }, plugins)).toEqual([
      '--no-tty\t否定可能な --tty',
      ':4'
    ])
    // a boolean option takes no value, so the word after it completes the positional (#710, #735)
    expect(await complete(['build', '--no-telemetry', ''], { build }, plugins)).toEqual([
      'prod\t',
      ':4'
    ])
  })

  test('without the i18n plugin, the candidates are what they always were', async () => {
    // the whole list, because nothing about a CLI without the plugin may change
    expect(await complete(['build', '--'], { build, deploy }, [completion({ config })])).toEqual([
      '--help\tDisplay this help message',
      '--version\tDisplay this version',
      '--force\tForce',
      '--no-force\tNegatable of -f, --force',
      '--color\tColorize output',
      '--no-color\tNegatable of --color',
      '--quiet\tQuiet',
      ':4'
    ])
  })

  test('an argument that owns the name of a negated form keeps its own description', async () => {
    // `no-cache` is an argument in its own right (#732), declared before the negatable `cache` so
    // that the negated form would overwrite it if the registration did not leave it alone
    const cache = defineCommand({
      name: 'cache',
      description: 'Cache',
      args: {
        'no-cache': { type: 'boolean', description: 'Skip the cache' },
        cache: { type: 'boolean', negatable: true, description: 'Use the cache' }
      },
      // no resource for `no-cache`, which is what sends the negated form down the fallback
      resource: resource('キャッシュ', { cache: 'キャッシュを使う' }),
      run: NOOP
    })

    const candidates = await complete(['cache', '--'], { cache })

    expect(candidates).toContain('--no-cache\tSkip the cache')
    expect(candidates).not.toContain('--no-cache\t否定可能な --cache')
  })
})

describe('#743 - `toKebab` brings two keys under one name', () => {
  let output: string[] = []

  beforeEach(() => {
    output = []
    vi.spyOn(console, 'log').mockImplementation((...values: unknown[]) => {
      output.push(values.map(value => String(value)).join(' '))
    })
  })

  const negatable = {
    type: 'boolean',
    short: 'd',
    negatable: true,
    description: 'Dry run'
  } satisfies ArgSchema

  async function complete(args: Args, toKebab = true): Promise<string[]> {
    output.length = 0
    const build = defineCommand({ name: 'build', description: 'Build', toKebab, args, run: NOOP })
    await cli(['complete', '--', 'build', '--'], defineCommand({ name: 'main', run: NOOP }), {
      name: 'mycli',
      version: '0.0.0',
      usageSilent: true,
      subCommands: { build },
      plugins: [completion()]
    })
    return output.filter(line => !/^--(?:help|version)\t/.test(line))
  }

  test.each([
    ['a camelCase key', 'noDryRun'],
    ['a key that is already kebab-case', 'no-dry-run'],
    ['a key that is the negated form as written', 'no-dryRun']
  ])('is offered once, described by the argument that owns it (%s)', async (_, own) => {
    expect(
      await complete({
        [own]: { type: 'boolean', description: 'Never run for real' },
        dryRun: negatable
      })
    ).toEqual(['--no-dry-run\tNever run for real', '--dry-run\tDry run', ':4'])
  })

  test('the order in which the two are declared makes no difference', async () => {
    expect(
      await complete({
        dryRun: negatable,
        noDryRun: { type: 'boolean', description: 'Never run for real' }
      })
    ).toEqual(['--dry-run\tDry run', '--no-dry-run\tNever run for real', ':4'])
  })

  test('a hidden argument owns the name too, so neither of them is offered', async () => {
    expect(
      await complete({
        noDryRun: { type: 'boolean', hidden: true, description: 'Never run for real' },
        dryRun: negatable
      })
    ).toEqual(['--dry-run\tDry run', ':4'])
  })

  test('without `toKebab` the two are different names, and both are offered', async () => {
    expect(
      await complete(
        {
          noDryRun: { type: 'boolean', description: 'Never run for real' },
          dryRun: negatable
        },
        false
      )
    ).toEqual([
      '--noDryRun\tNever run for real',
      '--dryRun\tDry run',
      '--no-dryRun\tNegatable of -d, --dryRun',
      ':4'
    ])
  })
})

describe('#744 - a short name that a global option also uses', () => {
  let output: string[] = []

  beforeEach(() => {
    output = []
    vi.spyOn(console, 'log').mockImplementation((...values: unknown[]) => {
      output.push(values.map(value => String(value)).join(' '))
    })
  })

  const args = {
    host: { type: 'string', short: 'h', description: 'Host name' },
    bind: { type: 'string', short: 'x', description: 'Bind address' },
    env: { type: 'positional', description: 'Environment' }
  } as const

  const handlers = {
    host: { handler: () => [{ value: 'localhost' }, { value: '0.0.0.0' }] },
    bind: { handler: () => [{ value: '127.0.0.1' }] },
    env: { handler: () => [{ value: 'prod' }, { value: 'staging' }] }
  }

  const serve = defineCommand({ name: 'serve', description: 'Serve the app', args, run: NOOP })
  const start = defineCommand({ name: 'start', description: 'Start', args, run: NOOP })
  const remote = defineCommand({
    name: 'remote',
    description: 'Remote',
    subCommands: { start },
    run: NOOP
  })
  const build = defineCommand({
    name: 'build',
    description: 'Build the app',
    args: {
      verbose: { type: 'boolean', short: 'v', description: 'Verbose output' },
      target: { type: 'positional', description: 'Target' }
    },
    run: NOOP
  })

  const config = {
    subCommands: {
      serve: { args: handlers },
      'remote start': { args: handlers },
      build: { args: { target: { handler: () => [{ value: 'dist' }] } } }
    }
  } as NonNullable<CompletionOptions['config']>

  async function complete(request: string[]): Promise<string[]> {
    output.length = 0
    await cli(['complete', '--', ...request], defineCommand({ name: 'main', run: NOOP }), {
      name: 'mycli',
      version: '0.0.0',
      usageSilent: true,
      subCommands: { serve, remote, build },
      plugins: [completion({ config })]
    })
    return output
  }

  test('the word behind the short name completes the value of the argument', async () => {
    expect(await complete(['serve', '-h', ''])).toEqual(['localhost\t', '0.0.0.0\t', ':4'])
  })

  test('a value typed there is counted as the value, not as the positional', async () => {
    expect(await complete(['serve', '-h', 'localhost', ''])).toEqual(['prod\t', 'staging\t', ':4'])
  })

  test('a short name no global option uses is unchanged', async () => {
    expect(await complete(['serve', '-x', ''])).toEqual(['127.0.0.1\t', ':4'])
    expect(await complete(['serve', '-x', '127.0.0.1', ''])).toEqual(['prod\t', 'staging\t', ':4'])
  })

  test('the long name is unchanged', async () => {
    expect(await complete(['serve', '--host', ''])).toEqual(['localhost\t', '0.0.0.0\t', ':4'])
  })

  test('the list of short names is unchanged', async () => {
    expect(await complete(['serve', '-'])).toEqual([
      '-v\tDisplay this version',
      '-h\tHost name',
      '-x\tBind address',
      ':4'
    ])
  })

  test('the same letter in front of a command name still means the global option', async () => {
    // the alignment must not reach a `-h` that was typed before the command that claims the letter
    expect(await complete(['-h', ''])).toEqual([
      'serve\tServe the app',
      'remote\tRemote',
      'build\tBuild the app',
      ':4'
    ])
    expect(await complete(['-h', 'serve', ''])).toEqual(['prod\t', 'staging\t', ':4'])
  })

  test('a nested command is aligned as well', async () => {
    expect(await complete(['remote', 'start', '-h', ''])).toEqual([
      'localhost\t',
      '0.0.0.0\t',
      ':4'
    ])
    expect(await complete(['remote', 'start', '-h', 'localhost', ''])).toEqual([
      'prod\t',
      'staging\t',
      ':4'
    ])
  })

  test('a command that claims no such short name is unchanged', async () => {
    expect(await complete(['remote', '-h', ''])).toEqual(['start\tStart', ':4'])
  })

  test('a short name that both sides take no value under is unchanged', async () => {
    // `verbose` and the global `version` are both boolean, so there is nothing to align
    expect(await complete(['build', '-v', ''])).toEqual(['dist\t', ':4'])
  })
})
