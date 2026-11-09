import i18n from '@gunshi/plugin-i18n'
import jaJPResource from '@gunshi/resources/ja-JP' with { type: 'json' }
import { cli, define, lazy, plugin } from 'gunshi'
import { describe, expect, test, vi } from 'vitest'
import { defineMockErrorLog } from '../../gunshi/test/utils.ts'
import { defineSuggestNames, levenshtein, suggestion } from './index.ts'

import type { ResolvedSuggestionOptions } from './index.ts'

const defaultSuggestOptions: ResolvedSuggestionOptions = {
  maxDistance: 2,
  maxSuggestions: 1,
  includeOptions: true,
  includeCommands: true,
  distance: levenshtein,
  normalize: value => value
}

describe('levenshtein', () => {
  test('calculates edit distance', () => {
    expect(levenshtein('alow-reload', 'allow-reload')).toBe(1)
    expect(levenshtein('same', 'same')).toBe(0)
    expect(levenshtein('abc', 'abxc')).toBe(1)
    expect(levenshtein('abcd', 'acd')).toBe(1)
    expect(levenshtein('abcd', 'abxd')).toBe(1)
  })
})

describe('defineSuggestNames', () => {
  test('returns suggestions within threshold', () => {
    const suggestNames = defineSuggestNames(defaultSuggestOptions)

    expect(suggestNames('alow-reload', ['--allow-reload', '--clear-cache'])).toEqual([
      '--allow-reload'
    ])
  })

  test('excludes candidates beyond threshold', () => {
    const suggestNames = defineSuggestNames({
      ...defaultSuggestOptions,
      maxDistance: 1
    })

    expect(suggestNames('reload', ['--clear-cache'])).toEqual([])
  })

  test('limits max suggestions and keeps definition order for ties', () => {
    const suggestNames = defineSuggestNames({
      ...defaultSuggestOptions,
      maxSuggestions: 2
    })

    expect(suggestNames('ab', ['aa', 'ac', 'zz'])).toEqual(['aa', 'ac'])
  })

  test('uses custom distance and normalize functions', () => {
    const distance = vi.fn<(input: string, candidate: string) => number>(() => 0)
    const normalize = vi.fn<(value: string) => string>(value => value.toLowerCase())
    const suggestNames = defineSuggestNames({
      ...defaultSuggestOptions,
      distance,
      normalize
    })

    expect(suggestNames('ALLOW-RELOAD', ['--allow-reload'])).toEqual(['--allow-reload'])
    expect(distance).toHaveBeenCalledWith('allow-reload', 'allow-reload')
    expect(normalize).toHaveBeenCalled()
  })
})

