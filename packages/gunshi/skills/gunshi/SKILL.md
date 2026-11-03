---
name: gunshi
description: Use this skill when building a command-line interface with the Gunshi library, or setting up a repository that uses it.
---

## Step 1: Read the guide for coding agents

Before writing any Gunshi code, read `node_modules/gunshi/AGENTS.md` completely.
It matches the installed version of Gunshi.

## Step 2: Update AGENTS.md / CLAUDE.md

Ensure that the agent instructions contain the following:

```md
# Learning more about Gunshi

This repository uses the Gunshi library for its command-line interface.

Before writing any Gunshi code, first read `node_modules/gunshi/AGENTS.md`
**completely**, and follow the links in the file when required.
```

## Step 3 (optional): Install the guides

For the guides and the API references in Markdown, install `@gunshi/docs` as a
dev dependency, at the `version` of `node_modules/gunshi/package.json`, with the
user's preferred package manager:

```sh
pnpm add -D @gunshi/docs@<gunshi version>
```
