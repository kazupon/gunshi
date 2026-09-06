import { expect, test } from 'vitest'
import config from './bump.config.ts'

test('bumpp config writes generated notes before the release commit', () => {
  expect(config.files).toEqual(['package.json', 'packages/**/package.json', 'packages/**/jsr.json'])
  expect(config.all).toBe(true)
  expect(config.commit).toBe('release: v%s')
  expect(config.tag).toBe(true)
  expect(config.push).toBe(true)
  expect(config.execute).toBeTypeOf('function')

  const source = String(config.execute)
  expect(source).toMatch(/source:\s*['"]generated-notes['"]/)
  expect(source).toMatch(/targetCommitish:\s*['"]HEAD['"]/)
  expect(source).toContain('updateChangelog')
})
