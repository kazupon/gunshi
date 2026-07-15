# AI Agent Detection

`gunshi/agent` provides a minimal utility, `getAgentProfile()`, that lets your CLI adjust its UX when running on an AI coding agent (Claude Code, Cursor, Codex, Replit, etc.). It does **not** change Gunshi's behavior automatically. The detection result is a _hint_ that your command, plugin, or renderer can opt into.

The `gunshi/agent` entry point and its profile shape are stable. Detection itself is delegated to [`std-env`](https://github.com/unjs/std-env), so recognized agent names and detection rules may evolve independently as the upstream detector is updated.

## Why a separate utility?

AI coding agents typically benefit from terser, machine-friendly CLI output, while human users expect rich, interactive output. `getAgentProfile()` gives you a single switch you can branch on, without spreading environment variable checks across your code.

`gunshi/agent` is intentionally small:

- it does **not** re-export `std-env`'s API
- it does **not** alter Gunshi core behavior
- it is **not** a security boundary — environment variables can be spoofed

## Installation

`gunshi/agent` ships with the `gunshi` package — no extra install is required.

```sh
npm install gunshi
```

## API

### `getAgentProfile()`

The only public export.

```ts
import { getAgentProfile } from 'gunshi/agent'

const profile = getAgentProfile()

if (profile.isAgent) {
  // adjust output for AI agent execution
}
```

The returned profile has just two fields:

```ts
interface AgentProfile {
  isAgent: boolean
  name?: string // detected agent name (when known)
}
```

To get the type without exposing the internal `AgentProfile` interface, use `ReturnType`:

```ts
import { getAgentProfile } from 'gunshi/agent'

type AgentProfile = ReturnType<typeof getAgentProfile>
```

## Supported agents

Detection is delegated to [`std-env`](https://github.com/unjs/std-env), which recognizes agents such as Claude Code, Cursor, Codex, and others. Refer to the upstream documentation for the authoritative detector list and detection rules. New agent names may be added without changing the stable `gunshi/agent` API.

If a specific agent must behave differently, read the value at runtime via `getAgentProfile().name` rather than hard-coding environment variable checks.

### `AI_AGENT` override

As part of its upstream API, `std-env` honors an `AI_AGENT` environment variable as an explicit override:

```sh
AI_AGENT=codex my-cli ...
```

This is useful for testing agent-aware behavior locally, or for declaring a custom agent name. Gunshi does not define or parse this variable itself; it passes the name reported by `std-env` through verbatim without normalizing it.

```ts
// AI_AGENT=my-agent
getAgentProfile()
// → { isAgent: true, name: 'my-agent' }
```

## Using it in a command

```ts
import { define } from 'gunshi'
import { getAgentProfile } from 'gunshi/agent'

export default define({
  name: 'deploy',
  args: {
    target: { type: 'string', required: true }
  },
  run: ctx => {
    const profile = getAgentProfile()

    if (profile.isAgent) {
      // emit machine-friendly output
      ctx.log(JSON.stringify({ ok: true, target: ctx.values.target }))
      return
    }

    ctx.log(`Deployed to ${ctx.values.target} ✨`)
  }
})
```

## Using it in a plugin

`gunshi/agent` itself is not a plugin, but you can build one on top of it.

```ts
import { plugin } from 'gunshi/plugin'
import { getAgentProfile } from 'gunshi/agent'

export default function agentAwareRenderer() {
  return plugin({
    id: 'g:agent-aware-renderer',
    setup: ctx => {
      const profile = getAgentProfile()

      if (!profile.isAgent) {
        return
      }

      ctx.decorateUsageRenderer(async base => {
        const rendered = await base()
        // for example, drop ANSI colors and decorations for agent output
        return rendered.replaceAll(/\u001B\[[0-9;]*m/g, '')
      })
    }
  })
}
```

## Branching strategy

Prefer the broad `isAgent` flag over agent-specific names:

```ts
// ✅ Recommended
if (profile.isAgent) {
  emitJson()
}

// ⚠️ Avoid unless you have a known agent-specific constraint
if (profile.name === 'codex' || profile.name === 'claude') {
  emitJson()
}
```

Agent-specific branches are appropriate only when you need to work around a known constraint of a specific agent (for example, an output limit or a missing TTY feature). Otherwise, `isAgent` keeps your code agnostic of the upstream detector list.

## Why Gunshi does not change output automatically

`getAgentProfile()` is a hint. Gunshi's core does not switch usage / validation error / prompt rendering on its own, even when an agent is detected. There are several reasons:

1. **Spoofable**: Agent detection relies on environment variables and is not a security signal.
2. **App-specific**: The "right" agent-friendly output differs per CLI (JSON, NDJSON, plain text, etc.).
3. **Backward compatibility**: Existing CLIs should not silently change their output when run under an agent.
4. **Explicit opt-in**: Renderers, commands, and plugins can opt into agent-aware behavior where it actually matters.

If you need a richer integration (custom renderer decoration, a `--json` flag, etc.), build it on top of `getAgentProfile()` in a plugin. A first-party `@gunshi/plugin-agent` may be added in the future once the desired shape is clearer.

## Need the raw `std-env` API?

`gunshi/agent` only exposes `getAgentProfile()`. If you need `agentInfo`, `detectAgent()`, `agent`, or `isAgent` directly, install `std-env` and import from it explicitly:

```sh
npm install std-env
```

```ts
import { agent, agentInfo, detectAgent, isAgent } from 'std-env'
```

This keeps `gunshi/agent`'s API surface small and stable, while letting power users reach for the underlying detector.
