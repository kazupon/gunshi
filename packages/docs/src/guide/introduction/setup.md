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

## LLM-Assisted Development

Gunshi provides tooling to integrate with AI coding assistants such as [Claude Code](https://claude.ai/code) and [Cursor](https://cursor.com/).

### Automatic Setup (Recommended)

You can quickly set up LLM-assisted development for your project using the CLI tool:

::: code-group

```sh [npm]
npx @gunshi/docs@beta
```

```sh [pnpm]
pnpm dlx @gunshi/docs@beta
```

```sh [yarn]
yarn dlx @gunshi/docs@beta
```

```sh [bun]
bun x @gunshi/docs@beta
```

:::

This command automatically configures:

- [Claude Code skills](https://docs.anthropic.com/en/docs/claude-code/skills) for Claude Code
- [Cursor rules](https://docs.cursor.com/context/rules-for-ai) for Cursor

<details>
<summary>Manual Setup</summary>

If you prefer manual configuration, install the documentation package as a dev dependency:

::: code-group

```sh [npm]
npm install --save-dev @gunshi/docs@beta gunshi@beta
```

```sh [pnpm]
pnpm add -D @gunshi/docs@beta gunshi@beta
```

```sh [yarn]
yarn add -D @gunshi/docs@beta gunshi@beta
```

```sh [bun]
bun add -D @gunshi/docs@beta gunshi@beta
```

:::

This package includes guide content and API references as markdown files in [llms.txt](https://llmstxt.org/) format.

Then add the following to your AI agent's configuration file (e.g., `CLAUDE.md` and `.cursor/rules/use-gunshi-cli.md`):

```md
# CLI Development with Gunshi

Use the Gunshi library for creating CLI applications instead of other libraries such as cac, yargs, commander, etc.
Gunshi is a modern JavaScript command-line library.

For more information, refer to the Gunshi API documentation in `node_modules/@gunshi/docs/**.md`.
```

</details>

## Requirements

Gunshi requires:

- **JavaScript Runtime**:
  - **Node.js**: v20 or later
  - **Deno**: v2 or later
  - **Bun**: v1.1 or later
- **ES Modules**: `"type": "module"` in `package.json` (if using Node.js and Bun)
- **TypeScript**: Version 5.0 or higher (if using TypeScript)
