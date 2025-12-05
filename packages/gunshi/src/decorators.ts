/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type {
  CommandContext,
  CommandDecorator,
  DefaultGunshiParams,
  GunshiParamsConstraint,
  RendererDecorator,
  ValidationErrorsDecorator
} from './types.ts'

const EMPTY_RENDERER = () => Promise.resolve('')

/**
 * Interface for managing renderer and command decorators.
 * This interface defines the contract for decorator management in plugins.
 *
 * @internal
 */
export interface Decorators<G extends GunshiParamsConstraint = DefaultGunshiParams> {
  /**
   * Add a header renderer decorator.
   */
  addHeaderDecorator(decorator: RendererDecorator<string, G>): void
  /**
   * Add a usage renderer decorator.
   */
  addUsageDecorator(decorator: RendererDecorator<string, G>): void
  /**
   * Add a validation errors renderer decorator.
   */
  addValidationErrorsDecorator(decorator: ValidationErrorsDecorator<G>): void
  /**
   * Add a command decorator.
   */
  addCommandDecorator(decorator: CommandDecorator<G>): void
  /**
   * Get the list of command decorators.
   */
  readonly commandDecorators: readonly CommandDecorator<G>[]
  /**
   * Get the header renderer.
   */
  getHeaderRenderer(): (ctx: Readonly<CommandContext<G>>) => Promise<string>
  /**
   * Get the usage renderer.
   */
  getUsageRenderer(): (ctx: Readonly<CommandContext<G>>) => Promise<string>
  /**
   * Get the validation errors renderer.
   */
  getValidationErrorsRenderer(): (
    ctx: Readonly<CommandContext<G>>,
    error: AggregateError
  ) => Promise<string>
}

/**
 * Factory function for creating a decorators manager.
 *
 * @returns A new decorators manager instance
 */
export function createDecorators<
  G extends GunshiParamsConstraint = DefaultGunshiParams
>(): Decorators<G> {
  /**
   * private states
   */

  const headerDecorators: RendererDecorator<string, G>[] = []
  const usageDecorators: RendererDecorator<string, G>[] = []
  const validationDecorators: ValidationErrorsDecorator<G>[] = []
  const commandDecorators: CommandDecorator<G>[] = []

  /**
   * helper function for building renderers
   */

  function buildRenderer<T>(
    decorators: RendererDecorator<T, G>[],
    defaultRenderer: (ctx: Readonly<CommandContext<G>>) => Promise<T>
  ): (ctx: Readonly<CommandContext<G>>) => Promise<T> {
    if (decorators.length === 0) {
      return defaultRenderer
    }

    let renderer = defaultRenderer
    for (const decorator of decorators) {
      const previousRenderer = renderer
      renderer = ctx => decorator(previousRenderer, ctx)
    }
    return renderer
  }

  /**
   * public interfaces
   */

  return Object.freeze({
    addHeaderDecorator(decorator: RendererDecorator<string, G>): void {
      headerDecorators.push(decorator)
    },

    addUsageDecorator(decorator: RendererDecorator<string, G>): void {
      usageDecorators.push(decorator)
    },

    addValidationErrorsDecorator(decorator: ValidationErrorsDecorator<G>): void {
      validationDecorators.push(decorator)
    },

    addCommandDecorator(decorator: CommandDecorator<G>): void {
      commandDecorators.push(decorator)
    },

    get commandDecorators(): readonly CommandDecorator<G>[] {
      return [...commandDecorators]
    },

    getHeaderRenderer(): (ctx: Readonly<CommandContext<G>>) => Promise<string> {
      return buildRenderer(headerDecorators, EMPTY_RENDERER)
    },

    getUsageRenderer(): (ctx: Readonly<CommandContext<G>>) => Promise<string> {
      return buildRenderer(usageDecorators, EMPTY_RENDERER)
    },

    getValidationErrorsRenderer(): (
      ctx: Readonly<CommandContext<G>>,
      error: AggregateError
    ) => Promise<string> {
      if (validationDecorators.length === 0) {
        return EMPTY_RENDERER
      }

      let renderer: (ctx: Readonly<CommandContext<G>>, error: AggregateError) => Promise<string> =
        EMPTY_RENDERER
      for (const decorator of validationDecorators) {
        const previousRenderer = renderer
        renderer = (ctx: Readonly<CommandContext<G>>, error: AggregateError) =>
          decorator(previousRenderer, ctx, error)
      }
      return renderer
    }
  })
}
