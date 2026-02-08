import i18n, { defineI18n } from '@gunshi/plugin-i18n'
import { cli } from 'gunshi'
import completion from '../src/index.ts'

// Leaf commands under "remote"
const remoteAdd = defineI18n({
  name: 'add',
  description: 'Add a remote',
  args: {
    url: {
      type: 'string',
      description: 'Remote URL',
      short: 'u'
    }
  },
  run: () => {},
  resource: locale => {
    if (locale.toString() === 'ja-JP') {
      return {
        description: 'リモートを追加します',
        'arg:url': 'リモートURL'
      }
    }
    throw new Error('Unsupported locale')
  }
})

const remoteRemove = defineI18n({
  name: 'remove',
  description: 'Remove a remote',
  args: {
    name: {
      type: 'positional',
      description: 'Remote name'
    }
  },
  run: () => {},
  resource: locale => {
    if (locale.toString() === 'ja-JP') {
      return {
        description: 'リモートを削除します',
        'arg:name': 'リモート名'
      }
    }
    throw new Error('Unsupported locale')
  }
})

// Intermediate command with nested sub-commands
const remote = defineI18n({
  name: 'remote',
  description: 'Manage remotes',
  subCommands: {
    add: remoteAdd,
    remove: remoteRemove
  },
  run: () => {},
  resource: locale => {
    if (locale.toString() === 'ja-JP') {
      return {
        description: 'リモートを管理します'
      }
    }
    throw new Error('Unsupported locale')
  }
})

// Top-level sub-command without nesting
const status = defineI18n({
  name: 'status',
  description: 'Show status',
  args: {
    short: {
      type: 'boolean',
      description: 'Short format',
      short: 's'
    }
  },
  run: () => {},
  resource: locale => {
    if (locale.toString() === 'ja-JP') {
      return {
        description: 'ステータスを表示します',
        'arg:short': '短い形式で表示'
      }
    }
    throw new Error('Unsupported locale')
  }
})

const entry = defineI18n({
  name: 'root',
  args: {
    verbose: {
      type: 'boolean',
      description: 'Verbose output',
      short: 'V'
    }
  },
  run: () => {},
  resource: locale => {
    if (locale.toString() === 'ja-JP') {
      return {
        description: 'Git風CLI',
        'arg:verbose': '詳細出力'
      }
    }
    throw new Error('Unsupported locale')
  }
})

await cli(process.argv.slice(2), entry, {
  name: 'git',
  version: '1.0.0',
  description: 'Git-like CLI',
  subCommands: {
    remote,
    status
  },
  plugins: [
    i18n({
      locale: process.env.MY_LOCALE || 'en-US'
    }),
    completion({
      config: {
        entry: {
          args: {
            verbose: {
              handler: () => []
            }
          }
        },
        subCommands: {
          'remote add': {
            args: {
              url: {
                handler: ({ locale }) =>
                  locale?.toString() === 'ja-JP'
                    ? [
                        {
                          value: 'https://github.com/user/repo.git',
                          description: 'GitHubリポジトリ'
                        },
                        { value: 'git@github.com:user/repo.git', description: 'GitHub SSH' }
                      ]
                    : [
                        { value: 'https://github.com/user/repo.git', description: 'GitHub repo' },
                        { value: 'git@github.com:user/repo.git', description: 'GitHub SSH' }
                      ]
              }
            }
          },
          'remote remove': {
            args: {
              name: {
                handler: ({ locale }) =>
                  locale?.toString() === 'ja-JP'
                    ? [
                        { value: 'origin', description: 'デフォルトリモート' },
                        { value: 'upstream', description: '上流リモート' }
                      ]
                    : [
                        { value: 'origin', description: 'Default remote' },
                        { value: 'upstream', description: 'Upstream remote' }
                      ]
              }
            }
          }
        }
      }
    })
  ]
})
