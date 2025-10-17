import { existsSync, promises as fs } from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'vitest'
import { runCommand } from '../scripts/utils.ts'

async function getFixtureDirents(fixturePath: string) {
  const entries = await fs.readdir(fixturePath, { recursive: true, withFileTypes: true })
  const filteredEntries = entries.filter(entry => entry.isDirectory())
  return filteredEntries
    .filter(entry => {
      return existsSync(path.join(entry.parentPath, entry.name, 'config.json'))
    })
    .map(entry => {
      const fullPath = path.join(entry.parentPath, entry.name)
      return path.relative(fixturePath, fullPath)
    })
}

describe('playground tests', async () => {
  const playgroundPath = path.join(import.meta.dirname, '../playground')
  const fixturePath = path.join(import.meta.dirname, '../e2e/fixture')
  const fixtureDirs = await getFixtureDirents(fixturePath)

  for (const dir of fixtureDirs) {
    // eslint-disable-next-line vitest/valid-title -- NOTE(kazupon): dir is used as describe name
    describe(dir, async () => {
      const targetPath = path.resolve(fixturePath, dir)
      const configPath = path.resolve(targetPath, 'config.json')
      const config = (await import(configPath, { with: { type: 'json' } }).then(
        mod => mod.default || mod
      )) as Array<[string, string]>
      if (!Array.isArray(config)) {
        throw new TypeError(`Invalid config.json in ${dir}: expected an array`)
      }
      if (config.length > 0) {
        for (const [testCase, cmd] of config) {
          // eslint-disable-next-line vitest/valid-title -- NOTE(kazupon): testCase is used as test name
          test(testCase, async () => {
            const output = await runCommand(cmd, {
              cwd: path.resolve(playgroundPath, dir),
              env: { ...process.env }
            })
            await expect(output).toMatchFileSnapshot(path.resolve(targetPath, `${testCase}.snap`))
          })
        }
      }
    })
  }
})
