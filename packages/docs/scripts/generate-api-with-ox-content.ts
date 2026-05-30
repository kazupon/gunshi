import fs from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

type OxExternalPackageSource = {
  package: string
  entry: string
}

type OxExtractionOptions = {
  root?: string
  tsconfig?: string
  private?: boolean
  internal?: boolean
  // v2.26.0+: follow external (non-local) package re-exports and turn them
  // into documentation entries (e.g. `args-tokens`, `@gunshi/plugin-renderer`).
  externalDocs?: boolean
  // Optional explicit `specifier -> source/declaration file` overrides used
  // before the resolver's package exports/types resolution.
  externalPackageSources?: OxExternalPackageSource[]
}

type OxGraphOptions = {
  root?: string
  tsconfig?: string
  externalDocs?: boolean
  externalPackageSources?: OxExternalPackageSource[]
}

type OxContentNapi = {
  buildExportGraph: (entryPoints: OxEntryPointSpec[], options?: OxGraphOptions) => OxExportGraph
  extractDocsFromEntryPoints: (
    entryPoints: OxEntryPointSpec[],
    options?: OxExtractionOptions
  ) => OxEntrypointDocsModule[]
  generateDocsDataJson: (docs: OxMarkdownModule[], generatedAt: string) => string
  generateDocsMarkdown: (
    docs: OxMarkdownModule[],
    options?: {
      groupBy?: string
      githubUrl?: string
      linkStyle?: 'markdown' | 'clean'
      basePath?: string
      pathStrategy?: 'flat' | 'typedoc'
    }
  ) => Record<string, string>
  generateDocsNavCode: (navItems: OxNavItem[], exportName?: string) => string
  generateDocsNavMetadata: (files: string[], basePath?: string) => OxNavItem[]
  generateDocsNavMetadataFromDocs: (
    docs: OxMarkdownModule[],
    options?: { basePath?: string; pathStrategy?: 'flat' | 'typedoc' }
  ) => OxNavItem[]
}

type OxContentPackage = {
  name: string
  version: string
  path: string
}

type OxEntryPointSpec = {
  path: string
  name?: string
}

type OxExportGraph = {
  entrypoints: OxEntrypointModule[]
  modules: OxResolvedModule[]
}

type OxEntrypointModule = {
  name: string
  sourcePath: string
  exports: OxPublicExport[]
}

type OxEntrypointDocsModule = {
  name: string
  file: string
  sourcePath: string
  entries: OxDocEntry[]
  exports: OxPublicExport[]
  diagnostics?: OxDocsDiagnostic[]
}

type OxDocsDiagnostic = {
  code: string
  entrypoint: string
  exportName: string
  exportKind: string
  source: OxExportSource
  message: string
}

type OxPublicExport = {
  name: string
  kind: string
  source: OxExportSource
}

type OxExportSource = {
  kind: string
  module?: string
  package?: string
  specifier?: string
  originalName: string
  typeOnly: boolean
}

type OxResolvedModule = {
  path: string
  exports: OxPublicExport[]
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
  members?: OxDocMember[]
}

type OxDocMember = {
  name: string
  kind: string
  description: string
  signature?: string
  type?: string
  params?: OxDocParam[]
  returns?: OxDocReturn
  optional?: boolean
  readonly?: boolean
  static?: boolean
  private?: boolean
  tags?: Record<string, string>
  line: number
  endLine: number
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
  module: string
  sourceFile: string
  outputFile: string
  url: string
  internal: boolean
  memberCount: number
}

