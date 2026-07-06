import i18n from '@gunshi/plugin-i18n'
import jaJPResource from '@gunshi/resources/ja-JP' with { type: 'json' }
import { cli, define, lazy } from 'gunshi'
import { describe, expect, test, vi } from 'vitest'
import { defineMockLog } from '../../gunshi/test/utils.ts'
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
  test('suggests a known long option for an unknown option', async () => {
    const utils = await import('../../gunshi/src/utils.ts')
    const log = defineMockLog(utils)
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
    ).rejects.toBeInstanceOf(AggregateError)

    expect(run).not.toHaveBeenCalled()
    expect(log()).toBe('Unknown option: --alow-reload\nDid you mean --allow-reload?')
  })

  test('does not suggest options when includeOptions is false', async () => {
    const utils = await import('../../gunshi/src/utils.ts')
    const log = defineMockLog(utils)

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
    ).rejects.toBeInstanceOf(AggregateError)

    expect(log()).toBe('Unknown option: --alow-reload')
  })

  test('does not suggest short options by default', async () => {
    const utils = await import('../../gunshi/src/utils.ts')
    const log = defineMockLog(utils)

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
    ).rejects.toBeInstanceOf(AggregateError)

    expect(log()).toBe('Unknown option: -x')
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
    const utils = await import('../../gunshi/src/utils.ts')
    const log = defineMockLog(utils)
    const run = vi.fn<() => void>()

    await expect(
      cli(['rn'], define({ name: 'main', run }), {
        subCommands: {
          run: define({ name: 'run', run: vi.fn<() => void>() }),
          init: define({ name: 'init', run: vi.fn<() => void>() })
        },
        plugins: [suggestion()]
      })
    ).rejects.toBeInstanceOf(AggregateError)

    expect(run).not.toHaveBeenCalled()
    expect(log()).toBe('Command not found: rn\nDid you mean run?')
  })

  test('uses nested command candidates from the parent command', async () => {
    const utils = await import('../../gunshi/src/utils.ts')
    const log = defineMockLog(utils)

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
    ).rejects.toBeInstanceOf(AggregateError)

    expect(log()).toBe('Command not found: rn\nDid you mean run?')
  })

  test('uses lazy parent command candidates', async () => {
    const utils = await import('../../gunshi/src/utils.ts')
    const log = defineMockLog(utils)

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
    ).rejects.toBeInstanceOf(AggregateError)

    expect(log()).toBe('Command not found: rn\nDid you mean run?')
  })

  test('does not suggest commands when includeCommands is false', async () => {
    const utils = await import('../../gunshi/src/utils.ts')
    const log = defineMockLog(utils)

    await expect(
      cli(['rn'], define({ name: 'main', run: () => {} }), {
        subCommands: {
          run: define({ name: 'run', run: vi.fn<() => void>() })
        },
        plugins: [suggestion({ includeCommands: false })]
      })
    ).rejects.toBeInstanceOf(AggregateError)

    expect(log()).toBe('Command not found: rn')
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

  test('localizes unknown option suggestion hints with i18n', async () => {
    const utils = await import('../../gunshi/src/utils.ts')
    const log = defineMockLog(utils)

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
    ).rejects.toBeInstanceOf(AggregateError)

    expect(log()).toBe(
      '未定義のオプションです: --alow-reload\n--allow-reload の指定ミスではありませんか？'
    )
  })

  test('localizes command suggestion hints with i18n', async () => {
    const utils = await import('../../gunshi/src/utils.ts')
    const log = defineMockLog(utils)

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
    ).rejects.toBeInstanceOf(AggregateError)

    expect(log()).toBe('コマンドが見つかりません: rn\nrun の指定ミスではありませんか？')
  })
})
