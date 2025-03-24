import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Gunshi',
  description: 'Modern JavaScript Command-line library',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/introduction/what-is-gunshi' },
      { text: 'GitHub', link: 'https://github.com/kazupon/gunshi' }
    ],

    sidebar: [
      {
        text: 'Introduction',
        collapsed: false,
        items: [
          { text: "What's Gunshi?", link: '/guide/introduction/what-is-gunshi' },
          { text: 'Installation', link: '/guide/introduction/installation' }
        ]
      },
      {
        text: 'Essentials',
        collapsed: false,
        items: [
          { text: 'Getting Started', link: '/guide/essentials/getting-started' },
          {
            text: 'Declarative Configuration',
            link: '/guide/essentials/declarative-configuration'
          },
          { text: 'Type Safe', link: '/guide/essentials/type-safe' },
          { text: 'Composable', link: '/guide/essentials/composable' },
          { text: 'Lazy & Async', link: '/guide/essentials/lazy-async' },
          { text: 'Auto Usage Generation', link: '/guide/essentials/auto-usage-generation' },
          { text: 'Internationalization', link: '/guide/essentials/internationalization' }
        ]
      },
      {
        text: 'Advanced',
        collapsed: false,
        items: [
          { text: 'Custom Usage Generation', link: '/guide/advanced/custom-usage-generation' },
          { text: 'Documentation Generation', link: '/guide/advanced/documentation-generation' },
          { text: 'Translation Adapter', link: '/guide/advanced/translation-adapter' }
        ]
      }
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/kazupon/gunshi' }]
  }
})
