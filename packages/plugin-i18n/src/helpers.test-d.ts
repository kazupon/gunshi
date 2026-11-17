/**
 * The helpers of the i18n plugin reject the keys that an i18n command does not have (#871), and the
 * keys that an argument does not have (#930).
 *
 * NOTE(kazupon): a statement that must not type-check is written on one line, so that tsc (the type
 * tests) and tsgo (`oxlint --type-check`) report its error on the line under `@ts-expect-error`.
 */

import { cli, define, lazy } from 'gunshi'
import { expectTypeOf, test } from 'vite-plus/test'
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

test('defineI18n and defineI18nWithTypes reject the keys that an argument does not have', () => {
  const defineI18nCommand = defineI18nWithTypes<{ extensions: {} }>()
  // @ts-expect-error `desc`: the key of the description is `description`
  defineI18n({ name: 'add', args: { store: { type: 'string', desc: 'S' } }, resource, run })
  // @ts-expect-error `alias`: the key of the short name is `short`
  defineI18nCommand({ name: 'add', args: { verbose: { type: 'boolean', alias: 'v' } }, run })
  type Value = { type: 'string'; require: true } | { type: 'number' }
  // a value of the union, not narrowed to one of its members
  const pick = (): Value => ({ type: 'number' })
  const value = pick()
  // @ts-expect-error `require`, in one member of a union of schemas
  defineI18n({ name: 'add', args: { value }, resource, run })
})

test('defineI18n and defineI18nWithTypes take the keys of an argument', () => {
  defineI18n({
    name: 'add',
    args: { store: { type: 'string', short: 's', description: 'The file', required: true } },
    resource,
    run: ctx => {
      expectTypeOf(ctx.values.store).toEqualTypeOf<string>()
    }
  })
  defineI18nWithTypes<{ extensions: {} }>()({
    name: 'add',
    args: { verbose: { type: 'boolean', short: 'v', negatable: true } },
    run: ctx => {
      expectTypeOf(ctx.values.verbose).toEqualTypeOf<boolean | undefined>()
    }
  })
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

test('cli() takes the commands of the helpers as the command (#931)', async () => {
  const deploy = defineI18n({
    name: 'deploy',
    args: { replicas: { type: 'number', default: 1 } },
    resource,
    run: ctx => {
      expectTypeOf(ctx.values.replicas).toEqualTypeOf<number>()
    }
  })
  await cli([], deploy)
  await cli([], withI18nResource(define({ name: 'deploy', run }), resource))
})
