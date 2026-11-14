# Gunshi for Coding Agents

This file is for coding agents that write a command-line interface with Gunshi. It matches the installed version of `gunshi`, and has what you need to write a CLI: a complete example, the rules that the example does not show, and which guide to read for a task. It is not about developing Gunshi itself.

## A CLI With Sub-commands

```ts
import { cli, CommandError, define, jsonArgs } from 'gunshi'

// Options for every command: declare them once `as const`, and spread them into the `args` of each command
const common = {
  config: { type: 'string', default: 'ship.json', description: 'The config file' }
} as const

// A rule for a value: `parse` reads the value given, and throws an `Error` for a wrong one
const integerIn = (min: number, max: number) => (value: string) => {
  const n = Number(value)
  if (!/^-?\d+$/.test(value) || n < min || n > max) {
    throw new Error(`expected an integer from ${min} to ${max}`)
  }
  return n
}

const deploy = define({
  name: 'deploy',
  description: 'Deploy a service',
  args: {
    // `--json`: gunshi prints what `run` returns as JSON
    ...jsonArgs,
    ...common,
    service: { type: 'positional', description: 'The service to deploy' },
    target: {
      type: 'enum',
      short: 't',
      choices: ['dev', 'prod'] as const,
      default: 'dev',
      description: 'Where to deploy'
    },
    dryRun: { type: 'boolean', toKebab: true, description: 'Show what would be done' }
  },
  run: ctx => {
    // service: string, target: 'dev' | 'prod', dryRun: boolean | undefined, config: string
    const { service, target, dryRun, config } = ctx.values
    // for people: `ctx.log` prints nothing with `--json`
    ctx.log(`Deployed ${service} to ${target}`)
    // the result, keyed by a noun: printed as JSON with `--json`
    return { deployment: { service, target, dryRun: dryRun ?? false, config } }
  }
})

const rollback = define({
  name: 'rollback',
  description: 'Roll back to a release',
  args: {
    ...common,
    release: { type: 'positional', description: 'The release number', parse: integerIn(1, 999) }
  },
  run: ctx => {
    // release: number, what `parse` returns
    if (ctx.values.release > 10) {
      // a failure the command expects: the message goes to stderr, without a stack trace, and the exit code is 1
      throw new CommandError(`Release ${ctx.values.release} not found`, { code: 'not_found' })
    }
    console.log(`Rolled back to release ${ctx.values.release}`)
  }
})

// no `run`: `ship` alone prints the usage, as `ship --help` does
const main = define({
  name: 'ship',
  description: 'Ship the services'
})

await cli(process.argv.slice(2), main, {
  name: 'ship',
  version: '1.0.0',
  subCommands: { deploy, rollback }
})
```

## Things to Know

