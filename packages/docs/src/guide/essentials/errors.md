# Errors and Exit Codes

A command can fail in a way that it expects, such as when the user asks for a project that does not exist, or in a way that it does not, such as a bug.

This guide shows how Gunshi reports each of them, and which exit code the process ends with.

## Argument Errors

When the arguments do not match the command, such as a missing required argument or an option value of the wrong type, Gunshi does not run the command.

It prints the errors to stderr, without a stack trace, followed by the command that shows the help of the command, and sets the exit code to `1`:

```sh
$ node cli.js
Positional argument 'project' is required

Replace <COMMAND> with how you ran this CLI, to see the arguments of the command:
  <COMMAND> --help
```

The command starts with the name of the CLI, given to `cli()` as `name`, such as `projects --help`, under the heading `See the arguments of the command:`. Without it, as in this example, the command starts with `<COMMAND>`, and the heading says to replace it. For an unknown command, the command shows the help of its parent, such as `projects remote --help` for `projects remote ad`. It is not printed for a command whose `--help` does not show the help: a command that declares a `help` argument of its own, or a CLI that renders no usage.

The command follows the errors that your own `renderValidationErrors` renders, too. To leave it out, such as when your errors point to the help themselves, give `helpHint: false` to `cli()`. It leaves the command out of the output for people only: `next` of the errors of `--json` still points to the help (see [JSON Output](./json-output.md#errors)).

The `cli()` promise resolves. To report the argument errors in your own way, see [Reporting Errors Yourself](#reporting-errors-yourself).

With `--help` or `--version`, Gunshi prints the help or the version instead, and does not report the argument errors, an unknown option of `strict: true` and an unexpected positional argument of `strictPositionals: true` included. An unknown command is still reported, since it is not known which command was meant.

To end with another exit code, such as `2`, the exit code of a usage error in many command-line tools, give it to `cli()` as `validationErrorExitCode`:

```js
await cli(process.argv.slice(2), command, { validationErrorExitCode: 2 })
```

It is the exit code of the argument errors, an unknown command included, whether they are printed as text or as JSON (see [With `--json`](#with-json)), and of `--json` given to a command that does not support it. It does not change the exit code of a `CommandError`, or of an unexpected error.

A command may also find an error in its arguments itself, such as a start date after the end date. To end it with the same exit code, throw a [`CommandError`](#expected-failures) with the exit code that `ctx.env` has:

```js
throw new CommandError('--from must come before --to', {
  code: 'invalid_range',
  exitCode: ctx.env.validationErrorExitCode
})
```

## Expected Failures

When a command fails in a way that it expects, throw a `CommandError` with a message for the user:

```js [cli.js]
import { cli, CommandError, define } from 'gunshi'

const projects = {
  acme: 'The website of Acme'
}

const command = define({
  name: 'show',
  args: {
    project: {
      type: 'positional',
      description: 'Name of the project'
    }
  },
  run: ctx => {
    const { project } = ctx.values

    if (!Object.hasOwn(projects, project)) {
      throw new CommandError(`Project ${project} not found`, { code: 'not_found', exitCode: 2 })
    }

    console.log(projects[project])
  }
})

await cli(process.argv.slice(2), command)
```

Gunshi prints the message to stderr, without a stack trace, and sets the exit code to the `exitCode` of the error:

```sh
$ node cli.js nope
Project nope not found
$ echo $?
2
```

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!TIP]
> The example fully code is [here](https://github.com/kazupon/gunshi/tree/main/playground/essentials/errors).

<!-- eslint-enable markdown/no-missing-label-refs -->

The message may have more than one line, such as a line that tells the user what to do next, and Gunshi prints all of them.

`CommandError` takes these options, and all of them are optional:

| Option     | Description                                                                                                                                                                                                      |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `code`     | The name of the failure, for programs to read, such as `not_found` or `network_error`. Write it in snake_case. Gunshi does not print it to users: with `--json`, it is the `reason` of the JSON error, as it is. |
| `exitCode` | The exit code of the process, an integer from `1` to `255`. Defaults to `1`, and any other value is replaced with `1`.                                                                                           |
| `cause`    | The error that caused the failure. Gunshi prints its message after the message of the `CommandError`, and in `data.causes` with `--json`.                                                                        |

### Causes

When a failure comes from another error, pass that error as the `cause`.

Gunshi prints its message on a `Caused by:` line, and does the same for the cause of the cause:

```js
async function readProjects(file) {
  try {
    return JSON.parse(await readFile(file, 'utf8'))
  } catch (error) {
    throw new CommandError(`Could not read the projects from ${file}`, { cause: error })
  }
}
```

```sh
$ node cli.js acme --file missing.json
Could not read the projects from missing.json
Caused by: ENOENT: no such file or directory, open 'missing.json'
```

The [i18n plugin](../advanced/internationalization.md) translates the `Caused by` heading, with the `CAUSEDBY` key of the built-in resources.

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!WARNING]
> Gunshi prints the message of the cause as it is, for people and in the JSON error of `--json`. Do not pass an error whose message may contain a secret, such as a URL with a token, as the `cause`. Write a message that is safe to print in the `CommandError` instead.

<!-- eslint-enable markdown/no-missing-label-refs -->

### Where to Throw It

Gunshi prints a `CommandError` that is thrown from these places:

- `run`, and the functions that `run` calls, including the functions of a plugin extension
- a command decorator of a plugin (see [Plugin Decorators](../plugin/decorators.md))
- the loader of a [lazy command](./lazy-async.md), which loads the command when it runs

It does not print a `CommandError` thrown from a [hook](../advanced/command-hooks.md), or while a plugin extends the command context.

These run outside the command, and the `cli()` promise rejects with the error, as it does with an [unexpected error](#unexpected-errors). Throw the failures that a command expects from `run`.

Gunshi loads a lazy command before it parses the arguments, and reports an error of the loader where the command runs, as an error of `run`. Until then, the definition given to `lazy` stands for the command, so `--help` prints its usage.

## With `--json`

A command that spreads `jsonArgs` prints its errors as one line of JSON to stderr with `--json`, and stdout is empty. The `code` of a `CommandError` is the `reason` of the JSON error, and its exit code is kept:

```sh
$ node cli.js show nope --json
{"status":"error","reason":"not_found","message":"Project nope not found"}
```

Any other error that the command throws is printed as JSON too, as `command_failed` with exit code `1`, and the `cli()` promise resolves. For the shape of the JSON errors, see [JSON Output](./json-output.md).

## Unexpected Errors

Without `--json`, Gunshi does not print an error other than `CommandError`.

The `cli()` promise rejects with the error, and unless the app catches it, the runtime prints the stack trace and ends with exit code `1`.

A bug stays visible, with the stack trace to find it.

## Exit Codes

| What happens                        | Exit code                                        | The `cli()` promise |
| ----------------------------------- | ------------------------------------------------ | ------------------- |
| The command succeeds                | `0`, unless the command sets `process.exitCode`  | Resolves            |
| The arguments are wrong             | `1`, or the `validationErrorExitCode` of `cli()` | Resolves            |
| The command throws a `CommandError` | The `exitCode` of the error, `1` by default      | Resolves            |
| The command throws any other error  | `1`, when the app does not catch the error       | Rejects             |

Gunshi sets the exit code with `process.exitCode`, and does not call `process.exit()`.

The process ends when nothing is left running, so close the servers, the timers, and anything else that keeps it alive before you throw a `CommandError`.

## After Gunshi Reports an Error

When Gunshi has reported an error, the `cli()` promise resolves, so a `catch` around `cli()` does not run for it.

Clean up or record the failure in the `onErrorCommand` hook instead. Gunshi calls the hook after it prints the error and sets the exit code, so the hook can also change the exit code:

```js
import { cli, isCommandError } from 'gunshi'

await cli(process.argv.slice(2), command, {
  onErrorCommand: (ctx, error) => {
    // print the stack trace of an expected failure too, while debugging
    if (process.env.DEBUG && isCommandError(error)) {
      console.error(error.stack)
    }
  }
})
```

Tell a `CommandError` with `isCommandError()`, rather than with `instanceof`. The packages of Gunshi, such as `gunshi`, `@gunshi/plugin`, and `@gunshi/definition`, bundle their own copies of the class, and `instanceof` does not match an error created by another copy.

For more about the hook, see [Command Hooks](../advanced/command-hooks.md).

## Reporting Errors Yourself

With `usageSilent: true`, Gunshi prints nothing and leaves the exit code alone.

The `cli()` promise rejects with the `CommandError`, or with the `AggregateError` that holds the argument errors, for you to report them. This suits tests, and programs that call `cli()`.

To report only the argument errors yourself, set `renderValidationErrors` to `null` (see [Handling Argument Validation Errors](../advanced/command-hooks.md#handling-argument-validation-errors)). It does not change how Gunshi reports a `CommandError`.
