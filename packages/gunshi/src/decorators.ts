/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type { Args } from 'args-tokens'
import type {
  CommandContextWithPossibleExt,
  CommandDecorator,
  RendererDecorator,
  ValidationErrorsDecorator
} from './types.ts'

const EMPTY_RENDERER = async () => ''

/**
 * Internal class for managing renderer decorators.
 * This class is not exposed to plugin authors.
 */
export class Decorators<A extends Args = Args> {
  #headerDecorators: RendererDecorator<string, A>[] = []
  #usageDecorators: RendererDecorator<string, A>[] = []
  #validationDecorators: ValidationErrorsDecorator<A>[] = []
  #commandDecorators: CommandDecorator<A>[] = []

  addHeaderDecorator(decorator: RendererDecorator<string, A>): void {
    this.#headerDecorators.push(decorator)
  }

  addUsageDecorator(decorator: RendererDecorator<string, A>): void {
    this.#usageDecorators.push(decorator)
  }

  addValidationErrorsDecorator(decorator: ValidationErrorsDecorator<A>): void {
    this.#validationDecorators.push(decorator)
  }

  addCommandDecorator(decorator: CommandDecorator<A>): void {
    this.#commandDecorators.push(decorator)
  }

  get commandDecorators(): readonly CommandDecorator<A>[] {
    return [...this.#commandDecorators]
  }

  getHeaderRenderer(): (ctx: CommandContextWithPossibleExt<A>) => Promise<string> {
    return this.#buildRenderer(this.#headerDecorators, EMPTY_RENDERER)
  }

  getUsageRenderer(): (ctx: CommandContextWithPossibleExt<A>) => Promise<string> {
    return this.#buildRenderer(this.#usageDecorators, EMPTY_RENDERER)
  }

  getValidationErrorsRenderer(): (
    ctx: CommandContextWithPossibleExt<A>,
    error: AggregateError
  ) => Promise<string> {
    if (this.#validationDecorators.length === 0) {
      return EMPTY_RENDERER
    }

    let renderer: (
      ctx: CommandContextWithPossibleExt<A>,
      error: AggregateError
    ) => Promise<string> = EMPTY_RENDERER
    for (const decorator of this.#validationDecorators) {
      const previousRenderer = renderer
      renderer = (ctx: CommandContextWithPossibleExt<A>, error: AggregateError) =>
        decorator(previousRenderer, ctx, error)
    }
    return renderer
  }

  #buildRenderer<T, A extends Args = Args>(
    decorators: RendererDecorator<T, A>[],
    defaultRenderer: (ctx: CommandContextWithPossibleExt<A>) => Promise<T>
  ): (ctx: CommandContextWithPossibleExt<A>) => Promise<T> {
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
