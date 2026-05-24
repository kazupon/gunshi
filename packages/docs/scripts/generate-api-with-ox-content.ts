import fs from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

type OxContentNapi = {
  collectDocsSourceFiles: (srcDir: string, include: string[], exclude: string[]) => string[]
  extractFileDocEntries: (filePath: string, includePrivate?: boolean) => OxDocEntry[]
  generateDocsDataJson: (docs: OxMarkdownModule[], generatedAt: string) => string
  generateDocsMarkdown: (
    docs: OxMarkdownModule[],
    options?: { groupBy?: string; githubUrl?: string }
  ) => Record<string, string>
  generateDocsNavCode: (navItems: OxNavItem[], exportName?: string) => string
  generateDocsNavMetadata: (files: string[], basePath?: string) => OxNavItem[]
}

type OxContentPackage = {
  name: string
  version: string
  path: string
}

type OxDocParam = {
  name: string
  type: string
  description: string
  optional?: boolean
  default?: string
}

type OxDocReturn = {
  type: string
  description: string
}

type OxDocEntry = {
  name: string
  kind: string
  description: string
  params?: OxDocParam[]
  returns?: OxDocReturn
  examples?: string[]
  tags?: Record<string, string> | OxMarkdownTag[]
  private: boolean
  file: string
  line: number
  endLine: number
  signature?: string
}

type OxMarkdownTag = {
  tag: string
  value: string
}

type OxMarkdownEntry = Omit<OxDocEntry, 'tags'> & {
  tags?: OxMarkdownTag[]
}

type OxMarkdownModule = {
  file: string
  entries: OxMarkdownEntry[]
}

type OxNavItem = {
  title: string
  path: string
  children?: OxNavItem[]
}

type TypeDocSymbol = {
  name: string
  kind: string
  module: string
  file: string
  url: string
}

type OxSymbol = {
  name: string
  kind: string
  sourceFile: string
  outputFile: string
  url: string
  internal: boolean
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../../..')
const docsRoot = path.resolve(repoRoot, 'packages/docs')
const currentApiDir = path.resolve(docsRoot, 'src/api')
const outDir = path.resolve(docsRoot, 'src/api-ox')
const gunshiSourceDir = path.resolve(repoRoot, 'packages/gunshi/src')
const githubUrl = 'https://github.com/kazupon/gunshi'

const include = ['**/*.ts']
const exclude = [
  '**/*.test.*',
  '**/*.snap',
  '**/__snapshots__/**',
  '**/node_modules/**',
  'node_modules'
]

const kindByTypeDocDirectory: Record<string, string> = {
  classes: 'class',
  functions: 'function',
  interfaces: 'interface',
  variables: 'variable',
  'type-aliases': 'type'
}

const urlSamples = [
  'cli',
  'define',
  'Command',
  'Plugin',
  'DefaultTranslation',
  'ANONYMOUS_COMMAND_NAME',
  'CLI_OPTIONS_DEFAULT',
  'string'
]

function loadOxContentNapi(): { napi: OxContentNapi; oxContentPackage: OxContentPackage } {
  const require = createRequire(import.meta.url)

  try {
    const packagePath = require.resolve('@ox-content/napi/package.json')
    const packageJson = require(packagePath) as { name: string; version: string }
    return {
      napi: require('@ox-content/napi') as OxContentNapi,
      oxContentPackage: {
        name: packageJson.name,
        version: packageJson.version,
        path: packagePath
      }
    }
  } catch (error) {
    throw new Error(
      `Failed to load @ox-content/napi from npm package dependencies.\n${String(error)}`
    )
  }
}

async function walkFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async entry => {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        return walkFiles(fullPath)
      }
      return [fullPath]
    })
  )

  return files.flat().sort()
}

function toPosix(value: string): string {
  return value.split(path.sep).join('/')
}

function stripMarkdownExtension(file: string): string {
  return file.replace(/\.md$/, '')
}

function stem(file: string): string {
  return path.basename(file, path.extname(file))
}

function oxOutputFile(sourceFile: string): string {
  const name = stem(sourceFile)
  return `${name === 'index' ? 'index-module' : name}.md`
}

function oxAnchor(name: string): string {
  return name.toLowerCase()
}

