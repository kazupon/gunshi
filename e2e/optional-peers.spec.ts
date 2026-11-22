/**
 * The plugins that work without `@gunshi/plugin-i18n`, as they are built.
 *
 * They declare it as an optional peer dependency, so that installing them does not install it. Their JavaScript and
 * their declarations must not import it then: an import that is left in a `.d.ts` is a type error with
 * `skipLibCheck: false` where it is not installed. Run `pnpm build` first.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'vite-plus/test'

const PACKAGES = path.resolve(import.meta.dirname, '..', 'packages')
const PLUGINS = ['plugin-completion', 'plugin-renderer', 'plugin-suggestion']
const IMPORT =
  /^\s*(?:import|export)\b.*["']@gunshi\/plugin-i18n["']|\bimport\(\s*["']@gunshi\/plugin-i18n["']/m

describe.each(PLUGINS)('%s', plugin => {
  const dir = path.join(PACKAGES, plugin)

  test('declares @gunshi/plugin-i18n as an optional peer dependency', () => {
    const pkg = JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf8'))

    expect(pkg.peerDependencies).toHaveProperty(['@gunshi/plugin-i18n'])
    expect(pkg.peerDependenciesMeta?.['@gunshi/plugin-i18n']?.optional).toBe(true)
    expect(pkg.dependencies).not.toHaveProperty(['@gunshi/plugin-i18n'])
  })

  test('does not import @gunshi/plugin-i18n from its built files', () => {
    const lib = path.join(dir, 'lib')
    if (!existsSync(lib)) {
      throw new Error(`${lib} is not found. Run \`pnpm build\` first.`)
    }
    const files = readdirSync(lib).filter(file => /\.(?:js|d\.ts)$/.test(file))

    expect(files.length).toBeGreaterThan(0)
    const importing = files.filter(file => IMPORT.test(readFileSync(path.join(lib, file), 'utf8')))
    expect(importing).toEqual([])
  })
})
