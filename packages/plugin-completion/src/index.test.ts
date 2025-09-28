import { exec } from 'node:child_process'
import { describe, expect, test } from 'vitest'

function runCommand(command: string, env: NodeJS.ProcessEnv = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, { env: { ...process.env, ...env } }, (error, stdout, stderr) => {
      if (error) {
        reject(stderr)
      } else {
        resolve(stdout)
      }
    })
  })
}

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
      G_COMPLETION_TEST_MULTIPLE: '1'
    })
    expect(output).toMatchSnapshot()
  })
})

const LOCALIZABLE_SCRIPT = `pnpm exec tsx packages/plugin-completion/examples/i18n.node.ts complete --`
const I18N_ENV = { MY_LOCALE: 'ja-JP' }

describe('i18n support', () => {
  test('no input', async () => {
    const output = await runCommand(`${LOCALIZABLE_SCRIPT}`, {
      ...I18N_ENV
    })
    expect(output).toMatchSnapshot()
  })

  describe('default command', () => {
    test('suggest for inputting', async () => {
      const output = await runCommand(`${LOCALIZABLE_SCRIPT} --`, {
        ...I18N_ENV
      })
      expect(output).toMatchSnapshot()
    })

    test('suggest for long option', async () => {
      const output = await runCommand(`${LOCALIZABLE_SCRIPT} --config`, {
        ...I18N_ENV
      })
      expect(output).toMatchSnapshot()
    })

    test('suggest duplicate options', async () => {
      const output = await runCommand(`${LOCALIZABLE_SCRIPT} --config vite.config.js --`, {
        ...I18N_ENV
      })
      expect(output).toMatchSnapshot()
    })

    test('suggest value if option values correctly', async () => {
      const output = await runCommand(`${LOCALIZABLE_SCRIPT} --config vite.config`, {
        ...I18N_ENV
      })
      expect(output).toMatchSnapshot()
    })

    test('suggest for short option', async () => {
      const output = await runCommand(`${LOCALIZABLE_SCRIPT} -c `, {
        ...I18N_ENV
      })
      expect(output).toMatchSnapshot()
    })

    test('suggest duplicate options for short option', async () => {
      const output = await runCommand(`${LOCALIZABLE_SCRIPT} -c vite.config.js --`, {
        ...I18N_ENV
      })
      expect(output).toMatchSnapshot()
    })
  })

  describe('subcommand', () => {
    test('suggest for command only', async () => {
      const output = await runCommand(`${LOCALIZABLE_SCRIPT} dev`, {
        ...I18N_ENV
      })
      expect(output).toMatchSnapshot()
    })

    test('suggest for option inputting', async () => {
      const output = await runCommand(`${LOCALIZABLE_SCRIPT} dev --`, {
        ...I18N_ENV
      })
      expect(output).toMatchSnapshot()
    })

    test('suggest for long option', async () => {
      const output = await runCommand(`${LOCALIZABLE_SCRIPT} dev --port`, {
        ...I18N_ENV
      })
      expect(output).toMatchSnapshot()
    })

    test('suggest for short option', async () => {
      const output = await runCommand(`${LOCALIZABLE_SCRIPT} dev -H`, {
        ...I18N_ENV
      })
      expect(output).toMatchSnapshot()
    })

    test('not handle if unknown option', async () => {
      const output = await runCommand(`${LOCALIZABLE_SCRIPT} dev --unknown`, {
        ...I18N_ENV
      })
      expect(output).toMatchSnapshot()
    })

    test('resolve value if long option and value', async () => {
      const output = await runCommand(`${LOCALIZABLE_SCRIPT} dev --port=3`, {
        ...I18N_ENV
      })
      expect(output).toMatchSnapshot()
    })

    test('suggest if user ends with space after `--port`', async () => {
      const output = await runCommand(`${LOCALIZABLE_SCRIPT} dev --port ""`, {
        ...I18N_ENV
      })
      expect(output).toMatchSnapshot()
    })

    test(`keep suggesting the --port option if user typed partial but didn't end with space`, async () => {
      const output = await runCommand(`${LOCALIZABLE_SCRIPT} dev --po`, {
        ...I18N_ENV
      })
      expect(output).toMatchSnapshot()
    })

    test("user typed `--port=` and hasn't typed a space or value yet", async () => {
      const output = await runCommand(`${LOCALIZABLE_SCRIPT} dev --port=`, {
        ...I18N_ENV
      })
      expect(output).toMatchSnapshot()
    })

    test('suggest short option with equals sign', async () => {
      const output = await runCommand(`${LOCALIZABLE_SCRIPT} dev -p=3`, {
        ...I18N_ENV
      })
      expect(output).toMatchSnapshot()
    })
  })

  describe('positional arguments', () => {
    test('suggest positional arguments when ending with space', async () => {
      const output = await runCommand(`${LOCALIZABLE_SCRIPT} lint ""`, {
        ...I18N_ENV
      })
      expect(output).toMatchSnapshot()
    })

    test('positional arguments when ending with part of the value', async () => {
      const output = await runCommand(`${LOCALIZABLE_SCRIPT} lint ind`, {
        ...I18N_ENV
      })
      expect(output).toMatchSnapshot()
    })

    test('multiple positional argument when ending with space', async () => {
      const output = await runCommand(`${LOCALIZABLE_SCRIPT} lint main.ts ""`, {
        ...I18N_ENV,
        G_COMPLETION_TEST_MULTIPLE: '1'
      })
      expect(output).toMatchSnapshot()
    })
  })
})
