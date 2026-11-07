/**
 * The guide for coding agents that the gunshi package ships (`packages/gunshi/AGENTS.md`).
 *
 * Coding agents copy the example of the guide and follow its rules, so the example must type-check and run as the
 * guide says, and the rules must be true of the built package. These tests write small CLIs into a temporary
 * directory, with `node_modules/gunshi` linked to `packages/gunshi`, and run them with Node.js, so run `pnpm build` first.
 */

import { spawnSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync
} from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

const ROOT = path.resolve(import.meta.dirname, '..')
const GUNSHI = path.join(ROOT, 'packages', 'gunshi')
const GUIDE = path.join(GUNSHI, 'AGENTS.md')
const TSC = path.join(ROOT, 'node_modules', '.bin', 'tsc')
const TSC_OPTIONS = [
  '--noEmit',
  '--strict',
  '--module',
  'nodenext',
  '--moduleResolution',
  'nodenext',
  '--target',
  'es2022',
  '--types',
  'node',
  '--skipLibCheck'
]

interface Result {
  code: number | null
  stdout: string
  stderr: string
}

let dir = ''

/**
 * Run a file of the temporary directory with Node.js.
 *
 * @param file - The file name in the temporary directory
 * @param args - The arguments of the CLI
 * @param env - The environment variables, instead of the ones of this process
 * @returns The exit code and the output
 */
function run(file: string, args: string[] = [], env: NodeJS.ProcessEnv = process.env): Result {
  const result = spawnSync(process.execPath, [file, ...args], { cwd: dir, encoding: 'utf8', env })
  return { code: result.status, stdout: result.stdout, stderr: result.stderr }
}

/**
 * Write a file into the temporary directory.
 *
 * @param name - The file name
 * @param source - The content
 * @returns The file name
 */
function write(name: string, source: string): string {
  writeFileSync(path.join(dir, name), source)
  return name
}

/**
 * The environment variables of this process, with some added or removed.
 *
 * @param changes - The variables to set, or to remove with `undefined`
 * @returns The environment variables
 */
function envWith(changes: Record<string, string | undefined>): NodeJS.ProcessEnv {
  const env = { ...process.env }
  for (const [name, value] of Object.entries(changes)) {
    if (value === undefined) {
      delete env[name]
    } else {
      env[name] = value
    }
  }
  return env
}

/**
 * Whether the output has a stack trace.
 *
 * @param output - The output of a CLI
 * @returns `true` when a line of the output is a frame of a stack trace
 */
function hasStackTrace(output: string): boolean {
  return /\n\s+at /.test(output)
}

/**
 * Type-check files of the temporary directory with tsc, as the example of the guide is type-checked.
 *
 * @param files - The file names in the temporary directory
 * @returns The whole output of tsc, and the errors of each file
 */
function typeCheck(files: string[]): { output: string; errors: Record<string, string> } {
  const result = spawnSync(TSC, [...TSC_OPTIONS, ...files], { cwd: dir, encoding: 'utf8' })
  const output = `${result.stdout}${result.stderr}`
  const errors: Record<string, string> = {}
  let file = ''
  for (const line of output.split('\n')) {
    file = /^(\S+\.ts)\(\d+,\d+\): error /.exec(line)?.[1] ?? file
    if (file) {
      errors[file] = `${errors[file] ?? ''}${line}\n`
    }
  }
  return { output, errors }
}

/**
 * The error that a CLI printed with `--json`, as one line of JSON to stderr.
 *
 * @param result - The result of the CLI
 * @returns The error
 */
function jsonFailure(result: Result): {
  status: string
  reason: string
  message: string
  next?: { command: string; argv: string[] }[]
} {
  expect(result.stderr).toMatch(/^[^\n]+\n$/)
  return JSON.parse(result.stderr) as ReturnType<typeof jsonFailure>
}

/**
 * A CLI with a sub-command `add` that prints its values.
 *
 * @param args - The `args` of `add`, as source code
 * @param extra - More options of `cli()`, as source code that starts with a comma
 * @returns The source code of the CLI
 */
