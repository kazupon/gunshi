/**
 * The entry point of suggestion plugin.
 *
 * @example
 * ```js
 * import { cli } from 'gunshi'
 * import { suggestion } from '@gunshi/plugin-suggestion'
 *
 * await cli(process.argv.slice(2), command, {
 *   strict: true,
 *   plugins: [
 *     suggestion()
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

import {
  ArgsValidationErrorKeys,
  isArgsValidationError,
  isCommandNotFoundError,
  plugin
} from '@gunshi/plugin'

import type { CommandContext, PluginWithoutExtension } from '@gunshi/plugin'

/**
 * The unique identifier for suggestion plugin.
 */
export const pluginId = 'g:suggestion' as const

/**
 * Type representing the unique identifier for suggestion plugin.
 */
export type PluginId = typeof pluginId

/**
 * Suggestion error resource keys.
 */
export const SuggestionErrorKeys = {
  didYouMean: 'err:suggestion:did-you-mean'
} as const

/**
 * Suggestion error resource key type.
 */
export type SuggestionErrorCode = (typeof SuggestionErrorKeys)[keyof typeof SuggestionErrorKeys]

/**
 * Distance function for scoring candidate names.
 *
 * Lower values are treated as better matches.
 */
export type DistanceFunction = (input: string, candidate: string) => number

/**
 * Suggestion function returned by {@link defineSuggestNames}.
 */
export type SuggestNames = (typed: string, candidates: readonly string[]) => string[]

/**
 * Suggestion plugin options.
 */
export interface SuggestionOptions {
  /**
   * Maximum distance allowed for a candidate.
   *
   * @default 2
   */
  maxDistance?: number
  /**
   * Maximum number of suggestions to render for one error.
   *
   * @default 1
   */
  maxSuggestions?: number
  /**
   * Whether to suggest known long options for unknown option errors.
   *
   * @default true
   */
  includeOptions?: boolean
  /**
   * Whether to suggest known commands for command-not-found errors.
   *
   * @default true
   */
  includeCommands?: boolean
  /**
   * Distance function used for ranking candidates.
   *
   * @default levenshtein
   */
  distance?: DistanceFunction
  /**
   * Normalize typed input and candidates before distance calculation.
   *
   * @default value => value
   */
  normalize?: (value: string) => string
}

/**
 * Resolved suggestion plugin options.
 */
export interface ResolvedSuggestionOptions {
  /**
   * Maximum distance allowed for a candidate.
   */
  maxDistance: number
  /**
   * Maximum number of suggestions to render for one error.
   */
  maxSuggestions: number
  /**
   * Whether to suggest known long options for unknown option errors.
   */
  includeOptions: boolean
  /**
   * Whether to suggest known commands for command-not-found errors.
   */
  includeCommands: boolean
  /**
   * Distance function used for ranking candidates.
   */
  distance: DistanceFunction
  /**
   * Normalize typed input and candidates before distance calculation.
   */
  normalize: (value: string) => string
}

interface I18nLikeExtension {
  translate?: (key: string, values?: Record<string, unknown>) => string
}

type UnknownOptionSuggestionValues = {
  rawName?: unknown
  name?: unknown
  candidates?: unknown
}

const i18nPluginId = 'g:i18n' as const

const dependencies = [{ id: i18nPluginId, optional: true }] as const

/**
 * Calculate the Levenshtein distance between two strings.
 *
 * @param input - Input string
 * @param candidate - Candidate string
 * @returns Edit distance between the two strings
 */
export function levenshtein(input: string, candidate: string): number {
  if (input === candidate) {
    return 0
  }

  if (input.length === 0) {
    return candidate.length
  }

  if (candidate.length === 0) {
    return input.length
  }

  let previous = Array.from({ length: candidate.length + 1 }, (_, index) => index)
  let current = Array.from({ length: candidate.length + 1 }, () => 0)

  for (let i = 1; i <= input.length; i++) {
    current[0] = i
    for (let j = 1; j <= candidate.length; j++) {
      const cost = input[i - 1] === candidate[j - 1] ? 0 : 1
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost)
    }
    ;[previous, current] = [current, previous]
  }

  return previous[candidate.length]
}

/**
 * Create a suggestion function with resolved options captured in a closure.
 *
 * @param options - Resolved suggestion options
 * @returns A function that suggests candidate names
 */
