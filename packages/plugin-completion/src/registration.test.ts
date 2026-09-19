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
    load: true
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
      load: true
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

    expect(output).toEqual(['--target\tDeploy target', ':4'])
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

    expect(output).toEqual(['--target\tデプロイ先', ':4'])
  })

  test('completes a lazy command without a definition', async () => {
    const tree = createLazyTree()
    await run(['complete', '--', 'bare', '--'], tree)

    expect(output).toEqual(['--output\tOutput file', ':4'])
    expect(tree.loaded).toEqual(['bare'])
  })

  test('does not run the loader of a command that defines its arguments', async () => {
    const tree = createLazyTree()
    await run(['complete', '--', 'build', '--'], tree)

    expect(output).toEqual(['--watch\tWatch for changes', ':4'])
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

    expect(output).toEqual(['--url\tRemote URL', ':4'])
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

    expect(output).toEqual(['--config\tConfig file', ':4'])
    expect(tree.loaded).toEqual(['entry'])
  })

  test.each([
    ['throws', 'broken'],
    ['returns a command without a runner', 'norun']
  ])('falls back to the definition when the loader %s', async (_label, name) => {
    const tree = createLazyTree()
    await run(['complete', '--', name, '--'], tree)

    expect(output).toEqual([':4'])
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