function withAdd(args: string, extra = ''): string {
  return `import { cli, define } from 'gunshi'
const add = define({ name: 'add', args: ${args}, run: ctx => console.log(JSON.stringify(ctx.values)) })
const main = define({ name: 'todo', run: () => console.log('main') })
const result = await cli(process.argv.slice(2), main, { name: 'todo', version: '1.0.0', subCommands: { add } ${extra} })
if (process.env.SHOW) console.error('returned:' + JSON.stringify(result))
`
}

/**
 * A CLI with a command `tag` that groups the sub-command `add`.
 *
 * @param groupRun - The `run` of `tag`, as source code that starts with a comma, or nothing
 * @returns The source code of the CLI
 */
function withGroup(groupRun = ''): string {
  return `import { cli, define } from 'gunshi'
const add = define({ name: 'add', args: { url: { type: 'positional' } }, run: ctx => console.log('add ' + ctx.values.url) })
const tag = define({ name: 'tag', description: 'Manage tags', subCommands: { add } ${groupRun} })
const main = define({ name: 'bm', run: () => console.log('main') })
await cli(process.argv.slice(2), main, { name: 'bm', version: '1.0.0', subCommands: { tag } })
`
}

beforeAll(() => {
  if (!existsSync(path.join(GUNSHI, 'lib', 'index.js'))) {
    throw new Error('packages/gunshi/lib/index.js is not found. Run `pnpm build` first.')
  }
  dir = mkdtempSync(path.join(os.tmpdir(), 'gunshi-agents-guide-'))
  mkdirSync(path.join(dir, 'node_modules'))
  symlinkSync(GUNSHI, path.join(dir, 'node_modules', 'gunshi'))
  symlinkSync(path.join(ROOT, 'node_modules', '@types'), path.join(dir, 'node_modules', '@types'))
  writeFileSync(path.join(dir, 'package.json'), '{ "type": "module" }\n')
  const example = /```ts\n([\s\S]*?)\n```/.exec(readFileSync(GUIDE, 'utf8'))
  if (!example) {
    throw new Error('AGENTS.md has no ts code block')
  }
  writeFileSync(path.join(dir, 'ship.ts'), `${example[1]}\n`)
})

afterAll(() => {
  if (dir) {
    rmSync(dir, { recursive: true, force: true })
  }
})

describe('the example of AGENTS.md', () => {
  test('type-checks', () => {
    const result = spawnSync(TSC, [...TSC_OPTIONS, 'ship.ts'], { cwd: dir, encoding: 'utf8' })
    expect(result.status, `${result.stdout}${result.stderr}`).toBe(0)
  })

  const cases: [string[], number, RegExp, RegExp | ''][] = [
    [[], 0, /Run `ship --help`/, ''],
    [['--help'], 0, /USAGE:\n {2}ship \[COMMANDS\]/, ''],
    [
      ['deploy', '--help'],
      0,
      /^(?=[\s\S]*--json)(?=[\s\S]*--dry-run)(?=[\s\S]*choices: dev \| prod)/,
      ''
    ],
    [['--version'], 0, /^1\.0\.0\n$/, ''],
    [['deploy', 'api'], 0, /^Deployed api to dev\n$/, ''],
    [
      ['deploy', 'api', '--json'],
      0,
      /^\{"deployment":\{"service":"api","target":"dev","dryRun":false,"config":"ship.json"\}\}\n$/,
      ''
    ],
    [
      ['deploy', 'api', '-t', 'prod', '--dry-run', '--config', 'x.json', '--json'],
      0,
      /^\{"deployment":\{"service":"api","target":"prod","dryRun":true,"config":"x.json"\}\}\n$/,
      ''
    ],
    [['deploy', 'api', '--unknown'], 0, /^Deployed api to dev\n$/, ''],
    [['deploy', 'api', '--target', 'qa'], 1, /^$/, /--target/],
    [
      ['deploy', 'api', '--target', 'qa', '--json'],
      1,
      /^$/,
      /^\{"status":"action_required","reason":"invalid_choice",.*\}\n$/
    ],
    [['rollback', '3'], 0, /^Rolled back to release 3\n$/, ''],
    [['rollback', '0'], 1, /^$/, /Integer must be >= 1/],
    [['rollback', '11'], 1, /^$/, /^Release 11 not found\n$/],
    [
      ['rollback', '11', '--json'],
      1,
      /^$/,
      /^\{"status":"action_required","reason":"json_not_supported",.*\}\n$/
    ],
    [['rollback', 'abc'], 1, /^$/, /Expected an integer/],
    [['frobnicate'], 1, /^$/, /Command not found: frobnicate/]
  ]

  test.each(cases)('ship %j', (args, code, stdout, stderr) => {
    const result = run('ship.ts', args)
    expect(result.code).toBe(code)
    expect(result.stdout).toMatch(stdout)
    if (stderr === '') {
      expect(result.stderr).toBe('')
    } else {
      expect(result.stderr).toMatch(stderr)
    }
    expect(hasStackTrace(result.stderr)).toBe(false)
  })
})

