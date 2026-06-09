import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateOxContentApiDocs } from 'vitepress-api-references'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')
const packageRoot = process.cwd()
const packageJsonPath = path.join(packageRoot, 'package.json')
const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8')) as {
  name?: string
  repository?: { directory?: string }
}
const packageDirectory =
  packageJson.repository?.directory ?? toPosix(path.relative(repoRoot, packageRoot))
const outDir = path.join(packageDirectory, 'docs')
const externalPackageSources = await resolveExternalPackageSources(packageDirectory)

await fs.rm(path.resolve(repoRoot, outDir), { recursive: true, force: true })

const result = await generateOxContentApiDocs({
  root: repoRoot,
  tsconfig: 'tsconfig.json',
  entryPoints: [{ path: path.join(packageDirectory, 'src/index.ts'), name: 'default' }],
  outDir,
  basePath: `/${packageDirectory}/docs`,
  extraction: {
    private: false,
    internal: false,
    externalDocs: true,
    typeParameters: true,
    externalPackageSources
  },
  markdown: {
    groupBy: 'file',
    pathStrategy: 'typedoc',
    singleEntryRoot: 'flatten',
    renderStyle: 'markdown',
    linkStyle: 'markdown',
    indexFormat: 'table',
    parametersFormat: 'table',
    interfacePropertiesFormat: 'table',
    classPropertiesFormat: 'table',
    propertyMembersFormat: 'table',
    typeAliasPropertiesFormat: 'table',
    enumMembersFormat: 'table',
    typeDeclarationFormat: 'none',
    renderStats: false,
    renderGeneratedBy: false,
    groupOrder: ['Variables', 'Functions', 'Class'],
    sort: ['alphabetical'],
    sortEntryPoints: true
  },
  nav: { enabled: false },
  docsJson: false,
  escapeHeadingAngleBrackets: true
})

console.log(`Generated ${result.generatedFiles.length} API reference files for ${packageJson.name}`)

function toPosix(value: string): string {
  return value.split(path.sep).join('/')
}

async function resolveExternalPackageSources(currentPackageDirectory: string) {
  const candidates = [
    { package: '@gunshi/plugin', directory: 'packages/plugin' },
    { package: '@gunshi/shared', directory: 'packages/shared' },
    { package: '@gunshi/resources', directory: 'packages/resources' },
    { package: '@gunshi/plugin-global', directory: 'packages/plugin-global' },
    { package: '@gunshi/plugin-i18n', directory: 'packages/plugin-i18n' },
    { package: '@gunshi/plugin-renderer', directory: 'packages/plugin-renderer' }
  ]
  const sources: Array<{ package: string; entry: string }> = []

  for (const candidate of candidates) {
    if (candidate.directory === currentPackageDirectory) {
      continue
    }

    const entry = path.join(candidate.directory, 'lib/index.d.ts')
    try {
      await fs.access(path.resolve(repoRoot, entry))
      sources.push({ package: candidate.package, entry })
    } catch {
      // The package may not have been built yet. In that case ox-content falls back to normal resolution.
    }
  }

  return sources
}
