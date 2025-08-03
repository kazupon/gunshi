# @gunshi/resources

> built-in localization resources for gunshi.

This package provides multilingual resources for gunshi.

## 💿 Installation

```sh
# npm
npm install --save @gunshi/resources

# pnpm
pnpm add @gunshi/resources

# yarn
yarn add @gunshi/resources

# deno
deno add jsr:@gunshi/resources

# bun
bun add @gunshi/resources
```

## 🚀 Usage

### Import all locales

```ts
import resources from '@gunshi/resources'

console.log(resources['en-US']) // display en-US reousrces
console.log(resources['ja-JP']) // display ja-JP resources
```

### Import specific locale

You can import via sub paths.

```ts
// English resources
import enUS from '@gunshi/resources/en-US' with { type: 'json' }

// Japanese resources
import jaJP from '@gunshi/resources/ja-JP' with { type: 'json' }
```

## ✨ Built-in Keys

Keys for built-in functionalities are handled by Gunshi's default locales. The complete list includes:

- `USAGE` - Usage section header
- `OPTIONS` - Options section header
- `ARGUMENTS` - Arguments section header
- `COMMANDS` - Commands section header
- `EXAMPLES` - Examples section header
- `FORMORE` - Footer text for additional help
- `NEGATABLE` - Prefix for negatable options (e.g., "Negatable of --verbose")
- `DEFAULT` - Prefix for default values (e.g., "default: 5")
- `CHOICES` - Prefix for available choices (e.g., "choices: red, green, blue")
- `help` - Description for the help option ("Display this help message")
- `version` - Description for the version option ("Display this version")
  The following keys are provided for each locale:

## 🌍 Supported Locales

- `en-US` - English (United States)
- `ja-JP` - Japanese (Japan)

## 🧩 Usage in i18n plugin

This package is internally used by gunshi plugins, particularly `@gunshi/plugin-i18n` and `@gunshi/plugin-renderer`.

### Example with @gunshi/plugin-i18n

```ts
import i18n from '@gunshi/plugin-i18n'
import resources from '@gunshi/resources'
import { cli } from 'gunshi'

await cli(
  args,
  {
    /* your entry command */
  },
  {
    plugins: [
      i18n({
        locale: 'ja-JP',
        resources // Use @gunshi/resources directly
      })
    ]
  }
)
```

### Integration with Custom Resources

```ts
import resources from '@gunshi/resources'

// Extend built-in resources
const customResources = {
  'en-US': {
    ...resources['en-US'],
    // Add custom keys
    MY_CUSTOM_KEY: 'My custom message'
  },
  'ja-JP': {
    ...resources['ja-JP'],
    // Add custom keys
    MY_CUSTOM_KEY: '私のカスタムメッセージ'
  }
}
```

## ©️ License

[MIT](http://opensource.org/licenses/MIT)
