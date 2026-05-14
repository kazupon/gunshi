import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

beforeEach(() => {
  vi.resetModules()
})

afterEach(() => {
  vi.doUnmock('std-env')
})

describe('getAgentProfile', () => {
  test('returns isAgent=false when no agent is detected', async () => {
    vi.doMock('std-env', () => ({
      agentInfo: {}
    }))

    const { getAgentProfile } = await import('./agent.ts')

    expect(getAgentProfile()).toEqual({
      isAgent: false,
      name: undefined
    })
  })

  test('returns isAgent=true with the detected name for a known agent', async () => {
    vi.doMock('std-env', () => ({
      agentInfo: { name: 'codex' }
    }))

    const { getAgentProfile } = await import('./agent.ts')

    expect(getAgentProfile()).toEqual({
      isAgent: true,
      name: 'codex'
    })
  })

  test('passes through a custom agent name as reported by std-env', async () => {
    vi.doMock('std-env', () => ({
      agentInfo: { name: 'my-agent' }
    }))

    const { getAgentProfile } = await import('./agent.ts')

    expect(getAgentProfile()).toEqual({
      isAgent: true,
      name: 'my-agent'
    })
  })

  test('does not leak extra fields from std-env into the profile', async () => {
    vi.doMock('std-env', () => ({
      agentInfo: {
        name: 'codex',
        env: 'CODEX_SANDBOX'
      }
    }))

    const { getAgentProfile } = await import('./agent.ts')

    expect(Object.keys(getAgentProfile())).toEqual(['isAgent', 'name'])
  })
})

describe('public API surface', () => {
  test('only exposes getAgentProfile', async () => {
    const mod = await import('./agent.ts')

    expect(Object.keys(mod)).toEqual(['getAgentProfile'])
  })
})
