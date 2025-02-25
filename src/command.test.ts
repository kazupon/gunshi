import path from 'node:path'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { defineMockLog } from '../test/utils'
import { gunshi } from './command'

afterEach(() => {
  vi.resetAllMocks()
})

describe('gunji', () => {
  describe('simple', () => {
    test('call with entry', async () => {
      const cwd = path.resolve(import.meta.dirname)
      const args = ['--foo', 'bar', '--bar', '--baz', '42', '--qux', 'quux']
      const mockFn = vi.fn()
      await gunshi(args, {
        cwd,
        entry: {
          name: 'show',
          run: mockFn
        }
      })

      expect(mockFn).toBeCalled()
    })

    test('help', async () => {
      const utils = await import('./utils')
      const log = defineMockLog(utils)
      // @ts-ignore
      const cwd = path.resolve(import.meta.dirname)
      const args = ['--help']
      const mockFn = vi.fn()
      await gunshi(args, {
        cwd,
        entry: {
          name: 'show',
          options: {
            foo: {
              type: 'string'
            },
            bar: {
              type: 'boolean'
            },
            baz: {
              type: 'number',
              default: 0
            },
            qux: {
              type: 'string',
              required: true
            }
          },
          run: mockFn
        }
      })

      const message = log()
      expect(mockFn).not.toBeCalled()
      expect(message).toMatchSnapshot()
    })
  })

  describe('sub commands', () => {
    test('entry + sub commands', async () => {
      const cwd = path.resolve(import.meta.dirname)
      const mockShow = vi.fn()
      const mockCommand1 = vi.fn()
      const mockCommand2 = vi.fn()
      const show = {
        name: 'show',
        run: mockShow
      }
      const env = {
        cwd,
        entry: show,
        subCommands: {
          show,
          command1: {
            name: 'command1',
            run: mockCommand1
          },
          command2: {
            name: 'command2',
            run: mockCommand2
          }
        }
      }

      await gunshi(['show'], env)
      await gunshi(['command1'], env)
      await gunshi(['command2'], env)

      expect(mockShow).toBeCalled()
      expect(mockCommand1).toBeCalled()
      expect(mockCommand2).toBeCalled()
    })

    test('entry (string) + sub commands', async () => {
      const cwd = path.resolve(import.meta.dirname)
      const mockShow = vi.fn()
      const mockCommand1 = vi.fn()
      const mockCommand2 = vi.fn()
      const show = {
        name: 'show',
        run: mockShow
      }
      const env = {
        cwd,
        entry: 'show',
        subCommands: {
          show,
          command1: {
            name: 'command1',
            run: mockCommand1
          },
          command2: {
            name: 'command2',
            run: mockCommand2
          }
        }
      }

      await gunshi(['show'], env)
      await gunshi(['command1'], env)
      await gunshi(['command2'], env)

      expect(mockShow).toBeCalled()
      expect(mockCommand1).toBeCalled()
      expect(mockCommand2).toBeCalled()
    })

    test('sub commands only', async () => {
      const cwd = path.resolve(import.meta.dirname)
      const mockShow = vi.fn()
      const mockCommand1 = vi.fn()
      const mockCommand2 = vi.fn()
      const show = {
        name: 'show',
        run: mockShow
      }
      const env = {
        cwd,
        subCommands: {
          show,
          command1: {
            name: 'command1',
            run: mockCommand1
          },
          command2: {
            name: 'command2',
            run: mockCommand2
          }
        }
      }

      await gunshi(['show'], env)
      await gunshi(['command1'], env)
      await gunshi(['command2'], env)

      expect(mockShow).toBeCalled()
      expect(mockCommand1).toBeCalled()
      expect(mockCommand2).toBeCalled()
    })

    test('command not found', async () => {
      const cwd = path.resolve(import.meta.dirname)
      const env = { cwd }

      await expect(async () => {
        await gunshi(['show'], env)
      }).rejects.toThrowError('Command not found: show')
    })
  })

  test('custom usage rendering', async () => {
    const utils = await import('./utils')
    const log = defineMockLog(utils)
    const cwd = path.resolve(import.meta.dirname)
    const mockFn = vi.fn()
    const renderUsageDefault = vi.fn(() => Promise.resolve('custom usage'))
    const renderHeader = vi.fn(() => Promise.resolve('custom header'))
    await gunshi(
      ['--help'],
      {
        cwd,
        entry: {
          name: 'show',
          options: {
            foo: {
              type: 'string'
            },
            bar: {
              type: 'boolean'
            },
            baz: {
              type: 'number',
              default: 0
            },
            qux: {
              type: 'string',
              required: true
            }
          },
          run: mockFn
        }
      },
      {
        renderUsageDefault,
        renderHeader
      }
    )

    const message = log()
    expect(message).includes('custom header')
    expect(message).includes('custom usage')
    expect(mockFn).not.toBeCalled()
    expect(renderUsageDefault).toBeCalled()
    expect(renderHeader).toBeCalled()
  })
})
