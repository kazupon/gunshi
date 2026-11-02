# Global Options

A global option is an option that every command takes, the main command included.
`@gunshi/plugin-global`, which is installed by default, adds `--help` and `--version` as global options, and `@gunshi/plugin-dryrun` adds its option the same way.
Your CLI can add its own global options, such as `--file` or `--verbose`, with a small plugin.

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!TIP]
> To give the sub-commands the same option without a plugin, spread shared arguments into their `args`, as [Options for Every Command](../essentials/composable.md#options-for-every-command) shows.
> This guide assumes familiarity with the [Plugin System](../essentials/plugin-system.md).

<!-- eslint-enable markdown/no-missing-label-refs -->

## Adding a Global Option

Add the option with `ctx.addGlobalOption()` in the `setup` of a plugin, and hand its value to the commands through the extension of the plugin.
Define the commands with `defineWithTypes`, with the type of the extension, so that the value is typed in every command:

```ts [cli.ts]
import { cli, define, defineWithTypes } from 'gunshi'
import { plugin } from 'gunshi/plugin'

interface FileExtension {
  readonly file: string
}

const fileOption = plugin({
  id: 'todo:file',
  setup: ctx => {
    ctx.addGlobalOption('file', {
      type: 'string',
      short: 'f',
      default: 'todo.json',
      description: 'The data file'
    })
  },
  extension: (ctx): FileExtension => ({ file: String(ctx.values.file) })
})

const defineCommand = defineWithTypes<{ extensions: { 'todo:file': FileExtension } }>()

const add = defineCommand({
  name: 'add',
  description: 'Add an item',
  args: {
    title: { type: 'positional', description: 'The title of the item' }
  },
  run: ctx => console.log(`Add ${ctx.values.title} to ${ctx.extensions['todo:file'].file}`)
})

const list = defineCommand({
  name: 'list',
  description: 'List the items',
  run: ctx => console.log(`List the items in ${ctx.extensions['todo:file'].file}`)
})

const main = define({
  name: 'todo',
  description: 'Manage the items'
})

await cli(process.argv.slice(2), main, {
  subCommands: { add, list },
  plugins: [fileOption]
})
```

The commands can still declare their own arguments, such as `title` of `add`, and they are typed too.
See [Context Extensions](./context-extensions.md) for more about the extensions of plugins, and the [plugin guides](../plugin/introduction.md) for writing plugins.

## How Global Options Work

- Every command takes a global option, whether it is written before or after the command name: `todo --file work.json add milk` and `todo add milk --file work.json` both give `work.json` to `add`
- The usage of every command shows the global options, the main command included
- When a command declares an argument with the same name, the command owns the name: it reads its own argument, with its own default, and the global option is not in effect for it
- `ctx.env.globalOptions` holds the global options in effect for the running command
