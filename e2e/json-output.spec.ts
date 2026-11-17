/**
 * The JSON output of `--json`, in real processes of Node.js and Bun.
 *
 * Programs read the JSON from a pipe: stdout must be exactly one JSON document, and stderr one line of JSON for a
 * failure. A large document must reach a slow reader whole, even when the app calls `process.exit()` right after
 * `cli()`, and a reader that stops early must not make the CLI fail. These tests write a CLI into a temporary
 * directory, with `node_modules/gunshi` linked to `packages/gunshi`, so run `pnpm build` first.
 */

import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, test } from 'vite-plus/test'

const ROOT = path.resolve(import.meta.dirname, '..')
const GUNSHI = path.join(ROOT, 'packages', 'gunshi')

const CLI = `import { cli, CommandError, define, jsonArgs } from 'gunshi'

const list = define({
  name: 'list',
  args: { ...jsonArgs },
  run: ctx => {
    ctx.log('Projects:')
    ctx.log('  acme')
    return { projects: [{ name: 'acme' }] }
  }
})

const big = define({
  name: 'big',
  args: { ...jsonArgs },
  run: () => ({
    projects: Array.from({ length: 20000 }, (_, id) => ({ id, name: \`project-\${id}\`, url: \`https://example.com/p/\${id}\` }))
  })
})

const fail = define({
  name: 'fail',
  args: { ...jsonArgs },
  run: () => {
    throw new CommandError('Project acme not found', { code: 'not_found', exitCode: 2 })
  }
})

const legacy = define({ name: 'legacy', run: () => console.log('legacy output') })

await cli(process.argv.slice(2), define({ name: 'demo', run: () => {} }), {
  name: 'demo',
  subCommands: { list, big, fail, legacy }
})

// as an app may do after cli()
if (process.env.EXIT_NOW) {
  process.exit(0)
}
`

// the length of the document of `big`, with the newline of console.log
const BIG_LENGTH =
  JSON.stringify({
    projects: Array.from({ length: 20000 }, (_, id) => ({
      id,
      name: `project-${id}`,
      url: `https://example.com/p/${id}`
    }))
  }).length + 1

let dir = ''

beforeAll(() => {
  if (!existsSync(path.join(GUNSHI, 'lib', 'index.js'))) {
    throw new Error('packages/gunshi/lib/index.js is not found. Run `pnpm build` first.')
  }
  dir = mkdtempSync(path.join(os.tmpdir(), 'gunshi-json-output-'))
  mkdirSync(path.join(dir, 'node_modules'))
  symlinkSync(GUNSHI, path.join(dir, 'node_modules', 'gunshi'))
  writeFileSync(path.join(dir, 'package.json'), '{ "type": "module" }\n')
  writeFileSync(path.join(dir, 'cli.mjs'), CLI)
})

afterAll(() => {
  if (dir) {
    rmSync(dir, { recursive: true, force: true })
  }
})

const runtimes = [
  { name: 'Node.js', command: process.execPath },
  ...(spawnSync('bun', ['--version']).status === 0 ? [{ name: 'Bun', command: 'bun' }] : [])
]

describe.each(runtimes)('$name', ({ command }) => {
  /**
   * Run the CLI, with stdout and stderr on pipes.
   *
   * @param args - The arguments of the CLI
   * @returns The exit code and the output
   */
  function run(args: string[]) {
    const result = spawnSync(command, ['cli.mjs', ...args], { cwd: dir, encoding: 'utf8' })
    return { code: result.status, stdout: result.stdout, stderr: result.stderr }
  }

  /**
   * Run the CLI in a shell pipeline.
   *
   * @param pipeline - The pipeline, where `$CLI` runs the CLI
   * @param env - More environment variables
   * @returns What the pipeline prints
   */
  function shell(pipeline: string, env: Record<string, string> = {}) {
    const result = spawnSync('bash', ['-c', pipeline], {
      cwd: dir,
      encoding: 'utf8',
      env: { ...process.env, ...env, CLI: `${command} cli.mjs` }
    })
    return result.stdout.trim()
  }

  test('stdout is one line of JSON on a pipe, without the human output', () => {
    const result = run(['list', '--json'])

    expect(result).toEqual({ code: 0, stdout: '{"projects":[{"name":"acme"}]}\n', stderr: '' })
  })

  test('without --json, the human output is printed, and no data', () => {
    const result = run(['list'])

    expect(result).toEqual({ code: 0, stdout: 'Projects:\n  acme\n', stderr: '' })
  })

  test('a CommandError is one line of JSON on stderr, with its exit code', () => {
    const result = run(['fail', '--json'])

    expect(result.code).toBe(2)
    expect(result.stdout).toBe('')
    expect(result.stderr.split('\n')).toEqual([
      '{"status":"error","reason":"not_found","message":"Project acme not found"}',
      ''
    ])
  })

  test('--json given to a command without jsonArgs stops it, with json_not_supported', () => {
    const result = run(['legacy', '--json'])

    expect(result.code).toBe(1)
    expect(result.stdout).toBe('')
    expect(JSON.parse(result.stderr)).toMatchObject({
      status: 'action_required',
      reason: 'json_not_supported'
    })
  })

  test('a large document reaches a slow reader whole, though the app exits right after cli()', () => {
    const length = shell('$CLI big --json | (sleep 0.3; wc -c)', { EXIT_NOW: '1' })

    expect(Number(length)).toBe(BIG_LENGTH)
  })

  test('a reader that stops early does not make the CLI fail', () => {
    const code = shell('$CLI big --json | head -c 1 > /dev/null; echo "${PIPESTATUS[0]}"')

    expect(code).toBe('0')
  })
})
