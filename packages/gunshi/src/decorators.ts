/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { renderHeader, renderUsage, renderValidationErrors } from './renderer.ts'

import type { CommandContext, RendererDecorator, ValidationErrorsDecorator } from './types.ts'

/**
 * Internal class for managing renderer decorators.
 * This class is not exposed to plugin authors.
 */
export class RendererDecorators {
  #headerDecorators: RendererDecorator<string>[] = []
  #usageDecorators: RendererDecorator<string>[] = []
  #validationDecorators: ValidationErrorsDecorator[] = []

  addHeaderDecorator(decorator: RendererDecorator<string>): void {
    this.#headerDecorators.push(decorator)
  }

  addUsageDecorator(decorator: RendererDecorator<string>): void {
    this.#usageDecorators.push(decorator)
  }

  addValidationErrorsDecorator(decorator: ValidationErrorsDecorator): void {
    this.#validationDecorators.push(decorator)
  }

  getHeaderRenderer(): (ctx: CommandContext) => Promise<string> {
    return this.#buildRenderer(this.#headerDecorators, renderHeader)
  }

  getUsageRenderer(): (ctx: CommandContext) => Promise<string> {
    return this.#buildRenderer(this.#usageDecorators, renderUsage)
  }

  getValidationErrorsRenderer(): (ctx: CommandContext, error: AggregateError) => Promise<string> {
    if (this.#validationDecorators.length === 0) {
      return renderValidationErrors
    }

    let renderer = renderValidationErrors
    for (const decorator of this.#validationDecorators) {
      const previousRenderer = renderer
      renderer = (ctx, error) => decorator(previousRenderer, ctx, error)
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
