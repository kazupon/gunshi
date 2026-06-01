# getAgentProfile

Get the AI coding agent profile of the current process.

The detection itself is delegated to `std-env`. This function only converts
the upstream `agentInfo` into Gunshi's minimal AgentProfile shape.

## Signature

```ts
export function getAgentProfile(): AgentProfile
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/agent.ts#L68-L75)

## Returns

`AgentProfile` — An AgentProfile describing whether the process is running on an AI coding agent and, if so, which agent was detected.

## Examples

```js
import { getAgentProfile } from 'gunshi/agent'

const profile = getAgentProfile()

if (profile.isAgent) {
  // adjust output for AI agent execution
}
```
