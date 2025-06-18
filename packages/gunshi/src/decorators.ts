/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type {
  CommandContext,
  CommandDecorator,
  DefaultGunshiParams,
  GunshiParams,
  RendererDecorator,
  ValidationErrorsDecorator
} from './types.ts'

const EMPTY_RENDERER = async () => ''

/**
 * Internal class for managing renderer decorators.
 * This class is not exposed to plugin authors.
 */
export class Decorators<G extends GunshiParams = DefaultGunshiParams> {
  #headerDecorators: RendererDecorator<string, G>[] = []
  #usageDecorators: RendererDecorator<string, G>[] = []
  #validationDecorators: ValidationErrorsDecorator<G>[] = []
  #commandDecorators: CommandDecorator<G>[] = []

  addHeaderDecorator(decorator: RendererDecorator<string, G>): void {
    this.#headerDecorators.push(decorator)
  }

  addUsageDecorator(decorator: RendererDecorator<string, G>): void {
    this.#usageDecorators.push(decorator)
  }

  addValidationErrorsDecorator(decorator: ValidationErrorsDecorator<G>): void {
    this.#validationDecorators.push(decorator)
  }

  addCommandDecorator(decorator: CommandDecorator<G>): void {
    this.#commandDecorators.push(decorator)
  }

  get commandDecorators(): readonly CommandDecorator<G>[] {
    return [...this.#commandDecorators]
  }

  getHeaderRenderer(): (ctx: Readonly<CommandContext<G>>) => Promise<string> {
    return this.#buildRenderer(this.#headerDecorators, EMPTY_RENDERER)
  }

  getUsageRenderer(): (ctx: Readonly<CommandContext<G>>) => Promise<string> {
    return this.#buildRenderer(this.#usageDecorators, EMPTY_RENDERER)
  }

  getValidationErrorsRenderer(): (
    ctx: Readonly<CommandContext<G>>,
    error: AggregateError
  ) => Promise<string> {
    if (this.#validationDecorators.length === 0) {
      return EMPTY_RENDERER
    }

    let renderer: (ctx: Readonly<CommandContext<G>>, error: AggregateError) => Promise<string> =
      EMPTY_RENDERER
    for (const decorator of this.#validationDecorators) {
      const previousRenderer = renderer
      renderer = (ctx: Readonly<CommandContext<G>>, error: AggregateError) =>
        decorator(previousRenderer, ctx, error)
    }
    return renderer
  }

  #buildRenderer<T, G extends GunshiParams = DefaultGunshiParams>(
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
}
