import fs from 'node:fs/promises'
import path from 'node:path'
import {
  advanced,
  apiReferences,
  essentials,
  extraTopics,
  introduction,
  meta
} from '../src/.vitepress/contents.ts'

import type { Sidebar } from '../src/.vitepress/contents.ts'

function renderReadme() {
  const base = './src'
  return `
# ${meta.title}

> ${meta.description}

${meta.tagline}

## Table of Contents

${renderContents(introduction, base)}
${renderContents(essentials, base)}
${renderContents(advanced, base)}
${renderContents(apiReferences, base, 'index')}
${renderContents(extraTopics, base)}
`
}

function renderContents(content: Sidebar, base = '', additionalPath = '') {
  return `### ${content.text}

${content.items.reduce((acc, item) => {
  return acc + `- [${item.text}](${path.join(base, item.link, additionalPath)})\n`
}, '')}
`
}

async function main() {
  console.log('Generating README.md ...')

  const readme = renderReadme()
  const contentsPath = path.resolve(import.meta.dirname, '../README.md')
  await fs.writeFile(contentsPath, readme)

  console.log('Done!')
}

await main()