describe('suggestion plugin', () => {
  test('does not suggest a command for an option-resolution error', async () => {
    const stderr = defineMockErrorLog()
    const global = plugin({
      id: 'test:routing-global',
      setup(ctx) {
        ctx.addGlobalOption('config', { type: 'string' })
      }
    })

    await expect(
      cli(['--config', 'clean', 'deploy'], define({ name: 'app', run: () => {} }), {
        subCommands: {
          clean: define({ name: 'clean', run: () => {} }),
          deploy: define({
            name: 'deploy',
            args: { config: { type: 'boolean' } },
            run: () => {}
          })
        },
        plugins: [global, suggestion()]
      })
    ).resolves.toBeUndefined()

    expect(stderr()).not.toBe('')
    expect(stderr()).not.toContain('Did you mean')
  })

  test('suggests a known long option for an unknown option', async () => {
    const stderr = defineMockErrorLog()
    const run = vi.fn<() => void>()

    await expect(
      cli(
        ['--alow-reload'],
        define({
          name: 'app',
          toKebab: true,
          args: {
            allowReload: {
              type: 'boolean'
            }
          },
          run
        }),
        {
          strict: true,
          plugins: [suggestion()]
        }
      )
    ).resolves.toBeUndefined()

    expect(run).not.toHaveBeenCalled()
    expect(stderr()).toBe('Unknown option: --alow-reload\nDid you mean --allow-reload?')
  })

  test('does not suggest options when includeOptions is false', async () => {
    const stderr = defineMockErrorLog()

    await expect(
      cli(
        ['--alow-reload'],
        define({
          name: 'app',
          toKebab: true,
          args: {
            allowReload: {
              type: 'boolean'
            }
          },
          run: () => {}
        }),
        {
          strict: true,
          plugins: [suggestion({ includeOptions: false })]
        }
      )
    ).resolves.toBeUndefined()

    expect(stderr()).toBe('Unknown option: --alow-reload')
  })

  test('does not suggest short options by default', async () => {
    const stderr = defineMockErrorLog()

    await expect(
      cli(
        ['-x'],
        define({
          name: 'app',
          args: {
            reload: {
              type: 'boolean',
              short: 'r'
            }
          },
          run: () => {}
        }),
        {
          strict: true,
          plugins: [suggestion()]
        }
      )
    ).resolves.toBeUndefined()

    expect(stderr()).toBe('Unknown option: -x')
  })

  test('does not suggest unknown options when strict mode is disabled', async () => {
    const run = vi.fn<() => void>()

    await cli(
      ['--alow-reload'],
      define({
        name: 'app',
        toKebab: true,
        args: {
          allowReload: {
            type: 'boolean'
          }
        },
        run
      }),
      {
        plugins: [suggestion()]
      }
    )

    expect(run).toHaveBeenCalledOnce()
  })

  test('suggests a top-level command from same-level candidates', async () => {
    const stderr = defineMockErrorLog()
    const run = vi.fn<() => void>()

    await expect(
      cli(['rn'], define({ name: 'main', run }), {
        subCommands: {
          run: define({ name: 'run', run: vi.fn<() => void>() }),
          init: define({ name: 'init', run: vi.fn<() => void>() })
        },
        plugins: [suggestion()]
      })
    ).resolves.toBeUndefined()

    expect(run).not.toHaveBeenCalled()
    expect(stderr()).toBe('Command not found: rn\nDid you mean run?')
  })

  test('uses nested command candidates from the parent command', async () => {
    const stderr = defineMockErrorLog()

    await expect(
      cli(['task', 'rn'], define({ name: 'main', run: () => {} }), {
        subCommands: {
          task: define({
            name: 'task',
            subCommands: {
              run: define({ name: 'run', run: vi.fn<() => void>() }),
              stop: define({ name: 'stop', run: vi.fn<() => void>() })
            },
            run: vi.fn<() => void>()
          })
        },
        plugins: [suggestion()]
      })
    ).resolves.toBeUndefined()

    expect(stderr()).toBe('Command not found: rn\nDid you mean run?')
  })

  test('uses lazy parent command candidates', async () => {
    const stderr = defineMockErrorLog()

    await expect(
      cli(['task', 'rn'], define({ name: 'main', run: () => {} }), {
        subCommands: {
          task: lazy(
            () =>
              define({
                name: 'task',
                subCommands: {
                  run: define({ name: 'run', run: vi.fn<() => void>() })
                },
                run: vi.fn<() => void>()
              }),
            {
              name: 'task',
              subCommands: {
                run: define({ name: 'run', run: vi.fn<() => void>() })
              }
            }
          )
        },
        plugins: [suggestion()]
      })
    ).resolves.toBeUndefined()

    expect(stderr()).toBe('Command not found: rn\nDid you mean run?')
  })

  test('does not suggest commands when includeCommands is false', async () => {
    const stderr = defineMockErrorLog()

    await expect(
      cli(['rn'], define({ name: 'main', run: () => {} }), {
        subCommands: {
          run: define({ name: 'run', run: vi.fn<() => void>() })
        },
        plugins: [suggestion({ includeCommands: false })]
      })
    ).resolves.toBeUndefined()

    expect(stderr()).toBe('Command not found: rn')
  })

  test('does not suggest commands when fallbackToEntry handles the input', async () => {
    const run = vi.fn<() => void>()

    await cli(['rn'], define({ name: 'main', run }), {
      fallbackToEntry: true,
      subCommands: {
        run: define({ name: 'run', run: vi.fn<() => void>() })
      },
      plugins: [suggestion()]
    })

    expect(run).toHaveBeenCalledOnce()
  })

  test('suggests a command that a plugin adds to an entry without run (#874)', async () => {
    const stderr = defineMockErrorLog()
    const adds = plugin({
      id: 'adds',
      setup: ctx => {
        ctx.addCommand('run', define({ name: 'run', run: vi.fn<() => void>() }))
      }
    })

    await expect(
      cli(['rn'], define({ name: 'main' }), { plugins: [adds, suggestion()] })
    ).resolves.toBeUndefined()

    expect(stderr()).toBe('Command not found: rn\nDid you mean run?')
  })

  test('localizes unknown option suggestion hints with i18n', async () => {
    const stderr = defineMockErrorLog()

    await expect(
      cli(
        ['--alow-reload'],
        define({
          name: 'app',
          toKebab: true,
          args: {
            allowReload: {
              type: 'boolean'
            }
          },
          run: () => {}
        }),
        {
          strict: true,
          plugins: [
            i18n({
              locale: 'ja-JP',
              builtinResources: {
                'ja-JP': jaJPResource
              }
            }),
            suggestion()
          ]
        }
      )
    ).resolves.toBeUndefined()

    expect(stderr()).toBe(
      '未定義のオプションです: --alow-reload\n--allow-reload の指定ミスではありませんか？'
    )
  })

  test('localizes command suggestion hints with i18n', async () => {
    const stderr = defineMockErrorLog()

    await expect(
      cli(['rn'], define({ name: 'main', run: () => {} }), {
        subCommands: {
          run: define({ name: 'run', run: vi.fn<() => void>() })
        },
        plugins: [
          i18n({
            locale: 'ja-JP',
            builtinResources: {
              'ja-JP': jaJPResource
            }
          }),
          suggestion()
        ]
      })
    ).resolves.toBeUndefined()

    expect(stderr()).toBe('コマンドが見つかりません: rn\nrun の指定ミスではありませんか？')
  })
})