describe('the rules of AGENTS.md', () => {
  test('gunshi/bone has no --help, no --version and no --json', () => {
    const file = write(
      'bone.mjs',
      `import { cli } from 'gunshi/bone'
import { define, jsonArgs } from 'gunshi'
await cli(process.argv.slice(2), define({ name: 'x', args: { ...jsonArgs }, run: () => ({ item: 1 }) }), { name: 'x', version: '1.0.0' })
`
    )
    const help = run(file, ['--help'])
    const version = run(file, ['--version'])
    expect(help).toMatchObject({ code: 0, stdout: '' })
    expect(version.stdout).toBe('')
    expect(run(file, ['--json'])).toEqual({ code: 0, stdout: '', stderr: '' })
  })

  test('a positional argument is required unless it has required: false', () => {
    const file = write(
      'positional.mjs',
      withAdd(`{ title: { type: 'positional' }, note: { type: 'positional', required: false } }`)
    )
    const missing = run(file, ['add'])
    expect(missing.code).toBe(1)
    expect(missing.stderr).toMatch(/title/)
    expect(run(file, ['add', 'milk']).stdout).toBe('{"title":"milk"}\n')
  })

  test('an option is named after its key, or in kebab-case with toKebab', () => {
    const file = write(
      'kebab.mjs',
      withAdd(`{ dryRun: { type: 'boolean', toKebab: true }, keepGoing: { type: 'boolean' } }`)
    )
    expect(run(file, ['add', '--dry-run', '--keepGoing']).stdout).toBe(
      '{"dryRun":true,"keepGoing":true}\n'
    )
  })

  test('an argument that is not positional is an option: a required --name', () => {
    const file = write(
      'option-not-positional.mjs',
      withAdd(`{ name: { type: 'string', required: true } }`)
    )
    const missing = run(file, ['add'])
    expect(missing.code).toBe(1)
    expect(missing.stderr).toMatch(/--name/)
    expect(run(file, ['add', 'x']).code).toBe(1)
    expect(run(file, ['add', '--name', 'x']).stdout).toBe('{"name":"x"}\n')
  })

  test('positional() alone is a string, and a combinator is the whole schema', () => {
    const file = write(
      'combinator.mjs',
      `import { cli, define } from 'gunshi'
import { describe, integer, positional } from 'gunshi/combinators'
const add = define({ name: 'add', args: { title: describe(positional(), 'The title'), id: positional(integer({ min: 1 })) }, run: ctx => console.log(JSON.stringify(ctx.values)) })
await cli(process.argv.slice(2), add, { name: 'add' })
`
    )
    expect(run(file, ['milk', '2']).stdout).toBe('{"title":"milk","id":2}\n')
    expect(run(file, ['--help']).stdout).toMatch(/title\s+The title/)
  })

  test('subCommands is an object, a Map or an array', () => {
    const object = write('subcommands-object.mjs', withAdd('{}'))
    const map = write(
      'subcommands-map.mjs',
      `import { cli, define } from 'gunshi'
const add = define({ name: 'add', run: () => console.log('add') })
await cli(process.argv.slice(2), define({ name: 'todo', run: () => console.log('main') }), { subCommands: new Map([['add', add]]) })
`
    )
    const array = write(
      'subcommands-array.mjs',
      `import { cli, define } from 'gunshi'
const add = define({ name: 'add', run: () => console.log('add') })
await cli(process.argv.slice(2), define({ name: 'todo', run: () => console.log('main') }), { subCommands: [add] })
`
    )
    expect(run(object, ['add']).stdout).toBe('{}\n')
    expect(run(map, ['add']).stdout).toBe('add\n')
    expect(run(array, ['add']).stdout).toBe('add\n')
  })

  test('the command given to cli() runs when no command is given', () => {
    const file = write('entry.mjs', withAdd('{}'))
    expect(run(file).stdout).toBe('main\n')
  })

  test('a command can have its own subCommands', () => {
    const file = write('group.mjs', withGroup())
    expect(run(file, ['tag', 'add', 'u'])).toMatchObject({ code: 0, stdout: 'add u\n' })
  })

  test('a command without run prints nothing when it is run by itself', () => {
    const file = write('group-without-run.mjs', withGroup())
    expect(run(file, ['tag'])).toEqual({ code: 0, stdout: '', stderr: '' })
  })

  test('a command that groups sub-commands can say how to use them in its run', () => {
    const file = write(
      'group-with-run.mjs',
      withGroup(", run: () => console.log('Run `bm tag --help` to see the commands')")
    )
    expect(run(file, ['tag']).stdout).toBe('Run `bm tag --help` to see the commands\n')
    expect(run(file, ['tag', 'add', 'u']).stdout).toBe('add u\n')
  })

  test('the sub-commands do not see the args of the main command', () => {
    const file = write(
      'own-args.mjs',
      `import { cli, define } from 'gunshi'
const add = define({ name: 'add', run: ctx => console.log(JSON.stringify(ctx.values)) })
const main = define({ name: 'todo', args: { file: { type: 'string' } }, run: () => {} })
await cli(process.argv.slice(2), main, { subCommands: { add } })
`
    )
    expect(run(file, ['add', '--file', 'a.json']).stdout).toBe('{}\n')
  })

  test('an option that a command does not declare is ignored, unless strict: true', () => {
    const file = write('strict.mjs', withAdd('{}', ", strict: process.env.STRICT === '1'"))
    expect(run(file, ['add', '--file', 'a.json'])).toMatchObject({ code: 0, stdout: '{}\n' })
    const strict = run(file, ['add', '--file', 'a.json'], envWith({ STRICT: '1' }))
    expect(strict.code).toBe(1)
    expect(strict.stderr).toMatch(/Unknown option: --file/)
  })

  test('--json is not ignored: a command without jsonArgs stops before it runs, with or without strict', () => {
    const file = write(
      'json-not-supported.mjs',
      withAdd('{}', ", strict: process.env.STRICT === '1'")
    )
    for (const strict of ['', '1']) {
      const result = run(file, ['add', '--json'], envWith({ STRICT: strict }))
      expect(result.code, `STRICT=${strict}`).toBe(1)
      expect(result.stdout).toBe('')
      expect(jsonFailure(result)).toMatchObject({
        status: 'action_required',
        reason: 'json_not_supported'
      })
    }
  })

  test('the usage shows the name given to cli(), or COMMAND', () => {
    const named = write('named.mjs', withAdd('{}'))
    const unnamed = write(
      'unnamed.mjs',
      withAdd('{}').replace("{ name: 'todo', version: '1.0.0',", "{ version: '1.0.0',")
    )
    expect(run(named, ['--help']).stdout).toMatch(/USAGE:\n {2}todo /)
    expect(run(unnamed, ['--help']).stdout).toMatch(/USAGE:\n {2}COMMAND /)
  })

  test('the errors of --json tell the command to run next with the name given to cli()', () => {
    const named = write('next-named.mjs', withAdd('{}'))
    const unnamed = write(
      'next-unnamed.mjs',
      withAdd('{}').replace("{ name: 'todo', version: '1.0.0',", "{ version: '1.0.0',")
    )
    expect(jsonFailure(run(named, ['add', '--json'])).next?.[0]?.argv).toEqual([
      'todo',
      'add',
      '--help'
    ])
    expect(jsonFailure(run(unnamed, ['add', '--json'])).next?.[0]?.argv).toEqual([
      '<COMMAND>',
      'add',
      '--help'
    ])
  })

  test('cli() prints the version itself, and returns it', () => {
    const file = write('version.mjs', withAdd('{}'))
    const version = run(file, ['--version'], envWith({ SHOW: '1' }))
    expect(version.stdout).toBe('1.0.0\n')
    expect(version.stderr).toMatch(/returned:"1\.0\.0"/)
  })

  test('the errors of the arguments go to stderr with the exit code 1', () => {
    const file = write(
      'errors.mjs',
      withAdd(`{ title: { type: 'positional' }, level: { type: 'enum', choices: ['a', 'b'] } }`)
    )
    for (const args of [['add'], ['add', 'x', '--level', 'c'], ['nope']]) {
      const result = run(file, args)
      expect(result.code, args.join(' ')).toBe(1)
      expect(result.stdout).toBe('')
      expect(result.stderr).not.toBe('')
      expect(hasStackTrace(result.stderr)).toBe(false)
    }
  })

  test('onErrorCommand can set another exit code for the errors of the arguments', () => {
    const file = write(
      'exit-code.mjs',
      `import { cli, define } from 'gunshi'
const create = define({ name: 'create', args: { name: { type: 'positional' }, replicas: { type: 'number' } }, run: ctx => console.log(JSON.stringify(ctx.values)) })
const main = define({ name: 'cloud', run: () => console.log('main') })
await cli(process.argv.slice(2), main, {
  name: 'cloud',
  version: '1.0.0',
  subCommands: { create },
  strict: true,
  onErrorCommand: process.env.TWO === '1' ? () => { process.exitCode = 2 } : undefined
})
`
    )
    const inputs = [
      ['create', 'db', '--unknown', 'x'],
      ['nope'],
      ['create', 'db', '--replicas', 'abc'],
      ['create']
    ]
    for (const [two, code] of [
      ['', 1],
      ['1', 2]
    ] as const) {
      for (const args of inputs) {
        const result = run(file, args, envWith({ TWO: two }))
        expect(result.code, `${args.join(' ')}: ${result.stderr}`).toBe(code)
        expect(result.stdout).toBe('')
        expect(result.stderr).not.toBe('')
        expect(hasStackTrace(result.stderr)).toBe(false)
      }
    }
    expect(run(file, ['create', 'db', '--replicas', '2'], envWith({ TWO: '1' })).code).toBe(0)
  })

  test('onErrorCommand is called with a CommandError too, and isCommandError leaves its exit code alone', () => {
    const file = write(
      'exit-code-command-error.mjs',
      `import { cli, CommandError, define, isCommandError } from 'gunshi'
const remove = define({
  name: 'remove',
  args: { name: { type: 'positional' } },
  run: ctx => {
    throw new CommandError('Database ' + ctx.values.name + ' not found', { code: 'not_found' })
  }
})
await cli(process.argv.slice(2), define({ name: 'cloud', run: () => {} }), {
  name: 'cloud',
  subCommands: { remove },
  onErrorCommand: (ctx, error) => {
    if (process.env.ALL === '1' || !isCommandError(error)) process.exitCode = 2
  }
})
`
    )
    expect(run(file, ['remove', 'db'])).toEqual({
      code: 1,
      stdout: '',
      stderr: 'Database db not found\n'
    })
    expect(run(file, ['remove'])).toMatchObject({ code: 2, stdout: '' })
    // without the check, the exit code of the CommandError is overwritten
    expect(run(file, ['remove', 'db'], envWith({ ALL: '1' })).code).toBe(2)
  })

  test('a CommandError prints its message to stderr without a stack trace, and sets the exit code', () => {
    const file = write(
      'command-error.mjs',
      `import { cli, CommandError, define } from 'gunshi'
const rollback = define({
  name: 'rollback',
  args: { exitCode: { type: 'number' } },
  run: ctx => {
    const cause = process.env.CAUSE ? new Error(process.env.CAUSE) : undefined
    throw new CommandError('Release 11 not found', { code: 'not_found', exitCode: ctx.values.exitCode, cause })
  }
})
await cli(process.argv.slice(2), rollback, { name: 'ship' }).then(
  () => console.log('resolved'),
  () => console.log('rejected')
)
`
    )
    expect(run(file)).toEqual({ code: 1, stdout: 'resolved\n', stderr: 'Release 11 not found\n' })
    expect(run(file, ['--exitCode', '2'])).toEqual({
      code: 2,
      stdout: 'resolved\n',
      stderr: 'Release 11 not found\n'
    })
    expect(run(file, [], envWith({ CAUSE: 'ENOENT: no such file' }))).toEqual({
      code: 1,
      stdout: 'resolved\n',
      stderr: 'Release 11 not found\nCaused by: ENOENT: no such file\n'
    })
  })

  test('any other error thrown from run ends in a stack trace', () => {
    const file = write(
      'throw.mjs',
      `import { cli, define } from 'gunshi'
await cli(process.argv.slice(2), define({ name: 'x', run: () => { throw new Error('boom') } }))
`
    )
    const result = run(file)
    expect(result.code).not.toBe(0)
    expect(result.stderr).toMatch(/Error: boom/)
    expect(hasStackTrace(result.stderr)).toBe(true)
  })

  test('with --json, a CommandError is one line of JSON on stderr, and its code is the reason', () => {
    const file = write(
      'command-error-json.mjs',
      `import { cli, CommandError, define, jsonArgs } from 'gunshi'
const show = define({
  name: 'show',
  args: { ...jsonArgs, name: { type: 'positional' } },
  run: ctx => {
    throw new CommandError('Project ' + ctx.values.name + ' not found', { code: 'not_found', exitCode: 2 })
  }
})
await cli(process.argv.slice(2), show, { name: 'projects' })
`
    )
    expect(run(file, ['nope'])).toEqual({ code: 2, stdout: '', stderr: 'Project nope not found\n' })
    expect(run(file, ['nope', '--json'])).toEqual({
      code: 2,
      stdout: '',
      stderr: '{"status":"error","reason":"not_found","message":"Project nope not found"}\n'
    })
  })

  test('a lazy command with jsonArgs in its definition takes --json before the name of the command too', () => {
    const file = write(
      'lazy-json.mjs',
      `import { cli, define, jsonArgs, lazy } from 'gunshi'
const args = { ...jsonArgs, name: { type: 'positional' } }
const show = lazy(async () => define({ name: 'show', args, run: ctx => ({ project: { name: ctx.values.name } }) }), { name: 'show', args })
await cli(process.argv.slice(2), define({ name: 'projects', run: () => {} }), { name: 'projects', subCommands: { show } })
`
    )
    const result = { code: 0, stdout: '{"project":{"name":"acme"}}\n', stderr: '' }
    expect(run(file, ['show', 'acme', '--json'])).toEqual(result)
    expect(run(file, ['--json', 'show', 'acme'])).toEqual(result)
  })

  test('gunshi does not touch a json option of its own', () => {
    const file = write(
      'own-json.mjs',
      `import { cli, define } from 'gunshi'
const list = define({
  name: 'list',
  args: { json: { type: 'boolean' } },
  run: ctx => {
    const names = ['acme-web', 'acme-api']
    console.log(ctx.values.json ? JSON.stringify(names) : names.join('\\n'))
  }
})
await cli(process.argv.slice(2), define({ name: 'projects', run: () => {} }), { name: 'projects', subCommands: { list } })
`
    )
    expect(run(file, ['list'])).toEqual({ code: 0, stdout: 'acme-web\nacme-api\n', stderr: '' })
    expect(run(file, ['list', '--json'])).toEqual({
      code: 0,
      stdout: '["acme-web","acme-api"]\n',
      stderr: ''
    })
  })

  test('the type errors that it explains are the ones that tsc prints', () => {
    const guide = readFileSync(GUIDE, 'utf8')
    const head = `import { define, jsonArgs, lazy } from 'gunshi'
interface Project { name: string }
declare function find(): Project
`
    // the file, the code, a line of the type error, and what the guide quotes of it
    const cases: [string, string, string, string][] = [
      [
        'returns-nothing.ts',
        `export const c = define({ name: 'c', args: { ...jsonArgs }, run: ctx => { ctx.log('c') } })`,
        "Type 'void' is not assignable to type 'Awaitable<JsonResult>'",
        "'Awaitable<JsonResult>'"
      ],
      [
        'returns-nothing-async.ts',
        `export const c = define({ name: 'c', args: { ...jsonArgs }, run: async ctx => { ctx.log('c') } })`,
        "Type 'void' is not assignable to type 'JsonResult'",
        "Type 'void' is not assignable to type 'JsonResult'"
      ],
      [
        'returns-a-value.ts',
        `export const c = define({ name: 'c', args: { ...jsonArgs }, run: () => find() })`,
        "Index signature for type 'string' is missing in type 'Project'",
        "Index signature for type 'string' is missing in type 'Project'"
      ],
      [
        'returns-an-array.ts',
        `export const c = define({ name: 'c', args: { ...jsonArgs }, run: () => [find()] })`,
        "Index signature for type 'string' is missing in type 'Project[]'",
        "'Project[]'"
      ],
      [
        'lazy-without-json-args.ts',
        `export const c = lazy(async () => define({ name: 'c', args: { ...jsonArgs }, run: () => ({ project: find() }) }), { name: 'c' })`,
        'No overload matches this call',
        'No overload matches this call'
      ],
      [
        'returns-an-object-without-json-args.ts',
        `export const c = define({ name: 'c', run: () => ({ project: find() }) })`,
        "is not assignable to type 'Awaitable<string | void>'",
        "is not assignable to type 'Awaitable<string | void>'"
      ]
    ]
    for (const [file, code] of cases) {
      write(file, `${head}${code}\n`)
    }
    const { output, errors } = typeCheck(cases.map(([file]) => file))
    for (const [file, , line, quote] of cases) {
      expect(errors[file], `the output of tsc:\n${output}`).toContain(line)
      expect(guide).toContain(quote)
    }
  })

  test('gunshi does not read environment variables, and run writes the order of the fallbacks', () => {
    const file = write(
      'env.mjs',
      `import { cli, define } from 'gunshi'
const deploy = define({ name: 'deploy', args: { region: { type: 'string' } }, run: ctx => console.log(ctx.values.region ?? process.env.SHIP_REGION ?? 'us-east-1') })
await cli(process.argv.slice(2), define({ name: 'ship', run: () => {} }), { subCommands: { deploy } })
`
    )
    expect(
      run(file, ['deploy'], envWith({ SHIP_REGION: undefined, REGION: 'ignored' })).stdout
    ).toBe('us-east-1\n')
    expect(run(file, ['deploy'], envWith({ SHIP_REGION: 'eu-west-1' })).stdout).toBe('eu-west-1\n')
    expect(
      run(file, ['deploy', '--region', 'ap-1'], envWith({ SHIP_REGION: 'eu-west-1' })).stdout
    ).toBe('ap-1\n')
  })

  test('stdout has only what the command prints, and only the JSON document with --json', () => {
    const file = write(
      'stdout.mjs',
      `import { cli, define, jsonArgs } from 'gunshi'
const list = define({
  name: 'list',
  args: { ...jsonArgs },
  run: ctx => {
    ctx.log('acme-web')
    ctx.log('acme-api')
    return { projects: [{ name: 'acme-web' }, { name: 'acme-api' }] }
  }
})
await cli(process.argv.slice(2), define({ name: 'projects', run: () => {} }), { name: 'projects', version: '1.0.0', subCommands: { list } })
`
    )
    expect(run(file, ['list'])).toEqual({ code: 0, stdout: 'acme-web\nacme-api\n', stderr: '' })
    expect(run(file, ['list', '--json'])).toEqual({
      code: 0,
      stdout: '{"projects":[{"name":"acme-web"},{"name":"acme-api"}]}\n',
      stderr: ''
    })
  })
})
