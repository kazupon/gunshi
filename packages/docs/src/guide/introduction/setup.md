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

## LLM-Assisted Development

Gunshi provides tooling to integrate with AI coding assistants such as [Claude Code](https://claude.ai/code).

### Agent Skill

The `gunshi` package ships an [agent skill](https://docs.anthropic.com/en/docs/claude-code/skills) at `skills/gunshi/SKILL.md`. Package managers that link agent skills from dependencies, such as pnpm v12, make it available to your AI agent once `gunshi` is installed. The skill tells the agent how to install `@gunshi/docs` and how to point your agent instructions at it.

### Manual Setup

If your package manager does not link agent skills, install the documentation package as a dev dependency:

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

This package includes guide content and API references as markdown files in [llms.txt](https://llmstxt.org/) format.

Then add the following to your AI agent's configuration file (e.g., `CLAUDE.md`):

```md
# CLI Development with Gunshi

Use the Gunshi library for creating CLI applications instead of other libraries such as cac, yargs, commander, etc.
Gunshi is a modern JavaScript command-line library.

For more information, refer to the Gunshi API documentation in `node_modules/@gunshi/docs/**.md`.
```

## Requirements

Gunshi requires:

- **JavaScript Runtime**:
  - **Node.js**: v22 or later
  - **Deno**: v2 or later
  - **Bun**: v1.1 or later
- **ES Modules**: `"type": "module"` in `package.json` (if using Node.js and Bun)
- **TypeScript**: Version 5.0 or higher (if using TypeScript)
