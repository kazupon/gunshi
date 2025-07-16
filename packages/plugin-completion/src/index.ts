/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { Completion, script } from '@bombsh/tab'
import { plugin } from '@gunshi/plugin'
import { resolveLazyCommand } from '@gunshi/shared'
import { pluginId } from './types.ts'
import { quoteExec } from './utils.ts'

import type { Handler } from '@bombsh/tab'
import type {
  Args,
  Command,
  LazyCommand,
  PluginContext,
  PluginWithoutExtension
} from '@gunshi/plugin'
import type { CompletionConfig, CompletionOptions } from './types.ts'

export * from './types.ts'

const TERMINATOR = '--'

const NOOP_HANDLER: Handler = () => {
  return []
}

// NOTE(kazupon): we should use plugin-i18n for completion localization, but it is not ready yet.
// const i18nPluginId = namespacedId('i18n')

/**
 * completion plugin for gunshi
 */
export default function completion(options: CompletionOptions = {}): PluginWithoutExtension {
  const config = options.config || {}
  const completion = new Completion()

  return plugin({
    id: pluginId,
    name: 'completion',

    // NOTE(kazupon): disable dependencies for now, because plugin-i18n is not still ready yet for completion
    // dependencies: [{ id: i18nPluginId, optional: true }],

    async setup(ctx) {
      /**
       * add command for completion script generation
       */

      const completeName = 'complete'
      ctx.addCommand(completeName, {
        name: completeName,
        // TODO(kazupon): support description localization
        description: 'Generate shell completion script',
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

      /**
       * disable header renderer
       */
      // TODO(kazupon): we might be change this to a more flexible way
      ctx.decorateHeaderRenderer(async (_baseRenderer, _cmdCtx) => '')
    },

    /**
     * setup bombshell completion with `onExtension` hook
     */

    onExtension: async (ctx, _cmd) => {
      // NOTE(kazupon): we should use plugin-i18n for completion localization, but it is not ready yet.
      // const extensions = ctx.extensions as unknown as { [i18nPluginId]: I18nCommandContext }
      // const i18n = extensions[i18nPluginId]
      const subCommands = ctx.env.subCommands as ReadonlyMap<string, Command | LazyCommand>

      const entry = [...subCommands].map(([_, cmd]) => cmd).find(cmd => cmd.entry)
      if (!entry) {
        throw new Error('entry command not found.')
      }

      // NOTE(kazupon): we should use localizeDescription here, but it is not ready yet.
      // const entryCtx = await createCommandContext(entry)
      // const localizeDescription = localizable(
      //   entryCtx as unknown as CommandContext,
      //   cmd,
      //   i18n ? i18n.translate : undefined
      // )

      // setup root level completion
      const isPositional = hasPositional(await resolveLazyCommand(entry as Command))
      const root = ''
      completion.addCommand(
        root,
        entry.description || '',
        // NOTE(kazupon): we should use localizeDescription here, but it is not ready yet.
        // (await localizeDescription('description')) || entry.description || '',
        isPositional ? [false] : [],
        NOOP_HANDLER
      )

      const args = entry.args || (Object.create(null) as Args)
      for (const [key, schema] of Object.entries(args)) {
        if (schema.type === 'positional') {
          continue // skip positional arguments on subcommands
        }
        // TODO(kazupon): more tweaking for root option completion
        completion.addOption(
          root,
          `--${key}`,
          schema.description || '',
          // NOTE(kazupon): we should use localizeDescription here, but it is not ready yet.
          // (await localizeDescription(resolveArgKey(key))) || schema.description || '',
          config.entry?.args?.[key]?.handler || NOOP_HANDLER,
          schema.short
        )
      }

      await handleSubCommands(completion, subCommands, config.subCommands /* , i18n*/)
    }
  })
}

async function handleSubCommands(
  completion: Completion,
  subCommands: PluginContext['subCommands'],
  configs: Record<string, CompletionConfig> = {}
  // NOTE(kazupon): we should use i18n for subcommand localization, but it is not ready yet.
  // i18n?: I18nCommandContext | undefined
) {
  for (const [name, cmd] of subCommands) {
    if (cmd.internal || cmd.entry || name === 'complete') {
      continue // skip entry / internal command / completion command itself
    }

    const resolvedCmd = await resolveLazyCommand(cmd)
    // NOTE(kazupon): we should use localizeDescription here, but it is not ready yet.
    // const ctx = await createCommandContext(resolvedCmd)
    // const localizeDescription = localizable(ctx, resolvedCmd, i18n ? i18n.translate : undefined)

    const isPositional = hasPositional(resolvedCmd)
    // TODO(kazupon): more tweaking for subcommand completion
    const commandName = completion.addCommand(
      name,
      resolvedCmd.description || '',
      // NOTE(kazupon): we should use localizeDescription here, but it is not ready yet.
      // (await localizeDescription('description')) || resolvedCmd.description || '',
      isPositional ? [false] : [],
      configs?.[name]?.handler || NOOP_HANDLER
    )

    const args = resolvedCmd.args || (Object.create(null) as Args)
    for (const [key, schema] of Object.entries(args)) {
      if (schema.type === 'positional') {
        continue // skip positional arguments on subcommands
      }
      // TODO(kazupon): more tweaking for subcommand option completion
      completion.addOption(
        commandName,
        `--${key}`,
        schema.description || '',
        // NOTE(kazupon): we should use localizeDescription here, but it is not ready yet.
        // (await localizeDescription(resolveArgKey(key))) || schema.description || '',
        configs[commandName]?.args?.[key]?.handler || NOOP_HANDLER,
        schema.short
      )
    }
  }
}

function hasPositional(cmd: Command | LazyCommand) {
  return cmd.args && Object.values(cmd.args).some(arg => arg.type === 'positional')
}
