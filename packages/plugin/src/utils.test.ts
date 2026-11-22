import * as gunshiUtils from 'gunshi/utils'
import { expect, test } from 'vite-plus/test'
import * as utils from './utils.ts'

test('@gunshi/plugin/utils exports the same helpers as gunshi/utils', () => {
  expect(Object.keys(utils).sort()).toEqual(Object.keys(gunshiUtils).sort())
})
