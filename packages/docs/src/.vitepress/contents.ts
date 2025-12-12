import typedocSidebar from '../api/typedoc-sidebar.json' with { type: 'json' }

export const meta = {
  title: 'Gunshi',
  description: 'Modern JavaScript Command-line library',
  tagline: 'Robust, modular, flexible, and localizable CLI library'
}

export type Sidebar = {
  text: string
  collapsed?: boolean
  items: Array<{ text: string; link: string }>
}

export const introduction = {
  text: 'Introduction',
  collapsed: false,
  items: [
    { text: "What's Gunshi?", link: '/guide/introduction/what-is-gunshi' },
    { text: 'Setup', link: '/guide/introduction/setup' }
  ]
}

export const essentials = {
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
}

export const advanced = {
  text: 'Advanced',
  collapsed: false,
  items: [
    { text: 'Type System', link: '/guide/advanced/type-system' },
    { text: 'Command Hooks', link: '/guide/advanced/command-hooks' },
    { text: 'Context Extensions', link: '/guide/advanced/context-extensions' },
    { text: 'Custom Rendering', link: '/guide/advanced/custom-rendering' },
    { text: 'Internationalization', link: '/guide/advanced/internationalization' },
    { text: 'Documentation Generation', link: '/guide/advanced/docs-gen' },
    {
      text: 'Advanced Lazy Loading and Sub-Commands',
      link: '/guide/advanced/advanced-lazy-loading'
    }
  ]
}

export const plugin = {
  text: 'Plugin',
  collapsed: false,
  items: [
    { text: 'Plugin System Introduction', link: '/guide/plugin/introduction' },
    {
      text: 'Getting Started with Plugin Development',
      link: '/guide/plugin/getting-started'
    },
    { text: 'Plugin Lifecycle', link: '/guide/plugin/lifecycle' },
    { text: 'Plugin Dependencies', link: '/guide/plugin/dependencies' },
    { text: 'Plugin Decorators', link: '/guide/plugin/decorators' },
    { text: 'Plugin Extensions', link: '/guide/plugin/extensions' },
    { text: 'Plugin Type System', link: '/guide/plugin/type-system' },
    { text: 'Plugin Testing', link: '/guide/plugin/testing' },
    { text: 'Plugin Development Guidelines', link: '/guide/plugin/guidelines' },
    { text: 'Plugin List', link: '/guide/plugin/list' }
  ]
}

export const apiReferences = {
  text: 'API References',
  collapsed: false,
  items: typedocSidebar
}

export const extraTopics = {
  text: 'Extra Topics',
  collapsed: false,
  items: [
    {
      text: 'Showcase',
      link: '/showcase'
    }
  ]
}

export const releaseNotes = {
  text: 'Release Notes',
  collapsed: false,
  items: [
    {
      text: 'Gunshi v0.27 Release Notes',
      link: '/release/v0.27'
    }
  ]
}
