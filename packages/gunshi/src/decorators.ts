/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type {
  CommandContext,
  CommandDecorator,
  RendererDecorator,
  ValidationErrorsDecorator
} from './types.ts'

const EMPTY_RENDERER = async () => ''

/**
 * Internal class for managing renderer decorators.
 * This class is not exposed to plugin authors.
 */
export class Decorators {
  #headerDecorators: RendererDecorator<string>[] = []
  #usageDecorators: RendererDecorator<string>[] = []
  #validationDecorators: ValidationErrorsDecorator[] = []
  #commandDecorators: CommandDecorator[] = []

  addHeaderDecorator(decorator: RendererDecorator<string>): void {
    this.#headerDecorators.push(decorator)
  }

  addUsageDecorator(decorator: RendererDecorator<string>): void {
    this.#usageDecorators.push(decorator)
  }

  addValidationErrorsDecorator(decorator: ValidationErrorsDecorator): void {
    this.#validationDecorators.push(decorator)
  }

  addCommandDecorator(decorator: CommandDecorator): void {
    this.#commandDecorators.push(decorator)
  }

  get commandDecorators(): readonly CommandDecorator[] {
    return [...this.#commandDecorators]
  }

  getHeaderRenderer(): (ctx: CommandContext) => Promise<string> {
    return this.#buildRenderer(this.#headerDecorators, EMPTY_RENDERER)
  }

  getUsageRenderer(): (ctx: CommandContext) => Promise<string> {
    return this.#buildRenderer(this.#usageDecorators, EMPTY_RENDERER)
  }

  getValidationErrorsRenderer(): (ctx: CommandContext, error: AggregateError) => Promise<string> {
    if (this.#validationDecorators.length === 0) {
      return EMPTY_RENDERER
    }

    let renderer: (ctx: CommandContext, error: AggregateError) => Promise<string> = EMPTY_RENDERER
    for (const decorator of this.#validationDecorators) {
      const previousRenderer = renderer
      renderer = (ctx: CommandContext, error: AggregateError) =>
        decorator(previousRenderer, ctx, error)
    }
    return renderer
  }

  #buildRenderer<T>(
    decorators: RendererDecorator<T>[],
    defaultRenderer: (ctx: CommandContext) => Promise<T>
  ): (ctx: CommandContext) => Promise<T> {
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