type UndocumentedExport = {
  module: string
  name: string
  kind: string
  source: OxExportSource
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../../..')
const docsRoot = path.resolve(repoRoot, 'packages/docs')
const currentApiDir = path.resolve(docsRoot, 'src/api')
const outDir = path.resolve(docsRoot, 'src/api-ox')
const tsconfigPath = path.resolve(repoRoot, 'tsconfig.json')
const githubUrl = 'https://github.com/kazupon/gunshi'
const apiOxBasePath = '/api-ox'

const entryPoints: OxEntryPointSpec[] = [
  { path: '../gunshi/src/index.ts', name: 'default' },
  { path: '../gunshi/src/definition.ts', name: 'definition' },
  { path: '../gunshi/src/context.ts', name: 'context' },
  { path: '../gunshi/src/plugin.ts', name: 'plugin' },
  { path: '../gunshi/src/generator.ts', name: 'generator' },
  { path: '../gunshi/src/renderer.ts', name: 'renderer' },
  { path: '../gunshi/src/combinators.ts', name: 'combinators' },
  { path: '../gunshi/src/agent.ts', name: 'agent' }
]

// Explicit `specifier -> source/declaration entry` overrides for the external
// packages that gunshi re-exports as part of its public API. These are applied
// before the resolver's package exports/types resolution so external symbols
// (e.g. `parseArgs`, `string`, `renderHeader`, `DefaultTranslation`) become
// documentation entries.
//
// All overrides target built `.d.ts` declarations (JSDoc preserved). The
// workspace plugins must use their `lib/*.d.ts` rather than `src` because the
// TypeScript sources transitively import JSON resources
// (`@gunshi/resources/*.json`), which ox-content's OXC parser cannot read as
// source modules. Only the names gunshi actually re-exports become entries.
const externalPackageSources: OxExternalPackageSource[] = (() => {
  const require = createRequire(import.meta.url)
  const argsTokensDir = path.dirname(require.resolve('args-tokens/package.json'))
  return [
    { package: 'args-tokens', entry: path.join(argsTokensDir, 'lib/index.d.ts') },
    { package: 'args-tokens/combinators', entry: path.join(argsTokensDir, 'lib/combinators.d.ts') },
    { package: 'args-tokens/utils', entry: path.join(argsTokensDir, 'lib/utils.d.ts') },
    {
      package: '@gunshi/plugin-renderer',
      entry: path.resolve(repoRoot, 'packages/plugin-renderer/lib/index.d.ts')
    },
    {
      package: '@gunshi/plugin-i18n',
      entry: path.resolve(repoRoot, 'packages/plugin-i18n/lib/index.d.ts')
    }
  ]
})()

const kindByTypeDocDirectory: Record<string, string> = {
  classes: 'class',
  functions: 'function',
  interfaces: 'interface',
  variables: 'variable',
  'type-aliases': 'type'
}

// Reverse map: docs entry kind -> TypeDoc-style category directory.
// Mirrors ox-content's `pathStrategy: "typedoc"` segment mapping so the
// comparison report URLs line up with the generated nested pages.
const typeDocDirectoryByKind: Record<string, string> = {
  class: 'classes',
  function: 'functions',
  interface: 'interfaces',
  variable: 'variables',
  type: 'type-aliases',
  enum: 'enumerations',
  module: 'modules'
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

// Top-level module segment used by `pathStrategy: "typedoc"` output
// (e.g. `default`, `combinators`). Mirrors ox-content's module page naming.
function moduleSegment(moduleFile: string): string {
  const name = stem(moduleFile)
  return name === 'index' ? 'index-module' : name
}

// Per-symbol page path under the typedoc strategy: `{module}/{category}/{Name}.md`.
function typedocSymbolFile(moduleFile: string, kind: string, name: string): string {
  const directory = typeDocDirectoryByKind[kind] ?? `${kind}s`
  return `${moduleSegment(moduleFile)}/${directory}/${name}.md`
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
  const compatible = markdown
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

  return `${compatible.trimEnd()}\n`
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

function formatPathReference(value: string): string {
  return path.isAbsolute(value) ? toPosix(path.relative(repoRoot, value)) : value
}

function buildOxSymbols(modules: OxMarkdownModule[]): OxSymbol[] {
  return modules.flatMap(module =>
    module.entries.map(entry => {
      const outputFile = typedocSymbolFile(module.file, entry.kind, entry.name)
      return {
        name: entry.name,
        kind: entry.kind,
        module: moduleSegment(module.file),
        sourceFile: formatPathReference(entry.file),
        outputFile,
        // Clean URL (no `.md`) to match VitePress `cleanUrls` and TypeDoc's
        // `/api/default/functions/cli` layout.
        url: `${apiOxBasePath}/${stripMarkdownExtension(outputFile)}`,
        internal: Boolean(entry.tags?.some(tag => tag.tag === 'internal')),
        memberCount: entry.members?.length ?? 0
      }
    })
  )
}

function findUndocumentedExports(modules: OxEntrypointDocsModule[]): UndocumentedExport[] {
  return modules.flatMap(module => {
    const documentedNames = new Set(module.entries.map(entry => entry.name))
    return module.exports
      .filter(exported => !documentedNames.has(exported.name))
      .map(exported => ({
        module: module.name,
        name: exported.name,
        kind: exported.kind,
        source: exported.source
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
      `- \`${symbol.name}\` (${symbol.kind}) - \`${symbol.url}\` from \`${symbol.sourceFile}\` via \`${symbol.module}\``
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
        `- \`${outputFile}\`\n${files.map(file => `  - \`${formatPathReference(file)}\``).join('\n')}`
    )
    .join('\n')}\n`
}

function formatExportSource(source: OxExportSource): string {
  if (source.package) {
    return `${source.kind} \`${source.originalName}\` from package \`${source.package}\``
  }

  if (source.module) {
    return `${source.kind} \`${source.originalName}\` from \`${source.module}\``
  }

  return `${source.kind} \`${source.originalName}\``
}

function formatUndocumentedExports(exports: UndocumentedExport[], limit = 120): string {
  if (exports.length === 0) {
    return '- none\n'
  }

  const visible = exports.slice(0, limit)
  const lines = visible.map(
    exported =>
      `- \`${exported.module}\`: \`${exported.name}\` (${exported.kind}) - ${formatExportSource(exported.source)}`
  )
  if (exports.length > visible.length) {
    lines.push(`- ... ${exports.length - visible.length} more`)
  }
  return `${lines.join('\n')}\n`
}

function formatDiagnostics(diagnostics: OxDocsDiagnostic[], limit = 120): string {
  if (diagnostics.length === 0) {
    return '- none\n'
  }

  const visible = diagnostics.slice(0, limit)
  const lines = visible.map(
    diagnostic =>
      `- \`${diagnostic.entrypoint}\`: \`${diagnostic.exportName}\` (${diagnostic.exportKind}) - [${diagnostic.code}] ${diagnostic.message}`
  )
  if (diagnostics.length > visible.length) {
    lines.push(`- ... ${diagnostics.length - visible.length} more`)
  }
  return `${lines.join('\n')}\n`
}

function formatUrlSamples(typeDocSymbols: TypeDocSymbol[], oxSymbols: OxSymbol[]): string {
  const typeDocByName = groupBy(typeDocSymbols, symbol => symbol.name)
  const oxByName = groupBy(oxSymbols, symbol => symbol.name)
  const rows = ['| Symbol | Current TypeDoc URL | ox-content typedoc URL |', '|---|---|---|']

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
  exportGraph: OxExportGraph,
  entrypointModules: OxEntrypointDocsModule[],
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
  const documentedMemberCount = oxSymbols.reduce((total, symbol) => total + symbol.memberCount, 0)
  const undocumentedExports = findUndocumentedExports(entrypointModules)
  const diagnostics = entrypointModules.flatMap(module => module.diagnostics ?? [])
  const oxDuplicates = [...groupBy(oxSymbols, symbol => symbol.name)]
    .filter(([, symbols]) => symbols.length > 1)
    .sort(([left], [right]) => left.localeCompare(right))

  return `# ox-content API docs comparison

Generated at: ${generatedAt}

## Inputs

- Current TypeDoc output: \`packages/docs/src/api\`
- ox-content output: \`packages/docs/src/api-ox\`
- TypeDoc-compatible entrypoints:
${entryPoints.map(entryPoint => `  - \`${entryPoint.name ?? stem(entryPoint.path)}\`: \`${entryPoint.path}\``).join('\n')}
- ox-content npm package: \`${oxContentPackage.name}@${oxContentPackage.version}\`
- ox-content package path: \`${toPosix(path.relative(repoRoot, oxContentPackage.path))}\`
- export graph entrypoints: ${exportGraph.entrypoints.length}
- export graph source modules: ${exportGraph.modules.length}
- postprocess: generated \`<details>\` blocks and \`<pre><code>\` blocks are written with \`v-pre\`, and braces/newlines inside raw HTML code blocks are entity-escaped, so VitePress/Vue does not parse API signatures and code examples as template HTML.

## Summary

| Metric | Current TypeDoc | ox-content (typedoc) |
|---|---:|---:|
| Symbol entries | ${typeDocSymbols.length} | ${oxSymbols.length} |
| Unique symbol names | ${typeDocNameSet.size} | ${oxNameSet.size} |
| Markdown pages | ${currentPageCount} | ${generatedFiles.filter(file => file.endsWith('.md')).length} |
| Missing TypeDoc symbols by name | - | ${missingByName.length} |
| Extra ox-content symbols by name | - | ${extraByName.length} |
| Public exports without extracted docs | - | ${undocumentedExports.length} |
| Rendered member entries | - | ${documentedMemberCount} |
| ox-content extraction diagnostics | - | ${diagnostics.length} |
| ox-content output file collisions | - | ${collisions.length} |
| ox-content \`@internal\` entries still emitted | - | ${internalOxSymbols.length} |

Current TypeDoc kind counts: ${formatCountByKind(typeDocSymbols)}

ox-content kind counts: ${formatCountByKind(oxSymbols)}

## URL Samples

${formatUrlSamples(typeDocSymbols, oxSymbols)}

## Missing Current TypeDoc Symbols

These symbols exist in current TypeDoc pages but were not present by symbol name in ox-content entrypoint extraction.

${formatSymbolList(missingByName)}

## Extra ox-content Symbols

These symbols appear in ox-content entrypoint extraction but do not have a current TypeDoc symbol page by the same name.

${formatOxSymbolList(extraByName)}

## Public Exports Without Extracted Docs

These exports are present in the ox-content entrypoint export graph but were not rendered as documentation entries. With \`externalDocs: true\` the remaining items are \`@internal\` type helpers from \`types.ts\` / \`context.ts\` that both TypeDoc (\`--excludeInternal\`) and ox-content (\`internal: false\`) intentionally drop, so they are not a coverage gap versus the current TypeDoc output (see "Missing Current TypeDoc Symbols": 0).

${formatUndocumentedExports(undocumentedExports)}

## ox-content Extraction Diagnostics

Diagnostics reported by \`extractDocsFromEntryPoints\` for exports it could not turn into documentation entries (e.g. external re-exports without a resolvable source, or unsupported declaration kinds).

${formatDiagnostics(diagnostics)}

## Duplicate ox-content Symbol Names

${
  oxDuplicates.length === 0
    ? '- none\n'
    : `${oxDuplicates
        .map(
          ([name, symbols]) =>
            `- \`${name}\`\n${symbols
              .map(
                symbol =>
                  `  - ${symbol.kind} \`${symbol.url}\` from \`${symbol.sourceFile}\` via \`${symbol.module}\``
              )
              .join('\n')}`
        )
        .join('\n')}\n`
}

## ox-content Output File Collisions

ox-content entrypoint output uses entrypoint file names. A collision here means two entrypoints would write the same Markdown file.

${formatCollisionList(collisions)}

## Generated Files

${generatedFiles.map(file => `- \`${file}\``).join('\n')}

## Migration Notes

- This comparison uses \`@ox-content/napi\` with \`pathStrategy: "typedoc"\`, so each symbol is emitted as its own nested page (\`{module}/{category}/{Name}.md\`) matching TypeDoc's \`/api/default/functions/cli\` layout, with a per-module \`index.md\`.
- Navigation is generated via \`generateDocsNavMetadataFromDocs(..., { pathStrategy: "typedoc" })\`, producing a deep \`module -> category -> symbol\` sidebar tree (\`NavItem.children\`) instead of the previous flat entrypoint list.
- \`linkStyle: "markdown"\` is used so VitePress' dead-link checker resolves the generated links; with \`cleanUrls: true\` they are still served as clean URLs at runtime.
- \`externalDocs: true\` (with \`externalPackageSources\` overrides) resolves external package re-exports into documentation entries, so \`args-tokens\` (\`parseArgs\`, \`resolveArgs\`, combinators, \`kebabnize\`), \`@gunshi/plugin-renderer\` (\`renderHeader\`, \`renderUsage\`, \`renderValidationErrors\`) and \`@gunshi/plugin-i18n\` (\`DefaultTranslation\`) now appear as docs entries. This brings missing-by-name down to 0.
- \`{@link}\` / \`{@linkcode}\` inline tags are resolved by the renderer: known symbols become internal links (e.g. \`{@linkcode Command | entry command}\` -> a link to the \`Command\` page), and unresolvable symbols (not part of gunshi's public API, e.g. \`TranslationAdapter\`) fall back to inline code. No raw \`{@link}\` tags remain in the generated pages.
- Overloads are unified into a single page/anchor per symbol (\`cli\`, \`define\`, \`lazy\`, \`plugin\`), so duplicate anchors are gone. The "Symbol entries" count above still counts overloads and cross-entrypoint re-exports separately, but each \`{module}/{category}/{Name}.md\` page is unique.
- Members are exposed/rendered for documented class/interface/type/enum entries, so pages such as \`Command\` include member data; \`enum\` symbols now get \`enumerations/{Name}\` pages.
- \`internal: false\` is passed to entrypoint extraction to match TypeDoc \`--excludeInternal\`.
- Remaining differences: symbol duplication across entrypoints (\`Command\` appears under \`default\`, \`definition\`, \`plugin\` — the same multi-module re-export behavior TypeDoc has); and the \`<details>\` / \`<div>\` based card layout, which differs from TypeDoc's table/breadcrumb layout. Raw ox-content Markdown still uses HTML \`<details>\` and \`<pre><code>\` blocks; this output minimally postprocesses them with \`v-pre\` and code-block brace/newline escaping so VitePress/Vue does not parse API signatures as template HTML.
`
}

async function main() {
  const generatedAt = new Date().toISOString()
  const { napi, oxContentPackage } = loadOxContentNapi()
  const typeDocSymbols = await readCurrentTypeDocSymbols()
  const currentPageCount = (await walkFiles(currentApiDir)).filter(file =>
    file.endsWith('.md')
  ).length

  const extractionOptions: OxExtractionOptions = {
    root: docsRoot,
    tsconfig: tsconfigPath,
    private: false,
    internal: false,
    // v2.26.0+: resolve external package re-exports into docs entries. The
    // resolver prefers the `types` condition, so `args-tokens` resolves to its
    // bundled `.d.ts` (JSDoc preserved) and `@gunshi/plugin-*` workspace
    // packages resolve to `packages/*/src` via tsconfig path aliases.
    externalDocs: true,
    externalPackageSources
  }
  const exportGraph = napi.buildExportGraph(entryPoints, extractionOptions)
  const entrypointModules = napi.extractDocsFromEntryPoints(entryPoints, extractionOptions)
  const modules: OxMarkdownModule[] = entrypointModules.map(module => ({
    file: module.file,
    entries: module.entries.map(toMarkdownEntry)
  }))

  const generated = napi.generateDocsMarkdown(modules, {
    groupBy: 'file',
    githubUrl,
    basePath: apiOxBasePath,
    pathStrategy: 'typedoc',
    // Use markdown-style links (relative `.md`) so VitePress' dead-link checker
    // resolves module index pages. With `cleanUrls: true` these are still served
    // as clean URLs at runtime. (`linkStyle: "clean"` emits absolute
    // directory-index links like `/api-ox/agent` that the checker rejects.)
    linkStyle: 'markdown'
  })
  const navItems = napi.generateDocsNavMetadataFromDocs(modules, {
    basePath: apiOxBasePath,
    pathStrategy: 'typedoc'
  })
  const oxSymbols = buildOxSymbols(modules)
  // Under the typedoc strategy each symbol gets its own page, so a collision
  // means two symbols (same module/kind/name) would write the same file.
  const collisions = [...groupBy(oxSymbols, symbol => symbol.outputFile)]
    .filter(([, group]) => new Set(group.map(symbol => symbol.sourceFile)).size > 1)
    .map(
      ([outputFile, group]) =>
        [outputFile, [...new Set(group.map(symbol => symbol.sourceFile))]] as [string, string[]]
    )

  await fs.rm(outDir, { recursive: true, force: true })
  await fs.mkdir(outDir, { recursive: true })

  for (const [fileName, content] of Object.entries(generated).sort(([left], [right]) =>
    left.localeCompare(right)
  )) {
    const target = path.join(outDir, fileName)
    // typedoc strategy emits nested paths (e.g. `default/functions/cli.md`),
    // so ensure the parent directory exists before writing.
    await fs.mkdir(path.dirname(target), { recursive: true })
    await fs.writeFile(target, makeVitePressCompatible(content), 'utf8')
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
    exportGraph,
    entrypointModules,
    typeDocSymbols,
    oxSymbols,
    generatedFiles,
    collisions,
    currentPageCount
  )

  await fs.writeFile(path.join(outDir, 'comparison.md'), report, 'utf8')

  console.log(`Generated ox-content API comparison to ${toPosix(path.relative(repoRoot, outDir))}`)
  console.log(`Current TypeDoc symbols: ${typeDocSymbols.length}`)
  console.log(`ox-content entrypoint symbols: ${oxSymbols.length}`)
  console.log(`Output file collisions: ${collisions.length}`)
}

await main()
