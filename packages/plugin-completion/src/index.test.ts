import { describe, expect, test } from 'vitest'
import { runCommand } from '../../../scripts/utils.ts'

const SCRIPT = `pnpm exec tsx packages/plugin-completion/examples/basic.node.ts complete --`

test('no input', async () => {
  const output = await runCommand(`${SCRIPT}`)
  expect(output).toMatchSnapshot()
})

describe('default command', () => {
  test('suggest for inputting', async () => {
    const output = await runCommand(`${SCRIPT} --`)
    expect(output).toMatchSnapshot()
  })

  test('suggest for long option', async () => {
    const output = await runCommand(`${SCRIPT} --config`)
    expect(output).toMatchSnapshot()
  })

  test('suggest duplicate options', async () => {
    const output = await runCommand(`${SCRIPT} --config vite.config.js --`)
    expect(output).toMatchSnapshot()
  })

  test('suggest value if option values correctly', async () => {
    const output = await runCommand(`${SCRIPT} --config vite.config`)
    expect(output).toMatchSnapshot()
  })

  test('suggest for short option', async () => {
    const output = await runCommand(`${SCRIPT} -c `)
    expect(output).toMatchSnapshot()
  })

  test('suggest duplicate options for short option', async () => {
    const output = await runCommand(`${SCRIPT} -c vite.config.js --`)
    expect(output).toMatchSnapshot()
  })
})

describe('subcommand', () => {
  test('suggest for command only', async () => {
    const output = await runCommand(`${SCRIPT} dev`)
    expect(output).toMatchSnapshot()
  })

  test('suggest for option inputting', async () => {
    const output = await runCommand(`${SCRIPT} dev --`)
    expect(output).toMatchSnapshot()
  })

  test('suggest for long option', async () => {
    const output = await runCommand(`${SCRIPT} dev --port`)
    expect(output).toMatchSnapshot()
  })

  test('suggest for short option', async () => {
    const output = await runCommand(`${SCRIPT} dev -H`)
    expect(output).toMatchSnapshot()
  })

  test('not handle if unknown option', async () => {
    const output = await runCommand(`${SCRIPT} dev --unknown`)
    expect(output).toMatchSnapshot()
  })

  test('resolve value if long option and value', async () => {
    const output = await runCommand(`${SCRIPT} dev --port=3`)
    expect(output).toMatchSnapshot()
  })

  test('suggest if user ends with space after `--port`', async () => {
    const output = await runCommand(`${SCRIPT} dev --port ""`)
    expect(output).toMatchSnapshot()
  })

  test(`keep suggesting the --port option if user typed partial but didn't end with space`, async () => {
    const output = await runCommand(`${SCRIPT} dev --po`)
    expect(output).toMatchSnapshot()
  })

  test("user typed `--port=` and hasn't typed a space or value yet", async () => {
    const output = await runCommand(`${SCRIPT} dev --port=`)
    expect(output).toMatchSnapshot()
  })

  test('suggest short option with equals sign', async () => {
    const output = await runCommand(`${SCRIPT} dev -p=3`)
    expect(output).toMatchSnapshot()
  })
})

describe('positional arguments', () => {
  test('suggest positional arguments when ending with space', async () => {
    const output = await runCommand(`${SCRIPT} lint ""`)
    expect(output).toMatchSnapshot()
  })

  test('positional arguments when ending with part of the value', async () => {
    const output = await runCommand(`${SCRIPT} lint ind`)
    expect(output).toMatchSnapshot()
  })

  test('multiple positional argument when ending with space', async () => {
    const output = await runCommand(`${SCRIPT} lint main.ts ""`, {
      env: {
        G_COMPLETION_TEST_MULTIPLE: '1'
      }
    })
    expect(output).toMatchSnapshot()
  })
})

const NESTED_SCRIPT = `pnpm exec tsx packages/plugin-completion/examples/nested.node.ts complete --`

describe('nested sub-commands', () => {
  test('suggest top-level commands', async () => {
    const output = await runCommand(`${NESTED_SCRIPT}`)
    expect(output).toMatchSnapshot()
  })

  test('suggest nested sub-commands for remote', async () => {
    const output = await runCommand(`${NESTED_SCRIPT} remote`)
    expect(output).toMatchSnapshot()
  })

  test('suggest options for nested remote add', async () => {
    const output = await runCommand(`${NESTED_SCRIPT} remote add --`)
    expect(output).toMatchSnapshot()
  })

  test('suggest option value for remote add --url', async () => {
    const output = await runCommand(`${NESTED_SCRIPT} remote add --url`)
    expect(output).toMatchSnapshot()
  })

  test('suggest positional for remote remove', async () => {
    const output = await runCommand(`${NESTED_SCRIPT} remote remove ""`)
    expect(output).toMatchSnapshot()
  })

  test('suggest options for top-level status', async () => {
    const output = await runCommand(`${NESTED_SCRIPT} status --`)
    expect(output).toMatchSnapshot()
  })
})

const NESTED_I18N_SCRIPT = `pnpm exec tsx packages/plugin-completion/examples/nested-i18n.node.ts complete --`
const NESTED_I18N_ENV = { MY_LOCALE: 'ja-JP' }

function runNestedLocalizedCommand(command: string, env: NodeJS.ProcessEnv = {}) {
  return runCommand(command, {
    env: {
      ...NESTED_I18N_ENV,
      ...env
    }
  })
}

