import { describe, expect, expectTypeOf, test, vi } from 'vitest'
import { cli } from './cli.ts'
import {
  args,
  boolean,
  choice,
  combinator,
  describe as desc,
  extend,
  float,
  integer,
  map,
  merge,
  multiple,
  number,
  positional,
  required,
  short,
  string,
  unrequired,
  withDefault
} from './combinators.ts'
import { define } from './definition.ts'

describe('combinators re-export', () => {
  test('all base combinators are exported', () => {
    expect(typeof string).toBe('function')
    expect(typeof number).toBe('function')
    expect(typeof integer).toBe('function')
    expect(typeof float).toBe('function')
    expect(typeof boolean).toBe('function')
    expect(typeof positional).toBe('function')
    expect(typeof choice).toBe('function')
    expect(typeof combinator).toBe('function')
  })

  test('all modifier combinators are exported', () => {
    expect(typeof required).toBe('function')
    expect(typeof unrequired).toBe('function')
    expect(typeof withDefault).toBe('function')
    expect(typeof multiple).toBe('function')
    expect(typeof short).toBe('function')
    expect(typeof desc).toBe('function')
    expect(typeof map).toBe('function')
  })

  test('all schema combinators are exported', () => {
    expect(typeof args).toBe('function')
    expect(typeof merge).toBe('function')
    expect(typeof extend).toBe('function')
  })
})

describe('define with combinators', () => {
  test('basic combinators with define', async () => {
    const log = vi.fn()
    const command = define({
      name: 'test',
      args: {
        host: withDefault(string(), 'localhost'),
        port: withDefault(integer({ min: 1, max: 65535 }), 8080),
        verbose: short(boolean(), 'd')
      },
      run: ctx => {
        log(ctx.values.host, ctx.values.port, ctx.values.verbose)
      }
    })

    await cli(['test', '--host', 'example.com', '--port', '3000', '-d'], command, {
      usageSilent: true
    })

    expect(log).toHaveBeenCalledWith('example.com', 3000, true)
  })

  test('required and choice combinators', async () => {
    const log = vi.fn()
    const command = define({
      name: 'test',
      args: {
        name: required(string()),
        level: choice(['debug', 'info', 'warn', 'error'] as const)
      },
      run: ctx => {
        log(ctx.values.name, ctx.values.level)
      }
    })

    await cli(['test', '--name', 'foo', '--level', 'info'], command, {
      usageSilent: true
    })

    expect(log).toHaveBeenCalledWith('foo', 'info')
  })

  test('multiple combinator', async () => {
    const log = vi.fn()
    const command = define({
      name: 'test',
      args: {
        tags: multiple(string())
      },
      run: ctx => {
        log(ctx.values.tags)
      }
    })

    await cli(['test', '--tags', 'a', '--tags', 'b'], command, {
      usageSilent: true
    })

    expect(log).toHaveBeenCalledWith(['a', 'b'])
  })

  test('map combinator transforms values', async () => {
    const log = vi.fn()
    const command = define({
      name: 'test',
      args: {
        doubled: map(integer(), n => n * 2)
      },
      run: ctx => {
        log(ctx.values.doubled)
      }
    })

    await cli(['test', '--doubled', '5'], command, {
      usageSilent: true
    })

    expect(log).toHaveBeenCalledWith(10)
  })

  test('custom combinator', async () => {
    const log = vi.fn()
    const command = define({
      name: 'test',
      args: {
        date: combinator({
          parse: (value: string) => {
            const d = new Date(value)
            if (isNaN(d.getTime())) {
              throw new Error('Invalid date')
            }
            return d
          },
          metavar: 'date'
        })
      },
      run: ctx => {
        log(ctx.values.date instanceof Date)
      }
    })

    await cli(['test', '--date', '2024-01-01'], command, {
      usageSilent: true
    })

    expect(log).toHaveBeenCalledWith(true)
  })

  test('default values are used when args not provided', async () => {
    const log = vi.fn()
    const command = define({
      name: 'test',
      args: {
        host: withDefault(string(), 'localhost'),
        port: withDefault(integer(), 8080)
      },
      run: ctx => {
        log(ctx.values.host, ctx.values.port)
      }
    })

    await cli(['test'], command, {
      usageSilent: true
    })

    expect(log).toHaveBeenCalledWith('localhost', 8080)
  })
})

describe('schema composition with define', () => {
  test('args() helper', async () => {
    const log = vi.fn()
    const schema = args({
      verbose: boolean(),
      name: required(string())
    })

    const command = define({
      name: 'test',
      args: schema,
      run: ctx => {
        log(ctx.values.name)
      }
    })

    await cli(['test', '--name', 'hello'], command, {
      usageSilent: true
    })

    expect(log).toHaveBeenCalledWith('hello')
  })

  test('merge() composes schemas', async () => {
    const log = vi.fn()
    const common = args({
      verbose: short(boolean(), 'd')
    })
    const network = args({
      host: withDefault(string(), 'localhost'),
      port: withDefault(integer(), 8080)
    })

    const command = define({
      name: 'test',
      args: merge(common, network),
      run: ctx => {
        log(ctx.values.host, ctx.values.port, ctx.values.verbose)
      }
    })

    await cli(['test', '-d', '--port', '3000'], command, {
      usageSilent: true
    })

    expect(log).toHaveBeenCalledWith('localhost', 3000, true)
  })

  test('extend() overrides fields', async () => {
    const log = vi.fn()
    const base = args({
      port: withDefault(integer(), 8080)
    })
    const strict = extend(base, {
      port: required(integer({ min: 1, max: 65535 }))
    })

    const command = define({
      name: 'test',
      args: strict,
      run: ctx => {
        log(ctx.values.port)
      }
    })

    await cli(['test', '--port', '3000'], command, {
      usageSilent: true
    })

    expect(log).toHaveBeenCalledWith(3000)
  })
})

describe('type inference with combinators', () => {
  test('withDefault makes values non-optional', async () => {
    const command = define({
      name: 'test',
      args: {
        host: withDefault(string(), 'localhost'),
        port: withDefault(integer(), 8080)
      },
      run: ctx => {
        expectTypeOf(ctx.values.host).toEqualTypeOf<string>()
        expectTypeOf(ctx.values.port).toEqualTypeOf<number>()
      }
    })

    await cli(['test'], command, { usageSilent: true })
  })

  test('required string', async () => {
    const command = define({
      name: 'test',
      args: {
        name: required(string())
      },
      run: ctx => {
        expectTypeOf(ctx.values.name).toEqualTypeOf<string>()
      }
    })

    await cli(['test', '--name', 'hello'], command, { usageSilent: true })
  })

  test('optional combinators', async () => {
    const command = define({
      name: 'test',
      args: {
        flag: boolean(),
        value: string()
      },
      run: ctx => {
        expectTypeOf(ctx.values.flag).toEqualTypeOf<boolean | undefined>()
        expectTypeOf(ctx.values.value).toEqualTypeOf<string | undefined>()
      }
    })

    await cli(['test'], command, { usageSilent: true })
  })

  test('choice literal type inference', async () => {
    const command = define({
      name: 'test',
      args: {
        level: choice(['debug', 'info', 'warn', 'error'] as const)
      },
      run: ctx => {
        expectTypeOf(ctx.values.level).toEqualTypeOf<
          'debug' | 'info' | 'warn' | 'error' | undefined
        >()
      }
    })

    await cli(['test', '--level', 'info'], command, { usageSilent: true })
  })
})
