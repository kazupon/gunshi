import fs from 'node:fs/promises'
import path from 'node:path'
import { parseArgs } from 'node:util'

const args = parseArgs({
  strict: false,
  options: {
    package: {
      type: 'string',
      short: 'p',
      default: 'gunshi',
      description: 'The package name'
    },
    tag: {
      type: 'string',
      short: 't',
      default: 'latest',
      description: 'The tag to publish the package with'
    }
  }
})

function getDependencyVersion(
  json: Record<string, unknown>,
  catalogVersions: Record<string, string>,
  dep: string
): string {
  const dependencies = json.dependencies as Record<string, string> | undefined
  const devDependencies = json.devDependencies as Record<string, string> | undefined
  const dependencyVersion = dependencies?.[dep] || devDependencies?.[dep]

  if (!dependencyVersion) {
    throw new Error(`Dependency ${dep} is not defined in package.json`)
  }

  if (dependencyVersion === 'catalog:') {
    const catalogVersion = catalogVersions[dep]
    if (!catalogVersion) {
      throw new Error(`Dependency ${dep} is not defined in pnpm-workspace.yaml catalog`)
    }
    return catalogVersion
  }

  return dependencyVersion
}

function parseCatalogVersions(source: string): Record<string, string> {
  const catalogVersions: Record<string, string> = {}
  let inCatalog = false

  for (const line of source.split(/\r?\n/)) {
    if (line === 'catalog:') {
      inCatalog = true
      continue
    }

    if (!inCatalog) {
      continue
    }

    if (line && !line.startsWith(' ')) {
      break
    }

    const match = line.match(/^\s{2}([\w@./-]+): ['"]?([^'"\s]+)['"]?$/)
    if (match) {
      catalogVersions[match[1]] = match[2]
    }
  }

  return catalogVersions
}

async function loadCatalogVersions(): Promise<Record<string, string>> {
  const source = await fs.readFile(
    path.resolve(import.meta.dirname, '../pnpm-workspace.yaml'),
    'utf8'
  )
  return parseCatalogVersions(source)
}

function updatePkgJson(
  pkg: string,
  json: Record<string, unknown>,
  catalogVersions: Record<string, string>
): Record<string, unknown> {
  const version = json.version as string
  if (!version) {
    throw new Error(`Package ${pkg} does not have a version defined in package.json`)
  }

  json.dependencies = json.dependencies || {}

  function setDependency(dep: string) {
    ;(json.dependencies as Record<string, string>)[dep] = version
  }

  function setExternalDependency(dep: string) {
    ;(json.dependencies as Record<string, string>)[dep] = getDependencyVersion(
      json,
      catalogVersions,
      dep
    )
  }

  switch (pkg) {
    case 'packages/gunshi': {
      setDependency('@gunshi/plugin-global')
      setDependency('@gunshi/plugin-renderer')
      setDependency('@gunshi/plugin-i18n')
      setExternalDependency('args-tokens')
      break
    }
    case 'packages/bone':
    case 'packages/plugin':
    case 'packages/combinators':
    case 'packages/definition': {
      setDependency('gunshi')
      break
    }
    case 'packages/shared': {
      setDependency('@gunshi/resources')
      setDependency('gunshi')
      break
    }
    case 'packages/plugin-i18n':
    case 'packages/plugin-global': {
      setDependency('@gunshi/plugin')
      setDependency('@gunshi/shared')
      break
    }
    case 'packages/plugin-completion':
    case 'packages/plugin-renderer': {
      setDependency('@gunshi/plugin')
      setDependency('@gunshi/shared')
      setDependency('@gunshi/plugin-i18n')
      break
    }
    case 'packages/plugin-dryrun': {
      setDependency('@gunshi/plugin')
      break
    }
  }

  return json
}

async function main() {
  const { package: pkg } = args.values
  const catalogVersions = await loadCatalogVersions()

  let json: Record<string, unknown>
  try {
    const module = (await import(`../${pkg}/package.json`, {
      with: { type: 'json' }
    })) as { default: Record<string, unknown> }
    json = module.default || module
  } catch (error) {
    throw new Error(
      `Failed to load package.json for ${pkg}: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }

  json = updatePkgJson(pkg as string, json, catalogVersions)

  try {
    await fs.writeFile(
      path.resolve(import.meta.dirname, `../${pkg}/package.json`),
      JSON.stringify(json, null, 2),
      'utf8'
    )
  } catch (error) {
    throw new Error(
      `Failed to write package.json for ${pkg}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    )
  }
}

await main()
