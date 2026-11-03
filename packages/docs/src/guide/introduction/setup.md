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

The `gunshi` package ships a guide for coding agents, `AGENTS.md`, for the installed version. It has a complete example, the rules that the example does not show, and which guide to read for a task. Your AI agent reads it when your agent instructions point to it.

### Agent Skill

The `gunshi` package also ships an [agent skill](https://docs.anthropic.com/en/docs/claude-code/skills) at `skills/gunshi/SKILL.md`. Package managers that link agent skills from dependencies, such as pnpm v12, make it available to your AI agent once `gunshi` is installed and its skills are approved (`pnpm approve`). The skill has the agent read the guide, and add the instructions of the [manual setup](#manual-setup) to `AGENTS.md` or `CLAUDE.md`.

An agent uses a skill only when it decides to, and it may not add the instructions while it works on something else. Check that your agent instructions have them.

### Manual Setup

Add the following to your AI agent's instructions (e.g., `AGENTS.md` or `CLAUDE.md`):

```md
# Learning more about Gunshi

This repository uses the Gunshi library for its command-line interface.

Before writing any Gunshi code, first read `node_modules/gunshi/AGENTS.md`
**completely**, and follow the links in the file when required.
```

### Guides and API References

The guide for coding agents links to the guides and the API references of `@gunshi/docs`. To let your AI agent read them in Markdown, install the documentation package as a dev dependency, at the same version as `gunshi`:

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

## Requirements

Gunshi requires:

- **JavaScript Runtime**:
  - **Node.js**: v22 or later
  - **Deno**: v2 or later
  - **Bun**: v1.1 or later
- **ES Modules**: `"type": "module"` in `package.json` (if using Node.js and Bun)
- **TypeScript**: Version 5.0 or higher (if using TypeScript)
