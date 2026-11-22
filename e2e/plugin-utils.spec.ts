/**
 * The entries of the helpers for plugins, as they are built.
 *
 * `@gunshi/plugin` builds its entries one by one, so that importing it loads one file: built together, the code that
 * they share goes to a chunk that every CLI with an official plugin loads. These tests run small programs with a load
 * hook of `node:module`, in a place where only a copy of what `@gunshi/plugin` publishes is installed: through a
 * symlink, an import would find the development dependencies of the workspace, `gunshi` among them. Run `pnpm build`
 * first.
 */

import { spawnSync } from 'node:child_process'
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  writeFileSync
} from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, expect, test } from 'vite-plus/test'

const PLUGIN = path.resolve(import.meta.dirname, '..', 'packages', 'plugin')
const LIB = path.join(PLUGIN, 'lib')
const HELPERS = ['getCommandSubCommands', 'isLazyCommand', 'kebabnize', 'resolveLazyCommand']

/**
 * A load hook that tells on stderr each file of a lib that is loaded, by its name in the lib.
 *
 * @param lib - The directory of the lib
 * @returns The source of the hook
 */
const hook = (lib: string) => `import { registerHooks } from 'node:module'
import { fileURLToPath } from 'node:url'
const lib = ${JSON.stringify(lib + path.sep)}
registerHooks({
  load(url, context, nextLoad) {
    if (url.startsWith('file:')) {
      const file = fileURLToPath(url)
      if (file.startsWith(lib)) {
        process.stderr.write(\`[plugin] \${file.slice(lib.length)}\\n\`)
      }
    }
    return nextLoad(url, context)
  }
})
`

let dir = ''

beforeAll(() => {
  if (!existsSync(path.join(LIB, 'utils.js'))) {
    throw new Error('packages/plugin/lib/utils.js is not found. Run `pnpm build` first.')
  }
  // the real path, as the load hook sees it: the temporary directory of macOS is behind a symlink
  dir = realpathSync(mkdtempSync(path.join(os.tmpdir(), 'gunshi-plugin-utils-')))
  const installed = path.join(dir, 'node_modules', '@gunshi', 'plugin')
  mkdirSync(installed, { recursive: true })
  cpSync(path.join(PLUGIN, 'package.json'), path.join(installed, 'package.json'))
  cpSync(LIB, path.join(installed, 'lib'), { recursive: true })
  writeFileSync(path.join(dir, 'package.json'), '{ "type": "module" }\n')
  writeFileSync(path.join(dir, 'hook.mjs'), hook(path.join(installed, 'lib')))
  writeFileSync(
    path.join(dir, 'plugin.mjs'),
    `import { plugin } from '@gunshi/plugin'\nplugin({ id: 'x' })\n`
  )
  writeFileSync(
    path.join(dir, 'utils.mjs'),
    `import * as utils from '@gunshi/plugin/utils'\nconsole.log(JSON.stringify(Object.keys(utils).sort()))\n`
  )
})

afterAll(() => {
  if (dir) {
    rmSync(dir, { recursive: true, force: true })
  }
})

/**
 * Run a program with the load hook.
 *
 * @param program - The name of the program
 * @returns The files of the lib of `@gunshi/plugin` that it loads, and what it prints
 */
function run(program: string): { files: string[]; stdout: string } {
  const result = spawnSync(process.execPath, ['--import', './hook.mjs', program], {
    cwd: dir,
    encoding: 'utf8'
  })
  if (result.status !== 0) {
    throw new Error(`${program} exited with ${result.status}:\n${result.stderr}`)
  }
  const files = result.stderr
    .split('\n')
    .filter(line => line.startsWith('[plugin] '))
    .map(line => line.slice('[plugin] '.length))
  return { files, stdout: result.stdout }
}

test('importing @gunshi/plugin loads one file of its lib', () => {
  expect(run('plugin.mjs').files).toEqual(['index.js'])
})

test('@gunshi/plugin/utils gives the helpers from one file, without gunshi installed', () => {
  const { files, stdout } = run('utils.mjs')

  expect(files).toEqual(['utils.js'])
  expect(JSON.parse(stdout)).toEqual(HELPERS)
})
