/**
 * The entry point of dry-run plugin
 *
 * @example
 * ```js
 * import { cli } from 'gunshi'
 * import dryrun from '@gunshi/plugin-dryrun'
 *
 * const command = {
 *   name: 'deploy',
 *   async run(ctx) {
 *     const dryRun = ctx.extensions['g:dryrun']
 *
 *     await dryRun.run(
 *       async function build() {
 *         // build artifacts
 *       },
 *       {
 *         message: 'build artifacts'
 *       }
 *     )
 *   }
 * }
 *
 * await cli(process.argv.slice(2), command, {
 *   plugins: [
 *     dryrun()
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

import { plugin } from '@gunshi/plugin'

import type { Awaitable, PluginWithExtension } from '@gunshi/plugin'

/**
 * The unique identifier for dry-run plugin.
 */
export const pluginId = 'g:dryrun' as const

/**
 * Type representing the unique identifier for dry-run plugin.
 */
export type PluginId = typeof pluginId

const i18nPluginId = 'g:i18n' as const

const defaultDescription = 'Show what would be executed without running side effects'

interface GlobalOptionResourceRegistrar {
  registerGlobalOptionResources(option: string, resources: Record<string, string>): void
}

type NamedFunction = Pick<Function, 'name'>

/**
 * dry-run plugin options.
 */
export interface DryRunPluginOptions {
  /**
   * command values key for dry-run option.
   *
   * @default 'dryRun'
   */
  name?: string
  /**
   * fallback dry-run option description.
   */
  description?: string
  /**
   * localized dry-run option descriptions, used with `@gunshi/plugin-i18n`.
   */
  descriptionResources?: Record<string, string>
  /**
   * dry-run output prefix.
   *
   * @default '[dryrun]'
   */
  prefix?: string
}

/**
 * dry-run output message option.
 */
export interface DryRunMessage {
  /**
   * dry-run output message.
   */
  message?: string
}

/**
 * dry-run result option for `run()`.
 */
export type DryRunRunResult<R> = { result: R } | { resolve: () => Awaitable<R> }

/**
 * dry-run result option for `wrap()`.
 */
export type DryRunWrapResult<A extends unknown[], R> =
  | { result: R }
  | { resolve: (...args: A) => Awaitable<R> }

/**
 * dry-run options tuple for `run()` and `wrap()`.
 *
 * Non-void operations require a fallback result option so dry-run mode can return a value without executing the side effect.
 */
export type DryRunOptionsArg<R, O> = [Awaited<R>] extends [void]
  ? [options?: DryRunMessage & Partial<O>]
  : [options: DryRunMessage & O]

/**
 * dry-run plugin extension.
 */
export interface DryRunExtension {
  /**
   * Whether dry-run mode is enabled.
   */
  readonly enabled: boolean
  /**
   * Run a side-effect task, or skip it in dry-run mode.
   *
   * @param task - A side-effect task
   * @param options - Dry-run message and fallback result options.
   * @returns The task result, or dry-run fallback result
   */
  run<R>(
    task: () => Awaitable<R>,
    ...options: DryRunOptionsArg<R, DryRunRunResult<R>>
  ): Awaitable<R>
  /**
   * Wrap a side-effect function, or skip it in dry-run mode.
   *
   * @param fn - A side-effect function
   * @param options - Dry-run message and fallback result options.
   * @returns A wrapped function
   */
  wrap<A extends unknown[], R>(
    fn: (...args: A) => Awaitable<R>,
    ...options: DryRunOptionsArg<R, DryRunWrapResult<A, R>>
  ): (...args: A) => Awaitable<R>
}

/**
 * dry-run plugin
 *
 * @param options - A {@linkcode DryRunPluginOptions | dry-run plugin options}
 * @returns A defined plugin as dry-run
 */
