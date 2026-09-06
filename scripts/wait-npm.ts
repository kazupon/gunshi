import { execFile } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const TIMEOUT_MS = 5 * 60 * 1000
const INTERVAL_MS = 5_000
const SKIP_PACKAGES = new Set(['docs'])

type NpmPackage = {
  name: string
  version: string
}

function npmSpec(pkg: NpmPackage): string {
  return `${pkg.name}@${pkg.version}`
}

async function collectWorkspacePackages(packagesDir: string): Promise<NpmPackage[]> {
  const entries = await fs.readdir(packagesDir, { withFileTypes: true })
  const packages: NpmPackage[] = []

  for (const entry of entries) {
    if (!entry.isDirectory() || SKIP_PACKAGES.has(entry.name)) {
      continue
    }

    const pkgPath = path.join(packagesDir, entry.name, 'package.json')
    const json = JSON.parse(await fs.readFile(pkgPath, 'utf8')) as {
      name?: unknown
      version?: unknown
    }
    if (typeof json.name !== 'string' || typeof json.version !== 'string') {
      throw new Error(`Invalid package.json at ${pkgPath}`)
    }
    packages.push({ name: json.name, version: json.version })
  }

  return packages.sort((a, b) => a.name.localeCompare(b.name))
}

async function isPublishedOnNpm(pkg: NpmPackage): Promise<boolean> {
  try {
    const { stdout } = await execFileAsync(
      'npm',
      ['view', npmSpec(pkg), 'version', '--loglevel=error'],
      {
        timeout: 20_000
      }
    )
    return stdout.trim() === pkg.version
  } catch {
    return false
  }
}

async function waitForNpmPackages(packages: readonly NpmPackage[]): Promise<void> {
  const start = Date.now()
  const pending = new Set(packages.map(npmSpec))

  while (pending.size > 0) {
    for (const pkg of packages) {
      const id = npmSpec(pkg)
      if (!pending.has(id)) {
        continue
      }
      if (await isPublishedOnNpm(pkg)) {
        console.log(`✓ ${id} is on npm`)
        pending.delete(id)
      }
    }

    if (pending.size === 0) {
      return
    }

    if (Date.now() - start >= TIMEOUT_MS) {
      throw new Error(`Timed out waiting for npm packages: ${[...pending].join(', ')}`)
    }

    console.log(`waiting for ${[...pending].join(', ')}`)
    await new Promise(resolve => setTimeout(resolve, INTERVAL_MS))
  }
}

const packages = await collectWorkspacePackages(path.resolve(import.meta.dirname, '../packages'))
console.log('waiting for npm to serve:')
for (const pkg of packages) {
  console.log(`  - ${npmSpec(pkg)}`)
}
await waitForNpmPackages(packages)
