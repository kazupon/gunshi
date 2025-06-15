/**
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import type { Args } from 'args-tokens'
import type {
  CommandContext,
  CommandDecorator,
  ExtendContext,
  RendererDecorator,
  ValidationErrorsDecorator
} from './types.ts'

const EMPTY_RENDERER = async () => ''

/**
 * Internal class for managing renderer decorators.
 * This class is not exposed to plugin authors.
 */
export class Decorators<A extends Args = Args, E extends ExtendContext = {}> {
  #headerDecorators: RendererDecorator<string, A, E>[] = []
  #usageDecorators: RendererDecorator<string, A, E>[] = []
  #validationDecorators: ValidationErrorsDecorator<A, E>[] = []
  #commandDecorators: CommandDecorator<A, E>[] = []

  addHeaderDecorator(decorator: RendererDecorator<string, A, E>): void {
    this.#headerDecorators.push(decorator)
  }

  addUsageDecorator(decorator: RendererDecorator<string, A, E>): void {
    this.#usageDecorators.push(decorator)
  }

  addValidationErrorsDecorator(decorator: ValidationErrorsDecorator<A, E>): void {
    this.#validationDecorators.push(decorator)
  }

  addCommandDecorator(decorator: CommandDecorator<A, E>): void {
    this.#commandDecorators.push(decorator)
  }

  get commandDecorators(): readonly CommandDecorator<A, E>[] {
    return [...this.#commandDecorators]
  }

  getHeaderRenderer<
    L extends Record<string, unknown> = {},
    C extends Record<string, unknown> = keyof E extends never ? L : E & L
  >(): (ctx: Readonly<CommandContext<A, C>>) => Promise<string> {
    return this.#buildRenderer(this.#headerDecorators, EMPTY_RENDERER) as unknown as (
      ctx: Readonly<CommandContext<A, C>>
    ) => Promise<string>
  }

  getUsageRenderer<
    L extends Record<string, unknown> = {},
    C extends Record<string, unknown> = keyof E extends never ? L : E & L
  >(): (ctx: Readonly<CommandContext<A, C>>) => Promise<string> {
    return this.#buildRenderer(this.#usageDecorators, EMPTY_RENDERER) as unknown as (
      ctx: Readonly<CommandContext<A, C>>
    ) => Promise<string>
  }

  getValidationErrorsRenderer<
    L extends Record<string, unknown> = {},
    C extends Record<string, unknown> = keyof E extends never ? L : E & L
  >(): (ctx: Readonly<CommandContext<A, C>>, error: AggregateError) => Promise<string> {
    if (this.#validationDecorators.length === 0) {
      return EMPTY_RENDERER
    }

    let renderer: (ctx: Readonly<CommandContext<A, C>>, error: AggregateError) => Promise<string> =
      EMPTY_RENDERER
    for (const decorator of this.#validationDecorators) {
      const previousRenderer = renderer
      renderer = (ctx: Readonly<CommandContext<A, C>>, error: AggregateError) =>
        (decorator as unknown as ValidationErrorsDecorator<A, C>)(previousRenderer, ctx, error)
    }
    return renderer
  }

  #buildRenderer<T, A extends Args = Args, E extends ExtendContext = {}>(
    decorators: RendererDecorator<T, A, E>[],
    defaultRenderer: (ctx: Readonly<CommandContext<A, E>>) => Promise<T>
  ): (ctx: Readonly<CommandContext<A, E>>) => Promise<T> {
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