function normalizeTags(tags: OxDocEntry['tags']): OxMarkdownTag[] | undefined {
  if (!tags) {
    return undefined
  }

  if (Array.isArray(tags)) {
    return tags
  }

  return Object.entries(tags).map(([tag, value]) => ({ tag, value }))
}

function toMarkdownEntry(entry: OxDocEntry): OxMarkdownEntry {
  return {
    ...entry,
    tags: normalizeTags(entry.tags)
  }
}

function makeVitePressCompatible(markdown: string): string {
  return markdown
    .replaceAll('<details ', '<details v-pre ')
    .replace(
      /<pre><code([^>]*)>([\s\S]*?)<\/code><\/pre>/g,
      (_, attributes: string, code: string) => {
        const escapedCode = code
          .replaceAll('{', '&#123;')
          .replaceAll('}', '&#125;')
          .replaceAll('\n', '&#10;')
        return `<pre v-pre><code${attributes}>${escapedCode}</code></pre>`
      }
    )
}

function groupBy<T>(items: T[], key: (item: T) => string): Map<string, T[]> {
  const grouped = new Map<string, T[]>()
  for (const item of items) {
    const groupKey = key(item)
    const values = grouped.get(groupKey) ?? []
    values.push(item)
    grouped.set(groupKey, values)
  }
  return grouped
}

async function readCurrentTypeDocSymbols(): Promise<TypeDocSymbol[]> {
  const files = (await walkFiles(currentApiDir)).filter(file => file.endsWith('.md'))
  const symbols: TypeDocSymbol[] = []

  for (const file of files) {
    const relative = toPosix(path.relative(currentApiDir, file))
    const parts = relative.split('/')
    const kindDirectory = parts.find(part => part in kindByTypeDocDirectory)

    if (!kindDirectory) {
      continue
    }

    const moduleName = parts[0]
    const name = stripMarkdownExtension(path.basename(file))
    symbols.push({
      name,
      kind: kindByTypeDocDirectory[kindDirectory],
      module: moduleName,
      file: relative,
      url: `/api/${relative}`
    })
  }

  return symbols.sort((left, right) =>
    `${left.name}:${left.kind}:${left.url}`.localeCompare(
      `${right.name}:${right.kind}:${right.url}`
    )
  )
}

function buildOxSymbols(modules: OxMarkdownModule[]): OxSymbol[] {
  return modules.flatMap(module => {
    const outputFile = oxOutputFile(module.file)
    return module.entries.map(entry => ({
      name: entry.name,
      kind: entry.kind,
      sourceFile: toPosix(path.relative(repoRoot, module.file)),
      outputFile,
      url: `/api-ox/${outputFile}#${oxAnchor(entry.name)}`,
      internal: Boolean(entry.tags?.some(tag => tag.tag === 'internal'))
    }))
  })
}

function formatCountByKind(symbols: Array<{ kind: string }>): string {
  const counts = [...groupBy(symbols, symbol => symbol.kind)]
    .map(([kind, values]) => `${kind}: ${values.length}`)
    .sort()
  return counts.join(', ') || '-'
}

function formatSymbolList(symbols: TypeDocSymbol[], limit = 120): string {
  if (symbols.length === 0) {
    return '- none\n'
  }

  const visible = symbols.slice(0, limit)
  const lines = visible.map(symbol => `- \`${symbol.name}\` (${symbol.kind}) - \`${symbol.url}\``)
  if (symbols.length > visible.length) {
    lines.push(`- ... ${symbols.length - visible.length} more`)
  }
  return `${lines.join('\n')}\n`
}

function formatOxSymbolList(symbols: OxSymbol[], limit = 120): string {
  if (symbols.length === 0) {
    return '- none\n'
  }

  const visible = symbols.slice(0, limit)
  const lines = visible.map(
    symbol =>
      `- \`${symbol.name}\` (${symbol.kind}) - \`${symbol.url}\` from \`${symbol.sourceFile}\``
  )
  if (symbols.length > visible.length) {
    lines.push(`- ... ${symbols.length - visible.length} more`)
  }
  return `${lines.join('\n')}\n`
}

function formatCollisionList(collisions: Array<[string, string[]]>): string {
  if (collisions.length === 0) {
    return '- none\n'
  }

  return `${collisions
    .map(
      ([outputFile, files]) =>
        `- \`${outputFile}\`\n${files.map(file => `  - \`${toPosix(path.relative(repoRoot, file))}\``).join('\n')}`
    )
    .join('\n')}\n`
}

