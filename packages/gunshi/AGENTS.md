# Gunshi for Coding Agents

This file is for coding agents that write a command-line interface with Gunshi. It matches the installed version of `gunshi`, and has what you need to write a CLI: a complete example, the rules that the example does not show, and which guide to read for a task. It is not about developing Gunshi itself.

## A CLI With Sub-commands

```ts
import { cli, CommandError, define, jsonArgs } from 'gunshi'
import { describe, integer, positional } from 'gunshi/combinators'

// Options for every command: declare them once `as const`, and spread them into the `args` of each command
const common = {
  config: { type: 'string', default: 'ship.json', description: 'The config file' }
} as const

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
    release: describe(positional(integer({ min: 1 })), 'The release number')
  },
  run: ctx => {
    if (ctx.values.release > 10) {
      // a failure the command expects: the message goes to stderr, without a stack trace, and the exit code is 1
      throw new CommandError(`Release ${ctx.values.release} not found`, { code: 'not_found' })
    }
    console.log(`Rolled back to release ${ctx.values.release}`)
  }
})

const main = define({
  name: 'ship',
  description: 'Ship the services',
  run: () => console.log('Run `ship --help` to see the commands')
})

await cli(process.argv.slice(2), main, {
  name: 'ship',
  version: '1.0.0',
  subCommands: { deploy, rollback }
})
```

## Things to Know

- Import `cli`, `define`, `jsonArgs` and `CommandError` from `gunshi`, and the parser combinators (`integer`, `positional`, `describe`, `withDefault`, and others) from `gunshi/combinators`. `gunshi/bone` is Gunshi without its built-in plugins, so it has no `--help`, no `--version` and no `--json`
- The types of an argument are `string`, `number`, `boolean`, `enum` (with `choices`), `positional`, and `custom` (with `parse`). An argument can also have `short`, `default`, `required`, `multiple` and `description`
- An argument is an option unless its type is `positional`, and an option is named after its key: `dryRun` is `--dryRun`, or `--dry-run` with `toKebab: true`. `name: { type: 'string', required: true }` is a required `--name`, not a positional argument
- `short` gives an option a one-letter name, as `-t` above. Give one only to the options that need it, and a letter to only one option of a command
- A `positional` argument is required unless it has `required: false`. Positional arguments are taken in the order they are declared
- Write the `choices` of an `enum` `as const`, so that its value is typed as their union. Without it, the value is a `string`
- Declare an argument as an object with a `type`, as `service` above, or with a parser combinator, as `release` above. A combinator is the whole schema: it does not go in `type`, and it takes no object with a `type` (`positional()` alone is a string)
- Sub-commands go in the `subCommands` option of `cli()`: an object keyed by the command names, a `Map`, or an array of commands. A command can also have its own `subCommands`. The command given to `cli()` runs when no command is given
- A command without `run` prints nothing when it is run by itself. Give a command that only groups sub-commands a `run` that says how to use them, as `ship` above
- The `args` of a command are its own, so the sub-commands do not see the `args` of the main command. For an option of every command, spread shared arguments as above
- Give `name` and `version` to `cli()`. The usage shows the name (`COMMAND` without it), `--version` prints the version, and the errors of `--json` tell the command to run next with the name
- Gunshi ignores an option that a command does not declare, except `--json`. Keep this default unless the requirements say that an unknown option is an error: then give `strict: true` to `cli()`
- Gunshi prints the errors of the arguments to stderr: a missing or invalid argument and an unknown command, and an unknown option only with `strict: true`. It sets the exit code to 1, and calls the `onErrorCommand` option of `cli()` with them. To use another exit code, such as 2 for a usage error, set `process.exitCode` in `onErrorCommand`. If the requirements make an unknown option one of these errors too, give `strict: true` as well
- For a failure that the command expects, such as a release that does not exist, throw a `CommandError`, as `rollback` above. Gunshi prints its message to stderr, without a stack trace, and sets the exit code to 1, or to the `exitCode` you give it: `new CommandError(message, { code: 'not_found', exitCode: 2 })`. Write the `code` in snake_case. Any other error thrown from `run` ends in a stack trace
- For `--json`, spread `jsonArgs` into the `args` of the command, as `deploy` above, and always return an object keyed by a noun: `return { project }`, not `return project`, and `return { projects }`, not an array. Print the lines for people with `ctx.log`, which prints nothing with `--json`, not with `console.log`. Gunshi prints the result as one JSON document to stdout, and a failure, a `CommandError` included, as one line of JSON to stderr. A lazy command spreads `jsonArgs` into its definition too
- When the requirements fix the shape of the JSON, such as an array alone, do not spread `jsonArgs`: declare a `json` option of your own, as `json: { type: 'boolean' }`, and print the JSON yourself. Gunshi does not touch it
- With `jsonArgs`, these type errors mean: `Type 'void' is not assignable to type 'JsonResult'` (or `'Awaitable<JsonResult>'`): return the result. `Index signature for type 'string' is missing in type 'Project'` (or `'Project[]'`): key it by a noun, `{ project }`, or print an array with a `json` of your own. `No overload matches this call` on `lazy`: spread `jsonArgs` into the definition of `lazy` too
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
- Integers with a range, choices, defaults, and your own parsers: `node_modules/@gunshi/docs/src/guide/advanced/parser-combinators.md`
- Code that runs before or after every command: `node_modules/@gunshi/docs/src/guide/advanced/command-hooks.md`
- Writing a plugin: `node_modules/@gunshi/docs/src/guide/essentials/plugin-system.md`, `node_modules/@gunshi/docs/src/guide/plugin/introduction.md`
- Messages in other languages: `node_modules/@gunshi/docs/src/guide/advanced/internationalization.md`
- Every function and type: `node_modules/@gunshi/docs/src/api/index.md`
