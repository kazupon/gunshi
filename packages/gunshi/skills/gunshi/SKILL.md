---
name: gunshi
description: Use this skill when building a command-line interface with the Gunshi library, or setting up a repository that uses it.
---

## Step 1: Install @gunshi/docs

The docs must match the installed Gunshi version. Read `version` from
`node_modules/gunshi/package.json`, then install the docs at exactly that version
as a dev dependency with the user's preferred package manager:

```sh
pnpm add -D @gunshi/docs@<gunshi version>
```

Alternatively, ask the user whether to set up Gunshi with its setup command.
If they agree, run it with `--yes` to skip its interactive prompt. It installs
`gunshi` and `@gunshi/docs` at the version given here:

```sh
npx @gunshi/docs@<gunshi version> --yes
```

## Step 2: Update AGENTS.md / CLAUDE.md

Ensure that the agent instructions contain the following:

```md
# Learning more about Gunshi

This repository uses the Gunshi library for its command-line interface.

Before writing any Gunshi code, first read `node_modules/@gunshi/docs/README.md`
**completely**, and follow the links in the file when required.
```
