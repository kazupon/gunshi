import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, test } from 'vitest'
import { collectWorkspacePackages, npmSpec, waitForNpmPackages } from './wait-npm.ts'

import type { NpmPackage } from './wait-npm.ts'

const tempDirs: string[] = []

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map(dir => fs.rm(dir, { recursive: true, force: true })))
})

async function writeWorkspace(
  packages: Record<string, { name: string; version: string }>
): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'wait-npm-'))
  tempDirs.push(root)
  await fs.mkdir(path.join(root, 'packages'))
  for (const [dir, pkg] of Object.entries(packages)) {
    const pkgDir = path.join(root, 'packages', dir)
    await fs.mkdir(pkgDir)
    await fs.writeFile(path.join(pkgDir, 'package.json'), JSON.stringify(pkg), 'utf8')
  }
  return path.join(root, 'packages')
}

describe('collectWorkspacePackages', () => {
  test('reads name and version, skipping docs', async () => {
    const packagesDir = await writeWorkspace({
      gunshi: { name: 'gunshi', version: '0.37.2' },
      resources: { name: '@gunshi/resources', version: '0.37.2' },
      docs: { name: '@gunshi/docs', version: '0.37.2' }
    })

    await expect(collectWorkspacePackages(packagesDir)).resolves.toEqual([
      { name: '@gunshi/resources', version: '0.37.2' },
      { name: 'gunshi', version: '0.37.2' }
    ])
  })

  test('throws when package.json is missing name or version', async () => {
    const packagesDir = await writeWorkspace({
      broken: { name: '', version: '1.0.0' }
    })
    await fs.writeFile(
      path.join(packagesDir, 'broken', 'package.json'),
      JSON.stringify({ version: '1.0.0' }),
      'utf8'
    )

    await expect(collectWorkspacePackages(packagesDir)).rejects.toThrow(/Invalid package.json/)
  })
})

describe('waitForNpmPackages', () => {
  const resources: NpmPackage = { name: '@gunshi/resources', version: '0.37.2' }
  const shared: NpmPackage = { name: '@gunshi/shared', version: '0.37.2' }

  test('returns after packages become visible', async () => {
    const attempts = new Map<string, number>()
    let now = 0

    await waitForNpmPackages([resources, shared], {
      timeoutMs: 1000,
      intervalMs: 10,
      now: () => now,
      sleep: async ms => {
        now += ms
      },
      isPublished: async pkg => {
        const id = npmSpec(pkg)
        const count = (attempts.get(id) ?? 0) + 1
        attempts.set(id, count)
        return count >= 2
      }
    })

    expect(attempts.get('@gunshi/resources@0.37.2')).toBe(2)
    expect(attempts.get('@gunshi/shared@0.37.2')).toBe(2)
  })

  test('does not re-check packages that are already visible', async () => {
    const attempts = new Map<string, number>()
    let now = 0

    await waitForNpmPackages([resources, shared], {
      timeoutMs: 1000,
      intervalMs: 10,
      now: () => now,
      sleep: async ms => {
        now += ms
      },
      isPublished: async pkg => {
        const id = npmSpec(pkg)
        const count = (attempts.get(id) ?? 0) + 1
        attempts.set(id, count)
        return pkg.name === '@gunshi/resources' ? true : count >= 2
      }
    })

    expect(attempts.get('@gunshi/resources@0.37.2')).toBe(1)
    expect(attempts.get('@gunshi/shared@0.37.2')).toBe(2)
  })

  test('throws remaining specs when timeout elapses', async () => {
    let now = 0

    await expect(
      waitForNpmPackages([resources], {
        timeoutMs: 100,
        intervalMs: 50,
        now: () => now,
        sleep: async ms => {
          now += ms
        },
        isPublished: async () => false,
        log: () => {}
      })
    ).rejects.toThrow('Timed out waiting for npm packages: @gunshi/resources@0.37.2')
  })
})
