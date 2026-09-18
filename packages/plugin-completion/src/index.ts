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
import { COMPLETE_COMMAND_NAME, registerForCompletion } from './registration.ts'
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

  return plugin<Record<typeof i18nPluginId, I18nExtension>, typeof pluginId, typeof dependencies>({
    id: pluginId,
    name: 'completion',
    dependencies,

    setup(ctx) {
      /**
       * add command for completion script generation and runtime completion
       */

      /**
       * NOTE(kazupon): registered as the completion root only when gunshi does not expose
       * the entry command, which is the case with the versions before `env.entryCommand`.
       */
      const fallbackEntry: Command = {
        name: COMPLETE_COMMAND_NAME,
        // TODO(kazupon): support description localization
        description: 'Generate shell completion script'
      }

      ctx.addCommand(COMPLETE_COMMAND_NAME, {
        ...fallbackEntry,
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

          /**
           * NOTE(kazupon): the completion tree is built here, and only here.
           * Building it for every command run, which is what the `onExtension` hook would do,
           * costs the whole command tree on runs that never complete anything.
           */
          const t = new RootCommand()
          if (shell === undefined) {
            const args = cmdCtx._.slice(cmdCtx._.indexOf(TERMINATOR) + 1)
            await registerForCompletion({
              t,
              args,
              subCommands:
                (cmdCtx.env.subCommands as
                  | ReadonlyMap<string, Command | LazyCommand>
                  | undefined) || new Map<string, Command | LazyCommand>(),
              fallbackEntry: cmdCtx.env.entryCommand || fallbackEntry,
              config,
              i18nPluginId,
              i18n: cmdCtx.extensions[i18nPluginId]
            })
            t.parse(args)
          } else if (['zsh', 'bash', 'fish', 'powershell'].includes(shell)) {
            // the completion script only needs the CLI name and the executable
            t.setup(cmdCtx.env.name, quoteExec(), shell)
          }
        }
      })
    }
  })
}
