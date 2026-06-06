import fs from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../../..')
const docsRoot = path.resolve(repoRoot, 'packages/docs')
const currentApiDir = path.resolve(docsRoot, 'src/api')
const outDir = path.resolve(docsRoot, 'src/api-ox')
const tsconfigPath = path.resolve(repoRoot, 'tsconfig.json')
const githubUrl = 'https://github.com/kazupon/gunshi'
const apiOxBasePath = '/api-ox'
const apiOxGroupOrder = ['Variables', 'Functions', 'Class']
const apiOxSort = ['alphabetical']
const apiOxSortEntryPoints = true
const entryPoints = [
  { path: '../gunshi/src/index.ts', name: 'default' },
  { path: '../gunshi/src/definition.ts', name: 'definition' },
  { path: '../gunshi/src/context.ts', name: 'context' },
  { path: '../gunshi/src/plugin.ts', name: 'plugin' },
  { path: '../gunshi/src/generator.ts', name: 'generator' },
  { path: '../gunshi/src/renderer.ts', name: 'renderer' },
  { path: '../gunshi/src/combinators.ts', name: 'combinators' },
  { path: '../gunshi/src/agent.ts', name: 'agent' }
]
const externalPackageSources = (() => {
  const require2 = createRequire(path.join(repoRoot, 'packages/gunshi/package.json'))
  const argsTokensDir = path.dirname(require2.resolve('args-tokens/package.json'))
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
const kindByTypeDocDirectory = {
  classes: 'class',
  functions: 'function',
  interfaces: 'interface',
  variables: 'variable',
  'type-aliases': 'type'
}
const typeDocDirectoryByKind = {
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
function loadOxContentNapi() {
  const require2 = createRequire(import.meta.url)
  try {
    const packagePath = require2.resolve('@ox-content/napi/package.json')
    const packageJson = require2(packagePath)
    return {
      napi: require2('@ox-content/napi'),
      oxContentPackage: {
        name: packageJson.name,
        version: packageJson.version,
        path: packagePath
      }
    }
  } catch (error) {
    throw new Error(
      `Failed to load @ox-content/napi from npm package dependencies.
${String(error)}`
    )
  }
}
async function walkFiles(dir) {
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
function toPosix(value) {
  return value.split(path.sep).join('/')
}
function stripMarkdownExtension(file) {
  return file.replace(/\.md$/, '')
}
function stem(file) {
  return path.basename(file, path.extname(file))
}
function moduleSegment(moduleFile) {
  const name = stem(moduleFile)
  return name === 'index' ? 'index-module' : name
}
function typedocSymbolFile(moduleFile, kind, name) {
  const directory = typeDocDirectoryByKind[kind] ?? `${kind}s`
  return `${moduleSegment(moduleFile)}/${directory}/${name}.md`
}
function normalizeTags(tags) {
  if (!tags) {
    return void 0
  }
  if (Array.isArray(tags)) {
    return tags
  }
  return Object.entries(tags).map(([tag, value]) => ({ tag, value }))
}
function toMarkdownEntry(entry) {
  return {
    ...entry,
    tags: normalizeTags(entry.tags)
  }
}
function escapeHeadingAngleBrackets(markdown) {
  let inCodeFence = false
  return markdown
    .split('\n')
    .map(line => {
      if (line.startsWith('```')) {
        inCodeFence = !inCodeFence
        return line
      }
      if (inCodeFence || !/^#{1,6}\s/.test(line)) {
        return line
      }
      return line.replace(/(?<!\\)([<>])/g, '\\$1')
    })
    .join('\n')
}
function ensureTrailingSlash(value) {
  return value.endsWith('/') ? value : `${value}/`
}
function toVitePressNav(items, depth = 0) {
  return items.map(item => {
    const children = item.children ?? []
    const isGroup = children.length > 0
    const isCategory = isGroup && depth > 0
    const node = { text: item.title }
    if (!isCategory) {
      node.link = isGroup ? ensureTrailingSlash(item.path) : item.path
    }
    if (isGroup) {
      node.collapsed = true
      node.items = toVitePressNav(children, depth + 1)
    }
    return node
  })
}
function quoteTsString(value) {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}
function renderNavItems(items, indent = 0) {
  const padding = ' '.repeat(indent)
  const renderedItems = items
    .map((item, index) => {
      const itemPadding = ' '.repeat(indent + 2)
      const propertyPadding = ' '.repeat(indent + 4)
      const properties = [`text: ${quoteTsString(item.text)}`]
      if (item.link) {
        properties.push(`link: ${quoteTsString(item.link)}`)
      }
      if (item.collapsed !== void 0) {
        properties.push(`collapsed: ${String(item.collapsed)}`)
      }
      if (item.items) {
        properties.push(`items: ${renderNavItems(item.items, indent + 4)}`)
      }
      const body = properties
        .map((property, propertyIndex) => {
          const suffix2 = propertyIndex === properties.length - 1 ? '' : ','
          return `${propertyPadding}${property}${suffix2}`
        })
        .join('\n')
      const suffix = index === items.length - 1 ? '' : ','
      return `${itemPadding}{
${body}
${itemPadding}}${suffix}`
    })
    .join('\n')
  return `[
${renderedItems}
${padding}]`
}
function renderNavModule(navItems) {
  return `/**
 * Auto-generated API documentation navigation (VitePress sidebar shape).
 *
 * Generated by packages/docs/scripts/generate-api-with-ox-content.mjs: ox-content
 * nav metadata, normalized to VitePress \`{ text, link, items }\` on the consumer
 * side (see .notes/029). Do not edit manually.
 */

export interface NavItem {
  text: string
  link?: string
  collapsed?: boolean
  items?: NavItem[]
}

export const apiOxNav: NavItem[] = ${renderNavItems(navItems)}
`
}
function groupBy(items, key) {
  const grouped = /* @__PURE__ */ new Map()
  for (const item of items) {
    const groupKey = key(item)
    const values = grouped.get(groupKey) ?? []
    values.push(item)
    grouped.set(groupKey, values)
  }
  return grouped
}
async function readCurrentTypeDocBaseline() {
  const files = (await walkFiles(currentApiDir)).filter(file => file.endsWith('.md'))
  const symbols = []
  for (const file of files) {
    const relative = toPosix(path.relative(currentApiDir, file))
    const parts = relative.split('/')
    const kindDirectory = parts.find(part => part in kindByTypeDocDirectory)
    if (!kindDirectory) {
      continue
    }
    const name = stripMarkdownExtension(path.basename(file))
    symbols.push({
      name,
      kind: kindByTypeDocDirectory[kindDirectory],
      url: `/api/${relative}`
    })
  }
  return {
    pageCount: files.length,
    symbols: symbols.sort((left, right) =>
      `${left.name}:${left.kind}:${left.url}`.localeCompare(
        `${right.name}:${right.kind}:${right.url}`
      )
    )
  }
}
function formatPathReference(value) {
  return path.isAbsolute(value) ? toPosix(path.relative(repoRoot, value)) : value
}
function buildOxSymbols(modules) {
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
function buildOxPageSymbols(generatedFiles) {
  return generatedFiles.flatMap(file => {
    if (!file.endsWith('.md')) {
      return []
    }
    const parts = file.split('/')
    const moduleName = parts[0]
    const kindDirectory = parts[1]
    const name = stripMarkdownExtension(path.basename(file))
    const kind = kindByTypeDocDirectory[kindDirectory]
    if (!moduleName || !kind) {
      return []
    }
    return [
      {
        name,
        kind,
        module: moduleName,
        sourceFile: file,
        url: `${apiOxBasePath}/${stripMarkdownExtension(file)}`
      }
    ]
  })
}
function findUndocumentedExports(modules) {
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
function formatCountByKind(symbols) {
  const counts = [...groupBy(symbols, symbol => symbol.kind)]
    .map(([kind, values]) => `${kind}: ${values.length}`)
    .sort()
  return counts.join(', ') || '-'
}
function formatSymbolList(symbols, limit = 120) {
  if (symbols.length === 0) {
    return '- none\n'
  }
  const visible = symbols.slice(0, limit)
  const lines = visible.map(symbol => `- \`${symbol.name}\` (${symbol.kind}) - \`${symbol.url}\``)
  if (symbols.length > visible.length) {
    lines.push(`- ... ${symbols.length - visible.length} more`)
  }
  return `${lines.join('\n')}
`
}
function formatOxSymbolList(symbols, limit = 120) {
  if (symbols.length === 0) {
    return '- none\n'
  }
  const visible = symbols.slice(0, limit)
  const lines = visible.map(
    symbol =>
      `- \`${symbol.name}\` (${symbol.kind}) - \`${symbol.url}\`${formatOxSymbolOrigin(symbol)}`
  )
  if (symbols.length > visible.length) {
    lines.push(`- ... ${symbols.length - visible.length} more`)
  }
  return `${lines.join('\n')}
`
}
function formatOxSymbolOrigin(symbol) {
  const source = symbol.sourceFile ? ` from \`${symbol.sourceFile}\`` : ''
  return `${source} via \`${symbol.module}\``
}
function formatCollisionList(collisions) {
  if (collisions.length === 0) {
    return '- none\n'
  }
  return `${collisions
    .map(
      ([outputFile, files]) => `- \`${outputFile}\`
${files.map(file => `  - \`${formatPathReference(file)}\``).join('\n')}`
    )
    .join('\n')}
`
}
function formatExportSource(source) {
  if (source.package) {
    return `${source.kind} \`${source.originalName}\` from package \`${source.package}\``
  }
  if (source.module) {
    return `${source.kind} \`${source.originalName}\` from \`${source.module}\``
  }
  return `${source.kind} \`${source.originalName}\``
}
function formatUndocumentedExports(exports, limit = 120) {
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
  return `${lines.join('\n')}
`
}
function formatDiagnostics(diagnostics, limit = 120) {
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
  return `${lines.join('\n')}
`
}
function formatUrlSamples(typeDocSymbols, oxSymbols) {
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
  return `${rows.join('\n')}
`
}
function createComparisonReport(
  generatedAt,
  oxContentPackage,
  exportGraph,
  entrypointModules,
  typeDocSymbols,
  oxSymbols,
  oxPageSymbols,
  generatedFiles,
  collisions,
  currentPageCount
) {
  const typeDocNameSet = new Set(typeDocSymbols.map(symbol => symbol.name))
  const oxPageNameSet = new Set(oxPageSymbols.map(symbol => symbol.name))
  const missingByName = typeDocSymbols.filter(symbol => !oxPageNameSet.has(symbol.name))
  const extraByName = oxPageSymbols.filter(symbol => !typeDocNameSet.has(symbol.name))
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
- render style: \`renderStyle: "markdown"\` emits pure native Markdown (fenced code blocks, tables, Markdown links) with no raw HTML; this script only normalizes generic angle brackets in headings for VitePress/Vue compatibility.
- display formats: \`indexFormat\`, \`parametersFormat\`, property/member formats, and \`enumMembersFormat\` are set to \`"table"\` to mirror the current TypeDoc configuration; \`typeDeclarationFormat\` is left as \`"none"\` because the TypeDoc config does not set it.
- stats summaries: \`renderStats: false\` omits ox-content's \`_N symbols \xB7 ..._\` summary lines for TypeDoc-like output.
- generated-by attribution: \`renderGeneratedBy: false\` omits ox-content's root attribution line for TypeDoc-like output.
- group order: \`groupOrder: ${JSON.stringify(apiOxGroupOrder)}\` mirrors \`packages/docs/typedoc.config.mjs\` for module index and nav group order.
- organization sort: \`sort: ${JSON.stringify(apiOxSort)}\` and \`sortEntryPoints: ${String(apiOxSortEntryPoints)}\` are passed to both Markdown and nav generation so page order and sidebar order stay aligned. \`kindSortOrder\` is intentionally unset because the current TypeDoc config does not set it.

## Summary

| Metric | Current TypeDoc | ox-content (typedoc) |
|---|---:|---:|
| Symbol entries | ${typeDocSymbols.length} | ${oxSymbols.length} |
| Unique symbol names | ${typeDocNameSet.size} | ${oxPageNameSet.size} |
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

${formatUrlSamples(typeDocSymbols, oxPageSymbols)}

## Missing Current TypeDoc Symbols

These symbols exist in current TypeDoc pages but were not present by symbol name in ox-content entrypoint extraction.

${formatSymbolList(missingByName)}

## Extra ox-content Symbols

These generated ox-content symbol pages do not have a current TypeDoc symbol page by the same name.

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
          ([name, symbols]) => `- \`${name}\`
${symbols
  .map(symbol => `  - ${symbol.kind} \`${symbol.url}\`${formatOxSymbolOrigin(symbol)}`)
  .join('\n')}`
        )
        .join('\n')}
`
}

## ox-content Output File Collisions

ox-content entrypoint output uses entrypoint file names. A collision here means two entrypoints would write the same Markdown file.

${formatCollisionList(collisions)}

## Generated Files

${generatedFiles.map(file => `- \`${file}\``).join('\n')}

## Migration Notes

- This comparison uses \`@ox-content/napi\` with \`pathStrategy: "typedoc"\`, so each symbol is emitted as its own nested page (\`{module}/{category}/{Name}.md\`) matching TypeDoc's \`/api/default/functions/cli\` layout, with a per-module \`index.md\`.
- Navigation is generated via \`generateDocsNavMetadataFromDocs(..., { pathStrategy: "typedoc" })\`, producing a deep \`module -> category -> symbol\` tree. ox-content's nav is framework-agnostic (\`{ title, path, children }\`), so this script only normalizes it to the VitePress sidebar shape (\`{ text, link, items }\`) on the consumer side (see .notes/029): module nodes link to their index, category nodes are link-less collapsible headers (no category index page exists, matching TypeDoc), and leaf symbol nodes link to their per-symbol pages. Leaf symbol dedupe and alphabetical ordering are handled upstream by ox-content v2.47.0+.
- \`linkStyle: "markdown"\` is used so VitePress' dead-link checker resolves the generated links; with \`cleanUrls: true\` they are still served as clean URLs at runtime.
- v2.40.0 display format options are used to render module indexes, parameters, properties, type-alias properties, and enum members as tables, matching the active \`typedoc-plugin-markdown\` settings.
- v2.42.0 module-level examples are passed through and rendered on module index pages such as \`combinators/index.md\`.
- v2.43.0 renders \`@experimental\` / \`@deprecated\` as GitHub Alert blocks and includes the declaration kind in TypeDoc-style symbol H1 titles.
- v2.44.0 renders \`@since\` / \`@version\` as \`## Since\` sections instead of generic tags, and this script passes \`sourcePath\` through so the TypeDoc path strategy has the canonical source metadata available.
- v2.45.0 renders all overload call signatures on typedoc symbol pages; this script carries \`hasBody\` through so implementation signatures can be omitted when public overloads exist.
- v2.45.0 \`renderStats: false\` is used so root/module indexes no longer emit ox-content stats summary lines.
- v2.46.0 \`groupOrder\` is used for both Markdown and nav generation so module index sections and sidebar groups follow the current TypeDoc ordering.
- v2.47.0 sorts/dedupes TypeDoc nav leaf entries and sorts class/interface/type members alphabetically, so this script no longer postprocesses nav leaves or member order.
- v2.48.0 omits the redundant \`Kind\` column from named member tables, bringing interface/class/type member tables closer to TypeDoc output.
- v2.49.0 links known symbols inside type annotations, so Type Parameter constraints/defaults and Type cells can navigate to matching API pages like TypeDoc.
- v2.50.0 preserves TypeScript primitive/global names such as \`string\` and \`boolean\` as code in type annotations, avoiding false links to same-named public API symbols.
- v2.51.0 exposes TypeDoc-compatible \`sort\`, \`sortEntryPoints\`, and \`kindSortOrder\` organization options. This script passes the same sort inputs to Markdown and nav generation so sidebar ordering does not diverge from page ordering.
- v2.51.0 uses the entry source path for TypeDoc-strategy module index source links, so module \`**[Source]**\` links point at the real entry file instead of the module name.
- v2.52.0 through v2.54.0 are release/version updates for the docs NAPI relative to v2.51.0; this generated output is pinned to the latest \`@ox-content/napi@${oxContentPackage.version}\`.
- v2.55.0 fixes the remaining TypeDoc-parity rendering gaps for this migration pass: mixed Markdown \`@example\` bodies, multiline type parameter cells, return type literal members, class method details, interface index signatures, function-valued property types, and function type alias parameter/return metadata.
- v2.56.0 fixes return union pipe escaping in top-level \`Returns\`, expands object literal function parameters (including nested \`options.*\` rows), and renders member-level type parameters for generic interface/class methods.
- v2.57.0 suppresses non-function property \`Returns\` sections for description-only \`@returns\`, merges destructured parameter docs into their parent parameters, and resolves callable metadata for intersection type aliases.
- v2.59.0 omits empty Type Parameter description columns, strips raw JSDoc text from type alias signatures, avoids duplicate function-valued property Returns content, and adds \`renderGeneratedBy: false\` so the root attribution line can be removed without postprocessing.
- \`externalDocs: true\` (with \`externalPackageSources\` overrides) resolves external package re-exports into documentation entries, so \`args-tokens\` (\`parseArgs\`, \`resolveArgs\`, combinators, \`kebabnize\`), \`@gunshi/plugin-renderer\` (\`renderHeader\`, \`renderUsage\`, \`renderValidationErrors\`) and \`@gunshi/plugin-i18n\` (\`DefaultTranslation\`) now appear as docs entries. This brings missing-by-name down to 0.
- \`{@link}\` / \`{@linkcode}\` inline tags are resolved by the renderer: known symbols become internal links (e.g. \`{@linkcode Command | entry command}\` -> a link to the \`Command\` page), and unresolvable symbols (not part of gunshi's public API, e.g. \`TranslationAdapter\`) fall back to inline code. No raw \`{@link}\` tags remain in the generated pages.
- Overloads are unified into a single page/anchor per symbol (\`cli\`, \`define\`, \`lazy\`, \`plugin\`) and v2.45.0 renders each public overload as a call signature instead of letting the implementation \`any\` signature overwrite the page. The "Symbol entries" count above still counts overloads and cross-entrypoint re-exports separately, but each \`{module}/{category}/{Name}.md\` page is unique.
- Members are exposed/rendered for documented class/interface/type/enum entries, so pages such as \`Command\` include member data; \`enum\` symbols now get \`enumerations/{Name}\` pages.
- \`internal: false\` is passed to entrypoint extraction to match TypeDoc \`--excludeInternal\`.
- \`renderStyle: "markdown"\` (ox-content v2.29.0+) emits pure native Markdown \u2014 tables for params/members, fenced code blocks for signatures/examples, and Markdown links \u2014 with no raw HTML. This makes every inline \`{@link}\` / \`{@linkcode}\` a Markdown link that VitePress transforms to a clean URL and dead-link-checks (fixing the broken raw-HTML \`.md\` links), and removes the need for the previous \`v-pre\` / brace-escaping postprocess. The only remaining local normalization is escaping generic angle brackets in headings (e.g. \`Command\\<G\\>\`) so Vue does not parse them as HTML.
- Remaining differences are limited to the module-index breadcrumb tracked in .notes/035.
`
}
async function main() {
  const generatedAt = /* @__PURE__ */ new Date().toISOString()
  const { napi, oxContentPackage } = loadOxContentNapi()
  const typeDocBaseline = await readCurrentTypeDocBaseline()
  const extractionOptions = {
    root: docsRoot,
    tsconfig: tsconfigPath,
    private: false,
    internal: false,
    // v2.26.0+: resolve external package re-exports into docs entries. The
    // resolver prefers the `types` condition, so `args-tokens` resolves to its
    // bundled `.d.ts` (JSDoc preserved) and `@gunshi/plugin-*` workspace
    // packages resolve to `packages/*/src` via tsconfig path aliases.
    externalDocs: true,
    externalPackageSources,
    // v2.34.0+: opt in to TSDoc-style type-parameter docs so generics get a
    // "Type Parameters" table (constraints + defaults), matching TypeDoc.
    typeParameters: true
  }
  const exportGraph = napi.buildExportGraph(entryPoints, extractionOptions)
  const entrypointModules = napi.extractDocsFromEntryPoints(entryPoints, extractionOptions)
  const modules = entrypointModules.map(module => ({
    file: module.file,
    // v2.32.0+: carry the module-level `@module` description through to the
    // generated module index page (instead of falling back to a symbol blurb).
    description: module.description,
    // v2.44.0 type metadata: keep the source path available to the typedoc path
    // strategy/canonical ownership logic.
    sourcePath: module.sourcePath,
    // v2.42.0+: carry module-level examples and tags so the renderer can emit
    // `## Example` and lifecycle alerts/sections on `{module}/index.md`.
    examples: module.examples,
    tags: module.tags,
    entries: module.entries.map(toMarkdownEntry)
  }))
  const generated = napi.generateDocsMarkdown(modules, {
    groupBy: 'file',
    githubUrl,
    basePath: apiOxBasePath,
    pathStrategy: 'flat',
    // v2.29.0+: emit pure native Markdown (tables, fenced code blocks, Markdown
    // links) instead of the themed raw-HTML `<details>` cards. This makes every
    // link — inline `{@link}` and navigation — a Markdown link that VitePress
    // transforms to a clean URL and dead-link-checks, fixing the broken inline
    // `.md` links that raw HTML produced (see .notes/028). It also removes the
    // need for the `v-pre` / brace-escaping postprocess.
    renderStyle: 'markdown',
    // Use markdown-style links (relative `.md`) so VitePress' dead-link checker
    // resolves module index pages. With `cleanUrls: true` these are still served
    // as clean URLs at runtime. (`linkStyle: "clean"` emits absolute
    // directory-index links like `/api-ox/agent` that the checker rejects.)
    linkStyle: 'markdown',
    // v2.40.0+: mirror the TypeDoc + typedoc-plugin-markdown display settings
    // used by packages/docs/typedoc.config.mjs so the ox-content output has the
    // same dense table layout for indexes, parameters, and member groups.
    indexFormat: 'table',
    parametersFormat: 'table',
    interfacePropertiesFormat: 'table',
    classPropertiesFormat: 'table',
    propertyMembersFormat: 'table',
    typeAliasPropertiesFormat: 'table',
    enumMembersFormat: 'table',
    // gunshi's TypeDoc config does not set this option, so keep ox-content's
    // default sentinel. For renderStyle: 'markdown', v2.40.0 treats it as list.
    typeDeclarationFormat: 'none',
    // v2.45.0+: TypeDoc does not emit ox-content's `_N symbols · ..._` summary
    // lines, so disable them for the comparison output.
    renderStats: false,
    // v2.59.0+: TypeDoc does not emit ox-content's root attribution line
    // (`Generated by [Ox Content]`), so disable it for comparison output.
    renderGeneratedBy: false,
    // v2.46.0+: keep module index section order aligned with TypeDoc.
    groupOrder: apiOxGroupOrder,
    // v2.51.0+: keep generated page entry/member ordering explicit and in sync
    // with nav metadata.
    sort: apiOxSort,
    sortEntryPoints: apiOxSortEntryPoints
  })
  const navItems = napi.generateDocsNavMetadataFromDocs(modules, {
    basePath: apiOxBasePath,
    pathStrategy: 'typedoc',
    groupOrder: apiOxGroupOrder,
    sort: apiOxSort,
    sortEntryPoints: apiOxSortEntryPoints
  })
  const vitepressNav = toVitePressNav(navItems)
  const oxSymbols = buildOxSymbols(modules)
  const collisions = [...groupBy(oxSymbols, symbol => symbol.outputFile)]
    .filter(([, group]) => new Set(group.map(symbol => symbol.sourceFile)).size > 1)
    .map(([outputFile, group]) => [
      outputFile,
      [...new Set(group.map(symbol => symbol.sourceFile))]
    ])
  await fs.rm(outDir, { recursive: true, force: true })
  await fs.mkdir(outDir, { recursive: true })
  for (const [fileName, content] of Object.entries(generated).sort(([left], [right]) =>
    left.localeCompare(right)
  )) {
    const target = path.join(outDir, fileName)
    await fs.mkdir(path.dirname(target), { recursive: true })
    await fs.writeFile(
      target,
      `${escapeHeadingAngleBrackets(content).trimEnd()}
`,
      'utf8'
    )
  }
  await fs.writeFile(
    path.join(outDir, 'docs.json'),
    napi.generateDocsDataJson(modules, generatedAt),
    'utf8'
  )
  await fs.writeFile(path.join(outDir, 'nav.ts'), renderNavModule(vitepressNav), 'utf8')
  const generatedFiles = (await walkFiles(outDir))
    .map(file => toPosix(path.relative(outDir, file)))
    .sort()
  const oxPageSymbols = buildOxPageSymbols(generatedFiles)
  const report = createComparisonReport(
    generatedAt,
    oxContentPackage,
    exportGraph,
    entrypointModules,
    typeDocBaseline.symbols,
    oxSymbols,
    oxPageSymbols,
    generatedFiles,
    collisions,
    typeDocBaseline.pageCount
  )
  await fs.writeFile(path.join(outDir, 'comparison.md'), report, 'utf8')
  console.log(`Generated ox-content API comparison to ${toPosix(path.relative(repoRoot, outDir))}`)
  console.log(`Current TypeDoc symbols: ${typeDocBaseline.symbols.length}`)
  console.log(`ox-content entrypoint symbols: ${oxSymbols.length}`)
  console.log(`Output file collisions: ${collisions.length}`)
}
await main()
