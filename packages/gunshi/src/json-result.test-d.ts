import { describe, expectTypeOf, test } from 'vite-plus/test'
import { cli, define, defineWithTypes, jsonArgs, lazy, lazyWithTypes, plugin } from './index.ts'

import type { Command } from './types.ts'

interface Project {
  name: string
}
declare const project: Project
declare function fetchProjects(): Promise<Project[]>

describe('a command that spreads jsonArgs', () => {
  test('returns an object keyed by a noun', () => {
    define({
      name: 'list',
      args: { ...jsonArgs, limit: { type: 'number', default: 20 } },
      run: async ctx => {
        expectTypeOf(ctx.values.json).toEqualTypeOf<boolean | undefined>()
        expectTypeOf(ctx.values.limit).toEqualTypeOf<number>()
        return { projects: await fetchProjects() }
      }
    })
    define({ name: 'show', args: { ...jsonArgs }, run: () => ({ project }) })
  })

  test('must return its result', () => {
    // @ts-expect-error a command that supports --json returns its result
    define({ name: 'list', args: { ...jsonArgs }, run: async () => {} })
  })

  test('cannot return an array', () => {
    // @ts-expect-error the result is an object keyed by a noun
    define({ name: 'list', args: { ...jsonArgs }, run: async () => fetchProjects() })
  })

  test('cannot return a string', () => {
    // @ts-expect-error the result is not a string
    define({ name: 'list', args: { ...jsonArgs }, run: () => JSON.stringify({ a: 1 }) })
  })

  test('cannot return a value of an interface type as it is', () => {
    // @ts-expect-error key the value by a noun
    define({ name: 'show', args: { ...jsonArgs }, run: () => project })
  })
})

describe('a command without jsonArgs', () => {
  test('returns a string or nothing, as before', () => {
    define({ name: 'a', run: () => 'text' })
    define({ name: 'b', args: { limit: { type: 'number' } }, run: () => {} })
  })

  test('cannot return an object', () => {
    // @ts-expect-error only a command that spreads jsonArgs returns a result
    define({ name: 'c', args: { limit: { type: 'number' } }, run: () => ({ project }) })
  })

  test('cannot return an object with a json of its own', () => {
    // @ts-expect-error its own json has no mark
    define({ name: 'own', args: { json: { type: 'boolean' } }, run: () => ({ a: 1 }) })
  })
})

describe('the other ways to define a command', () => {
  test('defineWithTypes', () => {
    const defineCommand = defineWithTypes<{ extensions: { 'x:ext': { hello: () => string } } }>()
    defineCommand({
      name: 'list',
      args: { ...jsonArgs },
      run: ctx => ({ greeting: ctx.extensions['x:ext'].hello() })
    })
    // @ts-expect-error a command that supports --json returns its result
    defineCommand({ name: 'list', args: { ...jsonArgs }, run: () => {} })
  })

  test('lazy', () => {
    lazy(() => async () => ({ projects: [] as Project[] }), { name: 'list', args: { ...jsonArgs } })
    // @ts-expect-error a command that supports --json returns its result
    lazy(() => async () => {}, { name: 'list', args: { ...jsonArgs } })
  })

  test('lazyWithTypes', () => {
    const lazyCommand = lazyWithTypes<{ args: typeof jsonArgs }>()
    lazyCommand(() => async () => ({ projects: [] as Project[] }), {
      name: 'list',
      args: { ...jsonArgs }
    })
    // @ts-expect-error a command that supports --json returns its result
    lazyCommand(() => async () => {}, { name: 'list', args: { ...jsonArgs } })
  })

  test('the Command type', () => {
    const command: Command<{ args: typeof jsonArgs }> = {
      name: 'list',
      args: jsonArgs,
      run: () => ({ ok: true })
    }
    expectTypeOf(command).not.toBeAny()
    // the whole command on one line: tsc and tsgo report the error on different lines of it
    // @ts-expect-error a command that supports --json returns its result
    const broken: Command<{ args: typeof jsonArgs }> = { args: jsonArgs, run: () => 'text' }
    expectTypeOf(broken).not.toBeAny()
  })
})

describe('around the command', () => {
  test('a plugin that decorates a command passes the result through', () => {
    plugin({
      id: 'x:pass',
      setup(ctx) {
        ctx.decorateCommand(baseRunner => async c => {
          const result = await baseRunner(c)
          return result
        })
      }
    })
  })

  test('cli takes a command that spreads jsonArgs', async () => {
    await cli([], define({ name: 'list', args: { ...jsonArgs }, run: () => ({ ok: true }) }))
  })
})