- Import `cli`, `define`, `jsonArgs` and `CommandError` from `gunshi`. Write the CLI with `cli()` and `define()`: `parseArgs` and `resolveArgs` of `gunshi` are the low-level parts that `cli()` uses. `gunshi/bone` is Gunshi without its built-in plugins, so it has no `--help`, no `--version` and no `--json`
- The types of an argument are `string`, `number`, `boolean`, `enum` (with `choices`), `positional`, and `custom` (with `parse`). An argument can also have `short`, `default`, `required`, `multiple` and `description`
- An argument is an option unless its type is `positional`, and an option is named after its key: `dryRun` is `--dryRun`, or `--dry-run` with `toKebab: true`. `name: { type: 'string', required: true }` is a required `--name`, not a positional argument
- `short` gives an option a one-letter name, as `-t` above. Give one only to the options that need it, and a letter to only one option of a command
- A `positional` argument is required unless it has `required: false`. Positional arguments are taken in the order they are declared
- Write the `choices` of an `enum` `as const`, so that its value is typed as their union. Without it, the value is a `string`
- Declare each argument as an object with a `type`, as above. It is the way of Gunshi, and its guides use it
- Check the values of the arguments in `args`, not in `run`: a choice with an `enum`, and any other rule, such as a number in a range, with a `parse` function that throws an `Error` for a wrong value, as `release` above. Gunshi then reports a wrong value as an error of the arguments, as below, and the value has the type that `parse` returns. `parse` gets the value as a string, whatever the `type`: give an option with `parse` the type `custom`, and keep `positional` for a positional argument. An option `-w` from 0 to 600 that defaults to 60: `wait: { type: 'custom', short: 'w', default: 60, description: 'Seconds to wait for the service', parse: integerIn(0, 600) }`
- The parser combinators of `gunshi/combinators` (`integer({ min, max })`, `string({ pattern })`, `withDefault()`, `required()`, and others) write the same schemas with functions. Use them only when the project already declares its arguments with them, or when many arguments share the rules that they check, so that each does not need a `parse` of its own. A combinator is the whole schema: it does not go in `type`, and it takes no object with a `type` (`positional()` alone is a string). An option made with a combinator is optional unless its combinator takes `required: true`, as `integer({ min: 1, required: true })`, or it is wrapped in `required()` or `withDefault()`
- Sub-commands go in the `subCommands` option of `cli()`: an object keyed by the command names, a `Map`, or an array of commands. A command can also have its own `subCommands`. The command given to `cli()` runs when no command is given
- A command that only groups sub-commands needs no `run`, as `ship` above: run without a sub-command, it prints its usage, as `--help` does, and the exit code is 0. Give it a `run` only when it has something else to do then. Any other command needs `run`: without it, the command throws `'run' is required in command` when it runs
- The `args` of a command are its own, so the sub-commands do not see the `args` of the main command. For an option of every command, spread shared arguments as above
- Give `name` and `version` to `cli()`. The usage shows the name (`COMMAND` without it), `--version` prints the version, and the errors of `--json` tell the command to run next with the name
- Gunshi ignores an option that a command does not declare, except `--json`. Keep this default unless the requirements say that an unknown option is an error: then give `strict: true` to `cli()`
- Gunshi prints the errors of the arguments to stderr: an argument that is missing or not valid, an unknown command, an unknown option only with `strict: true`, and an extra positional argument only with `strictPositionals: true`. It sets the exit code to 1, and calls the `onErrorCommand` option of `cli()` with them. To use another exit code, such as 2, which many CLIs use when they are called the wrong way, give `validationErrorExitCode: 2` to `cli()`. If the requirements make an unknown option one of these errors too, give `strict: true` as well, since `validationErrorExitCode` does not: without `strict`, the command runs and ignores the option. `validationErrorExitCode` is also the exit code of `--json` given to a command that does not support it, and it leaves the one of a `CommandError` alone
- Gunshi follows the errors of the arguments with the command that shows the help of the command, or of the parent of an unknown command, so do not print a line of your own that points to `--help`. If the requirements ask for one, give `helpHint: false` to `cli()`, which leaves the command of Gunshi out
- Gunshi keeps a positional argument that a command does not declare, in `ctx.positionals` after the names of the command path. Keep this default unless the requirements say that an extra argument is an error: then give `strictPositionals: true` to `cli()`. It is not part of `strict`, which is about the options. A positional argument with `multiple: true` takes any number of them
- For a failure that the command expects, such as a release that does not exist, throw a `CommandError`, as `rollback` above. Gunshi prints its message to stderr, without a stack trace, and sets the exit code to 1, or to the `exitCode` you give it: `new CommandError(message, { code: 'not_found', exitCode: 3 })`. Write the `code` in snake_case. It is not an error of the arguments: check a wrong value in `args` instead. Any other error thrown from `run` ends in a stack trace
- When the requirements say what to print as JSON, such as "the command prints the new release as JSON" or "`--json` prints the releases as a JSON array, and nothing else", print exactly that yourself, as `console.log(JSON.stringify(releases))`. For such a `--json`, declare a `json` option of your own, as `json: { type: 'boolean' }`, not `jsonArgs`. Gunshi does not touch it
- Otherwise, for `--json`, spread `jsonArgs` into the `args` of the command, as `deploy` above, and return an object keyed by a noun: `return { project }`, not `return project`, and `return { projects }`, not an array. Return it in every branch, with or without `--json`: Gunshi prints what `run` returns only with `--json`, as it is, so it never prints an array alone. A command without `jsonArgs` returns nothing. Print the lines for people with `ctx.log`, which prints nothing with `--json`, not with `console.log`. Gunshi prints a failure, a `CommandError` included, to stderr as JSON on a single line. A lazy command spreads `jsonArgs` into its definition too
- These type errors mean: `Type 'void' is not assignable to type 'JsonResult'` (or `'Awaitable<JsonResult>'`), or the same with `'undefined'` or `'{ … } | undefined'`: a branch returns nothing, so return the result in every branch, and print the lines for people with `ctx.log`. `Index signature for type 'string' is missing in type 'Project'` (or `'Project[]'`): key it by a noun, `{ project }`, or print an array with a `json` of your own. `No overload matches this call` on `lazy`: spread `jsonArgs` into the definition of `lazy` too. If it also says `is not assignable to type 'never'`, the definition has a key that `lazy` does not take: `run`, which the loader returns, or a typo. An object that `is not assignable to type 'Awaitable<string | void>'` (or `'string | void'`, which TypeScript 7 writes as `'Awaitable<void | string>'` and `'void | string'`): the command does not spread `jsonArgs`, so print the JSON yourself, or spread `jsonArgs` for `--json`
- Gunshi does not read environment variables. To fall back to one, give the option no `default`, and write the order yourself: `ctx.values.region ?? process.env.SHIP_REGION ?? 'us-east-1'`
- `cli()` prints the usage for `--help` and the version for `--version` itself, and also returns that text. Do not print what it returns
- stdout has only what the commands print (the header goes with the usage only). With `--json`, it has the JSON document only

