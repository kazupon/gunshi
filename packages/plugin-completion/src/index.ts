/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { RootCommand } from '@bomb.sh/tab'
import { plugin } from '@gunshi/plugin'
import {
  localizable,
  namespacedId,
  resolveArgKey,
  resolveKey,
  resolveLazyCommand
} from '@gunshi/shared'
import { pluginId } from './types.ts'
import { createCommandContext, quoteExec } from './utils.ts'

import type { Complete, Completion } from '@bomb.sh/tab'
import type {
  Args,
  Command,
  LazyCommand,
  PluginContext,
  PluginWithoutExtension
} from '@gunshi/plugin'
import type { I18nExtension } from '@gunshi/plugin-i18n'
import type { CompletionConfig, CompletionOptions } from './types.ts'

export * from './types.ts'

const TERMINATOR = '--'

const NOOP_HANDLER = () => {
  return [] as Completion[]
}

const i18nPluginId = namespacedId('i18n')

const dependencies = [{ id: i18nPluginId, optional: true }] as const

/**
 * completion plugin
 *
 * @param options - Completion options
 * @returns A defined plugin as completion
 */
export default function completion(options: CompletionOptions = {}): PluginWithoutExtension {
  const config = options.config || {}
  const t = new RootCommand()

  return plugin<Record<typeof i18nPluginId, I18nExtension>, typeof pluginId, typeof dependencies>({
    id: pluginId,
    name: 'completion',
    dependencies,

    async setup(ctx) {
      /**
       * add command for completion script generation
       */

      const completeName = 'complete'
      ctx.addCommand(completeName, {
        name: completeName,
        // TODO(kazupon): support description localization
        description: 'Generate shell completion script',
        rendering: {
          header: null // disable header rendering for completion command
        },
        run: async cmdCtx => {
          if (!cmdCtx.env.name) {
            throw new Error('your cli name is not defined.')
          }

          let shell: string | undefined = cmdCtx._[1]
          if (shell === TERMINATOR) {
            shell = undefined
          }

          if (shell === undefined) {
            t.parse(cmdCtx._.slice(cmdCtx._.indexOf(TERMINATOR) + 1))
          } else if (['zsh', 'bash', 'fish', 'powershell'].includes(shell)) {
            t.setup(cmdCtx.env.name, quoteExec(), shell)
          }
        }
      })
    },

    /**
     * setup bombshell completion with `onExtension` hook
     */

    onExtension: async ctx => {
      const i18n = ctx.extensions[i18nPluginId]
      const subCommands = ctx.env.subCommands as ReadonlyMap<string, Command | LazyCommand>

      const entry = [...subCommands].map(([_, cmd]) => cmd).find(cmd => cmd.entry)
      if (!entry) {
        throw new Error('entry command not found.')
      }

      await registerCompletion({
        name: 'entry',
        cmd: entry,
        config,
        i18nPluginId,
        i18n,
        t,
        isBombshellRoot: true
      })

      await handleSubCommands(t, subCommands, i18nPluginId, config.subCommands, i18n)
    }
  })
}

async function registerCompletion({
  name,
  cmd,
  config,
  i18nPluginId,
  i18n,
  t,
  isBombshellRoot = false
}: {
  name: string
  cmd: Command | LazyCommand
  config: Record<string, CompletionConfig>
  i18nPluginId: string
  i18n?: I18nExtension
  t: RootCommand
  isBombshellRoot?: boolean
}) {
  const resolvedCmd = await resolveLazyCommand(cmd)
  const ctx = await createCommandContext(resolvedCmd, i18nPluginId, i18n)
  if (i18n) {
    const ret = await i18n.loadResource(i18n.locale, ctx, resolvedCmd)
    if (!ret) {
      console.warn(`Failed to load i18n resources for command: ${name} (${i18n.locale})`)
    }
  }
  const localizeDescription = localizable(ctx, resolvedCmd, i18n ? i18n.translate : undefined)

  const commandTab = isBombshellRoot
    ? t
    : t.command(
        name,
        (await localizeDescription(resolveKey('description', ctx.name))) ||
          resolvedCmd.description ||
          ''
      )

  const args = resolvedCmd.args || (Object.create(null) as Args)
  for (const [key, schema] of Object.entries(args)) {
    if (schema.type === 'positional') {
      commandTab.argument(key, resolveCompletionHandler(name, key, config, i18n), schema.multiple)
    } else {
      commandTab.option(
        key,
        (await localizeDescription(resolveArgKey(key, ctx.name))) || schema.description || '',
        resolveCompletionHandler(name, key, config, i18n),
        schema.short
      )
    }
  }
}

function resolveCompletionHandler(
  name: string,
  optionOrArgKey: string,
  config: Record<string, CompletionConfig>,
  i18n?: I18nExtension
) {
  return function (complete: Complete) {
    const handler = config[name]?.args?.[optionOrArgKey]?.handler || NOOP_HANDLER
    for (const item of handler({ locale: i18n?.locale })) {
      complete(item.value, item.description || '')
    }
  }
}

async function handleSubCommands(
  t: RootCommand,
  subCommands: PluginContext['subCommands'],
  i18nPluginId: string,
  config: Record<string, CompletionConfig> = {},
  i18n?: I18nExtension | undefined
) {
  for (const [name, cmd] of subCommands) {
    if (cmd.internal || cmd.entry || name === 'complete') {
      continue // skip entry / internal command / completion command itself
    }
    await registerCompletion({ name, cmd, config, i18nPluginId, i18n, t })
  }
}
