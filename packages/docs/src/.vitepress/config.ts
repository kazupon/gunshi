// NOTE: Uncomment below when enabling the release banner
// import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
import { withOxContentApiDocs } from 'vitepress-api-references'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import llmstxt from 'vitepress-plugin-llms'
import { withMermaid } from 'vitepress-plugin-mermaid'
import pkgJson from '../../package.json' with { type: 'json' }
import {
  advanced,
  apiReferences,
  essentials,
  experimentals,
  extraTopics,
  introduction,
  meta,
  plugin,
  releaseNotes
} from './contents.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../../../..')
const require = createRequire(path.join(repoRoot, 'packages/gunshi/package.json'))
const argsTokensDir = path.dirname(require.resolve('args-tokens/package.json'))

// https://vitepress.dev/reference/site-config
export default defineConfig(
  await withOxContentApiDocs(
    withMermaid({
      ...meta,
      lastUpdated: true,
      cleanUrls: true,

      apiDocs: {
        root: repoRoot,
        tsconfig: 'tsconfig.json',
        entryPoints: [
          { path: 'packages/gunshi/src/index.ts', name: 'default' },
          { path: 'packages/gunshi/src/definition.ts', name: 'definition' },
          { path: 'packages/gunshi/src/context.ts', name: 'context' },
          { path: 'packages/gunshi/src/plugin.ts', name: 'plugin' },
          { path: 'packages/gunshi/src/generator.ts', name: 'generator' },
          { path: 'packages/gunshi/src/renderer.ts', name: 'renderer' },
          { path: 'packages/gunshi/src/combinators.ts', name: 'combinators' },
          { path: 'packages/gunshi/src/agent.ts', name: 'agent' }
        ],
        outDir: 'packages/docs/src/api',
        basePath: '/api',
        extraction: {
          private: false,
          internal: false,
          externalDocs: true,
          typeParameters: true,
          externalPackageSources: [
            { package: 'args-tokens', entry: path.join(argsTokensDir, 'lib/index.d.ts') },
            {
              package: 'args-tokens/combinators',
              entry: path.join(argsTokensDir, 'lib/combinators.d.ts')
            },
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
        },
        markdown: {
          groupBy: 'file',
          pathStrategy: 'typedoc',
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
        nav: {
          section: { text: 'API References', collapsed: false },
          collapsed: true,
          insert: 'replace',
          replaceText: 'API References'
        },
        docsJson: true,
        escapeHeadingAngleBrackets: true
      },

      head: [
        ['meta', { name: 'theme-color', content: '#468c56' }],
        ['link', { rel: 'icon', type: 'image/x-icon', href: '/favicon.png' }],
        ['meta', { property: 'og:type', content: 'website' }],
        ['meta', { property: 'og:locale', content: 'en' }],
        [
          'meta',
          { property: 'og:title', content: 'Gunshi | Modern javascript command-line library' }
        ],
        ['meta', { property: 'og:image', content: 'https://gunshi.dev/og-image.png' }],
        ['meta', { property: 'og:site_name', content: 'Gunshi' }],
        ['meta', { property: 'og:url', content: 'https://gunshi.dev/' }]
        // NOTE: Uncomment below to show a release banner
        // ['script', {}, readFileSync(path.resolve(__dirname, './banner.js'), 'utf8')]
      ],

      themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        logo: '/symbol.png',

        nav: [
          { text: 'Home', link: '/' },
          { text: 'Guide', link: '/guide/introduction/what-is-gunshi' },
          { text: 'API', link: '/api' },
          { text: 'Showcase', link: '/showcase' },
          {
            text: `v${pkgJson.version}`,
            items: [
              {
                text: 'v0.27 Release Notes',
                link: '/release/v0.27'
              },
              {
                items: [
                  {
                    text: 'Changelog',
                    link: 'https://github.com/kazupon/gunshi/blob/main/CHANGELOG.md'
                  },
                  {
                    text: 'Contributing',
                    link: 'https://github.com/kazupon/gunshi/blob/main/CONTRIBUTING.md'
                  }
                ]
              }
            ]
          },
          { text: 'GitHub', link: 'https://github.com/kazupon/gunshi' }
        ],

        sidebar: [
          introduction,
          essentials,
          advanced,
          experimentals,
          plugin,
          apiReferences,
          extraTopics,
          releaseNotes
        ],

        search: {
          provider: 'local'
        },

        socialLinks: [{ icon: 'github', link: 'https://github.com/kazupon/gunshi' }],

        footer: {
          message: 'Released under the MIT License.',
          copyright: 'Copyright © 2025 kazuya kawaguchi.'
        }
      },

      markdown: {
        config(md) {
          md.use(groupIconMdPlugin)
        }
      },

      vite: {
        optimizeDeps: {
          include: [
            '@braintree/sanitize-url',
            'dayjs',
            'debug',
            'cytoscape-cose-bilkent',
            'cytoscape'
          ]
        },
        resolve: {
          alias:
            process.env.NODE_ENV === 'production'
              ? undefined
              : {
                  debug: path.resolve(
                    __dirname,
                    '../../../../node_modules/.pnpm/debug@4.4.3/node_modules/debug/src/browser.js'
                  ),
                  '@braintree/sanitize-url': path.resolve(
                    __dirname,
                    '../../../../node_modules/.pnpm/@braintree+sanitize-url@7.1.2/node_modules/@braintree/sanitize-url/dist/index.js'
                  ),
                  dayjs: path.resolve(
                    __dirname,
                    '../../../../node_modules/.pnpm/dayjs@1.11.21/node_modules/dayjs/esm/index.js'
                  )
                }
        },

        plugins: [groupIconVitePlugin(), llmstxt()]
      },

      mermaid: { theme: 'forest' },
      mermaidPlugin: { class: 'mermaid my-class' }
    })
  )
)