describe('nested sub-commands with i18n', () => {
  test('suggest top-level commands with localized descriptions', async () => {
    const output = await runNestedLocalizedCommand(`${NESTED_I18N_SCRIPT}`)
    expect(output).toMatchSnapshot()
  })

  test('suggest nested sub-commands for remote with localized description', async () => {
    const output = await runNestedLocalizedCommand(`${NESTED_I18N_SCRIPT} remote`)
    expect(output).toMatchSnapshot()
  })

  test('suggest options for nested remote add with localized description', async () => {
    const output = await runNestedLocalizedCommand(`${NESTED_I18N_SCRIPT} remote add --`)
    expect(output).toMatchSnapshot()
  })

  test('suggest localized option value for remote add --url', async () => {
    const output = await runNestedLocalizedCommand(`${NESTED_I18N_SCRIPT} remote add --url`)
    expect(output).toMatchSnapshot()
  })

  test('suggest localized positional for remote remove', async () => {
    const output = await runNestedLocalizedCommand(`${NESTED_I18N_SCRIPT} remote remove ""`)
    expect(output).toMatchSnapshot()
  })

  test('suggest options for top-level status with localized description', async () => {
    const output = await runNestedLocalizedCommand(`${NESTED_I18N_SCRIPT} status --`)
    expect(output).toMatchSnapshot()
  })
})

const LOCALIZABLE_SCRIPT = `pnpm exec tsx packages/plugin-completion/examples/i18n.node.ts complete --`
const I18N_ENV = { MY_LOCALE: 'ja-JP' }

function runLocalizedCommand(command: string, env: NodeJS.ProcessEnv = {}) {
  return runCommand(command, {
    env: {
      ...I18N_ENV,
      ...env
    }
  })
}

describe('i18n support', () => {
  test('no input', async () => {
    const output = await runLocalizedCommand(`${LOCALIZABLE_SCRIPT}`)
    expect(output).toMatchSnapshot()
  })

  describe('default command', () => {
    test('suggest for inputting', async () => {
      const output = await runLocalizedCommand(`${LOCALIZABLE_SCRIPT} --`)
      expect(output).toMatchSnapshot()
    })

    test('suggest for long option', async () => {
      const output = await runLocalizedCommand(`${LOCALIZABLE_SCRIPT} --config`)
      expect(output).toMatchSnapshot()
    })

    test('suggest duplicate options', async () => {
      const output = await runLocalizedCommand(`${LOCALIZABLE_SCRIPT} --config vite.config.js --`)
      expect(output).toMatchSnapshot()
    })

    test('suggest value if option values correctly', async () => {
      const output = await runLocalizedCommand(`${LOCALIZABLE_SCRIPT} --config vite.config`)
      expect(output).toMatchSnapshot()
    })

    test('suggest for short option', async () => {
      const output = await runLocalizedCommand(`${LOCALIZABLE_SCRIPT} -c `)
      expect(output).toMatchSnapshot()
    })

    test('suggest duplicate options for short option', async () => {
      const output = await runLocalizedCommand(`${LOCALIZABLE_SCRIPT} -c vite.config.js --`)
      expect(output).toMatchSnapshot()
    })
  })

  describe('subcommand', () => {
    test('suggest for command only', async () => {
      const output = await runLocalizedCommand(`${LOCALIZABLE_SCRIPT} dev`)
      expect(output).toMatchSnapshot()
    })

    test('suggest for option inputting', async () => {
      const output = await runLocalizedCommand(`${LOCALIZABLE_SCRIPT} dev --`)
      expect(output).toMatchSnapshot()
    })

    test('suggest for long option', async () => {
      const output = await runLocalizedCommand(`${LOCALIZABLE_SCRIPT} dev --port`)
      expect(output).toMatchSnapshot()
    })

    test('suggest for short option', async () => {
      const output = await runLocalizedCommand(`${LOCALIZABLE_SCRIPT} dev -H`)
      expect(output).toMatchSnapshot()
    })

    test('not handle if unknown option', async () => {
      const output = await runLocalizedCommand(`${LOCALIZABLE_SCRIPT} dev --unknown`)
      expect(output).toMatchSnapshot()
    })

    test('resolve value if long option and value', async () => {
      const output = await runLocalizedCommand(`${LOCALIZABLE_SCRIPT} dev --port=3`)
      expect(output).toMatchSnapshot()
    })

    test('suggest if user ends with space after `--port`', async () => {
      const output = await runLocalizedCommand(`${LOCALIZABLE_SCRIPT} dev --port ""`)
      expect(output).toMatchSnapshot()
    })

    test(`keep suggesting the --port option if user typed partial but didn't end with space`, async () => {
      const output = await runLocalizedCommand(`${LOCALIZABLE_SCRIPT} dev --po`)
      expect(output).toMatchSnapshot()
    })

    test("user typed `--port=` and hasn't typed a space or value yet", async () => {
      const output = await runLocalizedCommand(`${LOCALIZABLE_SCRIPT} dev --port=`)
      expect(output).toMatchSnapshot()
    })

    test('suggest short option with equals sign', async () => {
      const output = await runLocalizedCommand(`${LOCALIZABLE_SCRIPT} dev -p=3`)
      expect(output).toMatchSnapshot()
    })
  })

  describe('positional arguments', () => {
    test('suggest positional arguments when ending with space', async () => {
      const output = await runLocalizedCommand(`${LOCALIZABLE_SCRIPT} lint ""`)
      expect(output).toMatchSnapshot()
    })

    test('positional arguments when ending with part of the value', async () => {
      const output = await runLocalizedCommand(`${LOCALIZABLE_SCRIPT} lint ind`)
      expect(output).toMatchSnapshot()
    })

    test('multiple positional argument when ending with space', async () => {
      const output = await runLocalizedCommand(`${LOCALIZABLE_SCRIPT} lint main.ts ""`, {
        G_COMPLETION_TEST_MULTIPLE: '1'
      })
      expect(output).toMatchSnapshot()
    })
  })
})
