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

import { ArgsValidationError, ArgsValidationErrorKeys, CommandError, plugin } from '@gunshi/plugin'
import { namespacedId } from '@gunshi/shared'
import { COMPLETE_COMMAND_NAME, registerForCompletion } from './registration.ts'
import { pluginId } from './types.ts'
import { quoteExec } from './utils.ts'

import type { Command, LazyCommand, PluginWithoutExtension } from '@gunshi/plugin'
import type { I18nExtension } from '@gunshi/plugin-i18n'
import type { CompletionOptions } from './types.ts'

export * from './types.ts'

const TERMINATOR = '--'

/**
 * The shells that the completion script is printed for, as `@bomb.sh/tab` supports them.
 */
const SHELLS = ['bash', 'zsh', 'fish', 'powershell'] as const

const SHELL_CHOICES = SHELLS.map(shell => JSON.stringify(shell)).join(', ')

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
        /**
         * NOTE(kazupon): the help lists the `complete` command only alongside other commands, as v0.37.3
         * did (#875). The completion script runs it, and the users of the CLI run it once to install the
         * script, so the help of a CLI of a single command describes the command alone, without
         * `[COMMANDS]` and the commands section. It is read when the help is rendered, after all the
         * plugins have added their commands, so that the order of the plugins does not matter.
         *
         * @returns Whether the help leaves the command out
         */
        get internal(): boolean {
          for (const [name, command] of ctx.subCommands) {
            if (name !== COMPLETE_COMMAND_NAME && !command.entry && !command.internal) {
              return false
            }
          }
          return true
        },
        /**
         * NOTE(kazupon): the shell is declared, so that the usage shows it, and the command takes it with
         * `strictPositionals` of `cli()`. The completion script runs the command with the words after `--`,
         * which stay in `rest`.
         */
        args: {
          shell: {
            type: 'positional',
            required: false,
            description: 'The shell to print the completion script for',
            /**
             * NOTE(kazupon): a shell that the script cannot be printed for is an argument error, as a value
             * that is not one of the `choices` of an `enum` option is, so that it is reported with the
             * help of the command, instead of printing nothing.
             *
             * @param value - The shell given on the command line
             * @returns The shell
             */
            parse: (value: string): string => {
              if (!(SHELLS as readonly string[]).includes(value)) {
                throw new ArgsValidationError(`expected one of ${SHELL_CHOICES}`, {
                  code: ArgsValidationErrorKeys.invalidChoice,
                  values: {
                    expected: 'enum',
                    choices: SHELL_CHOICES,
                    choiceValues: [...SHELLS],
                    actual: value
                  }
                })
              }
              return value
            }
          }
        },
        rendering: {
          header: null // disable header rendering for completion command
        },
        run: async cmdCtx => {
          /**
           * NOTE(kazupon): the shell is read from its argument, since a global option can come before
           * it, or before the name of the command, in the raw arguments.
           */
          const shell = cmdCtx.values.shell as string | undefined

          /**
           * NOTE(kazupon): the completion tree is built here, and only here.
           * Building it for every command run, which is what the `onExtension` hook would do,
           * costs the whole command tree on runs that never complete anything. `@bomb.sh/tab` is
           * imported here too, for the same reason: it loads `node:assert` and the scripts of the
           * shells when it is loaded.
           */
          const { RootCommand } = await import('@bomb.sh/tab')
          const t = new RootCommand()
          if (shell === undefined) {
            const args = cmdCtx._.slice(cmdCtx._.indexOf(TERMINATOR) + 1)
            const resolvedArgs = await registerForCompletion({
              t,
              args,
              subCommands:
                (cmdCtx.env.subCommands as
                  | ReadonlyMap<string, Command | LazyCommand>
                  | undefined) || new Map<string, Command | LazyCommand>(),
              fallbackEntry: cmdCtx.env.entryCommand || fallbackEntry,
              config,
              i18nPluginId,
              i18n: cmdCtx.extensions[i18nPluginId],
              /**
               * NOTE(kazupon): read here, not in `setup`. The getter returns a copy of the options that are
               * registered so far, and the plugins that are installed after this one have not run by then.
               */
              globalOptions: ctx.globalOptions
            })
            /**
             * NOTE(kazupon): the registration normalizes the request, so `parse` is given what was
             * registered and matches the same command.
             */
            t.parse(resolvedArgs)
          } else if ((SHELLS as readonly string[]).includes(shell)) {
            /**
             * NOTE(kazupon): the completion script needs the name of the CLI, which the shell completes,
             * and the executable. Completing a request does not, so only printing the script requires it.
             */
            if (!cmdCtx.env.name) {
              throw new CommandError(
                "The completion script needs the name of the CLI: give 'name' to cli()"
              )
            }
            t.setup(cmdCtx.env.name, quoteExec(), shell)
          }
        }
      })
    }
  })
}
