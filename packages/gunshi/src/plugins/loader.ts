/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { plugin } from '../plugin.ts'
import { resolveLazyCommand } from '../utils.ts'

import type { Command, CommandContextCore, DefaultGunshiParams, GunshiParams } from '../types.ts'

/**
 * Command loader plugin context.
 * This context provides load commands dynamically utils.
 * These utils are available via `CommandContext.extensions.loader`.
 */
export interface LoaderCommandContext {
  /**
   * Load commands
   * @returns A list of commands loaded from the command loader plugin.
   */
  loadCommands: <G extends GunshiParams = DefaultGunshiParams>() => Promise<Command<G>[]>
}

/**
 * Command loader plugin for Gunshi.
 */
export default function loader() {
  return plugin({
    name: 'loader',

    extension: (ctx: CommandContextCore<DefaultGunshiParams>) => {
      let cachedCommands: Command<DefaultGunshiParams>[] | undefined
      return {
        loadCommands: async <G extends GunshiParams = DefaultGunshiParams>(): Promise<
          Command<G>[]
        > => {
          if (cachedCommands) {
            return cachedCommands as Command<G>[]
          }

          const subCommands = [...(ctx.env.subCommands || [])] as [string, Command<G>][]
          cachedCommands = (await Promise.all(
            subCommands.map(async ([name, cmd]) => await resolveLazyCommand(cmd, name))
          )) as Command<DefaultGunshiParams>[]

          return cachedCommands as Command<G>[]
        }
      }
    }
  })
}