export function defineSuggestNames(options: ResolvedSuggestionOptions): SuggestNames {
  return function suggestNames(typed: string, candidates: readonly string[]): string[] {
    const normalizedTyped = options.normalize(normalizeSuggestionName(typed))

    return candidates
      .map((candidate, index) => ({
        candidate,
        index,
        distance: options.distance(
          normalizedTyped,
          options.normalize(normalizeSuggestionName(candidate))
        )
      }))
      .filter(item => item.distance <= options.maxDistance)
      .sort((a, b) => a.distance - b.distance || a.index - b.index)
      .slice(0, options.maxSuggestions)
      .map(item => item.candidate)
  }
}

/**
 * Suggestion plugin.
 *
 * @param options - Suggestion plugin options
 * @returns A defined plugin as suggestion
 */
export function suggestion(options: SuggestionOptions = {}): PluginWithoutExtension {
  const resolved = resolveSuggestionOptions(options)
  const suggestNames = defineSuggestNames(resolved)

  return plugin<
    Record<typeof i18nPluginId, I18nLikeExtension>,
    typeof pluginId,
    typeof dependencies
  >({
    id: pluginId,
    name: 'suggestion',
    dependencies,

    setup(ctx) {
      ctx.decorateValidationErrorsRenderer(async (baseRenderer, cmdCtx, error) => {
        const message = await baseRenderer(cmdCtx, error)
        const hints: string[] = []
        const seen = new Set<string>()

        for (const err of error.errors as unknown[]) {
          if (resolved.includeOptions) {
            await collectSuggestions(
              hints,
              seen,
              cmdCtx,
              getUnknownOptionSuggestionInput(err),
              suggestNames
            )
          }

          if (resolved.includeCommands) {
            await collectSuggestions(
              hints,
              seen,
              cmdCtx,
              getCommandSuggestionInput(err),
              suggestNames
            )
          }
        }

        return [message, ...hints].filter(Boolean).join('\n')
      })
    }
  })
}

function resolveSuggestionOptions(options: SuggestionOptions): ResolvedSuggestionOptions {
  return {
    maxDistance: options.maxDistance ?? 2,
    maxSuggestions: options.maxSuggestions ?? 1,
    includeOptions: options.includeOptions ?? true,
    includeCommands: options.includeCommands ?? true,
    distance: options.distance ?? levenshtein,
    normalize: options.normalize ?? (value => value)
  }
}

async function collectSuggestions(
  hints: string[],
  seen: Set<string>,
  ctx: Readonly<CommandContext>,
  input: { name: string; candidates: readonly string[] } | undefined,
  suggestNames: SuggestNames
): Promise<void> {
  if (!input) {
    return
  }

  const suggestions = suggestNames(input.name, input.candidates)
  for (const name of suggestions) {
    const hint = localizeSuggestion(ctx, name)
    if (!seen.has(hint)) {
      seen.add(hint)
      hints.push(hint)
    }
  }
}

function getUnknownOptionSuggestionInput(
  error: unknown
): { name: string; candidates: readonly string[] } | undefined {
  if (!isArgsValidationError(error) || error.code !== ArgsValidationErrorKeys.unknownOption) {
    return undefined
  }

  const values = error.values as UnknownOptionSuggestionValues
  if (typeof values.rawName !== 'string' || !values.rawName.startsWith('--')) {
    return undefined
  }
  if (typeof values.name !== 'string' || !Array.isArray(values.candidates)) {
    return undefined
  }

  const candidates = values.candidates.filter((candidate): candidate is string => {
    return typeof candidate === 'string' && candidate.startsWith('--')
  })

  return candidates.length > 0
    ? {
        name: values.name,
        candidates
      }
    : undefined
}

function getCommandSuggestionInput(
  error: unknown
): { name: string; candidates: readonly string[] } | undefined {
  if (!isCommandNotFoundError(error) || error.candidates.length === 0) {
    return undefined
  }

  return {
    name: error.commandName,
    candidates: error.candidates
  }
}

function localizeSuggestion(ctx: Readonly<CommandContext>, name: string): string {
  const i18n = (ctx.extensions as Record<string, I18nLikeExtension> | undefined)?.[i18nPluginId]
  const translated = i18n?.translate?.(SuggestionErrorKeys.didYouMean, { name })

  return translated || `Did you mean ${name}?`
}

function normalizeSuggestionName(value: string): string {
  return value.startsWith('--') ? value.slice(2) : value
}
