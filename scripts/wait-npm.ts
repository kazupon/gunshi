import { execFile } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000
const DEFAULT_INTERVAL_MS = 5_000
const SKIP_PACKAGES = new Set(['docs'])

export type NpmPackage = {
  name: string
  version: string
}

export type WaitForNpmPackagesOptions = {
  isPublished: (pkg: NpmPackage) => Promise<boolean>
  now?: () => number
  sleep?: (ms: number) => Promise<void>
  timeoutMs?: number
  intervalMs?: number
  log?: (message: string) => void
}

export function npmSpec(pkg: NpmPackage): string {
  return `${pkg.name}@${pkg.version}`
}

export async function collectWorkspacePackages(
  packagesDir: string,
  skip: ReadonlySet<string> = SKIP_PACKAGES
): Promise<NpmPackage[]> {
  const entries = await fs.readdir(packagesDir, { withFileTypes: true })
  const packages: NpmPackage[] = []

  for (const entry of entries) {
    if (!entry.isDirectory() || skip.has(entry.name)) {
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

export async function isPublishedOnNpm(pkg: NpmPackage): Promise<boolean> {
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

export async function waitForNpmPackages(
  packages: readonly NpmPackage[],
  options: WaitForNpmPackagesOptions
): Promise<void> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const intervalMs = options.intervalMs ?? DEFAULT_INTERVAL_MS
  const now = options.now ?? Date.now
  const sleep = options.sleep ?? ((ms: number) => new Promise(resolve => setTimeout(resolve, ms)))
  const log = options.log ?? console.log
  const start = now()
  const pending = new Set(packages.map(npmSpec))

  while (pending.size > 0) {
    for (const pkg of packages) {
      const id = npmSpec(pkg)
      if (!pending.has(id)) {
        continue
      }
      if (await options.isPublished(pkg)) {
        log(`✓ ${id} is on npm`)
        pending.delete(id)
      }
    }

    if (pending.size === 0) {
      return
    }

    if (now() - start >= timeoutMs) {
      throw new Error(`Timed out waiting for npm packages: ${[...pending].join(', ')}`)
    }

    log(`waiting for ${[...pending].join(', ')}`)
    await sleep(intervalMs)
  }
}

export async function main(
  packagesDir = path.resolve(import.meta.dirname, '../packages')
): Promise<void> {
  const packages = await collectWorkspacePackages(packagesDir)
  logPackages('waiting for npm to serve', packages)
  await waitForNpmPackages(packages, { isPublished: isPublishedOnNpm })
}

function logPackages(prefix: string, packages: readonly NpmPackage[]): void {
  console.log(`${prefix}:`)
  for (const pkg of packages) {
    console.log(`  - ${npmSpec(pkg)}`)
  }
}

const invokedDirectly =
  Boolean(process.argv[1]) && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url

if (invokedDirectly) {
  await main()
}
