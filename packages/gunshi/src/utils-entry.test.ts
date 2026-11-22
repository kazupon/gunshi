import { expect, test } from 'vite-plus/test'
import * as utils from './utils-entry.ts'

test('gunshi/utils exports only the helpers that a plugin uses to walk the commands', () => {
  expect(Object.keys(utils).sort()).toEqual([
    'getCommandSubCommands',
    'isLazyCommand',
    'kebabnize',
    'resolveLazyCommand'
  ])
})