export default function dryrun(
  options: DryRunPluginOptions = {}
): PluginWithExtension<DryRunExtension> {
  const optionName = options.name ?? 'dryRun'
  const description = resolveDescription(options)
  const descriptionResources = resolveDescriptionResources(options, description)
  const prefix = options.prefix ?? '[dryrun]'
  const dependencies = [{ id: i18nPluginId, optional: true }] as const

  return plugin<
    Record<typeof i18nPluginId, GlobalOptionResourceRegistrar>,
    typeof pluginId,
    typeof dependencies,
    DryRunExtension
  >({
    id: pluginId,
    name: 'dryrun',
    dependencies,

    extension(ctx) {
      /**
       * NOTE(kazupon): the option of this plugin is a global option, and an argument that the command
       * declares under the same name replaces it (#745). The value under the name is then the
       * command's, and reading it as this plugin's flag would either skip real work that nobody asked
       * to skip, or run for real after the user asked for a dry run. The core says which global
       * options are in effect; when it says nothing, as when a command context is built on its own,
       * the option is taken to be in effect.
       */
      const inEffect = ctx.env.globalOptions?.has(optionName) ?? true
      if (!inEffect) {
        console.warn(
          `The command "${ctx.name ?? ''}" declares an argument called "${optionName}", which replaces the global option of @gunshi/plugin-dryrun. Dry-run mode stays off for this command. Rename either of them, for example with \`dryrun({ name: '...' })\`.`
        )
      }
      const enabled = inEffect && ctx.values[optionName] === true

      function resolveMessage(fn: NamedFunction, message?: string): string {
        return message || fn.name || 'anonymous'
      }

      function output(fn: NamedFunction, message?: string): void {
        ctx.log(`${prefix} ${resolveMessage(fn, message)}`)
      }

      function resolveRunResult<R>(
        options?: DryRunMessage & Partial<DryRunRunResult<R>>
      ): Awaitable<R> {
        if (!options) {
          return undefined as R
        }
        if ('resolve' in options && options.resolve) {
          return options.resolve()
        }
        if ('result' in options) {
          return options.result as R
        }
        return undefined as R
      }

      function resolveWrapResult<A extends unknown[], R>(
        args: A,
        options?: DryRunMessage & Partial<DryRunWrapResult<A, R>>
      ): Awaitable<R> {
        if (!options) {
          return undefined as R
        }
        if ('resolve' in options && options.resolve) {
          return options.resolve(...args)
        }
        if ('result' in options) {
          return options.result as R
        }
        return undefined as R
      }

      return {
        enabled,

        run<R>(
          task: () => Awaitable<R>,
          ...options: DryRunOptionsArg<R, DryRunRunResult<R>>
        ): Awaitable<R> {
          const [dryRunOptions] = options
          if (!enabled) {
            return task()
          }
          output(task, dryRunOptions?.message)
          return resolveRunResult(dryRunOptions)
        },

        wrap<A extends unknown[], R>(
          fn: (...args: A) => Awaitable<R>,
          ...options: DryRunOptionsArg<R, DryRunWrapResult<A, R>>
        ): (...args: A) => Awaitable<R> {
          const [dryRunOptions] = options
          return (...args) => {
            if (!enabled) {
              return fn(...args)
            }
            output(fn, dryRunOptions?.message)
            return resolveWrapResult(args, dryRunOptions)
          }
        }
      }
    },

    setup(ctx) {
      ctx.addGlobalOption(optionName, {
        type: 'boolean',
        description
      })
    },

    onExtension(ctx) {
      ctx.extensions[i18nPluginId]?.registerGlobalOptionResources(optionName, descriptionResources)
    }
  })
}

function resolveDescription(options: DryRunPluginOptions): string {
  return (
    options.description ??
    options.descriptionResources?.['en-US'] ??
    Object.values(options.descriptionResources ?? {})[0] ??
    defaultDescription
  )
}

function resolveDescriptionResources(
  options: DryRunPluginOptions,
  description: string
): Record<string, string> {
  return {
    ...options.descriptionResources,
    'en-US': description
  }
}
