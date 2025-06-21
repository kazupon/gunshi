/**
 * The gunshi plugin entry point
 *
 * @example
 * ```js
 * import { plugin } from 'gunshi/plugin'
 * ```
 *
 * @module
 */

/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { Decorators } from './decorators.ts'

import type { Args, ArgSchema } from 'args-tokens'
import type {
  Awaitable,
  Command,
  CommandContext,
  CommandContextCore,
  CommandContextExtension,
  CommandDecorator,
  DefaultGunshiParams,
  GunshiParams,
  RendererDecorator,
  ValidationErrorsDecorator
} from './types.ts'

export type { GlobalsCommandContext } from './plugins/globals.ts'

/**
 * Plugin dependency definition
 */
export interface PluginDependency {
  /**
   * Dependency plugin name
   */
  name: string
  /**
   * Optional dependency flag.
   * If true, the plugin will not throw an error if the dependency is not found.
   */
  optional?: boolean
}

/**
 * Gunshi plugin context.
 * @internal
 */
export class PluginContext<G extends GunshiParams = DefaultGunshiParams> {
  #globalOptions: Map<string, ArgSchema> = new Map()
  #decorators: Decorators<G>

  constructor(decorators: Decorators<G>) {
    this.#decorators = decorators
  }

  /**
   * Get the global options
   * @returns A map of global options.
   */
  get globalOptions(): Map<string, ArgSchema> {
    return new Map(this.#globalOptions)
  }

  /**
   * Add a global option.
   * @param name An option name
   * @param schema An {@link ArgSchema} for the option
   */
  addGlobalOption(name: string, schema: ArgSchema): void {
    if (!name) {
      throw new Error('Option name must be a non-empty string')
    }
    if (this.#globalOptions.has(name)) {
      throw new Error(`Global option '${name}' is already registered`)
    }
    this.#globalOptions.set(name, schema)
  }

  /**
   * Decorate the header renderer.
   * @param decorator - A decorator function that wraps the base header renderer.
   */
  decorateHeaderRenderer<L extends Record<string, unknown> = DefaultGunshiParams['extensions']>(
    decorator: (
      baseRenderer: (
        ctx: Readonly<
          CommandContext<GunshiParams<{ args: G['args']; extensions: G['extensions'] & L }>>
        >
      ) => Promise<string>,
      ctx: Readonly<
        CommandContext<GunshiParams<{ args: G['args']; extensions: G['extensions'] & L }>>
      >
    ) => Promise<string>
  ): void {
    this.#decorators.addHeaderDecorator(decorator as unknown as RendererDecorator<string, G>)
  }

  /**
   * Decorate the usage renderer.
   * @param decorator - A decorator function that wraps the base usage renderer.
   */
  decorateUsageRenderer<L extends Record<string, unknown> = DefaultGunshiParams['extensions']>(
    decorator: (
      baseRenderer: (
        ctx: Readonly<
          CommandContext<GunshiParams<{ args: G['args']; extensions: G['extensions'] & L }>>
        >
      ) => Promise<string>,
      ctx: Readonly<
        CommandContext<GunshiParams<{ args: G['args']; extensions: G['extensions'] & L }>>
      >
    ) => Promise<string>
  ): void {
    this.#decorators.addUsageDecorator(decorator as unknown as RendererDecorator<string, G>)
  }

  /**
   * Decorate the validation errors renderer.
   * @param decorator - A decorator function that wraps the base validation errors renderer.
   */
  decorateValidationErrorsRenderer<
    L extends Record<string, unknown> = DefaultGunshiParams['extensions']
  >(
    decorator: (
      baseRenderer: (
        ctx: Readonly<
          CommandContext<GunshiParams<{ args: G['args']; extensions: G['extensions'] & L }>>
        >,
        error: AggregateError
      ) => Promise<string>,
      ctx: Readonly<
        CommandContext<GunshiParams<{ args: G['args']; extensions: G['extensions'] & L }>>
      >,
      error: AggregateError
    ) => Promise<string>
  ): void {
    this.#decorators.addValidationErrorsDecorator(
      decorator as unknown as ValidationErrorsDecorator<G>
    )
  }

  /**
   * Decorate the command execution.
   * Decorators are applied in reverse order (last registered is executed first).
   * @param decorator - A decorator function that wraps the command runner
   */
  decorateCommand<L extends Record<string, unknown> = DefaultGunshiParams['extensions']>(
    decorator: (
      baseRunner: (
        ctx: Readonly<
          CommandContext<GunshiParams<{ args: G['args']; extensions: G['extensions'] & L }>>
        >
      ) => Awaitable<void | string>
    ) => (
      ctx: Readonly<
        CommandContext<GunshiParams<{ args: G['args']; extensions: G['extensions'] & L }>>
      >
    ) => Awaitable<void | string>
  ): void {
    this.#decorators.addCommandDecorator(decorator as unknown as CommandDecorator<G>)
  }
}

/**
 *  Plugin function type
 */
export type PluginFunction<G extends GunshiParams = DefaultGunshiParams> = (
  ctx: PluginContext<G>
) => Awaitable<void>

/**
 * Plugin extension for CommandContext
 */
export type PluginExtension<
  T = Record<string, unknown>,
  G extends GunshiParams = DefaultGunshiParams
> = (ctx: CommandContextCore<G>, cmd: Command<G>) => T

