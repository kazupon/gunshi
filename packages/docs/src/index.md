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
    details: Run the commands with simple API and support universal runtime.

  - icon: ⚙️
    title: Declarative Configuration
    details: Configure command modules declaratively for better organization and maintainability.

  - icon: 🛡️
    title: Type Safe
    details: TypeScript support with type-safe argument parsing and option resolution.

  - icon: 🧩
    title: Composable
    details: Create modular sub-commands that can be composed together for complex CLIs.

  - icon: ⏳
    title: Lazy & Async
    details: Load command modules lazily and execute them asynchronously for better performance.

  - icon: 📜
    title: Auto Usage Generation
    details: Generate helpful usage messages automatically for your commands.

  - icon: 🎨
    title: Custom Usage Generation
    details: Customize how usage messages are generated to match your CLI's style.

  - icon: 🌍
    title: Internationalization
    details: Support multiple languages with built-in i18n, locale resource lazy loading and i18n library integration.
---