function formatUrlSamples(typeDocSymbols: TypeDocSymbol[], oxSymbols: OxSymbol[]): string {
  const typeDocByName = groupBy(typeDocSymbols, symbol => symbol.name)
  const oxByName = groupBy(oxSymbols, symbol => symbol.name)
  const rows = ['| Symbol | Current TypeDoc URL | ox-content direct URL |', '|---|---|---|']

  for (const name of urlSamples) {
    const typeDocUrls =
      typeDocByName
        .get(name)
        ?.map(symbol => `\`${symbol.url}\``)
        .join('<br>') ?? '-'
    const oxUrls =
      oxByName
        .get(name)
        ?.map(symbol => `\`${symbol.url}\``)
        .join('<br>') ?? '-'
    rows.push(`| \`${name}\` | ${typeDocUrls} | ${oxUrls} |`)
  }

  return `${rows.join('\n')}\n`
}

function createComparisonReport(
  generatedAt: string,
  oxContentPackage: OxContentPackage,
  typeDocSymbols: TypeDocSymbol[],
  oxSymbols: OxSymbol[],
  generatedFiles: string[],
  collisions: Array<[string, string[]]>,
  currentPageCount: number
): string {
  const typeDocNameSet = new Set(typeDocSymbols.map(symbol => symbol.name))
  const oxNameSet = new Set(oxSymbols.map(symbol => symbol.name))
  const missingByName = typeDocSymbols.filter(symbol => !oxNameSet.has(symbol.name))
  const extraByName = oxSymbols.filter(symbol => !typeDocNameSet.has(symbol.name))
  const internalOxSymbols = oxSymbols.filter(symbol => symbol.internal)
  const oxDuplicates = [...groupBy(oxSymbols, symbol => symbol.name)]
    .filter(([, symbols]) => symbols.length > 1)
    .sort(([left], [right]) => left.localeCompare(right))

  return `# ox-content API docs comparison

Generated at: ${generatedAt}

## Inputs

- Current TypeDoc output: \`packages/docs/src/api\`
- ox-content output: \`packages/docs/src/api-ox\`
- gunshi source scan: \`packages/gunshi/src\`
- ox-content npm package: \`${oxContentPackage.name}@${oxContentPackage.version}\`
- ox-content package path: \`${toPosix(path.relative(repoRoot, oxContentPackage.path))}\`
- include: ${include.map(pattern => `\`${pattern}\``).join(', ')}
- exclude: ${exclude.map(pattern => `\`${pattern}\``).join(', ')}
- postprocess: generated \`<details>\` blocks and \`<pre><code>\` blocks are written with \`v-pre\`, and braces/newlines inside raw HTML code blocks are entity-escaped, so VitePress/Vue does not parse API signatures and code examples as template HTML.

## Summary

| Metric | Current TypeDoc | ox-content direct |
|---|---:|---:|
| Symbol entries | ${typeDocSymbols.length} | ${oxSymbols.length} |
| Unique symbol names | ${typeDocNameSet.size} | ${oxNameSet.size} |
| Markdown pages | ${currentPageCount} | ${generatedFiles.filter(file => file.endsWith('.md')).length} |
| Missing TypeDoc symbols by name | - | ${missingByName.length} |
| Extra ox-content symbols by name | - | ${extraByName.length} |
| ox-content output file collisions | - | ${collisions.length} |
| ox-content \`@internal\` entries still emitted | - | ${internalOxSymbols.length} |

Current TypeDoc kind counts: ${formatCountByKind(typeDocSymbols)}

ox-content kind counts: ${formatCountByKind(oxSymbols)}

## URL Samples

${formatUrlSamples(typeDocSymbols, oxSymbols)}

## Missing Current TypeDoc Symbols

These symbols exist in current TypeDoc pages but were not present by symbol name in direct ox-content extraction.

${formatSymbolList(missingByName)}

## Extra ox-content Symbols

These symbols appear in direct ox-content extraction but do not have a current TypeDoc symbol page by the same name.

${formatOxSymbolList(extraByName)}

## Duplicate ox-content Symbol Names

${
  oxDuplicates.length === 0
    ? '- none\n'
    : `${oxDuplicates
        .map(
          ([name, symbols]) =>
            `- \`${name}\`\n${symbols
              .map(symbol => `  - ${symbol.kind} \`${symbol.url}\` from \`${symbol.sourceFile}\``)
              .join('\n')}`
        )
        .join('\n')}\n`
}

