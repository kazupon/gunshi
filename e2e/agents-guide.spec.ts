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
    const tsc = path.join(ROOT, 'node_modules', '.bin', 'tsc')
    const options = [
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
    const result = spawnSync(tsc, [...options, 'ship.ts'], { cwd: dir, encoding: 'utf8' })
    expect(result.status, `${result.stdout}${result.stderr}`).toBe(0)
  })

  const cases: [string[], number, RegExp, RegExp | ''][] = [
    [[], 0, /Run `ship --help`/, ''],
    [['--help'], 0, /USAGE:\n {2}ship \[COMMANDS\]/, ''],
    [['deploy', '--help'], 0, /^(?=[\s\S]*--dry-run)(?=[\s\S]*choices: dev \| prod)/, ''],
    [['--version'], 0, /^1\.0\.0\n$/, ''],
    [['deploy', 'api'], 0, /^\{"service":"api","target":"dev","config":"ship.json"\}\n$/, ''],
    [
      ['deploy', 'api', '-t', 'prod', '--dry-run', '--config', 'x.json'],
      0,
      /"target":"prod","dryRun":true,"config":"x.json"/,
      ''
    ],
    [
      ['deploy', 'api', '--unknown'],
      0,
      /^\{"service":"api","target":"dev","config":"ship.json"\}\n$/,
      ''
    ],
    [['deploy', 'api', '--target', 'qa'], 1, /^$/, /--target/],
    [['rollback', '3'], 0, /^Rolled back to release 3\n$/, ''],
    [['rollback', '0'], 1, /^$/, /Integer must be >= 1/],
    [['rollback', '11'], 1, /^$/, /^Release 11 not found\n$/],
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
  test('gunshi/bone has no --help and no --version', () => {
    const file = write(
      'bone.mjs',
      `import { cli } from 'gunshi/bone'
import { define } from 'gunshi'
await cli(process.argv.slice(2), define({ name: 'x', run: () => {} }), { name: 'x', version: '1.0.0' })
`
    )
    const help = run(file, ['--help'])
    const version = run(file, ['--version'])
    expect(help).toMatchObject({ code: 0, stdout: '' })
    expect(version.stdout).toBe('')
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

  test('the usage shows the name given to cli(), or COMMAND', () => {
    const named = write('named.mjs', withAdd('{}'))
    const unnamed = write(
      'unnamed.mjs',
      withAdd('{}').replace("{ name: 'todo', version: '1.0.0',", "{ version: '1.0.0',")
    )
    expect(run(named, ['--help']).stdout).toMatch(/USAGE:\n {2}todo /)
    expect(run(unnamed, ['--help']).stdout).toMatch(/USAGE:\n {2}COMMAND /)
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

  test('an error thrown from run ends in a stack trace', () => {
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

  test('stdout has only what the command prints', () => {
    const file = write('json.mjs', withAdd(`{ title: { type: 'positional' } }`))
    expect(run(file, ['add', 'milk']).stdout).toBe('{"title":"milk"}\n')
  })
})
