/**
 * The ways to write a command that spreads `jsonArgs`, beyond `define`: the parser combinators, the
 * collections of commands, the APIs that take a command, and the forms of `lazy`.
 *
 * NOTE(kazupon): a statement that must not type-check is written on one line, so that tsc (the type
 * tests) and tsgo (`oxlint --type-check`) report its error on the line under `@ts-expect-error`.
 */

import { describe, expectTypeOf, test } from 'vite-plus/test'
import { args, extend, integer, merge, withDefault } from './combinators.ts'
import { createCommandContext } from './context.ts'
import { define, lazy } from './definition.ts'
import { generate } from './generator.ts'
import { jsonArgs } from './json.ts'
import { plugin } from './plugin/core.ts'

import type { Command, SubCommandable } from './types.ts'

describe('the parser combinators', () => {
  test('merge, extend and args keep the mark of jsonArgs', () => {
    const merged = merge(jsonArgs, args({ limit: withDefault(integer(), 20) }))
    define({
      name: 'list',
      args: merged,
      run: ctx => {
        expectTypeOf(ctx.values.json).toEqualTypeOf<boolean | undefined>()
        expectTypeOf(ctx.values.limit).toEqualTypeOf<number>()
        return { projects: [] }
      }
    })
    // @ts-expect-error a command that supports --json returns its result
    define({ name: 'list', args: merged, run: () => {} })

    const extended = extend(jsonArgs, { limit: withDefault(integer(), 20) })
    define({ name: 'list', args: extended, run: () => ({ projects: [] }) })
    // @ts-expect-error a command that supports --json returns its result
    define({ name: 'list', args: extended, run: () => {} })

    const wrapped = args({ ...jsonArgs, limit: withDefault(integer(), 20) })
    define({ name: 'list', args: wrapped, run: () => ({ projects: [] }) })
    // @ts-expect-error a command that supports --json returns its result
    define({ name: 'list', args: wrapped, run: () => {} })
  })
})

describe('the collections of commands', () => {
  const list = define({ name: 'list', args: { ...jsonArgs }, run: () => ({ projects: [] }) })
  const deploy = define({ name: 'deploy', run: () => 'deployed' })
  const show = lazy(() => async () => ({ project: 'acme' }), {
    name: 'show',
    args: { ...jsonArgs }
  })

  test('SubCommandable takes the commands with and without jsonArgs', () => {
    const record: Record<string, SubCommandable> = { list, deploy, show }
    const map = new Map<string, SubCommandable>([
      ['list', list],
      ['deploy', deploy],
      ['show', show]
    ])
    const array: SubCommandable[] = [list, deploy, show]
    expectTypeOf(record).not.toBeAny()
    expectTypeOf(map).not.toBeAny()
    expectTypeOf(array).not.toBeAny()
  })

  test('Command without type arguments does not take a command that spreads jsonArgs', () => {
    const plain: Command[] = [deploy]
    expectTypeOf(plain).not.toBeAny()
    // @ts-expect-error collect them with SubCommandable
    const commands: Command[] = [list, deploy]
    expectTypeOf(commands).not.toBeAny()
  })

  test('Command with the arguments types one command', () => {
    const listArgs = { ...jsonArgs }
    const typed: Command<{ args: typeof listArgs }> = { args: listArgs, run: () => ({ ok: true }) }
    expectTypeOf(typed).not.toBeAny()
  })
})

describe('the APIs that take a command', () => {
  const list = define({ name: 'list', args: { ...jsonArgs }, run: () => ({ projects: [] }) })

  test('addCommand of a plugin', () => {
    plugin({
      id: 'x:add',
      setup: ctx => {
        ctx.addCommand('list', list)
      }
    })
  })

  test('createCommandContext', async () => {
    // the values are not typed by the command, so a test can pass what `cli()` would resolve
    const ctx = await createCommandContext({
      args: list.args,
      values: { json: true },
      command: list
    })
    expectTypeOf(ctx).not.toBeAny()
  })

  test('generate', async () => {
    expectTypeOf(await generate(null, list)).toEqualTypeOf<string>()
  })
})

describe('the forms of lazy', () => {
  const show = define({ name: 'show', args: { ...jsonArgs }, run: () => ({ project: 'acme' }) })

  test('a definition that spreads jsonArgs takes any loader', () => {
    lazy(() => async () => ({ project: 'acme' }), { name: 'show', args: { ...jsonArgs } })
    lazy(async () => async () => ({ project: 'acme' }), { name: 'show', args: { ...jsonArgs } })
    lazy(() => show, { name: 'show', args: { ...jsonArgs } })
    lazy(async () => show, { name: 'show', args: { ...jsonArgs } })
  })

  test('a definition without jsonArgs does not take a command that spreads it', () => {
    // @ts-expect-error the definition spreads jsonArgs too
    lazy(() => show, { name: 'show' })
    // @ts-expect-error the definition spreads jsonArgs too
    lazy(async () => show, { name: 'show' })
    // @ts-expect-error the definition spreads jsonArgs too
    lazy(() => show)
    // @ts-expect-error the definition spreads jsonArgs too
    lazy(async () => show)
  })
})
