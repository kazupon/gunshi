# Installation

Gunshi can be installed in various JavaScript environments. Choose the installation method that matches your project setup.

## Node.js

You can install Gunshi using npm, pnpm, or yarn:

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

:::

## Deno

For Deno projects, you can add Gunshi from JSR:

```sh
deno add jsr:@kazupon/gunshi
```

## Bun

For Bun projects, you can install Gunshi with:

```sh
bun add gunshi
```

## Requirements

Gunshi requires:

- **Node.js**: Version 20 or higher
- **TypeScript**: Version 5.0 or higher (if using TypeScript)

## TypeScript Configuration

If you're using TypeScript, make sure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true
  }
}
```

Note: Set `"target"` to `"ES2022"` or higher.

## Next Steps

Once you have installed Gunshi, you can proceed to the [Getting Started](/guide/essentials/getting-started) guide to learn how to use it in your project.
