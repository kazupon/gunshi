import { expect, test } from 'vitest'
import {
  ARG_ERROR_RESOURCE_KEYS,
  COMMAND_BUILTIN_RESOURCE_KEYS,
  COMMAND_ERROR_RESOURCE_KEYS,
  SUGGESTION_ERROR_RESOURCE_KEYS
} from './constants.ts'
import DefaultResource from './resource.ts'

test('the default resource has a text for every built-in key', () => {
  // a key without a text is rendered with the English message of args-tokens, and no other test
  // notices it: the locales are only compared with `en-US`
  expect(Object.keys(DefaultResource)).toEqual(
    expect.arrayContaining([
      ...COMMAND_BUILTIN_RESOURCE_KEYS,
      ...ARG_ERROR_RESOURCE_KEYS,
      ...COMMAND_ERROR_RESOURCE_KEYS,
      ...SUGGESTION_ERROR_RESOURCE_KEYS
    ])
  )
})