## ox-content Output File Collisions

ox-content direct output uses source file basenames, so same-basename files can overwrite each other.

${formatCollisionList(collisions)}

## Generated Files

${generatedFiles.map(file => `- \`${file}\``).join('\n')}

## Migration Notes

- Direct ox-content generation is source-file based. It does not reproduce current TypeDoc entrypoint modules such as \`default\`, \`plugin\`, and \`combinators\`.
- Barrel re-exports are not expanded. That is why \`DefaultTranslation\`, \`string\`, and other re-exported APIs are missing.
- Interface/class members are not rendered in the normalized Markdown output, so pages such as \`Command\` lose property tables.
- \`@internal\` is retained as a tag in direct output. Current TypeDoc uses \`--excludeInternal\`.
- Raw ox-content Markdown uses HTML \`<details>\` and \`<pre><code>\` blocks. In this comparison output they are minimally postprocessed with \`v-pre\` and code-block brace/newline escaping; without that, VitePress/Vue can fail while compiling examples that contain TypeScript syntax.
- To keep current docs quality, gunshi needs either ox-content upstream support for entrypoint/re-export/member-aware generation or a custom gunshi adapter/renderer on top of ox-content extraction.
`
}

async function main() {
  const generatedAt = new Date().toISOString()
  const { napi, oxContentPackage } = loadOxContentNapi()
  const typeDocSymbols = await readCurrentTypeDocSymbols()
  const currentPageCount = (await walkFiles(currentApiDir)).filter(file =>
    file.endsWith('.md')
  ).length

  const sourceFiles = napi.collectDocsSourceFiles(gunshiSourceDir, include, exclude)
  const modules: OxMarkdownModule[] = []

  for (const sourceFile of sourceFiles) {
    const entries = napi.extractFileDocEntries(sourceFile, false)
    if (entries.length === 0) {
      continue
    }

    modules.push({
      file: sourceFile,
      entries: entries.map(toMarkdownEntry)
    })
  }

  const generated = napi.generateDocsMarkdown(modules, {
    groupBy: 'file',
    githubUrl
  })
  const navItems = napi.generateDocsNavMetadata(
    modules.map(module => module.file),
    '/api-ox'
  )
  const oxSymbols = buildOxSymbols(modules)
  const collisions = [...groupBy(modules, module => oxOutputFile(module.file))]
    .filter(([, collisionModules]) => collisionModules.length > 1)
    .map(
      ([outputFile, collisionModules]) =>
        [outputFile, collisionModules.map(module => module.file)] as [string, string[]]
    )

  await fs.rm(outDir, { recursive: true, force: true })
  await fs.mkdir(outDir, { recursive: true })

  for (const [fileName, content] of Object.entries(generated).sort(([left], [right]) =>
    left.localeCompare(right)
  )) {
    await fs.writeFile(path.join(outDir, fileName), makeVitePressCompatible(content), 'utf8')
  }

  await fs.writeFile(
    path.join(outDir, 'docs.json'),
    napi.generateDocsDataJson(modules, generatedAt),
    'utf8'
  )
  await fs.writeFile(
    path.join(outDir, 'nav.ts'),
    napi.generateDocsNavCode(navItems, 'apiOxNav'),
    'utf8'
  )

  const generatedFiles = (await walkFiles(outDir))
    .map(file => toPosix(path.relative(outDir, file)))
    .sort()
  const report = createComparisonReport(
    generatedAt,
    oxContentPackage,
    typeDocSymbols,
    oxSymbols,
    generatedFiles,
    collisions,
    currentPageCount
  )

  await fs.writeFile(path.join(outDir, 'comparison.md'), report, 'utf8')

  console.log(`Generated ox-content API comparison to ${toPosix(path.relative(repoRoot, outDir))}`)
  console.log(`Current TypeDoc symbols: ${typeDocSymbols.length}`)
  console.log(`ox-content direct symbols: ${oxSymbols.length}`)
  console.log(`Output file collisions: ${collisions.length}`)
}

await main()
