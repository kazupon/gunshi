/**
 * Type test for the gunshi/agent public API surface.
 *
 * Verifies that:
 * - `getAgentProfile()` returns the documented `{ isAgent, name? }` shape.
 * - The return type can be derived via `ReturnType<typeof getAgentProfile>`.
 * - `std-env` exports are NOT re-exported from `./agent.ts`.
 * - `AgentProfile` is NOT a named type export.
 */

import { expectTypeOf, test } from 'vitest'
import * as agent from './agent.ts'
import { getAgentProfile } from './agent.ts'

import type { AgentName } from 'std-env'

type AgentModule = typeof agent

test('getAgentProfile() return type is { isAgent, name? }', () => {
  expectTypeOf(getAgentProfile()).toEqualTypeOf<{
    isAgent: boolean
    name?: AgentName
  }>()
})

test('AgentProfile can be derived via ReturnType', () => {
  type AgentProfile = ReturnType<typeof getAgentProfile>

  expectTypeOf<AgentProfile>().toEqualTypeOf<{
    isAgent: boolean
    name?: AgentName
  }>()
})

test('std-env runtime API is not re-exported from gunshi/agent', () => {
  // @ts-expect-error agentInfo from std-env must not be re-exported
  type _A = AgentModule['agentInfo']
  // @ts-expect-error agent constant from std-env must not be re-exported
  type _B = AgentModule['agent']
  // @ts-expect-error isAgent from std-env must not be re-exported
  type _C = AgentModule['isAgent']
  // @ts-expect-error detectAgent from std-env must not be re-exported
  type _D = AgentModule['detectAgent']
})

test('AgentProfile is not a named type export', () => {
  // @ts-expect-error AgentProfile must not be a named export — use ReturnType<typeof getAgentProfile> instead
  type _T = import('./agent.ts').AgentProfile
})
