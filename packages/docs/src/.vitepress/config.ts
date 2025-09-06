import { defineConfig } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'
import llmstxt from 'vitepress-plugin-llms'
import typedocSidebar from '../api/typedoc-sidebar.json' with { type: 'json' }

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Gunshi',
  description: 'Modern JavaScript Command-line library',
  lastUpdated: true,
  cleanUrls: true,

  head: [
    ['meta', { name: 'theme-color', content: '#468c56' }],
    ['link', { rel: 'icon', type: 'image/x-icon', href: '/favicon.png' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'en' }],
    ['meta', { property: 'og:title', content: 'Gunshi | Modern javascript command-line library' }],
    ['meta', { property: 'og:image', content: 'https://gunshi.dev/og-image.png' }],
    ['meta', { property: 'og:site_name', content: 'Gunshi' }],
    ['meta', { property: 'og:url', content: 'https://gunshi.dev/' }]
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/symbol.png',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/introduction/what-is-gunshi' },
      { text: 'API', link: '/api' },
      { text: 'Showcase', link: '/showcase' },
      { text: 'GitHub', link: 'https://github.com/kazupon/gunshi' }
    ],

    sidebar: [
      {
        text: 'Introduction',
        collapsed: false,
        items: [
          { text: "What's Gunshi?", link: '/guide/introduction/what-is-gunshi' },
          { text: 'Setup', link: '/guide/introduction/setup' }
        ]
      },
      {
        text: 'Essentials',
        collapsed: false,
        items: [
          { text: 'Getting Started', link: '/guide/essentials/getting-started' },
          { text: 'Declarative Configuration', link: '/guide/essentials/declarative' },
          { text: 'Type Safe', link: '/guide/essentials/type-safe' },
          { text: 'Composable', link: '/guide/essentials/composable' },
          { text: 'Lazy & Async', link: '/guide/essentials/lazy-async' },
          { text: 'Auto Usage Generation', link: '/guide/essentials/auto-usage' },
          { text: 'Plugin System', link: '/guide/essentials/plugin-system' }
        ]
      },
      {
        text: 'Advanced',
        collapsed: false,
        items: [
          { text: 'Command Hooks', link: '/guide/advanced/command-hooks' },
          { text: 'Internationalization', link: '/guide/advanced/internationalization' },
          { text: 'Custom Usage Generation', link: '/guide/advanced/custom-usage-generation' },
          { text: 'Documentation Generation', link: '/guide/advanced/documentation-generation' },
          {
            text: 'Advanced Lazy Loading and Sub-Commands',
            link: '/guide/advanced/advanced-lazy-loading'
          }
        ]
      },
      {
        text: 'Plugin',
        collapsed: false,
        items: [
          { text: 'Plugin System Introduction', link: '/guide/plugin/introduction.md' },
          {
            text: 'Getting Started with Plugin Development',
            link: '/guide/plugin/getting-started.md'
          },
          { text: 'Plugin Lifecycle', link: '/guide/plugin/lifecycle.md' },
          { text: 'Plugin Dependencies', link: '/guide/plugin/dependencies.md' },
          { text: 'Plugin Decorators', link: '/guide/plugin/decorators.md' },
          { text: 'Plugin Extensions', link: '/guide/plugin/extensions.md' },
          { text: 'Plugin Type System', link: '/guide/plugin/type-system.md' },
          { text: 'Plugin Testing', link: '/guide/plugin/testing.md' },
          { text: 'Plugin Development Guidelines', link: '/guide/plugin/guidelines.md' }
        ]
      },
      {
        text: 'API References',
        collapsed: false,
        items: typedocSidebar
      },
      {
        text: 'Extra Topics',
        collapsed: false,
        items: [
          {
            text: 'Showcase',
            link: '/showcase'
          },
          {
            text: 'Credits',
            link: '/credits'
          }
        ]
      }
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
    plugins: [groupIconVitePlugin(), llmstxt()]
  }
})
