import { defineConfig } from 'bumpp'
import { updateChangelog } from 'gh-changelogen'

export default defineConfig({
  files: ['package.json', 'packages/**/package.json', 'packages/**/jsr.json'],
  all: true,
  commit: 'release: v%s',
  tag: true,
  push: true,
  execute: async operation => {
    await updateChangelog({
      repository: 'kazupon/gunshi',
      tagName: `v${operation.state.newVersion}`,
      source: 'generated-notes',
      targetCommitish: 'HEAD',
      output: 'CHANGELOG.md'
    })
  }
})
