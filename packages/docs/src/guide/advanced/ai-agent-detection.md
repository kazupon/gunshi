# AI Agent Detection

`gunshi/agent` provides a minimal utility, `getAgentProfile()`, that lets your CLI adjust its UX when running on an AI coding agent (Claude Code, Cursor, Codex, Replit, etc.). It does **not** change Gunshi's behavior automatically. The detection result is a _hint_ that your command, plugin, or renderer can opt into.

The `gunshi/agent` entry point and its profile shape are stable. Detection itself is delegated to [`std-env`](https://github.com/unjs/std-env), so recognized agent names and detection rules may evolve independently as the upstream detector is updated.

## Why a separate utility?

An AI coding agent usually cannot answer a prompt, and gains nothing from a spinner, while people expect both. `getAgentProfile()` lets your CLI choose not to ask and not to animate by default when an agent runs it, without spreading environment variable checks across your code. It does not choose the format of the output: print JSON only when the caller asks for it with `--json`.

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

## What the detection result means

The returned profile is not an operating-system signal or proof of who invoked the command. It is a normalized runtime hint derived from the environment by `std-env`. In this guide, "running on an AI coding agent" means that the current process appears to have been launched by, or inherited its environment from, a recognized agent.

Detection can produce false positives or false negatives. Environment variables can be set manually, inherited by unrelated child processes, or omitted by an unknown agent. Do not use the profile for authentication, authorization, sandbox decisions, or any other security boundary.

The profile also does not describe the agent's capabilities. In particular, `isAgent: true` does not guarantee that the caller requires JSON, cannot process colors, or cannot answer a prompt. Treat it as a default-selection hint that explicit CLI options and application configuration can override.

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

## Turn detection into behavior

Detection chooses one default: whether your CLI may ask. When an agent runs it, and the caller does not say otherwise:

- Ask nothing. Take every value from the arguments and the options, and when one is missing, fail with an error that names it, instead of opening a prompt that the agent cannot see.
- Drop prompts, spinners, and redraws. Keep the results, the completion, the warnings, and how to recover.
- Keep the output for people. Print JSON only with `--json` (see [JSON Output](../essentials/json-output.md)), whoever runs the command.
- Leave colors to the terminal. Drop them when the stream is not a TTY or `NO_COLOR` is set, not because an agent is detected.

Gunshi does not apply these policies automatically. Commands and plugins decide which adaptations are appropriate for their CLI. Prefer explicit options such as `--non-interactive` when your CLI exposes them, and use agent detection only to choose whether the CLI may ask. The caller chooses the format with `--json`.

## Using it in a command

This command requires `--target`, so an agent cannot be left waiting for an implicit prompt. The format of the output is explicit: the command spreads `jsonArgs`, so a caller that wants JSON passes `--json` (see [JSON Output](../essentials/json-output.md)). Agent detection only chooses a default: the command does not ask for a confirmation when an agent runs it.

```ts
import { CommandError, define, jsonArgs } from 'gunshi'
import { getAgentProfile } from 'gunshi/agent'
import { confirm } from './prompt.ts'

export default define({
  name: 'deploy',
  args: {
    ...jsonArgs,
    target: { type: 'string', required: true },
    yes: { type: 'boolean', short: 'y', description: 'Skip the confirmation' }
  },
  run: async ctx => {
    // an agent cannot answer a prompt, and a prompt would break the JSON of --json
    const interactive = !getAgentProfile().isAgent && !ctx.values.json && !ctx.values.yes
    if (interactive && !(await confirm(`Deploy to ${ctx.values.target}?`))) {
      throw new CommandError('Deployment cancelled', { code: 'cancelled' })
    }

    ctx.log(`Deployed to ${ctx.values.target}`)
    return { deployment: { target: ctx.values.target }, outcome: 'deployed' }
  }
})
```

With `--json`, the result is printed as one JSON document, and a failure as one line of JSON on stderr, whoever runs the command. Keep the shape of the result stable once consumers depend on it. Report the failures that the command expects with `CommandError`, so that agents, scripts, and people receive the same unambiguous exit code.

## Using it in a plugin

`gunshi/agent` itself is not a plugin, but you can build one on top of it. This plugin decides in one place whether the command may ask, so that the commands do not read the terminals and the environment variables themselves. It adds a `--non-interactive` option. Without the option, the command does not ask with `--json`, when the `CI` environment variable is set, when an agent runs the CLI, or when stdin or stderr is not a terminal. `--non-interactive=false` asks again in a terminal, for a person whose environment looks like an agent's:

```ts
import process from 'node:process'
import { plugin } from 'gunshi/plugin'
import { getAgentProfile } from 'gunshi/agent'

export interface ModeExtension {
  // whether the command may ask, or show a spinner or redraw on stderr
  interactive: boolean
}

export default function mode() {
  return plugin({
    id: 'app:mode',
    setup: ctx => {
      ctx.addGlobalOption('non-interactive', {
        type: 'boolean',
        description: 'Do not ask, and do not show spinners'
      })
    },
    extension: (ctx): ModeExtension => {
      // true with --non-interactive, false with --non-interactive=false, and undefined without it
      const option = ctx.values['non-interactive']
      const terminal = process.stdin.isTTY === true && process.stderr.isTTY === true
      const detected = Boolean(process.env.CI) || getAgentProfile().isAgent
      return {
        interactive:
          terminal &&
          ctx.values.json !== true &&
          (option === undefined ? !detected : option === false)
      }
    }
  })
}
```

Register it with `cli(process.argv.slice(2), command, { plugins: [mode()] })`, and check `ctx.extensions['app:mode'].interactive` in a command before it asks. Show the prompts, the spinners, and the redraws on stderr, which the plugin checks: stdout is for the results, and may be redirected to a file. The plugin does not change the format of the output: the command prints JSON only with `--json`, and the output for people otherwise.

## Branching strategy

Prefer the broad `isAgent` flag over agent-specific names:

```ts
// ✅ Recommended
if (profile.isAgent) {
  skipPrompts()
}

// ⚠️ Avoid unless you have a known agent-specific constraint
if (profile.name === 'codex' || profile.name === 'claude') {
  skipPrompts()
}
```

Agent-specific branches are appropriate only when you need to work around a known constraint of a specific agent (for example, an output limit or a missing TTY feature). Otherwise, `isAgent` keeps your code agnostic of the upstream detector list.

## Why Gunshi does not change output automatically

`getAgentProfile()` is a hint. Gunshi's core does not switch usage / validation error / prompt rendering on its own, even when an agent is detected. There are several reasons:

1. **Spoofable**: Agent detection relies on environment variables and is not a security signal.
2. **The caller chooses the format**: An agent that wants JSON passes `--json`, and the output for people stays readable when an agent runs the CLI. Switching the format on detection would surprise an agent that reads the output for people.
3. **Backward compatibility**: Existing CLIs should not silently change their output when run under an agent.
4. **Explicit opt-in**: Renderers, commands, and plugins can opt into agent-aware behavior where it actually matters.

Gunshi already prints the result and the errors as JSON with `--json`, for the commands that spread `jsonArgs` (see [JSON Output](../essentials/json-output.md)). For the other modes, such as a `--non-interactive` option, build a plugin on top of `getAgentProfile()`, as above. A first-party plugin that decides the modes, such as whether to ask and whether to use colors, in one place may be added in the future once its shape is clearer.

## Need the raw `std-env` API?

`gunshi/agent` only exposes `getAgentProfile()`. If you need `agentInfo`, `detectAgent()`, `agent`, or `isAgent` directly, install `std-env` and import from it explicitly:

```sh
npm install std-env
```

```ts
import { agent, agentInfo, detectAgent, isAgent } from 'std-env'
```

This keeps `gunshi/agent`'s API surface small and stable, while letting power users reach for the underlying detector.