## Which Guide to Read

The guides are Markdown files of `@gunshi/docs`, which has the docs of the same version as `gunshi`: install it as a dev dependency at the version of `gunshi` to read them. The docs of the latest version are at [gunshi.dev](https://gunshi.dev). Read the guide for the task at hand, not all of them:

- Arguments, their types, defaults and validation: `node_modules/@gunshi/docs/src/guide/essentials/declarative.md`
- The types of `ctx.values`: `node_modules/@gunshi/docs/src/guide/essentials/type-safe.md`
- Sub-commands: `node_modules/@gunshi/docs/src/guide/essentials/composable.md`
- Sub-commands of sub-commands: `node_modules/@gunshi/docs/src/guide/advanced/nested-sub-commands.md`
- Loading commands when they run: `node_modules/@gunshi/docs/src/guide/essentials/lazy-async.md`
- The usage shown by `--help`: `node_modules/@gunshi/docs/src/guide/essentials/auto-usage.md`, `node_modules/@gunshi/docs/src/guide/advanced/custom-rendering.md`
- Expected failures and exit codes: `node_modules/@gunshi/docs/src/guide/essentials/errors.md`
- Output as JSON with `--json`: `node_modules/@gunshi/docs/src/guide/essentials/json-output.md`
- The parser combinators, and when to use them: `node_modules/@gunshi/docs/src/guide/advanced/parser-combinators.md`
- Code that runs before or after every command: `node_modules/@gunshi/docs/src/guide/advanced/command-hooks.md`
- Writing a plugin: `node_modules/@gunshi/docs/src/guide/essentials/plugin-system.md`, `node_modules/@gunshi/docs/src/guide/plugin/introduction.md`
- Messages in other languages: `node_modules/@gunshi/docs/src/guide/advanced/internationalization.md`
- Every function and type: `node_modules/@gunshi/docs/src/api/index.md`
