/**
 * The helpers of the i18n plugin reject the keys that an i18n command does not have (#871).
 *
 * NOTE(kazupon): a statement that must not type-check is written on one line, so that tsc (the type
 * tests) and tsgo (`oxlint --type-check`) report its error on the line under `@ts-expect-error`.
 */

import { cli, define, lazy } from 'gunshi'
import { expectTypeOf, test } from 'vitest'
import { defineI18n, defineI18nWithTypes, withI18nResource } from './helpers.ts'

import type { SubCommandable } from 'gunshi'

const run = () => {}
const resource = async () => ({ description: 'Deploy the app' })

test('defineI18n and defineI18nWithTypes reject the keys that a command does not have', () => {
  // @ts-expect-error `desc` is not a key of a command
  defineI18n({ name: 'deploy', desc: 'Deploy', resource, run })
  // @ts-expect-error `desc` is not a key of a command
  defineI18nWithTypes<{ extensions: {} }>()({ name: 'deploy', desc: 'Deploy', resource, run })
})

test('withI18nResource rejects them in an object', () => {
  // @ts-expect-error `desc` is not a key of a command
  withI18nResource({ name: 'deploy', desc: 'Deploy', run }, resource)
})

test('the helpers take the keys of an i18n command', () => {
  const deploy = defineI18n({ name: 'deploy', resource, run })
  expectTypeOf(deploy.resource).not.toBeNullable()
  const translated = withI18nResource(define({ name: 'deploy', run }), resource)
  expectTypeOf(translated.name).toEqualTypeOf<string>()
})

test('withI18nResource takes a SubCommandable, which has commandName', () => {
  const command: SubCommandable = { name: 'deploy', run }
  expectTypeOf(withI18nResource(command, resource).commandName).toEqualTypeOf<string | undefined>()
})

test('withI18nResource keeps a lazy command callable (#877)', async () => {
  const lazyCommand = lazy(async () => define({ name: 'deploy', run }), { name: 'deploy' })
  const translated = withI18nResource(lazyCommand, resource)
  expectTypeOf(translated).toBeCallableWith()
  expectTypeOf(translated.commandName).toEqualTypeOf<string>()
  expectTypeOf(translated.resource).not.toBeNullable()
  await cli([], define({ name: 'app', run }), { subCommands: { deploy: translated } })
  await cli([], translated)
})
