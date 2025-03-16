import {
  comments,
  defineConfig,
  javascript,
  jsonc,
  markdown,
  prettier,
  promise,
  regexp,
  typescript,
  unicorn,
  vitest,
  yaml
} from '@kazupon/eslint-config'

const config: ReturnType<typeof defineConfig> = defineConfig(
  javascript(),
  typescript({
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/ban-ts-comment': 'off'
    }
  }),
  comments(),
  promise(),
  regexp(),
  unicorn({
    rules: {
      'unicorn/no-array-push-push': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/no-null': 'off'
    }
  }),
  jsonc({
    json: true,
    json5: true,
    jsonc: true
  }),
  yaml(),
  markdown(),
  vitest(),
  prettier(),
  {
    ignores: [
      '.vscode',
      '.github',
      'lib',
      'tsconfig.json',
      'pnpm-lock.yaml',
      'eslint.config.ts',
      'README.md',
      'playground/bun',
      'playground/deno'
    ]
  }
)

export default config
