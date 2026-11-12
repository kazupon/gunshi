import { describe, expect, test } from 'vite-plus/test'
import { cli } from '../../gunshi/src/cli/bone.ts'
import { define } from '../../gunshi/src/definition.ts'
import { getDeprecatedCommands, isDeprecated } from './deprecation.ts'

describe('getDeprecatedCommands', () => {
  test('reads the mark that the core puts on the context, with the deprecated commands on the path', async () => {
    const add = define({ name: 'add', deprecated: true, run: () => {} })
    const remote = define({ name: 'remote', subCommands: { add } })
    const oldRemote = define({ ...remote, name: 'old-remote', deprecated: 'Use remote.' })
    const marks: unknown[] = []
    const options = {
      subCommands: { remote, 'old-remote': oldRemote },
      onBeforeCommand: (ctx: object) => {
        marks.push(getDeprecatedCommands(ctx))
      }
    }

    await cli(['old-remote', 'add'], define({ name: 'demo', run: () => {} }), options)
    await cli(['remote', 'add'], define({ name: 'demo', run: () => {} }), options)
    await cli([], define({ name: 'demo', run: () => {} }), options)

    expect(marks).toEqual([
      [
        { commandPath: ['old-remote'], deprecated: 'Use remote.' },
        { commandPath: ['old-remote', 'add'], deprecated: true }
      ],
      [{ commandPath: ['remote', 'add'], deprecated: true }],
      []
    ])
    expect(getDeprecatedCommands({})).toEqual([])
  })
})

describe('isDeprecated', () => {
  test('is true for true and for a text', () => {
    expect(isDeprecated(true)).toBe(true)
    expect(isDeprecated('Use --output.')).toBe(true)
    expect(isDeprecated('')).toBe(true)
    expect(isDeprecated(false)).toBe(false)
    expect(isDeprecated(undefined)).toBe(false)
  })
})
