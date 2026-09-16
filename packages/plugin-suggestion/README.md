# @gunshi/plugin-suggestion

Suggestion plugin for Gunshi.

This plugin adds a short hint to validation errors when a user enters an unknown long option or an unknown command.
It uses Levenshtein distance by default and works with Gunshi's structured validation errors.

## Installation

```sh
npm install @gunshi/plugin-suggestion
```

## Usage

```ts
import { cli, define } from 'gunshi'
import { suggestion } from '@gunshi/plugin-suggestion'

const command = define({
  name: 'app',
  toKebab: true,
  args: {
    allowReload: {
      type: 'boolean',
      description: 'Allow reload'
    }
  },
  run: () => {}
})

await cli(process.argv.slice(2), command, {
  strict: true,
  plugins: [suggestion()]
})
```

When the user enters an unknown long option, the validation message includes a hint:

```txt
Unknown option: --alow-reload
Did you mean --allow-reload?
```

When the user enters an unknown command, the plugin suggests a command from the same command level:

```txt
Command not found: rn
Did you mean run?
```

## Options

```ts
suggestion({
  maxDistance: 2,
  maxSuggestions: 1,
  includeOptions: true,
  includeCommands: true,
  distance: customDistance,
  normalize: value => value.toLowerCase()
})
```

- `maxDistance`: maximum distance allowed for a candidate.
- `maxSuggestions`: maximum number of suggestions per validation error.
- `includeOptions`: enables unknown long option suggestions.
- `includeCommands`: enables command not found suggestions.
- `distance`: custom distance function. Lower values are better matches.
- `normalize`: normalizes typed input and candidates before scoring.

## Internationalization

The plugin can be combined with `@gunshi/plugin-i18n`.
The suggestion hint uses the built-in resource key `err:suggestion:did-you-mean`.

```ts
import i18n from '@gunshi/plugin-i18n'
import { suggestion } from '@gunshi/plugin-suggestion'

await cli(argv, command, {
  strict: true,
  plugins: [i18n({ locale: 'ja-JP' }), suggestion()]
})
```

Without i18n, the plugin falls back to `Did you mean {$name}?`.

## Design notes

The plugin does not detect unknown options or unknown commands by itself.
Gunshi core creates structured validation errors and provides candidate metadata.
This plugin only decorates validation error rendering and appends suggestion hints.
