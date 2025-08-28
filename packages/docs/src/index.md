---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'Gunshi'
  text: 'Modern JavaScript Command-line Library'
  tagline: 'Robust, modular, flexible, and localizable CLI library'
  image:
    src: /logo.png
    alt: Gunshi
  actions:
    - theme: brand
      text: Get Started
      link: /guide/introduction/what-is-gunshi
    - theme: alt
      text: View on GitHub
      link: https://github.com/kazupon/gunshi

features:
  - icon: 📏
    title: Simple & Universal
    details: Run commands with simple API and support for universal runtime (Node.js, Deno, Bun).

  - icon: ⚙️
    title: Declarative & Type Safe
    details: Configure commands declaratively with full TypeScript support and type-safe argument parsing.

  - icon: 🧩
    title: Composable & Lazy
    details: Create modular sub-commands with context sharing and lazy loading for better performance.

  - icon: 🎨
    title: Flexible Rendering
    details: Customize usage generation, validation errors, and help messages with pluggable renderers.

  - icon: 🌍
    title: Internationalization
    details: Built with global users in mind, featuring locale-aware design, resource management, and multi-language support.

  - icon: 🔌
    title: Pluggable
    details: Extensible plugin system with dependency management and lifecycle hooks for modular CLI development.
---
