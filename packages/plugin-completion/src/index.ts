/**
 * The entry point of completion plugin
 *
 * @example
 * ```js
 * import { cli } from 'gunshi'
 * import completion from '@gunshi/plugin-completion'
 *
 * const command = {
 *   name: 'deploy',
 *   args: {
 *     environment: {
 *       type: 'string',
 *       short: 'e',
 *       description: 'Target environment'
 *     },
 *     config: {
 *       type: 'string',
 *       short: 'c',
 *       description: 'Config file path'
 *     }
 *   },
 *   run: ctx => {
 *     console.log(`Deploying to ${ctx.values.environment}`)
 *   }
 * }
 *
 * await cli(process.argv.slice(2), command, {
 *   name: 'my-cli',
 *   version: '1.0.0',
 *   plugins: [
 *     completion({
 *       config: {
 *         entry: {
 *           args: {
 *             config: {
 *               handler: () => [
 *                 { value: 'prod.json', description: 'Production config' },
 *                 { value: 'dev.json', description: 'Development config' },
 *                 { value: 'test.json', description: 'Test config' }
 *               ]
 *             }
 *           }
 *         }
 *       }
 *     })
 *   ]
 * })
 * ```
 *
 * @module
 */

/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { RootCommand } from '@bomb.sh/tab'
import { plugin } from '@gunshi/plugin'
import { namespacedId } from '@gunshi/shared'
import { handleSubCommands, registerCompletion } from './registration.ts'
import { pluginId } from './types.ts'
import { quoteExec } from './utils.ts'

import type { Command, LazyCommand, PluginWithoutExtension } from '@gunshi/plugin'
import type { I18nExtension } from '@gunshi/plugin-i18n'
import type { CompletionOptions } from './types.ts'

export * from './types.ts'

const TERMINATOR = '--'

const i18nPluginId = namespacedId('i18n')

const dependencies = [{ id: i18nPluginId, optional: true }] as const

/**
 * completion plugin
 *
 * @param options - A {@linkcode CompletionOptions | Completion options}
 * @returns A defined plugin as completion
 */
export default function completion(options: CompletionOptions = {}): PluginWithoutExtension {
  const config = options.config || {}
  const t = new RootCommand()

  return plugin<Record<typeof i18nPluginId, I18nExtension>, typeof pluginId, typeof dependencies>({
    id: pluginId,
    name: 'completion',
    dependencies,

    setup(ctx) {
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
        run: cmdCtx => {
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

    onExtension: async (ctx, cmd) => {
      const i18n = ctx.extensions[i18nPluginId]
      const subCommands = ctx.env.subCommands as ReadonlyMap<string, Command | LazyCommand>

      const entry =
        [...subCommands].map(([_, cmd]) => cmd).find(cmd => cmd.entry) || (cmd as Command)

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
