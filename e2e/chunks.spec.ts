/**
 * The files of the built gunshi that importing it loads.
 *
 * The build puts the JavaScript that two or more entries share in one chunk, so that importing `gunshi` loads two
 * files of its own, the entry and the shared chunk: Node.js spends time on each module that it loads. The code that
 * only one entry uses stays in the file of that entry, such as the bundled std-env of `gunshi/agent`, which reads
 * `process.stdout` when it is loaded. These tests run small programs with a load hook of `node:module`, against the
 * built `packages/gunshi/lib`. Run `pnpm build` first.
 */

import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, expect, test } from 'vite-plus/test'

const GUNSHI = path.resolve(import.meta.dirname, '..', 'packages', 'gunshi')
const LIB = path.join(GUNSHI, 'lib')

/**
 * A load hook that tells on stderr each file of the lib of gunshi that is loaded, by its name in the lib.
 */
const HOOK = `import { registerHooks } from 'node:module'
import { fileURLToPath } from 'node:url'
const lib = ${JSON.stringify(LIB + path.sep)}
registerHooks({
  load(url, context, nextLoad) {
    if (url.startsWith('file:')) {
      const file = fileURLToPath(url)
      if (file.startsWith(lib)) {
        process.stderr.write(\`[gunshi] \${file.slice(lib.length)}\\n\`)
      }
    }
    return nextLoad(url, context)
  }
})
`

const PROGRAMS: Record<string, string> = {
  // a CLI of one command
  'gunshi.mjs': `import { cli, define } from 'gunshi'
const command = define({ name: 'greet', args: { name: { type: 'string' } }, run: ctx => console.log(ctx.values.name) })
await cli(['--name', 'gunshi'], command)
`,
  // a CLI whose commands are defined with gunshi/definition, as the guide shows
  'definition.mjs': `import { cli } from 'gunshi'
import { define } from 'gunshi/definition'
const build = define({ name: 'build', run: () => console.log('build') })
await cli(['build'], define({ name: 'main', run: () => {} }), { subCommands: { build } })
`
}

let dir = ''

beforeAll(() => {
  if (!existsSync(path.join(LIB, 'index.js'))) {
    throw new Error('packages/gunshi/lib/index.js is not found. Run `pnpm build` first.')
  }
  dir = mkdtempSync(path.join(os.tmpdir(), 'gunshi-chunks-'))
  mkdirSync(path.join(dir, 'node_modules'))
  symlinkSync(GUNSHI, path.join(dir, 'node_modules', 'gunshi'))
  writeFileSync(path.join(dir, 'package.json'), '{ "type": "module" }\n')
  writeFileSync(path.join(dir, 'hook.mjs'), HOOK)
  for (const [name, code] of Object.entries(PROGRAMS)) {
    writeFileSync(path.join(dir, name), code)
  }
})

afterAll(() => {
  if (dir) {
    rmSync(dir, { recursive: true, force: true })
  }
})

/**
 * Run a program with the load hook, and collect the files of the lib of gunshi that it loads.
 *
 * @param program - The name of the program
 * @returns The names of the files in the lib, in the order in which they are loaded
 */
function loadedFiles(program: string): string[] {
  const result = spawnSync(process.execPath, ['--import', './hook.mjs', program], {
    cwd: dir,
    encoding: 'utf8'
  })
  if (result.status !== 0) {
    throw new Error(`${program} exited with ${result.status}:\n${result.stderr}`)
  }
  return result.stderr
    .split('\n')
    .filter(line => line.startsWith('[gunshi] '))
    .map(line => line.slice('[gunshi] '.length))
}

test('importing gunshi loads two files of its lib, the entry and the shared chunk', () => {
  const files = loadedFiles('gunshi.mjs')

  expect(files).toHaveLength(2)
  expect(files).toContain('index.js')
  expect(files.filter(file => file.startsWith('shared-'))).toHaveLength(1)
})

test('importing gunshi/definition with gunshi adds only the entry of gunshi/definition', () => {
  const files = loadedFiles('definition.mjs')

  expect(files).toHaveLength(3)
  expect(files).toEqual(expect.arrayContaining(['index.js', 'definition.js']))
})

test('importing gunshi does not load the file of gunshi/agent, whose bundled std-env reads process.stdout', () => {
  expect(loadedFiles('gunshi.mjs')).not.toContain('agent.js')
  expect(loadedFiles('definition.mjs')).not.toContain('agent.js')
})
