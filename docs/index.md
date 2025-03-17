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

<div class="vp-doc" style="max-width: 1152px; margin: 0 auto; padding: 24px 24px 96px;">

## Quick Example

```js
import { cli } from 'gunshi'

// Define a command
const command = {
  name: 'greet',
  description: 'A simple greeting command',
  options: {
    name: {
      type: 'string',
      short: 'n',
      description: 'Name to greet'
    },
    times: {
      type: 'number',
      short: 't',
      default: 1,
      description: 'Number of times to repeat the greeting'
    }
  },
  run: ctx => {
    const { name = 'World', times } = ctx.values

    for (let i = 0; i < times; i++) {
      console.log(`Hello, ${name}!`)
    }
  }
}

// Run the command
cli(process.argv.slice(2), command)
```

## Why Gunshi?

Gunshi is designed to make CLI development in JavaScript and TypeScript more enjoyable and productive:

- **Developer-friendly**: Simple API with TypeScript support
- **Flexible**: Compose commands and customize behavior as needed
- **Maintainable**: Declarative configuration makes code easier to understand
- **Performant**: Lazy loading ensures resources are only loaded when needed

Whether you're building a simple CLI tool or a complex command-line application with multiple sub-commands, Gunshi provides the features you need to create a great user experience.

## Installation

```sh
# npm
npm install --save gunshi

# pnpm
pnpm add gunshi

# yarn
yarn add gunshi

# bun
bun add gunshi

# deno
deno add jsr:@kazupon/gunshi
```

## Next Steps

Ready to get started? Check out the [Introduction](/guide/introduction/what-is-gunshi) to learn more about Gunshi and how to use it in your projects.

</div>
