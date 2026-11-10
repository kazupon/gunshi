# JSON Output

Scripts and coding agents run a CLI and read what it prints. With `--json`, a command of Gunshi prints its result as one JSON document to stdout, and a failure as one line of JSON to stderr, so a program can read them without parsing text for people.

`--json` is designed for AI agents first. An agent that runs your CLI reads the result as data, not as text for people. When the command fails, the error tells the agent whether it can fix the input (`status`), why the command failed (`reason`), which argument is wrong (`field`), and which command to run next (`next`), so the agent can correct the command by itself. See [Errors](#errors).

## Supporting `--json`

A command supports `--json` when it spreads `jsonArgs` into its arguments. It returns its result from `run`, as an object keyed by a noun, and prints the output for people with `ctx.log`:

```js [cli.js]
import { cli, define, jsonArgs } from 'gunshi'

const projects = [
  { name: 'acme-web', url: 'https://acme-web.example.com' },
  { name: 'acme-api', url: 'https://acme-api.example.com' }
]

const list = define({
  name: 'list',
  description: 'List the projects',
  args: {
    ...jsonArgs,
    limit: { type: 'number', default: 10, description: 'How many projects to list' }
  },
  run: ctx => {
    const result = projects.slice(0, ctx.values.limit)

    // The output for people, printed only without `--json`
    for (const project of result) {
      ctx.log(`${project.name}\t${project.url}`)
    }

    // The result, printed as one JSON document with `--json`
    return { projects: result }
  }
})

await cli(process.argv.slice(2), list, { name: 'projects' })
```

Without `--json`, the command prints its lines for people:

```sh
$ node cli.js
acme-web	https://acme-web.example.com
acme-api	https://acme-api.example.com
```

With `--json`, Gunshi silences `ctx.log`, and prints the result instead:

```sh
$ node cli.js --json | cat
{"projects":[{"name":"acme-web","url":"https://acme-web.example.com"},{"name":"acme-api","url":"https://acme-api.example.com"}]}
```

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!TIP]
> The example fully code is [here](https://github.com/kazupon/gunshi/tree/main/playground/essentials/json-output).

<!-- eslint-enable markdown/no-missing-label-refs -->

`--json` shows up in the help of the command, as `--json  Output the result as JSON`. To give it a short name, spread its schema: `json: { ...jsonArgs.json, short: 'j' }`.

To know whether the command is asked for JSON, read `ctx.values.json`, for example to skip a prompt or a spinner.

## The Result

Gunshi prints the result as one JSON document to stdout: indented with two spaces on a terminal, and on one line when stdout is a pipe or a file.

- `ctx.log` prints nothing with `--json`, in the command, in the hooks, and in the plugins, so stdout has the JSON only. `console.log` is not silenced: do not use it for the lines for people.
- Gunshi waits until stdout has written the document before `cli()` returns, so a large document is not cut when the app calls `process.exit()` after `cli()`.
- Gunshi does not touch the exit code on success. To tell something with it, such as that a check found problems, set `process.exitCode` and return the result.
- The `cli()` promise resolves with `undefined`, and `onAfterCommand` receives `undefined`: the result is printed, not returned.

### What to Return

Return an object, and key the data by a noun, so that fields can be added later without breaking the programs that read it:

```js
// a project
return { project }

// a list
return { projects }

// a command that changes something, and has nothing else to return
return { outcome: 'deleted', project: { name } }
```

Do not return the data as it is, such as `return project` or `return projects`.

Gunshi converts the result with `JSON.stringify`, so convert what JSON cannot hold yourself before you return it: a `Map` or a `Set` becomes `{}`, and a `BigInt` fails.

The command must return an object. A command written in JavaScript that returns nothing, a string, an array, or a value that `JSON.stringify` does not turn into an object, such as a `Date`, fails with `invalid_result`. A result that `JSON.stringify` cannot convert, such as a `BigInt`, fails with `unserializable_result`. The command has finished then, and the message says so.

### Type Errors

The types check what `run` returns: a command that spreads `jsonArgs` returns an object, and any other command returns a string or nothing. The types check that the result is an object, but not that it is keyed by a noun.

The last line of a type error tells what went wrong:

| What you wrote                                                                                | The last line of the type error                                                                                                                                       | How to fix it                                                                   |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `run` returns nothing                                                                         | `Type 'void' is not assignable to type 'JsonResult'`, or `'Awaitable<JsonResult>'` when `run` is not `async`                                                          | Return the result                                                               |
| `run` returns a value of an interface as it is (`return project`)                             | `Index signature for type 'string' is missing in type 'Project'`                                                                                                      | Key it by a noun: `return { project }`                                          |
| `run` returns an array                                                                        | `Index signature for type 'string' is missing in type 'Project[]'`                                                                                                    | Key it by a noun: `return { projects }`, or print it with a `json` of your own  |
| A lazy command spreads `jsonArgs` into the command that it loads, but not into its definition | `No overload matches this call`, and `'{ project: Project; }' is not assignable to type 'string \| void'`, or `'Awaitable<string \| void>'` when `run` is not `async` | Spread `jsonArgs` into the definition too (see [Lazy Commands](#lazy-commands)) |

## Errors

With `--json`, stdout is empty when the command fails, and stderr has one line of JSON:

```sh
$ node cli.js show nope --json
{"status":"error","reason":"not_found","message":"Project nope not found"}
$ echo $?
1
```

| Field     | Description                                                                                                                                                                        |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `status`  | `action_required` when the command stopped before it ran, and the input can be fixed. `error` when the command failed while it ran, or after: do not run it again without checking |
| `reason`  | The reason of the failure, for programs to read, in snake_case                                                                                                                     |
| `message` | The message for people, as Gunshi prints it without `--json`, translated by the [i18n plugin](../advanced/internationalization.md). Read `reason`, not `message`                   |
| `next`    | The commands to run next: the help of the nearest command. Only for `action_required`, when `--help` shows the help of that command                                                |
| `data`    | `issues`: the argument errors, each with `field`, `reason` and `message`. `causes`: the messages of the causes of the error, from the outermost                                    |

An argument error looks like this:

```json
{
  "status": "action_required",
  "reason": "required_option",
  "message": "Option '--name' is required",
  "next": [
    {
      "command": "demo deploy --help",
      "argv": ["demo", "deploy", "--help"],
      "when": "See the arguments of the command"
    }
  ],
  "data": {
    "issues": [
      { "field": "--name", "reason": "required_option", "message": "Option '--name' is required" }
    ]
  }
}
```

The `field` of an issue is written as on the command line: the long form of an option (`--dry-run` with `toKebab`), the name of a positional argument, and an unknown option or an unknown command as it was typed.

`next` starts with the name of the CLI, given to `cli()` as `name`. Without it, the command line starts with `<COMMAND>`, and `when` says to replace it with how the CLI was run. Give your CLI a `name`, so that `next` is a command line to run as it is.

There is no `next` when `--help` does not show the help of that command: when the command declares a `help` argument of its own, which then takes `--help`, or when the CLI renders no usage, with `renderUsage: null`. `helpHint: false`, which leaves the command that shows the help out of the output for people, does not leave out `next`.

### Reasons

| Reason                                                                                                                                                                                      | Status            | When                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------ |
| `required_option`, `required_positional`, `missing_value`, `invalid_type`, `invalid_choice`, `invalid_default`, `custom_parse`, `unexpected_value`, `conflicting_options`, `unknown_option` | `action_required` | An argument is wrong                                                     |
| `invalid_arguments`                                                                                                                                                                         | `action_required` | Two or more arguments are wrong: each is in `data.issues`                |
| `unknown_command`, `ambiguous_command`, `inconsistent_options`, `lazy_schema_mismatch`                                                                                                      | `action_required` | The command cannot be resolved                                           |
| `json_not_supported`                                                                                                                                                                        | `action_required` | `--json` is given to a command that does not spread `jsonArgs`           |
| The `code` of a `CommandError`                                                                                                                                                              | `error`           | The command throws a `CommandError` with a `code`                        |
| `command_failed`                                                                                                                                                                            | `error`           | The command throws any other error, or a `CommandError` without a `code` |
| `invalid_result`, `unserializable_result`                                                                                                                                                   | `error`           | The result cannot be printed as JSON                                     |

The exit code is `1`, except for a `CommandError`, which keeps its own `exitCode`.

### Failures of the Command

To report a failure that the command expects, throw a `CommandError`, as without `--json`. Its `code` is the `reason`, as it is, so write it in snake_case, such as `not_found` or `network_error`. The messages of its causes are in `data.causes`:

```js
throw new CommandError(`Project ${name} not found`, { code: 'not_found', cause: error })
```

Any other error that the command throws is `command_failed`, even when it has a `code` of its own, such as `ENOENT`. With `--json`, Gunshi prints it as JSON too, and the `cli()` promise resolves. For more about the errors, see [Errors and Exit Codes](./errors.md).

## Help and Version

With `--json`, `--help` and `--version` print JSON too, so that stdout has the JSON only. They are answered for any command, whether it spreads `jsonArgs` or not, since Gunshi answers them, not the command.

`--help --json` prints the help as one JSON document, made from the same arguments and translations as the help for people:

```sh
$ node cli.js --help --json | jq '.help | {command, description, json}'
{
  "command": "projects",
  "description": "List the projects",
  "json": true
}
$ node cli.js --help --json | jq '.help.options[] | select(.name == "--limit")'
{
  "name": "--limit",
  "short": null,
  "description": "How many projects to list",
  "type": "number",
  "value": "<limit>",
  "required": false,
  "multiple": false,
  "default": 10,
  "choices": null,
  "negatable": false,
  "global": false
}
```

| Key           | Value                                                                                                                                                             |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `command`     | The command line of the command, to read, as in `next` of the errors. Without the `name` of `cli()`, it starts with `<COMMAND>`                                   |
| `argv`        | The arguments of the command line, to run                                                                                                                         |
| `description` | The description of the command                                                                                                                                    |
| `commands`    | The sub-commands of a command that groups them, as the help lists them: `name` and `description`                                                                  |
| `arguments`   | The positional arguments, in order: `name`, `description`, `required` and `multiple`                                                                              |
| `options`     | The options, the global options included: `name`, `short`, `description`, `type`, `value`, `required`, `multiple`, `default`, `choices`, `negatable` and `global` |
| `json`        | Whether the command prints its result as JSON with `--json`: it spreads `jsonArgs`                                                                                |

A value that is not there is `null`, and an empty list is `[]`, so that every key is there. On a terminal, the document is indented.

`--version --json` prints `{"version":"1.2.3"}`, with the `version` given to `cli()`, or `{"version":null}` without it.

A command with a `json` argument of its own takes `--json` itself, and gets the help and the version as text. With `usageSilent`, or `renderUsage: null`, nothing is printed, as for the help as text.

## `jsonArgs` or a `json` of Your Own

Spread `jsonArgs` when the command can follow the contract of Gunshi: an object keyed by a noun for the result, and one line of JSON for a failure.

When the output is already fixed, such as an array that the readers expect, an existing format, or NDJSON for a stream, declare a `json` argument of your own, and print what you need. Gunshi does not touch a `json` argument without the mark of `jsonArgs`, and the command handles its failures as well.

## Commands Without `--json`

When `--json` is given to a command that does not spread `jsonArgs`, Gunshi stops it before it runs, with `json_not_supported`, so that a program does not take its text for JSON. `--help` and `--version` are still answered, as JSON: see [Help and Version](#help-and-version).

With `strict`, `--json` is not reported as an unknown option, since Gunshi knows what it means: a command without `jsonArgs` gets `json_not_supported`, and a command with it runs. `--json=false` asks for no JSON, and stays an unknown option with `strict`.

## Lazy Commands

A [lazy command](./lazy-async.md) spreads `jsonArgs` into its definition too, not only into the command that it loads:

```js
// show.js: the command that the loader returns
export default define({
  name: 'show',
  args: { ...jsonArgs, name: { type: 'positional' } },
  run: async ctx => ({ project: await fetchProject(ctx.values.name) })
})

// cli.js: the definition spreads jsonArgs too
const show = lazy(() => import('./show.js').then(m => m.default), {
  name: 'show',
  description: 'Show a project',
  args: { ...jsonArgs, name: { type: 'positional' } }
})
```

Gunshi resolves which command runs from the definitions, before it loads the command. Without `jsonArgs` in the definition, `--json` before the name of the command (`projects --json show`) takes the name for its value. In TypeScript, such a definition is a type error: `No overload matches this call`.

## Collecting Commands

To collect commands into an object, a `Map` or an array, type it with `SubCommandable`, the type that the `subCommands` of `cli()` takes. `Command` without type arguments does not take a command that spreads `jsonArgs`:

```ts
import type { SubCommandable } from 'gunshi'

const commands: Record<string, SubCommandable> = { list, show }
```

To type one command, use `define`, or `Command<{ args: typeof args }>`.

## Hooks and Plugins

With `--json`, the hooks, the command decorators and the extensions of plugins must not print to stdout or stderr. Print with `ctx.log`, which is silenced then. A command decorator returns what the command returns, as it is, or the result does not reach Gunshi, and the command fails with `invalid_result`.

To tell an error of the JSON output, such as the `json_not_supported` in `onErrorCommand`, use `isJsonOutputError()`.

## Reporting Errors Yourself

With `renderValidationErrors: null` or `usageSilent: true`, Gunshi prints no JSON for the argument errors and for `json_not_supported`, and the `cli()` promise rejects with the `AggregateError` that holds them, as without `--json`. A renderer of the validation errors is not called with `--json`: to report them yourself, set it to `null`.

The errors of the command and of the result are printed as JSON with these options too, since they are not texts for people.
