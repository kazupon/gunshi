/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { plugin } from '@gunshi/plugin'
import {
  localizable,
  namespacedId,
  resolveArgKey,
  resolveKey,
  resolveLazyCommand
} from '@gunshi/shared'
import { Completion, script } from './bombshell/index.ts'
import { pluginId } from './types.ts'
import { createCommandContext, quoteExec } from './utils.ts'

import type {
  Args,
  Command,
  LazyCommand,
  PluginContext,
  PluginWithoutExtension
} from '@gunshi/plugin'
import type { I18nCommandContext } from '@gunshi/plugin-i18n'
import type { Handler } from './bombshell/index.ts'
import type { CompletionConfig, CompletionHandler, CompletionOptions } from './types.ts'

export * from './types.ts'

const TERMINATOR = '--'

const NOOP_HANDLER = () => {
  return []
}

const i18nPluginId = namespacedId('i18n')

const dependencies = [{ id: i18nPluginId, optional: true }] as const

/**
 * completion plugin
 *
 * @param options Completion options
 * @returns A defined plugin as completion
 */
export default function completion(options: CompletionOptions = {}): PluginWithoutExtension {
  const config = options.config || {}
  const completion = new Completion()

  return plugin<
    Record<typeof i18nPluginId, I18nCommandContext>,
    typeof pluginId,
    typeof dependencies
  >({
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
            const extra = cmdCtx._.slice(cmdCtx._.indexOf(TERMINATOR) + 1)
            await completion.parse(extra)
          } else {
            script(shell as Parameters<typeof script>[0], cmdCtx.env.name, quoteExec())
          }
        }
      })
    },

    /**
     * setup bombshell completion with `onExtension` hook
     */

    onExtension: async (ctx, cmd) => {
      const i18n = ctx.extensions[i18nPluginId]
      const subCommands = ctx.env.subCommands as ReadonlyMap<string, Command | LazyCommand>

      const entry = [...subCommands].map(([_, cmd]) => cmd).find(cmd => cmd.entry)
      if (!entry) {
        throw new Error('entry command not found.')
      }

      const entryCtx = await createCommandContext(entry, i18nPluginId, i18n)
      if (i18n) {
        const ret = await i18n.loadResource(i18n.locale, entryCtx, entry)
        if (!ret) {
          console.warn(`Failed to load i18n resources for command: ${entry.name} (${i18n.locale})`)
        }
      }
      const localizeDescription = localizable(entryCtx, cmd, i18n ? i18n.translate : undefined)

      // setup root level completion
      const isPositional = hasPositional(await resolveLazyCommand(entry as Command))
      const root = ''
      completion.addCommand(
        root,
        (await localizeDescription(resolveKey('description', entryCtx))) || entry.description || '',
        isPositional ? [false] : [],
        NOOP_HANDLER
      )

      const args = entry.args || (Object.create(null) as Args)
      for (const [key, schema] of Object.entries(args)) {
        if (schema.type === 'positional') {
          continue // skip positional arguments on subcommands
        }
        completion.addOption(
          root,
          `--${key}`,
          (await localizeDescription(resolveArgKey(key, entryCtx))) || schema.description || '',
          toBombshellCompletionHandler(
            config.entry?.args?.[key]?.handler || NOOP_HANDLER,
            i18n ? toLocale(i18n.locale) : undefined
          ),
          schema.short
        )
      }

      await handleSubCommands(completion, subCommands, config.subCommands, i18nPluginId, i18n)
    }
  })
}

async function handleSubCommands(
  completion: Completion,
  subCommands: PluginContext['subCommands'],
  configs: Record<string, CompletionConfig> = {},
  i18nPluginId: string,
  i18n?: I18nCommandContext | undefined
) {
  for (const [name, cmd] of subCommands) {
    if (cmd.internal || cmd.entry || name === 'complete') {
      continue // skip entry / internal command / completion command itself
    }

    const resolvedCmd = await resolveLazyCommand(cmd)
    const ctx = await createCommandContext(resolvedCmd, i18nPluginId, i18n)
    if (i18n) {
      const ret = await i18n.loadResource(i18n.locale, ctx, resolvedCmd)
      if (!ret) {
        console.warn(`Failed to load i18n resources for command: ${name} (${i18n.locale})`)
      }
    }
    const localizeDescription = localizable(ctx, resolvedCmd, i18n ? i18n.translate : undefined)

    const isPositional = hasPositional(resolvedCmd)
    const commandName = completion.addCommand(
      name,
      (await localizeDescription(resolveKey('description', ctx))) || resolvedCmd.description || '',
      isPositional ? [false] : [],
      toBombshellCompletionHandler(
        configs?.[name]?.handler || NOOP_HANDLER,
        i18n ? toLocale(i18n.locale) : undefined
      )
    )

    const args = resolvedCmd.args || (Object.create(null) as Args)
    for (const [key, schema] of Object.entries(args)) {
      if (schema.type === 'positional') {
        continue // skip positional arguments on subcommands
      }
      completion.addOption(
        commandName,
        `--${key}`,
        (await localizeDescription(resolveArgKey(key, ctx))) || schema.description || '',
        toBombshellCompletionHandler(
          configs[commandName]?.args?.[key]?.handler || NOOP_HANDLER,
          i18n ? toLocale(i18n.locale) : undefined
        ),
        schema.short
      )
    }
  }
}

function hasPositional(cmd: Command | LazyCommand) {
  return cmd.args && Object.values(cmd.args).some(arg => arg.type === 'positional')
}

function toLocale(locale: string | Intl.Locale): Intl.Locale {
  return locale instanceof Intl.Locale ? locale : new Intl.Locale(locale)
}

function toBombshellCompletionHandler(handler: CompletionHandler, locale?: Intl.Locale): Handler {
  return (previousArgs, toComplete, endWithSpace) =>
    handler({ previousArgs, toComplete, endWithSpace, locale })
}
