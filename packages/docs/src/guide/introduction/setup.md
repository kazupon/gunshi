# Setup

Gunshi can be installed in various JavaScript environments. Choose the installation method that matches your project setup.

## Install

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
# For Deno projects, you can add Gunshi from JSR:
deno add jsr:@kazupon/gunshi
```

```sh [bun]
bun add gunshi
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
