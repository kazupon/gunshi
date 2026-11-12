/**
 * The helpers of the i18n plugin take a command that spreads `jsonArgs`, as `define` does.
 *
 * NOTE(kazupon): a statement that must not type-check is written on one line, so that tsc (the type
 * tests) and tsgo (`oxlint --type-check`) report its error on the line under `@ts-expect-error`.
 */

import { define, jsonArgs } from 'gunshi'
import { expectTypeOf, test } from 'vite-plus/test'
import { defineI18n, defineI18nWithTypes, withI18nResource } from './helpers.ts'

const resource = async () => ({ description: 'List the projects' })

test('defineI18n and defineI18nWithTypes type the result of a command that spreads jsonArgs', () => {
  const list = defineI18n({
    name: 'list',
    args: { ...jsonArgs },
    resource,
    run: () => ({ projects: [] as string[] })
  })
  expectTypeOf(list).not.toBeAny()
  // @ts-expect-error a command that supports --json returns its result
  defineI18n({ name: 'list', args: { ...jsonArgs }, resource, run: () => {} })

  const show = defineI18nWithTypes<{ args: typeof jsonArgs }>()({
    name: 'show',
    args: { ...jsonArgs },
    resource,
    run: () => ({ project: 'acme' })
  })
  expectTypeOf(show).not.toBeAny()
})

test('withI18nResource takes a command that spreads jsonArgs', () => {
  const list = define({ name: 'list', args: { ...jsonArgs }, run: () => ({ projects: [] }) })
  expectTypeOf(withI18nResource(list, resource)).not.toBeAny()
})
