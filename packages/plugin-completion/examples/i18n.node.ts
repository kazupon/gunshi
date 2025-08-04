import i18n, { defineI18n } from '@gunshi/plugin-i18n'
import { cli } from 'gunshi'
import completion from '../src/index.ts'

import type { I18nExtension } from '@gunshi/plugin-i18n'

const entry = defineI18n<{
  extensions: {
    'g:i18n': I18nExtension
  }
}>({
  name: 'root',
  args: {
    config: {
      type: 'string',
      description: 'Use specified config file',
      short: 'c'
    },
    mode: {
      type: 'string',
      description: 'Set env mode',
      short: 'm'
    },
    logLevel: {
      type: 'string',
      description: 'info | warn | error | silent',
      short: 'l'
    }
  },
  run: _ctx => {},
  resource: async ctx => {
    const i18n = ctx.extensions['g:i18n']
    if (i18n.locale.toString() === 'ja-JP') {
      return {
        description: 'ルートコマンド',
        'arg:config': '設定ファイルを指定します',
        'arg:mode': '環境モードを設定します',
        'arg:logLevel': 'ログレベルを設定します'
      }
    }
    throw new Error('Unsupported locale')
  }
})

const dev = defineI18n<{
  extensions: {
    'g:i18n': I18nExtension
  }
}>({
  name: 'dev',
  description: 'Start dev server',
  args: {
    host: {
      type: 'string',
      description: 'Specify hostname',
      short: 'H'
    },
    port: {
      type: 'number',
      description: 'Specify port',
      short: 'p'
    }
  },
  run: () => {},
  resource: async ctx => {
    const i18n = ctx.extensions['g:i18n']
    if (i18n.locale.toString() === 'ja-JP') {
      return {
        description: '開発サーバーを起動します',
        'arg:host': 'ホスト名を指定します',
        'arg:port': 'ポート番号を指定します'
      }
    }
    throw new Error('Unsupported locale')
  }
})

const build = defineI18n<{
  extensions: {
    'g:i18n': I18nExtension
  }
}>({
  name: 'build',
  description: 'Build project',
  run: () => {},
  resource: async ctx => {
    const i18n = ctx.extensions['g:i18n']
    if (i18n.locale.toString() === 'ja-JP') {
      return {
        description: 'プロジェクトをビルドします'
      }
    }
    throw new Error('Unsupported locale')
  }
})

const lint = defineI18n<{
  extensions: {
    'g:i18n': I18nExtension
  }
}>({
  name: 'lint',
  description: 'Lint project',
  args: {
    files: {
      type: 'positional',
      description: 'Files to lint'
    }
  },
  run: () => {},
  resource: async ctx => {
    const i18n = ctx.extensions['g:i18n']
    if (i18n.locale.toString() === 'ja-JP') {
      return {
        description: 'プロジェクトをリントします',
        'arg:files': 'リントするファイル'
      }
    }
    throw new Error('Unsupported locale')
  }
})

const subCommands = new Map<string, ReturnType<typeof defineI18n>>()
subCommands.set('dev', dev)
subCommands.set('build', build)
subCommands.set('lint', lint)

// @ts-expect-error -- TODO(kazupon): fix type
await cli(process.argv.slice(2), entry, {
  name: 'vite',
  version: '0.0.0',
  description: 'Vite CLI',
  subCommands,
  plugins: [
    i18n({
      locale: process.env.MY_LOCALE || 'en-US'
    }),
    completion({
      config: {
        entry: {
          args: {
            config: {
              handler: ({ locale }) =>
                locale?.toString() === 'ja-JP'
                  ? [
                      { value: 'vite.config.ts', description: 'Vite設定ファイル' },
                      { value: 'vite.config.js', description: 'Vite設定ファイル' }
                    ]
                  : [
                      { value: 'vite.config.ts', description: 'Vite config file' },
                      { value: 'vite.config.js', description: 'Vite config file' }
                    ]
            },
            mode: {
              handler: ({ locale }) =>
                locale?.toString() === 'ja-JP'
                  ? [
                      { value: 'development', description: '開発モード' },
                      { value: 'production', description: '本番モード' }
                    ]
                  : [
                      { value: 'development', description: 'Development mode' },
                      { value: 'production', description: 'Production mode' }
                    ]
            },
            logLevel: {
              handler: ({ locale }) =>
                locale?.toString() === 'ja-JP'
                  ? [
                      { value: 'info', description: '情報レベル' },
                      { value: 'warn', description: '警告レベル' },
                      { value: 'error', description: 'エラーレベル' },
                      { value: 'silent', description: 'サイレントレベル' }
                    ]
                  : [
                      { value: 'info', description: 'Info level' },
                      { value: 'warn', description: 'Warn level' },
                      { value: 'error', description: 'Error level' },
                      { value: 'silent', description: 'Silent level' }
                    ]
            }
          }
        },
        subCommands: {
          lint: {
            handler: ({ locale }) =>
              locale?.toString() === 'ja-JP'
                ? [
                    { value: 'main.ts', description: 'メインファイル' },
                    { value: 'index.ts', description: 'インデックスファイル' }
                  ]
                : [
                    { value: 'main.ts', description: 'Main file' },
                    { value: 'index.ts', description: 'Index file' }
                  ]
          },
          dev: {
            args: {
              port: {
                handler: ({ locale }) =>
                  locale?.toString() === 'ja-JP'
                    ? [
                        { value: '3000', description: '開発サーバーポート' },
                        { value: '8080', description: '代替ポート' }
                      ]
                    : [
                        { value: '3000', description: 'Development server port' },
                        { value: '8080', description: 'Alternative port' }
                      ]
              },
              host: {
                handler: ({ locale }) =>
                  locale?.toString() === 'ja-JP'
                    ? [
                        { value: 'localhost', description: 'ローカルホスト' },
                        { value: '0.0.0.0', description: 'すべてのインターフェース' }
                      ]
                    : [
                        { value: 'localhost', description: 'Localhost' },
                        { value: '0.0.0.0', description: 'All interfaces' }
                      ]
              }
            }
          }
        }
      }
    })
  ]
})
