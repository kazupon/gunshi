import i18n, { defineI18nWithTypes, pluginId as i18nId, resolveKey } from '@gunshi/plugin-i18n'
import resources from '@gunshi/resources'
import { cli } from 'gunshi'

import type { I18nExtension } from '@gunshi/plugin-i18n'

// Sub-command with its own translations
const createCommand = defineI18nWithTypes<{ extensions: { [i18nId]: I18nExtension } }>()({
  name: 'create',
  args: {
    name: { type: 'string', required: true }
  },
  resource: locale => {
    return locale.toString() === 'ja-JP'
      ? {
          description: 'リソースを作成',
          'arg:name': 'リソース名',
          creating: '作成中: {$name}',
          success: '作成完了！'
        }
      : {
          description: 'Create a resource',
          'arg:name': 'Resource name',
          creating: 'Creating: {$name}',
          success: 'Created successfully!'
        }
  },
  run: ctx => {
    const t = ctx.extensions[i18nId].translate
    const { name } = ctx.values

    // For custom keys in subcommands, always use resolveKey helper
    const creatingKey = resolveKey('creating', ctx.name)
    const successKey = resolveKey('success', ctx.name)

    console.log(t(creatingKey, { name }))
    console.log(t(successKey))
  }
})

// Main command
const mainCommand = defineI18nWithTypes<{ extensions: { [i18nId]: I18nExtension } }>()({
  name: 'resource-manager',
  resource: () => ({
    description: 'Resource management tool',
    usage_hint: 'Use a sub-command to manage resources'
  }),
  run: ctx => {
    const t = ctx.extensions[i18nId].translate

    // Use resolveKey for main command's custom keys too
    const hintKey = resolveKey('usage_hint', ctx.name)
    console.log(t(hintKey))
  }
})

// Run with i18n plugin
await cli(process.argv.slice(2), mainCommand, {
  name: 'resource-cli',
  version: '1.0.0',
  subCommands: {
    create: createCommand
  },
  plugins: [
    i18n({
      locale: process.env.MY_LANG || 'en-US',
      builtinResources: resources
    })
  ]
})
