/**
 * The entry point for AI agent detection utilities.
 *
 * Detection is delegated to {@link https://github.com/unjs/std-env | std-env}.
 * The `gunshi/agent` API exposes a stable, minimal profile while the recognized
 * agent names and detection rules may evolve with the upstream detector.
 *
 * @example
 * ```js
 * import { getAgentProfile } from 'gunshi/agent'
 * ```
 *
 * @author kazuya kawaguchi (a.k.a. kazupon)
 * @license MIT
 */

import { agentInfo } from 'std-env'

import type { AgentName } from 'std-env'

/**
 * A profile that summarizes whether the current process is running on an
 * AI coding agent.
 *
 * The shape is intentionally minimal so that callers can use it as a UX hint
 * (for example, to switch output format) without coupling to specific agent
 * names. To get the type, use `ReturnType<typeof getAgentProfile>`.
 */
interface AgentProfile {
  /**
   * `true` if the current process is detected as running on an AI coding
   * agent.
   *
   * Detection is delegated to `std-env`. Prefer checking this flag over the
   * {@link AgentProfile.name | name} field.
   */
  isAgent: boolean
  /**
   * The name of the detected AI coding agent, if any.
   *
   * This is the value reported by `std-env`. Use it only when a specific
   * agent has a known constraint that requires special handling.
   */
  name?: AgentName
}

/**
 * Get the AI coding agent profile of the current process.
 *
 * The detection itself is delegated to `std-env`. This function only converts
 * the upstream `agentInfo` into Gunshi's minimal {@link AgentProfile} shape.
 *
 * @returns An {@link AgentProfile} describing whether the process is running
 *   on an AI coding agent and, if so, which agent was detected.
 *
 * @example
 * ```js
 * import { getAgentProfile } from 'gunshi/agent'
 *
 * const profile = getAgentProfile()
 *
 * if (profile.isAgent) {
 *   // adjust output for AI agent execution
 * }
 * ```
 */
export function getAgentProfile(): AgentProfile {
  const isAgent = !!agentInfo.name

  return {
    isAgent,
    name: agentInfo.name
  }
}