/**
 * Plugin definition options
 */
export interface PluginOptions<
  T extends Record<string, unknown> = Record<never, never>,
  G extends GunshiParams = DefaultGunshiParams
> {
  /**
   * Plugin name
   */
  name: string
  /**
   * Plugin dependencies
   */
  dependencies?: (PluginDependency | string)[]
  /**
   * Plugin setup function
   */
  setup?: PluginFunction<G>
  /**
   * Plugin extension
   */
  extension?: PluginExtension<T, G>
}

/**
 * Gunshi plugin, which is a function that receives a PluginContext.
 * @param ctx - A {@link PluginContext}.
 * @returns An {@link Awaitable} that resolves when the plugin is loaded.
 */
export type Plugin<E extends GunshiParams['extensions'] = DefaultGunshiParams['extensions']> =
  PluginFunction & {
    name?: string
    dependencies?: (PluginDependency | string)[]
    extension?: CommandContextExtension<E>
  }

/**
 * Plugin return type with extension
 * @internal
 */
export interface PluginWithExtension<
  E extends GunshiParams['extensions'] = DefaultGunshiParams['extensions']
> extends Plugin<E> {
  name: string
  dependencies?: (PluginDependency | string)[]
  extension: CommandContextExtension<E>
}

/**
 * Plugin return type without extension
 * @internal
 */
export interface PluginWithoutExtension<
  E extends GunshiParams['extensions'] = DefaultGunshiParams['extensions']
> extends Plugin<E> {
  name: string
  dependencies?: (PluginDependency | string)[]
}

/**
 * Create a plugin with extension capabilities
 * @param options - {@link PluginOptions | plugin options}
 */
export function plugin<
  N extends string,
  F extends PluginExtension<any, DefaultGunshiParams> // eslint-disable-line @typescript-eslint/no-explicit-any
>(options: {
  name: N
  dependencies?: (PluginDependency | string)[]
  setup?: (
    ctx: PluginContext<GunshiParams<{ args: Args; extensions: { [K in N]: ReturnType<F> } }>>
  ) => Awaitable<void>
  extension: F
}): PluginWithExtension<ReturnType<F>>

export function plugin(options: {
  name: string
  dependencies?: (PluginDependency | string)[]
  setup?: (ctx: PluginContext<DefaultGunshiParams>) => Awaitable<void>
}): PluginWithoutExtension<DefaultGunshiParams['extensions']>

export function plugin<
  N extends string,
  E extends GunshiParams['extensions'] = DefaultGunshiParams['extensions']
>(
  options: {
    name: N
    dependencies?: (PluginDependency | string)[]
    setup?: (
      ctx: PluginContext<GunshiParams<{ args: Args; extensions: { [K in N]?: E } }>>
    ) => Awaitable<void>
    extension?: PluginExtension<E, DefaultGunshiParams>
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  const { name, setup, extension, dependencies } = options

  // create a wrapper function with properties
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pluginFn = async (ctx: PluginContext<any>) => {
    if (setup) {
      await setup(ctx)
    }
  }

  // define the properties
  return Object.defineProperties(pluginFn, {
    name: {
      value: name,
      writable: false,
      enumerable: true,
      configurable: true
    },
    ...(dependencies && {
      dependencies: {
        value: dependencies,
        writable: false,
        enumerable: true,
        configurable: true
      }
    }),
    ...(extension && {
      extension: {
        value: {
          key: Symbol(name),
          factory: extension
        },
        writable: false,
        enumerable: true,
        configurable: true
      }
    })
  })
}

/**
 * Resolve plugin dependencies using topological sort
 * @param plugins - Array of plugins to resolve
 * @returns Array of plugins sorted by dependencies
 * @throws Error if circular dependency is detected or required dependency is missing
 */
export function resolveDependencies<E extends GunshiParams['extensions']>(
  plugins: Plugin<E>[]
): Plugin<E>[] {
  const sorted: Plugin<E>[] = []
  const visited = new Set<string>()
  const visiting = new Set<string>()
  const pluginMap = new Map<string, Plugin<E>>()

  // build a map for quick lookup
  for (const plugin of plugins) {
    if (plugin.name) {
      if (pluginMap.has(plugin.name)) {
        console.warn(`Duplicate plugin name detected: \`${plugin.name}\``)
      }
      pluginMap.set(plugin.name, plugin)
    }
  }

  function visit(plugin: Plugin<E>) {
    if (!plugin.name) {
      return
    }
    if (visited.has(plugin.name)) {
      return
    }
    if (visiting.has(plugin.name)) {
      throw new Error(`Circular dependency detected: \`${plugin.name}\``)
    }

    visiting.add(plugin.name)

    // process dependencies first
    const deps = plugin.dependencies || []
    for (const dep of deps) {
      const depName = typeof dep === 'string' ? dep : dep.name
      const isOptional = typeof dep === 'string' ? false : dep.optional || false

      const depPlugin = pluginMap.get(depName)
      if (!depPlugin && !isOptional) {
        throw new Error(`Missing required dependency: \`${depName}\` on \`${plugin.name}\``)
      }
      if (depPlugin) {
        visit(depPlugin)
      }
    }

    visiting.delete(plugin.name)
    visited.add(plugin.name)
    sorted.push(plugin)
  }

  // visit all plugins
  for (const plugin of plugins) {
    visit(plugin)
  }

  return sorted
}
