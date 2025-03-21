---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: 'Gunshi'
  text: 'Modern JavaScript Command-line Library'
  tagline: 'Build powerful, type-safe, and user-friendly command-line interfaces with ease'
  image:
    src: /logo.webp
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
    title: Simple
    details: Run commands with a minimal, easy-to-use API that simplifies CLI development.

  - icon: 🛡️
    title: Type Safe
    details: Enjoy full TypeScript support with type-safe argument parsing and option resolution.

  - icon: ⚙️
    title: Declarative Configuration
    details: Configure command modules declaratively for better organization and maintainability.

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
    details: Support multiple languages with built-in i18n and locale resource lazy loading.
---
