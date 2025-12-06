# Setup

Gunshi can be installed in various JavaScript environments. Choose the installation method that matches your project setup.

## Install

### Stable

::: code-group

```sh [npm]
npm install --save gunshi
```

```sh [pnpm]
pnpm add gunshi
```

```sh [yarn]
yarn add gunshi
```

```sh [deno]
# For deno projects, you can add Gunshi from JSR:
deno add jsr:@gunshi/gunshi
```

```sh [bun]
bun add gunshi
```

:::

### v0.27 Beta

::: code-group

```sh [npm]
npm install --save gunshi@beta
```

```sh [pnpm]
pnpm add gunshi@beta
```

```sh [yarn]
yarn add gunshi@beta
```

```sh [deno]
## you can specify version with `@`
deno add jsr:@gunshi/gunshi@0.27.2
```

```sh [bun]
bun add gunshi@beta
```

:::

## Requirements

Gunshi requires:

- **JavaScript Runtime**:
  - **Node.js**: v20 or later
  - **Deno**: v2 or later
  - **Bun**: v1.1 or later
- **ES Modules**: `"type": "module"` in `package.json` (if using Node.js and Bun)
- **TypeScript**: Version 5.0 or higher (if using TypeScript)

## LLM-Assisted Development

Gunshi provides resources to help AI agents (Claude Code, GitHub Copilot, Cursor, etc.) understand the framework.

### `llms.txt`

Gunshi's documentation site provides `llms.txt` for LLM context:

- [llms.txt](https://gunshi.dev/llms.txt) - Summary of documentation
- [llms-full.txt](https://gunshi.dev/llms-full.txt) - Full documentation content

You can reference these URLs in your AI agent's configuration files (e.g., `CLAUDE.md`, `.cursor/rules.md`).

### `@gunshi/docs` Package

For offline access or bundling with your project, install the documentation package:

::: code-group

```sh [npm]
npm install --save-dev @gunshi/docs
```

```sh [pnpm]
pnpm add -D @gunshi/docs
```

```sh [yarn]
yarn add -D @gunshi/docs
```

```sh [bun]
bun add -D @gunshi/docs
```

:::

This package includes guide content and API references as markdown files like `llms.txt` in `node_modules/@gunshi/docs/README.md`,

You can reference the about path in your AI agent's configuration files (e.g., `CLAUDE.md`, `.cursor/rules.md`).
