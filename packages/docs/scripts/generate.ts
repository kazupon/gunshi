import fs from 'node:fs/promises'
import path from 'node:path'
import {
  advanced,
  apiReferences,
  essentials,
  extraTopics,
  introduction,
  meta,
  plugin
} from '../src/.vitepress/contents.ts'

import type { Sidebar } from '../src/.vitepress/contents.ts'

function renderReadme(version: string) {
  const base = 'src'
  return `# ${meta.title}

> ${meta.description}

${meta.tagline}

The documentation of Gunshi ${version} in Markdown, for the same version of \`gunshi\`. The docs of the latest version are at [gunshi.dev](https://gunshi.dev).

## For Coding Agents

Before writing code with Gunshi, read \`node_modules/gunshi/AGENTS.md\` completely. It comes with the \`gunshi\` package, for the installed version, and has a complete example, the rules that the example does not show, and which guide to read for a task. The guides and the API references are the Markdown files under \`src/\`, linked below.

## Table of Contents

${renderContents(introduction, base)}
${renderContents(essentials, base)}
${renderContents(advanced, base)}
${renderContents(plugin, base)}
${renderContents(apiReferences, base, 'index')}
${renderContents(extraTopics, base)}`
}

function renderContents(content: Sidebar, base = '', additionalPath = '') {
  // the links point to the Markdown files, so that they can be opened as they are
  return `### ${content.text}

${content.items.reduce((acc, item) => {
  return acc + `- [${item.text}](${path.join(base, item.link, additionalPath)}.md)\n`
}, '')}`
}

async function main() {
  console.log('Generating README.md ...')

  const { version } = JSON.parse(
    await fs.readFile(path.resolve(import.meta.dirname, '../package.json'), 'utf8')
  )
  const readme = renderReadme(version)
  const contentsPath = path.resolve(import.meta.dirname, '../README.md')
  await fs.writeFile(contentsPath, readme)

  console.log('Done!')
}

await main()
